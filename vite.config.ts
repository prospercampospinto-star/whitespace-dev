import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// ─────────────────────────────────────────────────────────────────────────────
// Vite config
//
// Key additions vs. the default:
//   - Path alias @/ → src/  (keeps imports clean across deep folder trees)
//   - assetsInclude .glsl   (allows ?raw imports of shader files)
//
// The ?raw suffix on GLSL imports (e.g. import vert from './toon.vert.glsl?raw')
// returns the file as a plain string — no plugin needed, built into Vite.
// ─────────────────────────────────────────────────────────────────────────────

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  // Tell Vite to treat .glsl as a raw asset so ?raw imports work
  assetsInclude: ['**/*.glsl'],
})
