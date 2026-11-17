import type { CSSProperties } from 'react'
import { TRACKS, useContent } from '../content'
import { trackProgress } from '../engine/progress'
import { useStore } from '../engine/store'
import { go } from '../router'
import { Bar, Icon, TrackKey } from '../ui/kit'

export function Tracks() {
  const s = useStore((x) => x)
  const content = useContent()
  return (
    <div className="tracks-page">
      <h1>Rutas</h1>
      <p className="lead">Nueve roadmaps, de lo básico a nivel experto. Avanza en orden o salta unidades derrotando a su jefe.</p>
      <div className="tracks">
        {TRACKS.map((m) => {
          const tr = content?.track.get(m.id)
          const p = tr ? trackProgress(s, tr) : { done: 0, total: 0, ratio: 0, stars: 0, maxStars: 0 }
          return (
            <button key={m.id} type="button" className="card track" style={{ '--c': m.color } as CSSProperties} onClick={() => go(`ruta/${m.id}`)}>
              <div className="row gap">
                <TrackKey glyph={m.glyph} color={m.color} />
                <div className="track-t"><strong>{m.name}</strong><small>{m.tagline}</small></div>
                {s.profile.tracks.includes(m.id) && <span className="pin" title="En tu plan"><Icon name="check" size={14} /></span>}
              </div>
              <Bar value={p.ratio} color={m.color} />
              <div className="row between muted small">
                <span>{p.done}/{p.total} lecciones</span>
                <span><Icon name="star" size={13} fill /> {p.stars}/{p.maxStars}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
