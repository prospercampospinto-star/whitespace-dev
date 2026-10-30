import type { PaletteEntry } from './ToonMaterial.types'

// ─────────────────────────────────────────────────────────────────────────────
// PALETTE
//
// Keys must match Blender material names exactly (case-sensitive).
// Only shadow + highlight are required. All other fields are optional
// and fall back to scene-level defaults when omitted.
//
// To add a UV texture or overlay to a specific material:
//   import the texture, add colorMap / overlayMap to its entry.
//   The shader recompiles automatically with the right #define flags.
// ─────────────────────────────────────────────────────────────────────────────

export const PALETTE: Record<string, PaletteEntry> = {

  // normal mode looks better for round objects ──────────────────
  
  // ground texture, should be splashes of color procedurally generated in the future
  Base:        { shadow: 0x1e4a30, highlight: 0x7acf96 },

  // ── ToyZ scene ────────────────────────────────────────────────────────────
  // Add entries here as you name materials in Blender

  Cylinders: { shadow: 0x1e4a30, highlight: 0x7acf96},

  Shapes: { shadow: 0x1a5c30, highlight: 0x7affaa },

  Rails:       { shadow: 0x1a2e8b, highlight: 0x7aaeff, mode: 'normal' },
  Train:   { shadow: 0x8b1a10, highlight: 0xff8a7a },

  Toys:   { shadow: 0x8b1a10, highlight: 0xff8a7a },
  Box:  { shadow: 0x1a2e8b, highlight: 0x7aaeff },

  Wood:  { shadow: 0x8b6a00, highlight: 0xffe87a },
  Jenga:  { shadow: 0x8b6a00, highlight: 0xffe87a },

  // placeholder texture for player:
  player:  { shadow: 0x000000 , highlight: 0x000000  },

  // ── GP strokes exported as mesh ───────────────────────────────────────────
  // Flat black — no gradient, just a solid dark color
  StrokeInk:   { shadow: 0x111118, highlight: 0x222230, steps: 1 },

  // ── Fallback ──────────────────────────────────────────────────────────────
  Default:     { shadow: 0x555566, highlight: 0xeeeeff },
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function getPaletteEntry(materialName: string): PaletteEntry {
  return PALETTE[materialName] ?? PALETTE.Default
}
