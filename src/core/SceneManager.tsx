import { Suspense, lazy, useMemo } from 'react'
import * as THREE from 'three'
import { SCENES } from '@/scenes'
import { useWorldStore } from './useWorldStore'

// ─────────────────────────────────────────────────────────────────────────────
// SceneManager
//
// Reads character position from world store.
// Lazy-loads each scene when the character is within 3× its trigger radius.
// Unloads (unmounts) scenes beyond that — Suspense handles the transition.
// ─────────────────────────────────────────────────────────────────────────────

export function SceneManager() {
  const charPos = useWorldStore(s => s.characterPosition)

  // Lazy-import each scene component once — stable across re-renders
  const lazyComponents = useMemo(
    () => SCENES.map(config => lazy(config.component)),
    [],
  )

  return (
    <>
      {SCENES.map((config, i) => {
        const sceneOrigin = new THREE.Vector3(...config.position)
        const dist        = charPos.distanceTo(sceneOrigin)
        const loadRadius  = config.triggerRadius * 3

        if (dist > loadRadius) return null

        const SceneComponent = lazyComponents[i]

        return (
          <Suspense key={config.id} fallback={null}>
            <SceneComponent
              position={config.position}
              toon={config.toon}
            />
          </Suspense>
        )
      })}
    </>
  )
}
