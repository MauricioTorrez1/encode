// Reproductor de sesiones: lección, jefe, repaso, reto diario, gimnasio y kata.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { trackMeta, useContent, type Content } from '../content'
import { KATAS } from '../content/katas'
import type { Lesson } from '../content/types'
import { grade, solutionText, type Answer } from '../engine/check'
import { today } from '../engine/dates'
import { DRILLS } from '../engine/drills'
import { questLabel } from '../engine/quests'
import { bossItems, dailyItems, drillItems, freePracticeItems, lessonItems, reviewItems, type Item } from '../engine/session'
import { BOSS_PASS, finishSession, getState, recordAnswer, rollover, type AnswerLog, type SessionKind, type Summary } from '../engine/store'
import { back, go } from '../router'
import { confetti } from '../ui/confetti'
import { ExerciseView, SELF_GRADED, TYPE_LABEL } from '../ui/exercises'
import { Bar, Chip, CodeBlock, Icon, Key, Mascot, Md, inline } from '../ui/kit'
import { sfx } from '../ui/sound'

interface Plan { kind: SessionKind; ref?: string; trackId?: string; title: string; items: Item[]; lesson?: Lesson; exit: string; free?: boolean }

function buildPlan(kind: string, ref: string | undefined, c: Content): Plan | null {
  const s = getState()
  switch (kind) {
    case 'lesson': {
      const l = ref ? c.lessons.get(ref) : undefined
      return l ? { kind, ref, trackId: l.trackId, title: l.title, items: lessonItems(l), lesson: l, exit: `ruta/${l.trackId}` } : null
    }
    case 'boss': {
      const u = ref ? c.units.get(ref) : undefined
      return u ? { kind, ref, trackId: u.trackId, title: `Jefe: ${u.title}`, items: bossItems(u), exit: `ruta/${u.trackId}` } : null
    }
    case 'review': {
      const due = reviewItems(s, c)
      return due.length
        ? { kind, title: 'Repaso', items: due, exit: 'entrenar' }
        : { kind, title: 'Práctica libre', items: freePracticeItems(s, c), exit: 'entrenar', free: true }
    }
    case 'daily': return { kind, title: 'Reto diario', items: dailyItems(s, c), exit: '' }
    case 'drill': {
      const d = DRILLS.find((x) => x.id === ref)
      return d ? { kind, ref, title: d.title, items: drillItems(d.id), exit: 'entrenar' } : null
    }
    case 'kata': {
      const k = KATAS.find((x) => x.id === ref)
      return k ? { kind, ref, title: `Kata: ${k.title}`, items: [{ ex: k.ex }], exit: 'entrenar' } : null
    }
    default: return null
  }
}

const PRAISE = ['¡Correcto!', '¡Exacto!', '¡Bien visto!', '¡Así es!', '¡Perfecto!', '¡Lo tienes!']
const COMFORT = ['Casi. Mira la solución:', 'No pasa nada, así se aprende:', 'Buen intento. La respuesta era:', 'Te lo volveré a preguntar:']

export function Session({ kind, refId }: { kind: string; refId?: string }) {
  const content = useContent()
  const [attempt, setAttempt] = useState(0)
  const plan = useMemo(() => (content ? buildPlan(kind, refId, content) : null), [content, kind, refId, attempt])
  if (!content) return <div className="session"><div className="session-body center"><Mascot mood="think" /><p className="hint">Cargando…</p></div></div>
  if (!plan) return <Empty title="No encontramos esta sesión" text="Puede que el enlace sea antiguo." />
  if (!plan.items.length) {
    return <Empty title="Nada que repasar todavía" text="Completa algunas lecciones y vuelve: aquí aparecerá lo que toque recordar cada día." />
  }
  return <Player key={`${kind}:${refId}:${attempt}`} plan={plan} onRetry={() => setAttempt((n) => n + 1)} />
}

function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="session">
      <div className="session-body center">
        <Mascot mood="wink" size={120} />
        <h2>{title}</h2>
        <p className="hint">{text}</p>
        <Key onClick={() => go('rutas')}>Ir a las rutas</Key>
      </div>
    </div>
  )
}

function Player({ plan, onRetry }: { plan: Plan; onRetry: () => void }) {
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>(plan.lesson ? 'intro' : 'play')
  const [queue, setQueue] = useState<Item[]>(plan.items)
  const [pos, setPos] = useState(0)
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [result, setResult] = useState<boolean | null>(null)
  const [combo, setCombo] = useState(0)
  const [notes, setNotes] = useState(false)
  const [quitting, setQuitting] = useState(false)
  const [summary, setSummary] = useState<Summary | null>(null)
  const log = useRef<AnswerLog[]>([])
  const tries = useRef(new Map<string, number>())
  const maxCombo = useRef(0)
  const total = plan.items.length
  const [cleared, setCleared] = useState(0)
  const item = queue[pos]
  const ex = item?.ex
  const start = useRef(Date.now())

  useEffect(() => { rollover() }, [])

  const settle = useCallback((ok: boolean) => {
    if (!ex || result !== null) return
    const n = (tries.current.get(ex.id) ?? 0) + 1
    tries.current.set(ex.id, n)
    if (n === 1) {
      log.current.push({ id: ex.id, t: ex.t, ok, trackId: item.trackId })
      recordAnswer(ex.id, ok)
      const c = ok ? combo + 1 : 0
      setCombo(c)
      maxCombo.current = Math.max(maxCombo.current, c)
      if (ok && c >= 3) sfx.combo(c)
    }
    if (ok) { setCleared((x) => x + 1); if (!SELF_GRADED.has(ex.t)) sfx.ok() }
    else {
      if (!SELF_GRADED.has(ex.t)) sfx.bad()
      // Dominio: los fallos vuelven al final (salvo en el jefe), con un máximo de dos reintentos.
      if (plan.kind !== 'boss' && n < 3) setQueue((q) => [...q, item])
      else setCleared((x) => x + 1)
    }
    setResult(ok)
  }, [ex, item, result, combo, plan.kind])

  const check = useCallback(() => { if (ex && answer !== null) settle(grade(ex, answer)) }, [ex, answer, settle])

  const next = useCallback(() => {
    if (pos + 1 < queue.length) {
      setPos(pos + 1)
      setAnswer(null)
      setResult(null)
      return
    }
    const sum = finishSession({ kind: plan.kind, ref: plan.ref, trackId: plan.trackId, answers: log.current, maxCombo: maxCombo.current })
    setSummary(sum)
    setPhase('done')
    if (sum.passed) { sfx.win(); confetti(sum.perfect || sum.levelUp ? 160 : 90) }
    if (sum.levelUp) setTimeout(() => sfx.level(), 700)
  }, [pos, queue.length, plan])

  // Enter: comprobar o continuar (sin interferir con editores ni con la terminal).
  useEffect(() => {
    if (phase === 'done') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || quitting || notes) return
      const el = e.target as HTMLElement
      if (el instanceof HTMLTextAreaElement && !(e.ctrlKey || e.metaKey)) return
      if (el.closest?.('.term, .editor')) return
      if (el instanceof HTMLButtonElement && !el.classList.contains('opt')) return
      e.preventDefault()
      if (phase === 'intro') setPhase('play')
      else if (result !== null) next()
      else check()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, result, next, check, quitting, notes])

  if (phase === 'done' && summary) return <SummaryView plan={plan} sum={summary} seconds={Math.round((Date.now() - start.current) / 1000)} onRetry={onRetry} />

  const meta = item?.trackId ? trackMeta(item.trackId) : undefined
  const header = (
    <header className="session-top">
      <button type="button" className="iconbtn" aria-label="Salir" onClick={() => (log.current.length ? setQuitting(true) : back())}><Icon name="x" size={22} /></button>
      <Bar value={phase === 'intro' ? 0 : cleared / total} height={14} />
      {combo >= 2 && <span className="combo" key={combo}><Icon name="flame" size={16} fill /> {combo}</span>}
      {plan.lesson && phase === 'play' && <button type="button" className="iconbtn" aria-label="Ver concepto" onClick={() => setNotes(true)}><Icon name="book" size={20} /></button>}
    </header>
  )

  if (phase === 'intro' && plan.lesson) {
    return (
      <div className="session">
        {header}
        <main className="session-body">
          <div className="eyebrow">Concepto · {trackMeta(plan.lesson.trackId).name}</div>
          <h1 className="session-title">{plan.lesson.title}</h1>
          <Md text={plan.lesson.theory} lang={trackMeta(plan.lesson.trackId).lang} />
        </main>
        <footer className="session-foot"><div className="session-foot-in"><span /><Key size="lg" onClick={() => setPhase('play')}>Practicar <Icon name="right" size={20} /></Key></div></footer>
      </div>
    )
  }

  if (!ex) return null
  const self = SELF_GRADED.has(ex.t)
  const retry = (tries.current.get(ex.id) ?? 0) > (result === null ? 0 : 1)
  return (
    <div className="session">
      {header}
      <main className="session-body" key={`${ex.id}:${pos}`}>
        <div className="row gap wrap">
          <span className="eyebrow">{TYPE_LABEL[ex.t]}</span>
          {meta && plan.kind !== 'lesson' && <Chip color={meta.color}>{meta.name}</Chip>}
          {retry && <Chip icon="redo">Otra oportunidad</Chip>}
        </div>
        <h2 className="q">{inline(ex.q)}</h2>
        <ExerciseView ex={ex} answer={answer} setAnswer={setAnswer} checked={result !== null} submit={settle} seed={`${ex.id}:${pos}:${start.current}`} />
      </main>
      <footer className={`session-foot ${result === null ? '' : result ? 'ok' : 'bad'}`}>
        {result !== null && (
          <div className="feedback">
            <div className="feedback-head">
              <Icon name={result ? 'check' : 'x'} size={22} />
              <strong>{result ? PRAISE[(pos + combo) % PRAISE.length] : COMFORT[pos % COMFORT.length]}</strong>
            </div>
            {!result && !self && (ex.t === 'parsons' || ex.t === 'predict'
              ? <CodeBlock code={solutionText(ex)} lang={ex.t === 'parsons' ? ex.lang : undefined} className="sol" />
              : <p className="sol-text">{solutionText(ex)}</p>)}
            {ex.why && <p className="why">{inline(ex.why)}</p>}
          </div>
        )}
        <div className="session-foot-in">
          {result === null ? (
            <>
              <Key variant="ghost" onClick={() => settle(false)}>{self ? 'Saltar' : 'No lo sé'}</Key>
              {!self && <Key size="lg" disabled={answer === null} onClick={check}>Comprobar</Key>}
            </>
          ) : (
            <><span /><Key size="lg" variant={result ? 'ok' : 'bad'} onClick={next} autoFocus>Continuar</Key></>
          )}
        </div>
      </footer>
      {notes && plan.lesson && (
        <div className="modal" onClick={() => setNotes(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="row between"><h3>{plan.lesson.title}</h3><button type="button" className="iconbtn" aria-label="Cerrar" onClick={() => setNotes(false)}><Icon name="x" /></button></div>
            <Md text={plan.lesson.theory} lang={trackMeta(plan.lesson.trackId).lang} />
          </div>
        </div>
      )}
      {quitting && (
        <div className="modal" onClick={() => setQuitting(false)}>
          <div className="modal-card small center" onClick={(e) => e.stopPropagation()}>
            <Mascot mood="sad" size={88} />
            <h3>¿Salir ahora?</h3>
            <p className="hint">Perderás el XP de esta sesión, pero lo que has respondido ya cuenta para tu repaso.</p>
            <div className="col gap">
              <Key block onClick={() => setQuitting(false)}>Seguir practicando</Key>
              <Key block variant="ghost" onClick={() => go(plan.exit)}>Salir</Key>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryView({ plan, sum, seconds, onRetry }: { plan: Plan; sum: Summary; seconds: number; onRetry: () => void }) {
  const failedBoss = plan.kind === 'boss' && !sum.passed
  const title = failedBoss ? 'Casi lo tienes'
    : plan.kind === 'boss' ? '¡Jefe derrotado!'
    : sum.perfect ? '¡Sesión perfecta!'
    : plan.kind === 'daily' ? '¡Reto diario completado!'
    : '¡Sesión completada!'
  const mins = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
  const dailyDone = getState().daily[today()] !== undefined
  return (
    <div className="session">
      <main className="session-body center summary">
        <Mascot mood={failedBoss ? 'sad' : 'party'} size={132} />
        <h1>{title}</h1>
        {failedBoss && <p className="hint">Necesitas un {Math.round(BOSS_PASS * 100)} % para superar al jefe. Repasa las lecciones de la unidad y vuelve a intentarlo.</p>}
        {plan.kind === 'lesson' && (
          <div className="stars big">{[1, 2, 3].map((n) => <Icon key={n} name="star" size={40} fill={n <= sum.stars} className={n <= sum.stars ? 'on' : ''} />)}</div>
        )}
        <div className="stat-row">
          <div className="stat xp"><span className="stat-l">XP</span><span className="stat-v">+{sum.xp}</span>{sum.boosted && <span className="stat-s">×2 activo</span>}</div>
          <div className="stat acc"><span className="stat-l">Precisión</span><span className="stat-v">{Math.round(sum.accuracy * 100)}%</span></div>
          <div className="stat time"><span className="stat-l">Tiempo</span><span className="stat-v">{mins}</span></div>
        </div>
        <div className="rewards">
          {sum.streak.extended && <div className="reward"><Icon name="flame" fill className="fire" /><div><strong>Racha de {sum.streak.after} {sum.streak.after === 1 ? 'día' : 'días'}</strong><span>Vuelve mañana para mantenerla</span></div></div>}
          {sum.goalReached && <div className="reward"><Icon name="target" className="brand" /><div><strong>Meta diaria cumplida</strong><span>Todo lo que hagas ahora es extra</span></div></div>}
          {sum.levelUp && <div className="reward"><Icon name="award" className="xpc" /><div><strong>¡Nivel {sum.levelUp.level}!</strong><span>Rango: {sum.levelUp.rank}</span></div></div>}
          {sum.quests.map((q) => <div className="reward" key={q.kind}><Icon name="check" className="brand" /><div><strong>Misión completada</strong><span>{questLabel(q)} · +{q.gems} gemas</span></div></div>)}
          {sum.chest && <div className="reward"><Icon name="gift" className="gold" /><div><strong>Cofre diario abierto</strong><span>Completaste las tres misiones</span></div></div>}
          {sum.achievements.map((a) => <div className="reward" key={a.id}><Icon name={a.icon} className="gold" /><div><strong>Logro: {a.title}</strong><span>{a.desc} · +{a.gems} gemas</span></div></div>)}
          {sum.gems > 0 && <div className="reward"><Icon name="gem" fill className="gemc" /><div><strong>+{sum.gems} gemas</strong><span>Gástalas en la tienda</span></div></div>}
        </div>
      </main>
      <footer className="session-foot">
        <div className="session-foot-in">
          {failedBoss || plan.kind === 'drill' ? <Key variant="ghost" onClick={onRetry}><Icon name="redo" size={18} /> {failedBoss ? 'Reintentar' : 'Otra ronda'}</Key>
            : !dailyDone && plan.kind !== 'daily' ? <Key variant="ghost" onClick={() => go('s/daily', true)}>Reto diario</Key> : <span />}
          <Key size="lg" onClick={() => go(plan.exit, true)} autoFocus>Continuar</Key>
        </div>
      </footer>
    </div>
  )
}
