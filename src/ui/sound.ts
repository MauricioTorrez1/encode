// Efectos de sonido sintetizados con Web Audio: sin archivos, funciona sin conexión.
import { getState } from '../engine/store'

let ctx: AudioContext | undefined

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.08) {
  if (!getState().profile.sound) return
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    const t = ctx.currentTime + start
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(gain, t + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(g).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + dur + 0.02)
  } catch { /* audio no disponible */ }
}

const vibrate = (p: number | number[]) => { try { if (getState().profile.sound) navigator.vibrate?.(p) } catch { /* sin vibración */ } }

export const sfx = {
  tap: () => tone(520, 0, 0.05, 'triangle', 0.04),
  ok: () => { tone(660, 0, 0.12, 'triangle'); tone(880, 0.09, 0.18, 'triangle'); vibrate(15) },
  bad: () => { tone(220, 0, 0.16, 'sawtooth', 0.05); tone(165, 0.12, 0.22, 'sawtooth', 0.05); vibrate([30, 40, 30]) },
  combo: (n: number) => tone(660 + Math.min(n, 12) * 40, 0, 0.1, 'square', 0.03),
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.3, 'triangle')),
  level: () => [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.09, 0.35, 'triangle')),
  coin: () => { tone(988, 0, 0.08, 'square', 0.04); tone(1319, 0.07, 0.2, 'square', 0.04) },
}

/** Lee un texto en inglés con la voz del sistema. */
export function speak(text: string, rate = 0.95) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'
  u.rate = rate
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith('en'))
  if (voice) u.voice = voice
  window.speechSynthesis.speak(u)
}
