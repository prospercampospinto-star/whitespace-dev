import { useRef, useState } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useWorldStore } from '@/core/useWorldStore'

// ─────────────────────────────────────────────────────────────────────────────
// SceneLabel
//
// HTML label anchored to a world position. Scales with distance,
// hides when occluded by geometry.
// ─────────────────────────────────────────────────────────────────────────────

interface SceneLabelProps {
  position:  [number, number, number]
  title:     string
  subtitle?: string
  onClick?:  () => void
}

export function SceneLabel({ position, title, subtitle, onClick }: SceneLabelProps) {
  return (
    <Html
      position={position}
      center
      occlude
      distanceFactor={8}
    >
      {/* Style this div freely with CSS — it's real HTML */}
      <div
        onClick={onClick}
        style={{
          cursor:      onClick ? 'pointer' : 'default',
          textAlign:   'center',
          userSelect:  'none',
          pointerEvents: onClick ? 'auto' : 'none',
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, opacity: 0.7 }}>{subtitle}</div>}
      </div>
    </Html>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SceneOutline
//
// WebGL bounding-box outline around a scene. Pulses when active.
// Stays in WebGL (not HTML) because it's geometry tied to world space.
// ─────────────────────────────────────────────────────────────────────────────

interface SceneOutlineProps {
  bounds:  THREE.Box3
  color?:  string
  active?: boolean
}

export function SceneOutline({ bounds, color = '#ffffff', active = false }: SceneOutlineProps) {
  const matRef = useRef<THREE.LineBasicMaterial>(null)

  useFrame(({ clock }) => {
    if (!matRef.current) return
    matRef.current.opacity = active
      ? 0.4 + Math.sin(clock.elapsedTime * 3) * 0.25
      : 0.12
  })

  const size   = bounds.getSize(new THREE.Vector3())
  const center = bounds.getCenter(new THREE.Vector3())

  return (
    <lineSegments position={center}>
      <edgesGeometry args={[new THREE.BoxGeometry(size.x, size.y, size.z)]} />
      <lineBasicMaterial ref={matRef} color={color} transparent opacity={0.12} />
    </lineSegments>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PointerArrow
//
// HTML arrow anchored to character head, rotates to point toward a target.
// Only visible when the character is farther than `visibleBeyond` units away.
// ─────────────────────────────────────────────────────────────────────────────

interface PointerArrowProps {
  targetPosition: [number, number, number]
  label:          string
  visibleBeyond?: number
}

export function PointerArrow({ targetPosition, label, visibleBeyond = 8 }: PointerArrowProps) {
  const charPos = useWorldStore(s => s.characterPosition)
  const [angle, setAngle]     = useState(0)
  const [visible, setVisible] = useState(false)
  const target = new THREE.Vector3(...targetPosition)

  useFrame(({ camera }) => {
    const toTarget = target.clone().sub(charPos)
    const dist     = new THREE.Vector2(toTarget.x, toTarget.z).length()
    setVisible(dist > visibleBeyond)

    const camFwd   = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
    const camFwd2D = new THREE.Vector2(camFwd.x, camFwd.z).normalize()
    const dir2D    = new THREE.Vector2(toTarget.x, toTarget.z).normalize()

    setAngle(Math.atan2(
      camFwd2D.x * dir2D.y - camFwd2D.y * dir2D.x,
      camFwd2D.dot(dir2D),
    ))
  })

  if (!visible) return null

  return (
    <Html
      position={[charPos.x, charPos.y + 2.2, charPos.z]}
      center
    >
      <div style={{ transform: `rotate(${angle}rad)`, pointerEvents: 'none' }}>
        <span style={{ fontSize: 20 }}>→</span>
        <span style={{ fontSize: 11, marginLeft: 4 }}>{label}</span>
      </div>
    </Html>
  )
}
