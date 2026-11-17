import { useState } from 'react'
import { TRACKS } from '../content'
import { update } from '../engine/store'
import { go } from '../router'
import { Icon, Key, Mascot, TrackKey } from '../ui/kit'
import { sfx } from '../ui/sound'

export const GOALS = [
  { xp: 20, name: 'Relajado', time: '≈ 5 min al día' },
  { xp: 50, name: 'Constante', time: '≈ 10 min al día' },
  { xp: 100, name: 'Serio', time: '≈ 20 min al día' },
  { xp: 150, name: 'Intenso', time: '≈ 30 min al día' },
]

export function Onboarding() {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [tracks, setTracks] = useState<string[]>([])
  const [goal, setGoal] = useState(50)
  const toggle = (id: string) => { setTracks((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id])); sfx.tap() }
  const finish = () => {
    update((d) => {
      d.profile.name = name.trim() || 'Dev'
      d.profile.tracks = tracks.length ? tracks : TRACKS.map((t) => t.id)
      d.profile.dailyGoal = goal
      d.profile.onboarded = true
    })
    sfx.win()
    go('', true)
  }
  const canNext = step === 0 ? true : step === 1 ? tracks.length > 0 : true
  return (
    <div className="onb">
      <div className="onb-dots">{[0, 1, 2].map((i) => <span key={i} className={i <= step ? 'on' : ''} />)}</div>
      <div className="onb-body">
        {step === 0 && (
          <>
            <Mascot mood="happy" size={148} />
            <h1>Hola, soy Bit.</h1>
            <p className="lead">Bienvenido a <strong>encode</strong>: tu gimnasio diario de programación. Lenguajes, git, redes, diseño de sistemas e inglés técnico, en sesiones de cinco minutos.</p>
            <label className="field-label" htmlFor="name">¿Cómo te llamo?</label>
            <input id="name" className="input" value={name} maxLength={24} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre o apodo" autoFocus onKeyDown={(e) => e.key === 'Enter' && setStep(1)} />
          </>
        )}
        {step === 1 && (
          <>
            <h1>¿Qué quieres entrenar?</h1>
            <p className="lead">Elige una o varias rutas. Podrás cambiarlas cuando quieras: todas estarán siempre disponibles.</p>
            <div className="onb-tracks">
              {TRACKS.map((t) => (
                <button key={t.id} type="button" className={`pick ${tracks.includes(t.id) ? 'on' : ''}`} aria-pressed={tracks.includes(t.id)} onClick={() => toggle(t.id)}>
                  <TrackKey glyph={t.glyph} color={t.color} size={44} />
                  <span><strong>{t.name}</strong><small>{t.tagline}</small></span>
                  {tracks.includes(t.id) && <Icon name="check" size={20} className="brand" />}
                </button>
              ))}
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <Mascot mood="wink" size={110} />
            <h1>Tu meta diaria</h1>
            <p className="lead">La constancia gana a la intensidad. Empieza con algo que puedas cumplir incluso en un mal día.</p>
            <div className="onb-goals">
              {GOALS.map((g) => (
                <button key={g.xp} type="button" className={`pick ${goal === g.xp ? 'on' : ''}`} aria-pressed={goal === g.xp} onClick={() => { setGoal(g.xp); sfx.tap() }}>
                  <span><strong>{g.name}</strong><small>{g.time}</small></span>
                  <span className="mono">{g.xp} XP</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="onb-foot">
        {step > 0 ? <Key variant="ghost" onClick={() => setStep(step - 1)}>Atrás</Key> : <span />}
        <Key size="lg" disabled={!canNext} onClick={() => (step < 2 ? setStep(step + 1) : finish())}>{step < 2 ? 'Continuar' : 'Empezar'}</Key>
      </div>
    </div>
  )
}
