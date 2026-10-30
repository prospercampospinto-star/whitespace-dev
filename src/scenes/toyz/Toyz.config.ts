import type { SceneConfig } from '@/core/SceneManager.types'


// Add the config to src/scenes/index.ts — that's all.
// ─────────────────────────────────────────────────────────────────────────────

export const ToyzConfig: SceneConfig = {
  id:    'Toyz',                              // unique, kebab-case
  label: 'Toyz',                              // shown in UI labels
  glb:   '/models/toyz.glb',                 // path under /public/models/

  // Lazy import — SceneManager loads this only when character is nearby
  component: () => import('./Toyz'),

  // Where this scene sits in the shared world
  position: [0, 0, 0],

  // Character must be within this many units for the scene to mount
  triggerRadius: 5,

  // Toon shader defaults for this scene
  // Individual materials can override mode/steps via palette.ts entry
  toon: {
    steps: 4,
    mode:  'height',
    // overlayMap, overlayBlend, overlayScale — add when you have a texture
  },

  // World-space UI anchored to this scene
  ui: {
    outlineColor: '#ffffff',
    showArrow:    true,
    showLabel:    true,
    labelOffset:  [0, 1, 0],  // relative to scene top
  },
}
