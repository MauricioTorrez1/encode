# encode

> Entrena tu mente de programador, un commit al día.

**encode** es una aplicación web (PWA, funciona sin conexión) para **aprender y entrenar a diario** las habilidades de un programador: lenguajes, git, redes, diseño de sistemas, fundamentos de computación e inglés técnico. Sin cuentas, sin anuncios y sin servidor: tu progreso vive en tu dispositivo.

## Qué incluye

| Ruta | Contenido |
|---|---|
| **Fundamentos** | Binario y memoria · terminal · algoritmos y estructuras · código limpio, tests, SOLID y patrones · HTTP, SQL, seguridad, concurrencia, Docker y CI/CD, regex |
| **Python** | `print` → asyncio, GIL, pytest y rendimiento |
| **Java** | Sintaxis → streams, concurrencia, JVM, Java moderno (sealed, records), Maven y JUnit |
| **Go** | Sintaxis → goroutines, channels, context, genéricos, testing y HTTP |
| **Rust** | Ownership → lifetimes, traits, iteradores, smart pointers, concurrencia y async |
| **Git** | `init` → ramas, merge con conflictos, rebase, remotos, reflog. **Con simulador de git y grafo de commits** |
| **Redes** | OSI, IP y subredes, DNS, TCP, HTTP/3, TLS, NAT, VLAN, redes en la nube, tiempo real |
| **Diseño de sistemas** | Estimaciones, caché, sharding, CAP, colas, APIs, microservicios, observabilidad y dos casos completos |
| **Inglés** | A1 → C1 centrado en el trabajo técnico: standups, code reviews, emails, entrevistas |

Cada ruta se organiza en **unidades por nivel** (Básico → Intermedio → Avanzado → Experto) con **lecciones de 3–6 minutos** y un **jefe** al final de cada unidad (80 % para aprobar, también sirve para saltar la unidad).

### Entrenamiento diario

- **Reto diario**: 8 ejercicios mezclados (determinista por fecha).
- **Repaso espaciado** (SM-2 simplificado): vuelve lo que estás a punto de olvidar.
- **Kata del día** y 20 katas de Python con **tests reales ejecutados en tu navegador** (Pyodide).
- **Gimnasio** con ejercicios generados al vuelo: binario/hex, bits, subredes CIDR, `chmod`, HTTP y puertos, Big-O, verbos irregulares y traducciones **Rosetta** entre Python, Java, Go y Rust.
- **Mecanografía de código** (PPM y precisión) y **Rosetta**: el mismo concepto en los cuatro lenguajes.

### Sistema de juego

XP, niveles y rangos · estrellas · rachas con **protectores** (sin castigos: no hay vidas ni pérdida de progreso) · meta diaria ajustable · 3 misiones al día con cofre · ~50 logros · gemas y tienda (protectores, XP doble, colores) · tema claro/oscuro · sonidos, confeti y la mascota **Bit**.

## Cómo está construida la pedagogía

Predecir antes de escribir (PRIMM), problemas de Parsons, ejemplos con andamiaje decreciente, práctica de recuperación, repaso espaciado, intercalado de temas, dominio antes de avanzar, feedback explicado en cada respuesta y motivación sostenida por autonomía, competencia y propósito. Detalle y fuentes en [`docs/PLAN.md`](docs/PLAN.md).

## Empezar

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # tests unitarios y de contenido
npm run build      # build de producción en dist/
```

Requiere Node 22+. `npm run dev` y `npm run build` copian el runtime de Pyodide a `public/pyodide` (también sirve sin conexión).

### Verificar el contenido con compiladores reales

```bash
npm run verify:content
```

Ejecuta **cada snippet** de `predict`, `fill`, `parsons`, `code`, Rosetta y katas con `python3`, `java` (21+), `go` y `rustc`, y comprueba que la salida coincide con la declarada. Ningún ejercicio de código llega a producción sin pasar.

### Prueba de humo en navegador

```bash
npm run build && npx vite preview --port 4173 &
node scripts/smoke.mjs          # SHOTS=dir para guardar capturas
```

Recorre onboarding, lecciones, Pyodide (incluido un bucle infinito), el simulador de git, gimnasio, pantallas y persistencia. Necesita Playwright (`NODE_PATH` global o `npm i -D playwright`).

## Estructura

```
src/content/    DSL, tipos, rutas (tracks/*.ts), katas y Rosetta
src/engine/     Lógica pura y testeada: store, xp, racha, SRS, misiones, logros, sesiones, gimnasio
src/git/        Simulador de git (motor) + terminal y grafo
src/runners/    Python (Pyodide en un Worker), Go/Rust/Java (playgrounds en línea) y envoltorios de snippets
src/screens/    Pantallas · src/ui/ componentes y los 13 tipos de ejercicio
scripts/        Copia de Pyodide, verificación de contenido, prueba de humo
```

## Añadir contenido

Las lecciones se escriben con un DSL compacto (`src/content/dsl.ts`):

```ts
lesson('py-vars', 'Variables y tipos', `teoría en markdown ligero…`, [
  predict(`print(7 // 2)`, '3', 'Explicación mostrada tras responder'),
  mc('¿Qué tipo tiene 10 / 2?', ['float', 'int', 'str'], 'La PRIMERA opción es la correcta; se barajan al mostrar'),
  fill(`x = ___ + 1`, ['41'], 'Los huecos son ___; usa ~~ para alternativas', '42'),
  code('Escribe doble(n)', `def doble(n):\n    pass`, `def doble(n):\n    return n * 2`, [['doble(4)', '8']]),
])
```

Tipos: `mc`, `tf`, `predict`, `fill`, `gap`, `parsons`, `bug`, `match`, `order`, `ask`, `num`, `code`, `git`, `words`, `listen`. Tras editar, ejecuta `npm test` (estructura, retos de git y corrector) y `npm run verify:content` (compiladores reales).

## Ejecución de código

- **Python** se ejecuta en tu navegador con Pyodide (WebAssembly) en un Web Worker con límite de 6 s.
- **Go, Rust y Java** se compilan en los playgrounds públicos (go.dev, play.rust-lang.org, Wandbox) cuando hay conexión. Si no hay servicio disponible, el ejercicio pasa a **autoevaluación** frente a la solución modelo.
- **Git** usa un simulador propio: practicas comandos reales sin riesgo.

## Despliegue

Los workflows de `.github/workflows` ejecutan CI y publican `dist/` en **GitHub Pages** al hacer push a `main` (activa *Settings → Pages → Source: GitHub Actions*). La app usa rutas relativas y *hash routing*, así que funciona igual bajo `/encode/` o en la raíz de un dominio.

## Hoja de ruta

Cuentas y sincronización, ligas reales, recordatorios push, katas multi-lenguaje con tests reales, interfaz en otros idiomas y reconocimiento de voz para pronunciación. Ver [`docs/PLAN.md`](docs/PLAN.md#11-fuera-de-alcance-en-v1-siguiente-iteración).

## Licencia

Ver [`LICENSE`](LICENSE).
