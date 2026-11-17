// Resaltado de sintaxis ligero (sin dependencias) para los lenguajes de la app.
import type { ReactNode } from 'react'
import type { Lang } from '../content/types'

const KW: Partial<Record<Lang, string>> = {
  python: 'and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case True False None self',
  java: 'abstract boolean break byte case catch char class continue default do double else enum extends final finally float for if implements import instanceof int interface long new null package private protected public record return sealed permits short static super switch this throw throws try var void volatile while true false yield synchronized',
  go: 'break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var true false nil iota any',
  rust: 'as async await break const continue crate dyn else enum extern false fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait true type unsafe use where while',
  bash: 'if then else elif fi for while do done case esac function in echo export return exit cd ls cat grep sudo chmod chown mkdir rm cp mv touch git docker curl ssh kill ps find sed awk sort uniq head tail wc npm pip',
  sql: 'select from where and or not insert into values update set delete create table index primary key foreign references join inner left right outer on group by order having limit offset as distinct count sum avg min max null is in like between union begin commit rollback transaction asc desc unique default int integer text varchar',
  yaml: 'true false null',
  json: 'true false null',
}
const TYPES: Partial<Record<Lang, string>> = {
  python: 'int str float bool list dict set tuple bytes object type print len range enumerate zip map filter sorted sum min max open isinstance super property staticmethod classmethod dataclass Exception ValueError TypeError KeyError',
  java: 'String Integer Long Double Boolean Character Object List ArrayList Map HashMap Set HashSet Optional Stream Collectors System Math Thread Runnable Exception RuntimeException Override Deque ArrayDeque',
  go: 'string int int8 int16 int32 int64 uint uint8 uint64 float32 float64 bool byte rune error fmt make len cap append new panic recover close delete copy println',
  rust: 'i8 i16 i32 i64 i128 isize u8 u16 u32 u64 usize f32 f64 bool char str String Vec Option Some None Result Ok Err Box Rc Arc RefCell Mutex HashMap HashSet println print format vec panic Clone Copy Debug Display Iterator',
}

const sets = new Map<string, Set<string>>()
const setOf = (key: string, words?: string) => {
  if (!sets.has(key)) sets.set(key, new Set((words ?? '').split(' ')))
  return sets.get(key)!
}

const HASH_COMMENT: Lang[] = ['python', 'bash', 'yaml']
const COMMENT = /\/\/.*|\/\*[\s\S]*?\*\//, HASH = /#.*/, DASH = /--.*/
const STR_DQ = /"""[\s\S]*?"""|"(?:\\.|[^"\\\n])*"/, STR_BT = /`[^`]*`/
const NUM = /\b\d[\d_]*(?:\.\d+)?\b/, WORD = /[A-Za-z_][A-Za-z0-9_]*!?/, WS = /\s+/, ANY = /./
const tokenRe = (single: RegExp) =>
  new RegExp([COMMENT, HASH, DASH, new RegExp(`${STR_DQ.source}|${single.source}|${STR_BT.source}`), NUM, WORD, WS, ANY].map((r) => `(${r.source})`).join('|'), 'g')
const TOKEN_DEFAULT = tokenRe(/'(?:\\.|[^'\\\n])*'/)
// En Rust las comillas simples son un carácter ('a') o un lifetime ('a sin cerrar).
const TOKEN_RUST = tokenRe(/'(?:\\.|[^'\\\n])'|'[a-z_]+\b/)

export function highlight(code: string, lang: Lang | undefined): ReactNode[] {
  if (!lang || lang === 'text') return [code]
  const kw = setOf(`kw:${lang}`, KW[lang])
  const types = setOf(`ty:${lang}`, TYPES[lang])
  const out: ReactNode[] = []
  const ci = lang === 'sql'
  let m: RegExpExecArray | null
  let i = 0
  const TOKEN = lang === 'rust' ? TOKEN_RUST : TOKEN_DEFAULT
  TOKEN.lastIndex = 0
  const push = (cls: string | null, text: string) => out.push(cls ? <span key={i++} className={cls}>{text}</span> : text)
  while ((m = TOKEN.exec(code))) {
    const [all, slash, hash, dash, str, numTok, word] = m
    if (slash && lang !== 'python' && lang !== 'bash' && lang !== 'yaml' && lang !== 'sql') push('tk-c', all)
    else if (hash && HASH_COMMENT.includes(lang)) push('tk-c', all)
    else if (dash && lang === 'sql') push('tk-c', all)
    else if (slash || hash || dash) {
      // No es comentario en este lenguaje: reprocesar a partir del segundo carácter.
      push(null, all[0])
      TOKEN.lastIndex = m.index + 1
    } else if (str) {
      // En Rust, 'a es un lifetime y no un carácter.
      if (lang === 'rust' && /^'[a-z_]+$/.test(str)) push('tk-k', all)
      else push('tk-s', all)
    } else if (numTok) push('tk-n', all)
    else if (word) {
      const w = ci ? word.toLowerCase() : word.replace(/!$/, '')
      if (kw.has(w)) push('tk-k', all)
      else if (types.has(w) || (/^[A-Z]/.test(word) && lang !== 'bash' && lang !== 'sql')) push('tk-t', all)
      else if (code[m.index + all.length] === '(') push('tk-f', all)
      else push(null, all)
    } else push(null, all)
  }
  return out
}
