// Corrección de respuestas. Lógica pura: no depende de la interfaz.
import type { Ex } from '../content/types'
import { ALT, normOut } from '../runners/wrap'

/** Normaliza texto libre: minúsculas, espacios, comillas tipográficas y puntuación final. */
export function normText(s: string): string {
  return s
    .toLowerCase()
    .replace(/[‘’`´]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.!?;]+$/, '')
    .trim()
}

/** Normalización más laxa para dictados: ignora toda la puntuación. */
export const normLoose = (s: string) => normText(s).replace(/[.,!?;:"()]/g, '').replace(/\s+/g, ' ').trim()

/** Normaliza un fragmento de código: comillas equivalentes y espacios alrededor de símbolos. */
export const normCode = (s: string) => s.trim().replace(/'/g, '"').replace(/\s+/g, ' ').replace(/\s*([(),=<>+\-*/:\[\]{}])\s*/g, '$1')

export function parseNum(s: string): number {
  const t = s.trim().toLowerCase().replace(/[\s_,]/g, '')
  const m = t.match(/^(-?\d+(?:\.\d+)?)(k|m|g|b)?$/)
  if (!m) return NaN
  const mult = { k: 1e3, m: 1e6, g: 1e9, b: 1e9 }[m[2] as 'k'] ?? 1
  return parseFloat(m[1]) * mult
}

export type Answer = number | string | string[] | boolean

export function grade(ex: Ex, answer: Answer): boolean {
  switch (ex.t) {
    case 'mc': return answer === ex.ans
    case 'bug': return answer === ex.line
    case 'predict': return normOut(String(answer)) === normOut(ex.out)
    case 'fill': {
      const given = answer as string[]
      const text = ex.lang === 'text'
      return ex.ans.every((a, i) => {
        const alts = a.split(ALT)
        const g = given[i] ?? ''
        return text ? alts.some((x) => normText(x) === normText(g)) : alts.some((x) => normCode(x) === normCode(g))
      })
    }
    case 'parsons': return sameSeq(answer as string[], ex.lines)
    case 'order': return sameSeq(answer as string[], ex.items)
    case 'ask': return ex.ans.some((a) => normText(a) === normText(String(answer)) || normCode(a.toLowerCase()) === normCode(String(answer).toLowerCase()))
    case 'num': {
      const n = typeof answer === 'number' ? answer : parseNum(String(answer))
      if (Number.isNaN(n)) return false
      return Math.abs(n - ex.ans) <= Math.abs(ex.ans) * ex.tol + 1e-9
    }
    case 'words': return normLoose((answer as string[]).join(' ')) === normLoose(ex.ans)
    case 'listen': return normLoose(String(answer)) === normLoose(ex.text)
    // match, code y git se corrigen en su propio componente y entregan un booleano.
    case 'match': case 'code': case 'git': return answer === true
  }
}

const sameSeq = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i])

/** Texto de la respuesta correcta, para mostrarlo tras un fallo. */
export function solutionText(ex: Ex): string {
  switch (ex.t) {
    case 'mc': return ex.opts[ex.ans]
    case 'bug': return `Línea ${ex.line}`
    case 'predict': return ex.out
    case 'fill': return ex.ans.map((a) => a.split(ALT)[0]).join('  ·  ')
    case 'parsons': return ex.lines.join('\n')
    case 'order': return ex.items.map((s, i) => `${i + 1}. ${s}`).join('\n')
    case 'ask': return ex.ans[0]
    case 'num': return String(ex.ans)
    case 'words': return ex.ans
    case 'listen': return ex.text
    case 'code': return ex.solution
    case 'git': return ex.solution.join('\n')
    case 'match': return ex.pairs.map(([a, b]) => `${a} → ${b}`).join('\n')
  }
}
