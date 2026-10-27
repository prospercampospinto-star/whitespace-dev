import * as THREE from 'three'

export interface GradientEntry {
  shadow: number
  highlight: number
}

export const GRADIENT_PALETTE: Record<string, GradientEntry> = {
  TrackWood: { shadow: 0x7a5230, highlight: 0xe8c07a },
  TrackMetal: { shadow: 0x3a5f75, highlight: 0xb8dff0 },
  Support: { shadow: 0x3b2e22, highlight: 0x9b7d62 },
  Base: { shadow: 0x1e4a30, highlight: 0x7acf96 },
  MarbleRed: { shadow: 0x8b1a10, highlight: 0xff8a7a },
  MarbleBlue: { shadow: 0x1a2e8b, highlight: 0x7aaeff },
  MarbleGreen: { shadow: 0x1a5c30, highlight: 0x7affaa },
  MarbleGold: { shadow: 0x8b6a00, highlight: 0xffe87a },
  Wood: { shadow: 0x7a5230, highlight: 0xe8c07a },
  Default: { shadow: 0x555566, highlight: 0xeeeeff },
}

export type GradientMode = 'height' | 'normal'

export function createGradientMaterial(
  entry: GradientEntry,
  options: {
    steps: number
    mode: GradientMode
    yMin: number
    yMax: number
  },
  materialName: string,
): THREE.ShaderMaterial {
  const steps = Math.max(2, Math.floor(options.steps))
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uShadow: { value: new THREE.Color(entry.shadow) },
      uHighlight: { value: new THREE.Color(entry.highlight) },
      uSteps: { value: steps },
      uMode: { value: options.mode === 'height' ? 0 : 1 },
      uYMin: { value: options.yMin },
      uYMax: { value: options.yMax },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      varying vec3 vViewNormal;

      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        vViewNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uShadow;
      uniform vec3 uHighlight;
      uniform float uSteps;
      uniform int uMode;
      uniform float uYMin;
      uniform float uYMax;

      varying vec3 vWorldPosition;
      varying vec3 vViewNormal;

      void main() {
        float diffuse = max(0.0, dot(normalize(vViewNormal), normalize(vec3(0.4, 0.8, 0.5))));
        float gradient = uMode == 0
          ? clamp((vWorldPosition.y - uYMin) / max(uYMax - uYMin, 0.0001), 0.0, 1.0) * 0.6 + diffuse * 0.4
          : max(0.0, dot(normalize(vViewNormal), vec3(0.0, 0.0, 1.0)));
        float steps = max(uSteps - 1.0, 1.0);
        float toonLevel = floor(clamp(gradient, 0.0, 1.0) * steps + 0.5) / steps;
        gl_FragColor = vec4(mix(uShadow, uHighlight, toonLevel), 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  })
  material.name = materialName
  return material
}

export function applyGradientMaterials(
  scene: THREE.Object3D,
  options: {
    steps?: number
    mode?: GradientMode
    yMin?: number
    yMax?: number
  } = {},
): void {
  scene.updateMatrixWorld(true)
  const bounds = new THREE.Box3().setFromObject(scene)
  const yMin = options.yMin ?? bounds.min.y
  const yMax = options.yMax ?? bounds.max.y
  const materialOptions = {
    steps: options.steps ?? 4,
    mode: options.mode ?? 'height',
    yMin,
    yMax,
  }

  scene.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return

    const currentMaterials = Array.isArray(node.material) ? node.material : [node.material]
    const gradientMaterials = currentMaterials.map((currentMaterial) => {
      const name = currentMaterial.name || 'Default'
      const entry = GRADIENT_PALETTE[name] ?? GRADIENT_PALETTE.Default
      const gradientMaterial = createGradientMaterial(entry, materialOptions, name)
      currentMaterial.dispose()
      return gradientMaterial
    })
    node.material = Array.isArray(node.material) ? gradientMaterials : gradientMaterials[0]
    node.castShadow = true
    node.receiveShadow = true
  })
}
