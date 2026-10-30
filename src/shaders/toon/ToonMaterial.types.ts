import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────────────────
// Gradient modes
// ─────────────────────────────────────────────────────────────────────────────

export type GradientMode = 'height' | 'normal'

// ─────────────────────────────────────────────────────────────────────────────
// Material capability set
//
// This is the single source of truth for what a material can do.
// Add a new capability here → it becomes available to every material
// in the palette without touching anything else.
// ─────────────────────────────────────────────────────────────────────────────

export interface ToonCapabilities {
  // ── Core gradient (always active) ──────────────────────────────────────────
  shadow:    number          // hex color — dark end of gradient
  highlight: number          // hex color — bright end of gradient
  steps:     number          // discrete toon bands (2 = two-tone, 4 = classic)
  mode:      GradientMode

  // ── UV color map (optional) ────────────────────────────────────────────────
  // A texture baked in Blender (diffuse, hand-painted, etc.)
  // Blended multiplicatively over the gradient color.
  colorMap?:      THREE.Texture
  colorMapBlend?: number     // 0 = ignore texture, 1 = full texture, default 0.5

  // ── Screen-space overlay (optional) ───────────────────────────────────────
  // Applied in screen UV space — same texture tiles across the whole viewport.
  // Good for paper grain, film grain, hatching overlays.
  overlayMap?:   THREE.Texture
  overlayBlend?: number      // 0–1, default 0.15
  overlayScale?: number      // texture tiling, default 1.0

  // ── World Y bounds (for height mode) ─────────────────────────────────────
  // Auto-computed from scene bounding box if omitted.
  yMin?: number
  yMax?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Palette entry — what you define per Blender material name
// Extends capabilities with an optional mode override per material.
// ─────────────────────────────────────────────────────────────────────────────

export type PaletteEntry = Omit<ToonCapabilities, 'yMin' | 'yMax' | 'steps' | 'mode'> & {
  // Per-material overrides — if omitted, scene-level defaults are used
  steps?: number
  mode?:  GradientMode
}
