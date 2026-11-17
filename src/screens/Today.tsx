// Pantalla «Hoy»: el plan del día en un vistazo.
import { trackMeta, useContent } from '../content'
import { addDays, now, today } from '../engine/dates'
import { nextLesson, trackProgress } from '../engine/progress'
import { CHEST_GEMS, questLabel } from '../engine/quests'
import { dueCount } from '../engine/session'
import { boostActive, todayStat, useStore } from '../engine/store'
import { go } from '../router'
import { Bar, Icon, Key, Mascot, Ring, TrackKey, type Mood } from '../ui/kit'

const WEEKDAYS = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

export function Today() {
  const s = useStore((x) => x)
  const content = useContent()
  const day = todayStat(s)
  const t = today()
  const goalRatio = day.xp / s.profile.dailyGoal
  const activeToday = s.streak.last === t
  const due = dueCount(s, content)
  const dailyScore = s.daily[t]
  const hour = now().getHours()
  const greeting = hour < 6 ? 'Buenas noches' : hour < 13 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'

  let mood: Mood = 'happy'
  let bubble = 'Una lección corta y la racha sigue viva. ¿Empezamos?'
  if (goalRatio >= 1) { mood = 'party'; bubble = '¡Meta diaria cumplida! Lo que hagas ahora es puro extra.' }
  else if (activeToday) { mood = 'wink'; bubble = `Vas por ${day.xp} de ${s.profile.dailyGoal} XP. Un empujón más.` }
  else if (s.streak.current >= 3) { mood = 'think'; bubble = `Llevas ${s.streak.current} días seguidos. No rompas la cadena hoy.` }
  else if (s.totals.lessons === 0) bubble = 'Empieza por la primera lección de cualquier ruta. Son cinco minutos.'

  const myTracks = (content?.tracks ?? []).filter((tr) => s.profile.tracks.includes(tr.id))
  const upcoming = myTracks
    .map((tr) => ({ tr, lesson: nextLesson(s, tr), last: Math.max(0, ...tr.units.flatMap((u) => u.lessons.map((l) => (s.lessons[l.id]?.last ? Date.parse(s.lessons[l.id].last) : 0)))) }))
    .filter((x) => x.lesson)
    .sort((a, b) => b.last - a.last)
  const main = upcoming[0]

  const week = Array.from({ length: 7 }, (_, i) => {
    const key = addDays(t, i - 6)
    const d = new Date(key + 'T12:00')
    return { key, label: WEEKDAYS[d.getDay()], active: (s.days[key]?.xp ?? 0) > 0, frozen: s.streak.frozen.includes(key), today: key === t }
  })

  return (
    <div className="today">
      <section className="hello">
        <Mascot mood={mood} size={84} />
        <div>
          <h1>{greeting}, {s.profile.name}</h1>
          <p className="bubble">{bubble}</p>
        </div>
      </section>

      <section className="card hero">
        <Ring value={goalRatio} size={112} stroke={11}>
          <span className="ring-v">{day.xp}</span>
          <span className="ring-l">/ {s.profile.dailyGoal} XP</span>
        </Ring>
        <div className="hero-main">
          <div className="week" aria-label="Actividad de la semana">
            {week.map((d) => (
              <div key={d.key} className={`week-day ${d.active ? 'on' : d.frozen ? 'frozen' : ''} ${d.today ? 'today' : ''}`}>
                <span className="week-dot">{d.active ? <Icon name="flame" size={14} fill /> : d.frozen ? <Icon name="snow" size={14} /> : null}</span>
                <span>{d.label}</span>
              </div>
            ))}
          </div>
          <p className="hero-streak">
            <Icon name="flame" size={18} fill className="fire" /> <strong>{s.streak.current}</strong> {s.streak.current === 1 ? 'día' : 'días'} de racha
            {s.streak.freezes > 0 && <span className="muted"> · <Icon name="snow" size={14} /> {s.streak.freezes} {s.streak.freezes === 1 ? 'protector' : 'protectores'}</span>}
            {boostActive(s) && <span className="xpc"> · XP ×2 activo</span>}
          </p>
          {main ? (
            <Key size="lg" block onClick={() => go(`s/lesson/${main.lesson!.id}`)}>
              <Icon name="play" size={20} fill /> {s.totals.lessons ? 'Continuar' : 'Empezar'}: {main.lesson!.title}
            </Key>
          ) : (
            <Key size="lg" block onClick={() => go('rutas')}>Explorar rutas</Key>
          )}
          {main && <p className="hero-sub">{trackMeta(main.tr.id).name} · lección {trackProgress(s, main.tr).done + 1} de {trackProgress(s, main.tr).total}</p>}
        </div>
      </section>

      <div className="grid2">
        <button type="button" className={`card action ${dailyScore !== undefined ? 'done' : ''}`} onClick={() => go('s/daily')}>
          <span className="action-ic gold"><Icon name="calendar" size={26} /></span>
          <span className="action-t"><strong>Reto diario</strong><small>{dailyScore !== undefined ? `Completado · ${dailyScore}% de precisión` : '8 ejercicios mezclados · +50 XP y gemas'}</small></span>
          <Icon name={dailyScore !== undefined ? 'check' : 'chevRight'} />
        </button>
        <button type="button" className="card action" onClick={() => go('s/review')}>
          <span className="action-ic violet"><Icon name="brain" size={26} /></span>
          <span className="action-t"><strong>Repaso espaciado</strong><small>{due > 0 ? `${due} ${due === 1 ? 'ejercicio vence' : 'ejercicios vencen'} hoy` : 'Nada pendiente: práctica libre'}</small></span>
          {due > 0 ? <span className="badge">{due}</span> : <Icon name="chevRight" />}
        </button>
      </div>

      <section className="card">
        <div className="row between">
          <h2>Misiones de hoy</h2>
          <span className={`chest ${s.quests.chest ? 'open' : ''}`} title={`Completa las tres: +${CHEST_GEMS} gemas`}><Icon name="gift" size={18} /> {s.quests.chest ? 'Cofre abierto' : `+${CHEST_GEMS}`}</span>
        </div>
        <div className="quests">
          {s.quests.items.map((q) => (
            <div key={q.kind} className={`quest ${q.done ? 'done' : ''}`}>
              <span className="quest-ic">{q.done ? <Icon name="check" size={18} /> : <Icon name="target" size={18} />}</span>
              <div className="quest-body">
                <div className="row between"><span>{questLabel(q)}</span><span className="mono muted">{Math.min(q.progress, q.goal)}/{q.goal}</span></div>
                <Bar value={q.progress / q.goal} height={8} />
              </div>
              <span className="quest-gems"><Icon name="gem" size={14} fill /> {q.gems}</span>
            </div>
          ))}
        </div>
      </section>

      {upcoming.length > 1 && (
        <section className="card">
          <h2>Sigue con tus rutas</h2>
          <div className="continue">
            {upcoming.slice(1, 6).map(({ tr, lesson }) => {
              const m = trackMeta(tr.id)
              const p = trackProgress(s, tr)
              return (
                <button key={tr.id} type="button" className="continue-row" onClick={() => go(`s/lesson/${lesson!.id}`)}>
                  <TrackKey glyph={m.glyph} color={m.color} size={40} />
                  <span className="continue-t"><strong>{lesson!.title}</strong><small>{m.name} · {p.done}/{p.total}</small></span>
                  <Icon name="play" size={18} fill />
                </button>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
