import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────────────────
// InnerEdgePass shader definition
//
// Reads the normal + depth buffer and draws inner geometry creases
// as brush-stroke-style lines. Approximates Blender Grease Pencil / Freestyle
// inner edge rendering in real time.
//
// This is a plain shader object — no React, no Three.js classes.
// Consumed by Effects.tsx via ShaderPass.
// ─────────────────────────────────────────────────────────────────────────────

export interface InnerEdgeConfig {
  edgeColor?:       number  // hex, default 0x1a1225
  normalThreshold?: number  // lower = more edges from normals, default 0.25
  depthThreshold?:  number  // lower = more edges from depth,   default 0.015
  lineWidth?:       number  // kernel radius in pixels,          default 1.2
  opacity?:         number  // stroke opacity,                   default 0.82
  noise?:           number  // brush irregularity 0–0.1,         default 0.04
}

export const InnerEdgeShader = {
  uniforms: {
    tDiffuse:          { value: null as THREE.Texture | null },
    tNormal:           { value: null as THREE.Texture | null },
    tDepth:            { value: null as THREE.Texture | null },
    uResolution:       { value: new THREE.Vector2(1, 1) },
    uEdgeColor:        { value: new THREE.Color(0x1a1225) },
    uNormalThreshold:  { value: 0.25 },
    uDepthThreshold:   { value: 0.015 },
    uLineWidth:        { value: 1.2 },
    uOpacity:          { value: 0.82 },
    uNoise:            { value: 0.04 },
  },

  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform sampler2D tNormal;
    uniform sampler2D tDepth;
    uniform vec2      uResolution;
    uniform vec3      uEdgeColor;
    uniform float     uNormalThreshold;
    uniform float     uDepthThreshold;
    uniform float     uLineWidth;
    uniform float     uOpacity;
    uniform float     uNoise;

    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    void main() {
      vec2  texel  = uLineWidth / uResolution;
      float noise  = (hash(vUv * uResolution) - 0.5) * uNoise;
      vec2  jitter = texel * noise;

      vec3  cn = texture2D(tNormal, vUv).rgb * 2.0 - 1.0;
      float cd = texture2D(tDepth,  vUv).r;

      float normalDiff = 0.0;
      float depthDiff  = 0.0;

      for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
          if (x == 0 && y == 0) continue;
          vec2  uv  = clamp(vUv + vec2(float(x), float(y)) * texel + jitter, 0.0, 1.0);
          vec3  n   = texture2D(tNormal, uv).rgb * 2.0 - 1.0;
          float d   = texture2D(tDepth,  uv).r;
          normalDiff += 1.0 - max(0.0, dot(cn, n));
          if (cd < 0.999 && d < 0.999)
            depthDiff = max(depthDiff, abs(cd - d));
        }
      }

      float ne     = smoothstep(uNormalThreshold, uNormalThreshold * 2.0, normalDiff / 8.0);
      float de     = smoothstep(uDepthThreshold,  uDepthThreshold  * 2.0, depthDiff);
      float stroke = smoothstep(0.15, 0.85, max(ne, de)) * step(cd, 0.999);

      vec4 color  = texture2D(tDiffuse, vUv);
      color.rgb   = mix(color.rgb, uEdgeColor, stroke * uOpacity);
      gl_FragColor = color;
    }
  `,
}

// ─────────────────────────────────────────────────────────────────────────────
// applyInnerEdgeConfig
//
// Updates the uniforms on an already-created ShaderPass without rebuilding.
// ─────────────────────────────────────────────────────────────────────────────

export function applyInnerEdgeConfig(
  uniforms: typeof InnerEdgeShader.uniforms,
  config:   InnerEdgeConfig,
): void {
  if (config.edgeColor       !== undefined) uniforms.uEdgeColor.value.set(config.edgeColor)
  if (config.normalThreshold !== undefined) uniforms.uNormalThreshold.value = config.normalThreshold
  if (config.depthThreshold  !== undefined) uniforms.uDepthThreshold.value  = config.depthThreshold
  if (config.lineWidth       !== undefined) uniforms.uLineWidth.value        = config.lineWidth
  if (config.opacity         !== undefined) uniforms.uOpacity.value          = config.opacity
  if (config.noise           !== undefined) uniforms.uNoise.value            = config.noise
}
