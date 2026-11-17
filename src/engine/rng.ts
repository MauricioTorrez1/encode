// Aleatoriedad determinista (mismo reto diario para la misma fecha).
export type Rnd = () => number

export function hashStr(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}

export function mulberry32(seed: number): Rnd {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const seeded = (s: string): Rnd => mulberry32(hashStr(s))
export const int = (rnd: Rnd, min: number, max: number) => min + Math.floor(rnd() * (max - min + 1))
export const pick = <T>(rnd: Rnd, arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)]

export function shuffle<T>(arr: readonly T[], rnd: Rnd = Math.random): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const sample = <T>(arr: readonly T[], n: number, rnd: Rnd = Math.random): T[] => shuffle(arr, rnd).slice(0, n)
