// Misiones diarias: tres por día, elegidas de forma determinista por fecha.
import { seeded, pick, shuffle } from './rng'

export type QuestKind = 'xp' | 'lessons' | 'perfect' | 'reviews' | 'daily' | 'combo' | 'tracks' | 'drills' | 'correct'
export interface Quest { kind: QuestKind; goal: number; progress: number; done: boolean; gems: number }

const POOL: { kind: QuestKind; goals: number[]; gems: number }[] = [
  { kind: 'xp', goals: [60, 100, 150], gems: 6 },
  { kind: 'lessons', goals: [2, 3], gems: 6 },
  { kind: 'perfect', goals: [1, 2], gems: 8 },
  { kind: 'reviews', goals: [8, 12], gems: 6 },
  { kind: 'daily', goals: [1], gems: 8 },
  { kind: 'combo', goals: [5, 8], gems: 5 },
  { kind: 'tracks', goals: [2], gems: 6 },
  { kind: 'drills', goals: [1, 2], gems: 5 },
  { kind: 'correct', goals: [15, 25], gems: 6 },
]

export const CHEST_GEMS = 15

export function questsFor(date: string): Quest[] {
  const rnd = seeded('quests:' + date)
  return shuffle(POOL, rnd).slice(0, 3).map((p) => ({ kind: p.kind, goal: pick(rnd, p.goals), progress: 0, done: false, gems: p.gems }))
}

export function questLabel(q: Quest): string {
  const n = q.goal
  switch (q.kind) {
    case 'xp': return `Gana ${n} XP`
    case 'lessons': return `Completa ${n} lecciones`
    case 'perfect': return n === 1 ? 'Logra una lección perfecta' : `Logra ${n} lecciones perfectas`
    case 'reviews': return `Repasa ${n} ejercicios`
    case 'daily': return 'Completa el reto diario'
    case 'combo': return `Consigue un combo de ${n}`
    case 'tracks': return `Practica en ${n} rutas distintas`
    case 'drills': return n === 1 ? 'Completa una ronda de gimnasio' : `Completa ${n} rondas de gimnasio`
    case 'correct': return `Acierta ${n} ejercicios a la primera`
  }
}
