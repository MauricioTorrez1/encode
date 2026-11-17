import type { GitSim } from '../git/engine'

export type Lang = 'python' | 'java' | 'go' | 'rust' | 'bash' | 'sql' | 'text' | 'json' | 'http' | 'yaml'
export type Level = 'basico' | 'intermedio' | 'avanzado' | 'experto'

interface Base {
  /** Asignado al ensamblar la ruta: `<lessonId>#<n>`. */
  id: string
  q: string
  lang?: Lang
  /** Explicación mostrada tras responder. */
  why?: string
}

/** Opción múltiple. `ans` es el índice correcto dentro de `opts`. */
export interface McEx extends Base { t: 'mc'; opts: string[]; ans: number; code?: string; fixed?: boolean; codeOpts?: boolean; optLang?: Lang }
/** Predecir la salida exacta de un programa. */
export interface PredictEx extends Base { t: 'predict'; code: string; out: string }
/** Completar huecos `___`. Cada respuesta admite alternativas separadas por `~~`. */
export interface FillEx extends Base { t: 'fill'; code: string; ans: string[]; out?: string }
/** Ordenar líneas de código. `lines` está en el orden correcto. */
export interface ParsonsEx extends Base { t: 'parsons'; lines: string[]; out?: string }
/** Encontrar la línea con el error (1-based). */
export interface BugEx extends Base { t: 'bug'; code: string; line: number }
export interface MatchEx extends Base { t: 'match'; pairs: [string, string][] }
/** Ordenar pasos. `items` está en el orden correcto. */
export interface OrderEx extends Base { t: 'order'; items: string[] }
/** Respuesta corta escrita. */
export interface AskEx extends Base { t: 'ask'; ans: string[]; code?: string }
/** Respuesta numérica con tolerancia relativa. */
export interface NumEx extends Base { t: 'num'; ans: number; tol: number }
/** Escribir código. `tests` (Python) son pares [expresión, valor esperado]; `out` es stdout esperado. */
export interface CodeEx extends Base { t: 'code'; starter: string; solution: string; tests?: [string, string][]; out?: string }
/** Reto en el simulador de git. */
export interface GitEx extends Base { t: 'git'; setup: string[]; solution: string[]; check: (g: GitSim) => boolean; hint?: string }
/** Construir una frase con banco de palabras. */
export interface WordsEx extends Base { t: 'words'; ans: string; extra: string[] }
/** Dictado con voz sintetizada. */
export interface ListenEx extends Base { t: 'listen'; text: string; es?: string }

export type Ex =
  | McEx | PredictEx | FillEx | ParsonsEx | BugEx | MatchEx | OrderEx
  | AskEx | NumEx | CodeEx | GitEx | WordsEx | ListenEx

export type ExType = Ex['t']

export interface Lesson {
  id: string
  title: string
  /** Tarjeta de concepto en markdown ligero. */
  theory: string
  ex: Ex[]
  unitId: string
  trackId: string
}

export interface Unit {
  id: string
  title: string
  level: Level
  desc: string
  lessons: Lesson[]
  trackId: string
}

export interface Track {
  id: string
  units: Unit[]
}

export interface TrackMeta {
  id: string
  name: string
  tagline: string
  /** Texto corto dentro de la tecla de la ruta. */
  glyph: string
  color: string
  lang?: Lang
}

export const LEVEL_LABEL: Record<Level, string> = {
  basico: 'Básico',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
  experto: 'Experto',
}
