# encode — Plan maestro

> Entrena tu mente de programador, un commit al día.

Este documento define qué es **encode**, por qué está diseñada así y cómo se construye. Es la guía de
ejecución del repositorio: cada fase de la sección 12 se marca al completarse.

---

## 1. Visión

**encode** es una aplicación web (PWA, instalable y usable sin conexión) para aprender y entrenar a
diario las habilidades de un programador profesional:

| Ruta | De → a |
|---|---|
| Fundamentos del programador | binario y terminal → algoritmos, SQL, seguridad, CI/CD |
| Python | `print` → asyncio, GIL, rendimiento |
| Java | sintaxis → streams, concurrencia, JVM, Java moderno |
| Go | sintaxis → goroutines, channels, context, genéricos |
| Rust | variables → ownership, lifetimes, traits, concurrencia |
| Git | `init` → rebase, remotos, flujos de equipo, rescate |
| Redes | modelo OSI → subredes, TLS, diseño de redes y nube |
| Diseño de sistemas | estimaciones → caché, colas, CAP, casos reales |
| Inglés para developers | A1 → C1, con foco en el inglés del trabajo técnico |

Dos usos, misma app:

1. **Aprender** — rutas con niveles (Básico → Intermedio → Avanzado → Experto), lecciones cortas y un
   jefe final por unidad.
2. **Entrenar** — reto diario, repaso espaciado, gimnasio de ejercicios infinitos y katas, para quien
   ya sabe y quiere mantenerse afilado 10–20 minutos al día.

### Principios de producto

- **Sin fricción:** sin cuenta, sin servidor, sin anuncios. Abres y practicas. El progreso vive en tu
  dispositivo y se puede exportar/importar.
- **Sesiones cortas:** una lección dura 3–6 minutos.
- **Motivar sin castigar:** no hay «vidas». Equivocarse es parte del método: el error se explica, se
  repite al final de la sesión y se agenda para repaso.
- **Hacer, no leer:** la teoría cabe en una pantalla; el resto es práctica con feedback inmediato.

---

## 2. Base pedagógica

Cada decisión de diseño responde a una técnica con respaldo en la investigación sobre aprendizaje y
enseñanza de la programación.

| Técnica | Qué dice la evidencia | Cómo se aplica en encode |
|---|---|---|
| **PRIMM** (Predict–Run–Investigate–Modify–Make) | Leer y predecir código antes de escribirlo reduce la carga cognitiva del principiante. | Orden de ejercicios en cada lección: *predecir salida* → explicación → *completar/arreglar* → *ordenar* → *escribir*. |
| **Problemas de Parsons** | Ordenar líneas es un puente eficaz entre el ejemplo resuelto y escribir desde cero. | Ejercicio `parsons` en todas las rutas de código. |
| **Ejemplos resueltos con andamiaje decreciente** | Los ejemplos funcionan mejor si se van retirando ayudas progresivamente. | Teoría con ejemplo → huecos (`fill`) → código completo (`code`). |
| **Práctica de recuperación** | Recordar activamente consolida más que releer. | Respuestas escritas (`ask`, `predict`) además de opción múltiple. |
| **Repaso espaciado** | Repetir a intervalos crecientes maximiza la retención por minuto invertido. | Cada ejercicio respondido entra en un calendario tipo SM-2; la sesión «Repaso» sirve lo que vence hoy. |
| **Intercalado (interleaving)** | Mezclar temas mejora la transferencia frente a practicar en bloque. | Reto diario y repaso mezclan rutas y tipos de ejercicio. |
| **Aprendizaje por dominio (mastery)** | No avanzar con huecos. | Los fallos vuelven al final de la sesión; estrellas por precisión; jefe de unidad con 80 % mínimo. |
| **Feedback elaborado** | Explicar *por qué* supera al simple «correcto/incorrecto». | Toda respuesta muestra una explicación. |
| **Teoría de la autodeterminación** | Autonomía, competencia y propósito sostienen la motivación; las recompensas externas solas la erosionan. | Tú eliges rutas y meta diaria (autonomía); niveles, estrellas y estadísticas reales de precisión (competencia); contenido del día a día profesional (propósito). |
| **Rachas con red de seguridad** | Las rachas generan hábito, pero perderlas de golpe provoca abandono. | Protectores de racha, meta diaria ajustable y ninguna pérdida de progreso al romperla. |

Fuentes consultadas: revisión pedagógica de la Raspberry Pi Foundation sobre enseñanza de la
programación; literatura sobre Parsons problems y worked examples (ACM TOCE, arXiv 2311.18115);
documentación de Anki sobre SM-2/FSRS; Dunlosky et al. (2013) sobre técnicas de estudio; Deci & Ryan
(autodeterminación); análisis de diseño de rachas (Smashing Magazine, 2026).

---

## 3. Decisiones técnicas

| Tema | Decisión | Motivo |
|---|---|---|
| Plataforma | Web estática + PWA | Funciona en móvil y escritorio, se instala, no requiere tienda ni servidor. |
| Stack | Vite + React + TypeScript | Tipado del contenido, build rápido, despliegue como archivos estáticos. |
| Estilos | CSS propio con *design tokens* | Identidad visual única, temas claro/oscuro y temas desbloqueables. |
| Estado | Store propio sobre `localStorage` | Sin backend; exportable a JSON. |
| Rutas | Hash router propio | Compatible con GitHub Pages sin configuración. |
| Contenido | Módulos TypeScript con un DSL compacto | Validado por el compilador y por tests; se carga en diferido por ruta. |
| Python en el navegador | Pyodide (WebAssembly) servido desde la propia app, en un Web Worker con límite de tiempo | Ejecución real con tests, también sin conexión. |
| Go / Rust / Java | Playgrounds públicos (go.dev, play.rust-lang.org, Wandbox) con degradación elegante | No existe compilador ligero en navegador; si no hay red, el ejercicio pasa a modo autoevaluación contra la solución modelo. |
| Git | Simulador propio en el navegador con grafo de commits | Práctica real de comandos sin riesgo y con validación del estado del repositorio. |
| Audio en inglés | Web Speech API (síntesis de voz) | Dictados sin archivos de audio. |
| Idioma de la interfaz | Español | Público objetivo; el inglés se enseña como ruta. |
| Despliegue | GitHub Actions → GitHub Pages | Gratis y automático en cada push a `main`. |

### Arquitectura

```
src/
  content/        DSL, tipos, registro y una ruta por archivo (tracks/*.ts), katas, rosetta
  engine/         lógica pura y testeada: store, xp, racha, srs, misiones, logros, reto diario,
                  generadores procedurales, corrección de respuestas
  runners/        Python (Pyodide), remotos (Go/Rust/Java), envoltorios de snippets
  git/            motor del simulador de git + terminal + grafo
  ui/             componentes: teclas, editor, resaltado, mascota, confeti, ejercicios
  screens/        Onboarding, Hoy, Rutas, Mapa, Sesión, Entrenar, Tienda, Perfil
scripts/          copia de Pyodide, verificación del contenido con compiladores reales
```

---

## 4. Tipos de ejercicio

| Tipo | Descripción | Rutas |
|---|---|---|
| `mc` | Opción múltiple con explicación | Todas |
| `predict` | Predecir la salida exacta de un programa | Código |
| `fill` | Completar huecos en código o en una frase | Código, Inglés |
| `parsons` | Ordenar líneas de código desordenadas | Código |
| `bug` | Encontrar la línea con el error | Código |
| `match` | Emparejar términos y definiciones | Todas |
| `order` | Ordenar pasos de un proceso | Redes, Sistemas, Git |
| `ask` | Respuesta corta escrita (comando, término, traducción) | Todas |
| `num` | Estimación numérica con tolerancia | Redes, Sistemas |
| `code` | Escribir código: tests reales (Python) o salida esperada (Go/Rust/Java) | Código |
| `git` | Lograr un estado objetivo en el simulador de git | Git |
| `words` | Construir una frase con un banco de palabras | Inglés |
| `listen` | Dictado con voz sintetizada | Inglés |

---

## 5. Currículo (v1)

Cada lección: una tarjeta de concepto + 5–7 ejercicios. Cada unidad termina en un **jefe**: 10
preguntas mezcladas de la unidad, 80 % para aprobar. Aprobar un jefe también sirve para *saltar*
una unidad que ya dominas.

### Fundamentos del programador
1. **La máquina** (Básico): binario y hexadecimal · bits, bytes y tipos · stack y heap · compilado vs. interpretado
2. **La terminal** (Básico): archivos y navegación · pipes, redirección y búsqueda · permisos, procesos y entorno
3. **Algoritmos y estructuras** (Intermedio): Big-O · arrays, listas, pilas y colas · hash maps y sets · árboles y grafos · búsqueda y ordenamiento · recursión y programación dinámica
4. **El oficio** (Avanzado): código limpio · testing · depuración · POO y SOLID · patrones de diseño
5. **Backend del día a día** (Experto): HTTP y REST · SQL esencial · joins, índices y transacciones · autenticación y seguridad · concurrencia · Docker y CI/CD · expresiones regulares

### Python
1. **Primeros pasos** (Básico): variables y tipos · strings · condicionales · bucles · funciones
2. **Estructuras de datos** (Básico): listas y slicing · diccionarios y sets · tuplas y desempaquetado · comprehensions
3. **Python real** (Intermedio): excepciones · archivos y `with` · módulos y entornos · clases · métodos especiales y dataclasses
4. **Python idiomático** (Avanzado): iteradores y generadores · closures y decoradores · type hints · functools e itertools
5. **Nivel experto** (Experto): asyncio · GIL, hilos y procesos · pytest · rendimiento

### Java
1. **Sintaxis** (Básico): estructura y tipos · control de flujo · strings · arrays y métodos
2. **Orientación a objetos** (Básico): clases y objetos · herencia y polimorfismo · interfaces y abstractas · records y enums
3. **Biblioteca estándar** (Intermedio): colecciones · genéricos · excepciones · Optional
4. **Java funcional y concurrente** (Avanzado): lambdas · streams · concurrencia · JVM y memoria
5. **Java profesional** (Experto): Java moderno (sealed, pattern matching) · build y testing

### Go
1. **Sintaxis** (Básico): paquetes y variables · control de flujo · funciones · slices · maps
2. **Tipos propios** (Intermedio): structs y métodos · punteros · interfaces · errores
3. **Concurrencia** (Avanzado): goroutines · channels · select y sync · context
4. **Go profesional** (Experto): genéricos · testing y tooling · HTTP y JSON · rendimiento

### Rust
1. **Sintaxis y ownership** (Básico): variables y tipos · control y expresiones · funciones · ownership · borrowing
2. **Modelar datos** (Intermedio): structs · enums y match · Option y Result · colecciones
3. **Abstracciones** (Avanzado): manejo de errores · traits · genéricos · lifetimes · iteradores y closures
4. **Rust profesional** (Experto): smart pointers · concurrencia · async · cargo, módulos y tests

### Git
1. **Lo esencial** (Básico): primer repositorio · staging y estados · historial · deshacer
2. **Ramas** (Intermedio): ramas · merge y conflictos · rebase · cherry-pick, stash y tags
3. **En equipo** (Avanzado): remotos · pull requests y flujos · buenos commits · rescate (reflog, bisect)

### Redes
1. **Cimientos** (Básico): modelos OSI y TCP/IP · IP y subredes · DNS · TCP, UDP y puertos
2. **La web por dentro** (Intermedio): HTTP 1.1/2/3 · TLS · routing, NAT y switching · herramientas de diagnóstico
3. **Diseño de redes** (Avanzado): VLAN, DMZ y firewalls · redes en la nube · protocolos en tiempo real

### Diseño de sistemas
1. **Bloques** (Intermedio): requisitos y estimaciones · escalado y balanceo · caché · bases de datos a escala
2. **Sistemas distribuidos** (Avanzado): CAP y consistencia · colas y eventos · diseño de APIs · monolito vs. microservicios
3. **Producción** (Experto): fiabilidad · observabilidad · caso: acortador de URLs · caso: chat y feed

### Inglés para developers
1. **A1**: to be · present simple · artículos y plurales · vocabulario esencial
2. **A2**: present continuous · past simple · futuro · modales · preposiciones
3. **B1**: present perfect · comparativos · condicionales · phrasal verbs técnicos · el daily standup
4. **B2**: voz pasiva · reported speech · code reviews · emails y chat · leer documentación y errores
5. **C1**: entrevistas técnicas · conectores y matices · idioms y falsos amigos · condicionales avanzados

---

## 6. Entrenamiento diario

- **Reto diario:** 8 ejercicios elegidos de forma determinista por fecha, mezclando tus rutas y
  ejercicios procedurales. Recompensa extra de XP y gemas.
- **Repaso:** hasta 12 ejercicios que vencen hoy según el calendario espaciado, intercalando rutas.
- **Kata del día:** un problema de programación con tests reales en el navegador.
- **Gimnasio (práctica infinita, generada):** binario/hex, operaciones de bits, subredes CIDR,
  permisos `chmod`, códigos HTTP y puertos, Big-O, verbos irregulares en inglés y «Rosetta»
  (traducir un concepto entre Python, Java, Go y Rust).
- **Mecanografía de código:** escribir snippets reales midiendo PPM y precisión.
- **Rosetta:** el mismo concepto en los cuatro lenguajes, lado a lado.

---

## 7. Sistema de juego

| Elemento | Regla |
|---|---|
| **XP** | 10 por acierto al primer intento, 5 en reintento, bonus de combo, +15 por lección, +10 por lección perfecta, +60 por jefe, +50 por reto diario. |
| **Niveles y rangos** | Curva creciente; rangos de *Novato* a *Leyenda*. |
| **Estrellas** | 1–3 por lección según precisión; invitan a repetir para dominar. |
| **Racha** | Días consecutivos cumpliendo actividad; protectores de racha comprables. |
| **Meta diaria** | 20 / 50 / 100 / 150 XP, elegida por el usuario. |
| **Gemas** | Se ganan con misiones, jefes, retos y logros; se gastan en la tienda. |
| **Misiones diarias** | 3 por día (XP, lecciones, perfectas, repasos, combo…); completar las tres abre un cofre. |
| **Logros** | ~35 insignias: constancia, dominio, exploración, velocidad. |
| **Tienda** | Protector de racha, XP doble temporal, temas de color. |
| **Jefes de unidad** | Reto del roadmap: cronometrado, 80 % para aprobar. |

Lo que **no** hay: vidas, ligas falsas, notificaciones culpabilizadoras ni pérdida de progreso.

---

## 8. Diseño

- **Identidad:** estética de *teclado mecánico*: botones y nodos como teclas con relieve, fondo tinta,
  acento lima, tipografía Outfit (interfaz) y JetBrains Mono (código y cifras).
- **Mascota:** «Bit», un personaje construido con llaves `{ }`, que reacciona a aciertos y fallos.
- **Temas:** oscuro (por defecto) y claro; acentos desbloqueables.
- **Móvil primero:** barra inferior en móvil, barra lateral en escritorio.
- **Microinteracciones:** sonido sintetizado (Web Audio), confeti, vibración, barra de progreso y combo.
- **Accesibilidad:** foco visible, navegación por teclado (Enter para comprobar/continuar, 1–4 para
  opciones), `prefers-reduced-motion`, contraste AA.

---

## 9. Modelo de datos (local)

```ts
State {
  profile   { name, dailyGoal, tracks[], theme, accent, sound, freeMode, onboarded }
  xp, gems
  streak    { current, best, last, freezes }
  days      { 'YYYY-MM-DD': { xp, lessons, exercises, correct, reviews } }
  lessons   { lessonId: { done, best, stars, last } }
  bosses    { unitId: { passed, best } }
  srs       { exerciseId: { interval, ease, due, reps, lapses } }
  quests    { date, items[], chest }
  daily     { 'YYYY-MM-DD': score }
  achievements, inventory, gym, katas
}
```

---

## 10. Calidad

- **Verificación del contenido con compiladores reales:** un script ejecuta cada snippet de `predict`,
  `fill`, `parsons` y `code` con Python, Java, Go y Rust, y compara con la salida declarada. Ningún
  ejercicio de código se publica sin pasar.
- **Tests unitarios** del motor (XP, racha, SRS, corrección, misiones) y del simulador de git
  (cada reto de git se valida ejecutando su solución).
- **Validación estructural** del contenido (ids únicos, opciones, huecos = respuestas).
- **Prueba de humo en navegador** (Playwright) del flujo completo.
- **CI:** typecheck + tests + build en cada push.

---

## 11. Fuera de alcance en v1 (siguiente iteración)

- Cuentas y sincronización entre dispositivos; ligas reales entre usuarios.
- Recordatorios push.
- Katas multi-lenguaje con tests reales para Go/Rust/Java (requiere backend de ejecución propio).
- Interfaz en otros idiomas.
- Reconocimiento de voz para pronunciación.

---

## 12. Fases de ejecución

- [ ] **F0** Plan (este documento)
- [ ] **F1** Andamiaje: Vite, TypeScript, tokens de diseño, router, PWA
- [ ] **F2** Motor: store, XP, racha, SRS, misiones, logros, corrección + tests
- [ ] **F3** Reproductor de sesiones y los 13 tipos de ejercicio
- [ ] **F4** Pantallas: onboarding, Hoy, rutas, mapa, entrenar, tienda, perfil
- [ ] **F5** Ejecución de código: Pyodide + runners remotos + editor
- [ ] **F6** Simulador de git con grafo
- [ ] **F7** Contenido de las 9 rutas
- [ ] **F8** Gimnasio procedural, katas, Rosetta, mecanografía
- [ ] **F9** Verificación del contenido con toolchains, tests, prueba de humo
- [ ] **F10** README, CI y despliegue
