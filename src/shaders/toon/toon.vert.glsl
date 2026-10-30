// ─────────────────────────────────────────────────────────────────────────────
// Toon vertex shader
//
// Outputs:
//   vWorldPosition  — for height-mode gradient
//   vViewNormal     — for diffuse + normal-mode gradient
//   vUv             — for UV color maps (only used when USE_COLOR_MAP defined)
//   vScreenUv       — for screen-space overlays (always computed, cheap)
// ─────────────────────────────────────────────────────────────────────────────

varying vec3 vWorldPosition;
varying vec3 vViewNormal;
varying vec2 vUv;
varying vec2 vScreenUv;

void main() {
  vec4 worldPos  = modelMatrix * vec4(position, 1.0);
  vec4 clipPos   = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

  vWorldPosition = worldPos.xyz;
  vViewNormal    = normalize(normalMatrix * normal);
  vUv            = uv;

  // Screen UV: convert clip space [-1,1] → [0,1]
  vScreenUv = (clipPos.xy / clipPos.w) * 0.5 + 0.5;

  gl_Position = clipPos;
}
