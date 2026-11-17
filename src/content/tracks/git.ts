import { ask, git, lesson, match, mc, order, tf, track, unit } from '../dsl'
import type { GitSim } from '../../git/engine'

const base = ['git init', 'echo "v1" > app.txt', 'git add .', 'git commit -m "inicio"']
const parents = (g: GitSim) => g.commits.get(g.headId()!)?.parents.length ?? 0
const withBranch = [
  ...base, 'git switch -c feature', 'echo "f" > f.txt', 'git add .', 'git commit -m "feature"', 'git switch main',
]
const clone = (url = 'https://github.com/u/p.git') => ['@remote-commit main "inicio" README.md "hola"', `git clone ${url}`]

export default track('git', 'bash', [
  unit('git1', 'Lo esencial', 'basico', 'Crear un repositorio, preparar cambios, leer el historial y deshacer errores.', [
    lesson('git-first', 'Tu primer repositorio', `
      **Git** guarda el historial de tu proyecto como una cadena de **commits**: instantáneas con autor, fecha y mensaje.

      \`\`\`bash
      git init                       # convierte la carpeta en repositorio
      git status                     # ¿qué ha cambiado?
      git add README.md              # prepara el archivo (staging)
      git commit -m "Primer commit"  # guarda la instantánea
      \`\`\`

      Tres zonas, y el trabajo fluye de izquierda a derecha:

      - **Directorio de trabajo**: tus archivos tal cual.
      - **Área de preparación (staging / index)**: lo que irá en el próximo commit.
      - **Repositorio**: la historia ya guardada (carpeta oculta \`.git\`).

      > Los comandos de esta lección los puedes **practicar en el simulador**: escribe exactamente lo que escribirías en una terminal.
    `, [
      git('Inicializa un repositorio nuevo.', [], ['git init'], (g) => g.inited, 'El comando es `git init`.'),
      git('Hay un archivo `README.md` sin seguimiento. Añádelo y haz un commit con el mensaje «inicio».',
        ['git init', 'echo "hola" > README.md'], ['git add README.md', 'git commit -m "inicio"'],
        (g) => g.count() === 1 && g.clean() && g.msgs()[0] === 'inicio', 'Primero `git add`, después `git commit -m "mensaje"`.'),
      mc('¿Qué crea `git init`?', ['Una carpeta oculta `.git` con toda la historia del proyecto', 'Un repositorio en GitHub', 'Un archivo `README.md`', 'Una copia de seguridad en la nube'], 'Git es local: no necesita servidor. GitHub es un servicio aparte para alojar repositorios remotos.'),
      order('Ordena el flujo básico para guardar un cambio', ['Editar los archivos', '`git add` para preparar los cambios', '`git commit -m "mensaje"` para guardarlos']),
      match('Empareja cada zona con su descripción', [
        ['Directorio de trabajo', 'Los archivos que editas'],
        ['Staging (index)', 'Lo que irá en el próximo commit'],
        ['Repositorio', 'La historia de commits ya guardada'],
      ]),
      ask('¿Qué comando muestra qué archivos han cambiado y cuáles están preparados?', ['git status'], '`git status` es el comando que más usarás: úsalo constantemente.'),
      tf('Git necesita conexión a internet para hacer commits.', false, 'Los commits son locales. Solo hace falta red al sincronizar con un remoto (`push`, `pull`, `fetch`).'),
    ]),

    lesson('git-stage', 'Staging y estados', `
      Cada archivo está en uno de estos estados:

      - **Untracked**: nuevo, Git aún no lo sigue.
      - **Modified**: cambió desde el último commit.
      - **Staged**: preparado para el próximo commit.
      - **Committed**: guardado.

      \`\`\`bash
      git add app.py          # prepara un archivo concreto
      git add .               # prepara todo lo del directorio actual
      git diff                # cambios sin preparar
      git diff --staged       # cambios ya preparados
      \`\`\`

      El staging te deja **construir commits pequeños y coherentes** aunque hayas tocado muchos archivos.

      > \`.gitignore\` lista lo que Git no debe seguir: dependencias (\`node_modules/\`), compilados, secretos (\`.env\`).
    `, [
      git('Modificaste `app.txt` y creaste `notas.txt`. Haz commit **solo** de `app.txt`; `notas.txt` debe quedar sin seguimiento.',
        [...base, 'echo "v2" > app.txt', 'echo "borrador" > notas.txt'], ['git add app.txt', 'git commit -m "actualiza app"'],
        (g) => g.count() === 2 && g.untracked().includes('notas.txt') && g.modified().length === 0, 'Añade el archivo por su nombre en lugar de usar `git add .`.'),
      git('Hay cambios en `app.txt` y un archivo nuevo. Prepáralos todos y haz commit.',
        [...base, 'echo "v2" > app.txt', 'echo "x" > nuevo.txt'], ['git add .', 'git commit -m "cambios"'],
        (g) => g.count() === 2 && g.clean(), '`git add .` prepara todo.'),
      mc('¿Qué muestra `git diff --staged`?', ['Los cambios preparados que irán en el próximo commit', 'Los cambios que aún no has preparado', 'La diferencia entre dos ramas', 'El historial de commits'], '`git diff` a secas compara el directorio de trabajo con el staging.'),
      ask('¿Qué archivo lista los patrones de archivos que Git debe ignorar?', ['.gitignore', 'gitignore'], 'Se guarda en la raíz del proyecto y se sube al repositorio.'),
      mc('Tienes `.env` con contraseñas. ¿Qué haces?', ['Añadirlo a `.gitignore` antes del primer commit', 'Subirlo: es privado de todos modos', 'Subirlo y luego borrarlo', 'Cambiarle el nombre a `.env.txt`'], 'Lo subido a git queda en el historial para siempre: si se filtra una clave, hay que revocarla.'),
      match('Empareja cada estado con su significado', [
        ['Untracked', 'Archivo nuevo que Git aún no sigue'],
        ['Modified', 'Cambió desde el último commit'],
        ['Staged', 'Preparado para el próximo commit'],
        ['Committed', 'Guardado en el historial'],
      ]),
    ]),

    lesson('git-log', 'Historial', `
      \`\`\`bash
      git log                  # historial completo
      git log --oneline        # una línea por commit
      git log --oneline --graph --all   # con el grafo de ramas
      git show <commit>        # cambios de un commit
      git diff a..b            # diferencias entre dos puntos
      git blame archivo        # quién cambió cada línea y cuándo
      \`\`\`

      Referencias útiles:

      - \`HEAD\`: el commit en el que estás.
      - \`HEAD~1\` (o \`HEAD^\`): su padre. \`HEAD~3\`: tres commits atrás.
      - Nombres de rama y etiquetas, y el hash (basta un prefijo de 7 caracteres).

      Para corregir el **último** commit (aún sin publicar): \`git commit --amend\`.
    `, [
      git('El mensaje del último commit tiene una errata. Cámbialo por «version inicial».',
        base, ['git commit --amend -m "version inicial"'],
        (g) => g.count() === 1 && g.msgs()[0] === 'version inicial', 'Usa `git commit --amend -m "..."`.'),
      ask('¿Qué opción de `git log` muestra cada commit en una sola línea?', ['--oneline', 'git log --oneline'], 'Combínala con `--graph --all` para ver las ramas.'),
      mc('¿A qué commit se refiere `HEAD~2`?', ['Al abuelo del commit actual (dos hacia atrás)', 'Al segundo commit del proyecto', 'A dos commits hacia delante', 'Al commit con hash que empieza por 2'], '`~n` sube n padres desde la referencia.'),
      match('Empareja cada comando con lo que hace', [
        ['`git log`', 'Lista el historial de commits'],
        ['`git show`', 'Muestra los cambios de un commit'],
        ['`git diff`', 'Compara versiones'],
        ['`git blame`', 'Indica quién modificó cada línea'],
      ]),
      tf('`git commit --amend` es seguro en commits que ya has subido y otros compañeros han descargado.', false, 'Reescribe el commit (cambia su hash). Hacerlo sobre historia compartida obliga a los demás a reconciliar.'),
      mc('¿Qué es `HEAD`?', ['Un puntero al commit (o rama) en el que estás ahora mismo', 'La primera versión del proyecto', 'La rama principal', 'El último commit del remoto'], 'Normalmente apunta a una rama, y esta apunta a su último commit.'),
    ]),

    lesson('git-undo', 'Deshacer cambios', `
      Qué comando usar depende de **dónde está el error**:

      \`\`\`bash
      git restore archivo              # descarta cambios sin preparar (¡irreversible!)
      git restore --staged archivo     # saca el archivo del staging (conserva los cambios)
      git reset --soft HEAD~1          # deshace el commit; los cambios quedan preparados
      git reset --mixed HEAD~1         # deshace el commit; los cambios quedan sin preparar
      git reset --hard HEAD~1          # deshace el commit Y descarta los cambios
      git revert <commit>              # crea un commit nuevo que invierte a otro
      \`\`\`

      Regla práctica:

      - Commit **local**, sin compartir → \`reset\`.
      - Commit **ya publicado** → \`revert\`: no reescribe la historia de los demás.
    `, [
      git('Preparaste `app.txt` por error. Sácalo del staging **sin perder** los cambios.',
        [...base, 'echo "v2" > app.txt', 'git add app.txt'], ['git restore --staged app.txt'],
        (g) => g.staged().length === 0 && g.file('app.txt') === 'v2', 'Usa `git restore --staged`.'),
      git('Rompiste `app.txt` y quieres volver a la versión del último commit.',
        [...base, 'echo "roto" > app.txt'], ['git restore app.txt'],
        (g) => g.file('app.txt') === 'v1' && g.clean(), '`git restore <archivo>` descarta los cambios del directorio de trabajo.'),
      git('Hiciste un commit demasiado pronto. Deshazlo pero deja los cambios **preparados** (staged).',
        [...base, 'echo "v2" > app.txt', 'git add .', 'git commit -m "cambio"'], ['git reset --soft HEAD~1'],
        (g) => g.count() === 1 && g.staged().includes('app.txt'), '`--soft` mantiene los cambios en el staging.'),
      git('El último commit ya está publicado y es erróneo. Inviértelo sin reescribir la historia.',
        [...base, 'echo "v2" > app.txt', 'git add .', 'git commit -m "cambio malo"'], ['git revert HEAD'],
        (g) => g.count() === 3 && g.file('app.txt') === 'v1' && g.msgs()[0].startsWith('Revert'), '`git revert` crea un commit nuevo que deshace a otro.'),
      git('Deshaz el último commit **y descarta** por completo sus cambios.',
        [...base, 'echo "v2" > app.txt', 'git add .', 'git commit -m "experimento"'], ['git reset --hard HEAD~1'],
        (g) => g.count() === 1 && g.file('app.txt') === 'v1' && g.clean(), '`--hard` también reescribe el directorio de trabajo.'),
      mc('Un commit con un bug ya está en `main` y tus compañeros lo han descargado. ¿Qué usas?', ['`git revert`', '`git reset --hard` y `push --force`', '`git commit --amend`', 'Borrar el repositorio y volver a clonarlo'], '`revert` añade un commit nuevo: no rompe el historial compartido.'),
    ]),
  ]),

  unit('git2', 'Ramas', 'intermedio', 'Trabajar en paralelo: ramas, merge, conflictos, rebase y herramientas finas.', [
    lesson('git-branch', 'Ramas', `
      Una **rama** es simplemente un **puntero móvil a un commit**: crearlas es instantáneo y gratis. Úsalas para cada tarea.

      \`\`\`bash
      git branch                    # lista las ramas
      git switch -c feature/login   # crea y cambia a la rama nueva
      git switch main               # vuelve a main
      git branch -d feature/login   # borra una rama ya fusionada
      git branch -m nuevo-nombre    # renombra la actual
      \`\`\`

      \`git checkout\` hace lo mismo que \`switch\` (y mucho más); \`switch\` y \`restore\` se crearon para separar esas responsabilidades.

      > Cambiar de rama reescribe el directorio de trabajo con los archivos de esa rama.
    `, [
      git('Crea la rama `feature` y cámbiate a ella.', base, ['git switch -c feature'],
        (g) => g.currentBranch() === 'feature' && g.branchId('feature') === g.headId(), '`git switch -c <nombre>`.'),
      git('Estás en la rama `feature`. Haz un commit con el archivo nuevo `f.txt` (`main` no debe cambiar).',
        [...base, 'git switch -c feature', 'echo "f" > f.txt'], ['git add .', 'git commit -m "feature"'],
        (g) => g.count('feature') === 2 && g.count('main') === 1, 'Los commits avanzan solo la rama actual.'),
      git('La rama `hotfix` ya se fusionó. Bórrala.', [...base, 'git branch hotfix'], ['git branch -d hotfix'],
        (g) => !('hotfix' in g.branches), '`git branch -d <nombre>`.'),
      git('La rama principal se llama `master`; renómbrala a `main`.',
        ['git init -b master', 'echo "v1" > app.txt', 'git add .', 'git commit -m "inicio"'], ['git branch -m main'],
        (g) => g.currentBranch() === 'main' && !('master' in g.branches), '`git branch -m <nuevo>` renombra la rama actual.'),
      mc('¿Qué es técnicamente una rama en Git?', ['Un puntero a un commit', 'Una copia completa de todos los archivos', 'Un directorio aparte', 'Un archivo de configuración'], 'Por eso crear ramas es instantáneo: solo se escribe una referencia de 40 caracteres.'),
      ask('¿Qué comando moderno crea una rama y cambia a ella a la vez? (formato `git ... -c nombre`)', ['git switch -c', 'git switch -c nombre'], 'La alternativa clásica es `git checkout -b nombre`.'),
      match('Empareja cada comando con su acción', [
        ['`git switch rama`', 'Cambia a otra rama'],
        ['`git branch -d rama`', 'Borra una rama ya fusionada'],
        ['`git branch -m nombre`', 'Renombra la rama actual'],
        ['`git branch`', 'Lista las ramas locales'],
      ]),
    ]),

    lesson('git-merge', 'Merge y conflictos', `
      \`git merge rama\` incorpora los cambios de \`rama\` en la rama actual:

      - **Fast-forward**: si la actual no ha avanzado, Git solo mueve el puntero.
      - **Merge commit**: si ambas ramas divergieron, crea un commit con **dos padres**.

      Cuando dos ramas tocan **las mismas líneas**, hay un **conflicto**. Git deja marcas en el archivo:

      \`\`\`
      <<<<<<< HEAD
      tu versión
      =======
      versión de la otra rama
      >>>>>>> feature
      \`\`\`

      Para resolverlo: **edita** el archivo dejando el resultado correcto, **\`git add\`** y **\`git commit\`**. Para cancelar: \`git merge --abort\`.
    `, [
      git('`feature` tiene un commit nuevo y `main` no ha cambiado. Fusiónala en `main`.', withBranch, ['git merge feature'],
        (g) => g.currentBranch() === 'main' && g.branchId('main') === g.branchId('feature') && g.count() === 2, 'Será un *fast-forward*: no se crea un commit de merge.'),
      git('Ambas ramas avanzaron con archivos distintos. Fusiona `feature` en `main`; debe crearse un commit de merge.',
        [...withBranch, 'echo "m" > m.txt', 'git add .', 'git commit -m "main avanza"'], ['git merge feature'],
        (g) => parents(g) === 2 && g.file('f.txt') === 'f' && g.file('m.txt') === 'm', 'Sin conflictos, Git fusiona solo.'),
      git('Al fusionar `feature` habrá un **conflicto** en `app.txt`. Resuélvelo dejando el contenido «resuelto» y completa el merge.',
        [...base, 'git switch -c feature', 'echo "de feature" > app.txt', 'git add .', 'git commit -m "feature cambia app"', 'git switch main', 'echo "de main" > app.txt', 'git add .', 'git commit -m "main cambia app"'],
        ['git merge feature', 'echo "resuelto" > app.txt', 'git add app.txt', 'git commit -m "merge feature"'],
        (g) => g.merging === null && parents(g) === 2 && g.file('app.txt') === 'resuelto', 'Tras el conflicto: edita el archivo, `git add` y `git commit`.'),
      git('Empezaste a fusionar `feature` y apareció un conflicto que no quieres resolver ahora. Cancela el merge.',
        [...base, 'git switch -c feature', 'echo "de feature" > app.txt', 'git add .', 'git commit -m "feature"', 'git switch main', 'echo "de main" > app.txt', 'git add .', 'git commit -m "main"', 'git merge feature'],
        ['git merge --abort'], (g) => g.merging === null && g.clean() && g.file('app.txt') === 'de main', '`git merge --abort` vuelve al estado previo al merge.'),
      order('Ordena los pasos para resolver un conflicto', ['`git merge rama` avisa del conflicto', 'Abrir el archivo y dejar el contenido correcto (borrando las marcas)', '`git add archivo` para marcarlo como resuelto', '`git commit` para completar el merge']),
      mc('¿Qué significan las marcas `<<<<<<<`, `=======` y `>>>>>>>`?', ['Delimitan tu versión y la de la otra rama; hay que editarlas y quitarlas', 'Son comentarios que Git ignora', 'Indican que el archivo es binario', 'Indican el commit padre'], 'Si las dejas en el archivo y haces commit, estarás subiendo basura a la rama.'),
    ]),

    lesson('git-rebase', 'Rebase', `
      \`git rebase main\` **reaplica** los commits de tu rama encima del último commit de \`main\`, como si hubieras empezado desde ahí. El resultado es una historia **lineal**, sin commit de merge:

      \`\`\`
      antes:   A─B─C  (main)         después:  A─B─C  (main)
                 \\                                    \\
                  D─E  (feature)                      D'─E'  (feature)
      \`\`\`

      - Los commits **se recrean**: tienen hashes nuevos (D' ≠ D).
      - Si hay conflictos, se resuelven commit a commit.
      - Con \`git rebase -i\` puedes reordenar, juntar (*squash*) o editar commits antes de abrir un PR.

      > **Regla de oro**: no hagas rebase de commits que ya has publicado y otros usan. Reescribirías su historia.
    `, [
      git('`feature` quedó atrás: `main` tiene un commit nuevo. Pon tu rama sobre `main` con rebase, para que el historial sea lineal.',
        [...withBranch, 'echo "m" > m.txt', 'git add .', 'git commit -m "main avanza"', 'git switch feature'], ['git rebase main'],
        (g) => g.history().every((c) => c.parents.length <= 1) && g.count() === 3 && g.isAncestor(g.branchId('main'), g.branchId('feature')), 'Estando en `feature`: `git rebase main`.'),
      mc('¿Qué diferencia hay entre el resultado de `merge` y de `rebase`?', ['`merge` conserva la forma real de la historia con un commit de unión; `rebase` la deja lineal reescribiendo commits', 'Ninguna', '`rebase` conserva los hashes originales', '`merge` borra la rama fusionada'], 'Ambos integran los mismos cambios; difieren en cómo queda la historia.'),
      tf('Tras un rebase, los commits rebasados conservan sus hashes originales.', false, 'Cambia el padre, así que cambia el hash: son commits nuevos con el mismo contenido y mensaje.'),
      mc('¿Cuándo NO debes hacer rebase?', ['Sobre commits ya publicados que otras personas han descargado', 'En una rama local que solo usas tú', 'Antes de abrir un pull request', 'Cuando quieres un historial limpio'], 'La regla de oro: no reescribas historia compartida.'),
      match('Empareja cada operación con su uso típico', [
        ['`git merge`', 'Integrar una rama conservando la historia tal cual'],
        ['`git rebase main`', 'Actualizar tu rama sobre la última versión de main'],
        ['`git rebase -i`', 'Limpiar tus commits antes de compartirlos'],
        ['`git merge --abort`', 'Cancelar un merge en conflicto'],
      ]),
    ]),

    lesson('git-pick', 'cherry-pick, stash y tags', `
      Tres herramientas pequeñas que te sacan de apuros:

      \`\`\`bash
      git cherry-pick <commit>   # copia UN commit de otra rama a la actual
      git stash                  # guarda los cambios sin commitear y deja el directorio limpio
      git stash pop              # los recupera
      git stash list
      git tag v1.0.0             # etiqueta fija en un commit (versiones)
      git tag -a v1.0.0 -m "…"   # etiqueta anotada
      \`\`\`

      - **cherry-pick**: llevar un arreglo concreto a otra rama (p. ej. a una rama de *release*).
      - **stash**: estás a medias y necesitas cambiar de rama para atender algo urgente.
      - **tag**: marca versiones. Una rama se mueve; una etiqueta no.
    `, [
      git('`feature` tiene dos commits, pero solo quieres el **último** (`f2.txt`) en `main`. Cópialo con cherry-pick.',
        [...base, 'git switch -c feature', 'echo "1" > f1.txt', 'git add .', 'git commit -m "f1"', 'echo "2" > f2.txt', 'git add .', 'git commit -m "f2"', 'git switch main'],
        ['git cherry-pick feature'], (g) => g.currentBranch() === 'main' && g.file('f2.txt') === '2' && g.file('f1.txt') === undefined && g.count() === 2, 'Copia el commit al que apunta `feature`.'),
      git('Tienes cambios a medias en `app.txt` y debes dejar el directorio limpio. Guárdalos con stash.',
        [...base, 'echo "wip" > app.txt'], ['git stash'], (g) => g.stash.length === 1 && g.clean() && g.file('app.txt') === 'v1', '`git stash` los aparta.'),
      git('Ya atendiste la urgencia. Recupera los cambios que guardaste en el stash.',
        [...base, 'echo "wip" > app.txt', 'git stash'], ['git stash pop'], (g) => g.file('app.txt') === 'wip' && g.stash.length === 0, '`git stash pop` los aplica y los quita del stash.'),
      git('Publica la versión: etiqueta el commit actual como `v1.0`.', base, ['git tag v1.0'],
        (g) => g.tags['v1.0'] !== undefined && g.tags['v1.0'] === g.headId(), '`git tag <nombre>`.'),
      mc('¿Cuándo usarías `git stash`?', ['Cuando necesitas cambiar de contexto sin hacer commit de trabajo a medias', 'Para borrar un commit', 'Para fusionar dos ramas', 'Para subir cambios al remoto'], 'Es un cajón temporal para tus cambios.'),
      mc('¿En qué se diferencia una etiqueta (tag) de una rama?', ['La etiqueta no se mueve: siempre apunta al mismo commit', 'Son lo mismo', 'La etiqueta solo existe en el remoto', 'La rama no puede tener nombre'], 'Por eso las etiquetas se usan para versiones.'),
    ]),
  ]),

  unit('git3', 'En equipo', 'avanzado', 'Remotos, pull requests, buenos commits y cómo rescatar trabajo «perdido».', [
    lesson('git-remote', 'Remotos', `
      Un **remoto** es una copia del repositorio en otro sitio (GitHub, GitLab…). Por convención se llama \`origin\`.

      \`\`\`bash
      git clone <url>                 # descarga el repositorio completo
      git remote add origin <url>     # vincula un repo local con un remoto
      git push -u origin main         # sube la rama y la deja como «upstream»
      git fetch                       # descarga novedades SIN integrarlas
      git pull                        # fetch + merge
      git pull --rebase               # fetch + rebase (historia lineal)
      \`\`\`

      - \`origin/main\` es tu **copia local de la rama remota**; \`fetch\` la actualiza.
      - Si el remoto tiene commits que no tienes, \`git push\` se **rechaza**: primero integra (\`pull\`) y luego sube.
      - \`push --force\` reescribe la rama remota: solo en ramas tuyas y con \`--force-with-lease\`.
    `, [
      git('Acabas de crear un repo local y un remoto vacío. Sube `main` y deja configurado el seguimiento (upstream).',
        [...base, 'git remote add origin https://github.com/u/p.git'], ['git push -u origin main'],
        (g) => g.remote?.main === g.headId() && g.upstream.main === 'main', '`git push -u origin main`.'),
      git('Descarga el repositorio de `https://github.com/u/p.git`.', ['@remote-commit main "inicio" README.md "hola"'], ['git clone https://github.com/u/p.git'],
        (g) => g.inited && g.currentBranch() === 'main' && g.file('README.md') === 'hola', '`git clone <url>`.'),
      git('Un compañero subió un commit nuevo a `main`. Descárgalo e intégralo en tu rama.',
        [...clone(), '@remote-commit main "docs" docs.md "nuevo"'], ['git pull'],
        (g) => g.file('docs.md') === 'nuevo' && g.count() === 2, '`git pull` hace fetch y merge.'),
      git('Tu `git push` fue **rechazado**: el remoto tiene un commit que no tienes. Integra sus cambios con rebase y sube los tuyos.',
        [...clone(), 'echo "mio" > local.txt', 'git add .', 'git commit -m "local"', '@remote-commit main "docs" docs.md "nuevo"'],
        ['git pull --rebase', 'git push'], (g) => !!g.remote && g.remote.main === g.headId() && g.file('docs.md') === 'nuevo' && g.file('local.txt') === 'mio',
        'Primero `git pull --rebase` y después `git push`.'),
      mc('¿Qué diferencia hay entre `git fetch` y `git pull`?', ['`fetch` solo descarga; `pull` descarga e integra', '`pull` solo descarga; `fetch` integra', 'Ninguna', '`fetch` sube cambios'], '`fetch` es seguro: nunca toca tu trabajo. Permite revisar antes de integrar.'),
      ask('¿Qué comando muestra las URLs de los remotos configurados?', ['git remote -v'], '`-v` es *verbose*: muestra las URLs de fetch y push.'),
      mc('¿Cuándo es aceptable `git push --force-with-lease`?', ['En una rama propia que reescribiste (p. ej. tras un rebase), nunca en la rama compartida', 'Siempre que un push sea rechazado', 'En `main`, para arreglar errores', 'Nunca'], 'Es más seguro que `--force`: falla si alguien subió algo que no has visto.'),
    ]),

    lesson('git-flow', 'Pull requests y flujos de trabajo', `
      Un **pull request** (PR) propone integrar una rama y abre la conversación: revisión de código, comentarios, CI y aprobación.

      **Flujo típico (GitHub flow)**

      1. Crea una rama desde \`main\` actualizada: \`feature/login\`.
      2. Haz commits pequeños y sube la rama.
      3. Abre un PR con descripción clara y enlaza la incidencia.
      4. La **CI** ejecuta tests y linters; otras personas revisan.
      5. Se aprueban los cambios y se fusiona (*merge*, *squash* o *rebase*).
      6. Se borra la rama.

      **Otros modelos**

      - **Trunk-based**: ramas muy cortas (horas), integración continua en \`main\`, *feature flags*.
      - **Git Flow**: ramas \`develop\`, \`release/*\`, \`hotfix/*\`. Más pesado; útil con versiones planificadas.

      > Protege \`main\`: exige PR, revisiones y CI en verde antes de fusionar.
    `, [
      order('Ordena el flujo de un pull request', ['Crear una rama desde `main`', 'Commits y push de la rama', 'Abrir el pull request', 'Revisión de código y CI en verde', 'Fusionar y borrar la rama']),
      mc('¿Qué opción deja una sola commit en `main` por PR, agrupando todos los de la rama?', ['*Squash and merge*', '*Create a merge commit*', '*Rebase and merge*', '*Close pull request*'], 'Mantiene `main` con un commit por funcionalidad, a costa de perder el detalle de los commits intermedios.'),
      match('Empareja cada flujo con su característica', [
        ['GitHub flow', 'Ramas cortas desde main y PR'],
        ['Trunk-based', 'Integración casi continua en una sola rama principal'],
        ['Git Flow', 'Ramas develop, release y hotfix'],
      ]),
      mc('¿Para qué sirve proteger la rama `main`?', ['Para exigir PR, revisiones y CI antes de fusionar', 'Para que nadie pueda leerla', 'Para que sea más rápida', 'Para cifrar el código'], 'Evita subir directamente y hace que cada cambio pase por revisión y pruebas.'),
      tf('Un buen PR es pequeño, tiene un único propósito y explica el porqué del cambio.', true, 'Los PR enormes se revisan mal y esconden errores.'),
      mc('Eres revisor y encuentras un problema de estilo menor. ¿Cómo lo comentas?', ['Con una sugerencia concreta y un tono respetuoso, marcándolo como detalle menor', 'Rechazando el PR sin explicación', 'Reescribiéndolo tú mismo sin avisar', 'Ignorándolo'], 'Una buena revisión es específica, amable y distingue lo bloqueante de lo opcional.'),
    ]),

    lesson('git-commits', 'Buenos commits', `
      Un historial legible es documentación viva. Reglas:

      - **Commits atómicos**: un cambio lógico por commit, que compile y pase los tests.
      - Mensaje: **resumen corto en imperativo** (≤ 50 caracteres), y si hace falta, una línea en blanco y el *porqué*.
      - No mezcles refactor y funcionalidad en el mismo commit.

      **Conventional Commits** da un formato estándar y habilita versionado automático:

      \`\`\`
      feat(login): permite entrar con Google
      fix: corrige el redondeo en el total
      docs: actualiza el README
      refactor / test / chore / perf
      feat!: cambia el formato de la API   ← cambio incompatible (major)
      \`\`\`

      > Si no sabes cómo describir un commit en una frase, probablemente hace demasiadas cosas.
    `, [
      git('Corrige un bug: haz commit del cambio en `app.txt` con un mensaje en formato Conventional Commits que empiece por `fix:`.',
        [...base, 'echo "v2" > app.txt'], ['git add .', 'git commit -m "fix: corrige el valor de app"'],
        (g) => g.count() === 2 && /^fix(\(.+\))?: .+/.test(g.msgs()[0]), 'Formato: `tipo: descripción`.'),
      mc('¿Cuál es el mejor mensaje de commit?', ['`fix: evita división por cero en el cálculo del total`', '`cambios`', '`arreglos varios y refactor del módulo de pagos`', '`WIP`'], 'Describe qué y dónde, en imperativo, y es un único cambio lógico.'),
      match('Empareja cada prefijo de Conventional Commits con su significado', [
        ['`feat`', 'Nueva funcionalidad'],
        ['`fix`', 'Corrección de un error'],
        ['`docs`', 'Solo documentación'],
        ['`refactor`', 'Cambio interno sin alterar el comportamiento'],
      ]),
      mc('¿Qué es un commit atómico?', ['Un único cambio lógico y completo, que compila y pasa los tests', 'Un commit que no se puede deshacer', 'Un commit muy pequeño de una línea', 'Un commit hecho al final del día'], 'Facilita revisar, revertir con `git revert` y localizar bugs con `git bisect`.'),
      tf('Es buena práctica subir un único commit gigante que incluya toda una funcionalidad.', false, 'Los commits pequeños y coherentes se revisan, revierten y depuran mucho mejor.'),
      mc('¿Qué indica un `!` tras el tipo, como en `feat!: nueva API`?', ['Un cambio incompatible (*breaking change*)', 'Que el commit es urgente', 'Que es un borrador', 'Que está firmado'], 'En versionado semántico implica subir la versión mayor.'),
    ]),

    lesson('git-rescue', 'Rescate: reflog y bisect', `
      Git casi nunca pierde nada: aunque un commit deje de ser alcanzable desde una rama, sigue existiendo un tiempo.

      \`\`\`bash
      git reflog              # diario de TODOS los movimientos de HEAD
      git reset --hard HEAD@{1}   # vuelve a donde estabas hace un movimiento
      git branch rescate <hash>   # crea una rama en un commit «perdido»
      \`\`\`

      \`git bisect\` encuentra **qué commit introdujo un bug** con búsqueda binaria:

      \`\`\`bash
      git bisect start
      git bisect bad              # el commit actual tiene el bug
      git bisect good v1.0        # esta versión funcionaba
      # Git te lleva al commit intermedio: pruebas y marcas good / bad…
      git bisect reset
      \`\`\`

      Con 1 000 commits, bisect necesita unos 10 pasos (log₂ 1000).
    `, [
      git('Hiciste `git reset --hard HEAD~1` por error y perdiste el commit «trabajo importante». Recupéralo con el reflog.',
        [...base, 'echo "v2" > app.txt', 'git add .', 'git commit -m "trabajo importante"', 'git reset --hard HEAD~1'], ['git reset --hard HEAD@{1}'],
        (g) => g.count() === 2 && g.msgs()[0] === 'trabajo importante' && g.file('app.txt') === 'v2', '`git reflog` te muestra los movimientos; `HEAD@{1}` es la posición anterior.'),
      mc('¿Qué registra `git reflog`?', ['Cada movimiento de HEAD en tu repositorio local', 'El historial de commits de un remoto', 'Los cambios de un archivo', 'Los errores de git'], 'Es local y temporal (≈90 días), pero salva de muchos desastres.'),
      mc('Tienes 1 000 commits entre una versión buena y otra mala. ¿Cuántos pasos necesita `git bisect` aproximadamente?', ['10', '1 000', '500', '100'], 'Es búsqueda binaria: cada paso descarta la mitad. log₂(1000) ≈ 10.'),
      order('Ordena el uso de `git bisect`', ['`git bisect start`', 'Marcar el commit actual como `bad`', 'Marcar una versión antigua como `good`', 'Probar y marcar cada commit que Git proponga', '`git bisect reset` al terminar']),
      tf('Tras un `git reset --hard`, el commit descartado desaparece inmediatamente para siempre.', false, 'Sigue en la base de datos de Git y es localizable con `git reflog` hasta que el recolector lo limpie.'),
      mc('Borraste una rama sin fusionar por error. ¿Cómo la recuperas?', ['Buscando su último commit en `git reflog` y creando una rama ahí', 'No se puede', 'Con `git undelete`', 'Clonando de nuevo el remoto siempre'], 'Una rama es solo un puntero: el commit sigue existiendo.'),
    ]),
  ]),
])
