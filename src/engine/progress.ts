// Desbloqueo y progreso sobre el roadmap.
import type { Lesson, Track, Unit } from '../content/types'
import type { State } from './store'

const done = (s: State, id: string) => (s.lessons[id]?.done ?? 0) > 0

export const unitDone = (s: State, u: Unit) => u.lessons.every((l) => done(s, l.id))
/** Una unidad queda superada al completar sus lecciones o al aprobar su jefe (saltar unidad). */
export const unitCleared = (s: State, u: Unit) => unitDone(s, u) || !!s.bosses[u.id]?.passed

export function unitUnlocked(s: State, t: Track, index: number): boolean {
  if (s.profile.freeMode) return true
  return t.units.slice(0, index).every((u) => unitCleared(s, u))
}

export function lessonUnlocked(s: State, t: Track, unitIndex: number, lessonIndex: number): boolean {
  if (!unitUnlocked(s, t, unitIndex)) return false
  const u = t.units[unitIndex]
  if (lessonIndex === 0 || s.profile.freeMode || s.bosses[u.id]?.passed) return true
  return done(s, u.lessons[lessonIndex - 1].id)
}

/** Primera lección desbloqueada y sin completar de la ruta. */
export function nextLesson(s: State, t: Track): Lesson | undefined {
  for (let ui = 0; ui < t.units.length; ui++) {
    for (let li = 0; li < t.units[ui].lessons.length; li++) {
      const l = t.units[ui].lessons[li]
      if (!done(s, l.id) && lessonUnlocked(s, t, ui, li)) return l
    }
  }
  return undefined
}

export function trackProgress(s: State, t: Track) {
  const lessons = t.units.flatMap((u) => u.lessons)
  const doneCount = lessons.filter((l) => done(s, l.id)).length
  const stars = lessons.reduce((n, l) => n + (s.lessons[l.id]?.stars ?? 0), 0)
  return { done: doneCount, total: lessons.length, ratio: lessons.length ? doneCount / lessons.length : 0, stars, maxStars: lessons.length * 3 }
}
