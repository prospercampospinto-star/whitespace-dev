/**
 * Effects.tsx
 *
 * Applies a toon outline (freestyle-style edges) using postprocessing.
 * Uses the OutlineEffect from the `postprocessing` library.
 *
 * The outline works by detecting depth/normal discontinuities —
 * same visual idea as Blender's Freestyle renderer.
 */

import { useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
// NOTE: three/examples ships with Three.js — no extra install needed.
// If you want more advanced effects, swap to the `postprocessing` npm package.
import { useRef } from 'react'
import * as THREE from 'three'

interface OutlineConfig {
  /** Edge color — default is near-black for ink feel */
  edgeColor?: number
  /** 0–1, how thick the outline is */
  strength?: number
  /** Glow thickness in pixels */
  thickness?: number
}

export function ToonOutlineEffect({
  edgeColor = 0x1a1a2e,
  strength = 3,
  thickness = 1.5,
}: OutlineConfig) {
  const { gl, scene, camera, size } = useThree()
  const composerRef = useRef<EffectComposer | null>(null)

  useEffect(() => {
    const composer = new EffectComposer(gl)
    composerRef.current = composer

    // 1. Render the scene normally
    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    // 2. Outline pass — finds all meshes in the scene
    const outlinePass = new OutlinePass(
      new THREE.Vector2(size.width, size.height),
      scene,
      camera,
    )

    // Outline visual settings
    outlinePass.edgeStrength = strength
    outlinePass.edgeThickness = thickness
    outlinePass.edgeGlow = 0
    outlinePass.visibleEdgeColor.set(edgeColor)
    outlinePass.hiddenEdgeColor.set(edgeColor) // Show edges behind geometry too
    composer.addPass(outlinePass)

    // 3. Gamma correct the output
    composer.addPass(new OutputPass())

    return () => {
      composer.dispose()
    }
  }, [gl, scene, camera, size, edgeColor, strength, thickness])

  // Resize composer when canvas size changes
  useEffect(() => {
    composerRef.current?.setSize(size.width, size.height)
  }, [size])

  // Replace the default render loop
  useFrame(() => {
    const meshes: THREE.Mesh[] = []
    scene.traverse((node) => {
      if (node instanceof THREE.Mesh) meshes.push(node)
    })
    const outlinePass = composerRef.current?.passes[1] as OutlinePass | undefined
    if (outlinePass) outlinePass.selectedObjects = meshes
    composerRef.current?.render()
  }, 1) // priority 1 = runs after default render

  return null
}