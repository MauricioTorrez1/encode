// Fechas locales como claves `YYYY-MM-DD`. El reloj es inyectable para los tests.
let clock: () => Date = () => new Date()
export const setClock = (fn: () => Date) => { clock = fn }
export const now = () => clock()

const pad = (n: number) => String(n).padStart(2, '0')
export const dayKey = (d: Date = now()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const parseDay = (key: string) => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d, 12) }
export const addDays = (key: string, n: number) => { const d = parseDay(key); d.setDate(d.getDate() + n); return dayKey(d) }
/** Días completos de `a` a `b` (positivo si b es posterior). */
export const dayDiff = (a: string, b: string) => Math.round((parseDay(b).getTime() - parseDay(a).getTime()) / 86_400_000)
/** Número de día absoluto, usado por el repaso espaciado. */
export const dayNum = (key: string = dayKey()) => dayDiff('2024-01-01', key)
export const today = () => dayKey()
