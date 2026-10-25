import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

const InnerEdgeShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    tNormal: { value: null as THREE.Texture | null },
    tDepth: { value: null as THREE.Texture | null },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uEdgeColor: { value: new THREE.Color(0x1a1225) },
    uNormalThreshold: { value: 0.3 },
    uDepthThreshold: { value: 0.02 },
    uLineWidth: { value: 1 },
    uOpacity: { value: 0.82 },
    uNoise: { value: 0.04 },
  },
  vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform sampler2D tNormal;
    uniform sampler2D tDepth;
    uniform vec2 uResolution;
    uniform vec3 uEdgeColor;
    uniform float uNormalThreshold;
    uniform float uDepthThreshold;
    uniform float uLineWidth;
    uniform float uOpacity;
    uniform float uNoise;

    varying vec2 vUv;

    float hash(vec2 point) {
      return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453);
    }

    void main() {
      vec2 texel = uLineWidth / uResolution;
      float noise = (hash(vUv * uResolution) - 0.5) * uNoise;
      vec2 jitter = texel * noise;
      vec3 centerNormal = texture2D(tNormal, vUv).rgb * 2.0 - 1.0;
      float centerDepth = texture2D(tDepth, vUv).r;
      float normalDifference = 0.0;
      float depthDifference = 0.0;

      for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
          if (x == 0 && y == 0) continue;

          vec2 offset = vec2(float(x), float(y)) * texel + jitter;
          vec2 sampleUv = clamp(vUv + offset, vec2(0.0), vec2(1.0));
          vec3 sampleNormal = texture2D(tNormal, sampleUv).rgb * 2.0 - 1.0;
          float sampleDepth = texture2D(tDepth, sampleUv).r;

          normalDifference += 1.0 - max(0.0, dot(centerNormal, sampleNormal));
          if (centerDepth < 0.999 && sampleDepth < 0.999) {
            depthDifference = max(depthDifference, abs(centerDepth - sampleDepth));
          }
        }
      }

      float normalEdge = smoothstep(uNormalThreshold, uNormalThreshold * 2.0, normalDifference / 8.0);
      float depthEdge = smoothstep(uDepthThreshold, uDepthThreshold * 2.0, depthDifference);
      float stroke = max(normalEdge, depthEdge) * step(centerDepth, 0.999);
      stroke = smoothstep(0.15, 0.85, stroke);

      vec4 color = texture2D(tDiffuse, vUv);
      color.rgb = mix(color.rgb, uEdgeColor, stroke * uOpacity);
      gl_FragColor = color;
    }
  `,
}

interface EffectsProps {
  edgeColor?: number
  outlineStrength?: number
  outlineThickness?: number
  normalThreshold?: number
  depthThreshold?: number
  innerLineWidth?: number
  innerOpacity?: number
  brushNoise?: number
}

export function ToonOutlineEffect({
  edgeColor = 0x1a1225,
  outlineStrength = 2.5,
  outlineThickness = 1,
  normalThreshold = 0.3,
  depthThreshold = 0.02,
  innerLineWidth = 1.2,
  innerOpacity = 0.82,
  brushNoise = 0.04,
}: EffectsProps) {
  const { gl, scene, camera, size } = useThree()
  const composerRef = useRef<EffectComposer | null>(null)
  const normalComposerRef = useRef<EffectComposer | null>(null)
  const outlinePassRef = useRef<OutlinePass | null>(null)
  const edgePassRef = useRef<ShaderPass | null>(null)

  useEffect(() => {
    const normalTarget = new THREE.WebGLRenderTarget(
      size.width * gl.getPixelRatio(),
      size.height * gl.getPixelRatio(),
      { depthBuffer: true },
    )
    normalTarget.depthTexture = new THREE.DepthTexture(
      normalTarget.width,
      normalTarget.height,
      THREE.UnsignedIntType,
    )
    const normalMaterial = new THREE.MeshNormalMaterial()
    normalMaterial.toneMapped = false

    const normalComposer = new EffectComposer(gl, normalTarget)
    normalComposer.renderToScreen = false
    normalComposer.addPass(new RenderPass(scene, camera, normalMaterial))
    normalComposerRef.current = normalComposer

    const composer = new EffectComposer(gl)
    composer.addPass(new RenderPass(scene, camera))

    const outlinePass = new OutlinePass(new THREE.Vector2(size.width, size.height), scene, camera)
    outlinePass.edgeStrength = outlineStrength
    outlinePass.edgeThickness = outlineThickness
    outlinePass.edgeGlow = 0
    outlinePass.visibleEdgeColor.set(edgeColor)
    outlinePass.hiddenEdgeColor.set(edgeColor)
    composer.addPass(outlinePass)
    outlinePassRef.current = outlinePass

    const edgePass = new ShaderPass(InnerEdgeShader)
    edgePass.uniforms.tNormal.value = normalTarget.texture
    edgePass.uniforms.tDepth.value = normalTarget.depthTexture
    edgePass.uniforms.uResolution.value.set(
      size.width * gl.getPixelRatio(),
      size.height * gl.getPixelRatio(),
    )
    edgePass.uniforms.uEdgeColor.value.set(edgeColor)
    edgePass.uniforms.uNormalThreshold.value = normalThreshold
    edgePass.uniforms.uDepthThreshold.value = depthThreshold
    edgePass.uniforms.uLineWidth.value = innerLineWidth
    edgePass.uniforms.uOpacity.value = innerOpacity
    edgePass.uniforms.uNoise.value = brushNoise
    composer.addPass(edgePass)
    edgePassRef.current = edgePass
    composer.addPass(new OutputPass())
    composerRef.current = composer

    return () => {
      composer.dispose()
      normalComposer.dispose()
      normalMaterial.dispose()
      composerRef.current = null
      normalComposerRef.current = null
      outlinePassRef.current = null
      edgePassRef.current = null
    }
  }, [
    gl,
    scene,
    camera,
    size.width,
    size.height,
    edgeColor,
    outlineStrength,
    outlineThickness,
    normalThreshold,
    depthThreshold,
    innerLineWidth,
    innerOpacity,
    brushNoise,
  ])

  useFrame(() => {
    const meshes: THREE.Mesh[] = []
    scene.traverse((node) => {
      if (node instanceof THREE.Mesh) meshes.push(node)
    })
    if (outlinePassRef.current) outlinePassRef.current.selectedObjects = meshes
    normalComposerRef.current?.render()
    composerRef.current?.render()
  }, 1)

  return null
}
