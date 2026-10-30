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
  // ── Marble Run ────────────────────────────────────────────────────────────
  TrackWood:   { shadow: 0x7a5230, highlight: 0xe8c07a },
  TrackMetal:  { shadow: 0x3a5f75, highlight: 0xb8dff0 },
  Support:     { shadow: 0x3b2e22, highlight: 0x9b7d62 },
  Base:        { shadow: 0x1e4a30, highlight: 0x7acf96 },

  // ── Marbles (normal mode looks better for round objects) ──────────────────
  MarbleRed:   { shadow: 0x8b1a10, highlight: 0xff8a7a, mode: 'normal' },
  MarbleBlue:  { shadow: 0x1a2e8b, highlight: 0x7aaeff, mode: 'normal' },
  MarbleGreen: { shadow: 0x1a5c30, highlight: 0x7affaa, mode: 'normal' },
  MarbleGold:  { shadow: 0x8b6a00, highlight: 0xffe87a, mode: 'normal' },

  // ── ToyZ scene ────────────────────────────────────────────────────────────
  // Add entries here as you name materials in Blender

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
