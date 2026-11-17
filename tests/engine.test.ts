import { beforeEach, describe, expect, it } from 'vitest'
import { grade, normText, parseNum } from '../src/engine/check'
import { addDays, dayDiff, setClock } from '../src/engine/dates'
import { DRILLS } from '../src/engine/drills'
import { questsFor } from '../src/engine/quests'
import { seeded, shuffle } from '../src/engine/rng'
import { dueIds, review } from '../src/engine/srs'
import { PRICES, buyAccent, buyBoost, buyFreeze, finishSession, getState, importState, exportState, resetForTests, rollover, update } from '../src/engine/store'
import { levelFor, xpToNext } from '../src/engine/xp'
import type { Ex } from '../src/content/types'

class Mem { m = new Map<string, string>(); getItem(k: string) { return this.m.get(k) ?? null } setItem(k: string, v: string) { this.m.set(k, v) } }
const at = (iso: string, h = 12) => setClock(() => new Date(`${iso}T${String(h).padStart(2, '0')}:00:00`))
const answers = (n: number, ok = n) => Array.from({ length: n }, (_, i) => ({ id: `x#${i}`, t: 'mc' as const, ok: i < ok }))

describe('xp y niveles', () => {
  it('la curva crece y los rangos avanzan', () => {
    expect(levelFor(0)).toMatchObject({ level: 1, into: 0, need: 100, rank: 'Novato' })
    expect(levelFor(100).level).toBe(2)
    expect(levelFor(100 + 140).level).toBe(3)
    expect(xpToNext(10)).toBeGreaterThan(xpToNext(1))
    expect(levelFor(1_000_000).rank).toBe('Leyenda')
  })
})

describe('repaso espaciado', () => {
  it('los aciertos alargan el intervalo y los fallos lo reinician', () => {
    let c = review(undefined, true, 100)
    expect(c.i).toBe(1)
    c = review(c, true, 101); expect(c.i).toBe(3)
    c = review(c, true, 104); expect(c.i).toBeGreaterThan(3)
    const big = c.i
    c = review(c, false, 120)
    expect(c.i).toBe(1); expect(c.l).toBe(1); expect(c.e).toBeLessThan(2.4); expect(big).toBeGreaterThan(c.i)
  })
  it('devuelve lo vencido, lo más atrasado primero', () => {
    const srs = { a: { i: 1, e: 2, d: 5, r: 1, l: 0 }, b: { i: 1, e: 2, d: 3, r: 1, l: 0 }, c: { i: 1, e: 2, d: 9, r: 1, l: 0 } }
    expect(dueIds(srs, 6)).toEqual(['b', 'a'])
  })
})

describe('corrección de respuestas', () => {
  const fill: Ex = { id: 'f', t: 'fill', q: '', code: 'x = ___ + ___', ans: ['1~~uno', '2'] }
  it('texto libre ignora mayúsculas, espacios y puntuación final', () => {
    expect(normText("  It's  Done. ")).toBe("it's done")
    expect(grade({ id: 'a', t: 'ask', q: '', ans: ['git status'] }, 'Git   status')).toBe(true)
    expect(grade({ id: 'a', t: 'ask', q: '', ans: ['git status'] }, 'git stat')).toBe(false)
  })
  it('huecos aceptan alternativas', () => {
    expect(grade(fill, ['uno', '2'])).toBe(true)
    expect(grade(fill, ['1', '3'])).toBe(false)
  })
  it('numéricas con tolerancia y sufijos', () => {
    expect(parseNum('1k')).toBe(1000)
    expect(parseNum('1,024')).toBe(1024)
    expect(grade({ id: 'n', t: 'num', q: '', ans: 1200, tol: 0.15 }, '1157')).toBe(true)
    expect(grade({ id: 'n', t: 'num', q: '', ans: 62, tol: 0 }, '63')).toBe(false)
  })
  it('predict compara salida normalizada y words ignora puntuación', () => {
    expect(grade({ id: 'p', t: 'predict', q: '', code: '', out: 'a\nb' }, 'a  \r\nb\n')).toBe(true)
    expect(grade({ id: 'w', t: 'words', q: '', ans: 'I am here.', extra: [] }, ['I', 'am', 'here'])).toBe(true)
  })
  it('ordenar exige la secuencia exacta', () => {
    expect(grade({ id: 'o', t: 'order', q: '', items: ['a', 'b', 'c'] }, ['a', 'b', 'c'])).toBe(true)
    expect(grade({ id: 'o', t: 'order', q: '', items: ['a', 'b', 'c'] }, ['a', 'c', 'b'])).toBe(false)
  })
})

describe('fechas y aleatoriedad determinista', () => {
  it('aritmética de días', () => {
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01')
    expect(dayDiff('2026-01-01', '2026-01-31')).toBe(30)
  })
  it('misma semilla → mismo resultado', () => {
    expect(shuffle([1, 2, 3, 4, 5, 6], seeded('x'))).toEqual(shuffle([1, 2, 3, 4, 5, 6], seeded('x')))
    expect(questsFor('2026-05-01')).toEqual(questsFor('2026-05-01'))
    expect(questsFor('2026-05-01')).toHaveLength(3)
  })
})

describe('gimnasio procedural', () => {
  it('cada generador produce ejercicios válidos y resolubles', () => {
    for (const d of DRILLS) {
      for (let i = 0; i < 60; i++) {
        const ex = d.gen(seeded(`${d.id}${i}`), `drill:${d.id}:${i}`)
        expect(ex.q.length, d.id).toBeGreaterThan(3)
        if (ex.t === 'mc') { expect(ex.ans).toBeLessThan(ex.opts.length); expect(new Set(ex.opts).size, `${d.id}: ${ex.q}`).toBe(ex.opts.length) }
        if (ex.t === 'ask') expect(grade(ex, ex.ans[0]), `${d.id}: ${ex.q}`).toBe(true)
        if (ex.t === 'num') expect(grade(ex, String(ex.ans)), `${d.id}: ${ex.q}`).toBe(true)
        expect(ex.why, d.id).toBeTruthy()
      }
    }
  })
})

describe('progreso, racha y recompensas', () => {
  beforeEach(() => { resetForTests(new Mem()); at('2026-03-10') })

  it('una lección perfecta da XP, racha, estrellas y logros', () => {
    rollover()
    const s = finishSession({ kind: 'lesson', ref: 'l1', trackId: 'python', answers: answers(7), maxCombo: 7 })
    expect(s.perfect).toBe(true)
    expect(s.stars).toBe(3)
    expect(s.xp).toBe(7 * 10 + 7 + 15 + 10)
    expect(getState().streak.current).toBe(1)
    expect(getState().lessons.l1.done).toBe(1)
    expect(s.achievements.map((a) => a.id)).toContain('lesson-1')
    expect(getState().gems).toBeGreaterThan(0)
  })

  it('la racha continúa al día siguiente y los protectores cubren un día perdido', () => {
    rollover(); finishSession({ kind: 'review', answers: answers(3), maxCombo: 3 })
    at('2026-03-11'); rollover(); finishSession({ kind: 'review', answers: answers(3), maxCombo: 3 })
    expect(getState().streak.current).toBe(2)
    at('2026-03-13'); rollover()           // se saltó el 12: gasta el protector
    expect(getState().streak.current).toBe(2)
    expect(getState().streak.freezes).toBe(0)
    finishSession({ kind: 'review', answers: answers(3), maxCombo: 3 })
    expect(getState().streak.current).toBe(3)
  })

  it('sin protectores la racha se rompe pero el progreso se conserva', () => {
    rollover(); finishSession({ kind: 'lesson', ref: 'l1', answers: answers(5), maxCombo: 5 })
    update((d) => { d.streak.freezes = 0 })
    at('2026-03-14'); rollover()
    expect(getState().streak.current).toBe(0)
    expect(getState().lessons.l1.done).toBe(1)
    expect(getState().streak.best).toBe(1)
  })

  it('un jefe solo se supera con 80 % y reparte gemas una vez', () => {
    rollover()
    const fail = finishSession({ kind: 'boss', ref: 'u1', answers: answers(10, 7), maxCombo: 3 })
    expect(fail.passed).toBe(false)
    expect(getState().bosses.u1.passed).toBe(false)
    const win = finishSession({ kind: 'boss', ref: 'u1', answers: answers(10, 9), maxCombo: 3 })
    expect(win.passed).toBe(true)
    expect(getState().bosses.u1.passed).toBe(true)
    const gemsAfterFirst = getState().gems
    finishSession({ kind: 'boss', ref: 'u1', answers: answers(10, 10), maxCombo: 3 })
    expect(getState().gems - gemsAfterFirst).toBeLessThan(20)
  })

  it('la meta diaria se detecta una sola vez por día', () => {
    rollover()
    update((d) => { d.profile.dailyGoal = 20 })
    const a = finishSession({ kind: 'review', answers: answers(3), maxCombo: 0 })
    expect(a.goalReached).toBe(true)
    const b = finishSession({ kind: 'review', answers: answers(3), maxCombo: 0 })
    expect(b.goalReached).toBe(false)
  })

  it('XP doble duplica la recompensa', () => {
    rollover(); update((d) => { d.gems = 100 })
    expect(buyBoost()).toBe(true)
    expect(getState().gems).toBe(100 - PRICES.boost)
    const s = finishSession({ kind: 'review', answers: answers(4), maxCombo: 0 })
    expect(s.boosted).toBe(true)
    expect(s.xp).toBe(4 * 10 * 2)
  })

  it('tienda: protectores con tope, colores y saldo insuficiente', () => {
    update((d) => { d.gems = 500 })
    expect(buyFreeze()).toBe(true)          // 1 → 2
    expect(buyFreeze()).toBe(false)         // tope
    expect(buyAccent('cian')).toBe(true)
    expect(getState().profile.accent).toBe('cian')
    update((d) => { d.gems = 0 })
    expect(buyAccent('rosa')).toBe(false)
    expect(buyAccent('cian')).toBe(true)    // ya comprado: solo se selecciona
  })

  it('misiones: se completan y abren el cofre', () => {
    rollover()
    update((d) => { d.quests.items = [{ kind: 'xp', goal: 20, progress: 0, done: false, gems: 6 }, { kind: 'correct', goal: 3, progress: 0, done: false, gems: 6 }, { kind: 'combo', goal: 3, progress: 0, done: false, gems: 5 }] })
    const s = finishSession({ kind: 'review', answers: answers(5), maxCombo: 5 })
    expect(s.quests).toHaveLength(3)
    expect(s.chest).toBe(true)
  })

  it('exportar e importar conserva el estado y rechaza archivos inválidos', () => {
    rollover(); finishSession({ kind: 'lesson', ref: 'l1', answers: answers(5), maxCombo: 5 })
    const dump = exportState()
    resetForTests(new Mem())
    expect(getState().xp).toBe(0)
    importState(dump)
    expect(getState().lessons.l1.done).toBe(1)
    expect(() => importState('{"x":1}')).toThrow()
  })
})
