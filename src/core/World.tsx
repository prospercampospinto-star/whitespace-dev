import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { SceneManager }      from './SceneManager'
import { Effects }           from '@/effects/Effects'
import { CharacterController } from '@/character/CharacterController'

// ─────────────────────────────────────────────────────────────────────────────
// World
//
// The single Canvas. Everything 3D (scenes, character, effects, world-space UI)
// lives inside it. The Canvas is full-screen — it IS the page.
//
// World-space UI (labels, outlines, arrows) lives inside the Canvas via
// drei's <Html> component, which projects 3D positions to screen space.
// It's still real HTML/CSS, just anchored to world coordinates.
// ─────────────────────────────────────────────────────────────────────────────

export function World() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 5, 10], fov: 45, near: 0.1, far: 200 }}
      gl={{ antialias: false }}
      style={{ width: '100vw', height: '100vh' }}
      onCreated={({ gl }) => {
        gl.toneMapping = 0 // NoToneMapping — keeps toon colors saturated
      }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[8, 12, 6]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* All scenes, lazy-loaded by proximity */}
      <SceneManager />

      {/* Character — reads/writes world store */}
      <CharacterController />

      {/* Post-processing — single pipeline for the whole world */}
      <Effects
        edgeColor={0x1a1225}
        outlineStrength={2.5}
        outlineThickness={1.0}
        normalThreshold={0.25}
        depthThreshold={0.015}
        lineWidth={1.2}
        opacity={0.82}
        noise={0.04}
      />

      <OrbitControls />
    </Canvas>
  )
}
