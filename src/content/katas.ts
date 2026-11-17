// Katas: problemas clásicos con tests reales (Python en el navegador).
import { dedent } from './dsl'
import type { CodeEx } from './types'
import { hashStr } from '../engine/rng'

export interface Kata { id: string; title: string; level: 1 | 2 | 3; ex: CodeEx }

const k = (id: string, title: string, level: 1 | 2 | 3, q: string, starter: string, solution: string, tests: [string, string][], why?: string): Kata => ({
  id, title, level,
  ex: { id: `kata:${id}`, t: 'code', lang: 'python', q, starter: dedent(starter), solution: dedent(solution), tests, why },
})

export const KATAS: Kata[] = [
  k('fizzbuzz', 'FizzBuzz', 1,
    'Escribe `fizzbuzz(n)`: devuelve "Fizz" si n es múltiplo de 3, "Buzz" si lo es de 5, "FizzBuzz" si lo es de ambos y, si no, el número como string.',
    `
    def fizzbuzz(n):
        pass`,
    `
    def fizzbuzz(n):
        if n % 15 == 0:
            return "FizzBuzz"
        if n % 3 == 0:
            return "Fizz"
        if n % 5 == 0:
            return "Buzz"
        return str(n)`,
    [['fizzbuzz(3)', '"Fizz"'], ['fizzbuzz(10)', '"Buzz"'], ['fizzbuzz(30)', '"FizzBuzz"'], ['fizzbuzz(7)', '"7"']],
    'Comprueba primero el caso más específico (múltiplo de 15): si no, nunca se alcanza.'),

  k('palindromo', 'Palíndromo', 1,
    'Escribe `es_palindromo(s)`: True si el texto se lee igual al derecho y al revés, ignorando mayúsculas y espacios.',
    `
    def es_palindromo(s):
        pass`,
    `
    def es_palindromo(s):
        limpio = s.replace(" ", "").lower()
        return limpio == limpio[::-1]`,
    [['es_palindromo("Anita lava la tina")', 'True'], ['es_palindromo("python")', 'False'], ['es_palindromo("")', 'True'], ['es_palindromo("Oso")', 'True']],
    'El slice `[::-1]` invierte una secuencia.'),

  k('vocales', 'Contar vocales', 1,
    'Escribe `contar_vocales(s)`: devuelve cuántas vocales (a, e, i, o, u) hay, sin distinguir mayúsculas.',
    `
    def contar_vocales(s):
        pass`,
    `
    def contar_vocales(s):
        return sum(1 for c in s.lower() if c in "aeiou")`,
    [['contar_vocales("Murcielago")', '5'], ['contar_vocales("xyz")', '0'], ['contar_vocales("AEIOU")', '5']]),

  k('invertir', 'Invertir palabras', 1,
    'Escribe `invertir_palabras(s)`: devuelve la frase con las palabras en orden inverso.',
    `
    def invertir_palabras(s):
        pass`,
    `
    def invertir_palabras(s):
        return " ".join(reversed(s.split()))`,
    [['invertir_palabras("hola mundo cruel")', '"cruel mundo hola"'], ['invertir_palabras("uno")', '"uno"'], ['invertir_palabras("")', '""']]),

  k('primo', 'Número primo', 1,
    'Escribe `es_primo(n)`: True si n es primo. Basta con probar divisores hasta la raíz cuadrada.',
    `
    def es_primo(n):
        pass`,
    `
    def es_primo(n):
        if n < 2:
            return False
        i = 2
        while i * i <= n:
            if n % i == 0:
                return False
            i += 1
        return True`,
    [['es_primo(2)', 'True'], ['es_primo(1)', 'False'], ['es_primo(97)', 'True'], ['es_primo(91)', 'False'], ['es_primo(0)', 'False']],
    'Si n tiene un divisor mayor que √n, también tiene uno menor: no hace falta seguir.'),

  k('digitos', 'Suma de dígitos', 1,
    'Escribe `suma_digitos(n)`: suma los dígitos de un entero no negativo.',
    `
    def suma_digitos(n):
        pass`,
    `
    def suma_digitos(n):
        return sum(int(d) for d in str(n))`,
    [['suma_digitos(1234)', '10'], ['suma_digitos(0)', '0'], ['suma_digitos(999)', '27']]),

  k('fib', 'Fibonacci', 1,
    'Escribe `fib(n)`: el n-ésimo número de Fibonacci, con fib(0) = 0 y fib(1) = 1. Debe ser rápido para n = 80.',
    `
    def fib(n):
        pass`,
    `
    def fib(n):
        a, b = 0, 1
        for _ in range(n):
            a, b = b, a + b
        return a`,
    [['fib(0)', '0'], ['fib(1)', '1'], ['fib(10)', '55'], ['fib(80)', '23416728348467685']],
    'La versión iterativa es O(n); la recursiva ingenua es O(2ⁿ) y no terminaría con n = 80.'),

  k('pot2', 'Potencia de dos', 1,
    'Escribe `es_potencia_de_dos(n)`: True si n es 1, 2, 4, 8… Pista: una potencia de dos tiene un único bit a 1.',
    `
    def es_potencia_de_dos(n):
        pass`,
    `
    def es_potencia_de_dos(n):
        return n > 0 and n & (n - 1) == 0`,
    [['es_potencia_de_dos(1)', 'True'], ['es_potencia_de_dos(64)', 'True'], ['es_potencia_de_dos(12)', 'False'], ['es_potencia_de_dos(0)', 'False']],
    '`n & (n - 1)` apaga el bit a 1 más bajo; si el resultado es 0, solo había uno.'),

  k('dos-suma', 'Dos sumandos', 2,
    'Escribe `dos_suma(nums, objetivo)`: devuelve una tupla con los índices (i, j), i < j, de los dos números que suman `objetivo`. Hazlo en O(n).',
    `
    def dos_suma(nums, objetivo):
        pass`,
    `
    def dos_suma(nums, objetivo):
        vistos = {}
        for i, n in enumerate(nums):
            if objetivo - n in vistos:
                return (vistos[objetivo - n], i)
            vistos[n] = i`,
    [['dos_suma([2, 7, 11, 15], 9)', '(0, 1)'], ['dos_suma([3, 2, 4], 6)', '(1, 2)'], ['dos_suma([1, 5, 5], 10)', '(1, 2)']],
    'Un diccionario valor → índice convierte la búsqueda del complemento en O(1).'),

  k('anagramas', 'Anagramas', 2,
    'Escribe `son_anagramas(a, b)`: True si las dos palabras usan exactamente las mismas letras, sin distinguir mayúsculas.',
    `
    def son_anagramas(a, b):
        pass`,
    `
    def son_anagramas(a, b):
        return sorted(a.lower()) == sorted(b.lower())`,
    [['son_anagramas("Roma", "amor")', 'True'], ['son_anagramas("gato", "pato")', 'False'], ['son_anagramas("aab", "abb")', 'False']]),

  k('parentesis', 'Paréntesis válidos', 2,
    'Escribe `validos(s)`: True si todos los (), [] y {} se abren y cierran en el orden correcto.',
    `
    def validos(s):
        pass`,
    `
    def validos(s):
        pares = {")": "(", "]": "[", "}": "{"}
        pila = []
        for c in s:
            if c in "([{":
                pila.append(c)
            elif c in pares:
                if not pila or pila.pop() != pares[c]:
                    return False
        return not pila`,
    [['validos("([]{})")', 'True'], ['validos("(]")', 'False'], ['validos("((")', 'False'], ['validos("")', 'True'], ['validos(")(")', 'False']],
    'El clásico de la pila: cada cierre debe emparejar con el último abierto.'),

  k('comprimir', 'Compresión RLE', 2,
    'Escribe `comprimir(s)`: codifica rachas de caracteres como carácter + cantidad. "aaabcc" → "a3b1c2".',
    `
    def comprimir(s):
        pass`,
    `
    def comprimir(s):
        partes = []
        i = 0
        while i < len(s):
            j = i
            while j < len(s) and s[j] == s[i]:
                j += 1
            partes.append(s[i] + str(j - i))
            i = j
        return "".join(partes)`,
    [['comprimir("aaabcc")', '"a3b1c2"'], ['comprimir("")', '""'], ['comprimir("zzzz")', '"z4"'], ['comprimir("aba")', '"a1b1a1"']]),

  k('frecuente', 'El más frecuente', 2,
    'Escribe `mas_frecuente(items)`: devuelve el elemento que más se repite (si hay empate, el que aparece primero).',
    `
    def mas_frecuente(items):
        pass`,
    `
    def mas_frecuente(items):
        cuentas = {}
        for x in items:
            cuentas[x] = cuentas.get(x, 0) + 1
        return max(cuentas, key=cuentas.get)`,
    [['mas_frecuente([1, 3, 3, 2, 1, 3])', '3'], ['mas_frecuente(["a", "b", "b", "a"])', '"a"'], ['mas_frecuente([7])', '7']],
    '`max` devuelve el primer máximo que encuentra, y los diccionarios conservan el orden de inserción.'),

  k('aplanar', 'Aplanar listas', 2,
    'Escribe `aplanar(lista)`: convierte una lista con listas anidadas a cualquier profundidad en una lista plana.',
    `
    def aplanar(lista):
        pass`,
    `
    def aplanar(lista):
        plana = []
        for x in lista:
            if isinstance(x, list):
                plana.extend(aplanar(x))
            else:
                plana.append(x)
        return plana`,
    [['aplanar([1, [2, [3, 4]], 5])', '[1, 2, 3, 4, 5]'], ['aplanar([])', '[]'], ['aplanar([[[]], [1]])', '[1]']]),

  k('binaria', 'Búsqueda binaria', 2,
    'Escribe `buscar(nums, x)`: devuelve el índice de x en la lista ordenada `nums`, o -1 si no está. Debe ser O(log n).',
    `
    def buscar(nums, x):
        pass`,
    `
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
        return -1`,
    [['buscar([1, 3, 5, 7, 9], 7)', '3'], ['buscar([1, 3, 5, 7, 9], 4)', '-1'], ['buscar([], 1)', '-1'], ['buscar([2], 2)', '0']]),

  k('romano', 'Números romanos', 2,
    'Escribe `romano_a_entero(s)`: convierte un número romano válido a entero. Recuerda la resta: IV = 4, IX = 9, XL = 40…',
    `
    def romano_a_entero(s):
        pass`,
    `
    def romano_a_entero(s):
        valores = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
        total = 0
        for i, c in enumerate(s):
            v = valores[c]
            if i + 1 < len(s) and valores[s[i + 1]] > v:
                total -= v
            else:
                total += v
        return total`,
    [['romano_a_entero("III")', '3'], ['romano_a_entero("IX")', '9'], ['romano_a_entero("MCMXCIV")', '1994'], ['romano_a_entero("LVIII")', '58']]),

  k('rotar', 'Rotar una lista', 2,
    'Escribe `rotar(nums, k)`: devuelve la lista rotada k posiciones a la derecha. k puede ser mayor que la longitud.',
    `
    def rotar(nums, k):
        pass`,
    `
    def rotar(nums, k):
        if not nums:
            return []
        k %= len(nums)
        return nums[-k:] + nums[:-k] if k else nums[:]`,
    [['rotar([1, 2, 3, 4, 5], 2)', '[4, 5, 1, 2, 3]'], ['rotar([1, 2, 3], 3)', '[1, 2, 3]'], ['rotar([1, 2], 5)', '[2, 1]'], ['rotar([], 3)', '[]']]),

  k('intervalos', 'Fusionar intervalos', 3,
    'Escribe `fusionar(intervalos)`: recibe una lista de pares [inicio, fin] y devuelve los intervalos fusionando los que se solapan, ordenados.',
    `
    def fusionar(intervalos):
        pass`,
    `
    def fusionar(intervalos):
        resultado = []
        for inicio, fin in sorted(intervalos):
            if resultado and inicio <= resultado[-1][1]:
                resultado[-1][1] = max(resultado[-1][1], fin)
            else:
                resultado.append([inicio, fin])
        return resultado`,
    [['fusionar([[1, 3], [2, 6], [8, 10]])', '[[1, 6], [8, 10]]'], ['fusionar([[1, 4], [4, 5]])', '[[1, 5]]'], ['fusionar([[5, 6], [1, 2]])', '[[1, 2], [5, 6]]'], ['fusionar([])', '[]']],
    'Tras ordenar por inicio, cada intervalo solo puede solaparse con el último del resultado.'),

  k('subcadena', 'Subcadena sin repetidos', 3,
    'Escribe `mas_larga(s)`: la longitud de la subcadena más larga sin caracteres repetidos. Usa una ventana deslizante.',
    `
    def mas_larga(s):
        pass`,
    `
    def mas_larga(s):
        ultimo = {}
        inicio = mejor = 0
        for i, c in enumerate(s):
            if c in ultimo and ultimo[c] >= inicio:
                inicio = ultimo[c] + 1
            ultimo[c] = i
            mejor = max(mejor, i - inicio + 1)
        return mejor`,
    [['mas_larga("abcabcbb")', '3'], ['mas_larga("bbbbb")', '1'], ['mas_larga("pwwkew")', '3'], ['mas_larga("")', '0'], ['mas_larga("abba")', '2']],
    'La ventana [inicio, i] nunca contiene repetidos: cuando aparece uno, el inicio salta justo después de su última posición.'),

  k('cambio', 'Cambio mínimo', 3,
    'Escribe `cambio(monedas, total)`: el menor número de monedas para sumar `total`, o -1 si es imposible. Programación dinámica.',
    `
    def cambio(monedas, total):
        pass`,
    `
    def cambio(monedas, total):
        INF = float("inf")
        dp = [0] + [INF] * total
        for t in range(1, total + 1):
            for m in monedas:
                if m <= t and dp[t - m] + 1 < dp[t]:
                    dp[t] = dp[t - m] + 1
        return dp[total] if dp[total] != INF else -1`,
    [['cambio([1, 2, 5], 11)', '3'], ['cambio([2], 3)', '-1'], ['cambio([1, 3, 4], 6)', '2'], ['cambio([5], 0)', '0']],
    'dp[t] = mínimo de monedas para sumar t. La estrategia voraz falla con [1, 3, 4] y 6 (daría 4+1+1).'),

  k('grupos', 'Agrupar anagramas', 3,
    'Escribe `agrupar(palabras)`: agrupa las palabras que son anagramas entre sí. Devuelve una lista de grupos; cada grupo ordenado alfabéticamente y los grupos ordenados por su primera palabra.',
    `
    def agrupar(palabras):
        pass`,
    `
    def agrupar(palabras):
        grupos = {}
        for p in palabras:
            grupos.setdefault("".join(sorted(p)), []).append(p)
        return sorted(sorted(g) for g in grupos.values())`,
    [['agrupar(["roma", "amor", "gato", "mora", "toga"])', '[["amor", "mora", "roma"], ["gato", "toga"]]'], ['agrupar([])', '[]'], ['agrupar(["a"])', '[["a"]]']],
    'Las letras ordenadas sirven de clave canónica: todos los anagramas comparten la misma.'),

  k('caminos', 'Caminos en una cuadrícula', 3,
    'Escribe `caminos(filas, columnas)`: ¿de cuántas formas se puede ir de la esquina superior izquierda a la inferior derecha moviéndose solo a la derecha o hacia abajo?',
    `
    def caminos(filas, columnas):
        pass`,
    `
    def caminos(filas, columnas):
        fila = [1] * columnas
        for _ in range(filas - 1):
            for j in range(1, columnas):
                fila[j] += fila[j - 1]
        return fila[-1]`,
    [['caminos(1, 1)', '1'], ['caminos(2, 2)', '2'], ['caminos(3, 7)', '28'], ['caminos(10, 10)', '48620']],
    'Cada celda se alcanza desde arriba o desde la izquierda: caminos(f, c) = caminos(f−1, c) + caminos(f, c−1).'),
]

export const kataOfDay = (date: string): Kata => KATAS[hashStr('kata:' + date) % KATAS.length]
