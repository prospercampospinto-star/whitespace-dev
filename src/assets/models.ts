// ─────────────────────────────────────────────────────────────────────────────
// Model manifest
//
// Single source of truth for all GLB paths.
// TypeScript catches typos at compile time instead of runtime.
// Add a new model here when you add a new .glb to /public/models/.
// ─────────────────────────────────────────────────────────────────────────────

export const MODELS = {
  marbleRun: '/models/marble-run.glb',
  toyz:      '/models/toyz.glb',
  character: '/models/character.glb',
} as const

export type ModelKey = keyof typeof MODELS
