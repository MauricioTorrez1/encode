// Repaso espaciado, variante simplificada de SM-2.
export interface Card {
  /** intervalo en días */ i: number
  /** facilidad */ e: number
  /** día absoluto en que vence */ d: number
  /** aciertos seguidos */ r: number
  /** fallos acumulados */ l: number
}

export function review(card: Card | undefined, correct: boolean, today: number): Card {
  const c: Card = card ? { ...card } : { i: 0, e: 2.3, d: today, r: 0, l: 0 }
  if (correct) {
    c.r += 1
    c.i = c.r === 1 ? 1 : c.r === 2 ? 3 : Math.max(c.i + 1, Math.round(c.i * c.e))
    c.e = Math.min(2.8, c.e + 0.05)
  } else {
    c.r = 0
    c.l += 1
    c.i = 1
    c.e = Math.max(1.3, c.e - 0.2)
  }
  c.d = today + c.i
  return c
}

/** Ids que vencen hoy o antes, primero los más atrasados y los más fallados. */
export function dueIds(srs: Record<string, Card>, today: number): string[] {
  return Object.entries(srs)
    .filter(([, c]) => c.d <= today)
    .sort(([, a], [, b]) => a.d - b.d || b.l - a.l)
    .map(([id]) => id)
}

/** Retención estimada: proporción de tarjetas con intervalo ≥ 7 días. */
export function matureRatio(srs: Record<string, Card>): number {
  const cards = Object.values(srs)
  return cards.length ? cards.filter((c) => c.i >= 7).length / cards.length : 0
}
