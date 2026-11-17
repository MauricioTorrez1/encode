// Copia el runtime de Pyodide desde node_modules a public/pyodide para servirlo
// desde el mismo origen (funciona sin conexión y sin depender de un CDN).
import { cpSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'node_modules', 'pyodide')
const dst = join(root, 'public', 'pyodide')
const files = ['pyodide.mjs', 'pyodide.asm.mjs', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json']

if (!existsSync(src)) {
  console.warn('[copy-pyodide] pyodide no está instalado; se omite.')
  process.exit(0)
}
mkdirSync(dst, { recursive: true })
for (const f of files) cpSync(join(src, f), join(dst, f))
console.log('[copy-pyodide] runtime copiado a public/pyodide')
