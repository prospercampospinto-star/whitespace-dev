import { useEffect, useMemo, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { applyToonMaterials, createToonGradient } from '../utils/ToonMaterial'

const MODEL_URL = '/models/marble-run.glb'

// Shared gradient — created once, reused across    all meshes
const gradientMap = createToonGradient(5)

useGLTF.preload(MODEL_URL)

export function MarbleRunScene() {
  const { scene, animations } = useGLTF(MODEL_URL)
  const groupRef = useRef<THREE.Group>(null)
  const { actions } = useAnimations(animations, groupRef)
  const modelTransform = useMemo(() => {
    const bounds = new THREE.Box3().setFromObject(scene)
    const center = bounds.getCenter(new THREE.Vector3())
    const size = bounds.getSize(new THREE.Vector3())
    const scale = 10 / Math.max(size.x, size.y, size.z)

    return {
      position: [-center.x * scale, -bounds.min.y * scale, -center.z * scale] as const,
      scale,
    }
  }, [scene])

  // Play all animations on mount
  useEffect(() => {
    Object.values(actions).forEach((action) => {
      action?.reset().play()
    })
  }, [actions])

  // Apply toon materials once the scene is loaded
  useEffect(() => {
    applyToonMaterials(scene, gradientMap)
  }, [scene])

  return (
    <group ref={groupRef}>
      <group position={modelTransform.position} scale={modelTransform.scale}>
        <primitive object={scene} />
      </group>
    </group>
  )
}

/**
 * Invisible plane that catches shadows — gives the scene
 * a subtle grounded feel without a visible floor.
 */
export function ShadowCatcher() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <shadowMaterial opacity={0.15} />
    </mesh>
  )
}