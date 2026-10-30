// ─────────────────────────────────────────────────────────────────────────────
// Scene registry
//
// This is the ONLY file you touch to add a new scene.
//
// Steps:
//   1. Copy src/scenes/_template/ → src/scenes/YourScene/
//   2. Rename Template → YourScene in both files
//   3. Fill in YourScene.config.ts (id, label, glb, position, triggerRadius)
//   4. Add your Blender material names to src/shaders/toon/palette.ts
//   5. Import the config below and add it to SCENES
//   Done.
// ─────────────────────────────────────────────────────────────────────────────

import { ToyzConfig } from './toyz/Toyz.config'
// import { ToyZConfig }   from './ToyZ/ToyZ.config'   ← uncomment when ready

export const SCENES = [
  ToyzConfig,
  // ToyZConfig,
] as const

export type SceneId = typeof SCENES[number]['id']
