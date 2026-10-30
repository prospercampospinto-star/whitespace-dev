import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useWorldStore } from '@/core/useWorldStore'

// ─────────────────────────────────────────────────────────────────────────────
// CharacterController
//
// Stub — replace the mesh and movement logic with your character setup.
// Writes character position to world store each frame so SceneManager
// and world-space UI can react to proximity.
// ─────────────────────────────────────────────────────────────────────────────

export function CharacterController() {
  const ref = useRef<THREE.Mesh>(null)
  const setPos = useWorldStore(s => s.setCharacterPosition)

  useFrame(() => {
    if (!ref.current) return
    // Write world position to store every frame
    // SceneManager and PointerArrow read from here
    setPos(ref.current.position)
  })

  return (
    // Replace with <primitive object={characterScene} /> once you have the GLB
    <mesh ref={ref} position={[0, 0, 0]}>
      <capsuleGeometry args={[0.3, 1, 4, 8]} />
      <meshStandardMaterial color="#888" />
    </mesh>
  )
}
