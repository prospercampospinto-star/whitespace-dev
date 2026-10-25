import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { MarbleRunScene, ShadowCatcher } from './components/MarbleRun'
import { ToonOutlineEffect } from './components/Effects'

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#f0ece3' }}>
      <Canvas
        shadows
        camera={{ position: [6, 5, 8], fov: 45, near: 0.1, far: 100 }}
        /**
         * gl.toneMapping = NoToneMapping keeps toon colors punchy.
         * Toon shading looks washed out with ACESFilmic.
         */
        gl={{ antialias: false }} // AA off — outline pass handles edge quality
        onCreated={({ gl }) => {
          gl.toneMapping = 0 // THREE.NoToneMapping
          gl.toneMappingExposure = 1
        }}
      >
        {/* ── Lighting ── */}
        {/*
          Toon shading responds to light direction but not intensity gradients.
          A single strong directional light + ambient is all you need.
          Point lights / spotlights work too but aren't as painterly.
        */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[8, 12, 6]}
          intensity={1.8}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-near={0.5}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />

        {/* ── Scene ── */}
        <Suspense fallback={null}>
          <MarbleRunScene />
          <ShadowCatcher />
        </Suspense>

        {/* ── Post-processing: toon outline ── */}
        {/*
          edgeColor: ink/line color
          strength:  how visible the outline is (1–5 is a good range)
          thickness: line weight in pixels
        */}
        <ToonOutlineEffect
          edgeColor={0x1a1225}
          strength={5 }
          thickness={1.2}
        />

        {/* ── Camera controls ── */}
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