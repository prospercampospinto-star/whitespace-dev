import * as THREE from 'three'
import type { GradientMode } from './ToonMaterial.types'
import { getPaletteEntry } from './palette'
import { createToonMaterial } from './ToonMaterial'

// ─────────────────────────────────────────────────────────────────────────────
// Scene-level defaults — applied to every material unless overridden
// in its palette entry.
// ─────────────────────────────────────────────────────────────────────────────

export interface SceneToonOptions {
  steps?:        number
  mode?:         GradientMode
  yMin?:         number        // auto-computed from scene bbox if omitted
  yMax?:         number
  overlayMap?:   THREE.Texture // screen-space overlay for the whole scene
  overlayBlend?: number
  overlayScale?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// applyToonMaterials
//
// Traverses a GLTF scene, reads each mesh's material name, looks it up
// in the palette, and replaces it with a compiled ToonShaderMaterial.
// Handles both single and multi-material meshes.
// ─────────────────────────────────────────────────────────────────────────────

export function applyToonMaterials(
  scene:   THREE.Object3D,
  options: SceneToonOptions = {},
): void {
  // Compute Y bounds from the whole scene if not provided
  scene.updateMatrixWorld(true)
  const bbox = new THREE.Box3().setFromObject(scene)
  const yMin  = options.yMin ?? bbox.min.y
  const yMax  = options.yMax ?? bbox.max.y

  scene.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return

    const mats = Array.isArray(node.material) ? node.material : [node.material]

    const nextMats = mats.map((original) => {
      const name  = (original as THREE.Material).name || 'Default'
      const entry = getPaletteEntry(name)

      const compiled = createToonMaterial(
        {
          // Scene-level defaults
          steps:        options.steps        ?? 4,
          mode:         options.mode         ?? 'height',
          overlayMap:   options.overlayMap,
          overlayBlend: options.overlayBlend,
          overlayScale: options.overlayScale,
          yMin,
          yMax,

          // Per-material overrides from palette
          ...entry,

          // Palette mode overrides scene default if set
          mode: entry.mode ?? options.mode ?? 'height',
        },
        name,
      )

      original.dispose()
      return compiled
    })

    node.material    = Array.isArray(node.material) ? nextMats : nextMats[0]
    node.castShadow    = true
    node.receiveShadow = true
  })
}
