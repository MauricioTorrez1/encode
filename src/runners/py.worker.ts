/// <reference lib="webworker" />
// Web Worker que ejecuta Python con Pyodide (WebAssembly) servido desde la propia app.
import { PY_HARNESS } from './pyharness'

interface Pyodide { runPython(code: string): unknown; globals: { get(name: string): (code: string, tests: unknown) => string }; toPy(v: unknown): unknown }
let pyodide: Pyodide | undefined

self.onmessage = async (e: MessageEvent) => {
  const msg = e.data as { type: 'init'; base: string } | { type: 'run'; id: number; code: string; tests: [string, string][] }
  try {
    if (msg.type === 'init') {
      const mod = await import(/* @vite-ignore */ `${msg.base}pyodide/pyodide.mjs`)
      pyodide = (await mod.loadPyodide({ indexURL: `${msg.base}pyodide/` })) as Pyodide
      pyodide.runPython(PY_HARNESS)
      self.postMessage({ type: 'ready' })
      return
    }
    if (!pyodide) throw new Error('Python aún no está listo')
    const run = pyodide.globals.get('__encode_run')
    self.postMessage({ type: 'result', id: msg.id, result: JSON.parse(run(msg.code, pyodide.toPy(msg.tests))) })
  } catch (err) {
    self.postMessage({ type: 'error', id: (msg as { id?: number }).id, error: String((err as Error)?.message ?? err) })
  }
}
