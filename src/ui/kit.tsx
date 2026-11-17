// Piezas base de la interfaz: iconos, teclas, anillo de progreso, mascota, markdown, código y editor.
import {
  Activity, ArrowDown, ArrowRight, ArrowUp, Award, Binary, BookOpen, Brain, Bug, CalendarDays, Check, ChevronDown,
  ChevronLeft, ChevronRight, CircleHelp, Clock, Code, Columns3, Compass, Cpu, Crown, Download, Dumbbell, Eye, Flame, Gem,
  Gift, GitBranch, Globe, House, Info, Keyboard, Languages, Layers, Lightbulb, Lock, LockOpen, Map as MapIcon, Moon,
  Network, Pencil, Play, Rocket, RotateCcw, Settings, Shuffle, SkipForward, Skull, Snowflake, Sparkles, Star, Store, Sun,
  Sunrise, Swords, Target, Terminal, Timer, Trash2, TrendingUp, Trophy, Upload, User, Volume2, VolumeX, X, Zap,
  type LucideIcon,
} from 'lucide-react'
import { useRef, type ButtonHTMLAttributes, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import type { Lang } from '../content/types'
import { highlight } from './highlight'

const ICONS: Record<string, LucideIcon> = {
  activity: Activity, down: ArrowDown, right: ArrowRight, up: ArrowUp, award: Award, binary: Binary, book: BookOpen,
  brain: Brain, bug: Bug, calendar: CalendarDays, check: Check, chevDown: ChevronDown, chevLeft: ChevronLeft,
  chevRight: ChevronRight, help: CircleHelp, clock: Clock, code: Code, columns: Columns3, compass: Compass, cpu: Cpu,
  crown: Crown, download: Download, dumbbell: Dumbbell, eye: Eye, flame: Flame, gem: Gem, gift: Gift, git: GitBranch,
  globe: Globe, home: House, info: Info, keyboard: Keyboard, languages: Languages, layers: Layers, bulb: Lightbulb,
  lock: Lock, unlock: LockOpen, map: MapIcon, moon: Moon, network: Network, pencil: Pencil, play: Play, rocket: Rocket,
  redo: RotateCcw, settings: Settings, shuffle: Shuffle, skip: SkipForward, skull: Skull, snow: Snowflake,
  sparkles: Sparkles, star: Star, store: Store, sun: Sun, sunrise: Sunrise, swords: Swords, target: Target,
  terminal: Terminal, timer: Timer, trash: Trash2, trend: TrendingUp, trophy: Trophy, upload: Upload, user: User,
  volume: Volume2, mute: VolumeX, x: X, zap: Zap,
}

export function Icon({ name, size = 20, fill, className }: { name: string; size?: number; fill?: boolean; className?: string }) {
  const C = ICONS[name] ?? CircleHelp
  return <C size={size} strokeWidth={2.2} fill={fill ? 'currentColor' : 'none'} className={className} aria-hidden />
}

type KeyProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'brand' | 'ghost' | 'ok' | 'bad' | 'dark'; size?: 'sm' | 'md' | 'lg'; block?: boolean }

/** Botón con forma de tecla mecánica: el motivo visual de la app. */
export function Key({ variant = 'brand', size = 'md', block, className = '', ...rest }: KeyProps) {
  return <button type="button" {...rest} className={`key key-${variant} key-${size} ${block ? 'key-block' : ''} ${className}`} />
}

export function Ring({ value, size = 64, stroke = 7, color, children }: { value: number; size?: number; stroke?: number; color?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color ?? 'var(--brand)'} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(0, Math.min(1, value)))} transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.2,.8,.2,1)' }}
        />
      </svg>
      <div className="ring-in">{children}</div>
    </div>
  )
}

export function Bar({ value, color, height = 10 }: { value: number; color?: string; height?: number }) {
  return (
    <div className="bar" style={{ height }} role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className="bar-fill" style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, background: color }} />
    </div>
  )
}

export type Mood = 'happy' | 'think' | 'sad' | 'party' | 'wink'

/** Bit, la mascota: una tecla con llaves por brazos. */
export function Mascot({ mood = 'happy', size = 96 }: { mood?: Mood; size?: number }) {
  const eyes = {
    happy: <><circle cx="47" cy="56" r="6" /><circle cx="73" cy="56" r="6" /></>,
    wink: <><circle cx="47" cy="56" r="6" /><path d="M66 57 q7 -7 14 0" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></>,
    think: <><circle cx="49" cy="53" r="6" /><circle cx="75" cy="53" r="6" /></>,
    sad: <><circle cx="47" cy="58" r="6" /><circle cx="73" cy="58" r="6" /><path d="M38 46 l14 4 M82 46 l-14 4" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" /></>,
    party: <><path d="M40 58 q7 -9 14 0 M66 58 q7 -9 14 0" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" /></>,
  }[mood]
  const mouth = {
    happy: <path d="M50 71 q10 9 20 0" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />,
    wink: <path d="M50 71 q10 9 20 0" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />,
    think: <path d="M54 74 h14" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />,
    sad: <path d="M50 77 q10 -8 20 0" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />,
    party: <path d="M48 69 q12 16 24 0 z" />,
  }[mood]
  return (
    <svg className={`mascot mascot-${mood}`} width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="Bit, la mascota de encode">
      <path d="M22 44 q-10 0 -10 10 v4 q0 6 -6 6 q6 0 6 6 v4 q0 10 10 10" fill="none" stroke="var(--brand-edge)" strokeWidth="6" strokeLinecap="round" />
      <path d="M98 44 q10 0 10 10 v4 q0 6 6 6 q-6 0 -6 6 v4 q0 10 -10 10" fill="none" stroke="var(--brand-edge)" strokeWidth="6" strokeLinecap="round" />
      <rect x="24" y="30" width="72" height="68" rx="20" fill="var(--brand-edge)" />
      <rect x="24" y="22" width="72" height="68" rx="20" fill="var(--brand)" />
      <rect x="54" y="8" width="12" height="6" rx="2" fill="var(--brand)" className="mascot-cursor" />
      <g fill="var(--on-brand)" color="var(--on-brand)">{eyes}{mouth}</g>
    </svg>
  )
}

// ── Código ───────────────────────────────────────────────────────────────────

export function CodeBlock({ code, lang, className = '' }: { code: string; lang?: Lang; className?: string }) {
  return <pre className={`code ${className}`}><code>{highlight(code, lang)}</code></pre>
}

/** Editor ligero: un textarea transparente sobre el código resaltado. */
export function Editor({ value, onChange, lang, minRows = 6, disabled }: { value: string; onChange: (v: string) => void; lang?: Lang; minRows?: number; disabled?: boolean }) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const unit = lang === 'go' ? '\t' : '    '
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget
    const { selectionStart: s, selectionEnd: en } = el
    const put = (text: string, caret: number) => {
      e.preventDefault()
      onChange(value.slice(0, s) + text + value.slice(en))
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = caret })
    }
    if (e.key === 'Tab' && !e.shiftKey) put(unit, s + unit.length)
    else if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
      const line = value.slice(0, s).split('\n').pop() ?? ''
      const indent = line.match(/^[ \t]*/)![0] + (/[:{([]\s*$/.test(line) ? unit : '')
      put('\n' + indent, s + 1 + indent.length)
    } else if (e.key === 'Backspace' && s === en && unit !== '\t' && value.slice(0, s).endsWith(unit) && /^ *$/.test(value.slice(0, s).split('\n').pop() ?? 'x')) {
      e.preventDefault()
      onChange(value.slice(0, s - unit.length) + value.slice(en))
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s - unit.length })
    }
  }
  const rows = Math.max(minRows, value.split('\n').length + 1)
  return (
    <div className="editor" style={{ '--rows': rows } as CSSProperties}>
      <pre className="code editor-hl" aria-hidden><code>{highlight(value, lang)}{'\n'}</code></pre>
      <textarea
        ref={ref} className="editor-ta" value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={onKey} disabled={disabled}
        spellCheck={false} autoCapitalize="off" autoCorrect="off" autoComplete="off" aria-label="Editor de código" wrap="off"
      />
    </div>
  )
}

// ── Markdown ligero ──────────────────────────────────────────────────────────

/** Formato en línea: `código`, **negrita** y *cursiva*. */
export function inline(text: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g
  let last = 0, m: RegExpExecArray | null, i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    if (m[1] !== undefined) out.push(<code key={i++} className="ic">{m[1]}</code>)
    else if (m[2] !== undefined) out.push(<strong key={i++}>{m[2]}</strong>)
    else out.push(<em key={i++}>{m[3]}</em>)
    last = m.index + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

/** Markdown mínimo: párrafos, listas, encabezados `#`, bloques ``` y notas `> `. */
export function Md({ text, lang }: { text: string; lang?: Lang }) {
  const blocks: ReactNode[] = []
  const lines = text.split('\n')
  let i = 0, k = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith('```')) {
      const l = (line.slice(3).trim() || lang) as Lang | undefined
      const buf: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) buf.push(lines[i++])
      i++
      blocks.push(<CodeBlock key={k++} code={buf.join('\n')} lang={l} />)
    } else if (/^#+ /.test(line)) {
      blocks.push(<h3 key={k++} className="md-h">{inline(line.replace(/^#+ /, ''))}</h3>)
      i++
    } else if (line.startsWith('> ')) {
      const buf: string[] = []
      while (i < lines.length && lines[i].startsWith('> ')) buf.push(lines[i++].slice(2))
      blocks.push(<div key={k++} className="md-note"><Icon name="bulb" size={18} /><p>{inline(buf.join(' '))}</p></div>)
    } else if (line.startsWith('|')) {
      const rows: string[][] = []
      while (i < lines.length && lines[i].startsWith('|')) {
        if (!/^\|[\s|:-]+\|?$/.test(lines[i])) rows.push(lines[i].replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|')))
        i++
      }
      blocks.push(
        <div key={k++} className="md-table-wrap">
          <table className="md-table">
            <thead><tr>{rows[0].map((c, j) => <th key={j}>{inline(c)}</th>)}</tr></thead>
            <tbody>{rows.slice(1).map((r, j) => <tr key={j}>{r.map((c, n) => <td key={n}>{inline(c)}</td>)}</tr>)}</tbody>
          </table>
        </div>,
      )
    } else if (/^[-*] /.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-*] /.test(lines[i])) items.push(lines[i++].slice(2))
      blocks.push(<ul key={k++} className="md-ul">{items.map((it, j) => <li key={j}>{inline(it)}</li>)}</ul>)
    } else if (!line.trim()) {
      i++
    } else {
      const buf: string[] = []
      while (i < lines.length && lines[i].trim() && !/^(```|#+ |> |[-*] |\|)/.test(lines[i])) buf.push(lines[i++])
      blocks.push(<p key={k++}>{inline(buf.join(' '))}</p>)
    }
  }
  return <div className="md">{blocks}</div>
}

export function Chip({ icon, children, color, title }: { icon?: string; children: ReactNode; color?: string; title?: string }) {
  return <span className="chip" style={color ? { color } : undefined} title={title}>{icon && <Icon name={icon} size={16} fill />}{children}</span>
}

export function TrackKey({ glyph, color, size = 56 }: { glyph: string; color: string; size?: number }) {
  return (
    <span className="trackkey" style={{ '--c': color, width: size, height: size, fontSize: size * (glyph.length > 2 ? 0.3 : 0.36) } as CSSProperties}>
      {glyph}
    </span>
  )
}
