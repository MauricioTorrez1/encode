// Verifica el contenido con los intérpretes y compiladores reales.
//   npm run verify:content
// Ejecuta cada snippet de `predict`, `fill`/`parsons` (si declaran salida), `code`, Rosetta y katas,
// y compara la salida real con la declarada. Requiere python3, java, go y rustc en el PATH.
import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { KATAS } from '../src/content/katas'
import { CODE_LANGS, ROSETTA } from '../src/content/rosetta'
import fund from '../src/content/tracks/fund'
import git from '../src/content/tracks/git'
import go from '../src/content/tracks/go'
import ingles from '../src/content/tracks/ingles'
import java from '../src/content/tracks/java'
import python from '../src/content/tracks/python'
import redes from '../src/content/tracks/redes'
import rust from '../src/content/tracks/rust'
import sistemas from '../src/content/tracks/sistemas'
import type { Lang } from '../src/content/types'
import { PY_HARNESS, type PyResult } from '../src/runners/pyharness'
import { fillBlanks, normOut, wrap } from '../src/runners/wrap'

const RUNNABLE: Lang[] = ['python', 'java', 'go', 'rust']
interface Job { id: string; lang: Lang; code: string; expect?: string; tests?: [string, string][] }

const jobs: Job[] = []
for (const t of [fund, python, java, go, rust, git, redes, sistemas, ingles]) {
  for (const u of t.units) for (const l of u.lessons) for (const e of l.ex) {
    if (!e.lang || !RUNNABLE.includes(e.lang)) continue
    if (e.t === 'predict') jobs.push({ id: e.id, lang: e.lang, code: e.code, expect: e.out })
    if (e.t === 'fill' && e.out !== undefined) jobs.push({ id: e.id, lang: e.lang, code: fillBlanks(e.code, e.ans), expect: e.out })
    if (e.t === 'parsons' && e.out !== undefined) jobs.push({ id: e.id, lang: e.lang, code: e.lines.join('\n'), expect: e.out })
    if (e.t === 'code') jobs.push({ id: e.id, lang: e.lang, code: e.solution, expect: e.out, tests: e.tests })
  }
}
for (const r of ROSETTA) for (const l of CODE_LANGS) jobs.push({ id: `rosetta:${r.id}:${l}`, lang: l, code: r.code[l], expect: r.out })
for (const k of KATAS) jobs.push({ id: k.ex.id, lang: 'python', code: k.ex.solution, tests: k.ex.tests })

const CACHE_DIR = join(process.cwd(), '.verify-cache')
mkdirSync(CACHE_DIR, { recursive: true })
const ENV = { ...process.env, JAVA_TOOL_OPTIONS: `${process.env.JAVA_TOOL_OPTIONS ?? ''} -Dstdout.encoding=UTF-8 -Dfile.encoding=UTF-8`, PYTHONIOENCODING: 'utf-8' }

function sh(cmd: string, args: string[], cwd: string, input?: string): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve) => {
    const child = execFile(cmd, args, { cwd, env: ENV, timeout: 120_000, maxBuffer: 4 << 20 }, (err, stdout, stderr) => {
      resolve({ stdout, stderr, code: err ? ((err as { code?: number }).code ?? 1) : 0 })
    })
    if (input !== undefined) child.stdin?.end(input)
  })
}

/** Ejecuta un trabajo y devuelve un mensaje de error, o '' si pasa. */
async function run(job: Job): Promise<string> {
  const key = createHash('sha1').update(JSON.stringify(job)).digest('hex')
  const cacheFile = join(CACHE_DIR, key)
  if (existsSync(cacheFile)) return readFileSync(cacheFile, 'utf8')
  const dir = mkdtempSync(join(tmpdir(), 'encode-verify-'))
  let problem = ''
  try {
    const src = wrap(job.lang, job.code)
    let res: { stdout: string; stderr: string; code: number }
    if (job.lang === 'python' && job.tests) {
      const driver = `${PY_HARNESS}\nimport sys, json\njob = json.load(sys.stdin)\nprint(__encode_run(job["code"], job["tests"]))`
      res = await sh('python3', ['-c', driver], dir, JSON.stringify({ code: src, tests: job.tests }))
      const r = JSON.parse(res.stdout) as PyResult
      if (r.error) problem = `error: ${r.error}`
      else {
        const bad = r.tests.filter((t) => !t.ok)
        if (bad.length) problem = bad.map((t) => `${t.expr} → esperado ${t.exp}, obtuvo ${t.got}`).join('; ')
      }
    } else {
      if (job.lang === 'python') { writeFileSync(join(dir, 'main.py'), src); res = await sh('python3', ['main.py'], dir) }
      else if (job.lang === 'java') { writeFileSync(join(dir, 'Main.java'), src); res = await sh('java', ['Main.java'], dir) }
      else if (job.lang === 'go') { writeFileSync(join(dir, 'main.go'), src); res = await sh('go', ['run', 'main.go'], dir) }
      else {
        writeFileSync(join(dir, 'main.rs'), src)
        res = await sh('rustc', ['--edition', '2021', '-o', 'main', 'main.rs'], dir)
        if (res.code === 0) res = await sh(join(dir, 'main'), [], dir)
      }
      if (res.code !== 0) problem = `falló (código ${res.code}): ${res.stderr.split('\n').filter((l) => !l.startsWith('Picked up')).slice(0, 12).join('\n')}`
      else if (job.expect !== undefined && normOut(res.stdout) !== normOut(job.expect)) problem = `salida distinta.\n   esperada: ${JSON.stringify(normOut(job.expect))}\n   real:     ${JSON.stringify(normOut(res.stdout))}`
    }
  } catch (e) {
    problem = `excepción del verificador: ${(e as Error).message}`
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
  if (!problem) writeFileSync(cacheFile, '')
  return problem
}

async function pool<T, R>(items: T[], size: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length)
  let next = 0
  await Promise.all(Array.from({ length: size }, async () => {
    while (next < items.length) { const i = next++; out[i] = await fn(items[i]) }
  }))
  return out
}

describe('contenido verificado con toolchains reales', () => {
  for (const lang of RUNNABLE) {
    const mine = jobs.filter((j) => j.lang === lang)
    it(`${lang}: ${mine.length} snippets`, async () => {
      const results = await pool(mine, 6, run)
      const failures = mine.map((j, i) => (results[i] ? `• ${j.id}: ${results[i]}` : '')).filter(Boolean)
      if (failures.length) console.error(`\n${lang}: ${failures.length} fallos\n${failures.join('\n')}\n`)
      expect(failures).toEqual([])
    })
  }
})
