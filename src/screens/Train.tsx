// Entrenar: repaso, reto diario, kata del día, gimnasio procedural, mecanografía y Rosetta.
import type { CSSProperties } from 'react'
import { useContent } from '../content'
import { KATAS, kataOfDay } from '../content/katas'
import { today } from '../engine/dates'
import { DRILLS } from '../engine/drills'
import { DRILL_SIZE, dueCount } from '../engine/session'
import { matureRatio } from '../engine/srs'
import { useStore } from '../engine/store'
import { go } from '../router'
import { Icon, Key } from '../ui/kit'

const KATA_LEVEL = ['', 'Fácil', 'Media', 'Difícil']

export function Train() {
  const s = useStore((x) => x)
  const content = useContent()
  const due = dueCount(s, content)
  const kata = kataOfDay(today())
  const cards = Object.keys(s.srs).length
  return (
    <div className="train">
      <h1>Entrenar</h1>
      <p className="lead">Diez minutos de práctica deliberada valen más que una hora de lectura.</p>

      <div className="grid2">
        <button type="button" className="card action" onClick={() => go('s/review')}>
          <span className="action-ic violet"><Icon name="brain" size={26} /></span>
          <span className="action-t"><strong>Repaso espaciado</strong><small>{due > 0 ? `${due} pendientes hoy` : cards ? 'Al día. Práctica libre de lo más fallado' : 'Se llena conforme completas lecciones'}</small></span>
          {due > 0 ? <span className="badge">{due}</span> : <Icon name="chevRight" />}
        </button>
        <button type="button" className={`card action ${s.daily[today()] !== undefined ? 'done' : ''}`} onClick={() => go('s/daily')}>
          <span className="action-ic gold"><Icon name="calendar" size={26} /></span>
          <span className="action-t"><strong>Reto diario</strong><small>{s.daily[today()] !== undefined ? `Completado · ${s.daily[today()]}%` : '8 ejercicios mezclados de tus rutas'}</small></span>
          <Icon name={s.daily[today()] !== undefined ? 'check' : 'chevRight'} />
        </button>
      </div>
      {cards > 0 && <p className="muted small">Memoria: {cards} ejercicios en tu calendario de repaso · {Math.round(matureRatio(s.srs) * 100)} % consolidados (intervalo ≥ 7 días)</p>}

      <section className="card kata-today">
        <div>
          <span className="eyebrow">Kata del día · Python · {KATA_LEVEL[kata.level]}</span>
          <h2>{kata.title}</h2>
          <p className="muted">Escribe la solución y pásala por tests reales en tu navegador.</p>
        </div>
        <Key onClick={() => go(`s/kata/${kata.id}`)}>{s.katas[kata.id] ? 'Repetir' : 'Resolver'} <Icon name="code" size={18} /></Key>
      </section>

      <h2>Gimnasio</h2>
      <p className="muted">Rondas de {DRILL_SIZE} ejercicios generados al momento: nunca se repiten.</p>
      <div className="drills">
        {DRILLS.map((d) => (
          <button key={d.id} type="button" className="card drill" style={{ '--c': d.color } as CSSProperties} onClick={() => go(`s/drill/${d.id}`)}>
            <span className="drill-ic"><Icon name={d.icon} size={24} /></span>
            <strong>{d.title}</strong>
            <small>{d.desc}</small>
            <span className="muted small mono">{s.gym[d.id] ? `Récord ${s.gym[d.id].best}/${DRILL_SIZE}` : 'Sin jugar'}</span>
          </button>
        ))}
      </div>

      <div className="grid2">
        <button type="button" className="card action" onClick={() => go('typing')}>
          <span className="action-ic cyan"><Icon name="keyboard" size={26} /></span>
          <span className="action-t"><strong>Mecanografía de código</strong><small>{s.totals.wpm ? `Tu récord: ${s.totals.wpm} PPM` : 'Escribe snippets reales contra el reloj'}</small></span>
          <Icon name="chevRight" />
        </button>
        <button type="button" className="card action" onClick={() => go('rosetta')}>
          <span className="action-ic coral"><Icon name="languages" size={26} /></span>
          <span className="action-t"><strong>Rosetta</strong><small>El mismo concepto en Python, Java, Go y Rust</small></span>
          <Icon name="chevRight" />
        </button>
      </div>

      <h2>Todas las katas</h2>
      <div className="katas">
        {KATAS.map((k) => (
          <button key={k.id} type="button" className={`kata ${s.katas[k.id] ? 'done' : ''}`} onClick={() => go(`s/kata/${k.id}`)}>
            <span className="kata-ic">{s.katas[k.id] ? <Icon name="check" size={16} /> : <Icon name="code" size={16} />}</span>
            <span>{k.title}</span>
            <span className={`lvl lvl-${k.level}`}>{KATA_LEVEL[k.level]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
