// Router mínimo basado en hash: funciona en GitHub Pages sin configuración de servidor.
import { useSyncExternalStore } from 'react'

const read = () => window.location.hash.replace(/^#\/?/, '')
const subscribe = (l: () => void) => { window.addEventListener('hashchange', l); return () => window.removeEventListener('hashchange', l) }

/** Segmentos de la ruta actual, p. ej. `#/ruta/python` → ['ruta', 'python']. */
export function useRoute(): string[] {
  const path = useSyncExternalStore(subscribe, read, read)
  return path.split('/').filter(Boolean).map(decodeURIComponent)
}

export function go(path: string, replace = false) {
  const hash = '#/' + path.replace(/^\//, '')
  if (replace) window.location.replace(hash)
  else window.location.hash = hash
  window.scrollTo(0, 0)
}

export const back = () => (window.history.length > 1 ? window.history.back() : go(''))
