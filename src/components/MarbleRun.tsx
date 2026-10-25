import { useEffect, useMemo, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { applyGradientMaterials } from '../utils/ToonMaterial'
import type { GradientMode } from '../utils/ToonMaterial'

useGLTF.preload('/models/marble-run.glb')

interface MarbleRunSceneProps {
  /** Number of discrete toon gradient steps */
  toonSteps?: number
  /** 'height' = Y-based gradient, 'normal' = facing-camera gradient */
  gradientMode?: GradientMode
}

export function MarbleRunScene({
  toonSteps    = 4,
  gradientMode = 'height',
}: MarbleRunSceneProps) {
  const { scene, animations } = useGLTF('/models/marble-run.glb')
  const groupRef = useRef<THREE.Group>(null)
  const { actions } = useAnimations(animations, groupRef)
  const modelTransform = useMemo(() => {
    const bounds = new THREE.Box3().setFromObject(scene)
    const center = bounds.getCenter(new THREE.Vector3())
    const dimensions = bounds.getSize(new THREE.Vector3())
    const scale = 10 / Math.max(dimensions.x, dimensions.y, dimensions.z)

    return {
      position: [-center.x * scale, -bounds.min.y * scale, -center.z * scale] as const,
      scale,
    }
  }, [scene])

  // Play all animations on mount
  useEffect(() => {
    Object.values(actions).forEach((action) => action?.reset().play())
  }, [actions])

  // Apply gradient materials — re-runs if toon settings change
  useEffect(() => {
    applyGradientMaterials(scene, { steps: toonSteps, mode: gradientMode })
  }, [scene, toonSteps, gradientMode])

  return (
    <group ref={groupRef}>
      <group position={modelTransform.position} scale={modelTransform.scale}>
        <primitive object={scene} />
      </group>
    </group>
  )
}

export function ShadowCatcher() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <shadowMaterial opacity={0.12} />
    </mesh>
  )
}