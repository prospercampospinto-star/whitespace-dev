import type * as THREE from 'three'
import type { SceneToonOptions } from '@/shaders/toon/applyToonMaterials'

// ─────────────────────────────────────────────────────────────────────────────
// SceneConfig
//
// Everything a scene needs to declare about itself.
// Consumed by SceneManager and the scene registry.
// ─────────────────────────────────────────────────────────────────────────────

export interface SceneConfig {
  id:        string
  label:     string
  glb:       string                            // path under /public/models/
  component: () => Promise<{ default: React.ComponentType<SceneProps> }>

  // World position of this scene's origin
  position: [number, number, number]

  // Character must be within this radius for the scene to load
  triggerRadius: number

  // Toon shader defaults for this scene
  // (individual materials can override via palette entry)
  toon?: SceneToonOptions

  // World-space UI configuration
  ui?: SceneUIConfig
}

// ─────────────────────────────────────────────────────────────────────────────
// SceneProps — passed from SceneManager to every scene component
// ─────────────────────────────────────────────────────────────────────────────

export interface SceneProps {
  position: [number, number, number]
  toon?:    SceneToonOptions
}

// ─────────────────────────────────────────────────────────────────────────────
// SceneUIConfig — optional world-space UI anchored to the scene
// ─────────────────────────────────────────────────────────────────────────────

export interface SceneUIConfig {
  outlineColor?:  string              // CSS color for the bounding-box outline
  showArrow?:     boolean             // show pointer arrow when far away
  labelOffset?:   [number, number, number] // offset from scene top for label
  showLabel?:     boolean
}
