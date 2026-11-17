// DSL compacto para escribir contenido. Las funciones devuelven ejercicios sin `id`;
// `track()` asigna ids estables (`<lessonId>#<n>`) y el lenguaje por defecto de la ruta.
import type { GitSim } from '../git/engine'
import type {
  AskEx, BugEx, CodeEx, Ex, FillEx, GitEx, Lang, Lesson, Level, ListenEx, MatchEx, McEx, NumEx,
  OrderEx, ParsonsEx, PredictEx, Track, Unit, WordsEx,
} from './types'

type Draft<T> = Omit<T, 'id'> & { id?: string }
type AnyDraft = Draft<Ex>

/** Quita la sangría común y los saltos de línea de los extremos de un template literal. */
export function dedent(s: string): string {
  const lines = s.replace(/\t/g, '    ').split('\n')
  while (lines.length && !lines[0].trim()) lines.shift()
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop()
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length))
  return lines.map((l) => l.slice(Number.isFinite(indent) ? indent : 0)).join('\n')
}

/** Opción múltiple: la PRIMERA opción es la correcta (se barajan al mostrarse). */
export const mc = (q: string, opts: string[], why?: string, code?: string): Draft<McEx> => ({
  t: 'mc', q, opts, ans: 0, why, code: code ? dedent(code) : undefined,
})

/** Verdadero / falso. */
export const tf = (q: string, ans: boolean, why?: string): Draft<McEx> => ({
  t: 'mc', q, opts: ['Verdadero', 'Falso'], ans: ans ? 0 : 1, why, fixed: true,
})

export const predict = (code: string, out: string, why?: string, q = '¿Qué imprime este programa?'): Draft<PredictEx> => ({
  t: 'predict', q, code: dedent(code), out: dedent(out), why,
})

export const fill = (code: string, ans: string[], why?: string, out?: string, q = 'Completa el código'): Draft<FillEx> => ({
  t: 'fill', q, code: dedent(code), ans, why, out: out === undefined ? undefined : dedent(out),
})

/** Hueco en una frase (inglés u otro texto). */
export const gap = (text: string, ans: string[], why?: string, q = 'Completa la frase'): Draft<FillEx> => ({
  t: 'fill', q, code: text, ans, why, lang: 'text',
})

export const parsons = (q: string, code: string, why?: string, out?: string): Draft<ParsonsEx> => ({
  t: 'parsons', q, lines: dedent(code).split('\n'), why, out: out === undefined ? undefined : dedent(out),
})

export const bug = (code: string, line: number, why: string, q = 'Toca la línea que contiene el error'): Draft<BugEx> => ({
  t: 'bug', q, code: dedent(code), line, why,
})

export const match = (q: string, pairs: [string, string][], why?: string): Draft<MatchEx> => ({ t: 'match', q, pairs, why })

export const order = (q: string, items: string[], why?: string): Draft<OrderEx> => ({ t: 'order', q, items, why })

export const ask = (q: string, ans: string | string[], why?: string, code?: string): Draft<AskEx> => ({
  t: 'ask', q, ans: Array.isArray(ans) ? ans : [ans], why, code: code ? dedent(code) : undefined,
})

export const num = (q: string, ans: number, why?: string, tol = 0): Draft<NumEx> => ({ t: 'num', q, ans, why, tol })

/** Escribir código. 4.º argumento: tests de Python `[expr, esperado][]` o stdout esperado (string). */
export const code = (
  q: string, starter: string, solution: string, check: [string, string][] | string, why?: string,
): Draft<CodeEx> => ({
  t: 'code', q, starter: dedent(starter), solution: dedent(solution), why,
  ...(typeof check === 'string' ? { out: dedent(check) } : { tests: check }),
})

export const git = (
  q: string, setup: string[], solution: string[], check: (g: GitSim) => boolean, hint?: string, why?: string,
): Draft<GitEx> => ({ t: 'git', q, setup, solution, check, hint, why })

export const words = (q: string, ans: string, extra: string[] = [], why?: string): Draft<WordsEx> => ({
  t: 'words', q, ans, extra, why, lang: 'text',
})

export const listen = (text: string, es?: string): Draft<ListenEx> => ({
  t: 'listen', q: 'Escribe lo que escuchas', text, es, lang: 'text',
})

/** Cambia el lenguaje de un ejercicio concreto (útil en rutas sin lenguaje por defecto). */
export const as = <T extends AnyDraft>(lang: Lang, ex: T): T => ({ ...ex, lang })

interface LessonDraft { id: string; title: string; theory: string; ex: AnyDraft[] }
interface UnitDraft { id: string; title: string; level: Level; desc: string; lessons: LessonDraft[] }

export const lesson = (id: string, title: string, theory: string, ex: AnyDraft[]): LessonDraft => ({
  id, title, theory: dedent(theory), ex,
})

export const unit = (id: string, title: string, level: Level, desc: string, lessons: LessonDraft[]): UnitDraft => ({
  id, title, level, desc, lessons,
})

export function track(id: string, lang: Lang | undefined, units: UnitDraft[]): Track {
  return {
    id,
    units: units.map((u): Unit => ({
      id: u.id, title: u.title, level: u.level, desc: u.desc, trackId: id,
      lessons: u.lessons.map((l): Lesson => ({
        id: l.id, title: l.title, theory: l.theory, unitId: u.id, trackId: id,
        ex: l.ex.map((e, i) => ({ ...e, id: `${l.id}#${i + 1}`, lang: e.lang ?? lang }) as Ex),
      })),
    })),
  }
}
