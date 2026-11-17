// Convierte un snippet corto en un programa completo y ejecutable.
// Lo comparten los runners del navegador y el verificador de contenido.
import type { Lang } from '../content/types'

const GO_IMPORTS: Record<string, string> = {
  fmt: 'fmt', strings: 'strings', strconv: 'strconv', sort: 'sort', errors: 'errors', time: 'time',
  sync: 'sync', os: 'os', math: 'math', context: 'context', slices: 'slices', maps: 'maps',
  bytes: 'bytes', unicode: 'unicode', atomic: 'sync/atomic', json: 'encoding/json', http: 'net/http',
  io: 'io', bufio: 'bufio', regexp: 'regexp', utf8: 'unicode/utf8', cmp: 'cmp', httptest: 'net/http/httptest',
}

/** Quita strings y comentarios para detectar identificadores sin falsos positivos. */
function stripLiterals(code: string): string {
  return code
    .replace(/\/\/.*$/gm, '')
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/`[^`]*`/g, '``')
}

export function wrapGo(code: string): string {
  if (/^\s*package\s+main/m.test(code)) return code
  const bare = stripLiterals(code)
  const imports = Object.keys(GO_IMPORTS).filter((pkg) => new RegExp(`(^|[^\\w.])${pkg}\\.`).test(bare))
  const head = `package main\n\n${imports.length ? `import (\n${imports.map((p) => `\t"${GO_IMPORTS[p]}"`).join('\n')}\n)\n\n` : ''}`
  if (/^func\s+main\s*\(/m.test(code)) return head + code + '\n'
  return `${head}func main() {\n${indent(code, '\t')}\n}\n`
}

export function wrapRust(code: string): string {
  const prelude = '#![allow(unused, dead_code)]\n'
  if (/\bfn\s+main\s*\(/.test(code)) return prelude + code + '\n'
  return `${prelude}fn main() {\n${indent(code, '    ')}\n}\n`
}

const JAVA_IMPORTS = 'import java.util.*;\nimport java.util.function.*;\nimport java.util.stream.*;\nimport java.util.concurrent.*;\nimport java.util.concurrent.atomic.*;\n\n'

export function wrapJava(code: string): string {
  const head = /^\s*import\s/m.test(code) ? '' : JAVA_IMPORTS
  if (/\bclass\s+Main\b/.test(code)) return head + code + '\n'
  return `${head}public class Main {\n    public static void main(String[] args) throws Exception {\n${indent(code, '        ')}\n    }\n}\n`
}

export function wrap(lang: Lang | undefined, code: string): string {
  switch (lang) {
    case 'go': return wrapGo(code)
    case 'rust': return wrapRust(code)
    case 'java': return wrapJava(code)
    default: return code
  }
}

function indent(code: string, pad: string): string {
  return code.split('\n').map((l) => (l.trim() ? pad + l : l)).join('\n')
}

/** Normaliza una salida de programa para compararla: finales de línea y espacios finales. */
export function normOut(s: string): string {
  return s.replace(/\r\n/g, '\n').split('\n').map((l) => l.replace(/\s+$/, '')).join('\n').trim()
}

/** Separador de respuestas alternativas en un hueco. */
export const ALT = '~~'

/** Sustituye los huecos `___` por la primera alternativa de cada respuesta. */
export function fillBlanks(code: string, ans: string[]): string {
  let i = 0
  return code.replace(/___/g, () => (ans[i++] ?? '').split(ALT)[0])
}
