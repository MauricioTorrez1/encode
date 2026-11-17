// Cliente del worker de Python: carga perezosa, cola de ejecución y límite de tiempo.
import type { PyResult } from './pyharness'

const RUN_TIMEOUT = 6000
const LOAD_TIMEOUT = 90_000

let worker: Worker | undefined
let ready: Promise<void> | undefined
let seq = 0

function boot(): Promise<void> {
  if (ready) return ready
  ready = new Promise<void>((resolve, reject) => {
    worker = new Worker(new URL('./py.worker.ts', import.meta.url), { type: 'module' })
    const timer = setTimeout(() => { kill(); reject(new Error('Python tardó demasiado en cargar. Revisa tu conexión e inténtalo de nuevo.')) }, LOAD_TIMEOUT)
    const onMsg = (e: MessageEvent) => {
      if (e.data.type === 'ready') { clearTimeout(timer); worker!.removeEventListener('message', onMsg); resolve() }
      if (e.data.type === 'error' && e.data.id === undefined) { clearTimeout(timer); kill(); reject(new Error(`No se pudo cargar Python: ${e.data.error}`)) }
    }
    worker.addEventListener('message', onMsg)
    worker.addEventListener('error', () => { clearTimeout(timer); kill(); reject(new Error('No se pudo iniciar el intérprete de Python.')) })
    worker.postMessage({ type: 'init', base: new URL('.', document.baseURI).href })
  })
  return ready
}

function kill() { worker?.terminate(); worker = undefined; ready = undefined }

/** Empieza a cargar Python en segundo plano (p. ej. al abrir una lección de Python). */
export function warmPython() { boot().catch(() => {}) }

export async function runPython(code: string, tests: [string, string][] = []): Promise<PyResult> {
  await boot()
  const id = ++seq
  return new Promise<PyResult>((resolve) => {
    const w = worker!
    const timer = setTimeout(() => {
      w.removeEventListener('message', onMsg)
      kill()
      resolve({ stdout: '', tests: [], error: 'Tiempo agotado: ¿hay un bucle infinito? El intérprete se reinició.' })
    }, RUN_TIMEOUT)
    const onMsg = (e: MessageEvent) => {
      if (e.data.id !== id) return
      clearTimeout(timer)
      w.removeEventListener('message', onMsg)
      resolve(e.data.type === 'result' ? e.data.result : { stdout: '', tests: [], error: e.data.error })
    }
    w.addEventListener('message', onMsg)
    w.postMessage({ type: 'run', id, code, tests })
  })
}
