// Estado global de la app, persistido en localStorage. Toda la lógica de progreso vive aquí.
import { useSyncExternalStore } from 'react'
import type { ExType } from '../content/types'
import { ACHIEVEMENTS, type AchievementDef } from './achievements'
import { addDays, dayDiff, dayNum, now, today } from './dates'
import { CHEST_GEMS, questsFor, type Quest } from './quests'
import { review, type Card } from './srs'
import { levelFor, type LevelInfo } from './xp'

export interface DayStat { xp: number; lessons: number; ex: number; ok: number; reviews: number; tracks: string[] }
export interface LessonStat { done: number; best: number; stars: number; last: string }
export type SessionKind = 'lesson' | 'boss' | 'review' | 'daily' | 'drill' | 'kata' | 'typing'

export interface Totals {
  lessons: number; perfect: number; ex: number; ok: number; reviews: number; bosses: number; dailies: number
  drills: number; perfectDrills: number; katas: number; maxCombo: number; wpm: number; git: number; goals: number
  night: number; early: number
}

export interface State {
  v: 1
  profile: {
    name: string; dailyGoal: number; tracks: string[]; theme: 'dark' | 'light'; accent: string
    sound: boolean; freeMode: boolean; onboarded: boolean; created: string
  }
  xp: number
  gems: number
  streak: { current: number; best: number; last: string; freezes: number; frozen: string[] }
  days: Record<string, DayStat>
  lessons: Record<string, LessonStat>
  bosses: Record<string, { passed: boolean; best: number }>
  srs: Record<string, Card>
  quests: { date: string; items: Quest[]; chest: boolean }
  daily: Record<string, number>
  katas: Record<string, string>
  achievements: Record<string, string>
  inventory: { accents: string[]; boostUntil: number }
  gym: Record<string, { best: number; plays: number }>
  totals: Totals
}

/** Catálogo mínimo del contenido que el motor necesita para evaluar logros. */
export interface Catalog { tracks: Record<string, string[]>; codeTracks: string[] }

const KEY = 'encode:v1'
export const MAX_FREEZES = 2

export function initialState(): State {
  return {
    v: 1,
    profile: { name: '', dailyGoal: 50, tracks: [], theme: 'dark', accent: 'lima', sound: true, freeMode: false, onboarded: false, created: today() },
    xp: 0,
    gems: 0,
    streak: { current: 0, best: 0, last: '', freezes: 1, frozen: [] },
    days: {},
    lessons: {},
    bosses: {},
    srs: {},
    quests: { date: '', items: [], chest: false },
    daily: {},
    katas: {},
    achievements: {},
    inventory: { accents: ['lima'], boostUntil: 0 },
    gym: {},
    totals: { lessons: 0, perfect: 0, ex: 0, ok: 0, reviews: 0, bosses: 0, dailies: 0, drills: 0, perfectDrills: 0, katas: 0, maxCombo: 0, wpm: 0, git: 0, goals: 0, night: 0, early: 0 },
  }
}

// ── Persistencia ─────────────────────────────────────────────────────────────

interface Storage { getItem(k: string): string | null; setItem(k: string, v: string): void }
let storage: Storage | undefined = typeof localStorage !== 'undefined' ? localStorage : undefined

function load(): State {
  const base = initialState()
  try {
    const raw = storage?.getItem(KEY)
    if (!raw) return base
    const saved = JSON.parse(raw) as Partial<State>
    return {
      ...base, ...saved,
      profile: { ...base.profile, ...saved.profile },
      streak: { ...base.streak, ...saved.streak },
      inventory: { ...base.inventory, ...saved.inventory },
      totals: { ...base.totals, ...saved.totals },
    }
  } catch {
    return base
  }
}

let state: State = load()
let catalog: Catalog = { tracks: {}, codeTracks: [] }
const listeners = new Set<() => void>()

function commit(next: State) {
  state = next
  try { storage?.setItem(KEY, JSON.stringify(state)) } catch { /* almacenamiento lleno o bloqueado */ }
  listeners.forEach((l) => l())
}

/** Aplica una mutación sobre una copia del estado y la persiste. */
export function update(mutate: (s: State) => void): State {
  const next = structuredClone(state)
  mutate(next)
  commit(next)
  return next
}

export const getState = () => state
export const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l) } }
export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state))
}
export const setCatalog = (c: Catalog) => { catalog = c }

/** Solo para tests: reinicia el estado y el almacenamiento. */
export function resetForTests(s?: Storage) { storage = s; state = initialState(); catalog = { tracks: {}, codeTracks: [] } }

export function exportState(): string { return JSON.stringify(state, null, 2) }
export function importState(json: string) {
  const parsed = JSON.parse(json) as State
  if (parsed?.v !== 1 || !parsed.profile || typeof parsed.xp !== 'number') throw new Error('Archivo de progreso no válido')
  storage?.setItem(KEY, JSON.stringify(parsed))
  commit(load())
}
export function wipeState() { commit(initialState()) }

// ── Día, racha y misiones ────────────────────────────────────────────────────

const emptyDay = (): DayStat => ({ xp: 0, lessons: 0, ex: 0, ok: 0, reviews: 0, tracks: [] })

/** Se ejecuta al abrir la app y antes de cada sesión: aplica protectores de racha y renueva misiones. */
export function rollover() {
  const t = today()
  const s = state
  const gap = s.streak.last ? dayDiff(s.streak.last, t) : 0
  const needsStreak = s.streak.current > 0 && gap > 1
  const needsQuests = s.quests.date !== t
  if (!needsStreak && !needsQuests) return
  update((d) => {
    if (needsStreak) {
      const missed = gap - 1
      if (d.streak.freezes >= missed) {
        d.streak.freezes -= missed
        for (let i = 1; i <= missed; i++) d.streak.frozen.push(addDays(d.streak.last, i))
        d.streak.frozen = d.streak.frozen.slice(-60)
        d.streak.last = addDays(t, -1)
      } else {
        d.streak.current = 0
      }
    }
    if (needsQuests) d.quests = { date: t, items: questsFor(t), chest: false }
  })
}

// ── Sesiones ─────────────────────────────────────────────────────────────────

export interface AnswerLog { id: string; t: ExType; ok: boolean; trackId?: string }
export interface SessionResult {
  kind: SessionKind
  /** lessonId, unitId, drillId o kataId según el tipo de sesión. */
  ref?: string
  trackId?: string
  answers: AnswerLog[]
  maxCombo: number
  wpm?: number
}

export interface Summary {
  kind: SessionKind
  xp: number
  gems: number
  accuracy: number
  perfect: boolean
  passed: boolean
  stars: number
  boosted: boolean
  levelUp?: LevelInfo
  level: LevelInfo
  streak: { before: number; after: number; extended: boolean }
  quests: Quest[]
  chest: boolean
  achievements: AchievementDef[]
  goalReached: boolean
}

export const BOSS_PASS = 0.8
const isContentId = (id: string) => !id.startsWith('drill:') && !id.startsWith('kata:')

/** Registra una respuesta (primer intento) en el calendario de repaso espaciado. */
export function recordAnswer(id: string, ok: boolean) {
  if (!isContentId(id)) return
  update((d) => { d.srs[id] = review(d.srs[id], ok, dayNum()) })
}

export function starsFor(accuracy: number) { return accuracy >= 1 ? 3 : accuracy >= 0.8 ? 2 : 1 }

export function finishSession(r: SessionResult): Summary {
  rollover()
  const t = today()
  const before = state
  const total = r.answers.length
  const ok = r.answers.filter((a) => a.ok).length
  const accuracy = total ? ok / total : 1
  const perfect = total > 0 && ok === total
  const passed = r.kind === 'boss' ? accuracy >= BOSS_PASS : true
  const boosted = before.inventory.boostUntil > now().getTime()

  let xp = 0
  let gems = 0
  const perOk = r.kind === 'drill' ? 4 : 10
  const perRetry = r.kind === 'drill' || r.kind === 'boss' ? 0 : 5
  xp += ok * perOk + (total - ok) * perRetry
  if (r.maxCombo >= 3) xp += Math.min(15, r.maxCombo)
  if (r.kind === 'lesson') { xp += 15; if (perfect) { xp += 10; gems += 2 } }
  if (r.kind === 'boss' && passed) { xp += 60; if (!before.bosses[r.ref ?? '']?.passed) gems += 20 }
  if (r.kind === 'daily') { xp += 50; if (before.daily[t] === undefined) gems += 10 }
  if (r.kind === 'kata') { xp += 40; if (!before.katas[r.ref ?? '']) gems += 5 }
  if (r.kind === 'typing') xp += 15
  if (r.kind === 'drill' && perfect) gems += 1
  if (boosted) xp *= 2

  const levelBefore = levelFor(before.xp)
  const doneQuests: Quest[] = []
  let chest = false
  let goalReached = false
  let stars = 0

  update((d) => {
    const day = (d.days[t] ??= emptyDay())
    const xpBefore = day.xp
    day.xp += xp
    day.ex += total
    day.ok += ok
    for (const a of r.answers) if (a.trackId && !day.tracks.includes(a.trackId)) day.tracks.push(a.trackId)
    if (r.trackId && !day.tracks.includes(r.trackId)) day.tracks.push(r.trackId)
    d.totals.ex += total
    d.totals.ok += ok
    d.totals.maxCombo = Math.max(d.totals.maxCombo, r.maxCombo)
    d.totals.git += r.answers.filter((a) => a.t === 'git' && a.ok).length
    const hour = now().getHours()
    if (hour < 5) d.totals.night++
    else if (hour < 8) d.totals.early++

    if (r.kind === 'lesson' && r.ref) {
      const prev = d.lessons[r.ref]
      stars = Math.max(prev?.stars ?? 0, starsFor(accuracy))
      d.lessons[r.ref] = { done: (prev?.done ?? 0) + 1, best: Math.max(prev?.best ?? 0, accuracy), stars, last: t }
      day.lessons++
      d.totals.lessons++
      if (perfect) d.totals.perfect++
    }
    if (r.kind === 'boss' && r.ref) {
      const prev = d.bosses[r.ref]
      d.bosses[r.ref] = { passed: (prev?.passed ?? false) || passed, best: Math.max(prev?.best ?? 0, accuracy) }
      if (passed && !prev?.passed) d.totals.bosses++
    }
    if (r.kind === 'review') { day.reviews += total; d.totals.reviews += total }
    if (r.kind === 'daily') { if (d.daily[t] === undefined) d.totals.dailies++; d.daily[t] = Math.max(d.daily[t] ?? 0, Math.round(accuracy * 100)) }
    if (r.kind === 'drill' && r.ref) {
      const g = (d.gym[r.ref] ??= { best: 0, plays: 0 })
      g.plays++
      g.best = Math.max(g.best, ok)
      d.totals.drills++
      if (perfect) d.totals.perfectDrills++
    }
    if (r.kind === 'kata' && r.ref) { if (!d.katas[r.ref]) d.totals.katas++; d.katas[r.ref] = t }
    if (r.kind === 'typing' && r.wpm) d.totals.wpm = Math.max(d.totals.wpm, Math.round(r.wpm))

    // Racha: cualquier sesión terminada cuenta como día activo.
    if (d.streak.last !== t) {
      d.streak.current = d.streak.last === addDays(t, -1) ? d.streak.current + 1 : 1
      d.streak.last = t
      d.streak.best = Math.max(d.streak.best, d.streak.current)
    }

    // Meta diaria.
    if (xpBefore < d.profile.dailyGoal && day.xp >= d.profile.dailyGoal) { goalReached = true; d.totals.goals++ }

    // Misiones.
    for (const q of d.quests.items) {
      if (q.done) continue
      switch (q.kind) {
        case 'xp': q.progress = day.xp; break
        case 'lessons': q.progress = day.lessons; break
        case 'perfect': if (r.kind === 'lesson' && perfect) q.progress++; break
        case 'reviews': q.progress = day.reviews; break
        case 'daily': if (r.kind === 'daily') q.progress = 1; break
        case 'combo': q.progress = Math.max(q.progress, r.maxCombo); break
        case 'tracks': q.progress = day.tracks.length; break
        case 'drills': if (r.kind === 'drill') q.progress++; break
        case 'correct': q.progress = day.ok; break
      }
      if (q.progress >= q.goal) { q.progress = q.goal; q.done = true; gems += q.gems; doneQuests.push({ ...q }) }
    }
    if (!d.quests.chest && d.quests.items.length > 0 && d.quests.items.every((q) => q.done)) {
      d.quests.chest = true
      chest = true
      gems += CHEST_GEMS
    }

    d.xp += xp
    const levelAfter = levelFor(d.xp)
    if (levelAfter.level > levelBefore.level) gems += 10 * (levelAfter.level - levelBefore.level)
    d.gems += gems
  })

  // Logros: se evalúan sobre el estado ya actualizado.
  const unlocked = ACHIEVEMENTS.filter((a) => !state.achievements[a.id] && a.test(state, catalog))
  if (unlocked.length) {
    const bonus = unlocked.reduce((n, a) => n + a.gems, 0)
    gems += bonus
    update((d) => { for (const a of unlocked) d.achievements[a.id] = t; d.gems += bonus })
  }

  const level = levelFor(state.xp)
  return {
    kind: r.kind, xp, gems, accuracy, perfect, passed, stars, boosted, level,
    levelUp: level.level > levelBefore.level ? level : undefined,
    streak: { before: before.streak.current, after: state.streak.current, extended: state.streak.current > before.streak.current || before.streak.last !== t },
    quests: doneQuests, chest, achievements: unlocked, goalReached,
  }
}

// ── Tienda ───────────────────────────────────────────────────────────────────

export const PRICES = { freeze: 30, boost: 40, accent: 60 }
export const BOOST_MINUTES = 20

export function buyFreeze(): boolean {
  if (state.gems < PRICES.freeze || state.streak.freezes >= MAX_FREEZES) return false
  update((d) => { d.gems -= PRICES.freeze; d.streak.freezes++ })
  return true
}
export function buyBoost(): boolean {
  if (state.gems < PRICES.boost || state.inventory.boostUntil > now().getTime()) return false
  update((d) => { d.gems -= PRICES.boost; d.inventory.boostUntil = now().getTime() + BOOST_MINUTES * 60_000 })
  return true
}
export function buyAccent(id: string): boolean {
  if (state.inventory.accents.includes(id)) { update((d) => { d.profile.accent = id }); return true }
  if (state.gems < PRICES.accent) return false
  update((d) => { d.gems -= PRICES.accent; d.inventory.accents.push(id); d.profile.accent = id })
  return true
}

// ── Consultas de progreso ────────────────────────────────────────────────────

export const lessonDone = (s: State, id: string) => (s.lessons[id]?.done ?? 0) > 0
export const todayStat = (s: State): DayStat => s.days[today()] ?? emptyDay()
export const boostActive = (s: State) => s.inventory.boostUntil > now().getTime()
