// Registro de rutas y carga diferida del contenido.
import { useSyncExternalStore } from 'react'
import type { Ex, Lesson, Track, TrackMeta, Unit } from './types'

export const TRACKS: TrackMeta[] = [
  { id: 'fund', name: 'Fundamentos', tagline: 'Lo que todo programador debe saber', glyph: '01', color: '#ffc83d' },
  { id: 'python', name: 'Python', tagline: 'De print() a asyncio', glyph: 'Py', color: '#5aa9ff', lang: 'python' },
  { id: 'java', name: 'Java', tagline: 'De la sintaxis a la JVM', glyph: 'Jv', color: '#ff8a5c', lang: 'java' },
  { id: 'go', name: 'Go', tagline: 'Simple, concurrente, rápido', glyph: 'Go', color: '#4fd8e8', lang: 'go' },
  { id: 'rust', name: 'Rust', tagline: 'Seguridad sin recolector', glyph: 'Rs', color: '#f0a070', lang: 'rust' },
  { id: 'git', name: 'Git', tagline: 'Control de versiones sin miedo', glyph: 'git', color: '#ff6b5e' },
  { id: 'redes', name: 'Redes', tagline: 'Cómo viajan tus paquetes', glyph: 'IP', color: '#b79bff' },
  { id: 'sistemas', name: 'Diseño de sistemas', tagline: 'Arquitecturas que escalan', glyph: 'Sys', color: '#5fe0a8' },
  { id: 'ingles', name: 'Inglés', tagline: 'English for developers, A1 → C1', glyph: 'En', color: '#ff86c8' },
]

export const CODE_TRACKS = ['python', 'java', 'go', 'rust']
export const trackMeta = (id: string) => TRACKS.find((t) => t.id === id)!

const LOADERS: Record<string, () => Promise<{ default: Track }>> = {
  fund: () => import('./tracks/fund'),
  python: () => import('./tracks/python'),
  java: () => import('./tracks/java'),
  go: () => import('./tracks/go'),
  rust: () => import('./tracks/rust'),
  git: () => import('./tracks/git'),
  redes: () => import('./tracks/redes'),
  sistemas: () => import('./tracks/sistemas'),
  ingles: () => import('./tracks/ingles'),
}

export interface Content {
  tracks: Track[]
  track: Map<string, Track>
  units: Map<string, Unit>
  lessons: Map<string, Lesson>
  /** Ejercicio por id, con la lección a la que pertenece. */
  ex: Map<string, { ex: Ex; lesson: Lesson }>
}

export function indexContent(tracks: Track[]): Content {
  const c: Content = { tracks, track: new Map(), units: new Map(), lessons: new Map(), ex: new Map() }
  for (const t of tracks) {
    c.track.set(t.id, t)
    for (const u of t.units) {
      c.units.set(u.id, u)
      for (const l of u.lessons) {
        c.lessons.set(l.id, l)
        for (const e of l.ex) c.ex.set(e.id, { ex: e, lesson: l })
      }
    }
  }
  return c
}

let content: Content | null = null
let loading: Promise<Content> | undefined
const listeners = new Set<() => void>()

export function loadContent(): Promise<Content> {
  loading ??= Promise.all(TRACKS.map((t) => LOADERS[t.id]().then((m) => m.default))).then((tracks) => {
    content = indexContent(tracks)
    listeners.forEach((l) => l())
    return content
  })
  return loading
}

export function useContent(): Content | null {
  return useSyncExternalStore((l) => { listeners.add(l); return () => { listeners.delete(l) } }, () => content, () => content)
}
