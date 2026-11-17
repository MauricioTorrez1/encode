import { ask, gap, lesson, listen, match, mc, order, tf, track, unit, words } from '../dsl'


export default track('ingles', 'text', [
  // ───────────────────────────── A1 ─────────────────────────────
  unit('en1', 'A1 · Primeros pasos', 'basico', 'Presentarte, hablar de ti y de tu trabajo con las estructuras más básicas.', [
    lesson('en-be', 'El verbo to be', `
      **To be** (ser / estar) es el verbo más importante del inglés. Es irregular:

      | | Afirmativa | Negativa | Pregunta |
      |---|---|---|---|
      | I | I **am** | I am **not** | **Am** I? |
      | he / she / it | She **is** | She **isn't** | **Is** she? |
      | you / we / they | They **are** | They **aren't** | **Are** they? |

      \`\`\`
      I'm a developer.           (I am → I'm)
      She's from Spain.          (She is → She's)
      Are you ready? — Yes, I am. / No, I'm not.
      \`\`\`

      - En inglés el sujeto **siempre** se dice: *It is late* (no *Is late*).
      - Para la edad se usa *to be*: *I am 30* (no *I have 30*).
    `, [
      gap('I ___ a software developer.', ['am~~\'m'], 'Con *I* se usa *am*: *I am* / *I\'m*.'),
      gap('She ___ from Colombia.', ['is~~\'s'], 'Con he / she / it se usa *is*.'),
      gap('They ___ not ready for the demo.', ['are'], 'Con *they*, *we* y *you* se usa *are*.'),
      words('Construye: «¿Tienes 25 años?»', 'Are you 25 years old', ['Do', 'have', 'is'], 'La edad se expresa con *to be*, no con *have*.'),
      mc('¿Cuál es correcta?', ['It is a bug.', 'Is a bug.', 'It have a bug.', 'It are a bug.'], 'El sujeto es obligatorio en inglés.'),
      ask('Traduce al inglés: «Yo no soy un robot» (usa contracción)', ['I\'m not a robot', 'I am not a robot'], '*I am not* → *I\'m not*. No existe *I amn\'t* en inglés estándar.'),
      listen('I am a developer from Spain.', 'Soy desarrollador de España.'),
    ]),

    lesson('en-ps', 'Present simple', `
      El **present simple** se usa para **hábitos, rutinas y hechos**:

      \`\`\`
      I work at a startup.              She works from home.
      We don't use Windows.             He doesn't like meetings.
      Do you write tests?               Does she know Python?
      \`\`\`

      - Con **he / she / it** el verbo añade **-s** (*works*, *codes*, *has*; *studies*, *watches*).
      - Negación y pregunta con **do / does** (+ verbo en infinitivo): *Does she **work**?* (no *works*).
      - Adverbios de frecuencia (van antes del verbo): *always, usually, often, sometimes, never*. Con *to be* van después: *He is always late*.
    `, [
      gap('He ___ in Madrid. (to live)', ['lives'], 'Con *he / she / it* se añade -s.'),
      gap('We ___ use Windows at work. (negativo)', ['don\'t~~do not'], 'La negación con *we* es *don\'t* + infinitivo.'),
      gap('___ she work on weekends?', ['does~~Does'], 'En preguntas con he / she / it se usa *does*.'),
      words('Construye: «Normalmente reviso el código por la mañana»', 'I usually review code in the morning', ['reviews', 'am', 'usual'], 'El adverbio de frecuencia va antes del verbo.'),
      mc('¿Cuál es correcta?', ['She doesn\'t like meetings.', 'She don\'t like meetings.', 'She doesn\'t likes meetings.', 'She not like meetings.'], 'Tras *doesn\'t* el verbo va en infinitivo, sin -s.'),
      mc('¿Dónde va el adverbio *always*?', ['They always deploy on Fridays.', 'They deploy always on Fridays.', 'Always they deploy on Fridays.', 'They deploy on always Fridays.'], 'Antes del verbo principal.'),
      listen('She works from home on Fridays.', 'Trabaja desde casa los viernes.'),
    ]),

    lesson('en-art', 'Artículos, plurales y posesivos', `
      **Artículos**: *a / an* (uno, cualquiera) y *the* (uno concreto).

      - **a** antes de sonido consonante: *a bug, a user, a university*.
      - **an** antes de sonido vocal: *an error, an hour, an API*.
      - **the** cuando ambos saben cuál: *Open **the** file* (el que ya conocemos).

      **Plurales**: normalmente **-s** (*bugs*), **-es** tras s/sh/ch/x (*boxes*), **-ies** si acaba en consonante + y (*library → libraries*). Irregulares: *person → people, child → children, man → men*.

      **Posesivos**: *my, your, his, her, its, our, their*. Con nombres: **'s** → *Ana's laptop*.
      **This / that** (cerca / lejos), **these / those** (plural).
    `, [
      gap('I found ___ error in the log.', ['an'], '*Error* empieza con sonido vocal.'),
      gap('She is ___ user of our app.', ['a'], '*User* empieza con sonido /ju:/, consonante: *a user*.'),
      gap('Two ___ are on the team. (person)', ['people'], 'El plural irregular de *person* es *people*.'),
      gap('This is ___ laptop. (Ana\'s)', ['Ana\'s'], 'El posesivo se forma con *\'s*.'),
      mc('¿Cuál es el plural de *library*?', ['libraries', 'librarys', 'libraryes', 'librarys\''], 'Consonante + y → -ies.'),
      match('Empareja cada expresión con la razón de su artículo', [['an hour', 'La h es muda: suena vocal'], ['a user', 'Empieza con sonido /ju:/, como una consonante'], ['an API', 'Se pronuncia «ei-pi-ai»: vocal'], ['a house', 'La h se pronuncia: suena consonante']]),
      listen('We fixed three bugs in the library.', 'Arreglamos tres errores en la biblioteca.'),
    ]),

    lesson('en-vocab', 'Vocabulario esencial de developer', `
      Palabras que usarás cada día:

      | Inglés | Español |
      |---|---|
      | **bug** | error de programación |
      | **feature** | funcionalidad |
      | **deploy** | desplegar |
      | **release** | versión publicada / publicar |
      | **commit / push / pull** | guardar / subir / bajar cambios |
      | **branch** | rama |
      | **issue / ticket** | incidencia / tarea |
      | **deadline** | fecha límite |
      | **meeting** | reunión |
      | **team / teammate** | equipo / compañero |
      | **pair programming** | programar en pareja |
      | **code review** | revisión de código |
      | **fix** | arreglar / arreglo |

      Cuidado: **actually** significa *en realidad* (no «actualmente»); **library** es *biblioteca* (no «librería»).
    `, [
      match('Empareja cada palabra con su significado', [['bug', 'Error en el código'], ['deadline', 'Fecha límite'], ['release', 'Versión publicada'], ['issue', 'Incidencia o tarea']]),
      gap('We need to ___ the new version tonight. (desplegar)', ['deploy'], '*Deploy* = desplegar en un entorno.'),
      gap('Can you ___ my pull request? (revisar)', ['review'], '*Review* = revisar. *Code review* = revisión de código.'),
      mc('¿Qué significa *deadline*?', ['Fecha límite', 'Línea muerta de código', 'Plazo de garantía', 'Tiempo libre'], 'Ej.: *The deadline is Friday*.'),
      words('Construye: «Tengo una reunión con mi equipo»', 'I have a meeting with my team', ['make', 'a', 'teams'], '*Have a meeting* (no *make*).'),
      ask('¿Cómo se dice «arreglar un error» en inglés? (verbo + sustantivo)', ['fix a bug', 'fix the bug', 'fix bug'], '*Fix a bug*.'),
      listen('The deadline for this feature is next Friday.', 'La fecha límite de esta funcionalidad es el próximo viernes.'),
    ]),
  ]),

  // ───────────────────────────── A2 ─────────────────────────────
  unit('en2', 'A2 · Elemental', 'basico', 'Hablar de lo que ocurre ahora, de lo que pasó y de tus planes; pedir cosas y dar instrucciones.', [
    lesson('en-pc', 'Present continuous', `
      Se usa para lo que **está ocurriendo ahora** o en este periodo, y para planes cercanos. Estructura: **to be + verbo-ing**.

      \`\`\`
      I'm fixing a bug right now.
      They aren't working today.
      What are you doing?
      We're deploying tomorrow.        (plan ya organizado)
      \`\`\`

      - Cambios ortográficos: *write → writing*, *run → running*, *stop → stopping*.
      - Verbos de **estado** (*know, like, want, need, understand, have* = poseer) normalmente **no** se usan en continuous: *I **know** the answer* (no *I'm knowing*).
      - Contraste: *I **work** here* (siempre) vs. *I'm **working** from home today* (ahora).
    `, [
      gap('She ___ a feature right now. (to build)', ['is building~~\'s building'], '*is* + building.'),
      gap('We ___ working today; it\'s a holiday.', ['aren\'t~~are not'], 'Negativa: *are not / aren\'t* + -ing.'),
      gap('What ___ you doing?', ['are'], 'Pregunta: *are* + sujeto + -ing.'),
      gap('He is ___ the report. (write)', ['writing'], 'write → writing (se elimina la -e).'),
      mc('¿Cuál es correcta?', ['I know the answer.', 'I am knowing the answer.', 'I\'m know the answer.', 'I knowing the answer.'], '*Know* es un verbo de estado: no suele ir en continuous.'),
      words('Construye: «Estamos desplegando ahora mismo»', 'We are deploying right now', ['deploy', 'is', 'does'], 'Present continuous: *are* + verbo-ing.'),
      listen('I am working on a new feature.', 'Estoy trabajando en una nueva funcionalidad.'),
    ]),

    lesson('en-past', 'Past simple', `
      Para acciones **terminadas en el pasado**. Verbos regulares: **-ed**. Hay muchos irregulares que debes memorizar.

      \`\`\`
      I fixed the bug yesterday.            (regular: fix → fixed)
      She went to the meeting.              (irregular: go → went)
      We didn't deploy on Friday.           (negativa: didn't + infinitivo)
      Did you push the changes?             (pregunta: did + infinitivo)
      \`\`\`

      Irregulares frecuentes: *be → was/were, have → had, do → did, go → went, make → made, write → wrote, run → ran, build → built, send → sent, see → saw, take → took, break → broke*.

      Expresiones de tiempo: *yesterday, last week, two days ago, in 2024*.

      > Tras **did / didn't** el verbo vuelve a infinitivo: *Did she **go**?* (no *Did she went?*).
    `, [
      gap('I ___ the bug yesterday. (fix)', ['fixed'], 'Regular: fix + ed.'),
      gap('She ___ the report last week. (write)', ['wrote'], 'write → wrote (irregular).'),
      gap('We ___ deploy on Friday. (negativo)', ['didn\'t~~did not'], '*Didn\'t* + infinitivo.'),
      gap('___ you push the changes?', ['Did~~did'], 'En preguntas en pasado se usa *did*.'),
      mc('¿Cuál es correcta?', ['Did she go to the meeting?', 'Did she went to the meeting?', 'Does she went to the meeting?', 'Was she go to the meeting?'], 'Tras *did*, infinitivo.'),
      match('Empareja el infinitivo con su pasado', [['go', 'went'], ['break', 'broke'], ['send', 'sent'], ['build', 'built']]),
      listen('We released the new version two days ago.', 'Publicamos la nueva versión hace dos días.'),
    ]),

    lesson('en-fut', 'Futuro: will y going to', `
      - **will** + infinitivo: decisiones **espontáneas**, promesas y predicciones. *I'll check it now.* *It won't take long.*
      - **be going to** + infinitivo: **planes** ya decididos y predicciones con evidencia. *We're going to migrate to Postgres.* *Look at those clouds: it's going to rain.*
      - **Present continuous** para citas fijas: *I'm meeting the client at 3.*

      \`\`\`
      "The build failed." — "I'll look into it."          (decisión en el momento)
      We're going to release next week.                     (plan)
      \`\`\`

      Negativo de *will*: **won't** (will not). Pregunta: *Will you join the call?*
    `, [
      gap('"The server is down." — "I ___ check it now."', ['\'ll~~will'], 'Decisión espontánea → *will*.'),
      gap('We ___ going to migrate to a new database next month.', ['are'], '*Be going to* para planes: *We are going to…*'),
      gap('I promise I ___ be late again. (negativo)', ['won\'t~~will not'], '*Won\'t* = will not.'),
      mc('¿Qué frase expresa un plan ya decidido?', ['We\'re going to refactor the API.', 'I\'ll refactor the API.', 'We refactor the API.', 'We refactored the API.'], '*Be going to* → plan.'),
      words('Construye: «Mañana no voy a trabajar»', 'I am not going to work tomorrow', ['will', 'don\'t', 'am going'], '*I\'m not going to work tomorrow*.'),
      listen('I will send you the report this afternoon.', 'Te enviaré el informe esta tarde.'),
    ]),

    lesson('en-modal', 'Modales: can, should, must', `
      Los **modales** van seguidos de un infinitivo **sin to** y no añaden -s.

      | Modal | Uso | Ejemplo |
      |---|---|---|
      | **can / can't** | capacidad, permiso | *Can you review this?* |
      | **could** | petición educada, posibilidad | *Could you send me the link?* |
      | **should / shouldn't** | consejo | *You should write tests.* |
      | **must / mustn't** | obligación fuerte / prohibición | *You mustn't share passwords.* |
      | **have to / don't have to** | obligación externa / no necesidad | *You don't have to come.* |
      | **may / might** | posibilidad | *It might fail.* |

      **Ojo**: *mustn't* = prohibido; *don't have to* = no es necesario (puedes, pero no hace falta).
      Peticiones corteses: *Could you…? / Would you mind…-ing? / Can I…?*
    `, [
      gap('You ___ write tests for new features. (consejo)', ['should'], '*Should* = deberías.'),
      gap('You ___ share your password. (prohibido)', ['mustn\'t~~must not~~should not~~shouldn\'t'], '*Mustn\'t* = está prohibido.'),
      gap('She ___ to attend the meeting. It\'s optional.', ['doesn\'t have~~does not have'], '*Don\'t have to* = no es necesario.'),
      mc('¿Cuál es una petición educada?', ['Could you send me the link?', 'Send me the link.', 'You send me the link.', 'I want the link.'], '*Could you…?* es cortés.'),
      mc('¿Cuál es correcta?', ['She can speak English.', 'She can speaks English.', 'She cans speak English.', 'She can to speak English.'], 'Los modales no añaden -s ni llevan *to*.'),
      match('Empareja', [['should', 'Consejo'], ['mustn\'t', 'Prohibición'], ['could you…?', 'Petición educada'], ['might', 'Posibilidad']]),
      listen('Could you review my pull request, please?', '¿Podrías revisar mi pull request, por favor?'),
    ]),

    lesson('en-prep', 'Preposiciones y expresiones de tiempo', `
      **Tiempo**: **at** (hora puntual), **on** (días y fechas), **in** (meses, años, partes del día).

      \`\`\`
      at 9:30 · at night · at the weekend (UK)
      on Monday · on March 3rd · on my birthday
      in May · in 2026 · in the morning
      \`\`\`

      **Lugar**: *in* (dentro: *in the repo*), *on* (sobre una superficie: *on the screen*), *at* (punto: *at the office*).

      **Dirección**: *to* (hacia), *from*, *into*.

      **Con tecnología** (colocaciones): *depend **on**, rely **on**, based **on**, different **from**, interested **in**, responsible **for**, wait **for**, listen **to**, commit **to** a branch, merge **into** main, deploy **to** production.*

      **For / since / ago**: *for three years* (duración), *since 2023* (desde cuándo), *two days ago*.
    `, [
      gap('The meeting is ___ Monday at 10.', ['on'], 'Días → *on*.'),
      gap('I usually code ___ the morning.', ['in'], 'Partes del día → *in*.'),
      gap('We deploy ___ production on Thursdays.', ['to'], '*Deploy to* + entorno.'),
      gap('The result depends ___ the input.', ['on'], '*Depend on*.'),
      mc('¿Cuál es correcta?', ['I\'ve worked here for three years.', 'I\'ve worked here since three years.', 'I\'ve worked here ago three years.', 'I\'ve worked here from three years.'], '*For* + duración; *since* + punto de inicio.'),
      match('Empareja cada palabra con su preposición habitual', [['responsible', 'for (responsible for)'], ['interested', 'in (interested in)'], ['different', 'from (different from)'], ['depend', 'on (depend on)']]),
      listen('Please merge your branch into main before Friday.', 'Por favor, fusiona tu rama en main antes del viernes.'),
    ]),
  ]),

  // ───────────────────────────── B1 ─────────────────────────────
  unit('en3', 'B1 · Intermedio', 'intermedio', 'Contar experiencias, comparar, hablar de hipótesis y moverte en el día a día de un equipo.', [
    lesson('en-pp', 'Present perfect', `
      **have / has + participio**. Conecta el pasado con el presente: experiencia, resultados y acciones que continúan.

      \`\`\`
      I have worked with Python for five years.     (sigue ocurriendo)
      She has already fixed the bug.                (resultado ahora)
      Have you ever used Kubernetes?                (experiencia)
      I haven't finished yet.                       (todavía no)
      \`\`\`

      - **For** (duración) / **since** (inicio). **Already, yet, just, ever, never, recently**.
      - Se usa **past simple** si hay un tiempo pasado concreto: *I fixed it **yesterday*** (no *have fixed*).
      - Participios irregulares: *be → been, go → gone/been, do → done, write → written, break → broken, build → built, see → seen, take → taken*.

      > *Have you finished?* (¿ya acabaste?) frente a *When did you finish?* (¿cuándo acabaste?).
    `, [
      gap('I ___ worked with Go for two years.', ['have~~\'ve'], '*Have* + participio.'),
      gap('She hasn\'t finished the task ___.', ['yet'], '*Yet* en negativas y preguntas.'),
      gap('Have you ___ used Docker? (alguna vez)', ['ever'], '*Ever* en preguntas de experiencia.'),
      gap('We ___ already deployed the fix.', ['have~~\'ve'], '*Already* va entre el auxiliar y el participio.'),
      mc('¿Cuál es correcta?', ['I fixed the bug yesterday.', 'I have fixed the bug yesterday.', 'I\'ve fixed the bug yesterday.', 'I have fix the bug yesterday.'], 'Con *yesterday* (tiempo concreto) se usa past simple.'),
      words('Construye: «No he terminado todavía»', 'I have not finished yet', ['did', 'since', 'finish'], 'También: *I haven\'t finished yet*.'),
      listen('Have you ever worked with microservices?', '¿Has trabajado alguna vez con microservicios?'),
    ]),

    lesson('en-comp', 'Comparativos y superlativos', `
      - **Corto** (1 sílaba): **-er / the -est** → *fast, faster, the fastest*; *big → bigger → the biggest*.
      - **Largo** (2+ sílabas): **more / the most** → *more efficient, the most efficient*.
      - Terminados en **-y**: *easy → easier → the easiest*.
      - Irregulares: *good → better → the best*, *bad → worse → the worst*, *far → further*.

      \`\`\`
      Go is faster than Python.
      This is the most complex module in the project.
      The new API is as fast as the old one.     (igualdad: as … as)
      It's not as simple as it looks.
      \`\`\`

      Para más/menos: *much / a lot / slightly + comparativo*: *a lot faster*, *slightly cheaper*.
    `, [
      gap('Rust is ___ than Python. (fast)', ['faster'], 'Una sílaba: -er.'),
      gap('This is the ___ complex module. (more / most)', ['most'], 'Superlativo de adjetivos largos: *the most*.'),
      gap('The new API is as fast ___ the old one.', ['as'], '*As … as* expresa igualdad.'),
      gap('Her solution is ___ than mine. (good)', ['better'], 'good → better → best.'),
      mc('¿Cuál es correcta?', ['This is the easiest option.', 'This is the most easy option.', 'This is the easyest option.', 'This is easier option.'], '*Easy → easier → the easiest*.'),
      words('Construye: «Es más barato que la otra opción»', 'It is cheaper than the other option', ['more', 'cheap', 'as'], '*Cheaper than*.'),
      listen('This is the most important feature of the release.', 'Esta es la funcionalidad más importante de la versión.'),
    ]),

    lesson('en-cond', 'Condicionales', `
      | Tipo | Estructura | Uso |
      |---|---|---|
      | **Zero** | If + present, present | Hechos |
      | **First** | If + present, **will** + inf. | Posibilidades reales |
      | **Second** | If + past, **would** + inf. | Situaciones hipotéticas o improbables |

      \`\`\`
      If you heat water to 100°C, it boils.                  (zero)
      If the tests fail, the pipeline will stop.             (first)
      If I had more time, I would write more tests.          (second)
      If I were you, I would ask for help.                   (were con todos)
      \`\`\`

      - Tras *if* **no** se usa *will*: *If it **rains**…* (no *If it will rain*).
      - **Unless** = *if not*: *Unless you test it, it won't ship.*
      - En condicionales de tipo 2, con *be* se usa **were** para todas las personas (formal).
    `, [
      gap('If the tests fail, the pipeline ___ stop.', ['will'], 'Condicional 1: *if* + presente, *will* + infinitivo.'),
      gap('If I ___ more time, I would write more tests.', ['had'], 'Condicional 2: *if* + pasado.'),
      gap('If I ___ you, I would ask for help. (be)', ['were~~was'], 'Se prefiere *were* con todas las personas.'),
      mc('¿Cuál es correcta?', ['If it rains, we will stay home.', 'If it will rain, we will stay home.', 'If it rained, we will stay home.', 'If it rains, we would stay home.'], 'Nunca *will* justo después de *if*.'),
      mc('*Unless you review it, it won\'t be merged.* ¿Qué significa?', ['Si no lo revisas, no se fusionará.', 'Si lo revisas, no se fusionará.', 'Aunque lo revises, no se fusionará.', 'Lo fusionaré si lo revisas.'], '*Unless* = *if … not*.'),
      words('Construye: «Si tuviera tiempo, lo haría»', 'If I had time I would do it', ['will', 'have', 'did'], 'Condicional 2: hipotético.'),
      listen('If the build fails, we will fix it before the release.', 'Si falla la compilación, la arreglaremos antes de la publicación.'),
    ]),

    lesson('en-phrasal', 'Phrasal verbs de developers', `
      Un **phrasal verb** es verbo + partícula con significado propio. Los de uso diario en un equipo:

      | Phrasal verb | Significado | Ejemplo |
      |---|---|---|
      | **set up** | configurar | *Set up the environment.* |
      | **roll back** | revertir (a una versión) | *We rolled back the release.* |
      | **roll out** | desplegar gradualmente | *We're rolling out the feature.* |
      | **break down** | dividir / averiar | *Break down the task.* |
      | **look into** | investigar | *I'll look into it.* |
      | **figure out** | averiguar | *I can't figure out the bug.* |
      | **carry out** | llevar a cabo | *carry out a test* |
      | **go through** | revisar con detalle | *Let's go through the code.* |
      | **come up with** | idear | *come up with a solution* |
      | **sign off** | aprobar | *The lead signed off the design.* |

      Algunos son **separables**: *turn **it** off*, *turn off the server*. Con pronombre, este va en medio.
    `, [
      match('Empareja', [['roll back', 'Revertir a una versión anterior'], ['look into', 'Investigar'], ['figure out', 'Averiguar'], ['set up', 'Configurar']]),
      gap('I\'ll ___ into the error and let you know. (investigar)', ['look'], '*Look into* = investigar.'),
      gap('We had to ___ back the release because of a critical bug.', ['roll'], '*Roll back* = revertir.'),
      gap('Can you ___ me through the code? (revisarlo conmigo)', ['walk~~take'], '*Walk someone through* = guiar paso a paso.'),
      mc('¿Cuál es correcta?', ['Turn it off.', 'Turn off it.', 'Turn it up off.', 'Off turn it.'], 'Con pronombre, este va entre el verbo y la partícula.'),
      words('Construye: «No puedo averiguar qué falla»', 'I cannot figure out what is failing', ['look', 'broke', 'is failed'], '*Figure out* = averiguar.'),
      listen('Let us go through the changes before we roll out the release.', 'Revisemos los cambios antes de desplegar la versión.'),
    ]),

    lesson('en-standup', 'El daily standup', `
      El **daily** es una reunión breve (≈ 15 min). Estructura típica:

      1. **Yesterday**: *Yesterday I finished the login form and reviewed two PRs.*
      2. **Today**: *Today I'm going to start the payment integration.*
      3. **Blockers**: *I'm blocked by the staging environment; it's down.*

      **Frases útiles**:

      - *I'm working on… / I'm in the middle of…*
      - *I ran into an issue with… / I'm stuck on…*
      - *It should be done by Thursday.* / *It's taking longer than expected.*
      - *Could I get some help with…?* / *Can we take this offline?* (hablarlo aparte)
      - *No blockers on my side.*

      **Tiempos**: pasado (*finished*, *merged*), presente continuo (*I'm working on*), futuro (*I'll*, *I'm going to*).
    `, [
      order('Ordena un daily típico', ['Yesterday I finished the login form.', 'Today I am going to start the payment integration.', 'I am blocked by the staging environment.']),
      gap('I ___ into an issue with the database migration. (ran / run)', ['ran'], '*Run into an issue* = toparse con un problema (past: *ran*).'),
      gap('I\'m ___ on the checkout page right now.', ['working'], '*Work on* = trabajar en.'),
      mc('¿Qué significa *Can we take this offline?*', ['¿Lo hablamos aparte, fuera de esta reunión?', '¿Podemos desconectar el servidor?', '¿Podemos trabajar sin internet?', '¿Terminamos la reunión?'], 'Se usa para no alargar la reunión con un tema que afecta solo a unos pocos.'),
      mc('Quieres decir que no tienes bloqueos. ¿Qué dices?', ['No blockers on my side.', 'I have no block.', 'I am not blocking.', 'There is no stop.'], 'Es la frase estándar.'),
      words('Construye: «Debería estar listo el jueves»', 'It should be done by Thursday', ['must', 'is doing', 'for'], '*Should be done by* + día.'),
      listen('Yesterday I merged two pull requests and today I will fix the login bug.', 'Ayer fusioné dos pull requests y hoy arreglaré el bug del login.'),
    ]),
  ]),

  // ───────────────────────────── B2 ─────────────────────────────
  unit('en4', 'B2 · Intermedio alto', 'avanzado', 'Comunicación profesional escrita y oral: voz pasiva, estilo indirecto, code reviews, emails y documentación.', [
    lesson('en-passive', 'La voz pasiva', `
      **be + participio**. Se usa cuando importa más **la acción o el resultado** que quién la hizo, o el agente es desconocido.

      \`\`\`
      Active:   The team deployed the update.
      Passive:  The update was deployed (by the team).

      The data is encrypted before it is stored.     (presente)
      The bug was fixed in version 2.1.             (pasado)
      The API will be released next month.          (futuro)
      The server has been restarted.                (present perfect)
      Passwords should not be stored in plain text. (modal)
      \`\`\`

      - Muy común en **documentación técnica**, *release notes* y reportes de incidentes: *The issue has been resolved.*
      - El agente se añade con **by** solo si es relevante.
    `, [
      gap('The update ___ deployed last night. (pasiva, pasado)', ['was'], '*Was/were* + participio.'),
      gap('Passwords should not ___ stored in plain text.', ['be'], 'Modal + *be* + participio.'),
      gap('The issue has ___ resolved.', ['been'], 'Present perfect pasiva: *has been* + participio.'),
      mc('Transforma a pasiva: *They released the version.*', ['The version was released.', 'The version released.', 'The version is releasing.', 'The version has release.'], 'Pasado simple → *was/were* + participio.'),
      mc('¿Cuál es la mejor para unas notas de versión?', ['Several performance issues have been fixed.', 'We fixed several performance issues that were bothering us a lot.', 'Fixed fixes for fixing.', 'Performance issues, they got fixed.'], 'La pasiva da un tono neutro y profesional.'),
      words('Construye: «Los datos se cifran antes de guardarse»', 'The data is encrypted before it is stored', ['was', 'encrypt', 'are'], 'Presente pasivo.'),
      listen('The vulnerability has been fixed in the latest version.', 'La vulnerabilidad se ha corregido en la última versión.'),
    ]),

    lesson('en-reported', 'Estilo indirecto', `
      Para contar lo que alguien dijo, los tiempos **retroceden**:

      | Directo | Indirecto |
      |---|---|
      | *"I am deploying."* | She said (that) she **was deploying**. |
      | *"I fixed it."* | He said he **had fixed** it. |
      | *"I'll call you."* | She said she **would** call me. |
      | *"Can you help?"* | He asked if I **could** help. |
      | *"Where is the file?"* | She asked where the file **was**. |

      - **say** (sin complemento de persona) vs **tell** (con persona): *He said that…* / *He told **me** that…*
      - En preguntas indirectas el orden es **afirmativo**: *She asked where the file **was*** (no *where was the file*).
      - También cambian *here → there*, *now → then*, *tomorrow → the next day*.
      - Verbos introductorios: *explain, mention, suggest, point out, warn, agree*.
    `, [
      gap('She said she ___ deploying on Friday. (was / is)', ['was'], 'present continuous → past continuous.'),
      gap('He told ___ that the build had failed.', ['me~~us~~them~~her~~him'], '*Tell* siempre lleva persona.'),
      gap('She asked where the file ___. (is / was)', ['was'], 'Retroceso de tiempo y orden afirmativo.'),
      mc('*"I\'ll review it tomorrow."* → ¿Cuál es correcta?', ['She said she would review it the next day.', 'She said she will review it tomorrow.', 'She said she reviews it tomorrow.', 'She said she had review it the next day.'], '*Will → would*; *tomorrow → the next day*.'),
      mc('¿Cuál es correcta?', ['He asked if I could help.', 'He asked if could I help.', 'He asked could I help me.', 'He asked that if I can help.'], 'Pregunta indirecta: orden afirmativo, con *if / whether*.'),
      words('Construye: «Dijo que había arreglado el error»', 'He said that he had fixed the bug', ['has', 'told', 'fix'], '*Had* + participio: past perfect.'),
      listen('She mentioned that the tests had passed.', 'Mencionó que las pruebas habían pasado.'),
    ]),

    lesson('en-cr', 'Code reviews en inglés', `
      Una buena revisión es **clara, amable y accionable**. Suaviza las críticas con modales y preguntas:

      | Función | Frase |
      |---|---|
      | **Sugerir** | *Could we extract this into a helper?* / *Consider using a map here.* |
      | **Preguntar** | *What happens if the list is empty?* / *Why did we choose this approach?* |
      | **Detalle menor** | *Nit: missing trailing comma.* |
      | **Bloqueante** | *This must be fixed before merging: it exposes the API key.* |
      | **Elogiar** | *Nice catch! / Clean solution. / LGTM (Looks Good To Me)* |
      | **Pedir cambios** | *Could you add a test for this case?* |
      | **Aceptar** | *Good point, I'll update it.* / *Done. Thanks for the review!* |

      **Abreviaturas**: *PR* (pull request), *LGTM*, *WIP* (work in progress), *nit*, *IMO / IMHO*, *FYI*, *TL;DR*, *ASAP*, *WFH*.
      Critica el **código**, no a la persona: *This function is hard to read* (no *You write bad code*).
    `, [
      mc('¿Qué significa *LGTM*?', ['Looks Good To Me: me parece bien', 'Let\'s Get The Merge', 'Last Good Test Merged', 'Looks Great, Try More'], 'Aprobación habitual en una revisión.'),
      mc('¿Cuál es la forma más constructiva de pedir un test?', ['Could you add a test for the empty-list case?', 'You forgot the tests, as usual.', 'Add tests.', 'This is wrong.'], 'Específica, educada y accionable.'),
      match('Empareja', [['Nit:', 'Detalle menor, opcional'], ['WIP', 'Trabajo en curso'], ['FYI', 'Para tu información'], ['IMO', 'En mi opinión']]),
      gap('___ using a dictionary here; it would make the lookup faster.', ['Consider~~consider'], '*Consider + -ing* para sugerir.'),
      gap('Good ___! I missed that edge case. (captura / atrapado)', ['catch'], '*Nice catch!* = ¡buena observación!'),
      words('Construye: «¿Qué pasa si la lista está vacía?»', 'What happens if the list is empty', ['will', 'does', 'was'], 'Pregunta abierta, sin culpar.'),
      listen('Good point, I will update the pull request.', 'Buen punto, actualizaré la pull request.'),
    ]),

    lesson('en-mail', 'Emails y chat profesional', `
      **Estructura de un email**: asunto claro → saludo → motivo → detalle → petición/siguiente paso → cierre.

      \`\`\`
      Subject: Question about the API rate limits

      Hi Sara,

      I'm writing to ask about the rate limits of the payments API.
      We're seeing 429 errors during peaks, and I'd like to confirm the limits.
      Could you share the current values or point me to the docs?

      Thanks in advance. Best regards,
      Alex
      \`\`\`

      **Registro**: formal (*Dear Mr. Smith, I would like to…, Yours sincerely*) vs. informal (*Hi Sam, Can you…? Cheers*).

      **Frases útiles**: *I'm following up on…*, *Just a quick reminder…*, *Please find attached…*, *Let me know if you need anything else.*, *Sorry for the delay.*, *I'll get back to you by Friday.*, *Looking forward to hearing from you.*

      **En Slack**: breve, con contexto; usa hilos; *thanks!*; avisa de tu disponibilidad (*I'm OOO until Monday*; OOO = out of office).
    `, [
      gap('I\'m writing to ___ about the API limits. (preguntar)', ['ask~~enquire~~inquire'], '*I\'m writing to ask…* abre un email con motivo.'),
      gap('Could you ___ me know when it is ready?', ['let'], '*Let me know* = avísame.'),
      gap('I\'m ___ up on my previous message. (dar seguimiento)', ['following'], '*Follow up* = dar seguimiento.'),
      mc('¿Cómo cierras un email formal?', ['Yours sincerely, / Best regards,', 'See ya!', 'Bye bye, my friend', 'Whatever'], 'Adapta el cierre al registro.'),
      mc('¿Qué significa *OOO*?', ['Out of office: fuera de la oficina', 'Out of order', 'On our own', 'Over our objective'], 'Se usa para avisar de que no estás disponible.'),
      words('Construye: «Siento el retraso»', 'Sorry for the delay', ['to', 'late', 'about delayed'], 'Disculpa breve y profesional.'),
      listen('Please find attached the report. Let me know if you need anything else.', 'Adjunto el informe. Avísame si necesitas algo más.'),
    ]),

    lesson('en-docs', 'Leer documentación y errores', `
      La documentación técnica usa un inglés **preciso y recurrente**:

      - **MUST / MUST NOT / SHOULD / MAY** (RFC 2119): obligación, prohibición, recomendación, opción.
      - **Deprecated**: obsoleto, se retirará. **Breaking change**: cambio incompatible. **Backwards compatible**: compatible hacia atrás.
      - **Defaults to**: por defecto vale. **Optional**: opcional. **Required**: obligatorio.
      - **Throws / returns / raises / yields**. **Pass an argument**. **Invoke / call**.
      - **Prerequisites**, **Getting started**, **Quick start**, **Troubleshooting**, **FAQ**, **Changelog**.

      **Mensajes de error frecuentes**:

      - *Permission denied* — sin permisos
      - *No such file or directory* — el archivo no existe
      - *Connection refused / timed out* — conexión rechazada / agotó el tiempo
      - *Cannot read properties of undefined* — acceso a un valor indefinido
      - *Unexpected token* — error de sintaxis
      - *Out of memory* — sin memoria
      - *Not found (404)* · *Unauthorized (401)* · *Forbidden (403)*

      Estrategia: lee el **primer error**, copia el mensaje exacto en un buscador y revisa la versión de la documentación.
    `, [
      match('Empareja', [['Permission denied', 'No tienes permisos'], ['Connection refused', 'El destino rechazó la conexión'], ['No such file or directory', 'El archivo no existe'], ['Request timed out', 'Se agotó el tiempo de espera']]),
      mc('La documentación dice: *This option MUST NOT be used in production.* ¿Qué significa?', ['Está prohibido usarla en producción', 'Es recomendable usarla en producción', 'Es opcional', 'Debe usarse siempre'], '*MUST NOT* es una prohibición explícita.'),
      mc('¿Qué es un *breaking change*?', ['Un cambio incompatible con versiones anteriores', 'Un error de compilación', 'Una pausa en el desarrollo', 'Un cambio de nombre'], 'Obliga a los usuarios a adaptar su código.'),
      gap('The function is ___ and will be removed in version 3. (obsoleta)', ['deprecated'], '*Deprecated* = obsoleto.'),
      gap('This parameter is optional and ___ to false.', ['defaults'], '*Defaults to* = vale por defecto.'),
      words('Construye: «El método devuelve una lista»', 'The method returns a list', ['return', 'is returns', 'a lists'], 'Presente simple, tercera persona.'),
      listen('This option is deprecated and will be removed in the next major version.', 'Esta opción está obsoleta y se eliminará en la próxima versión mayor.'),
    ]),
  ]),

  // ───────────────────────────── C1 ─────────────────────────────
  unit('en5', 'C1 · Avanzado', 'experto', 'Entrevistas técnicas, matices del discurso, expresiones idiomáticas y estructuras avanzadas.', [
    lesson('en-interview', 'La entrevista técnica', `
      **Presentarte** (*tell me about yourself*): presente → pasado → futuro, en 1–2 minutos.

      \`\`\`
      I'm a backend developer with five years of experience in Go and Python.
      Most recently, I led the migration of our payments service to Kubernetes,
      which cut latency by 40 %. I'm now looking for a role with more ownership of system design.
      \`\`\`

      **Método STAR** para preguntas de comportamiento: **S**ituation, **T**ask, **A**ction, **R**esult.

      **Pensar en voz alta** en un ejercicio de código:

      - *Let me make sure I understand the problem…*
      - *A brute-force approach would be… but it's O(n²). We can do better with a hash map.*
      - *The trade-off here is time versus memory.*
      - *Let me walk through an example.* / *Edge cases to consider: empty input, duplicates…*
      - *I'd start with the simplest solution and then optimise.*

      **Preguntas tuyas**: *What does the on-call rotation look like? How do you handle technical debt? How are decisions made?*

      **Expresiones**: *I'm responsible for / I owned / I was in charge of / I took the initiative to…*
    `, [
      order('Ordena las partes del método STAR', ['Situation: el contexto', 'Task: tu responsabilidad', 'Action: lo que hiciste', 'Result: el resultado medible']),
      mc('El entrevistador pide un ejercicio. ¿Qué haces primero?', ['Aclarar el enunciado y los casos límite con preguntas', 'Empezar a escribir código sin hablar', 'Decir que no sabes', 'Pedir pistas de inmediato'], 'Mostrar tu proceso es tan importante como el resultado.'),
      gap('A brute-force approach would be O(n²), but we can do ___ with a hash map. (mejor)', ['better'], '*Do better* = mejorarlo.'),
      gap('The ___ here is time versus memory. (compromiso)', ['trade-off~~tradeoff'], '*Trade-off* = compromiso entre dos factores.'),
      mc('¿Cuál suena más segura y profesional?', ['I led the migration, which reduced latency by 40 %.', 'I kind of helped with some migration thing.', 'It was not me, but the team.', 'I don\'t remember.'], 'Verbos de acción y resultados medibles.'),
      words('Construye: «Me encargaba del diseño del sistema»', 'I was responsible for the system design', ['was in charge', 'have been', 'on'], '*Responsible for* + sustantivo.'),
      listen('I led the migration of our payments service, which reduced latency by forty percent.', 'Lideré la migración de nuestro servicio de pagos, que redujo la latencia un cuarenta por ciento.'),
    ]),

    lesson('en-discourse', 'Conectores y matices', `
      Los conectores estructuran tu discurso y suavizan o refuerzan lo que dices.

      | Función | Conectores |
      |---|---|
      | **Contraste** | *however, nevertheless, on the other hand, whereas, although, despite / in spite of* |
      | **Adición** | *moreover, furthermore, in addition, besides* |
      | **Causa / efecto** | *therefore, consequently, as a result, owing to, due to, since* |
      | **Ejemplo** | *for instance, such as, namely* |
      | **Concesión** | *admittedly, granted, even so* |
      | **Resumen** | *in short, to sum up, all in all* |
      | **Atenuar** | *it seems that, arguably, tend to, somewhat, fairly* |
      | **Enfatizar** | *in fact, indeed, notably, in particular* |

      \`\`\`
      The new design is cleaner; however, it requires a migration.
      Despite being slower, the old version is more stable.
      Due to a configuration error, the service was unavailable.
      \`\`\`

      *Despite / in spite of* van seguidos de **sustantivo o -ing**; *although* va seguido de **una oración**: *Although it was slower…* / *Despite being slower…*
    `, [
      gap('The new design is cleaner; ___, it requires a migration. (sin embargo)', ['however'], '*However* conecta dos ideas contrarias.'),
      gap('___ being slower, the old version is more stable.', ['Despite~~In spite of'], '*Despite* + -ing.'),
      gap('___ it was slower, the old version was more stable.', ['Although~~Though'], '*Although* + oración.'),
      mc('¿Qué conector expresa consecuencia?', ['Consequently', 'Nevertheless', 'For instance', 'Whereas'], '*Consequently* = por consiguiente.'),
      match('Empareja', [['moreover', 'Además'], ['whereas', 'Mientras que (contraste)'], ['arguably', 'Se podría argumentar que'], ['in short', 'En resumen']]),
      mc('¿Cuál suena más cauta?', ['This approach seems to be somewhat faster.', 'This approach is the only fast one.', 'This approach is faster, period.', 'It is always faster.'], 'Atenuadores: *seems to, somewhat, tend to*.'),
      listen('Although the solution is elegant, it is arguably too complex for this use case.', 'Aunque la solución es elegante, es posiblemente demasiado compleja para este caso.'),
    ]),

    lesson('en-idioms', 'Idioms y falsos amigos', `
      **Expresiones idiomáticas del trabajo técnico**:

      | Expresión | Significado |
      |---|---|
      | *low-hanging fruit* | lo fácil y rentable que se puede hacer ya |
      | *bottleneck* | cuello de botella |
      | *the elephant in the room* | el problema evidente que nadie menciona |
      | *to move the needle* | lograr una mejora notable |
      | *to reinvent the wheel* | rehacer algo que ya existe |
      | *a rabbit hole* | tema que te absorbe sin fin |
      | *to bite the bullet* | afrontar algo desagradable |
      | *a silver bullet* | solución mágica (*no silver bullet*) |
      | *a single point of failure* | punto único de fallo |
      | *to hit the ground running* | empezar con eficacia desde el primer día |
      | *ballpark figure* | cifra aproximada |
      | *on the same page* | de acuerdo / alineados |

      **Falsos amigos**: *actually* (en realidad) ≠ actualmente (*currently*) · *eventually* (al final) ≠ eventualmente (*possibly*) · *library* ≠ librería (*bookshop*) · *sensible* (sensato) ≠ sensible (*sensitive*) · *assist* (ayudar) ≠ asistir (*attend*) · *realize* (darse cuenta) ≠ realizar (*carry out*) · *support* (apoyar) ≠ soportar (*stand / put up with*).
    `, [
      match('Empareja', [['low-hanging fruit', 'Mejora fácil y rentable'], ['bottleneck', 'Cuello de botella'], ['silver bullet', 'Solución mágica'], ['ballpark figure', 'Cifra aproximada']]),
      mc('*Actually, the build is fine* significa…', ['En realidad, la compilación está bien', 'Actualmente, la compilación está bien', 'Activamente, la compilación va bien', 'Finalmente, la compilación está bien'], '*Actually* = en realidad. Para «actualmente», *currently*.'),
      mc('¿Qué significa *to reinvent the wheel*?', ['Rehacer algo que ya existe', 'Mejorar una rueda', 'Cambiar de proyecto', 'Terminar tarde'], 'Mejor usar una biblioteca existente.'),
      gap('Let us tackle the low-hanging ___ first. (fruta)', ['fruit'], 'Empieza por lo más sencillo y valioso.'),
      mc('*He attended the meeting* se traduce como…', ['Asistió a la reunión', 'Atendió la reunión', 'Esperó la reunión', 'Presenció la reunión como espectador'], '*Attend* = asistir. *Assist* = ayudar.'),
      mc('¿Cuál es el falso amigo de «librería»?', ['library', 'bookshop', 'store', 'shelf'], '*Library* = biblioteca; librería = *bookshop / bookstore*.'),
      listen('We need to bite the bullet and migrate the legacy system.', 'Tenemos que afrontarlo y migrar el sistema heredado.'),
    ]),

    lesson('en-adv', 'Estructuras avanzadas', `
      - **Condicional 3** (pasado irreal): *If we had written tests, we would have caught the bug.*
      - **Mixto**: *If I had taken that job, I would be a manager now.*
      - **Wish / if only**: *I wish I had more time.* *I wish I had backed up the database.* *If only we had known.*
      - **Inversión** (formal): *Had we known, we would have acted. / Should you need help, contact us. / Not only did it fail, but it also corrupted the data.*
      - **Cleft sentences** (énfasis): *What we need is better monitoring.* *It was the cache that caused the outage.*
      - **Participios y cláusulas reducidas**: *Having reviewed the code, I approved it.*
      - **Verbos de causa**: *have / get something done*: *We had the servers upgraded.*
      - **Subjuntivo con suggest / recommend**: *I suggest that he **review** it.* (sin -s)
      - **Used to / be used to / get used to**: *We used to deploy manually. I'm used to working remotely.*
    `, [
      gap('If we ___ written tests, we would have caught the bug.', ['had'], 'Condicional 3: *if* + past perfect (*had* + participio).'),
      gap('I wish I ___ backed up the database. (pasado irreal)', ['had'], '*I wish* + past perfect para lamentarse del pasado.'),
      gap('___ we known about the issue, we would have acted sooner. (inversión formal)', ['Had'], '*Had we known* = *If we had known*.'),
      gap('I suggest that she ___ the logs first. (review)', ['review'], 'Tras *suggest that*, el verbo va en forma base: sin -s.'),
      mc('¿Cuál enfatiza la causa?', ['It was the cache that caused the outage.', 'The cache caused the outage.', 'The outage is caused.', 'The cache is outage.'], 'Cleft sentence: *It was … that …*'),
      mc('*We used to deploy manually* significa…', ['Antes desplegábamos manualmente', 'Estamos acostumbrados a desplegar manualmente', 'Nos acostumbramos a desplegar manualmente', 'Usamos el despliegue manual ahora'], '*Used to* + infinitivo = hábito pasado que ya no existe.'),
      listen('Had we written more tests, we would have caught the bug before the release.', 'Si hubiéramos escrito más pruebas, habríamos detectado el error antes de la publicación.'),
      tf('«Not only did it fail, but it also corrupted the data» es una inversión formal para enfatizar.', true, 'Tras *Not only* al inicio, el auxiliar va antes del sujeto: *did it fail*.'),
    ]),
  ]),
])
