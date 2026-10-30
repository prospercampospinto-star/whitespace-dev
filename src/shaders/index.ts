// ─────────────────────────────────────────────────────────────────────────────
// Shaders — public API
//
// Import from '@/shaders' everywhere in the project.
// Never import from subfolders directly — this gives us one place
// to rename or reorganise internals without touching scene code.
// ─────────────────────────────────────────────────────────────────────────────

export { createToonMaterial, updateToonUniforms } from './toon/ToonMaterial'
export { applyToonMaterials }                      from './toon/applyToonMaterials'
export { PALETTE, getPaletteEntry }                from './toon/palette'
export type { ToonCapabilities, PaletteEntry, GradientMode } from './toon/ToonMaterial.types'
