// Confeti en canvas, sin dependencias. Respeta prefers-reduced-motion.
const COLORS = ['#c6f432', '#5cc8ff', '#ffc83d', '#ff86c8', '#b79bff', '#5fe0a8']

export function confetti(count = 110) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:999'
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  document.body.appendChild(canvas)
  const g = canvas.getContext('2d')!
  g.scale(dpr, dpr)
  const parts = Array.from({ length: count }, () => ({
    x: innerWidth / 2 + (Math.random() - 0.5) * 120,
    y: innerHeight * 0.45,
    vx: (Math.random() - 0.5) * 14,
    vy: -Math.random() * 13 - 4,
    size: 5 + Math.random() * 6,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.4,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }))
  const t0 = performance.now()
  const tick = (t: number) => {
    const life = (t - t0) / 2200
    g.clearRect(0, 0, innerWidth, innerHeight)
    for (const p of parts) {
      p.vy += 0.32
      p.vx *= 0.99
      p.x += p.vx
      p.y += p.vy
      p.rot += p.vr
      g.save()
      g.globalAlpha = Math.max(0, 1 - life)
      g.translate(p.x, p.y)
      g.rotate(p.rot)
      g.fillStyle = p.color
      g.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66)
      g.restore()
    }
    if (life < 1) requestAnimationFrame(tick)
    else canvas.remove()
  }
  requestAnimationFrame(tick)
}
