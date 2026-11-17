// Ejecución de Go, Rust y Java mediante playgrounds públicos. Requiere conexión; si ningún servicio
// responde, el resultado llega con `unavailable: true` y la interfaz pasa a modo autoevaluación.
import type { Lang } from '../content/types'
import { wrap } from './wrap'

export interface RunResult { ok: boolean; stdout: string; stderr: string; unavailable?: boolean }

const TIMEOUT = 25_000
const post = (url: string, init: RequestInit) => fetch(url, { method: 'POST', signal: AbortSignal.timeout(TIMEOUT), ...init })

async function goPlayground(code: string): Promise<RunResult> {
  let lastErr: unknown
  for (const url of ['https://go.dev/_/compile?backend=', 'https://play.golang.org/compile']) {
    try {
      const res = await post(url, { body: new URLSearchParams({ version: '2', body: code, withVet: 'true' }) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as { Errors?: string; Events?: { Message: string; Kind: string }[] }
      const events = data.Events ?? []
      return {
        ok: !data.Errors,
        stdout: events.filter((e) => e.Kind === 'stdout').map((e) => e.Message).join(''),
        stderr: (data.Errors ?? '') + events.filter((e) => e.Kind === 'stderr').map((e) => e.Message).join(''),
      }
    } catch (e) { lastErr = e }
  }
  throw lastErr
}

async function rustPlayground(code: string): Promise<RunResult> {
  const res = await post('https://play.rust-lang.org/execute', {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel: 'stable', mode: 'debug', edition: '2021', crateType: 'bin', tests: false, backtrace: false, code }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = (await res.json()) as { success: boolean; stdout: string; stderr: string }
  return { ok: data.success, stdout: data.stdout, stderr: data.success ? '' : data.stderr }
}

const WANDBOX_LANG: Partial<Record<Lang, string>> = { java: 'Java', go: 'Go', rust: 'Rust' }
let wandboxCompilers: Promise<{ name: string; language: string }[]> | undefined

async function wandbox(lang: Lang, code: string): Promise<RunResult> {
  wandboxCompilers ??= fetch('https://wandbox.org/api/list.json', { signal: AbortSignal.timeout(TIMEOUT) }).then((r) => r.json())
  const list = await wandboxCompilers.catch((e) => { wandboxCompilers = undefined; throw e })
  const compiler = list.find((c) => c.language === WANDBOX_LANG[lang] && !/head/i.test(c.name))?.name
  if (!compiler) throw new Error('compilador no disponible')
  // Wandbox guarda el código en prog.java: la clase principal no puede ser pública.
  const src = lang === 'java' ? code.replace(/public\s+(?=(final\s+)?class\s+Main\b)/, '') : code
  const res = await post('https://wandbox.org/api/compile.json', {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: src, compiler, options: '', stdin: '' }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const d = (await res.json()) as { status?: string; compiler_error?: string; program_output?: string; program_error?: string }
  const ok = d.status === '0'
  return { ok, stdout: d.program_output ?? '', stderr: ok ? '' : `${d.compiler_error ?? ''}${d.program_error ?? ''}` }
}

/** Compila y ejecuta un snippet en el lenguaje indicado, probando los servicios disponibles en orden. */
export async function runRemote(lang: Lang, snippet: string): Promise<RunResult> {
  const code = wrap(lang, snippet)
  const chain: (() => Promise<RunResult>)[] =
    lang === 'go' ? [() => goPlayground(code), () => wandbox('go', code)]
    : lang === 'rust' ? [() => rustPlayground(code), () => wandbox('rust', code)]
    : lang === 'java' ? [() => wandbox('java', code)]
    : []
  for (const attempt of chain) {
    try { return await attempt() } catch { /* probar el siguiente servicio */ }
  }
  return { ok: false, stdout: '', stderr: '', unavailable: true }
}
