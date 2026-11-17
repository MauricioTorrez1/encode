import { useState } from 'react'
import { CODE_LANGS, LANG_NAME, ROSETTA } from '../content/rosetta'
import { go } from '../router'
import { CodeBlock, Icon, Key, inline } from '../ui/kit'

export function RosettaScreen() {
  const [open, setOpen] = useState(ROSETTA[0].id)
  return (
    <div className="rosetta">
      <div className="row gap">
        <button type="button" className="iconbtn" aria-label="Volver" onClick={() => go('entrenar')}><Icon name="chevLeft" /></button>
        <h1>Rosetta</h1>
      </div>
      <p className="lead">El mismo concepto en los cuatro lenguajes. Aprender uno acelera los otros: fíjate en qué cambia y qué no.</p>
      <Key variant="ghost" onClick={() => go('s/drill/rosetta')}><Icon name="shuffle" size={18} /> Practicar traducciones</Key>
      <div className="rosetta-list">
        {ROSETTA.map((r) => (
          <section key={r.id} className={`card rosetta-item ${open === r.id ? 'open' : ''}`}>
            <button type="button" className="rosetta-head" aria-expanded={open === r.id} onClick={() => setOpen(open === r.id ? '' : r.id)}>
              <strong>{r.title}</strong><Icon name="chevDown" />
            </button>
            {open === r.id && (
              <>
                <p className="muted">{inline(r.note)}</p>
                <div className="rosetta-grid">
                  {CODE_LANGS.map((l) => (
                    <div key={l}><span className={`langtag lang-${l}`}>{LANG_NAME[l]}</span><CodeBlock code={r.code[l]} lang={l} /></div>
                  ))}
                </div>
                <p className="muted small">Salida de los cuatro: <code className="ic">{r.out.replace(/\n/g, ' ⏎ ')}</code></p>
              </>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
