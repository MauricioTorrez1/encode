import { useEffect, type ReactNode } from 'react'
import { CODE_TRACKS, loadContent } from './content'
import { rollover, setCatalog, useStore } from './engine/store'
import { levelFor } from './engine/xp'
import { go, useRoute } from './router'
import { Onboarding } from './screens/Onboarding'
import { Profile } from './screens/Profile'
import { RosettaScreen } from './screens/Rosetta'
import { Session } from './screens/Session'
import { Shop } from './screens/Shop'
import { Today } from './screens/Today'
import { TrackMap } from './screens/TrackMap'
import { Tracks } from './screens/Tracks'
import { Train } from './screens/Train'
import { Typing } from './screens/Typing'
import { Icon } from './ui/kit'

const NAV = [
  { path: '', label: 'Hoy', icon: 'home' },
  { path: 'rutas', label: 'Rutas', icon: 'map' },
  { path: 'entrenar', label: 'Entrenar', icon: 'dumbbell' },
  { path: 'tienda', label: 'Tienda', icon: 'store' },
  { path: 'perfil', label: 'Perfil', icon: 'user' },
]

export function App() {
  const route = useRoute()
  const profile = useStore((s) => s.profile)

  useEffect(() => {
    void loadContent().then((c) => setCatalog({
      tracks: Object.fromEntries(c.tracks.map((t) => [t.id, t.units.flatMap((u) => u.lessons.map((l) => l.id))])),
      codeTracks: CODE_TRACKS,
    }))
    rollover()
    const onVisible = () => { if (!document.hidden) rollover() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = profile.theme
    document.documentElement.dataset.accent = profile.accent
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', profile.theme === 'light' ? '#f4f3ee' : '#0c0e14')
  }, [profile.theme, profile.accent])

  if (!profile.onboarded) return <Onboarding />
  if (route[0] === 's') return <Session kind={route[1]} refId={route[2]} />
  if (route[0] === 'typing') return <Typing />

  let page: ReactNode
  let active = route[0] ?? ''
  switch (route[0]) {
    case undefined: page = <Today />; break
    case 'rutas': page = <Tracks />; break
    case 'ruta': page = <TrackMap id={route[1]} />; active = 'rutas'; break
    case 'entrenar': page = <Train />; break
    case 'rosetta': page = <RosettaScreen />; active = 'entrenar'; break
    case 'tienda': page = <Shop />; break
    case 'perfil': page = <Profile />; break
    default: page = <Today />; active = ''
  }
  return <Shell active={active}>{page}</Shell>
}

function Shell({ active, children }: { active: string; children: ReactNode }) {
  const xp = useStore((s) => s.xp)
  const gems = useStore((s) => s.gems)
  const streak = useStore((s) => s.streak.current)
  const lv = levelFor(xp)
  return (
    <div className="app">
      <nav className="nav" aria-label="Principal">
        <button type="button" className="logo" onClick={() => go('')} aria-label="encode, inicio">
          <span className="logo-key">{'{ }'}</span><span className="logo-text">encode</span>
        </button>
        {NAV.map((n) => (
          <button key={n.path} type="button" className={`nav-item ${active === n.path ? 'on' : ''}`} aria-current={active === n.path ? 'page' : undefined} onClick={() => go(n.path)}>
            <Icon name={n.icon} size={22} /><span>{n.label}</span>
          </button>
        ))}
      </nav>
      <div className="main">
        <header className="topbar">
          <button type="button" className="logo logo-mobile" onClick={() => go('')} aria-label="encode, inicio"><span className="logo-key">{'{ }'}</span></button>
          <div className="topbar-stats">
            <button type="button" className="tstat fire" onClick={() => go('perfil')} title="Racha"><Icon name="flame" size={20} fill /> {streak}</button>
            <button type="button" className="tstat gemc" onClick={() => go('tienda')} title="Gemas"><Icon name="gem" size={20} fill /> {gems}</button>
            <button type="button" className="tstat xpc" onClick={() => go('perfil')} title={`${lv.rank} · ${lv.into}/${lv.need} XP`}><Icon name="zap" size={20} fill /> Nv {lv.level}</button>
          </div>
        </header>
        <div className="page">{children}</div>
      </div>
    </div>
  )
}
