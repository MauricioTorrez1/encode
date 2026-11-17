import { useEffect, useState, type CSSProperties } from 'react'
import { now } from '../engine/dates'
import { BOOST_MINUTES, MAX_FREEZES, PRICES, boostActive, buyAccent, buyBoost, buyFreeze, useStore } from '../engine/store'
import { Icon, Key } from '../ui/kit'
import { sfx } from '../ui/sound'

export const ACCENTS = [
  { id: 'lima', name: 'Lima', color: '#c6f432' },
  { id: 'cian', name: 'Cian', color: '#4de1ff' },
  { id: 'coral', name: 'Coral', color: '#ff8f7a' },
  { id: 'violeta', name: 'Violeta', color: '#b9a2ff' },
  { id: 'ambar', name: 'Ámbar', color: '#ffc83d' },
  { id: 'rosa', name: 'Rosa', color: '#ff8fd0' },
  { id: 'menta', name: 'Menta', color: '#62e6b0' },
]

export function Shop() {
  const s = useStore((x) => x)
  const [, tick] = useState(0)
  const boost = boostActive(s)
  useEffect(() => { if (!boost) return; const id = setInterval(() => tick((n) => n + 1), 1000); return () => clearInterval(id) }, [boost])
  const left = Math.max(0, s.inventory.boostUntil - now().getTime())
  const buy = (fn: () => boolean) => { if (fn()) sfx.coin(); else sfx.bad() }
  return (
    <div className="shop">
      <div className="row between"><h1>Tienda</h1><span className="balance"><Icon name="gem" size={22} fill /> {s.gems}</span></div>
      <p className="lead">Las gemas se ganan con misiones, jefes, retos diarios, logros y al subir de nivel.</p>

      <section className="card item">
        <span className="item-ic ice"><Icon name="snow" size={30} /></span>
        <div className="item-t">
          <strong>Protector de racha</strong>
          <small>Si un día no practicas, se gasta solo y tu racha sigue intacta. Tienes {s.streak.freezes} de {MAX_FREEZES}.</small>
        </div>
        <Key disabled={s.gems < PRICES.freeze || s.streak.freezes >= MAX_FREEZES} onClick={() => buy(buyFreeze)}>
          {s.streak.freezes >= MAX_FREEZES ? 'Al máximo' : <><Icon name="gem" size={16} fill /> {PRICES.freeze}</>}
        </Key>
      </section>

      <section className="card item">
        <span className="item-ic bolt"><Icon name="zap" size={30} fill /></span>
        <div className="item-t">
          <strong>XP doble · {BOOST_MINUTES} minutos</strong>
          <small>{boost ? `Activo: quedan ${Math.floor(left / 60000)}:${String(Math.floor((left % 60000) / 1000)).padStart(2, '0')}` : 'Todo el XP que ganes cuenta doble. Ideal antes de una sesión larga.'}</small>
        </div>
        <Key disabled={s.gems < PRICES.boost || boost} onClick={() => buy(buyBoost)}>{boost ? 'Activo' : <><Icon name="gem" size={16} fill /> {PRICES.boost}</>}</Key>
      </section>

      <h2>Colores de acento</h2>
      <div className="accents">
        {ACCENTS.map((a) => {
          const owned = s.inventory.accents.includes(a.id)
          const on = s.profile.accent === a.id
          return (
            <button key={a.id} type="button" className={`card accent ${on ? 'on' : ''}`} style={{ '--c': a.color } as CSSProperties} disabled={!owned && s.gems < PRICES.accent} onClick={() => buy(() => buyAccent(a.id))}>
              <span className="accent-key" />
              <strong>{a.name}</strong>
              <small>{on ? 'En uso' : owned ? 'Usar' : <><Icon name="gem" size={13} fill /> {PRICES.accent}</>}</small>
            </button>
          )
        })}
      </div>
    </div>
  )
}
