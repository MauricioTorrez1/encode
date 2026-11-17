// Mapa del roadmap de una ruta: unidades, lecciones como teclas y jefe final por unidad.
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { trackMeta, useContent } from '../content'
import { LEVEL_LABEL, type Lesson, type Unit } from '../content/types'
import { lessonUnlocked, nextLesson, trackProgress, unitCleared, unitUnlocked } from '../engine/progress'
import { useStore } from '../engine/store'
import { go } from '../router'
import { Bar, Icon, Key, Mascot, TrackKey } from '../ui/kit'

const ZIG = [0, 46, 74, 46, 0, -46, -74, -46]

export function TrackMap({ id }: { id: string }) {
  const s = useStore((x) => x)
  const content = useContent()
  const [open, setOpen] = useState<string | null>(null)
  const current = useRef<HTMLDivElement>(null)
  const track = content?.track.get(id)
  const next = track ? nextLesson(s, track) : undefined
  useEffect(() => { current.current?.scrollIntoView({ block: 'center' }) }, [track?.id])
  if (!content) return <p className="hint">Cargando…</p>
  if (!track) return <p className="hint">Ruta no encontrada.</p>
  const meta = trackMeta(id)
  const p = trackProgress(s, track)
  let n = 0

  const node = (l: Lesson, ui: number, li: number) => {
    const unlocked = lessonUnlocked(s, track, ui, li)
    const stat = s.lessons[l.id]
    const state = stat?.done ? 'done' : unlocked ? 'open' : 'locked'
    const isNext = next?.id === l.id
    const x = ZIG[n++ % ZIG.length]
    return (
      <div key={l.id} className="node-wrap" style={{ '--x': `${x}px` } as CSSProperties} ref={isNext ? current : undefined}>
        {isNext && <span className="node-flag">Empieza aquí</span>}
        <button type="button" className={`node ${state} ${isNext ? 'next' : ''}`} aria-label={`${l.title}${state === 'locked' ? ' (bloqueada)' : ''}`} onClick={() => setOpen(open === l.id ? null : l.id)}>
          {state === 'locked' ? <Icon name="lock" size={24} /> : state === 'done' ? <Icon name="check" size={28} /> : <Icon name="play" size={24} fill />}
        </button>
        {stat?.done ? <div className="stars">{[1, 2, 3].map((k) => <Icon key={k} name="star" size={14} fill={k <= stat.stars} className={k <= stat.stars ? 'on' : ''} />)}</div> : null}
        <span className="node-title">{l.title}</span>
        {open === l.id && (
          <div className="pop">
            <strong>{l.title}</strong>
            <span className="muted small">{l.ex.length} ejercicios{stat?.done ? ` · mejor precisión ${Math.round(stat.best * 100)} %` : ''}</span>
            {unlocked
              ? <Key block onClick={() => go(`s/lesson/${l.id}`)}>{stat?.done ? 'Repetir para mejorar' : 'Empezar'} <Icon name="right" size={18} /></Key>
              : <p className="hint">Completa la lección anterior o derrota al jefe de la unidad previa para desbloquearla.</p>}
          </div>
        )}
      </div>
    )
  }

  const boss = (u: Unit, ui: number) => {
    const unlocked = unitUnlocked(s, track, ui)
    const b = s.bosses[u.id]
    const state = b?.passed ? 'done' : unlocked ? 'open' : 'locked'
    const x = ZIG[n++ % ZIG.length]
    const key = `boss:${u.id}`
    return (
      <div key={key} className="node-wrap" style={{ '--x': `${x}px` } as CSSProperties}>
        <button type="button" className={`node boss ${state}`} aria-label={`Jefe de la unidad ${u.title}`} onClick={() => setOpen(open === key ? null : key)}>
          <Icon name={b?.passed ? 'crown' : state === 'locked' ? 'lock' : 'swords'} size={28} />
        </button>
        <span className="node-title">Jefe de unidad</span>
        {open === key && (
          <div className="pop">
            <strong>Jefe: {u.title}</strong>
            <span className="muted small">10 preguntas mezcladas · necesitas 80 %{b ? ` · mejor marca ${Math.round(b.best * 100)} %` : ''}</span>
            {unlocked
              ? <Key block variant={b?.passed ? 'ghost' : 'brand'} onClick={() => go(`s/boss/${u.id}`)}>{b?.passed ? 'Volver a retarlo' : unitCleared(s, u) ? 'Retar al jefe' : 'Retar al jefe y saltar la unidad'}</Key>
              : <p className="hint">Supera la unidad anterior para llegar hasta aquí.</p>}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="map-page" style={{ '--c': meta.color } as CSSProperties}>
      <header className="map-head card">
        <button type="button" className="iconbtn" aria-label="Volver a rutas" onClick={() => go('rutas')}><Icon name="chevLeft" /></button>
        <TrackKey glyph={meta.glyph} color={meta.color} />
        <div className="map-head-t">
          <h1>{meta.name}</h1>
          <Bar value={p.ratio} color={meta.color} />
          <span className="muted small">{p.done}/{p.total} lecciones · {p.stars}/{p.maxStars} estrellas</span>
        </div>
      </header>
      {track.units.map((u, ui) => {
        const unlocked = unitUnlocked(s, track, ui)
        return (
          <section key={u.id} className={`unit ${unlocked ? '' : 'locked'}`}>
            <div className="unit-banner">
              <div>
                <span className="eyebrow">Unidad {ui + 1} · {LEVEL_LABEL[u.level]}</span>
                <h2>{u.title}</h2>
                <p>{u.desc}</p>
              </div>
              {!unlocked && <Icon name="lock" size={22} />}
              {unitCleared(s, u) && <Icon name="check" size={24} />}
            </div>
            <div className="path">
              {u.lessons.map((l, li) => node(l, ui, li))}
              {boss(u, ui)}
            </div>
          </section>
        )
      })}
      <div className="map-end"><Mascot mood={p.ratio >= 1 ? 'party' : 'wink'} size={84} /><p className="hint">{p.ratio >= 1 ? '¡Ruta completada! Repite lecciones para conseguir las tres estrellas.' : 'Cada tecla que pulses te acerca al final de la ruta.'}</p></div>
    </div>
  )
}
