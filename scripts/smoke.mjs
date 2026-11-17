// Prueba de humo en un navegador real (Playwright). Requiere `npm run build` y un servidor:
//   npx vite preview --port 4173 &  node scripts/smoke.mjs
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const BASE = process.env.BASE ?? 'http://localhost:4173/'
const OUT = process.env.SHOTS ?? ''
if (OUT) mkdirSync(OUT, { recursive: true })

const errors = []
const log = (...a) => console.log('•', ...a)
const check = (cond, msg) => { if (!cond) { errors.push(`FALLO: ${msg}`); console.log('✗', msg) } else log(msg) }

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 420, height: 880 }, deviceScaleFactor: 1 })
const page = await ctx.newPage()
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
page.on('console', (m) => { if (m.type() === 'error' && !/speech|favicon/i.test(m.text())) errors.push(`console: ${m.text()}`) })
const shot = (n) => OUT && page.screenshot({ path: `${OUT}/${n}.png` })
const go = async (hash) => { await page.goto(`${BASE}#/${hash}`); await page.waitForTimeout(250) }
const start = async (hash) => { await go(hash); await page.waitForSelector('.session-title'); await page.getByRole('button', { name: /Practicar/ }).click(); await page.waitForSelector('.session-body:not(:has(.session-title))') }
const leave = async () => { await page.click('text=Continuar'); await page.waitForSelector('.summary', { state: 'detached' }) }
const stat = async (sel) => (await page.locator(sel).first().innerText()).trim()

try {
// ── Onboarding ──
await page.goto(BASE)
await page.fill('#name', 'Test')
await page.click('text=Continuar')
await page.click('text=Python'); await page.click('text=Git')
await page.click('text=Continuar')
await page.click('text=Empezar')
await page.waitForSelector('.today')
check(true, 'onboarding completado')

// ── Lección de Python: saltar todos los ejercicios con «No lo sé» y comprobar el resumen ──
await go('s/lesson/py-vars')
await page.click('text=Practicar')
let guard = 0
while (!(await page.locator('.summary').count()) && guard++ < 40) {
  const skip = page.getByRole('button', { name: /^(No lo sé|Saltar)$/ }).first()
  if (await skip.count()) await skip.click()
  await page.waitForTimeout(40)
  const cont = page.locator('.session-foot .key-bad, .session-foot .key-ok').first()
  if (await cont.count()) await cont.click()
}
check(await page.locator('.summary').count() > 0, 'la sesión termina y muestra el resumen (fallos reencolados)')
await shot('summary')
await leave()

// ── Responder bien un ejercicio de predicción ──
await start('s/lesson/py-vars')
await page.fill('input.input', '3 1'); await page.keyboard.press('Enter')
check(await page.locator('.session-foot.ok').count() > 0, 'respuesta correcta muestra feedback verde')

// ── Kata con Pyodide real: escribir la solución y ejecutar ──
await go('s/kata/fizzbuzz')
await page.waitForSelector('.editor-ta')
await page.fill('.editor-ta', 'def fizzbuzz(n):\n    if n % 15 == 0:\n        return "FizzBuzz"\n    if n % 3 == 0:\n        return "Fizz"\n    if n % 5 == 0:\n        return "Buzz"\n    return str(n)\n')
await page.click('text=Ejecutar')
await page.waitForSelector('.test.ok, .code.out.bad', { timeout: 90_000 })
check(await page.locator('.test.ok').count() === 4, 'Pyodide ejecuta el código y pasan los 4 tests')
await shot('kata')
await page.waitForSelector('.session-foot.ok')
await page.click('text=Continuar')
check(await page.locator('.summary').count() > 0, 'la kata resuelta cierra la sesión con recompensa')
await leave()

// ── Kata con código incorrecto ──
await go('s/kata/palindromo')
await page.waitForSelector('.editor-ta')
await page.fill('.editor-ta', 'def es_palindromo(s):\n    return True\n')
await page.click('text=Ejecutar')
await page.waitForSelector('.test.bad', { timeout: 30_000 })
check(await page.locator('.test.bad').count() > 0, 'código incorrecto muestra tests fallidos')

// ── Bucle infinito: el worker se corta por tiempo ──
await go('s/kata/primo')
await page.waitForSelector('.editor-ta')
await page.fill('.editor-ta', 'def es_primo(n):\n    while True:\n        pass\n')
await page.click('text=Ejecutar')
await page.waitForSelector('.code.out.bad', { timeout: 30_000 })
check((await stat('.code.out.bad')).includes('Tiempo agotado'), 'un bucle infinito se interrumpe con mensaje claro')

// ── Simulador de git ──
await start('s/lesson/git-first')
await page.fill('.term-in input', 'git init'); await page.keyboard.press('Enter')
await page.waitForSelector('.session-foot.ok', { timeout: 5000 })
check(true, 'reto de git resuelto con la terminal')
await shot('git')
await page.click('.session-foot .key-ok')
await page.fill('.term-in input', 'echo "x" > a.txt'); await page.keyboard.press('Enter')
await page.fill('.term-in input', 'git status'); await page.keyboard.press('Enter')
check((await stat('.term-log')).includes('Untracked'), 'git status refleja los archivos sin seguimiento')

// ── Inglés: constructor de frases y huecos ──
await start('s/lesson/en-be')
await page.fill('.blank', "am"); await page.keyboard.press('Enter')
check(await page.locator('.session-foot.ok').count() > 0, 'hueco de inglés aceptado')

// ── Jefe de unidad: sin aciertos no se supera; el mapa sigue bloqueado ──
await go('s/boss/py1')
await page.waitForSelector('.q')
for (let i = 0; i < 10; i++) {
  await page.getByRole('button', { name: /^(No lo sé|Saltar)$/ }).first().click()
  await page.locator('.session-foot .key-bad, .session-foot .key-ok').first().click()
}
await page.waitForSelector('.summary')
check((await stat('.summary h1')).includes('Casi lo tienes'), 'un jefe con 0 % no se supera')
await shot('boss-fail')
await leave()

// ── Gimnasio y reto diario ──
await go('s/drill/bin')
check(await page.locator('.q').count() > 0, 'ronda de gimnasio carga ejercicios')
await go('s/daily')
check(await page.locator('.q').count() > 0, 'reto diario carga ejercicios')

// ── Pantallas ──
for (const [hash, sel, name] of [['', '.today', 'hoy'], ['rutas', '.tracks', 'rutas'], ['ruta/python', '.unit', 'mapa'], ['ruta/git', '.unit', 'mapa-git'], ['entrenar', '.drills', 'entrenar'], ['rosetta', '.rosetta-item', 'rosetta'], ['tienda', '.shop', 'tienda'], ['perfil', '.profile', 'perfil']]) {
  await go(hash)
  check(await page.locator(sel).count() > 0, `pantalla ${name} renderiza`)
  await shot(name)
}
await go('typing')
await page.waitForSelector('.typebox')
check(true, 'mecanografía carga')

// ── Persistencia ──
await go('')
await page.reload()
await page.waitForSelector('.today')
const xp = await page.evaluate(() => JSON.parse(localStorage.getItem('encode:v1')).xp)
check(xp > 0, `el progreso se guarda en localStorage (xp=${xp})`)

// ── Tema claro ──
await go('perfil')
await page.click('text=Claro')
check((await page.evaluate(() => document.documentElement.dataset.theme)) === 'light', 'el tema claro se aplica')
await shot('perfil-claro')

// ── Sin desbordamiento horizontal en móvil ──
for (const h of ['', 'rutas', 'ruta/python', 'entrenar', 'perfil', 'tienda']) {
  await go(h)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  check(overflow <= 1, `sin scroll horizontal en #/${h} (desborde ${overflow}px)`)
}

} catch (e) {
  errors.push(`excepción: ${e.message.split('\n')[0]}`)
  console.log('URL:', page.url()); console.log((await page.locator('body').innerText()).slice(0, 600))
  await shot('failure')
}
await browser.close()
if (errors.length) { console.error('\n' + errors.join('\n')); process.exit(1) }
console.log('\nPrueba de humo OK')
