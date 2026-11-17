import { defineConfig } from 'vitest/config'

// Verificación del contenido con los compiladores reales (python3, java, go, rustc).
export default defineConfig({
  test: { include: ['scripts/verify-content.ts'], environment: 'node', testTimeout: 1_800_000, hookTimeout: 1_800_000 },
})
