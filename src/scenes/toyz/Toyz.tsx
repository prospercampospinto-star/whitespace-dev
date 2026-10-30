import { useEffect, useMemo, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { useWorldStore } from '@/core/useWorldStore'
import { applyToonMaterials } from '@/shaders'
import { SceneLabel, SceneOutline, PointerArrow } from '@/ui/primitives'
import type { SceneProps } from '@/core/SceneManager.types'
import { ToyzConfig } from './Toyz.config'

// ─────────────────────────────────────────────────────────────────────────────
// Preload — starts fetching the GLB before this component mounts.
// Suspense in SceneManager handles the loading state.
// ─────────────────────────────────────────────────────────────────────────────
useGLTF.preload(ToyzConfig.glb)

// ─────────────────────────────────────────────────────────────────────────────
// Toyz scene
// ─────────────────────────────────────────────────────────────────────────────

export default function Toyz({ position, toon }: SceneProps) {
  const { scene, animations } = useGLTF(ToyzConfig.glb)
  const groupRef = useRef<THREE.Group>(null)
  const { actions } = useAnimations(animations, groupRef)

  // ── Auto-scale to fit a 10-unit cube ─────────────────────────────────────
  const transform = useMemo(() => {
    const bbox   = new THREE.Box3().setFromObject(scene)
    const size   = bbox.getSize(new THREE.Vector3())
    const center = bbox.getCenter(new THREE.Vector3())
    const scale  = 10 / Math.max(size.x, size.y, size.z)
    return {
      scale,
      offset: [-center.x * scale, -bbox.min.y * scale, -center.z * scale] as const,
    }
  }, [scene])

  // ── Bounding box in world space (for outline UI) ──────────────────────────
  const worldBounds = useMemo(() => {
    const bbox = new THREE.Box3().setFromObject(scene)
    bbox.min.multiplyScalar(transform.scale)
    bbox.max.multiplyScalar(transform.scale)
    bbox.translate(new THREE.Vector3(...position))
    return bbox
  }, [scene, transform.scale, position])

  // ── Play all animations ───────────────────────────────────────────────────
  useEffect(() => {
    Object.values(actions).forEach(a => a?.reset().play())
  }, [actions])

  // ── Apply toon materials ──────────────────────────────────────────────────
  useEffect(() => {
    applyToonMaterials(scene, toon)
  }, [scene, toon])

  // ── Proximity check (for UI state) ───────────────────────────────────────
  const charPos = useWorldStore(s => s.characterPosition)
  const isNear  = charPos.distanceTo(new THREE.Vector3(...position)) < ToyzConfig.triggerRadius

  // ── Label position — top of bounding box + offset ─────────────────────────
  const labelPos: [number, number, number] = [
    position[0] + (ToyzConfig.ui?.labelOffset?.[0] ?? 0),
    worldBounds.max.y + (ToyzConfig.ui?.labelOffset?.[1] ?? 1),
    position[2] + (ToyzConfig.ui?.labelOffset?.[2] ?? 0),
  ]

  return (
    <group position={position}>

      {/* Scene geometry */}
      <group position={transform.offset} scale={transform.scale} ref={groupRef}>
        <primitive object={scene} />
      </group>

      {/* World-space UI */}
      {ToyzConfig.ui?.showLabel && (
        <SceneLabel
          position={labelPos}
          title={ToyzConfig.label}
          subtitle={isNear ? 'Press E to interact' : undefined}
        />
      )}

      <SceneOutline
        bounds={worldBounds}
        color={ToyzConfig.ui?.outlineColor}
        active={isNear}
      />

      {ToyzConfig.ui?.showArrow && (
        <PointerArrow
          targetPosition={position}
          label={ToyzConfig.label}
          visibleBeyond={ToyzConfig.triggerRadius * 2}
        />
      )}

    </group>
  )
}
