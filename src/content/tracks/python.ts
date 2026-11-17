import { ask, bug, code, fill, lesson, match, mc, order, parsons, predict, tf, track, unit } from '../dsl'

export default track('python', 'python', [
  unit('py1', 'Primeros pasos', 'basico', 'Variables, texto, decisiones, bucles y funciones: el vocabulario mínimo para escribir programas.', [
    lesson('py-vars', 'Variables y tipos', `
      Una **variable** es un nombre que apunta a un valor. Python deduce el tipo solo:

      \`\`\`
      edad = 30          # int
      precio = 9.99      # float
      nombre = "Ada"     # str
      activo = True      # bool
      print(type(edad))  # <class 'int'>
      \`\`\`

      - \`/\` siempre devuelve \`float\`; \`//\` es división entera; \`%\` es el resto; \`**\` es potencia.
      - Convierte entre tipos con \`int()\`, \`float()\`, \`str()\`.

      > Python es de tipado dinámico pero fuerte: \`"3" + 4\` es un error, no \`7\` ni \`"34"\`.
    `, [
      predict(`
        a = 7
        b = 2
        print(a // b, a % b)`, '3 1', '`//` es la división entera (3) y `%` el resto (1).'),
      mc('¿Qué tipo tiene el resultado de `10 / 2`?', ['float', 'int', 'str', 'bool'], 'El operador `/` siempre devuelve `float`: el resultado es `5.0`.'),
      predict(`
        x = "3"
        y = 4
        print(int(x) + y)
        print(x + str(y))`, `
        7
        34`, 'Con `int(x)` sumas números; con `str(y)` concatenas texto.'),
      fill(`
        precio = 20
        cantidad = 3
        total = precio ___ cantidad
        print(total)`, ['*'], 'El operador de multiplicación es `*`.', '60'),
      bug(`
        nombre = "Ada"
        edad = 36
        mensaje = nombre + " tiene " + edad
        print(mensaje)`, 3, 'No se puede concatenar `str` con `int`. Usa `str(edad)` o un f-string: `f"{nombre} tiene {edad}"`.'),
      ask('¿Qué función devuelve el tipo de un valor?', ['type', 'type()'], '`type(42)` devuelve `<class \'int\'>`.'),
      predict(`print(2 ** 10)`, '1024', '`**` es el operador de potencia.'),
    ]),

    lesson('py-str', 'Strings', `
      Los strings son secuencias **inmutables** de caracteres. Los **f-strings** insertan valores:

      \`\`\`
      lang = "Python"
      print(f"Hola, {lang}!")        # Hola, Python!
      print(lang[0], lang[-1])       # P n
      print(lang[0:3])               # Pyt
      print(lang.upper(), len(lang)) # PYTHON 6
      \`\`\`

      - Los índices empiezan en 0; los negativos cuentan desde el final.
      - El slice \`s[a:b]\` incluye \`a\` y excluye \`b\`.
      - Métodos útiles: \`.lower()\`, \`.strip()\`, \`.split()\`, \`.replace()\`, \`"-".join(lista)\`.
    `, [
      predict(`
        s = "encode"
        print(s[0], s[-1], s[1:4])`, 'e e nco', 'Índice 0 → "e", índice -1 → "e", slice 1:4 → "nco".'),
      predict(`
        nombre = "ada"
        print(f"Hola, {nombre.capitalize()}!")`, 'Hola, Ada!'),
      fill(`
        frase = "  git push  "
        limpia = frase.___()
        print(limpia)`, ['strip'], '`.strip()` quita los espacios de los extremos.', 'git push'),
      mc('¿Qué devuelve `"a,b,c".split(",")`?', ['`["a", "b", "c"]`', '`"abc"`', '`("a", "b", "c")`', '`["a,b,c"]`'], '`.split(sep)` corta el string y devuelve una lista.'),
      bug(`
        s = "hola"
        s[0] = "H"
        print(s)`, 2, 'Los strings son inmutables: no se puede asignar a un índice. Crea uno nuevo: `s = "H" + s[1:]`.'),
      predict(`print("-".join(["2026", "01", "15"]))`, '2026-01-15', '`sep.join(lista)` une los elementos usando `sep` como separador.'),
      code('Escribe `iniciales(nombre)`: devuelve las iniciales en mayúsculas de un nombre completo. `iniciales("ada lovelace")` → `"AL"`.', `
        def iniciales(nombre):
            pass`, `
        def iniciales(nombre):
            return "".join(p[0].upper() for p in nombre.split())`,
        [['iniciales("ada lovelace")', '"AL"'], ['iniciales("grace brewster hopper")', '"GBH"'], ['iniciales("linus")', '"L"']]),
    ]),

    lesson('py-cond', 'Condicionales', `
      \`if\`, \`elif\` y \`else\` ejecutan bloques según una condición. La **sangría** (4 espacios) define el bloque:

      \`\`\`
      nota = 7
      if nota >= 9:
          print("sobresaliente")
      elif nota >= 5:
          print("aprobado")
      else:
          print("suspenso")
      \`\`\`

      - Comparadores: \`==\`, \`!=\`, \`<\`, \`<=\`, \`>\`, \`>=\`. Lógicos: \`and\`, \`or\`, \`not\`.
      - Valores **falsy**: \`0\`, \`""\`, \`[]\`, \`{}\`, \`None\`, \`False\`. Todo lo demás es truthy.
      - Expresión condicional: \`x = a if condicion else b\`.
    `, [
      predict(`
        n = 15
        if n % 3 == 0 and n % 5 == 0:
            print("FizzBuzz")
        elif n % 3 == 0:
            print("Fizz")
        else:
            print(n)`, 'FizzBuzz'),
      mc('¿Cuál de estos valores es *truthy*?', ['`"0"`', '`0`', '`""`', '`[]`'], 'Un string no vacío es truthy, aunque contenga el carácter "0".'),
      predict(`
        items = []
        if items:
            print("hay items")
        else:
            print("vacio")`, 'vacio', 'Una lista vacía es falsy.'),
      fill(`
        edad = 20
        tipo = "adulto" ___ edad >= 18 ___ "menor"
        print(tipo)`, ['if', 'else'], 'La expresión condicional es `valor_si if condicion else valor_no`.', 'adulto'),
      bug(`
        x = 5
        if x = 5:
            print("cinco")`, 2, '`=` asigna; para comparar se usa `==`.'),
      parsons('Ordena para clasificar una temperatura', `
        temp = 31
        if temp > 30:
            print("calor")
        elif temp > 15:
            print("templado")
        else:
            print("frio")`, undefined, 'calor'),
    ]),

    lesson('py-loops', 'Bucles', `
      \`for\` recorre cualquier iterable; \`while\` repite mientras se cumpla una condición.

      \`\`\`
      for i in range(3):        # 0, 1, 2
          print(i)

      for letra in "git":       # recorre caracteres
          print(letra)

      n = 3
      while n > 0:
          n -= 1
      \`\`\`

      - \`range(inicio, fin, paso)\` excluye \`fin\`.
      - \`break\` sale del bucle; \`continue\` salta a la siguiente vuelta.
      - \`enumerate(lista)\` da índice y valor; \`zip(a, b)\` recorre dos listas a la vez.
    `, [
      predict(`
        total = 0
        for i in range(1, 5):
            total += i
        print(total)`, '10', '`range(1, 5)` produce 1, 2, 3, 4.'),
      predict(`
        for i in range(10, 0, -3):
            print(i)`, `
        10
        7
        4
        1`, 'Paso negativo: cuenta hacia atrás y se detiene antes de llegar a 0.'),
      fill(`
        for i, lang in ___(["go", "rust"]):
            print(i, lang)`, ['enumerate'], '`enumerate` devuelve pares (índice, valor).', `
        0 go
        1 rust`),
      predict(`
        for n in range(1, 10):
            if n % 2 == 0:
                continue
            if n > 5:
                break
            print(n)`, `
        1
        3
        5`, '`continue` salta los pares; `break` corta al llegar a 7.'),
      bug(`
        n = 3
        while n > 0:
            print(n)
            n += 1
        print("fin")`, 4, 'El contador debe decrecer (`n -= 1`). Con `n += 1` la condición nunca deja de cumplirse: bucle infinito.'),
      mc('¿Cuántas veces se ejecuta el cuerpo de `for i in range(2, 8, 2)`?', ['3', '4', '6', '2'], 'Produce 2, 4 y 6: tres valores.'),
      code('Escribe `cuenta_atras(n)`: devuelve una lista desde n hasta 1. `cuenta_atras(3)` → `[3, 2, 1]`.', `
        def cuenta_atras(n):
            pass`, `
        def cuenta_atras(n):
            return list(range(n, 0, -1))`,
        [['cuenta_atras(3)', '[3, 2, 1]'], ['cuenta_atras(1)', '[1]'], ['cuenta_atras(0)', '[]']]),
    ]),

    lesson('py-func', 'Funciones', `
      Una función empaqueta lógica con nombre. \`def\` la define; \`return\` devuelve el resultado.

      \`\`\`
      def saludar(nombre, saludo="Hola"):
          return f"{saludo}, {nombre}"

      saludar("Ada")                  # 'Hola, Ada'
      saludar("Ada", saludo="Hey")    # argumento por nombre
      \`\`\`

      - Sin \`return\`, la función devuelve \`None\`.
      - \`*args\` recoge argumentos posicionales extra en una tupla; \`**kwargs\`, los nombrados en un dict.
      - Las variables creadas dentro son **locales**.

      > Nunca uses un valor mutable (\`[]\`, \`{}\`) como argumento por defecto: se comparte entre llamadas.
    `, [
      predict(`
        def doble(n):
            return n * 2

        print(doble(doble(3)))`, '12'),
      predict(`
        def saludar(nombre, saludo="Hola"):
            return f"{saludo}, {nombre}"

        print(saludar("Ada"))
        print(saludar("Linus", saludo="Hey"))`, `
        Hola, Ada
        Hey, Linus`),
      predict(`
        def imprimir(x):
            print(x)

        r = imprimir("hola")
        print(r)`, `
        hola
        None`, 'Una función sin `return` devuelve `None`.'),
      fill(`
        def sumar(___numeros):
            return sum(numeros)

        print(sumar(1, 2, 3))`, ['*'], '`*numeros` recoge todos los posicionales en una tupla.', '6'),
      predict(`
        def agregar(item, lista=[]):
            lista.append(item)
            return lista

        agregar(1)
        print(agregar(2))`, '[1, 2]', 'El valor por defecto se crea una sola vez y se comparte entre llamadas. Lo correcto: `lista=None` y crear la lista dentro.'),
      code('Escribe `es_par(n)`: devuelve True si n es par.', `
        def es_par(n):
            pass`, `
        def es_par(n):
            return n % 2 == 0`,
        [['es_par(4)', 'True'], ['es_par(7)', 'False'], ['es_par(0)', 'True']]),
    ]),
  ]),

  unit('py2', 'Estructuras de datos', 'basico', 'Listas, diccionarios, sets y tuplas: dónde guardar los datos y cómo recorrerlos.', [
    lesson('py-list', 'Listas y slicing', `
      Una lista es una secuencia **mutable** y ordenada.

      \`\`\`
      nums = [3, 1, 2]
      nums.append(4)        # [3, 1, 2, 4]
      nums.sort()           # [1, 2, 3, 4] (in situ)
      nums[1:3]             # [2, 3]
      nums[::-1]            # copia invertida
      \`\`\`

      - \`.append(x)\`, \`.pop()\`, \`.insert(i, x)\`, \`.remove(x)\`, \`x in lista\`.
      - \`sorted(lista)\` devuelve una lista **nueva**; \`lista.sort()\` ordena la original y devuelve \`None\`.
      - \`b = a\` no copia: ambos nombres apuntan a la misma lista. Copia con \`a.copy()\` o \`a[:]\`.
    `, [
      predict(`
        nums = [1, 2, 3, 4, 5]
        print(nums[1:4])
        print(nums[-2:])`, `
        [2, 3, 4]
        [4, 5]`),
      predict(`
        a = [1, 2]
        b = a
        b.append(3)
        print(a)`, '[1, 2, 3]', '`b = a` no copia la lista: `a` y `b` son la misma.'),
      mc('¿Qué devuelve `[3, 1, 2].sort()`?', ['`None`', '`[1, 2, 3]`', '`[3, 2, 1]`', 'Un error'], '`.sort()` ordena in situ y devuelve `None`. Para obtener una lista nueva usa `sorted()`.'),
      fill(`
        pila = [1, 2, 3]
        ultimo = pila.___()
        print(ultimo, pila)`, ['pop'], '`.pop()` quita y devuelve el último elemento.', '3 [1, 2]'),
      predict(`
        letras = ["c", "a", "b"]
        print(sorted(letras, reverse=True))
        print(letras)`, `
        ['c', 'b', 'a']
        ['c', 'a', 'b']`, '`sorted` no modifica la lista original.'),
      code('Escribe `segundo_mayor(nums)`: devuelve el segundo valor más grande entre los valores distintos de la lista.', `
        def segundo_mayor(nums):
            pass`, `
        def segundo_mayor(nums):
            return sorted(set(nums))[-2]`,
        [['segundo_mayor([1, 5, 3])', '3'], ['segundo_mayor([4, 4, 2])', '2'], ['segundo_mayor([10, 9, 10, 8])', '9']]),
    ]),

    lesson('py-dict', 'Diccionarios y sets', `
      Un **dict** asocia claves con valores; un **set** guarda elementos únicos. Ambos buscan en O(1).

      \`\`\`
      user = {"nombre": "Ada", "edad": 36}
      user["rol"] = "admin"          # añadir o modificar
      user.get("email", "sin email") # sin KeyError
      for clave, valor in user.items():
          print(clave, valor)

      vistos = {1, 2, 2, 3}          # {1, 2, 3}
      \`\`\`

      - \`d[clave]\` lanza \`KeyError\` si no existe; \`d.get(clave)\` devuelve \`None\`.
      - Operaciones de set: \`a | b\` (unión), \`a & b\` (intersección), \`a - b\` (diferencia).
      - Los dicts conservan el orden de inserción.
    `, [
      predict(`
        stock = {"manzana": 3}
        stock["pera"] = 5
        stock["manzana"] += 1
        print(stock)`, "{'manzana': 4, 'pera': 5}"),
      predict(`
        d = {"a": 1}
        print(d.get("b"))
        print(d.get("b", 0))`, `
        None
        0`),
      predict(`
        a = {1, 2, 3}
        b = {2, 3, 4}
        print(a & b)
        print(a - b)`, `
        {2, 3}
        {1}`, '`&` es la intersección; `-` es la diferencia.'),
      fill(`
        precios = {"cafe": 2, "te": 1}
        for nombre, precio in precios.___():
            print(nombre, precio)`, ['items'], '`.items()` devuelve pares (clave, valor).', `
        cafe 2
        te 1`),
      mc('¿Cuál es la forma más rápida de comprobar si un valor ya apareció, entre millones?', ['Guardarlos en un `set` y usar `in`', 'Guardarlos en una lista y usar `in`', 'Ordenar la lista cada vez', 'Recorrerlos con un `for`'], '`in` sobre un set es O(1) de media; sobre una lista es O(n).'),
      code('Escribe `contar(palabras)`: devuelve un dict con cuántas veces aparece cada palabra.', `
        def contar(palabras):
            pass`, `
        def contar(palabras):
            cuentas = {}
            for p in palabras:
                cuentas[p] = cuentas.get(p, 0) + 1
            return cuentas`,
        [['contar(["a", "b", "a"])', '{"a": 2, "b": 1}'], ['contar([])', '{}']]),
    ]),

    lesson('py-tuple', 'Tuplas y desempaquetado', `
      Una **tupla** es una secuencia inmutable. Sirve para agrupar valores y para devolver varios.

      \`\`\`
      punto = (3, 4)
      x, y = punto               # desempaquetado
      a, b = b, a                # intercambio sin variable temporal
      primero, *resto = [1, 2, 3, 4]   # resto = [2, 3, 4]

      def min_max(nums):
          return min(nums), max(nums)   # devuelve una tupla
      \`\`\`

      Al ser inmutables y *hashables*, las tuplas pueden ser claves de un dict o elementos de un set.
    `, [
      predict(`
        a, b = 1, 2
        a, b = b, a
        print(a, b)`, '2 1'),
      predict(`
        primero, *resto = [10, 20, 30]
        print(primero)
        print(resto)`, `
        10
        [20, 30]`),
      predict(`
        def dividir(a, b):
            return a // b, a % b

        cociente, resto = dividir(17, 5)
        print(cociente, resto)`, '3 2'),
      bug(`
        punto = (3, 4)
        punto[0] = 10
        print(punto)`, 2, 'Las tuplas son inmutables: no admiten asignación por índice.'),
      mc('¿Cuál de estos puede ser clave de un diccionario?', ['`(40.4, -3.7)`', '`[40.4, -3.7]`', '`{"lat": 40.4}`', '`{40.4, -3.7}`'], 'Las claves deben ser hashables (inmutables). Listas, dicts y sets no lo son.'),
      fill(`
        pares = [("a", 1), ("b", 2)]
        for letra, ___ in pares:
            print(letra * numero)`, ['numero'], 'El desempaquetado en el `for` asigna cada elemento de la tupla a un nombre.', `
        a
        bb`),
    ]),

    lesson('py-comp', 'Comprehensions', `
      Una **comprehension** construye una colección en una sola expresión legible:

      \`\`\`
      cuadrados = [n * n for n in range(5)]             # [0, 1, 4, 9, 16]
      pares = [n for n in range(10) if n % 2 == 0]      # con filtro
      longitudes = {p: len(p) for p in ["go", "rust"]}  # dict
      unicos = {c.lower() for c in "AaBb"}              # set
      \`\`\`

      Estructura: \`[expresión for elemento in iterable if condición]\`.

      > Si necesitas varias líneas o efectos secundarios, usa un bucle normal: gana la legibilidad.
    `, [
      predict(`print([n * 2 for n in range(4)])`, '[0, 2, 4, 6]'),
      predict(`
        palabras = ["git", "python", "go"]
        print([p.upper() for p in palabras if len(p) <= 3])`, "['GIT', 'GO']"),
      fill(`
        nums = [1, 2, 3, 4]
        pares = [n ___ n in nums ___ n % 2 == 0]
        print(pares)`, ['for', 'if'], undefined, '[2, 4]'),
      predict(`
        langs = ["go", "rust"]
        print({l: len(l) for l in langs})`, "{'go': 2, 'rust': 4}"),
      parsons('Ordena para obtener los cuadrados de los impares del 1 al 5', `
        impares = [n for n in range(1, 6) if n % 2 == 1]
        cuadrados = [n ** 2 for n in impares]
        print(cuadrados)`, undefined, '[1, 9, 25]'),
      code('Escribe `solo_positivos(nums)` usando una list comprehension.', `
        def solo_positivos(nums):
            pass`, `
        def solo_positivos(nums):
            return [n for n in nums if n > 0]`,
        [['solo_positivos([-1, 2, 0, 3])', '[2, 3]'], ['solo_positivos([])', '[]']]),
    ]),
  ]),

  unit('py3', 'Python real', 'intermedio', 'Errores, archivos, módulos y clases: lo que separa un script de un programa.', [
    lesson('py-err', 'Excepciones', `
      Cuando algo falla, Python **lanza una excepción**. Captúrala con \`try/except\`:

      \`\`\`
      try:
          n = int("abc")
      except ValueError as e:
          print("no es un número:", e)
      else:
          print("sin errores")      # solo si no hubo excepción
      finally:
          print("siempre se ejecuta")
      \`\`\`

      - Captura excepciones **concretas**; un \`except:\` desnudo oculta bugs.
      - Lanza las tuyas con \`raise ValueError("mensaje")\`.
      - Define excepciones propias heredando de \`Exception\`.

      > Filosofía EAFP: en Python es idiomático intentar y manejar el error, más que comprobar antes.
    `, [
      predict(`
        try:
            print(10 / 0)
        except ZeroDivisionError:
            print("no se puede")
        finally:
            print("fin")`, `
        no se puede
        fin`),
      mc('¿Qué excepción lanza `int("hola")`?', ['`ValueError`', '`TypeError`', '`KeyError`', '`SyntaxError`'], 'El tipo es correcto (un string), pero su valor no representa un entero: `ValueError`.'),
      predict(`
        def leer(d, clave):
            try:
                return d[clave]
            except KeyError:
                return "?"

        print(leer({"a": 1}, "a"), leer({"a": 1}, "b"))`, '1 ?'),
      fill(`
        def retirar(saldo, cantidad):
            if cantidad > saldo:
                ___ ValueError("saldo insuficiente")
            return saldo - cantidad

        print(retirar(10, 3))`, ['raise'], '`raise` lanza una excepción.', '7'),
      predict(`
        try:
            x = int("42")
        except ValueError:
            print("error")
        else:
            print("ok", x)`, 'ok 42', 'El bloque `else` solo se ejecuta si el `try` no lanzó nada.'),
      match('Empareja cada error con su causa', [
        ['`KeyError`', 'Clave que no existe en un dict'],
        ['`IndexError`', 'Índice fuera de una lista'],
        ['`TypeError`', 'Operación entre tipos incompatibles'],
        ['`AttributeError`', 'Método o atributo que no existe'],
      ]),
      code('Escribe `a_entero(texto, defecto)`: convierte `texto` a entero y, si no se puede, devuelve `defecto`.', `
        def a_entero(texto, defecto):
            pass`, `
        def a_entero(texto, defecto):
            try:
                return int(texto)
            except ValueError:
                return defecto`,
        [['a_entero("42", 0)', '42'], ['a_entero("x", -1)', '-1'], ['a_entero(" 7 ", 0)', '7']]),
    ]),

    lesson('py-files', 'Archivos y with', `
      \`with\` abre un recurso y garantiza que se cierra, incluso si hay un error:

      \`\`\`
      with open("notas.txt", "w", encoding="utf-8") as f:
          f.write("hola\\n")

      with open("notas.txt", encoding="utf-8") as f:
          for linea in f:            # línea a línea, sin cargar todo en memoria
              print(linea.strip())
      \`\`\`

      - Modos: \`"r"\` leer, \`"w"\` sobrescribir, \`"a"\` añadir, \`"b"\` binario.
      - \`pathlib.Path\` es la forma moderna de manejar rutas: \`Path("data") / "a.txt"\`.
      - Para JSON: \`json.load(f)\`, \`json.dump(obj, f)\`, \`json.loads(texto)\`, \`json.dumps(obj)\`.
    `, [
      mc('¿Qué ventaja tiene `with open(...) as f:` frente a `f = open(...)`?', ['Cierra el archivo automáticamente, incluso si hay una excepción', 'Lee el archivo más rápido', 'Permite abrir archivos más grandes', 'Convierte el contenido a UTF-8'], 'Es un *context manager*: garantiza la limpieza al salir del bloque.'),
      predict(`
        import json

        datos = json.loads('{"lang": "python", "version": 3}')
        print(datos["lang"], datos["version"] + 1)`, 'python 4', '`json.loads` convierte texto JSON en estructuras de Python (dict, list, int…).'),
      fill(`
        with open("log.txt", "___") as f:
            f.write("nueva linea\\n")`, ['a'], 'El modo `"a"` (append) añade al final sin borrar el contenido.'),
      predict(`
        from pathlib import Path

        ruta = Path("proyecto") / "src" / "main.py"
        print(ruta.name, ruta.suffix, ruta.parent.name)`, 'main.py .py src'),
      ask('¿Qué modo de `open` sobrescribe el archivo si ya existe?', ['w', '"w"'], '`"w"` trunca el archivo; `"a"` añade; `"x"` falla si ya existe.'),
      predict(`
        import json

        print(json.dumps({"ok": True, "items": [1, 2]}))`, '{"ok": true, "items": [1, 2]}', 'En JSON los booleanos van en minúscula y solo se usan comillas dobles.'),
    ]),

    lesson('py-mod', 'Módulos y entornos', `
      Un **módulo** es un archivo \`.py\`; un **paquete**, una carpeta de módulos.

      \`\`\`
      import math
      from collections import Counter
      import numpy as np            # alias

      if __name__ == "__main__":    # solo al ejecutar el archivo directamente
          main()
      \`\`\`

      Cada proyecto debe tener su **entorno virtual** para aislar dependencias:

      \`\`\`bash
      python -m venv .venv
      source .venv/bin/activate
      pip install requests
      pip freeze > requirements.txt
      \`\`\`

      > Hoy, \`uv\` y \`pyproject.toml\` son la forma moderna de gestionar proyectos y dependencias.
    `, [
      mc('¿Para qué sirve un entorno virtual?', ['Aislar las dependencias de cada proyecto', 'Ejecutar Python más rápido', 'Cifrar el código fuente', 'Compilar Python a binario'], 'Así dos proyectos pueden usar versiones distintas de la misma librería sin conflicto.'),
      predict(`
        from collections import Counter

        c = Counter("banana")
        print(c["a"], c.most_common(1))`, "3 [('a', 3)]"),
      ask('¿Qué comando crea un entorno virtual en la carpeta .venv?', ['python -m venv .venv', 'python3 -m venv .venv'], 'El módulo `venv` viene con Python; `-m` lo ejecuta como script.'),
      mc('¿Cuándo es verdadera la condición `__name__ == "__main__"`?', ['Cuando el archivo se ejecuta directamente', 'Cuando el archivo se importa desde otro', 'Siempre', 'Solo dentro de una clase'], 'Al importarlo, `__name__` vale el nombre del módulo. Por eso se usa para proteger el punto de entrada.'),
      predict(`
        import math

        print(math.floor(3.7), math.ceil(3.2), round(math.pi, 2))`, '3 4 3.14'),
      match('Empareja cada archivo con su función', [
        ['`requirements.txt`', 'Lista de dependencias a instalar con pip'],
        ['`pyproject.toml`', 'Configuración moderna del proyecto y sus herramientas'],
        ['`__init__.py`', 'Marca una carpeta como paquete'],
        ['`.venv/`', 'Carpeta del entorno virtual (no se sube a git)'],
      ]),
    ]),

    lesson('py-oop', 'Clases', `
      Una **clase** define datos (atributos) y comportamiento (métodos).

      \`\`\`
      class Cuenta:
          def __init__(self, titular, saldo=0):
              self.titular = titular
              self.saldo = saldo

          def depositar(self, cantidad):
              self.saldo += cantidad

      class CuentaPremium(Cuenta):          # herencia
          def depositar(self, cantidad):
              super().depositar(cantidad * 1.01)
      \`\`\`

      - \`__init__\` inicializa el objeto; \`self\` es la instancia.
      - \`super()\` llama a la versión de la clase madre.
      - \`@property\` expone un método como si fuera un atributo.
    `, [
      predict(`
        class Contador:
            def __init__(self):
                self.n = 0

            def sumar(self):
                self.n += 1

        c = Contador()
        c.sumar()
        c.sumar()
        print(c.n)`, '2'),
      predict(`
        class Animal:
            def hablar(self):
                return "..."

        class Perro(Animal):
            def hablar(self):
                return "Guau"

        for a in [Animal(), Perro()]:
            print(a.hablar())`, `
        ...
        Guau`, 'Polimorfismo: cada objeto responde con su propia versión del método.'),
      bug(`
        class Punto:
            def __init__(self, x, y):
                self.x = x
                self.y = y

            def suma():
                return self.x + self.y`, 6, 'A los métodos de instancia les falta `self` como primer parámetro: `def suma(self):`.'),
      fill(`
        class Circulo:
            def __init__(self, radio):
                self.radio = radio

            @___
            def diametro(self):
                return self.radio * 2

        print(Circulo(5).diametro)`, ['property'], '`@property` permite leer `c.diametro` sin paréntesis.', '10'),
      predict(`
        class Base:
            def __init__(self):
                self.nombre = "base"

        class Hija(Base):
            def __init__(self):
                super().__init__()
                self.extra = True

        h = Hija()
        print(h.nombre, h.extra)`, 'base True'),
      code('Crea la clase `Pila` con los métodos `apilar(x)`, `desapilar()` (devuelve el último) y `vacia()` (True/False).', `
        class Pila:
            pass`, `
        class Pila:
            def __init__(self):
                self.items = []

            def apilar(self, x):
                self.items.append(x)

            def desapilar(self):
                return self.items.pop()

            def vacia(self):
                return not self.items`,
        [['(lambda p: (p.apilar(1), p.apilar(2), p.desapilar())[-1])(Pila())', '2'], ['Pila().vacia()', 'True'], ['(lambda p: (p.apilar(1), p.vacia())[-1])(Pila())', 'False']]),
    ]),

    lesson('py-dunder', 'Métodos especiales y dataclasses', `
      Los métodos \`__dunder__\` conectan tus clases con la sintaxis de Python:

      \`\`\`
      class Vector:
          def __init__(self, x, y): self.x, self.y = x, y
          def __repr__(self): return f"Vector({self.x}, {self.y})"
          def __add__(self, o): return Vector(self.x + o.x, self.y + o.y)
          def __eq__(self, o): return (self.x, self.y) == (o.x, o.y)
          def __len__(self): return 2
      \`\`\`

      \`@dataclass\` genera \`__init__\`, \`__repr__\` y \`__eq__\` por ti:

      \`\`\`
      from dataclasses import dataclass

      @dataclass
      class Punto:
          x: int
          y: int = 0
      \`\`\`
    `, [
      predict(`
        from dataclasses import dataclass

        @dataclass
        class Punto:
            x: int
            y: int = 0

        print(Punto(3))
        print(Punto(1, 2) == Punto(1, 2))`, `
        Punto(x=3, y=0)
        True`),
      match('Empareja cada sintaxis con el método que invoca', [
        ['`a + b`', '`__add__`'],
        ['`len(a)`', '`__len__`'],
        ['`a == b`', '`__eq__`'],
        ['`print(a)`', '`__str__` / `__repr__`'],
        ['`a[0]`', '`__getitem__`'],
      ]),
      predict(`
        class Equipo:
            def __init__(self, miembros):
                self.miembros = miembros

            def __len__(self):
                return len(self.miembros)

            def __contains__(self, nombre):
                return nombre in self.miembros

        e = Equipo(["ana", "luis"])
        print(len(e), "ana" in e)`, '2 True'),
      fill(`
        class Dinero:
            def __init__(self, cantidad):
                self.cantidad = cantidad

            def ___(self, otro):
                return Dinero(self.cantidad + otro.cantidad)

        print((Dinero(5) + Dinero(7)).cantidad)`, ['__add__'], undefined, '12'),
      mc('¿Qué hace `@dataclass(frozen=True)`?', ['Hace las instancias inmutables', 'Congela la clase para que no se pueda heredar', 'Guarda la instancia en disco', 'Acelera la creación de objetos'], 'Asignar a un atributo lanza `FrozenInstanceError`; además, la clase pasa a ser hashable.'),
      predict(`
        class Temp:
            def __init__(self, grados):
                self.grados = grados

            def __lt__(self, otra):
                return self.grados < otra.grados

        print(Temp(20) < Temp(25), min(Temp(30), Temp(10)).grados)`, 'True 10', '`min`, `max` y `sorted` usan `__lt__` para comparar.'),
    ]),
  ]),

  unit('py4', 'Python idiomático', 'avanzado', 'Generadores, decoradores, tipos y las herramientas funcionales de la biblioteca estándar.', [
    lesson('py-iter', 'Iteradores y generadores', `
      Un **generador** produce valores bajo demanda con \`yield\`, sin construir la lista entera:

      \`\`\`
      def contar(hasta):
          n = 1
          while n <= hasta:
              yield n          # pausa aquí y devuelve n
              n += 1

      for x in contar(3): ...        # 1, 2, 3
      suma = sum(n * n for n in range(1_000_000))   # expresión generadora
      \`\`\`

      - Es **perezoso**: calcula cada valor cuando se pide, con memoria constante.
      - Solo se puede recorrer **una vez**.
      - \`next(gen)\` pide el siguiente valor; al agotarse lanza \`StopIteration\`.
    `, [
      predict(`
        def pares(limite):
            n = 0
            while n < limite:
                yield n
                n += 2

        print(list(pares(7)))`, '[0, 2, 4, 6]'),
      predict(`
        gen = (n * n for n in range(3))
        print(next(gen), next(gen))
        print(list(gen))`, `
        0 1
        [4]`, 'El generador recuerda dónde iba: `list` solo recibe lo que queda.'),
      predict(`
        gen = (c for c in "ab")
        print(list(gen))
        print(list(gen))`, `
        ['a', 'b']
        []`, 'Un generador se agota: la segunda pasada no produce nada.'),
      mc('¿Qué ventaja tiene `sum(x for x in datos)` frente a `sum([x for x in datos])`?', ['No construye una lista intermedia en memoria', 'Es siempre el doble de rápido', 'Ordena los datos antes de sumar', 'Permite sumar strings'], 'La expresión generadora produce los valores uno a uno.'),
      fill(`
        def fib():
            a, b = 0, 1
            while True:
                ___ a
                a, b = b, a + b

        g = fib()
        print([next(g) for _ in range(6)])`, ['yield'], 'Un generador puede ser infinito: solo calcula lo que se le pide.', '[0, 1, 1, 2, 3, 5]'),
      code('Escribe el generador `trozos(lista, n)`: produce sublistas consecutivas de tamaño n (la última puede ser más corta).', `
        def trozos(lista, n):
            pass`, `
        def trozos(lista, n):
            for i in range(0, len(lista), n):
                yield lista[i:i + n]`,
        [['list(trozos([1, 2, 3, 4, 5], 2))', '[[1, 2], [3, 4], [5]]'], ['list(trozos([], 3))', '[]']]),
    ]),

    lesson('py-deco', 'Closures y decoradores', `
      Las funciones son valores: se pueden pasar, devolver y guardar. Una **closure** recuerda las variables del ámbito donde nació. Un **decorador** es una función que envuelve a otra:

      \`\`\`
      import functools, time

      def cronometrar(func):
          @functools.wraps(func)            # conserva nombre y docstring
          def envoltura(*args, **kwargs):
              t = time.perf_counter()
              resultado = func(*args, **kwargs)
              print(f"{func.__name__}: {time.perf_counter() - t:.3f}s")
              return resultado
          return envoltura

      @cronometrar                # equivale a: lento = cronometrar(lento)
      def lento(): ...
      \`\`\`
    `, [
      predict(`
        def multiplicador(n):
            def por(x):
                return x * n
            return por

        triple = multiplicador(3)
        print(triple(5))`, '15', '`por` es una closure: recuerda el valor de `n`.'),
      predict(`
        def gritar(func):
            def envoltura(*args):
                return func(*args).upper()
            return envoltura

        @gritar
        def saludar(nombre):
            return f"hola {nombre}"

        print(saludar("ada"))`, 'HOLA ADA'),
      mc('`@deco` encima de `def f(): ...` equivale a…', ['`f = deco(f)`', '`deco = f(deco)`', '`f = deco()`', '`deco(f())`'], 'El decorador recibe la función y su resultado sustituye al nombre original.'),
      predict(`
        def contador():
            n = 0
            def siguiente():
                nonlocal n
                n += 1
                return n
            return siguiente

        c = contador()
        c()
        print(c(), c())`, '2 3', '`nonlocal` permite modificar la variable del ámbito exterior.'),
      fill(`
        import functools

        @functools.___(maxsize=None)
        def fib(n):
            return n if n < 2 else fib(n - 1) + fib(n - 2)

        print(fib(50))`, ['lru_cache'], '`lru_cache` memoiza: cada `fib(n)` se calcula una sola vez.', '12586269025'),
      parsons('Ordena para crear un decorador que registre cada llamada', `
        def registrar(func):
            def envoltura(*args):
                print("llamando", func.__name__)
                return func(*args)
            return envoltura`),
    ]),

    lesson('py-types', 'Type hints', `
      Las anotaciones de tipo documentan y permiten que \`mypy\` o \`pyright\` detecten bugs **antes** de ejecutar. Python no las comprueba en tiempo de ejecución.

      \`\`\`
      def buscar(usuarios: dict[int, str], id: int) -> str | None:
          return usuarios.get(id)

      from typing import Protocol, TypeVar

      class Volador(Protocol):          # tipado estructural («duck typing» verificado)
          def volar(self) -> str: ...

      T = TypeVar("T")
      def primero(items: list[T]) -> T:
          return items[0]
      \`\`\`

      - \`X | None\` indica un valor opcional.
      - \`list[int]\`, \`dict[str, float]\`, \`tuple[int, ...]\`, \`Callable[[int], str]\`.
    `, [
      tf('Python lanza un error en tiempo de ejecución si pasas un `str` a un parámetro anotado como `int`.', false, 'Las anotaciones no se comprueban al ejecutar: son para herramientas como mypy/pyright y para los lectores del código.'),
      mc('¿Qué significa el tipo de retorno `-> str | None`?', ['Devuelve un string o None', 'Devuelve un string y None a la vez', 'No devuelve nada', 'Devuelve un booleano'], 'Es una unión: quien llame debe contemplar el caso `None`.'),
      predict(`
        def duplicar(x: int) -> int:
            return x * 2

        print(duplicar("ab"))`, 'abab', 'Sin verificador de tipos, la anotación no impide nada: `"ab" * 2` es válido.'),
      fill(`
        def total(precios: ___[str, float]) -> float:
            return sum(precios.values())

        print(total({"a": 1.5, "b": 2.5}))`, ['dict'], undefined, '4.0'),
      match('Empareja cada anotación con su significado', [
        ['`list[int]`', 'Lista de enteros'],
        ['`int | None`', 'Entero opcional'],
        ['`Callable[[int], str]`', 'Función que recibe int y devuelve str'],
        ['`tuple[int, ...]`', 'Tupla de enteros de cualquier longitud'],
      ]),
      mc('¿Qué herramienta analiza los tipos sin ejecutar el código?', ['mypy', 'pip', 'pytest', 'venv'], 'mypy y pyright son verificadores estáticos de tipos.'),
    ]),

    lesson('py-tools', 'functools, itertools y collections', `
      La biblioteca estándar resuelve la mayoría de patrones de datos:

      \`\`\`
      from collections import Counter, defaultdict, deque
      from itertools import chain, groupby, islice, pairwise
      from functools import reduce, partial

      Counter("banana").most_common(1)     # [('a', 3)]
      grupos = defaultdict(list)           # valor por defecto: lista vacía
      cola = deque([1, 2]); cola.appendleft(0)   # O(1) en ambos extremos
      list(chain([1, 2], [3]))             # [1, 2, 3]
      \`\`\`

      - \`sorted(items, key=...)\`, \`min/max(..., key=...)\`: ordena o elige por un criterio.
      - \`any()\` y \`all()\` evalúan condiciones sobre un iterable y cortocircuitan.
      - \`zip(a, b)\` empareja; \`enumerate(a, start=1)\` numera.
    `, [
      predict(`
        from collections import defaultdict

        grupos = defaultdict(list)
        for palabra in ["ana", "alba", "bea"]:
            grupos[palabra[0]].append(palabra)
        print(dict(grupos))`, "{'a': ['ana', 'alba'], 'b': ['bea']}"),
      predict(`
        usuarios = [("ana", 31), ("luis", 25), ("eva", 40)]
        print(sorted(usuarios, key=lambda u: u[1])[0][0])
        print(max(usuarios, key=lambda u: u[1])[0])`, `
        luis
        eva`),
      predict(`
        nums = [2, 4, 6, 7]
        print(all(n % 2 == 0 for n in nums), any(n > 6 for n in nums))`, 'False True'),
      fill(`
        from collections import ___

        cola = ___([1, 2, 3])
        cola.appendleft(0)
        cola.pop()
        print(list(cola))`, ['deque', 'deque'], '`deque` inserta y extrae en O(1) por ambos extremos; una lista es O(n) al principio.', '[0, 1, 2]'),
      predict(`
        from itertools import chain, islice

        print(list(islice(chain("ab", "cd"), 3)))`, "['a', 'b', 'c']"),
      predict(`
        nombres = ["ana", "luis"]
        edades = [31, 25]
        print(dict(zip(nombres, edades)))`, "{'ana': 31, 'luis': 25}"),
    ]),
  ]),

  unit('py5', 'Nivel experto', 'experto', 'Concurrencia, testing profesional y rendimiento: cómo se comporta Python en producción.', [
    lesson('py-async', 'asyncio', `
      \`asyncio\` ejecuta muchas tareas de **E/S** (red, disco) en un solo hilo, cediendo el control en cada \`await\`:

      \`\`\`
      import asyncio

      async def descargar(url):
          await asyncio.sleep(1)        # simula E/S sin bloquear
          return url

      async def main():
          resultados = await asyncio.gather(descargar("a"), descargar("b"))
          # ~1 s en total, no 2

      asyncio.run(main())
      \`\`\`

      - \`async def\` define una **corrutina**; llamarla no la ejecuta: hay que hacer \`await\`.
      - \`asyncio.gather\` y \`TaskGroup\` ejecutan corrutinas concurrentemente.
      - Una llamada bloqueante (\`time.sleep\`, \`requests.get\`) congela **todo** el bucle de eventos.
    `, [
      predict(`
        import asyncio

        async def tarea(nombre, espera):
            await asyncio.sleep(espera)
            print(nombre)

        async def main():
            await asyncio.gather(tarea("lenta", 0.02), tarea("rapida", 0.01))

        asyncio.run(main())`, `
        rapida
        lenta`, 'Ambas corren a la vez; termina primero la que espera menos.'),
      mc('¿Qué ocurre si llamas a `time.sleep(5)` dentro de una corrutina?', ['Bloquea todo el bucle de eventos durante 5 s', 'Solo pausa esa corrutina', 'Lanza una excepción', 'Se convierte en `asyncio.sleep` automáticamente'], 'Solo hay un hilo: una llamada bloqueante impide avanzar a todas las tareas. Usa `await asyncio.sleep()`.'),
      predict(`
        import asyncio

        async def doble(n):
            return n * 2

        async def main():
            print(await asyncio.gather(doble(1), doble(2), doble(3)))

        asyncio.run(main())`, '[2, 4, 6]', '`gather` devuelve los resultados en el orden de los argumentos.'),
      mc('¿Para qué tipo de carga es ideal asyncio?', ['Muchas operaciones de E/S concurrentes (peticiones HTTP, sockets)', 'Cálculo numérico intensivo', 'Procesamiento de imágenes en paralelo', 'Cualquier bucle `for` largo'], 'asyncio brilla cuando las tareas pasan la mayor parte del tiempo esperando. Para CPU usa procesos.'),
      fill(`
        import asyncio

        ___ def obtener():
            ___ asyncio.sleep(0.01)
            return 42

        print(asyncio.run(obtener()))`, ['async', 'await'], undefined, '42'),
      tf('Llamar a una función `async def` ejecuta su cuerpo inmediatamente.', false, 'Devuelve un objeto corrutina. No se ejecuta hasta que se le hace `await` o se programa como tarea.'),
    ]),

    lesson('py-gil', 'GIL, hilos y procesos', `
      En CPython, el **GIL** (Global Interpreter Lock) solo deja a un hilo ejecutar bytecode a la vez.

      - **Hilos** (\`threading\`, \`ThreadPoolExecutor\`): útiles para **E/S**, porque el GIL se libera mientras se espera.
      - **Procesos** (\`multiprocessing\`, \`ProcessPoolExecutor\`): paralelismo real para **CPU**; cada proceso tiene su intérprete y su GIL.
      - **asyncio**: concurrencia cooperativa en un hilo, para muchísima E/S.

      \`\`\`
      from concurrent.futures import ThreadPoolExecutor

      with ThreadPoolExecutor(max_workers=8) as pool:
          paginas = list(pool.map(descargar, urls))
      \`\`\`

      > Desde Python 3.13 existe una compilación experimental *free-threaded* sin GIL.
    `, [
      mc('Tienes que redimensionar 10 000 imágenes (CPU intensivo). ¿Qué usas?', ['`ProcessPoolExecutor`', '`ThreadPoolExecutor`', '`asyncio.gather`', 'Un bucle `for` con `time.sleep`'], 'El trabajo de CPU necesita procesos para usar varios núcleos: los hilos compiten por el GIL.'),
      mc('Tienes que hacer 500 peticiones HTTP. ¿Qué enfoque es el más adecuado?', ['asyncio o un pool de hilos', 'Un proceso del sistema por cada petición', 'Un bucle secuencial, una petición tras otra', 'Dividir el trabajo entre los núcleos con multiprocessing'], 'Es E/S: el tiempo se va esperando a la red. Hilos o asyncio son ligeros y suficientes; los procesos añaden coste sin beneficio.'),
      predict(`
        from concurrent.futures import ThreadPoolExecutor

        def cuadrado(n):
            return n * n

        with ThreadPoolExecutor() as pool:
            print(list(pool.map(cuadrado, [1, 2, 3])))`, '[1, 4, 9]', '`pool.map` conserva el orden de entrada.'),
      tf('El GIL impide que dos hilos de Python ejecuten bytecode exactamente al mismo tiempo.', true, 'Por eso los hilos no aceleran el cómputo puro en CPython.'),
      match('Empareja cada carga con la herramienta adecuada', [
        ['Scraping de 1 000 URLs', 'asyncio o hilos'],
        ['Entrenar un modelo en CPU', 'Procesos'],
        ['Servidor con 10 000 websockets', 'asyncio'],
        ['Comprimir muchos archivos', 'ProcessPoolExecutor'],
      ]),
      predict(`
        import threading

        total = 0
        lock = threading.Lock()

        def sumar():
            global total
            for _ in range(1000):
                with lock:
                    total += 1

        hilos = [threading.Thread(target=sumar) for _ in range(4)]
        for h in hilos: h.start()
        for h in hilos: h.join()
        print(total)`, '4000', 'El `Lock` protege la sección crítica: `total += 1` no es atómico.'),
    ]),

    lesson('py-test', 'Testing con pytest', `
      \`pytest\` descubre funciones \`test_*\` y usa \`assert\` normal:

      \`\`\`
      import pytest

      def test_suma():
          assert sumar(2, 3) == 5

      def test_division_por_cero():
          with pytest.raises(ZeroDivisionError):
              dividir(1, 0)

      @pytest.mark.parametrize("entrada, esperado", [(2, 4), (3, 9)])
      def test_cuadrado(entrada, esperado):
          assert cuadrado(entrada) == esperado

      @pytest.fixture
      def cliente():
          return crear_cliente_de_prueba()
      \`\`\`

      - Una **fixture** prepara datos o recursos y se inyecta por nombre.
      - **Mock**: sustituye dependencias externas (red, reloj, base de datos).
      - Patrón AAA: *Arrange* (preparar), *Act* (ejecutar), *Assert* (verificar).
    `, [
      mc('¿Cómo compruebas en pytest que una función lanza `ValueError`?', ['`with pytest.raises(ValueError):`', '`assert ValueError`', '`try: ... except: pass`', '`pytest.expect(ValueError)`'], 'El test falla si dentro del bloque no se lanza esa excepción.'),
      order('Ordena las fases de un test (patrón AAA)', ['Arrange: preparar los datos', 'Act: ejecutar el código bajo prueba', 'Assert: verificar el resultado']),
      mc('¿Qué es una fixture?', ['Una función que prepara datos o recursos para los tests', 'Un test que siempre falla', 'Un informe de cobertura', 'Un tipo de aserción'], 'pytest la ejecuta e inyecta su resultado en los tests que la piden por nombre.'),
      fill(`
        import pytest

        @pytest.mark.___("n, esperado", [(1, 1), (2, 4), (3, 9)])
        def test_cuadrado(n, esperado):
            assert n * n == esperado`, ['parametrize'], 'Genera un test independiente por cada tupla de datos.'),
      mc('Tu función llama a una API de pagos. ¿Cómo la pruebas en un test unitario?', ['Sustituyendo el cliente de la API por un mock', 'Llamando a la API real en cada test', 'No se puede probar', 'Añadiendo `time.sleep` antes de cada llamada'], 'Un test unitario debe ser rápido, determinista y sin efectos externos.'),
      match('Empareja cada tipo de test con su alcance', [
        ['Unitario', 'Una función o clase aislada'],
        ['Integración', 'Varios componentes juntos (p. ej. con la base de datos)'],
        ['End-to-end', 'El sistema completo, como lo usa el usuario'],
      ]),
    ]),

    lesson('py-perf', 'Rendimiento', `
      Regla de oro: **mide antes de optimizar** (\`timeit\`, \`cProfile\`).

      - Elige la estructura correcta: \`in\` es O(1) en \`set\`/\`dict\` y O(n) en \`list\`.
      - Une strings con \`"".join(partes)\`; concatenar con \`+=\` en un bucle puede ser O(n²).
      - Usa las funciones nativas (\`sum\`, \`min\`, \`sorted\`): están escritas en C.
      - Generadores para datos grandes; \`__slots__\` para millones de objetos pequeños.
      - Cachea resultados caros con \`functools.lru_cache\`.
      - Para cómputo numérico: NumPy vectoriza en C.

      \`\`\`
      import timeit
      timeit.timeit("x in s", setup="s = set(range(10**5)); x = 99999", number=10**5)
      \`\`\`
    `, [
      mc('¿Cuál es la forma eficiente de construir un string a partir de 100 000 fragmentos?', ['`"".join(fragmentos)`', '`s += fragmento` dentro de un bucle', '`s = s + fragmento` dentro de un bucle', '`str(fragmentos)`'], '`join` calcula el tamaño final y copia una sola vez.'),
      mc('`x in coleccion` se ejecuta millones de veces. ¿Qué tipo debe tener `coleccion`?', ['`set`', '`list`', '`tuple`', '`str`'], 'La pertenencia en un set es O(1) de media; en list/tuple es O(n).'),
      predict(`
        from functools import lru_cache

        llamadas = 0

        @lru_cache(maxsize=None)
        def lento(n):
            global llamadas
            llamadas += 1
            return n * n

        lento(4); lento(4); lento(5)
        print(llamadas)`, '2', 'La segunda llamada con 4 sale de la caché: el cuerpo solo se ejecuta dos veces.'),
      order('Ordena el proceso correcto para optimizar', ['Escribir código correcto y legible', 'Medir con un profiler para encontrar el cuello de botella', 'Optimizar solo ese punto', 'Volver a medir para confirmar la mejora']),
      tf('`sum(lista)` suele ser más rápido que un bucle `for` que acumula en una variable.', true, 'Las funciones nativas iteran en C, sin el coste del bytecode por elemento.'),
      mc('¿Para qué sirve `__slots__` en una clase?', ['Reduce la memoria por instancia al eliminar el `__dict__`', 'Hace los métodos asíncronos', 'Permite herencia múltiple', 'Cifra los atributos'], 'Útil cuando hay millones de instancias pequeñas.'),
    ]),
  ]),
])
