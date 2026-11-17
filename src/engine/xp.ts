// Curva de niveles y rangos.
export const RANKS: [number, string][] = [
  [1, 'Novato'], [3, 'Aprendiz'], [6, 'Junior'], [10, 'Developer'], [15, 'Senior'],
  [20, 'Staff'], [26, 'Principal'], [33, 'Arquitecto'], [40, 'Leyenda'],
]

/** XP necesario para pasar del nivel `level` al siguiente. */
export const xpToNext = (level: number) => 100 + (level - 1) * 40

export interface LevelInfo { level: number; into: number; need: number; rank: string; nextRank?: [number, string] }

export function levelFor(xp: number): LevelInfo {
  let level = 1
  let rest = Math.max(0, Math.floor(xp))
  while (rest >= xpToNext(level)) { rest -= xpToNext(level); level++ }
  const rank = [...RANKS].reverse().find(([min]) => level >= min)![1]
  return { level, into: rest, need: xpToNext(level), rank, nextRank: RANKS.find(([min]) => min > level) }
}
