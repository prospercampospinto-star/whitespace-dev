import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { MarbleRunScene, ShadowCatcher } from './components/MarbleRun'
import { ToonOutlineEffect } from './components/Effects'

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#e8e4da' }}>
      <Canvas
        shadows
        camera={{ position: [6, 5, 8], fov: 45, near: 0.1, far: 100 }}
        gl={{ antialias: false }} // AA off — edge passes own this
        onCreated={({ gl }) => {
          gl.toneMapping = 0 // NoToneMapping — keeps gradient colors saturated
        }}
      >
        {/* ── Lighting ─────────────────────────────────────────────────── */}
        {/*
          The gradient shader uses its own diffuse term, so lights here
          mainly drive shadow casting. Keep it simple.
        */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[8, 12, 6]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-near={0.5}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />

        {/* ── Scene ────────────────────────────────────────────────────── */}
        <Suspense fallback={null}>
          <MarbleRunScene
            toonSteps={4}       // 2 = two-tone, 4 = classic, 6 = smooth
            gradientMode="height" // try 'normal' for a more painterly look
          />
          <ShadowCatcher />
        </Suspense>

        {/* ── Post-processing ───────────────────────────────────────────── */}
        {/*
          outlineStrength/Thickness  → outer silhouette weight
          normalThreshold            → inner edge sensitivity from normals
                                       (0.15 = many creases, 0.5 = only sharp ones)
          depthThreshold             → inner edge sensitivity from depth
          innerLineWidth             → pixel radius of edge kernel
          brushNoise                 → 0.0 = clean ink, 0.08 = loose brush
        */}
        <ToonOutlineEffect
          edgeColor={0x1a1225}
          outlineStrength={2.5}
          outlineThickness={1.0}
          normalThreshold={0.25}
          depthThreshold={0.015}
          innerLineWidth={1.2}
          innerOpacity={0.8}
          brushNoise={0.04}
        />

        {/* ── Camera ───────────────────────────────────────────────────── */}
        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2.1}
          target={[0, 1, 0]}
        />
      </Canvas>
    </div>
  )
}