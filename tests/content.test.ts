// Validación estructural de todo el contenido y de los retos del simulador de git.
import { describe, expect, it } from 'vitest'
import { KATAS } from '../src/content/katas'
import { indexContent } from '../src/content'
import fund from '../src/content/tracks/fund'
import git from '../src/content/tracks/git'
import go from '../src/content/tracks/go'
import ingles from '../src/content/tracks/ingles'
import java from '../src/content/tracks/java'
import python from '../src/content/tracks/python'
import redes from '../src/content/tracks/redes'
import rust from '../src/content/tracks/rust'
import sistemas from '../src/content/tracks/sistemas'
import type { Ex } from '../src/content/types'
import { scenario } from '../src/git/engine'
import { ALT } from '../src/runners/wrap'

const tracks = [fund, python, java, go, rust, git, redes, sistemas, ingles]
const content = indexContent(tracks)
const all = [...content.ex.values()]

describe('estructura del contenido', () => {
  it('ids únicos y lecciones con ejercicios suficientes', () => {
    expect(content.ex.size).toBe(tracks.flatMap((t) => t.units.flatMap((u) => u.lessons.flatMap((l) => l.ex))).length)
    for (const l of content.lessons.values()) {
      expect(l.ex.length, l.id).toBeGreaterThanOrEqual(5)
      expect(l.theory.length, l.id).toBeGreaterThan(80)
    }
    expect(new Set([...content.lessons.keys()]).size).toBe(content.lessons.size)
    expect(new Set([...content.units.keys()]).size).toBe(content.units.size)
  })

  for (const { ex, lesson } of all) {
    it(`${ex.id} es válido`, () => validate(ex, lesson.title))
  }

  it('las katas tienen tests y solución', () => {
    for (const k of KATAS) {
      expect(k.ex.tests?.length, k.id).toBeGreaterThanOrEqual(2)
      expect(k.ex.solution).toContain('def ')
    }
  })
})

function validate(ex: Ex, where: string) {
  const ctx = `${ex.id} (${where})`
  expect(ex.q.trim().length, ctx).toBeGreaterThan(3)
  switch (ex.t) {
    case 'mc':
      expect(ex.opts.length, ctx).toBeGreaterThanOrEqual(2)
      expect(new Set(ex.opts).size, `${ctx}: opciones repetidas`).toBe(ex.opts.length)
      expect(ex.ans, ctx).toBeLessThan(ex.opts.length)
      break
    case 'fill': {
      const blanks = (ex.code.match(/___/g) ?? []).length
      expect(blanks, `${ctx}: huecos`).toBeGreaterThan(0)
      expect(blanks, `${ctx}: huecos vs respuestas`).toBe(ex.ans.length)
      for (const a of ex.ans) expect(a.split(ALT).every((x) => x.length > 0), ctx).toBe(true)
      break
    }
    case 'predict': expect(ex.out.trim().length, ctx).toBeGreaterThan(0); break
    case 'parsons': expect(ex.lines.length, ctx).toBeGreaterThanOrEqual(3); break
    case 'order': expect(ex.items.length, ctx).toBeGreaterThanOrEqual(3); break
    case 'bug': expect(ex.line, ctx).toBeGreaterThan(0); expect(ex.line, ctx).toBeLessThanOrEqual(ex.code.split('\n').length); break
    case 'match': expect(ex.pairs.length, ctx).toBeGreaterThanOrEqual(2); expect(new Set(ex.pairs.map((p) => p[1])).size, `${ctx}: definiciones repetidas`).toBe(ex.pairs.length); break
    case 'num': expect(Number.isFinite(ex.ans), ctx).toBe(true); break
    case 'words': expect(ex.ans.split(' ').length, ctx).toBeGreaterThanOrEqual(3); break
    case 'code': expect(Boolean(ex.tests?.length) || ex.out !== undefined, ctx).toBe(true); break
    default: break
  }
}

describe('retos del simulador de git', () => {
  const gits = all.filter((x) => x.ex.t === 'git')
  it('hay retos suficientes', () => expect(gits.length).toBeGreaterThanOrEqual(25))
  for (const { ex } of gits) {
    if (ex.t !== 'git') continue
    it(`${ex.id}: el escenario es válido, no está resuelto de partida y la solución funciona`, () => {
      const fresh = scenario(ex.setup)
      expect(ex.check(fresh), 'ya está resuelto sin hacer nada').toBe(false)
      const g = scenario(ex.setup)
      const outs = g.runAll(ex.solution)
      expect(ex.check(g), `la solución no cumple el reto. Salidas:\n${outs.join('\n---\n')}`).toBe(true)
    })
  }
})
