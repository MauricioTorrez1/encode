// Terminal interactiva del simulador de git + grafo de commits.
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import type { GitEx } from '../content/types'
import type { ExProps } from '../ui/exercises'
import { Icon, Key, inline } from '../ui/kit'
import { sfx } from '../ui/sound'
import { scenario, type GitSim, type GraphNode } from './engine'

const COL = 62, ROW = 46, PAD = 26
const LANE_COLORS = ['var(--brand)', '#5cc8ff', '#ff86c8', '#ffc83d', '#b79bff', '#5fe0a8']

export function GitGraph({ nodes }: { nodes: GraphNode[] }) {
  if (!nodes.length) return <div className="gitgraph empty">Aún no hay commits</div>
  const lanes = Math.max(...nodes.map((n) => n.lane)) + 1
  const pos = new Map(nodes.map((n) => [n.id, { x: PAD + n.col * COL, y: PAD + 18 + n.lane * ROW }]))
  const w = PAD * 2 + (nodes.length - 1) * COL + 70
  const h = PAD + 18 + (lanes - 1) * ROW + 44
  return (
    <div className="gitgraph">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Grafo de commits">
        {nodes.flatMap((n) => n.parents.map((p) => {
          const a = pos.get(p)!, b = pos.get(n.id)!
          const d = a.y === b.y ? `M${a.x} ${a.y} L${b.x} ${b.y}` : `M${a.x} ${a.y} C${a.x + COL / 2} ${a.y} ${b.x - COL / 2} ${b.y} ${b.x} ${b.y}`
          return <path key={`${p}-${n.id}`} d={d} fill="none" stroke="var(--line2)" strokeWidth="3" />
        }))}
        {nodes.map((n) => {
          const { x, y } = pos.get(n.id)!
          const color = LANE_COLORS[n.lane % LANE_COLORS.length]
          return (
            <g key={n.id}>
              <title>{`${n.id} — ${n.msg}`}</title>
              {n.head && <circle cx={x} cy={y} r="15" fill="none" stroke={color} strokeWidth="2" strokeDasharray="3 4" className="git-head" />}
              <circle cx={x} cy={y} r="10" fill={color} />
              <text x={x} y={y + 26} textAnchor="middle" className="git-id">{n.id.slice(0, 4)}</text>
              {n.labels.map((l, i) => (
                <text key={l} x={x} y={y - 18 - i * 13} textAnchor="middle" className={`git-label ${l.startsWith('HEAD') ? 'head' : l.startsWith('origin/') ? 'remote' : l.startsWith('tag') ? 'tag' : ''}`}>{l}</text>
              ))}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

interface Entry { cmd?: string; out: string }

/** Terminal reutilizable: ejecuta comandos contra un GitSim y notifica tras cada uno. */
export function GitTerminal({ sim, onRun, disabled, autoFocus }: { sim: GitSim; onRun?: () => void; disabled?: boolean; autoFocus?: boolean }) {
  const [log, setLog] = useState<Entry[]>([])
  const [value, setValue] = useState('')
  const [, force] = useState(0)
  const history = useRef<string[]>([])
  const cursor = useRef(0)
  const scroller = useRef<HTMLDivElement>(null)
  useEffect(() => { setLog([]) }, [sim])
  useEffect(() => { scroller.current?.scrollTo(0, scroller.current.scrollHeight) }, [log])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const cmd = value.trim()
    if (!cmd) return
    history.current.push(cmd)
    cursor.current = history.current.length
    setValue('')
    if (cmd === 'clear') { setLog([]); return }
    const out = sim.run(cmd)          // fuera del actualizador: debe ejecutarse una sola vez y antes de comprobar el reto
    setLog((l) => [...l, { cmd, out }])
    force((n) => n + 1)
    onRun?.()
  }
  const branch = sim.inited ? sim.currentBranch() ?? `(${sim.headId()?.slice(0, 7)})` : null
  return (
    <div className="term">
      <GitGraph nodes={sim.graph()} />
      <div className="term-log" ref={scroller}>
        {!log.length && <div className="term-hint">Escribe comandos como en una terminal real. Prueba <code>git status</code> o <code>help</code>.</div>}
        {log.map((e, i) => (
          <div key={i} className="term-entry">
            <div className="term-cmd"><span className="term-ps">$</span> {e.cmd}</div>
            {e.out && <pre className={/^(fatal|error)|CONFLICT|rejected/m.test(e.out) ? 'term-err' : ''}>{e.out}</pre>}
          </div>
        ))}
      </div>
      <form className="term-in" onSubmit={submit}>
        <span className="term-ps">{branch ? `(${branch}) $` : '$'}</span>
        <input
          value={value} disabled={disabled} autoFocus={autoFocus} onChange={(e) => setValue(e.target.value)} spellCheck={false} autoCapitalize="off" autoCorrect="off" autoComplete="off"
          aria-label="Línea de comandos" placeholder={disabled ? '' : 'git …'}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp') { e.preventDefault(); cursor.current = Math.max(0, cursor.current - 1); setValue(history.current[cursor.current] ?? '') }
            if (e.key === 'ArrowDown') { e.preventDefault(); cursor.current = Math.min(history.current.length, cursor.current + 1); setValue(history.current[cursor.current] ?? '') }
          }}
        />
        <Key size="sm" type="submit" disabled={disabled} aria-label="Ejecutar"><Icon name="right" size={16} /></Key>
      </form>
    </div>
  )
}

/** Ejercicio de git: hay que llevar el repositorio al estado objetivo. */
export function GitChallenge({ ex, checked, submit }: ExProps<GitEx>) {
  const [run, setRun] = useState(0)
  const sim = useMemo(() => scenario(ex.setup), [ex, run])
  const [hint, setHint] = useState(false)
  const [reveal, setReveal] = useState(false)
  const solved = useRef(false)
  useEffect(() => { solved.current = false }, [sim])
  const onRun = () => {
    if (solved.current || checked) return
    let ok = false
    try { ok = ex.check(sim) } catch { ok = false }
    if (ok) { solved.current = true; sfx.ok(); submit(true) }
  }
  return (
    <div className="gitlab">
      <GitTerminal sim={sim} onRun={onRun} disabled={checked} autoFocus />
      {!checked && (
        <div className="row gap">
          <Key variant="ghost" size="sm" onClick={() => setRun((n) => n + 1)}><Icon name="redo" size={16} /> Reiniciar</Key>
          {ex.hint && !hint && <Key variant="ghost" size="sm" onClick={() => setHint(true)}><Icon name="bulb" size={16} /> Pista</Key>}
          {!reveal && <Key variant="ghost" size="sm" onClick={() => setReveal(true)}><Icon name="eye" size={16} /> Ver solución</Key>}
        </div>
      )}
      {hint && ex.hint && !checked && <p className="hint">{inline(ex.hint)}</p>}
      {reveal && !checked && (
        <div className="lab-sol">
          <span className="field-label">Una solución posible</span>
          <pre className="code">{ex.solution.join('\n')}</pre>
          <Key variant="ok" size="sm" onClick={() => submit(false)}>Entendido, continuar</Key>
        </div>
      )}
    </div>
  )
}
