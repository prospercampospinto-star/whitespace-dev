import * as THREE from 'three'

/**
 * A 5-step toon gradient texture.
 * Adjust the stops to taste — fewer = more graphic, more = smoother.
 */
export function createToonGradient(steps = 5): THREE.DataTexture {
  const colors = new Uint8Array(steps * 4)

  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1)
    // Dark shadow → bright highlight
    const v = Math.round(60 + t * 195) // 60–255
    colors[i * 4 + 0] = v
    colors[i * 4 + 1] = v
    colors[i * 4 + 2] = v
    colors[i * 4 + 3] = 255
  }

  const texture = new THREE.DataTexture(colors, steps, 1)
  texture.needsUpdate = true
  // Nearest filtering = hard toon steps
  texture.minFilter = THREE.NearestFilter
  texture.magFilter = THREE.NearestFilter
  return texture
}

/**
 * Palette for the marble run scene.
 * Add/rename entries to match your Blender material names.
 */
export const TOON_PALETTE: Record<string, number> = {
  // Tracks / structure
  TrackWood:   0xc8a96e,
  TrackMetal:  0x8ab4c9,
  Support:     0x6b5c4e,
  Base:        0x4a7c59,

  // Marbles
  MarbleRed:   0xe05a4b,
  MarbleBlue:  0x4b7be0,
  MarbleGreen: 0x4bc46b,
  MarbleGold:  0xf0c040,

  // Fallback
  Default:     0x2200EE,
}

/**
 * Traverses a loaded GLTF scene and replaces every mesh's material
 * with a MeshToonMaterial using the palette above.
 */
export function applyToonMaterials(
  scene: THREE.Object3D,
  gradientMap: THREE.DataTexture,
): void {
  scene.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return

    const originalMat = node.material as THREE.MeshStandardMaterial
    const matName = originalMat?.name ?? 'Default'

    // Match palette by material name (falls back to Default)
    const color = TOON_PALETTE[matName] ?? TOON_PALETTE.Default

    node.material = new THREE.MeshToonMaterial({
      color,
      gradientMap,
    })

    node.castShadow = true
    node.receiveShadow = true
  })
}