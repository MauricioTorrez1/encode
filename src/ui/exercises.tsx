// Un componente por tipo de ejercicio. Todos comparten la misma interfaz con el reproductor de sesiones.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type {
  AskEx, BugEx, CodeEx, Ex, FillEx, ListenEx, MatchEx, McEx, NumEx, OrderEx, ParsonsEx, PredictEx, WordsEx,
} from '../content/types'
import type { Answer } from '../engine/check'
import { seeded, shuffle } from '../engine/rng'
import { GitChallenge } from '../git/GitTerminal'
import type { PyResult } from '../runners/pyharness'
import { runPython, warmPython } from '../runners/python'
import { runRemote } from '../runners/remote'
import { ALT, normOut } from '../runners/wrap'
import { CodeBlock, Editor, Icon, Key, inline } from './kit'
import { sfx, speak } from './sound'

export interface ExProps<T extends Ex = Ex> {
  ex: T
  /** Respuesta en curso (null = aún no se puede comprobar). */
  answer: Answer | null
  setAnswer: (a: Answer | null) => void
  /** true cuando ya se corrigió: la interfaz queda bloqueada y muestra la solución. */
  checked: boolean
  /** Para ejercicios que se corrigen solos (match, code, git). */
  submit: (ok: boolean) => void
  /** Semilla para barajar de forma estable durante el intento. */
  seed: string
}

/** Tipos que se corrigen solos: el pie de sesión no muestra «Comprobar». */
export const SELF_GRADED = new Set(['match', 'code', 'git'])

// ── Opción múltiple ──────────────────────────────────────────────────────────

function Mc({ ex, answer, setAnswer, checked, seed }: ExProps<McEx>) {
  const order = useMemo(() => {
    const idx = ex.opts.map((_, i) => i)
    return ex.fixed ? idx : shuffle(idx, seeded(seed))
  }, [ex, seed])
  useEffect(() => {
    if (checked) return
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key)
      if (n >= 1 && n <= order.length && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) { setAnswer(order[n - 1]); sfx.tap() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [order, checked, setAnswer])
  return (
    <>
      {ex.code && <CodeBlock code={ex.code} lang={ex.lang} />}
      <div className={`opts ${ex.codeOpts ? 'opts-code' : ''}`} role="radiogroup">
        {order.map((oi, n) => {
          const state = checked ? (oi === ex.ans ? 'ok' : oi === answer ? 'bad' : '') : oi === answer ? 'sel' : ''
          return (
            <button key={oi} type="button" role="radio" aria-checked={oi === answer} disabled={checked} className={`opt ${state}`} onClick={() => { setAnswer(oi); sfx.tap() }}>
              <span className="opt-n">{n + 1}</span>
              {ex.codeOpts ? <CodeBlock code={ex.opts[oi]} lang={ex.optLang ?? ex.lang} /> : <span>{inline(ex.opts[oi])}</span>}
            </button>
          )
        })}
      </div>
    </>
  )
}

// ── Predecir salida ──────────────────────────────────────────────────────────

function Predict({ ex, answer, setAnswer, checked }: ExProps<PredictEx>) {
  const rows = ex.out.split('\n').length
  const value = (answer as string) ?? ''
  return (
    <>
      <CodeBlock code={ex.code} lang={ex.lang} />
      <label className="field-label">Salida{rows > 1 ? ` (${rows} líneas)` : ''}</label>
      {rows > 1 ? (
        <textarea className="input mono" rows={rows} value={value} disabled={checked} onChange={(e) => setAnswer(e.target.value || null)} spellCheck={false} autoCapitalize="off" autoCorrect="off" placeholder="Escribe la salida exacta, línea por línea" />
      ) : (
        <input className="input mono" value={value} disabled={checked} onChange={(e) => setAnswer(e.target.value || null)} spellCheck={false} autoCapitalize="off" autoCorrect="off" autoComplete="off" placeholder="Escribe la salida exacta" autoFocus />
      )}
    </>
  )
}

// ── Huecos ───────────────────────────────────────────────────────────────────

function Fill({ ex, answer, setAnswer, checked }: ExProps<FillEx>) {
  const parts = ex.code.split('___')
  const values = (answer as string[] | null) ?? ex.ans.map(() => '')
  const [draft, setDraft] = useState<string[]>(values)
  const set = (i: number, v: string) => {
    const next = draft.map((x, j) => (j === i ? v : x))
    setDraft(next)
    setAnswer(next.every((x) => x.trim()) ? next : null)
  }
  const isText = ex.lang === 'text'
  const body: ReactNode[] = []
  parts.forEach((p, i) => {
    body.push(<span key={`p${i}`}>{p}</span>)
    if (i < parts.length - 1) {
      const width = Math.max(...ex.ans[i].split(ALT).map((a) => a.length), 3) + 2
      body.push(
        <input
          key={`i${i}`} className={`blank ${isText ? '' : 'mono'}`} style={{ width: `${width}ch` }} value={draft[i] ?? ''} disabled={checked}
          onChange={(e) => set(i, e.target.value)} spellCheck={false} autoCapitalize="off" autoCorrect="off" autoComplete="off"
          aria-label={`Hueco ${i + 1}`} autoFocus={i === 0}
        />,
      )
    }
  })
  return isText ? <p className="cloze">{body}</p> : <pre className="code code-fill"><code>{body}</code></pre>
}

// ── Ordenar (líneas de código o pasos) ───────────────────────────────────────

function Arrange({ items, answer, setAnswer, checked, seed, mono }: { items: string[]; answer: Answer | null; setAnswer: (a: Answer | null) => void; checked: boolean; seed: string; mono: boolean }) {
  const bank = useMemo(() => {
    const idx = items.map((_, i) => i)
    let s = shuffle(idx, seeded(seed))
    // Evita que el orden barajado coincida con la solución.
    if (items.length > 1 && s.every((v, i) => v === i)) s = [...s.slice(1), s[0]]
    return s
  }, [items, seed])
  const [picked, setPicked] = useState<number[]>([])
  useEffect(() => { setPicked([]) }, [bank])
  const update = (next: number[]) => {
    setPicked(next)
    setAnswer(next.length === items.length ? next.map((i) => items[i]) : null)
    sfx.tap()
  }
  void answer
  const rest = bank.filter((i) => !picked.includes(i))
  const row = (i: number, n: number | null, onClick: () => void) => (
    <button key={i} type="button" className={`line ${mono ? 'mono' : ''}`} disabled={checked} onClick={onClick}>
      {n !== null && <span className="line-n">{n + 1}</span>}
      <span className="line-t">{mono ? items[i] : inline(items[i])}</span>
    </button>
  )
  return (
    <div className="arrange">
      <div className={`arrange-slot ${picked.length ? '' : 'empty'}`}>
        {picked.length ? picked.map((i, n) => row(i, n, () => update(picked.filter((x) => x !== i)))) : <span className="hint">Toca las piezas en el orden correcto</span>}
      </div>
      {rest.length > 0 && <div className="arrange-bank">{rest.map((i) => row(i, null, () => update([...picked, i])))}</div>}
    </div>
  )
}

const Parsons = (p: ExProps<ParsonsEx>) => <Arrange items={p.ex.lines} mono {...p} />
const Order = (p: ExProps<OrderEx>) => <Arrange items={p.ex.items} mono={false} {...p} />

// ── Encontrar el error ───────────────────────────────────────────────────────

function BugHunt({ ex, answer, setAnswer, checked }: ExProps<BugEx>) {
  return (
    <div className="code bug">
      {ex.code.split('\n').map((line, i) => {
        const n = i + 1
        const state = checked ? (n === ex.line ? 'ok' : n === answer ? 'bad' : '') : n === answer ? 'sel' : ''
        return (
          <button key={i} type="button" className={`bug-line ${state}`} disabled={checked || !line.trim()} onClick={() => { setAnswer(n); sfx.tap() }}>
            <span className="bug-n">{n}</span>
            <CodeBlock code={line || ' '} lang={ex.lang} className="bare" />
          </button>
        )
      })}
    </div>
  )
}

// ── Emparejar ────────────────────────────────────────────────────────────────

function Match({ ex, checked, submit, seed }: ExProps<MatchEx>) {
  const right = useMemo(() => shuffle(ex.pairs.map((_, i) => i), seeded(seed)), [ex, seed])
  const [left, setLeft] = useState<number | null>(null)
  const [done, setDone] = useState<number[]>([])
  const [wrong, setWrong] = useState<[number, number] | null>(null)
  const mistakes = useRef(0)
  const tapRight = (r: number) => {
    if (left === null || checked) return
    if (left === r) {
      const next = [...done, r]
      setDone(next)
      setLeft(null)
      sfx.tap()
      if (next.length === ex.pairs.length) submit(mistakes.current <= 1)
    } else {
      mistakes.current++
      setWrong([left, r])
      sfx.bad()
      setTimeout(() => setWrong(null), 500)
      setLeft(null)
    }
  }
  return (
    <div className="match">
      <div className="match-col">
        {ex.pairs.map(([a], i) => (
          <button key={i} type="button" disabled={done.includes(i) || checked} className={`opt ${done.includes(i) ? 'ok' : left === i ? 'sel' : wrong?.[0] === i ? 'bad' : ''}`} onClick={() => { setLeft(i); sfx.tap() }}>
            <span>{inline(a)}</span>
          </button>
        ))}
      </div>
      <div className="match-col">
        {right.map((i) => (
          <button key={i} type="button" disabled={done.includes(i) || checked} className={`opt ${done.includes(i) ? 'ok' : wrong?.[1] === i ? 'bad' : ''}`} onClick={() => tapRight(i)}>
            <span>{inline(ex.pairs[i][1])}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Respuesta corta y numérica ───────────────────────────────────────────────

function Ask({ ex, answer, setAnswer, checked }: ExProps<AskEx | NumEx>) {
  return (
    <>
      {ex.t === 'ask' && ex.code && <CodeBlock code={ex.code} lang={ex.lang} />}
      <input
        className="input mono" value={(answer as string) ?? ''} disabled={checked} onChange={(e) => setAnswer(e.target.value.trim() ? e.target.value : null)}
        spellCheck={false} autoCapitalize="off" autoCorrect="off" autoComplete="off" inputMode={ex.t === 'num' ? 'decimal' : 'text'}
        placeholder={ex.t === 'num' ? 'Escribe un número' : 'Tu respuesta'} autoFocus
      />
    </>
  )
}

// ── Escribir código ──────────────────────────────────────────────────────────

type RunState =
  | { kind: 'idle' }
  | { kind: 'running'; note: string }
  | { kind: 'py'; res: PyResult; pass: boolean }
  | { kind: 'out'; stdout: string; stderr: string; pass: boolean }
  | { kind: 'offline' }

function CodeLab({ ex, checked, submit }: ExProps<CodeEx>) {
  const [src, setSrc] = useState(ex.starter)
  const [run, setRun] = useState<RunState>({ kind: 'idle' })
  const [reveal, setReveal] = useState(false)
  const isPy = ex.lang === 'python'
  useEffect(() => { if (isPy) warmPython() }, [isPy])

  const execute = async () => {
    setRun({ kind: 'running', note: isPy ? 'Ejecutando Python en tu navegador…' : 'Compilando en el playground…' })
    if (isPy) {
      let res: PyResult
      try { res = await runPython(src, ex.tests ?? []) } catch (e) { res = { stdout: '', tests: [], error: (e as Error).message } }
      const pass = !res.error && (ex.tests ? res.tests.every((t) => t.ok) : normOut(res.stdout) === normOut(ex.out ?? ''))
      setRun({ kind: 'py', res, pass })
      if (pass) { sfx.ok(); submit(true) } else sfx.bad()
      return
    }
    const r = await runRemote(ex.lang!, src)
    if (r.unavailable) { setRun({ kind: 'offline' }); setReveal(true); return }
    const pass = r.ok && normOut(r.stdout) === normOut(ex.out ?? '')
    setRun({ kind: 'out', stdout: r.stdout, stderr: r.stderr, pass })
    if (pass) { sfx.ok(); submit(true) } else sfx.bad()
  }

  return (
    <div className="lab">
      <Editor value={src} onChange={setSrc} lang={ex.lang} disabled={checked} />
      {ex.out !== undefined && <div className="lab-expect"><span className="field-label">Salida esperada</span><pre className="code out">{ex.out}</pre></div>}
      {!checked && (
        <div className="row gap">
          <Key onClick={execute} disabled={run.kind === 'running'}><Icon name="play" size={18} fill /> {run.kind === 'running' ? 'Ejecutando…' : 'Ejecutar'}</Key>
          <Key variant="ghost" onClick={() => setSrc(ex.starter)}><Icon name="redo" size={18} /> Reiniciar</Key>
          {!reveal && <Key variant="ghost" onClick={() => setReveal(true)}><Icon name="eye" size={18} /> Ver solución</Key>}
        </div>
      )}
      {run.kind === 'running' && <p className="hint">{run.note}</p>}
      {run.kind === 'py' && (
        <div className="lab-out">
          {run.res.error && <pre className="code out bad">{run.res.error}</pre>}
          {run.res.stdout && <pre className="code out">{run.res.stdout}</pre>}
          {run.res.tests.map((t, i) => (
            <div key={i} className={`test ${t.ok ? 'ok' : 'bad'}`}>
              <Icon name={t.ok ? 'check' : 'x'} size={16} />
              <code>{t.expr}</code>
              {!t.ok && <span>esperado <code>{t.exp}</code> · obtuviste <code>{t.got}</code></span>}
            </div>
          ))}
          {!run.res.error && !ex.tests && !run.pass && <p className="hint">La salida no coincide con la esperada.</p>}
        </div>
      )}
      {run.kind === 'out' && (
        <div className="lab-out">
          {run.stderr && <pre className="code out bad">{run.stderr}</pre>}
          {run.stdout && <pre className="code out">{run.stdout}</pre>}
          {!run.pass && !run.stderr && <p className="hint">La salida no coincide con la esperada.</p>}
        </div>
      )}
      {run.kind === 'offline' && <p className="hint">No se pudo contactar con el compilador en línea. Compara tu código con la solución y evalúate con honestidad.</p>}
      {reveal && !checked && (
        <div className="lab-sol">
          <span className="field-label">Solución modelo</span>
          <CodeBlock code={ex.solution} lang={ex.lang} />
          <div className="row gap">
            <Key variant="ok" onClick={() => submit(run.kind === 'offline')}><Icon name="check" size={18} /> {run.kind === 'offline' ? 'Mi código hace lo mismo' : 'Entendido, continuar'}</Key>
            {run.kind === 'offline' && <Key variant="ghost" onClick={() => submit(false)}>Aún no me sale</Key>}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Inglés: banco de palabras y dictado ──────────────────────────────────────

function Words({ ex, setAnswer, checked, seed }: ExProps<WordsEx>) {
  const tokens = useMemo(() => shuffle([...ex.ans.split(' '), ...ex.extra], seeded(seed)), [ex, seed])
  const [picked, setPicked] = useState<number[]>([])
  useEffect(() => { setPicked([]) }, [tokens])
  const update = (next: number[]) => { setPicked(next); setAnswer(next.length ? next.map((i) => tokens[i]) : null); sfx.tap() }
  return (
    <div className="words">
      <div className="words-slot">
        {picked.map((i) => <button key={i} type="button" className="word" disabled={checked} onClick={() => update(picked.filter((x) => x !== i))}>{tokens[i]}</button>)}
      </div>
      <div className="words-bank">
        {tokens.map((t, i) => (
          <button key={i} type="button" className={`word ${picked.includes(i) ? 'used' : ''}`} disabled={checked || picked.includes(i)} onClick={() => update([...picked, i])}>{t}</button>
        ))}
      </div>
    </div>
  )
}

function Listen({ ex, answer, setAnswer, checked }: ExProps<ListenEx>) {
  useEffect(() => { const t = setTimeout(() => speak(ex.text), 350); return () => clearTimeout(t) }, [ex])
  return (
    <>
      <div className="row gap center">
        <Key size="lg" onClick={() => speak(ex.text)} aria-label="Escuchar"><Icon name="volume" size={26} /></Key>
        <Key variant="ghost" onClick={() => speak(ex.text, 0.6)}>Más lento</Key>
      </div>
      <input className="input" value={(answer as string) ?? ''} disabled={checked} onChange={(e) => setAnswer(e.target.value.trim() ? e.target.value : null)} spellCheck={false} autoCapitalize="off" autoCorrect="off" autoComplete="off" placeholder="Type what you hear" lang="en" />
      {checked && ex.es && <p className="hint">Significa: {ex.es}</p>}
    </>
  )
}

// ── Despacho ─────────────────────────────────────────────────────────────────

export function ExerciseView(p: ExProps) {
  const { ex } = p
  switch (ex.t) {
    case 'mc': return <Mc {...p} ex={ex} />
    case 'predict': return <Predict {...p} ex={ex} />
    case 'fill': return <Fill {...p} ex={ex} />
    case 'parsons': return <Parsons {...p} ex={ex} />
    case 'order': return <Order {...p} ex={ex} />
    case 'bug': return <BugHunt {...p} ex={ex} />
    case 'match': return <Match {...p} ex={ex} />
    case 'ask': case 'num': return <Ask {...p} ex={ex} />
    case 'code': return <CodeLab {...p} ex={ex} />
    case 'git': return <GitChallenge {...p} ex={ex} />
    case 'words': return <Words {...p} ex={ex} />
    case 'listen': return <Listen {...p} ex={ex} />
  }
}

export const TYPE_LABEL: Record<Ex['t'], string> = {
  mc: 'Elige la respuesta', predict: 'Predice la salida', fill: 'Completa', parsons: 'Ordena el código', order: 'Ordena los pasos',
  bug: 'Caza el error', match: 'Empareja', ask: 'Respuesta corta', num: 'Calcula', code: 'Escribe código', git: 'Simulador de git',
  words: 'Construye la frase', listen: 'Dictado',
}
