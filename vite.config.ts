import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// base relativa: la app funciona igual en la raíz de un dominio o bajo /encode/ (GitHub Pages).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { target: 'es2022', chunkSizeWarningLimit: 900 },
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
})
