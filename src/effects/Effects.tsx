import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { OutlinePass }   from 'three/examples/jsm/postprocessing/OutlinePass.js'
import { OutputPass }    from 'three/examples/jsm/postprocessing/OutputPass.js'
import { RenderPass }    from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass }    from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { InnerEdgeShader, applyInnerEdgeConfig, type InnerEdgeConfig } from './passes/InnerEdgePass'

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface EffectsProps extends InnerEdgeConfig {
  edgeColor?:        number
  outlineStrength?:  number
  outlineThickness?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Effects
//
// Composers are created ONCE and never rebuilt on prop changes.
// Prop changes update uniforms in a separate effect — no GPU stall.
// ─────────────────────────────────────────────────────────────────────────────

export function Effects({
  edgeColor        = 0x1a1225,
  outlineStrength  = 2.5,
  outlineThickness = 1.0,
  normalThreshold  = 0.25,
  depthThreshold   = 0.015,
  lineWidth        = 1.2,
  opacity          = 0.82,
  noise            = 0.04,
}: EffectsProps) {
  const { gl, scene, camera, size } = useThree()

  const composerRef      = useRef<EffectComposer | null>(null)
  const normalComposerRef = useRef<EffectComposer | null>(null)
  const normalMatRef     = useRef<THREE.MeshNormalMaterial | null>(null)
  const normalTargetRef  = useRef<THREE.WebGLRenderTarget | null>(null)
  const outlinePassRef   = useRef<OutlinePass | null>(null)
  const edgePassRef      = useRef<ShaderPass | null>(null)

  // ── Build composers once ────────────────────────────────────────────────
  useEffect(() => {
    const w = size.width  * gl.getPixelRatio()
    const h = size.height * gl.getPixelRatio()

    // Normal render target
    const normalTarget = new THREE.WebGLRenderTarget(w, h, { depthBuffer: true })
    normalTarget.depthTexture = new THREE.DepthTexture(w, h, THREE.UnsignedIntType)
    normalTargetRef.current = normalTarget

    const normalMat = new THREE.MeshNormalMaterial()
    normalMat.toneMapped = false
    normalMatRef.current = normalMat

    const normalComposer = new EffectComposer(gl, normalTarget)
    normalComposer.renderToScreen = false
    normalComposer.addPass(new RenderPass(scene, camera, normalMat))
    normalComposerRef.current = normalComposer

    // Main composer
    const composer = new EffectComposer(gl)
    composer.addPass(new RenderPass(scene, camera))

    const outlinePass = new OutlinePass(new THREE.Vector2(size.width, size.height), scene, camera)
    outlinePass.edgeStrength  = outlineStrength
    outlinePass.edgeThickness = outlineThickness
    outlinePass.edgeGlow      = 0
    outlinePass.visibleEdgeColor.set(edgeColor)
    outlinePass.hiddenEdgeColor.set(edgeColor)
    composer.addPass(outlinePass)
    outlinePassRef.current = outlinePass

    const edgePass = new ShaderPass(InnerEdgeShader)
    edgePass.uniforms.tNormal.value = normalTarget.texture
    edgePass.uniforms.tDepth.value  = normalTarget.depthTexture
    edgePass.uniforms.uResolution.value.set(w, h)
    applyInnerEdgeConfig(edgePass.uniforms as typeof InnerEdgeShader.uniforms, {
      edgeColor, normalThreshold, depthThreshold, lineWidth, opacity, noise,
    })
    composer.addPass(edgePass)
    edgePassRef.current = edgePass

    composer.addPass(new OutputPass())
    composerRef.current = composer

    return () => {
      composer.dispose()
      normalComposer.dispose()
      normalTarget.dispose()
      normalMat.dispose()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera]) // intentionally stable — resize handled below

  // ── Resize ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const w = size.width  * gl.getPixelRatio()
    const h = size.height * gl.getPixelRatio()
    composerRef.current?.setSize(size.width, size.height)
    normalTargetRef.current?.setSize(w, h)
    edgePassRef.current?.uniforms.uResolution.value.set(w, h)
  }, [size, gl])

  // ── Update uniforms without rebuilding ───────────────────────────────────
  useEffect(() => {
    const ep = edgePassRef.current
    if (!ep) return
    applyInnerEdgeConfig(ep.uniforms as typeof InnerEdgeShader.uniforms, {
      edgeColor, normalThreshold, depthThreshold, lineWidth, opacity, noise,
    })
  }, [edgeColor, normalThreshold, depthThreshold, lineWidth, opacity, noise])

  useEffect(() => {
    const op = outlinePassRef.current
    if (!op) return
    op.edgeStrength  = outlineStrength
    op.edgeThickness = outlineThickness
    op.visibleEdgeColor.set(edgeColor)
    op.hiddenEdgeColor.set(edgeColor)
  }, [outlineStrength, outlineThickness, edgeColor])

  // ── Render loop ─────────────────────────────────────────────────────────
  useFrame(() => {
    // Collect meshes for outline pass each frame (handles dynamic scenes)
    const meshes: THREE.Mesh[] = []
    scene.traverse(n => { if (n instanceof THREE.Mesh) meshes.push(n) })
    if (outlinePassRef.current) outlinePassRef.current.selectedObjects = meshes

    // Render normals first, then main pass
    scene.overrideMaterial = normalMatRef.current
    normalComposerRef.current?.render()
    scene.overrideMaterial = null
    composerRef.current?.render()
  }, 1)

  return null
}
