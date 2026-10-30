import * as THREE from 'three'
import type { ToonCapabilities } from './ToonMaterial.types'

// Imported as strings by Vite (see vite.config.ts for glsl plugin setup)
import vertGLSL from './toon.vert.glsl?raw'
import fragGLSL from './toon.frag.glsl?raw'

// ─────────────────────────────────────────────────────────────────────────────
// createToonMaterial
//
// Builds a ShaderMaterial from a capability set.
// #define flags are injected at compile time — only active features
// are compiled into the shader, zero cost for inactive ones.
// ─────────────────────────────────────────────────────────────────────────────

export function createToonMaterial(
  caps: ToonCapabilities,
  name: string,
): THREE.ShaderMaterial {

  // ── Compile-time defines ─────────────────────────────────────────────────
  const defines: Record<string, boolean> = {}
  if (caps.colorMap)   defines.USE_COLOR_MAP = true
  if (caps.overlayMap) defines.USE_OVERLAY   = true
  if (caps.mode === 'normal') defines.MODE_NORMAL = true

  // ── Uniforms ─────────────────────────────────────────────────────────────
  const uniforms: Record<string, THREE.IUniform> = {
    uShadow:    { value: new THREE.Color(caps.shadow) },
    uHighlight: { value: new THREE.Color(caps.highlight) },
    uSteps:     { value: Math.max(2, Math.floor(caps.steps)) },
    uYMin:      { value: caps.yMin ?? -1 },
    uYMax:      { value: caps.yMax ??  3 },
    uLightDir:  { value: new THREE.Vector3(0.6, 1.0, 0.4).normalize() },
  }

  if (caps.colorMap) {
    uniforms.uColorMap      = { value: caps.colorMap }
    uniforms.uColorMapBlend = { value: caps.colorMapBlend ?? 0.5 }
  }

  if (caps.overlayMap) {
    uniforms.uOverlayMap   = { value: caps.overlayMap }
    uniforms.uOverlayBlend = { value: caps.overlayBlend ?? 0.15 }
    uniforms.uOverlayScale = { value: caps.overlayScale ?? 1.0 }
  }

  // ── Build material ────────────────────────────────────────────────────────
  const mat = new THREE.ShaderMaterial({
    defines,
    uniforms,
    vertexShader:   vertGLSL,
    fragmentShader: fragGLSL,
  })

  mat.name = name
  return mat
}

// ─────────────────────────────────────────────────────────────────────────────
// updateToonMaterial
//
// Updates uniforms on an existing material without rebuilding it.
// Use this for live tweaks (e.g. a debug UI slider).
// If capabilities change (e.g. colorMap added/removed), rebuild instead.
// ─────────────────────────────────────────────────────────────────────────────

export function updateToonUniforms(
  mat: THREE.ShaderMaterial,
  patch: Partial<Pick<ToonCapabilities, 'steps' | 'yMin' | 'yMax'>>,
): void {
  if (patch.steps !== undefined) mat.uniforms.uSteps.value = patch.steps
  if (patch.yMin  !== undefined) mat.uniforms.uYMin.value  = patch.yMin
  if (patch.yMax  !== undefined) mat.uniforms.uYMax.value  = patch.yMax
}
