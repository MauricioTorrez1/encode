// Construcción de sesiones: lección, jefe, repaso, reto diario y gimnasio.
import type { Content } from '../content'
import type { Ex, ExType, Lesson, Unit } from '../content/types'
import { dayNum, today } from './dates'
import { DRILLS } from './drills'
import { lessonUnlocked } from './progress'
import { sample, seeded, shuffle, type Rnd } from './rng'
import { dueIds } from './srs'
import type { State } from './store'

export interface Item { ex: Ex; trackId?: string; lessonTitle?: string }

export const REVIEW_SIZE = 12
export const BOSS_SIZE = 10
export const DAILY_SIZE = 8
export const DRILL_SIZE = 10

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window

const usable = (e: Ex, exclude: ExType[] = []) => !exclude.includes(e.t) && (e.t !== 'listen' || canSpeak())
const item = (ex: Ex, l: Lesson): Item => ({ ex, trackId: l.trackId, lessonTitle: l.title })

export function lessonItems(l: Lesson): Item[] {
  return l.ex.filter((e) => usable(e)).map((e) => item(e, l))
}

/** Jefe de unidad: muestra aleatoria de la unidad, sin ejercicios largos. */
export function bossItems(u: Unit, rnd: Rnd = Math.random): Item[] {
  const pool = u.lessons.flatMap((l) => l.ex.filter((e) => usable(e, ['code', 'git', 'listen', 'match'])).map((e) => item(e, l)))
  return sample(pool, BOSS_SIZE, rnd)
}

/** Repaso: lo que vence hoy según el calendario espaciado, intercalando rutas. */
export function reviewItems(s: State, c: Content, rnd: Rnd = Math.random): Item[] {
  const due = dueIds(s.srs, dayNum())
    .map((id) => c.ex.get(id))
    .filter((x): x is NonNullable<typeof x> => !!x && usable(x.ex, ['code', 'git']))
    .slice(0, REVIEW_SIZE)
  return shuffle(due.map((x) => item(x.ex, x.lesson)), rnd)
}

export function dueCount(s: State, c: Content | null): number {
  if (!c) return 0
  return dueIds(s.srs, dayNum()).filter((id) => c.ex.has(id)).length
}

/** Práctica libre cuando no hay nada que repasar: prioriza lo más fallado y lo ya estudiado. */
export function freePracticeItems(s: State, c: Content, rnd: Rnd = Math.random): Item[] {
  const seen = Object.entries(s.srs)
    .sort(([, a], [, b]) => b.l - a.l || a.i - b.i)
    .map(([id]) => c.ex.get(id))
    .filter((x): x is NonNullable<typeof x> => !!x && usable(x.ex, ['code', 'git']))
  return shuffle(seen.slice(0, REVIEW_SIZE * 2), rnd).slice(0, REVIEW_SIZE).map((x) => item(x.ex, x.lesson))
}

/** Reto diario: determinista por fecha. Mezcla lo ya estudiado, lo siguiente del roadmap y drills. */
export function dailyItems(s: State, c: Content, date = today()): Item[] {
  const rnd = seeded('daily:' + date)
  const chosen = s.profile.tracks.length ? s.profile.tracks : c.tracks.map((t) => t.id)
  const skip: ExType[] = ['code', 'git', 'listen', 'match']
  const pool: Item[] = []
  for (const t of c.tracks) {
    if (!chosen.includes(t.id)) continue
    t.units.forEach((u, ui) => u.lessons.forEach((l, li) => {
      const studied = (s.lessons[l.id]?.done ?? 0) > 0
      if (studied || lessonUnlocked(s, t, ui, li)) pool.push(...l.ex.filter((e) => usable(e, skip)).map((e) => item(e, l)))
    }))
  }
  // Reparto equilibrado entre rutas: se baraja y se toma por turnos.
  const byTrack = new Map<string, Item[]>()
  for (const it of shuffle(pool, rnd)) byTrack.set(it.trackId!, [...(byTrack.get(it.trackId!) ?? []), it])
  const picked: Item[] = []
  const queues = shuffle([...byTrack.values()], rnd)
  const fromContent = DAILY_SIZE - 2
  for (let i = 0; picked.length < fromContent && queues.some((q) => q.length); i++) {
    const q = queues[i % queues.length]
    if (q.length) picked.push(q.shift()!)
  }
  const drills = sample(DRILLS, 2 + (fromContent - picked.length), rnd).map((d, i) => ({ ex: d.gen(rnd, `drill:daily:${i}`) }))
  return shuffle([...picked, ...drills], rnd)
}

export function drillItems(drillId: string, rnd: Rnd = Math.random): Item[] {
  const d = DRILLS.find((x) => x.id === drillId)
  if (!d) return []
  const out: Item[] = []
  const seen = new Set<string>()
  for (let guard = 0; out.length < DRILL_SIZE && guard < 200; guard++) {
    const ex = d.gen(rnd, `drill:${drillId}:${out.length}`)
    const key = ex.q + ('code' in ex ? ex.code ?? '' : '')
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ ex })
  }
  return out
}
