// Gimnasio: generadores procedurales de ejercicios. Práctica infinita sin contenido escrito a mano.
import type { AskEx, Ex, McEx, NumEx } from '../content/types'
import { CODE_LANGS, LANG_NAME, ROSETTA } from '../content/rosetta'
import { int, pick, sample, shuffle, type Rnd } from './rng'

export interface Drill { id: string; title: string; desc: string; icon: string; color: string; gen: (rnd: Rnd, id: string) => Ex }

const ask = (id: string, q: string, ans: string[], why: string, code?: string): AskEx => ({ id, t: 'ask', q, ans, why, code })
const num = (id: string, q: string, ans: number, why: string): NumEx => ({ id, t: 'num', q, ans, why, tol: 0 })
const mc = (id: string, q: string, correct: string, wrong: string[], why: string, extra: Partial<McEx> = {}): McEx => ({
  id, t: 'mc', q, opts: [correct, ...wrong], ans: 0, why, ...extra,
})

// ── Binario y hexadecimal ────────────────────────────────────────────────────

function genBin(rnd: Rnd, id: string): Ex {
  const n = int(rnd, 2, 255)
  const bin = n.toString(2), hex = n.toString(16)
  const pesos = bin.split('').map((b, i) => (b === '1' ? 2 ** (bin.length - 1 - i) : 0)).filter(Boolean).join(' + ')
  switch (int(rnd, 0, 4)) {
    case 0: return ask(id, `Convierte ${n} (decimal) a binario`, [bin, bin.padStart(8, '0')], `${n} = ${pesos} → ${bin}`)
    case 1: return num(id, `¿Qué número decimal es ${bin} en binario?`, n, `${bin} = ${pesos} = ${n}`)
    case 2: return ask(id, `Convierte ${n} (decimal) a hexadecimal`, [hex, `0x${hex}`], `${n} = ${Math.floor(n / 16)}×16 + ${n % 16} → 0x${hex.toUpperCase()}`)
    case 3: return num(id, `¿Qué número decimal es 0x${hex.toUpperCase()}?`, n, `0x${hex.toUpperCase()} = ${Math.floor(n / 16)}×16 + ${n % 16} = ${n}`)
    default: {
      const b8 = bin.padStart(8, '0')
      return ask(id, `Convierte ${b8.slice(0, 4)} ${b8.slice(4)} (binario) a hexadecimal`, [hex.padStart(2, '0'), hex, `0x${hex.padStart(2, '0')}`],
        `Cada grupo de 4 bits es un dígito hex: ${b8.slice(0, 4)} → ${parseInt(b8.slice(0, 4), 2).toString(16).toUpperCase()}, ${b8.slice(4)} → ${parseInt(b8.slice(4), 2).toString(16).toUpperCase()}`)
    }
  }
}

// ── Operaciones de bits ──────────────────────────────────────────────────────

function genBits(rnd: Rnd, id: string): Ex {
  const a = int(rnd, 1, 15), b = int(rnd, 1, 15), s = int(rnd, 1, 4)
  const bin = (x: number) => x.toString(2).padStart(4, '0')
  switch (int(rnd, 0, 4)) {
    case 0: return num(id, `¿Cuánto vale ${a} & ${b}?`, a & b, `AND bit a bit: ${bin(a)} & ${bin(b)} = ${bin(a & b)} = ${a & b}`)
    case 1: return num(id, `¿Cuánto vale ${a} | ${b}?`, a | b, `OR bit a bit: ${bin(a)} | ${bin(b)} = ${bin(a | b)} = ${a | b}`)
    case 2: return num(id, `¿Cuánto vale ${a} ^ ${b}?`, a ^ b, `XOR bit a bit: ${bin(a)} ^ ${bin(b)} = ${bin(a ^ b)} = ${a ^ b}`)
    case 3: return num(id, `¿Cuánto vale ${a} << ${s}?`, a << s, `Desplazar ${s} a la izquierda multiplica por 2^${s}: ${a} × ${2 ** s} = ${a << s}`)
    default: { const x = a * 8 + b; return num(id, `¿Cuánto vale ${x} >> ${s}?`, x >> s, `Desplazar ${s} a la derecha divide (entero) entre 2^${s}: ${x} ÷ ${2 ** s} = ${x >> s}`) }
  }
}

// ── Subredes ─────────────────────────────────────────────────────────────────

const ipStr = (n: number) => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join('.')
const maskOf = (p: number) => (p === 0 ? 0 : (0xffffffff << (32 - p)) >>> 0)

function genCidr(rnd: Rnd, id: string): Ex {
  const p = int(rnd, 20, 30)
  const first = pick(rnd, [10, 172, 192])
  const ip = ((first << 24) | ((first === 192 ? 168 : first === 172 ? int(rnd, 16, 31) : int(rnd, 0, 255)) << 16) | (int(rnd, 0, 255) << 8) | int(rnd, 1, 254)) >>> 0
  const mask = maskOf(p), net = (ip & mask) >>> 0, bc = (net | ~mask) >>> 0
  const hosts = 2 ** (32 - p) - 2
  const block = 2 ** ((32 - p) % 8 || 8)
  switch (int(rnd, 0, 4)) {
    case 0: return num(id, `¿Cuántos hosts utilizables tiene una subred /${p}?`, hosts, `2^(32−${p}) − 2 = ${hosts + 2} − 2 = ${hosts} (se restan la dirección de red y la de broadcast)`)
    case 1: return ask(id, `¿Cuál es la máscara de subred de un /${p}?`, [ipStr(mask)], `${p} bits a 1 → ${ipStr(mask)}`)
    case 2: return ask(id, `¿Cuál es la dirección de red de ${ipStr(ip)}/${p}?`, [ipStr(net)], `Máscara ${ipStr(mask)}: los bloques van de ${block} en ${block}. IP AND máscara = ${ipStr(net)}`)
    case 3: return ask(id, `¿Cuál es la dirección de broadcast de ${ipStr(ip)}/${p}?`, [ipStr(bc)], `Red ${ipStr(net)}/${p}; el broadcast es la última dirección del bloque: ${ipStr(bc)}`)
    default: {
      const big = int(rnd, 16, 24), small = big + int(rnd, 1, 4)
      return num(id, `¿Cuántas subredes /${small} caben en un bloque /${big}?`, 2 ** (small - big), `Cada bit extra de prefijo duplica: 2^(${small}−${big}) = ${2 ** (small - big)}`)
    }
  }
}

// ── Permisos Unix ────────────────────────────────────────────────────────────

function genChmod(rnd: Rnd, id: string): Ex {
  const digits = [pick(rnd, [7, 6]), pick(rnd, [7, 6, 5, 4, 0]), pick(rnd, [7, 5, 4, 0])]
  const sym = (d: number) => `${d & 4 ? 'r' : '-'}${d & 2 ? 'w' : '-'}${d & 1 ? 'x' : '-'}`
  const octal = digits.join(''), text = digits.map(sym).join('')
  const why = `r=4, w=2, x=1 → dueño ${sym(digits[0])}=${digits[0]}, grupo ${sym(digits[1])}=${digits[1]}, otros ${sym(digits[2])}=${digits[2]}`
  if (rnd() < 0.5) return ask(id, `¿Qué número octal usarías con chmod para los permisos ${text}?`, [octal], why)
  return ask(id, `chmod ${octal} archivo — escribe los permisos en formato rwx (9 caracteres)`, [text], why)
}

// ── HTTP y puertos ───────────────────────────────────────────────────────────

const HTTP: [number, string, string][] = [
  [200, 'OK', 'La petición GET fue bien y devuelve el recurso'],
  [201, 'Created', 'Un POST creó un recurso nuevo'],
  [204, 'No Content', 'Un DELETE funcionó y no hay cuerpo que devolver'],
  [301, 'Moved Permanently', 'El recurso se mudó para siempre a otra URL'],
  [304, 'Not Modified', 'La copia en caché del cliente sigue siendo válida'],
  [400, 'Bad Request', 'El JSON enviado está mal formado'],
  [401, 'Unauthorized', 'Falta el token o no es válido: no sabemos quién eres'],
  [403, 'Forbidden', 'Sabemos quién eres, pero no tienes permiso'],
  [404, 'Not Found', 'El recurso solicitado no existe'],
  [405, 'Method Not Allowed', 'La ruta existe, pero no acepta ese método HTTP'],
  [409, 'Conflict', 'El recurso ya existe o choca con el estado actual'],
  [422, 'Unprocessable Content', 'El JSON es válido, pero los datos no pasan la validación'],
  [429, 'Too Many Requests', 'El cliente superó el límite de peticiones (rate limit)'],
  [500, 'Internal Server Error', 'Una excepción no controlada en el servidor'],
  [502, 'Bad Gateway', 'El proxy recibió una respuesta inválida del servidor de detrás'],
  [503, 'Service Unavailable', 'El servidor está caído o sobrecargado temporalmente'],
  [504, 'Gateway Timeout', 'El proxy esperó al servidor de detrás y se agotó el tiempo'],
]
const PORTS: [number, string][] = [
  [22, 'SSH'], [53, 'DNS'], [80, 'HTTP'], [443, 'HTTPS'], [25, 'SMTP'], [21, 'FTP'], [3306, 'MySQL'],
  [5432, 'PostgreSQL'], [6379, 'Redis'], [27017, 'MongoDB'], [3389, 'RDP'], [123, 'NTP'], [9092, 'Kafka'],
]

function genHttp(rnd: Rnd, id: string): Ex {
  const kind = int(rnd, 0, 3)
  if (kind === 0) {
    const [code, name, when] = pick(rnd, HTTP)
    const wrong = sample(HTTP.filter((h) => h[0] !== code), 3, rnd).map((h) => `${h[0]} ${h[1]}`)
    return mc(id, `¿Qué código HTTP corresponde? «${when}»`, `${code} ${name}`, wrong, `${code} ${name}: ${when.toLowerCase()}.`)
  }
  if (kind === 1) {
    const [code, name, when] = pick(rnd, HTTP)
    const wrong = sample(HTTP.filter((h) => h[0] !== code), 3, rnd).map((h) => h[2])
    return mc(id, `¿Qué significa un ${code} ${name}?`, when, wrong, `${code} ${name}: ${when.toLowerCase()}.`)
  }
  const [port, svc] = pick(rnd, PORTS)
  if (kind === 2) return num(id, `¿Cuál es el puerto por defecto de ${svc}?`, port, `${svc} escucha por defecto en el puerto ${port}.`)
  const wrong = sample(PORTS.filter((p) => p[0] !== port), 3, rnd).map((p) => p[1])
  return mc(id, `¿Qué servicio usa por defecto el puerto ${port}?`, svc, wrong, `El puerto ${port} es el de ${svc}.`)
}

// ── Big-O ────────────────────────────────────────────────────────────────────

const O = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)']
const BIGO: [string, number, string][] = [
  ['Acceder a un elemento de un array por índice', 0, 'La posición se calcula directamente: tiempo constante.'],
  ['Buscar una clave en un hash map (caso medio)', 0, 'El hash lleva directo al bucket.'],
  ['Apilar (push) en una pila', 0, 'Solo se toca la cima.'],
  ['Búsqueda binaria en un array ordenado', 1, 'Cada paso descarta la mitad de los elementos.'],
  ['Insertar en un árbol binario de búsqueda balanceado', 1, 'Se desciende un nivel por paso; la altura es log n.'],
  ['Buscar un valor en una lista sin ordenar', 2, 'En el peor caso se revisan todos los elementos.'],
  ['Sumar todos los elementos de un array', 2, 'Hay que visitar cada elemento una vez.'],
  ['Insertar al principio de un array dinámico', 2, 'Hay que desplazar todos los elementos una posición.'],
  ['Ordenar con merge sort', 3, 'log n niveles de división, y en cada uno se mezclan n elementos.'],
  ['Ordenar con el sort de la biblioteca estándar (caso general)', 3, 'Los algoritmos de comparación óptimos son O(n log n).'],
  ['Dos bucles anidados que recorren el mismo array', 4, 'Por cada elemento se recorren todos: n × n.'],
  ['Ordenar con bubble sort', 4, 'Compara pares adyacentes en pasadas repetidas.'],
  ['Comprobar si hay duplicados comparando cada par', 4, 'Hay n(n−1)/2 pares.'],
  ['Fibonacci recursivo ingenuo (sin memoización)', 5, 'Cada llamada genera dos más: el árbol crece exponencialmente.'],
  ['Generar todos los subconjuntos de un conjunto', 5, 'Un conjunto de n elementos tiene 2ⁿ subconjuntos.'],
  ['Buscar una palabra en un diccionario implementado con hash set', 0, 'Pertenencia en un set: O(1) de media.'],
  ['Recorrer un árbol binario completo (visitar todos los nodos)', 2, 'Cada nodo se visita exactamente una vez.'],
  ['Encontrar el mínimo en un heap mínimo', 0, 'El mínimo siempre está en la raíz.'],
  ['Extraer el mínimo de un heap', 1, 'Tras quitar la raíz hay que reordenar bajando por la altura log n.'],
]

function genBigO(rnd: Rnd, id: string): Ex {
  const [what, o, why] = pick(rnd, BIGO)
  return { id, t: 'mc', q: `¿Qué complejidad temporal tiene? ${what}`, opts: O, ans: o, why: `${O[o]} — ${why}`, fixed: true }
}

// ── Verbos irregulares en inglés ─────────────────────────────────────────────

const VERBS: [string, string, string, string][] = [
  ['be', 'was/were', 'been', 'ser/estar'], ['begin', 'began', 'begun', 'empezar'], ['break', 'broke', 'broken', 'romper'],
  ['bring', 'brought', 'brought', 'traer'], ['build', 'built', 'built', 'construir'], ['buy', 'bought', 'bought', 'comprar'],
  ['choose', 'chose', 'chosen', 'elegir'], ['come', 'came', 'come', 'venir'], ['do', 'did', 'done', 'hacer'],
  ['draw', 'drew', 'drawn', 'dibujar'], ['drive', 'drove', 'driven', 'conducir'], ['fall', 'fell', 'fallen', 'caer'],
  ['find', 'found', 'found', 'encontrar'], ['forget', 'forgot', 'forgotten', 'olvidar'], ['get', 'got', 'got/gotten', 'obtener'],
  ['give', 'gave', 'given', 'dar'], ['go', 'went', 'gone', 'ir'], ['grow', 'grew', 'grown', 'crecer'],
  ['hide', 'hid', 'hidden', 'esconder'], ['keep', 'kept', 'kept', 'mantener'], ['know', 'knew', 'known', 'saber'],
  ['leave', 'left', 'left', 'salir/dejar'], ['make', 'made', 'made', 'hacer/fabricar'], ['mean', 'meant', 'meant', 'significar'],
  ['meet', 'met', 'met', 'reunirse'], ['read', 'read', 'read', 'leer'], ['run', 'ran', 'run', 'ejecutar/correr'],
  ['see', 'saw', 'seen', 'ver'], ['send', 'sent', 'sent', 'enviar'], ['set', 'set', 'set', 'establecer'],
  ['show', 'showed', 'shown', 'mostrar'], ['speak', 'spoke', 'spoken', 'hablar'], ['take', 'took', 'taken', 'tomar'],
  ['teach', 'taught', 'taught', 'enseñar'], ['think', 'thought', 'thought', 'pensar'], ['throw', 'threw', 'thrown', 'lanzar'],
  ['understand', 'understood', 'understood', 'entender'], ['write', 'wrote', 'written', 'escribir'],
  ['overwrite', 'overwrote', 'overwritten', 'sobrescribir'], ['undo', 'undid', 'undone', 'deshacer'],
]

function genVerbs(rnd: Rnd, id: string): Ex {
  const [base, past, part, es] = pick(rnd, VERBS)
  const why = `${base} – ${past} – ${part} (${es})`
  switch (int(rnd, 0, 2)) {
    case 0: return ask(id, `Past simple de «${base}» (${es})`, past.split('/'), why)
    case 1: return ask(id, `Past participle de «${base}» (${es})`, part.split('/'), why)
    default: return ask(id, `¿Cuál es el infinitivo de «${past.split('/')[0]}»?`, [base], why)
  }
}

// ── Rosetta: traducir entre lenguajes ────────────────────────────────────────

function genRosetta(rnd: Rnd, id: string): Ex {
  const [from, to] = shuffle(CODE_LANGS, rnd)
  const [target, ...others] = sample(ROSETTA, 4, rnd)
  return mc(id, `Este código está en ${LANG_NAME[from]}. ¿Cuál es su equivalente en ${LANG_NAME[to]}?`, target.code[to],
    others.map((o) => o.code[to]), `${target.title}. ${target.note}`, { code: target.code[from], lang: from, codeOpts: true, optLang: to })
}

export const DRILLS: Drill[] = [
  { id: 'bin', title: 'Binario y hex', desc: 'Convierte entre decimal, binario y hexadecimal', icon: 'binary', color: '#ffc83d', gen: genBin },
  { id: 'bits', title: 'Operaciones de bits', desc: 'AND, OR, XOR y desplazamientos', icon: 'cpu', color: '#ff8a5c', gen: genBits },
  { id: 'cidr', title: 'Subredes', desc: 'Máscaras, hosts, red y broadcast', icon: 'network', color: '#b79bff', gen: genCidr },
  { id: 'chmod', title: 'Permisos Unix', desc: 'Traduce entre rwx y octal', icon: 'lock', color: '#5fe0a8', gen: genChmod },
  { id: 'http', title: 'HTTP y puertos', desc: 'Códigos de estado y puertos por defecto', icon: 'globe', color: '#5aa9ff', gen: genHttp },
  { id: 'bigo', title: 'Big-O', desc: 'Identifica la complejidad de cada operación', icon: 'activity', color: '#4fd8e8', gen: genBigO },
  { id: 'rosetta', title: 'Rosetta', desc: 'Traduce código entre Python, Java, Go y Rust', icon: 'languages', color: '#f0a070', gen: genRosetta },
  { id: 'verbs', title: 'Irregular verbs', desc: 'Pasado y participio de los verbos irregulares', icon: 'book', color: '#ff86c8', gen: genVerbs },
]
