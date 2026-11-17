// Mecanografía de código: escribe un snippet real midiendo PPM y precisión.
import { useEffect, useMemo, useRef, useState } from 'react'
import { CODE_LANGS, LANG_NAME, ROSETTA, type CodeLang } from '../content/rosetta'
import { finishSession, useStore, type Summary } from '../engine/store'
import { go } from '../router'
import { confetti } from '../ui/confetti'
import { Icon, Key, Mascot } from '../ui/kit'
import { sfx } from '../ui/sound'

const pickSnippet = (lang: CodeLang, avoid?: string) => {
  const pool = ROSETTA.filter((r) => r.code[lang].split('\n').length <= 9 && r.id !== avoid)
  return pool[Math.floor(Math.random() * pool.length)]
}

export function Typing() {
  const record = useStore((s) => s.totals.wpm)
  const [lang, setLang] = useState<CodeLang>('python')
  const [snippet, setSnippet] = useState(() => pickSnippet('python'))
  const [typed, setTyped] = useState('')
  const [started, setStarted] = useState<number | null>(null)
  const [done, setDone] = useState<{ wpm: number; acc: number; sum: Summary } | null>(null)
  const keystrokes = useRef(0)
  const errors = useRef(0)
  const input = useRef<HTMLTextAreaElement>(null)
  const target = useMemo(() => snippet.code[lang].replace(/\t/g, '    '), [snippet, lang])

  const reset = (l: CodeLang = lang, fresh = true) => {
    setLang(l)
    if (fresh) setSnippet(pickSnippet(l, snippet.id))
    setTyped(''); setStarted(null); setDone(null)
    keystrokes.current = 0; errors.current = 0
    requestAnimationFrame(() => input.current?.focus())
  }
  useEffect(() => { input.current?.focus() }, [])

  const onChange = (raw: string) => {
    if (done) return
    let v = raw.replace(/\t/g, '    ')
    if (v.length > typed.length) {
      if (started === null) setStarted(Date.now())
      const added = v.slice(typed.length)
      keystrokes.current += added.length
      for (let i = 0; i < added.length; i++) if (added[i] !== target[typed.length + i]) errors.current++
      // Tras un salto de línea, la sangría se escribe sola (como en un editor real).
      if (added.endsWith('\n') && target[v.length - 1] === '\n') {
        const rest = target.slice(v.length)
        v += rest.match(/^ */)![0]
      }
    }
    v = v.slice(0, target.length)
    setTyped(v)
    if (v.length >= target.length) {
      const minutes = Math.max(1 / 60, (Date.now() - (started ?? Date.now())) / 60_000)
      const acc = Math.max(0, 1 - errors.current / Math.max(1, keystrokes.current))
      const wpm = Math.round((target.length / 5 / minutes) * acc)
      const sum = finishSession({ kind: 'typing', answers: [], maxCombo: 0, wpm })
      setDone({ wpm, acc, sum })
      sfx.win()
      if (wpm > record) confetti()
    }
  }

  return (
    <div className="session typing">
      <header className="session-top">
        <button type="button" className="iconbtn" aria-label="Salir" onClick={() => go('entrenar')}><Icon name="x" size={22} /></button>
        <div className="tabs">
          {CODE_LANGS.map((l) => <button key={l} type="button" className={`tab ${l === lang ? 'on' : ''}`} onClick={() => reset(l)}>{LANG_NAME[l]}</button>)}
        </div>
        <span className="mono muted">Récord {record} PPM</span>
      </header>
      <main className="session-body">
        <div className="eyebrow">Mecanografía · {snippet.title}</div>
        <h2 className="q">Escribe este código tal cual. La sangría se pone sola.</h2>
        <div className="typebox" onClick={() => input.current?.focus()}>
          <pre className="code">
            {target.split('').map((ch, i) => {
              const cls = i < typed.length ? (typed[i] === ch ? 'ty-ok' : 'ty-bad') : i === typed.length ? 'ty-cur' : ''
              return <span key={i} className={cls}>{ch === '\n' ? '⏎\n' : ch}</span>
            })}
          </pre>
          <textarea ref={input} className="typebox-in" value={typed} onChange={(e) => onChange(e.target.value)} disabled={!!done} spellCheck={false} autoCapitalize="off" autoCorrect="off" autoComplete="off" aria-label="Escribe aquí el código"
            onKeyDown={(e) => { if (e.key === 'Tab') e.preventDefault() }} />
        </div>
        {done && (
          <div className="center summary">
            <Mascot mood="party" size={96} />
            <div className="stat-row">
              <div className="stat xp"><span className="stat-l">Velocidad</span><span className="stat-v">{done.wpm} PPM</span></div>
              <div className="stat acc"><span className="stat-l">Precisión</span><span className="stat-v">{Math.round(done.acc * 100)}%</span></div>
              <div className="stat time"><span className="stat-l">XP</span><span className="stat-v">+{done.sum.xp}</span></div>
            </div>
            {done.sum.achievements.map((a) => <p key={a.id} className="hint">Logro desbloqueado: {a.title}</p>)}
          </div>
        )}
      </main>
      <footer className="session-foot">
        <div className="session-foot-in">
          <Key variant="ghost" onClick={() => reset(lang, false)}><Icon name="redo" size={18} /> Reiniciar</Key>
          <Key size="lg" onClick={() => reset()}>Otro snippet</Key>
        </div>
      </footer>
    </div>
  )
}
