// Perfil: estadísticas, actividad, dominio por ruta, logros y ajustes.
import { useRef, useState, type CSSProperties } from 'react'
import { TRACKS, useContent } from '../content'
import { ACHIEVEMENTS } from '../engine/achievements'
import { addDays, today } from '../engine/dates'
import { trackProgress } from '../engine/progress'
import { matureRatio } from '../engine/srs'
import { exportState, importState, update, useStore, wipeState } from '../engine/store'
import { levelFor } from '../engine/xp'
import { Bar, Icon, Key, Mascot, TrackKey } from '../ui/kit'
import { GOALS } from './Onboarding'

const WEEKS = 18

export function Profile() {
  const s = useStore((x) => x)
  const content = useContent()
  const lv = levelFor(s.xp)
  const t = today()
  const file = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')
  const [confirmWipe, setConfirmWipe] = useState(false)

  // Mapa de actividad: columnas = semanas, filas = días (lunes arriba).
  const dow = (new Date(t + 'T12:00').getDay() + 6) % 7
  const start = addDays(t, -(WEEKS - 1) * 7 - dow)
  const cells = Array.from({ length: WEEKS * 7 }, (_, i) => {
    const key = addDays(start, i)
    const xp = s.days[key]?.xp ?? 0
    const lvl = key > t ? -1 : xp === 0 ? 0 : xp < s.profile.dailyGoal * 0.5 ? 1 : xp < s.profile.dailyGoal ? 2 : xp < s.profile.dailyGoal * 2 ? 3 : 4
    return { key, xp, lvl }
  })
  const last14 = Array.from({ length: 14 }, (_, i) => { const key = addDays(t, i - 13); return { key, xp: s.days[key]?.xp ?? 0 } })
  const maxXp = Math.max(s.profile.dailyGoal, ...last14.map((d) => d.xp))
  const activeDays = Object.values(s.days).filter((d) => d.xp > 0).length
  const accuracy = s.totals.ex ? Math.round((s.totals.ok / s.totals.ex) * 100) : 0
  const unlocked = ACHIEVEMENTS.filter((a) => s.achievements[a.id]).length
  const groups = [...new Set(ACHIEVEMENTS.map((a) => a.group))]

  const download = () => {
    const url = URL.createObjectURL(new Blob([exportState()], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `encode-progreso-${t}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  const upload = async (f?: File) => {
    if (!f) return
    try { importState(await f.text()); setMsg('Progreso importado.') } catch (e) { setMsg((e as Error).message || 'No se pudo importar el archivo.') }
  }
  const toggleTrack = (id: string) => update((d) => {
    const has = d.profile.tracks.includes(id)
    if (has && d.profile.tracks.length === 1) return
    d.profile.tracks = has ? d.profile.tracks.filter((x) => x !== id) : [...d.profile.tracks, id]
  })

  return (
    <div className="profile">
      <section className="card me">
        <Mascot mood="happy" size={88} />
        <div className="me-t">
          <h1>{s.profile.name}</h1>
          <span className="rank">{lv.rank} · Nivel {lv.level}</span>
          <Bar value={lv.into / lv.need} color="var(--xp)" />
          <span className="muted small mono">{lv.into}/{lv.need} XP para el nivel {lv.level + 1}{lv.nextRank ? ` · «${lv.nextRank[1]}» en el nivel ${lv.nextRank[0]}` : ''}</span>
        </div>
      </section>

      <div className="stats">
        <div className="card kpi"><Icon name="zap" fill className="xpc" /><strong>{s.xp.toLocaleString('es')}</strong><span>XP total</span></div>
        <div className="card kpi"><Icon name="flame" fill className="fire" /><strong>{s.streak.current}</strong><span>Racha · récord {s.streak.best}</span></div>
        <div className="card kpi"><Icon name="book" className="brand" /><strong>{s.totals.lessons}</strong><span>Lecciones</span></div>
        <div className="card kpi"><Icon name="target" className="gold" /><strong>{accuracy}%</strong><span>Precisión global</span></div>
        <div className="card kpi"><Icon name="brain" className="violet" /><strong>{Math.round(matureRatio(s.srs) * 100)}%</strong><span>Memoria consolidada</span></div>
        <div className="card kpi"><Icon name="calendar" className="gemc" /><strong>{activeDays}</strong><span>Días activos</span></div>
      </div>

      <section className="card">
        <h2>Actividad</h2>
        <div className="heat" style={{ '--weeks': WEEKS } as CSSProperties} aria-label="Mapa de actividad">
          {cells.map((c) => <span key={c.key} className={`heat-c l${c.lvl}`} title={c.lvl < 0 ? '' : `${c.key}: ${c.xp} XP`} />)}
        </div>
        <div className="bars" aria-label="XP de los últimos 14 días">
          {last14.map((d) => (
            <div key={d.key} className="bars-col" title={`${d.key}: ${d.xp} XP`}>
              <span className="bars-v">{d.xp || ''}</span>
              <span className={`bars-b ${d.xp >= s.profile.dailyGoal ? 'goal' : ''}`} style={{ height: `${Math.max(3, (d.xp / maxXp) * 100)}%` }} />
              <span className="bars-l">{d.key.slice(8)}</span>
            </div>
          ))}
        </div>
        <p className="muted small">XP de los últimos 14 días. Las barras resaltadas alcanzaron tu meta de {s.profile.dailyGoal} XP.</p>
      </section>

      <section className="card">
        <h2>Dominio por ruta</h2>
        <div className="mastery">
          {TRACKS.map((m) => {
            const tr = content?.track.get(m.id)
            const p = tr ? trackProgress(s, tr) : { ratio: 0, done: 0, total: 0, stars: 0, maxStars: 0 }
            return (
              <div key={m.id} className="mastery-row">
                <TrackKey glyph={m.glyph} color={m.color} size={34} />
                <div className="mastery-t"><div className="row between small"><span>{m.name}</span><span className="muted mono">{p.done}/{p.total} · ★ {p.stars}</span></div><Bar value={p.ratio} color={m.color} height={8} /></div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="card">
        <div className="row between"><h2>Logros</h2><span className="muted mono">{unlocked}/{ACHIEVEMENTS.length}</span></div>
        {groups.map((g) => (
          <div key={g}>
            <h3 className="eyebrow">{g}</h3>
            <div className="badges">
              {ACHIEVEMENTS.filter((a) => a.group === g).map((a) => (
                <div key={a.id} className={`badge-card ${s.achievements[a.id] ? 'on' : ''}`} title={s.achievements[a.id] ? `Conseguido el ${s.achievements[a.id]}` : 'Bloqueado'}>
                  <span className="badge-ic"><Icon name={s.achievements[a.id] ? a.icon : 'lock'} size={22} /></span>
                  <strong>{a.title}</strong>
                  <small>{a.desc}</small>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="card settings">
        <h2>Ajustes</h2>
        <label className="set-row"><span>Nombre</span><input className="input" value={s.profile.name} maxLength={24} onChange={(e) => update((d) => { d.profile.name = e.target.value })} /></label>
        <div className="set-row"><span>Meta diaria</span>
          <div className="seg">{GOALS.map((g) => <button key={g.xp} type="button" className={s.profile.dailyGoal === g.xp ? 'on' : ''} onClick={() => update((d) => { d.profile.dailyGoal = g.xp })}>{g.xp} XP</button>)}</div>
        </div>
        <div className="set-row"><span>Tema</span>
          <div className="seg">
            <button type="button" className={s.profile.theme === 'dark' ? 'on' : ''} onClick={() => update((d) => { d.profile.theme = 'dark' })}><Icon name="moon" size={16} /> Oscuro</button>
            <button type="button" className={s.profile.theme === 'light' ? 'on' : ''} onClick={() => update((d) => { d.profile.theme = 'light' })}><Icon name="sun" size={16} /> Claro</button>
          </div>
        </div>
        <div className="set-row"><span>Sonido y vibración</span>
          <div className="seg">
            <button type="button" className={s.profile.sound ? 'on' : ''} onClick={() => update((d) => { d.profile.sound = true })}><Icon name="volume" size={16} /> Sí</button>
            <button type="button" className={!s.profile.sound ? 'on' : ''} onClick={() => update((d) => { d.profile.sound = false })}><Icon name="mute" size={16} /> No</button>
          </div>
        </div>
        <div className="set-row"><span>Modo libre<small>Desbloquea todas las lecciones sin seguir el orden</small></span>
          <div className="seg">
            <button type="button" className={s.profile.freeMode ? 'on' : ''} onClick={() => update((d) => { d.profile.freeMode = true })}><Icon name="unlock" size={16} /> Sí</button>
            <button type="button" className={!s.profile.freeMode ? 'on' : ''} onClick={() => update((d) => { d.profile.freeMode = false })}><Icon name="lock" size={16} /> No</button>
          </div>
        </div>
        <div className="set-col"><span>Rutas en tu plan diario</span>
          <div className="chips">{TRACKS.map((m) => <button key={m.id} type="button" className={`chipbtn ${s.profile.tracks.includes(m.id) ? 'on' : ''}`} style={{ '--c': m.color } as CSSProperties} onClick={() => toggleTrack(m.id)}>{m.name}</button>)}</div>
        </div>
        <div className="set-col"><span>Tu progreso<small>Se guarda solo en este dispositivo. Exporta una copia para llevarlo a otro o como respaldo.</small></span>
          <div className="row gap wrap">
            <Key variant="ghost" size="sm" onClick={download}><Icon name="download" size={16} /> Exportar</Key>
            <Key variant="ghost" size="sm" onClick={() => file.current?.click()}><Icon name="upload" size={16} /> Importar</Key>
            <Key variant="ghost" size="sm" onClick={() => setConfirmWipe(true)}><Icon name="trash" size={16} /> Borrar todo</Key>
            <input ref={file} type="file" accept="application/json" hidden onChange={(e) => upload(e.target.files?.[0])} />
          </div>
          {msg && <p className="hint">{msg}</p>}
        </div>
      </section>

      {confirmWipe && (
        <div className="modal" onClick={() => setConfirmWipe(false)}>
          <div className="modal-card small center" onClick={(e) => e.stopPropagation()}>
            <Mascot mood="sad" size={88} />
            <h3>¿Borrar todo tu progreso?</h3>
            <p className="hint">Se eliminarán tu XP, racha, logros y calendario de repaso. No se puede deshacer.</p>
            <div className="col gap">
              <Key block onClick={() => setConfirmWipe(false)}>Cancelar</Key>
              <Key block variant="bad" onClick={() => { wipeState(); setConfirmWipe(false) }}>Sí, borrar</Key>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
