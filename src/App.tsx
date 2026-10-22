import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef } from 'react'
import type { Mesh } from 'three'
import MarbleTest from './exhibits/MarbleTest'

function SpinningBox() {
  const ref = useRef<Mesh>(null)
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt
  })
  return (
    <mesh ref={ref}>
      <boxGeometry />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  )
}

export default function App() {
  return (
    <Canvas camera={{ position: [3, 3, 3] }}>
      <color attach="background" args={['#ffffff']} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} />
      <MarbleTest />
      <OrbitControls />
    </Canvas>
  )
}