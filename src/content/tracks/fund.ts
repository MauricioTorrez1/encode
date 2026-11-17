import { as, ask, bug, code, fill, lesson, match, mc, num, order, predict, tf, track, unit } from '../dsl'

type D = Parameters<typeof as>[1]
const py = <T extends D>(e: T): T => as('python', e)
const sh = <T extends D>(e: T): T => as('bash', e)
const sql = <T extends D>(e: T): T => as('sql', e)

export default track('fund', undefined, [
  unit('fu1', 'La máquina', 'basico', 'Cómo representa y ejecuta información un ordenador: bits, tipos, memoria y compilación.', [
    lesson('fu-bin', 'Binario y hexadecimal', `
      Un ordenador solo entiende **bits** (0 y 1). Un número en **binario** usa potencias de 2:

      \`\`\`
      1011₂ = 1×8 + 0×4 + 1×2 + 1×1 = 11
      \`\`\`

      El **hexadecimal** (base 16: 0-9 y A-F) agrupa 4 bits en un dígito: lo verás en colores (\`#FF8800\`), direcciones de memoria y hashes.

      \`\`\`
      0xFF = 15×16 + 15 = 255        1111 1111₂ = FF₁₆
      \`\`\`

      - Con **n bits** se representan 2ⁿ valores: 8 bits → 256 (0 a 255).
      - Un **byte** = 8 bits. 1 KiB = 1024 bytes.
      - Los negativos se guardan en **complemento a dos**: con 8 bits, \`-1\` es \`11111111\`.
    `, [
      py(predict(`print(bin(10), hex(255), int("ff", 16))`, '0b1010 0xff 255')),
      num('¿Cuántos valores distintos se pueden representar con 10 bits?', 1024, '2¹⁰ = 1024.'),
      ask('Convierte 13 a binario', ['1101', '0b1101', '00001101'], '13 = 8 + 4 + 1 → 1101.'),
      ask('Convierte 0xA3 a decimal', ['163'], '0xA3 = 10×16 + 3 = 163.'),
      mc('¿Por qué los desarrolladores usan hexadecimal para valores binarios?', ['Cada dígito hex equivale exactamente a 4 bits, es compacto y fácil de convertir', 'Porque es más rápido de calcular para la CPU', 'Porque el hexadecimal ocupa menos memoria', 'Porque el binario no se puede escribir'], 'Un byte son siempre dos dígitos hex: 0x00 a 0xFF.'),
      py(predict(`print((255 + 1) & 0xFF)`, '0', 'Un byte solo guarda 8 bits: 256 («1 0000 0000») desborda y se queda en 0.')),
      mc('En complemento a dos con 8 bits, ¿cómo se representa -1?', ['11111111', '10000001', '00000001', '10000000'], 'Es el patrón con todos los bits a 1: sumar 1 da 0 (con desbordamiento).'),
    ]),

    lesson('fu-types', 'Bits, bytes y tipos de datos', `
      Todo es bytes; el **tipo** dice cómo interpretarlos:

      - **Enteros** de tamaño fijo (8/16/32/64 bits): pueden **desbordarse**.
      - **Coma flotante** (IEEE 754): aproxima decimales con error. \`0.1 + 0.2 ≠ 0.3\`.
      - **Texto**: cada carácter se mapea a un número (Unicode) y se guarda con una **codificación**. UTF-8 usa 1 a 4 bytes por carácter: la \`A\` ocupa 1 byte, la \`ñ\` 2, el emoji 4.
      - **Booleanos**, **nulos** y estructuras compuestas.

      \`\`\`
      ord("A") == 65        chr(65) == "A"
      \`\`\`

      > Para **dinero** nunca uses \`float\`: usa enteros (céntimos) o tipos decimales exactos.
    `, [
      py(predict(`print(0.1 + 0.2 == 0.3)
print(round(0.1 + 0.2, 2) == 0.3)`, `
        False
        True`, 'El 0.1 no se puede representar exactamente en binario: hay un pequeño error. Compara con tolerancia o redondea.')),
      py(predict(`print(ord("A"), chr(66))`, '65 B')),
      py(predict(`print(len("a".encode("utf-8")), len("ñ".encode("utf-8")))`, '1 2', 'En UTF-8 los caracteres no ASCII ocupan varios bytes.')),
      mc('¿Cómo guardarías 19,99 € en una base de datos sin perder precisión?', ['Como 1999 céntimos en un entero (o un tipo DECIMAL)', 'Como `float`', 'Como texto "19.99" siempre', 'Como `double`'], 'Los enteros en céntimos evitan errores de redondeo en sumas y porcentajes.'),
      mc('Un `uint8` vale 255 y le sumas 1. En muchos lenguajes compilados, ¿qué resulta?', ['0 (desbordamiento: *overflow*)', '256', 'Un error siempre', '-1'], 'En Rust modo debug haría panic; en C, el comportamiento sin signo es dar la vuelta.'),
      match('Empareja cada tipo con un uso típico', [
        ['Entero de 64 bits', 'Identificadores y contadores grandes'],
        ['Coma flotante', 'Mediciones científicas y gráficos'],
        ['Decimal exacto / entero en céntimos', 'Importes de dinero'],
        ['UTF-8', 'Codificación de texto de uso universal'],
      ]),
      tf('Un emoji ocupa siempre 1 byte en UTF-8.', false, 'Ocupa normalmente 4 bytes. UTF-8 es de longitud variable (1 a 4).'),
    ]),

    lesson('fu-mem', 'Memoria: stack y heap', `
      Un programa en ejecución usa dos zonas principales de memoria:

      | | **Stack (pila)** | **Heap (montón)** |
      |---|---|---|
      | Contenido | Variables locales, llamadas | Objetos de tamaño dinámico |
      | Gestión | Automática (LIFO) | Manual o recolector de basura |
      | Velocidad | Muy rápida | Más lenta |
      | Tamaño | Pequeño y fijo | Grande |

      - Cada llamada a función apila un **marco** (*frame*); al volver, se desapila.
      - Recursión sin fin → **stack overflow**.
      - Memoria que reservas y nunca liberas → **fuga de memoria** (*memory leak*).
      - Un **puntero/referencia** es una dirección que apunta a datos en el heap.
      - Python, Java y Go liberan con **recolector de basura**; Rust, con **propiedad**; C, a mano.
    `, [
      mc('¿Qué ocurre con una función recursiva sin caso base?', ['Desborda la pila (*stack overflow*)', 'Agota el heap', 'Se detiene sola', 'Se convierte en un bucle'], 'Cada llamada añade un marco a la pila hasta agotarla.'),
      py(predict(`a = [1, 2]
b = a
b.append(3)
print(a)`, '[1, 2, 3]', 'Las listas son objetos del heap: `a` y `b` son dos referencias al mismo objeto.')),
      py(predict(`import copy

a = [[1], [2]]
b = copy.deepcopy(a)
b[0].append(9)
print(a)`, '[[1], [2]]', '`deepcopy` duplica también los objetos anidados.')),
      match('Empareja cada concepto con su definición', [
        ['Stack', 'Memoria LIFO de variables locales y llamadas'],
        ['Heap', 'Zona de memoria de objetos dinámicos'],
        ['Fuga de memoria', 'Memoria reservada que ya no se usa pero nunca se libera'],
        ['Recolector de basura', 'Libera automáticamente los objetos inalcanzables'],
      ]),
      mc('¿Qué lenguaje de este curso gestiona la memoria sin recolector de basura ni liberación manual?', ['Rust', 'Java', 'Python', 'Go'], 'Rust lo logra con propiedad (*ownership*) y préstamos comprobados en compilación.'),
      tf('Una variable local de tipo `int` en una función normalmente vive en el stack.', true, 'Y desaparece al terminar la función.'),
    ]),

    lesson('fu-comp', 'Compilado vs. interpretado', `
      El código fuente debe convertirse en algo que la CPU ejecute:

      - **Compilado** (C, Go, Rust): un compilador traduce todo a **código máquina** antes de ejecutar. Rápido y sin dependencias; hay que recompilar por plataforma.
      - **Interpretado** (Python): un intérprete lee y ejecuta el código línea a línea. Flexible y portable; más lento.
      - **Híbrido** (Java, C#): se compila a **bytecode** portable, y una máquina virtual (JVM) lo ejecuta y lo optimiza con **JIT** mientras corre.

      \`\`\`
      fuente → [compilador] → binario nativo → CPU
      fuente → [javac] → bytecode → [JVM + JIT] → CPU
      fuente → [intérprete] → CPU
      \`\`\`

      **Tipado estático** (Java, Go, Rust) detecta errores de tipo al compilar; **dinámico** (Python) los detecta al ejecutar.
    `, [
      mc('¿Qué produce el compilador de Go o Rust?', ['Un binario con código máquina nativo', 'Bytecode para una VM', 'Texto HTML', 'Nada: ejecuta línea a línea'], 'Por eso se distribuye como un ejecutable único.'),
      mc('¿Qué es el bytecode de Java?', ['Un código intermedio portable que ejecuta la JVM', 'Código máquina de Windows', 'Código fuente minificado', 'Un formato de imagen'], 'El mismo `.class` corre en cualquier sistema con JVM.'),
      match('Empareja cada lenguaje con su modelo de ejecución', [
        ['Rust', 'Compilado a código máquina, sin recolector de basura'],
        ['Python', 'Interpretado'],
        ['Java', 'Bytecode + JVM con JIT'],
        ['Go', 'Compilado a código nativo, con recolector de basura'],
      ]),
      mc('¿Cuándo se detecta un error de tipos en un lenguaje de tipado estático?', ['Al compilar, antes de ejecutar', 'Solo cuando esa línea se ejecuta', 'Nunca', 'En producción'], 'Es una de sus mayores ventajas.'),
      tf('El JIT compila en caliente las partes del programa que más se ejecutan.', true, 'Así la JVM optimiza según el comportamiento real del programa.'),
      mc('Quieres un servicio que se despliegue como un único archivo sin instalar nada en el servidor. ¿Qué lenguaje encaja mejor?', ['Go', 'Python', 'JavaScript en Node', 'Java sin empaquetar'], 'Go genera binarios estáticos autocontenidos.'),
    ]),
  ]),

  unit('fu2', 'La terminal', 'basico', 'Navegar, buscar y encadenar comandos: la herramienta que más usarás como developer.', [
    lesson('fu-files', 'Archivos y navegación', `
      \`\`\`bash
      pwd                    # dónde estoy
      ls -la                 # lista todo, con detalles y archivos ocultos
      cd proyecto/src        # entra en una carpeta  (cd .. sube, cd ~ va al home)
      mkdir -p a/b/c         # crea carpetas anidadas
      touch notas.txt        # crea un archivo vacío
      cp a.txt b.txt         # copia      mv a.txt carpeta/   # mueve o renombra
      rm archivo             # borra (¡sin papelera!)     rm -r carpeta
      cat archivo            # muestra el contenido       less archivo   # paginado
      \`\`\`

      - Rutas **absolutas** empiezan en \`/\`; **relativas** parten del directorio actual.
      - \`.\` es «aquí» y \`..\` es «el directorio padre».
      - Un archivo cuyo nombre empieza por \`.\` está oculto (\`.gitignore\`, \`.env\`).
      - Usa **Tab** para autocompletar y **↑** para recuperar comandos anteriores.
    `, [
      sh(ask('¿Qué comando muestra el directorio actual?', ['pwd'], '`pwd` = *print working directory*.')),
      sh(ask('Lista todos los archivos, incluidos los ocultos, en formato largo.', ['ls -la', 'ls -al', 'ls -l -a', 'ls -a -l'], '`-l` formato largo, `-a` incluye ocultos.')),
      sh(ask('Crea las carpetas anidadas `a/b/c` de una sola vez.', ['mkdir -p a/b/c'], '`-p` crea también las carpetas intermedias.')),
      mc('¿Qué hace `cd ..`?', ['Sube al directorio padre', 'Va al directorio home', 'Crea una carpeta', 'Vuelve al directorio anterior'], '`cd ~` va al home y `cd -` vuelve al directorio anterior.'),
      mc('¿Qué precaución hay que tener con `rm`?', ['No usa papelera: el borrado es definitivo', 'Solo borra archivos vacíos', 'Pide siempre confirmación', 'Mueve el archivo a /tmp'], 'Comprueba el comando antes, sobre todo con `rm -rf`.'),
      match('Empareja cada comando con su acción', [
        ['`cp a b`', 'Copia el archivo a a b'],
        ['`mv a b`', 'Mueve o renombra'],
        ['`touch a`', 'Crea un archivo vacío'],
        ['`cat a`', 'Muestra el contenido de un archivo'],
      ]),
    ]),

    lesson('fu-pipes', 'Pipes, redirección y búsqueda', `
      La filosofía Unix: **programas pequeños que hacen una cosa bien y se encadenan**.

      \`\`\`bash
      ls | wc -l                       # | pasa la salida de uno a la entrada de otro
      echo "hola" > a.txt              # > escribe (sobrescribe) en un archivo
      echo "mundo" >> a.txt            # >> añade al final
      comando 2> errores.log           # 2> redirige los errores (stderr)
      comando > todo.log 2>&1          # stdout y stderr al mismo sitio

      grep -rn "TODO" src/             # busca texto (recursivo, con nº de línea)
      grep -i error app.log | sort | uniq -c | sort -rn | head
      find . -name "*.py" -mtime -1    # busca archivos
      \`\`\`

      Utilidades clave: \`head\`, \`tail -f\` (seguir un log), \`sort\`, \`uniq -c\`, \`cut\`, \`wc -l\`, \`sed\`, \`awk\`, \`xargs\`, \`jq\` (JSON).
    `, [
      sh(ask('Cuenta cuántos archivos hay en el directorio actual usando un pipe entre `ls` y otro comando.', ['ls | wc -l', 'ls|wc -l'], '`wc -l` cuenta líneas.')),
      sh(ask('Busca recursivamente el texto `TODO` en la carpeta `src`.', ['grep -r TODO src', 'grep -rn TODO src', 'grep -R TODO src', 'grep -rn "TODO" src', 'grep -r "TODO" src'], '`-r` recorre las subcarpetas; `-n` añade el número de línea.')),
      mc('¿Qué diferencia hay entre `>` y `>>`?', ['`>` sobrescribe el archivo; `>>` añade al final', '`>` añade; `>>` sobrescribe', 'Ninguna', '`>>` redirige los errores'], 'Con `>` un archivo existente se pierde.'),
      mc('¿Qué hace `tail -f app.log`?', ['Muestra las últimas líneas y sigue mostrando las nuevas en directo', 'Borra el log', 'Muestra la primera línea', 'Comprime el log'], 'Imprescindible para ver logs en vivo.'),
      order('Ordena la tubería para ver las 3 IPs más frecuentes de un log', ['`cut -d" " -f1 access.log`', '`sort`', '`uniq -c`', '`sort -rn`', '`head -3`']),
      match('Empareja cada herramienta con su uso', [
        ['`grep`', 'Filtra líneas que contienen un patrón'],
        ['`find`', 'Localiza archivos por nombre, fecha o tamaño'],
        ['`sort | uniq -c`', 'Cuenta ocurrencias de líneas repetidas'],
        ['`xargs`', 'Convierte la entrada en argumentos de otro comando'],
      ]),
    ]),

    lesson('fu-perm', 'Permisos, procesos y entorno', `
      **Permisos**: cada archivo tiene dueño, grupo y permisos para *dueño / grupo / otros*: lectura (r=4), escritura (w=2) y ejecución (x=1).

      \`\`\`
      -rwxr-xr--  →  7 5 4  →  chmod 754 script.sh
      chmod +x script.sh        # hacerlo ejecutable
      chown usuario archivo
      \`\`\`

      **Procesos**: \`ps aux\`, \`top\`/\`htop\`, \`kill PID\` (\`kill -9\` fuerza), \`comando &\` (segundo plano), \`Ctrl+C\` interrumpe.

      **Variables de entorno**: configuración fuera del código.

      \`\`\`
      export API_KEY="secreto"
      echo $API_KEY      # lo lee la shell y los procesos hijos
      echo $?            # código de salida del último comando (0 = éxito)
      \`\`\`

      \`PATH\` es la lista de carpetas donde la shell busca ejecutables. \`sudo\` ejecuta como administrador: úsalo con cuidado.
    `, [
      num('¿Qué número octal representa los permisos `rwxr-xr--`?', 754, 'rwx = 7, r-x = 5, r-- = 4.'),
      sh(ask('Dale permiso de ejecución a `script.sh` (formato corto con `+x`).', ['chmod +x script.sh'], 'Sin `x` no se puede ejecutar con `./script.sh`.')),
      mc('¿Qué indica el código de salida `0` de un comando?', ['Que terminó con éxito', 'Que falló', 'Que fue cancelado', 'Que no produjo salida'], 'Cualquier valor distinto de 0 indica error. Se consulta con `$?`.'),
      mc('¿Para qué sirve la variable `PATH`?', ['Lista las carpetas donde la shell busca los comandos', 'Guarda tu carpeta de trabajo', 'Contiene tu contraseña', 'Es la ruta del proyecto actual'], 'Si un programa «no se encuentra», quizá su carpeta no está en `PATH`.'),
      mc('¿Cómo guardas una clave de API sin ponerla en el código?', ['En una variable de entorno o archivo `.env` ignorado por git', 'En un comentario del código', 'En el README', 'En el nombre del repositorio'], 'Las claves en el repositorio acaban filtradas.'),
      sh(ask('Fuerza la terminación del proceso con PID 4321.', ['kill -9 4321', 'kill -KILL 4321', 'kill -SIGKILL 4321'], 'Prueba primero `kill 4321` (SIGTERM), que permite al proceso limpiar.')),
    ]),
  ]),

  unit('fu3', 'Algoritmos y estructuras', 'intermedio', 'Complejidad, estructuras de datos clásicas y las técnicas de las entrevistas técnicas.', [
    lesson('fu-bigo', 'Complejidad: Big-O', `
      **Big-O** describe cómo **crece el coste** (tiempo o memoria) al crecer la entrada *n*, ignorando constantes:

      | Notación | Nombre | Ejemplo |
      |---|---|---|
      | O(1) | Constante | Acceder a \`array[i]\`, buscar en un hash |
      | O(log n) | Logarítmica | Búsqueda binaria |
      | O(n) | Lineal | Recorrer una lista |
      | O(n log n) | Casi lineal | Ordenar (merge sort) |
      | O(n²) | Cuadrática | Dos bucles anidados |
      | O(2ⁿ) | Exponencial | Subconjuntos, Fibonacci ingenuo |

      - Para n = 1 000 000: O(n) ≈ 10⁶ pasos; O(n²) ≈ 10¹² (¡inviable!).
      - Se suele analizar el **peor caso**. Los bucles **anidados** multiplican; los **secuenciales** suman.
      - También hay **complejidad espacial**: cuánta memoria extra usas.
    `, [
      py(predict(`n = 4
pasos = 0
for i in range(n):
    for j in range(n):
        pasos += 1
print(pasos)`, '16', 'Dos bucles anidados de n iteraciones: n² = 16. Es O(n²).')),
      mc('¿Cuál es la complejidad de buscar un elemento en una lista **desordenada** de n elementos?', ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'], 'En el peor caso hay que mirarlos todos.'),
      mc('¿Y de la búsqueda binaria en una lista **ordenada**?', ['O(log n)', 'O(n)', 'O(1)', 'O(n log n)'], 'Cada comparación descarta la mitad.'),
      py(predict(`def pasos_binaria(n):
    c = 0
    while n > 1:
        n //= 2
        c += 1
    return c

print(pasos_binaria(1024), pasos_binaria(1_000_000))`, '10 19', 'Dividir entre 2 hasta llegar a 1: log₂(n) pasos.')),
      match('Empareja cada código con su complejidad', [
        ['Un bucle `for` sobre n elementos', 'O(n)'],
        ['Dos bucles anidados sobre n', 'O(n²)'],
        ['Acceso por índice a un array', 'O(1)'],
        ['Ordenar con merge sort', 'O(n log n)'],
      ]),
      mc('Tienes dos bucles **seguidos** (no anidados), cada uno sobre n elementos. ¿Complejidad total?', ['O(n)', 'O(n²)', 'O(2ⁿ)', 'O(log n)'], 'Se suman: n + n = 2n, y las constantes se ignoran.'),
      mc('Un algoritmo O(n²) tarda 1 s con n = 1 000. ¿Cuánto tardará aproximadamente con n = 10 000?', ['100 s', '10 s', '1 000 s', '1 s'], 'Multiplicar n por 10 multiplica el tiempo por 10² = 100.'),
    ]),

    lesson('fu-lists', 'Arrays, listas, pilas y colas', `
      | Estructura | Acceso | Insertar/borrar | Notas |
      |---|---|---|---|
      | **Array / lista dinámica** | O(1) por índice | O(n) en medio, O(1) amortizado al final | Memoria contigua |
      | **Lista enlazada** | O(n) | O(1) con el nodo en mano | Nodos con punteros |
      | **Pila (stack)** | — | push/pop O(1) | **LIFO**: último en entrar, primero en salir |
      | **Cola (queue)** | — | enqueue/dequeue O(1) | **FIFO**: primero en entrar, primero en salir |

      Usos: la pila sirve para **deshacer**, paréntesis balanceados y recursión; la cola, para **tareas pendientes** y recorridos en anchura.

      \`\`\`
      from collections import deque
      cola = deque(); cola.append(1); cola.popleft()    # O(1) por ambos extremos
      \`\`\`

      En Python, \`list.pop(0)\` es O(n): para colas usa \`deque\`.
    `, [
      py(predict(`pila = []
pila.append(1)
pila.append(2)
pila.append(3)
print(pila.pop(), pila.pop())`, '3 2', 'LIFO: sale primero lo último que entró.')),
      py(predict(`from collections import deque

cola = deque([1, 2, 3])
cola.append(4)
print(cola.popleft(), list(cola))`, '1 [2, 3, 4]', 'FIFO: sale primero lo primero que entró.')),
      mc('¿Qué estructura usarías para implementar «Deshacer» (Ctrl+Z)?', ['Una pila', 'Una cola', 'Un set', 'Un árbol'], 'La última acción es la primera en deshacerse: LIFO.'),
      mc('¿Y para procesar peticiones en el orden en que llegan?', ['Una cola', 'Una pila', 'Un diccionario', 'Un heap máximo'], 'FIFO garantiza el orden de llegada.'),
      mc('¿Cuál es el coste de insertar al principio de un array dinámico de n elementos?', ['O(n): hay que desplazar todos los elementos', 'O(1)', 'O(log n)', 'O(n²)'], 'Por eso las colas no deben implementarse con `list.pop(0)`.'),
      code('Escribe `balanceado(texto)`: True si todos los paréntesis `(` `)` están bien emparejados.', `
        def balanceado(texto):
            pass`, `
        def balanceado(texto):
            pila = []
            for c in texto:
                if c == "(":
                    pila.append(c)
                elif c == ")":
                    if not pila:
                        return False
                    pila.pop()
            return not pila`, [['balanceado("(a(b)c)")', 'True'], ['balanceado("(()")', 'False'], ['balanceado(")(")', 'False'], ['balanceado("")', 'True']], 'Con un contador bastaría aquí; con varios tipos de paréntesis hace falta una pila.'),
    ]),

    lesson('fu-hash', 'Hash maps y sets', `
      Una **tabla hash** convierte la clave en un número (*hash*) que indica en qué «cubo» guardar el valor: acceso, inserción y borrado en **O(1) de media**.

      \`\`\`
      "ana" → hash → 7 → cubo[7] = {"ana": 30}
      \`\`\`

      - **Colisión**: dos claves caen en el mismo cubo; se resuelve con listas o sondeo.
      - Las claves deben ser **inmutables y hasheables**.
      - Un **set** es un hash sin valores: ideal para pertenencia y duplicados.
      - Es la herramienta más rentable en entrevistas y en la práctica: convierte búsquedas O(n) en O(1).

      Patrones típicos: **contar frecuencias**, **detectar duplicados**, **agrupar** y buscar el **complemento** (*two-sum*).
    `, [
      py(predict(`vistos = set()
for n in [3, 1, 3, 2, 1]:
    if n in vistos:
        print("repetido", n)
        break
    vistos.add(n)`, 'repetido 3')),
      py(predict(`from collections import Counter

print(Counter("mississippi").most_common(2))`, "[('i', 4), ('s', 4)]", 'En empates, `most_common` conserva el orden de primera aparición.')),
      mc('Tienes 1 millón de IDs y debes comprobar muchas veces si un ID existe. ¿Estructura?', ['Un `set` / hash set', 'Una lista', 'Una lista ordenada con búsqueda lineal', 'Una pila'], 'Pertenencia en O(1) frente a O(n).'),
      mc('¿Qué es una colisión en una tabla hash?', ['Dos claves distintas que producen el mismo cubo', 'Dos valores iguales', 'Un error de memoria', 'Una clave repetida'], 'Las implementaciones las resuelven; el rendimiento medio sigue siendo O(1).'),
      mc('¿Por qué no puedes usar una lista como clave de un diccionario en Python?', ['Porque es mutable y no es hasheable', 'Porque es demasiado grande', 'Porque no tiene longitud', 'Sí se puede'], 'Si la clave cambiara, su hash cambiaría y no se encontraría el valor.'),
      code('Escribe `dos_suma(nums, objetivo)`: devuelve una tupla `(i, j)` con i < j de los índices de dos números que suman `objetivo`, en O(n).', `
        def dos_suma(nums, objetivo):
            pass`, `
        def dos_suma(nums, objetivo):
            vistos = {}
            for i, n in enumerate(nums):
                if objetivo - n in vistos:
                    return (vistos[objetivo - n], i)
                vistos[n] = i`, [['dos_suma([2, 7, 11, 15], 9)', '(0, 1)'], ['dos_suma([3, 3], 6)', '(0, 1)'], ['dos_suma([1, 2, 3, 4], 7)', '(2, 3)']]),
    ]),

    lesson('fu-tree', 'Árboles y grafos', `
      Un **árbol** es una jerarquía de nodos (raíz → hijos). En un **árbol binario de búsqueda** (BST), a la izquierda están los menores y a la derecha los mayores: buscar cuesta O(altura), O(log n) si está equilibrado.

      **Recorridos**:

      - **En profundidad (DFS)**: baja hasta el fondo antes de volver. Con recursión o una **pila**. *Inorden* en un BST da los valores ordenados.
      - **En anchura (BFS)**: nivel a nivel, con una **cola**. Encuentra el camino más corto en grafos sin pesos.

      Un **grafo** son nodos y aristas: redes sociales, mapas, dependencias. Se guarda con una **lista de adyacencia**: \`{"A": ["B", "C"], "B": ["D"]}\`.

      Otros: **heap** (cola de prioridad, el mínimo en O(1)), **trie** (autocompletado).
    `, [
      py(predict(`class Nodo:
    def __init__(self, valor, izq=None, der=None):
        self.valor, self.izq, self.der = valor, izq, der

def inorden(n):
    if n is None:
        return []
    return inorden(n.izq) + [n.valor] + inorden(n.der)

arbol = Nodo(4, Nodo(2, Nodo(1), Nodo(3)), Nodo(6))
print(inorden(arbol))`, '[1, 2, 3, 4, 6]', 'El recorrido inorden de un BST produce los valores ordenados.')),
      py(predict(`from collections import deque

grafo = {"A": ["B", "C"], "B": ["D"], "C": ["D"], "D": []}
visitados, cola = ["A"], deque(["A"])
while cola:
    nodo = cola.popleft()
    for vecino in grafo[nodo]:
        if vecino not in visitados:
            visitados.append(vecino)
            cola.append(vecino)
print(visitados)`, "['A', 'B', 'C', 'D']", 'BFS visita por niveles: primero los vecinos de A, luego los siguientes.')),
      mc('¿Qué estructura usa un recorrido en anchura (BFS)?', ['Una cola', 'Una pila', 'Un heap', 'Un set únicamente'], 'La cola mantiene el orden por niveles.'),
      mc('¿Qué algoritmo encuentra el camino con menos aristas entre dos nodos en un grafo sin pesos?', ['BFS', 'DFS', 'Ordenación', 'Búsqueda binaria'], 'BFS explora por distancia creciente.'),
      match('Empareja cada problema con su estructura', [
        ['Autocompletar prefijos', 'Trie'],
        ['Extraer siempre el menor elemento', 'Heap (cola de prioridad)'],
        ['Modelar amistades entre usuarios', 'Grafo'],
        ['Jerarquía de carpetas', 'Árbol'],
      ]),
      tf('Un BST desequilibrado (por ejemplo con datos ya ordenados) puede degradarse a O(n) en las búsquedas.', true, 'Por eso existen los árboles autoequilibrados (AVL, rojo-negro).'),
    ]),

    lesson('fu-sort', 'Búsqueda y ordenamiento', `
      - **Búsqueda lineal**: O(n). **Binaria** (requiere datos ordenados): O(log n).
      - **Ordenamientos simples** (burbuja, inserción, selección): O(n²).
      - **Eficientes**: **merge sort** (divide, ordena y mezcla; O(n log n) siempre, estable) y **quicksort** (pivote; O(n log n) de media, O(n²) en el peor caso).
      - Un ordenamiento por comparación **no puede** mejorar O(n log n).
      - Un ordenamiento **estable** conserva el orden relativo de elementos iguales.

      \`\`\`
      sorted(items, key=lambda x: x[1])      # Timsort: híbrido, estable, O(n log n)
      \`\`\`

      > En la práctica casi nunca escribes un sort: usas el de la biblioteca. Entenderlo te enseña **divide y vencerás**.
    `, [
      py(predict(`datos = [("ana", 3), ("luis", 1), ("eva", 3), ("bea", 2)]
print([n for n, _ in sorted(datos, key=lambda d: d[1])])`, "['luis', 'bea', 'ana', 'eva']", 'El sort es estable: ana y eva, ambos con 3, conservan su orden original.')),
      mc('¿Qué requisito previo tiene la búsqueda binaria?', ['Que los datos estén ordenados', 'Que haya pocos datos', 'Que sean números', 'Que no haya repetidos'], 'Sin orden no se puede descartar la mitad.'),
      mc('¿Cuál es la complejidad del peor caso de quicksort?', ['O(n²)', 'O(n log n)', 'O(n)', 'O(log n)'], 'Ocurre con pivotes muy malos (p. ej. datos ya ordenados con pivote en un extremo).'),
      py(predict(`def mezclar(a, b):
    res, i, j = [], 0, 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            res.append(a[i]); i += 1
        else:
            res.append(b[j]); j += 1
    return res + a[i:] + b[j:]

print(mezclar([1, 4, 7], [2, 3, 9]))`, '[1, 2, 3, 4, 7, 9]', 'La mezcla de merge sort: dos listas ordenadas se fusionan en O(n).')),
      match('Empareja cada algoritmo con su característica', [
        ['Merge sort', 'O(n log n) garantizado y estable'],
        ['Quicksort', 'Muy rápido en la práctica; O(n²) en el peor caso'],
        ['Burbuja', 'Simple pero O(n²)'],
        ['Búsqueda binaria', 'O(log n) sobre datos ordenados'],
      ]),
      code('Escribe `buscar(nums, x)`: índice de x en la lista ordenada `nums` (búsqueda binaria), o -1.', `
        def buscar(nums, x):
            pass`, `
        def buscar(nums, x):
            izq, der = 0, len(nums) - 1
            while izq <= der:
                medio = (izq + der) // 2
                if nums[medio] == x:
                    return medio
                if nums[medio] < x:
                    izq = medio + 1
                else:
                    der = medio - 1
            return -1`, [['buscar([1, 3, 5, 7], 5)', '2'], ['buscar([1, 3, 5, 7], 4)', '-1'], ['buscar([], 1)', '-1']]),
    ]),

    lesson('fu-rec', 'Recursión y programación dinámica', `
      Una función **recursiva** se llama a sí misma con un problema más pequeño. Necesita:

      1. **Caso base**: cuándo parar.
      2. **Paso recursivo**: reducir el problema.

      \`\`\`
      def factorial(n):
          if n <= 1:           # caso base
              return 1
          return n * factorial(n - 1)
      \`\`\`

      Si los subproblemas **se repiten** (Fibonacci), la recursión ingenua es exponencial. La **programación dinámica** guarda resultados:

      - **Memoización** (arriba-abajo): recursión + caché (\`@lru_cache\`).
      - **Tabulación** (abajo-arriba): llenar una tabla iterativamente.

      \`\`\`
      from functools import lru_cache
      @lru_cache(maxsize=None)
      def fib(n): return n if n < 2 else fib(n-1) + fib(n-2)     # de O(2ⁿ) a O(n)
      \`\`\`
    `, [
      py(predict(`def suma(n):
    if n == 0:
        return 0
    return n + suma(n - 1)

print(suma(4))`, '10')),
      py(predict(`def cuenta_atras(n):
    if n == 0:
        print("fin")
        return
    print(n)
    cuenta_atras(n - 1)

cuenta_atras(3)`, `
        3
        2
        1
        fin`)),
      bug(`def potencia(base, exp):
    return base * potencia(base, exp - 1)

print(potencia(2, 3))`, 2, 'No hay caso base: la recursión nunca se detiene (RecursionError). Falta `if exp == 0: return 1`.'),
      mc('¿Por qué `fib(40)` recursivo ingenuo es lentísimo?', ['Recalcula los mismos subproblemas una y otra vez', 'Python es lento', 'Usa demasiada memoria RAM', 'Tiene un bucle infinito'], 'El árbol de llamadas es exponencial; la memoización lo reduce a lineal.'),
      py(predict(`from functools import lru_cache

@lru_cache(maxsize=None)
def caminos(f, c):
    if f == 1 or c == 1:
        return 1
    return caminos(f - 1, c) + caminos(f, c - 1)

print(caminos(3, 3), caminos(10, 10))`, '6 48620', 'Cada celda se alcanza desde arriba o desde la izquierda; la caché evita recalcular.')),
      code('Escribe `fib(n)` con programación dinámica iterativa (fib(0)=0, fib(1)=1). Debe ser rápido para n = 90.', `
        def fib(n):
            pass`, `
        def fib(n):
            a, b = 0, 1
            for _ in range(n):
                a, b = b, a + b
            return a`, [['fib(0)', '0'], ['fib(10)', '55'], ['fib(90)', '2880067194370816120']]),
    ]),
  ]),

  unit('fu4', 'El oficio', 'avanzado', 'Código limpio, pruebas, depuración, diseño orientado a objetos y patrones.', [
    lesson('fu-clean', 'Código limpio', `
      El código se **lee** muchísimas más veces de las que se escribe.

      - **Nombres que revelan intención**: \`dias_hasta_caducidad\`, no \`d\`.
      - **Funciones pequeñas con una sola responsabilidad**; pocos parámetros.
      - **Evita la duplicación** (DRY), pero no abstraigas demasiado pronto (YAGNI).
      - **Sin números mágicos**: \`IVA = 0.21\`.
      - **Comentarios**: explican el *porqué*, no el *qué*. Si necesitas explicar el qué, renombra.
      - **Retornos tempranos** en lugar de anidar \`if\`.
      - **KISS**: la solución más simple que funcione.

      \`\`\`
      # Antes                      # Después
      if user:                     if not user: return
          if user.active:          if not user.active: return
              enviar(user)         enviar(user)
      \`\`\`
    `, [
      mc('¿Qué nombre es mejor para una función que calcula el precio con IVA?', ['`precio_con_iva`', '`calc`', '`f1`', '`hazlo`'], 'El nombre dice qué hace y qué devuelve.'),
      py(bug(`def procesar(x):
    return x * 1.21 + 3.5`, 2, 'Números mágicos: ¿qué son 1.21 y 3.5? Extráelos a constantes con nombre (`IVA`, `GASTOS_ENVIO`).')),
      mc('¿Qué debe explicar un buen comentario?', ['El porqué de una decisión no evidente', 'Qué hace cada línea', 'Quién escribió el código', 'La fecha del cambio'], 'Para el qué, usa nombres claros; para quién y cuándo, `git blame`.'),
      match('Empareja cada principio con su significado', [
        ['DRY', 'No repetir la misma lógica en varios sitios'],
        ['YAGNI', 'No construir lo que aún no necesitas'],
        ['KISS', 'Mantenerlo simple'],
        ['Responsabilidad única', 'Una función o clase, una razón para cambiar'],
      ]),
      py(predict(`def clasificar(n):
    if n < 0:
        return "negativo"
    if n == 0:
        return "cero"
    return "positivo"

print(clasificar(-2), clasificar(0), clasificar(9))`, 'negativo cero positivo', 'Retornos tempranos: cada caso se resuelve y se sale, sin anidar.')),
      tf('Una función de 200 líneas con 8 parámetros es señal de que hace demasiadas cosas.', true, 'Divídela en piezas pequeñas con nombres que cuenten la historia.'),
    ]),

    lesson('fu-test', 'Testing', `
      Las pruebas automáticas te dejan **cambiar código sin miedo**.

      **Pirámide de tests**: muchos **unitarios** (rápidos, aislados), algunos de **integración** (varias piezas, p. ej. con la base de datos) y pocos **end-to-end** (flujo completo, lentos y frágiles).

      Un buen test es **FIRST**: Fast, Independent, Repeatable, Self-validating, Timely. Sigue el patrón **Arrange–Act–Assert**.

      - **Mock / stub / fake**: sustituyen dependencias externas (red, reloj, BD).
      - **TDD**: escribir primero un test que falla (rojo), hacerlo pasar (verde) y refactorizar.
      - **Cobertura**: % de código ejecutado por los tests. Una cobertura alta **no garantiza** buenos tests.
      - Prueba **casos límite**: vacío, un elemento, negativos, nulos, muy grande.
    `, [
      order('Ordena el ciclo de TDD', ['Escribir un test que falla (rojo)', 'Escribir el código mínimo para que pase (verde)', 'Refactorizar manteniendo los tests en verde']),
      mc('¿Qué tipo de test debería haber en mayor cantidad?', ['Unitarios', 'End-to-end', 'Manuales', 'De carga'], 'Son rápidos, baratos y localizan bien el fallo.'),
      mc('Tu función llama a una API de pago. ¿Cómo la pruebas de forma unitaria?', ['Sustituyendo el cliente de la API por un doble (mock/fake)', 'Haciendo pagos reales en cada test', 'No probándola', 'Esperando a producción'], 'Un test unitario debe ser determinista y sin efectos externos.'),
      tf('Un 100 % de cobertura demuestra que el código no tiene bugs.', false, 'La cobertura mide qué líneas se ejecutan, no si se comprueba el comportamiento correcto.'),
      code('Escribe `promedio(nums)`: devuelve la media; si la lista está vacía, devuelve 0. Piensa en los casos límite.', `
        def promedio(nums):
            pass`, `
        def promedio(nums):
            return sum(nums) / len(nums) if nums else 0`, [['promedio([2, 4, 6])', '4.0'], ['promedio([])', '0'], ['promedio([5])', '5.0'], ['promedio([-1, 1])', '0.0']]),
      match('Empareja cada doble de prueba con su descripción', [
        ['Stub', 'Devuelve respuestas predefinidas'],
        ['Mock', 'Además verifica cómo fue llamado'],
        ['Fake', 'Implementación simple y funcional (p. ej. BD en memoria)'],
      ]),
    ]),

    lesson('fu-debug', 'Depuración', `
      Depurar es **ciencia**, no suerte:

      1. **Reproduce** el fallo de forma fiable (y escríbelo como test).
      2. **Aísla**: reduce el caso hasta lo mínimo que falla.
      3. **Formula una hipótesis** y compruébala (no cambies cosas al azar).
      4. **Corrige la causa raíz**, no el síntoma.
      5. **Añade un test** para que no vuelva.

      Herramientas: **lectura del *stack trace*** (empieza por el final: ahí está el error; busca la primera línea de *tu* código), **logs** con niveles (DEBUG, INFO, WARNING, ERROR), **depurador** con puntos de interrupción (\`breakpoint()\` en Python), **\`git bisect\`** para localizar el commit culpable y el método del **patito de goma**: explicar el problema en voz alta.

      > Si un bug «desaparece» cuando añades un \`print\`, sospecha de concurrencia o de orden de ejecución.
    `, [
      order('Ordena los pasos de una depuración sistemática', ['Reproducir el fallo de forma fiable', 'Aislar el caso mínimo que falla', 'Formular y comprobar una hipótesis', 'Corregir la causa raíz', 'Añadir un test de regresión']),
      mc('Ante un *stack trace* largo, ¿por dónde empiezas a leer?', ['Por el final: el error y la última llamada, buscando la primera línea de tu código', 'Por el principio', 'Por la línea más larga', 'Por la primera librería'], 'En Python, el error está en la última línea; en Java, arriba.'),
      py(bug(`def media(nums):
    total = 0
    for n in nums:
        total += n
    return total / len(nums)

print(media([]))`, 5, 'Con una lista vacía, `len(nums)` es 0: ZeroDivisionError. Es un caso límite sin contemplar.')),
      mc('¿Qué nivel de log usarías para un fallo que impide completar una petición?', ['ERROR', 'DEBUG', 'INFO', 'TRACE'], 'DEBUG/INFO para trazas normales; WARNING para anomalías recuperables.'),
      mc('¿Para qué sirve `git bisect`?', ['Para encontrar el commit que introdujo un bug con búsqueda binaria', 'Para dividir un archivo grande', 'Para fusionar ramas', 'Para borrar commits'], 'Con 1 000 commits, unos 10 pasos.'),
      tf('Cuando arreglas un bug, basta con corregir el síntoma visible.', false, 'Corrige la causa raíz y añade un test, o el bug reaparecerá con otro aspecto.'),
    ]),

    lesson('fu-oop', 'POO y SOLID', `
      **Programación orientada a objetos**: modelar con objetos que combinan datos y comportamiento.

      - **Encapsulación**: ocultar el estado interno y exponer una interfaz.
      - **Abstracción**: mostrar solo lo esencial.
      - **Herencia**: reutilizar y especializar. *Prefiere composición a herencia*.
      - **Polimorfismo**: el mismo mensaje, distintas respuestas según el objeto.

      **SOLID**:

      - **S** — Responsabilidad única: una clase, un motivo para cambiar.
      - **O** — Abierto/cerrado: abierto a extensión, cerrado a modificación.
      - **L** — Sustitución de Liskov: una subclase debe poder usarse donde se espera la base.
      - **I** — Segregación de interfaces: interfaces pequeñas y específicas.
      - **D** — Inversión de dependencias: depende de abstracciones, no de implementaciones concretas.
    `, [
      match('Empareja cada letra de SOLID con su principio', [
        ['S', 'Una clase, una responsabilidad'],
        ['O', 'Extender sin modificar el código existente'],
        ['L', 'Las subclases deben poder sustituir a la base'],
        ['D', 'Depender de abstracciones, no de concretos'],
      ]),
      mc('Tu clase `Informe` calcula datos, los formatea a PDF y los envía por email. ¿Qué principio rompe?', ['Responsabilidad única (S)', 'Liskov (L)', 'Segregación de interfaces (I)', 'Ninguno'], 'Tiene tres motivos para cambiar: separa cálculo, formato y envío.'),
      mc('¿Qué significa «composición sobre herencia»?', ['Construir objetos combinando otros más simples en vez de crear jerarquías profundas', 'No usar nunca herencia', 'Heredar de varias clases', 'Evitar las interfaces'], 'La composición es más flexible y acopla menos.'),
      py(predict(`class Notificador:
    def enviar(self, msg):
        raise NotImplementedError

class Email(Notificador):
    def enviar(self, msg):
        return f"email: {msg}"

class SMS(Notificador):
    def enviar(self, msg):
        return f"sms: {msg}"

for n in [Email(), SMS()]:
    print(n.enviar("hola"))`, `
        email: hola
        sms: hola`, 'Polimorfismo: el código que llama no necesita saber qué notificador es.')),
      mc('Un `Pingüino` hereda de `Ave`, que tiene `volar()`. ¿Qué principio se viola al lanzar excepción en `volar()`?', ['Liskov: no puede sustituir a `Ave` sin romper el código que la usa', 'Abierto/cerrado', 'DRY', 'Ninguno'], 'Rediseña: `Ave` no debería prometer `volar()`; una `AveVoladora` sí.'),
      tf('«Depender de abstracciones» permite cambiar la implementación (p. ej. de PostgreSQL a otra BD) sin tocar la lógica de negocio.', true, 'Es el principio de inversión de dependencias.'),
    ]),

    lesson('fu-pat', 'Patrones de diseño', `
      Un **patrón** es una solución probada a un problema recurrente de diseño. Los más usados:

      - **Strategy**: intercambiar algoritmos en tiempo de ejecución (p. ej. métodos de pago).
      - **Observer**: un objeto notifica a sus suscriptores cuando cambia (eventos).
      - **Factory**: centraliza la creación de objetos.
      - **Decorator**: añade comportamiento envolviendo un objeto (como los decoradores de Python).
      - **Adapter**: hace compatible una interfaz con otra.
      - **Singleton**: una única instancia global (¡úsalo con moderación!).
      - **Repository**: oculta el acceso a datos tras una interfaz.
      - **Dependency Injection**: recibir las dependencias desde fuera en vez de crearlas dentro.

      > No uses patrones por usarlos: aparecen cuando el problema los pide.
    `, [
      match('Empareja cada patrón con el problema que resuelve', [
        ['Strategy', 'Elegir entre varios algoritmos intercambiables'],
        ['Observer', 'Avisar a varios objetos cuando algo cambia'],
        ['Adapter', 'Hacer compatible una interfaz incompatible'],
        ['Factory', 'Centralizar la creación de objetos'],
      ]),
      py(predict(`class Carrito:
    def __init__(self, descuento):
        self.descuento = descuento

    def total(self, precio):
        return self.descuento(precio)

sin_descuento = lambda p: p
black_friday = lambda p: p * 0.5

print(Carrito(sin_descuento).total(80), Carrito(black_friday).total(80))`, '80 40.0', 'Strategy: el algoritmo de descuento se inyecta como una función.')),
      mc('Quieres que varios módulos reaccionen cuando un pedido se paga, sin que el módulo de pagos los conozca. ¿Patrón?', ['Observer (eventos / pub-sub)', 'Singleton', 'Factory', 'Adapter'], 'Así desacoplas productor y consumidores.'),
      mc('¿Por qué se desaconseja abusar del Singleton?', ['Es estado global oculto: dificulta los tests y crea dependencias implícitas', 'Es muy lento', 'No existe en Python', 'Consume mucha memoria'], 'Prefiere pasar la dependencia explícitamente (inyección).'),
      py(predict(`class Servicio:
    def __init__(self, repo):
        self.repo = repo

    def nombre(self, id):
        return self.repo.buscar(id).upper()

class RepoFalso:
    def buscar(self, id):
        return "ada"

print(Servicio(RepoFalso()).nombre(1))`, 'ADA', 'Inyección de dependencias: en los tests se pasa un repositorio falso.')),
      tf('Aplicar el mayor número posible de patrones de diseño siempre mejora el código.', false, 'Complican si no resuelven un problema real. Empieza simple y refactoriza cuando duela.'),
    ]),
  ]),

  unit('fu5', 'Backend del día a día', 'experto', 'HTTP, bases de datos, seguridad, concurrencia, contenedores y CI/CD: el kit de un desarrollador profesional.', [
    lesson('fu-http', 'HTTP y APIs REST', `
      **HTTP** es el protocolo de la web: petición → respuesta, sin estado.

      \`\`\`http
      GET /api/usuarios/42 HTTP/1.1
      Host: ejemplo.com
      Authorization: Bearer <token>
      Accept: application/json

      HTTP/1.1 200 OK
      Content-Type: application/json
      {"id": 42, "nombre": "Ada"}
      \`\`\`

      **Métodos**: \`GET\` (leer, **idempotente**), \`POST\` (crear), \`PUT\` (reemplazar), \`PATCH\` (modificar), \`DELETE\`.

      **Códigos**: 2xx éxito (200, 201, 204) · 3xx redirección (301, 304) · 4xx error del cliente (400, 401, 403, 404, 409, 422, 429) · 5xx error del servidor (500, 502, 503).

      **REST**: recursos con URLs en plural (\`/usuarios/42/pedidos\`), verbos HTTP para las acciones, JSON, paginación (\`?page=2&limit=20\`) y versionado (\`/v1\`).
    `, [
      mc('Creas un usuario con `POST /usuarios` y todo va bien. ¿Qué código devuelves?', ['201 Created', '200 OK', '204 No Content', '302 Found'], '201 indica que se creó un recurso (idealmente con la cabecera `Location`).'),
      mc('Un cliente envía un token válido pero no tiene permiso para ese recurso. ¿Código?', ['403 Forbidden', '401 Unauthorized', '404 Not Found', '400 Bad Request'], '401: no sabemos quién eres. 403: sabemos quién eres, pero no puedes.'),
      match('Empareja cada método con su semántica', [
        ['GET', 'Leer un recurso (sin efectos secundarios)'],
        ['POST', 'Crear un recurso'],
        ['PUT', 'Reemplazar un recurso completo'],
        ['DELETE', 'Eliminar un recurso'],
      ]),
      mc('¿Qué significa que una operación sea idempotente?', ['Repetirla varias veces tiene el mismo efecto que hacerla una vez', 'Es muy rápida', 'No necesita autenticación', 'Devuelve siempre 200'], 'GET, PUT y DELETE lo son; POST normalmente no. Importa para reintentos seguros.'),
      mc('¿Cuál es una URL REST bien diseñada para obtener los pedidos del usuario 7?', ['`GET /usuarios/7/pedidos`', '`GET /obtenerPedidosDeUsuario?id=7`', '`POST /getPedidos/7`', '`GET /usuario/7/dame-pedidos`'], 'Sustantivos en plural para recursos; el verbo lo da el método HTTP.'),
      ask('¿Qué código HTTP devuelve un servidor cuando un cliente supera el límite de peticiones (rate limit)?', ['429'], '429 Too Many Requests; suele acompañarse de `Retry-After`.'),
    ]),

    lesson('fu-sql', 'SQL esencial', `
      Una **base de datos relacional** guarda datos en **tablas** (filas y columnas) con relaciones entre ellas.

      \`\`\`sql
      CREATE TABLE usuarios (
        id    INTEGER PRIMARY KEY,
        nombre TEXT NOT NULL,
        email  TEXT UNIQUE,
        edad   INTEGER
      );

      INSERT INTO usuarios (nombre, email, edad) VALUES ('Ada', 'ada@x.dev', 36);

      SELECT nombre, edad FROM usuarios
      WHERE edad >= 18 AND nombre LIKE 'A%'
      ORDER BY edad DESC
      LIMIT 10;

      UPDATE usuarios SET edad = 37 WHERE id = 1;
      DELETE FROM usuarios WHERE id = 1;       -- ¡cuidado sin WHERE!

      SELECT COUNT(*), AVG(edad) FROM usuarios;
      SELECT pais, COUNT(*) FROM usuarios GROUP BY pais HAVING COUNT(*) > 5;
      \`\`\`

      \`WHERE\` filtra filas **antes** de agrupar; \`HAVING\` filtra **grupos**. \`NULL\` no es igual a nada: usa \`IS NULL\`.
    `, [
      sql(ask('Escribe la cláusula que filtra las filas con edad mayor o igual que 18: `SELECT * FROM usuarios ___ edad >= 18`.', ['WHERE'], '`WHERE` filtra filas.')),
      sql(mc('¿Qué hace `DELETE FROM usuarios;` sin `WHERE`?', ['Borra TODAS las filas de la tabla', 'No hace nada', 'Borra la tabla', 'Da un error'], 'Es uno de los errores más caros: usa siempre `WHERE` y prueba antes con un `SELECT`.')),
      sql(mc('¿Cuál es la diferencia entre `WHERE` y `HAVING`?', ['`WHERE` filtra filas antes de agrupar; `HAVING` filtra los grupos', 'Ninguna', '`HAVING` filtra antes que `WHERE`', '`WHERE` solo funciona con números'], '`HAVING COUNT(*) > 5` solo tiene sentido tras un `GROUP BY`.')),
      sql(mc('¿Cómo compruebas si una columna es nula?', ['`columna IS NULL`', '`columna = NULL`', '`columna == null`', '`columna IS EMPTY`'], '`NULL` no es igual a nada, ni siquiera a otro `NULL`.')),
      match('Empareja cada cláusula con su función', [
        ['`ORDER BY`', 'Ordena el resultado'],
        ['`GROUP BY`', 'Agrupa filas para usar agregados'],
        ['`LIMIT`', 'Limita el número de filas devueltas'],
        ['`DISTINCT`', 'Elimina duplicados'],
      ]),
      sql(fill(`SELECT pais, ___(*) AS total
FROM usuarios
GROUP BY pais;`, ['COUNT'], undefined, undefined, 'Completa la consulta que cuenta usuarios por país')),
    ]),

    lesson('fu-sql2', 'Joins, índices y transacciones', `
      **JOIN** combina tablas relacionadas por una **clave foránea**:

      \`\`\`sql
      SELECT u.nombre, p.total
      FROM usuarios u
      INNER JOIN pedidos p ON p.usuario_id = u.id;     -- solo coincidencias
      -- LEFT JOIN: todos los usuarios, aunque no tengan pedidos (columnas NULL)
      \`\`\`

      **Índices**: estructuras (típicamente B-tree) que aceleran las búsquedas de O(n) a O(log n) a costa de espacio y escrituras más lentas.

      \`\`\`sql
      CREATE INDEX idx_pedidos_usuario ON pedidos(usuario_id);
      EXPLAIN ANALYZE SELECT ...;     -- muestra el plan de ejecución
      \`\`\`

      **Transacciones** agrupan operaciones de forma **ACID**: *Atómicas* (todo o nada), *Consistentes*, *Aisladas* y *Duraderas*.

      \`\`\`sql
      BEGIN;
      UPDATE cuentas SET saldo = saldo - 100 WHERE id = 1;
      UPDATE cuentas SET saldo = saldo + 100 WHERE id = 2;
      COMMIT;          -- o ROLLBACK si algo falla
      \`\`\`

      **Problema N+1**: una consulta por cada fila de una lista. Resuélvelo con un JOIN o cargando en bloque.
    `, [
      sql(mc('Quieres listar todos los usuarios, tengan o no pedidos. ¿Qué JOIN usas?', ['`LEFT JOIN`', '`INNER JOIN`', '`CROSS JOIN` únicamente', '`UNION`'], '`INNER JOIN` descartaría a los usuarios sin pedidos.')),
      mc('¿Qué garantiza la **A** de ACID (atomicidad)?', ['Que la transacción se aplica entera o no se aplica nada', 'Que los datos están cifrados', 'Que las consultas son rápidas', 'Que dos usuarios no pueden leer a la vez'], 'En una transferencia bancaria, o se hacen los dos movimientos o ninguno.'),
      mc('Una consulta con `WHERE email = ...` es lenta en una tabla de 50 millones de filas. ¿Qué haces?', ['Crear un índice sobre `email`', 'Añadir más columnas', 'Quitar el `WHERE`', 'Reiniciar la base de datos'], 'El índice permite localizar la fila sin recorrer toda la tabla.'),
      mc('¿Qué es el problema N+1?', ['Una consulta inicial más una consulta adicional por cada fila del resultado', 'Un índice duplicado', 'Un error de claves foráneas', 'Un fallo de red'], 'Con 100 pedidos, 101 consultas. Solución: JOIN o carga en bloque (`WHERE id IN (...)`).'),
      tf('Los índices aceleran las lecturas pero ralentizan ligeramente las escrituras y ocupan espacio.', true, 'Cada INSERT/UPDATE debe mantener actualizados los índices: no indexes todo.'),
      order('Ordena una transferencia bancaria segura', ['`BEGIN`', 'Restar 100 de la cuenta origen', 'Sumar 100 a la cuenta destino', '`COMMIT` (o `ROLLBACK` si algo falló)']),
    ]),

    lesson('fu-sec', 'Autenticación y seguridad', `
      - **Autenticación** (*quién eres*) vs. **autorización** (*qué puedes hacer*).
      - **Contraseñas**: nunca en claro. Guarda un **hash lento con sal** (bcrypt, scrypt, Argon2). Un hash rápido (MD5, SHA-1) no sirve para contraseñas.
      - **Sesiones** (cookie con un ID en el servidor) vs. **tokens JWT** (firmados, sin estado, con caducidad).
      - **OAuth 2.0 / OpenID Connect**: «Iniciar sesión con Google» sin compartir la contraseña.
      - **HTTPS** siempre (TLS cifra el tráfico).

      **Vulnerabilidades clásicas (OWASP Top 10)**:

      - **Inyección SQL**: usa **consultas parametrizadas**, nunca concatenes entrada del usuario.
      - **XSS**: escapa/sanitiza lo que muestras en HTML.
      - **CSRF**: tokens anti-CSRF y cookies \`SameSite\`.
      - **Control de acceso roto**: comprueba permisos en el servidor, siempre.
      - **Secretos expuestos**: variables de entorno y gestores de secretos, nunca en git.
    `, [
      mc('¿Cómo guardas la contraseña de un usuario?', ['Hash lento con sal (bcrypt/Argon2)', 'En texto plano', 'Cifrada con una clave simétrica reversible', 'Hash MD5'], 'Si la base de datos se filtra, el hash lento con sal hace inviable recuperar las contraseñas.'),
      py(bug(`def buscar(cursor, nombre):
    cursor.execute("SELECT * FROM usuarios WHERE nombre = '" + nombre + "'")
    return cursor.fetchall()`, 2, 'Concatenar entrada del usuario permite inyección SQL (`\' OR \'1\'=\'1`). Usa parámetros: `cursor.execute("... WHERE nombre = ?", (nombre,))`.')),
      match('Empareja cada ataque con su defensa', [
        ['Inyección SQL', 'Consultas parametrizadas'],
        ['XSS', 'Escapar la salida HTML y política CSP'],
        ['CSRF', 'Tokens anti-CSRF y cookies SameSite'],
        ['Fuerza bruta de contraseñas', 'Limitación de intentos y hash lento'],
      ]),
      mc('¿Qué diferencia hay entre autenticación y autorización?', ['Autenticación: verificar quién eres; autorización: decidir qué puedes hacer', 'Son sinónimos', 'La autorización ocurre antes de saber quién eres', 'Autenticación solo existe en APIs'], '401 vs. 403 en HTTP.'),
      mc('Un JWT está firmado. ¿Qué implica?', ['El servidor puede verificar que no fue alterado, pero su contenido es legible: no guardes secretos dentro', 'Está cifrado y es ilegible', 'No puede caducar', 'Solo sirve con cookies'], 'Firmado ≠ cifrado. El payload se puede decodificar en base64.'),
      tf('Basta con ocultar un botón de «Eliminar» en la interfaz para que un usuario no autorizado no pueda borrar datos.', false, 'La comprobación de permisos debe hacerse siempre en el servidor: la interfaz se puede saltar.'),
    ]),

    lesson('fu-conc', 'Concurrencia y sistemas en ejecución', `
      - **Concurrencia**: gestionar varias tareas que progresan a la vez (solapadas). **Paralelismo**: ejecutarlas literalmente a la vez en varios núcleos.
      - **Condición de carrera**: el resultado depende del orden de ejecución de hilos sin sincronizar.
      - **Exclusión mutua** (mutex): solo un hilo en la sección crítica.
      - **Deadlock**: ciclo de espera entre candados. Se evita con un **orden fijo** de adquisición.
      - **E/S bloqueante vs. asíncrona**: mientras esperas la red, no gastes un hilo entero.
      - **Colas de mensajes** (RabbitMQ, SQS, Kafka): desacoplan productores y consumidores y absorben picos de carga.
      - **Idempotencia**: una operación repetible sin efectos duplicados, imprescindible con reintentos.
      - **Timeouts y reintentos con *backoff* exponencial** en toda llamada de red.
    `, [
      py(predict(`import threading

total = 0
candado = threading.Lock()

def sumar():
    global total
    for _ in range(500):
        with candado:
            total += 1

hilos = [threading.Thread(target=sumar) for _ in range(4)]
for h in hilos: h.start()
for h in hilos: h.join()
print(total)`, '2000', 'El candado protege `total += 1`, que no es atómico.')),
      mc('¿Qué es un deadlock?', ['Dos o más hilos esperándose mutuamente para siempre', 'Un hilo que termina antes de tiempo', 'Un error de memoria', 'Una excepción no capturada'], 'Se previene adquiriendo siempre los candados en el mismo orden.'),
      mc('Tu servicio llama a otro que a veces falla. ¿Qué reintento es más sensato?', ['Reintentar con espera exponencial creciente y un máximo de intentos', 'Reintentar en bucle sin esperar', 'No reintentar nunca', 'Reintentar indefinidamente cada milisegundo'], 'El *backoff* exponencial (con *jitter*) evita saturar al servicio que ya sufre.'),
      mc('Un cliente reintenta un pago porque no recibió respuesta. ¿Cómo evitas cobrar dos veces?', ['Haciendo la operación idempotente con una clave de idempotencia', 'No permitiendo reintentos', 'Cobrando siempre dos veces', 'Con un `sleep`'], 'El servidor guarda la clave y devuelve el resultado ya calculado.'),
      match('Empareja cada concepto con su descripción', [
        ['Condición de carrera', 'Resultado que depende del orden de ejecución'],
        ['Mutex', 'Garantiza que solo un hilo accede a la sección crítica'],
        ['Cola de mensajes', 'Desacopla productores y consumidores'],
        ['Backoff exponencial', 'Espera creciente entre reintentos'],
      ]),
      tf('Concurrencia y paralelismo son exactamente lo mismo.', false, 'Concurrencia es estructura (varias tareas en progreso); paralelismo es ejecución simultánea en varios núcleos.'),
    ]),

    lesson('fu-ops', 'Docker y CI/CD', `
      **Docker** empaqueta una aplicación con sus dependencias en una **imagen** que se ejecuta idéntica en cualquier sitio; un **contenedor** es una instancia en ejecución, aislada y ligera.

      \`\`\`dockerfile
      FROM python:3.12-slim
      WORKDIR /app
      COPY requirements.txt .
      RUN pip install -r requirements.txt
      COPY . .
      CMD ["python", "main.py"]
      \`\`\`

      \`\`\`bash
      docker build -t miapp .
      docker run -p 8080:80 miapp
      docker compose up         # varios servicios (app + base de datos)
      \`\`\`

      **CI/CD**: en cada push, un pipeline automático **construye, prueba y despliega**.

      - **CI** (Integración Continua): compilar + tests + linters en cada cambio.
      - **CD** (Entrega/Despliegue Continuo): publicar a producción de forma automatizada.
      - Estrategias de despliegue: **blue/green**, **canary**, **rolling**, con *rollback* rápido.
      - **Infraestructura como código** (Terraform) y **Kubernetes** para orquestar contenedores.
    `, [
      mc('¿Qué diferencia hay entre una imagen y un contenedor de Docker?', ['La imagen es la plantilla; el contenedor es una instancia en ejecución', 'Son lo mismo', 'El contenedor es la plantilla', 'La imagen solo existe en producción'], 'De una imagen se pueden lanzar muchos contenedores.'),
      order('Ordena un pipeline de CI/CD típico', ['Push del código al repositorio', 'Construir y ejecutar tests y linters', 'Construir la imagen y publicarla en un registro', 'Desplegar en un entorno de pruebas / producción']),
      mc('En un Dockerfile, ¿por qué se copia `requirements.txt` e instala dependencias antes de copiar el resto del código?', ['Para aprovechar la caché de capas: las dependencias solo se reinstalan si cambian', 'Porque Docker lo exige', 'Para que la imagen sea más pequeña siempre', 'Para evitar errores de sintaxis'], 'Cada instrucción es una capa en caché; el código cambia mucho más que las dependencias.'),
      match('Empareja cada estrategia de despliegue con su descripción', [
        ['Blue/green', 'Dos entornos idénticos; se cambia el tráfico de uno a otro'],
        ['Canary', 'Una pequeña parte del tráfico va a la nueva versión primero'],
        ['Rolling', 'Se reemplazan las instancias poco a poco'],
      ]),
      mc('¿Qué problema resuelve «funciona en mi máquina»?', ['Los contenedores y el entorno reproducible', 'Cambiar de lenguaje', 'Comprar un servidor mejor', 'Escribir más tests unitarios'], 'La imagen incluye el mismo sistema, librerías y configuración en todos los entornos.'),
      tf('Un pipeline de CI en rojo no debería impedir fusionar el PR.', false, 'La rama principal debe mantenerse siempre desplegable: el CI en rojo bloquea la fusión.'),
    ]),

    lesson('fu-regex', 'Expresiones regulares', `
      Una **regex** describe patrones de texto. Imprescindible para validar, buscar y extraer.

      | Patrón | Significado |
      |---|---|
      | \`.\` | cualquier carácter |
      | \`\\d\` \`\\w\` \`\\s\` | dígito, letra/número/_, espacio |
      | \`[abc]\` \`[a-z]\` \`[^0-9]\` | clase de caracteres / negada |
      | \`* + ?\` | 0 o más, 1 o más, 0 o 1 |
      | \`{3}\` \`{2,4}\` | repeticiones exactas / rango |
      | \`^\` \`$\` | inicio / fin |
      | \`( )\` \`|\` | grupo / alternativa |

      \`\`\`
      import re
      re.findall(r"\\d+", "tengo 3 gatos y 12 perros")        # ['3', '12']
      re.match(r"^[\\w.]+@[\\w.]+\\.\\w+$", "ada@x.dev")          # válido
      re.sub(r"\\s+", " ", "a   b    c")                       # 'a b c'
      \`\`\`

      > Las regex pueden volverse ilegibles y, mal escritas, provocar *backtracking catastrófico* (ReDoS). Pruébalas con casos reales.
    `, [
      py(predict(`import re

print(re.findall(r"\\d+", "tengo 3 gatos y 12 perros"))`, "['3', '12']")),
      py(predict(`import re

print(re.sub(r"\\s+", " ", "a   b    c"))`, 'a b c')),
      py(predict(`import re

m = re.search(r"(\\w+)@(\\w+)\\.com", "escribe a ada@encode.com hoy")
print(m.group(1), m.group(2))`, 'ada encode', 'Los paréntesis crean grupos de captura.')),
      py(predict(`import re

print(bool(re.fullmatch(r"\\d{4}-\\d{2}-\\d{2}", "2026-01-15")), bool(re.fullmatch(r"\\d{4}-\\d{2}-\\d{2}", "26-1-15")))`, 'True False')),
      mc('¿Qué significa `^[a-z]+$`?', ['Una o más letras minúsculas y nada más', 'Cualquier texto', 'Una letra seguida de un dólar', 'Texto que no contiene letras'], '`^` y `$` anclan el patrón al inicio y al final.'),
      match('Empareja cada elemento de regex con su significado', [
        ['`\\d`', 'Un dígito'],
        ['`+`', 'Una o más repeticiones'],
        ['`?`', 'Opcional (cero o una vez)'],
        ['`[^a-z]`', 'Cualquier carácter que NO sea una minúscula'],
      ]),
      code('Escribe `extraer_hashtags(texto)`: devuelve la lista de hashtags (`#palabra`, solo letras y números) del texto, sin el `#`.', `
        import re

        def extraer_hashtags(texto):
            pass`, `
        import re

        def extraer_hashtags(texto):
            return re.findall(r"#(\\w+)", texto)`, [['extraer_hashtags("hoy #python y #Go2")', '["python", "Go2"]'], ['extraer_hashtags("sin etiquetas")', '[]']]),
    ]),
  ]),
])
