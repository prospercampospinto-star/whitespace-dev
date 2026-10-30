// ─────────────────────────────────────────────────────────────────────────────
// Toon fragment shader — uber-shader with capability flags
//
// Compile-time flags (injected via #define before compilation):
//   USE_COLOR_MAP   — UV-mapped texture blended over gradient
//   USE_OVERLAY     — screen-space texture (paper grain, hatching, etc.)
//   MODE_NORMAL     — gradient from view-normal dot light (vs. height mode)
//
// Adding a new capability: add a #ifdef block here + a uniform above it.
// The flag is only injected when the capability is active, so inactive
// features cost zero GPU time.
// ─────────────────────────────────────────────────────────────────────────────

// ── Core uniforms (always present) ───────────────────────────────────────────
uniform vec3  uShadow;
uniform vec3  uHighlight;
uniform float uSteps;
uniform float uYMin;
uniform float uYMax;
uniform vec3  uLightDir;    // world-space light direction, normalised

// ── Optional uniforms (present only when capability is active) ────────────────
#ifdef USE_COLOR_MAP
  uniform sampler2D uColorMap;
  uniform float     uColorMapBlend;
#endif

#ifdef USE_OVERLAY
  uniform sampler2D uOverlayMap;
  uniform float     uOverlayBlend;
  uniform float     uOverlayScale;
#endif

// ── Varyings ──────────────────────────────────────────────────────────────────
varying vec3 vWorldPosition;
varying vec3 vViewNormal;
varying vec2 vUv;
varying vec2 vScreenUv;

// ── Helpers ───────────────────────────────────────────────────────────────────

// Snap a 0–1 value to N discrete toon steps
float quantize(float v, float steps) {
  return floor(clamp(v, 0.0, 1.0) * steps + 0.5) / max(steps - 1.0, 1.0);
}

void main() {
  // ── 1. Compute gradient factor t ─────────────────────────────────────────
  float diffuse = max(0.0, dot(normalize(vViewNormal), normalize(uLightDir)));

  #ifdef MODE_NORMAL
    // Normal mode: gradient purely from diffuse (light response)
    float t = diffuse;
  #else
    // Height mode: world Y position, blended with diffuse
    float height = clamp(
      (vWorldPosition.y - uYMin) / max(uYMax - uYMin, 0.001),
      0.0, 1.0
    );
    float t = height * 0.6 + diffuse * 0.4;
  #endif

  // ── 2. Quantize → toon bands ──────────────────────────────────────────────
  float toon = quantize(t, uSteps);

  // ── 3. Base color from gradient ───────────────────────────────────────────
  vec3 color = mix(uShadow, uHighlight, toon);

  // ── 4. UV color map (optional) ────────────────────────────────────────────
  #ifdef USE_COLOR_MAP
    vec4 mapSample = texture2D(uColorMap, vUv);
    // Multiply blend: darkens gradient by texture, preserving toon bands
    color = mix(color, color * mapSample.rgb, uColorMapBlend);
  #endif

  // ── 5. Screen-space overlay (optional) ────────────────────────────────────
  #ifdef USE_OVERLAY
    vec2  overlayUv  = vScreenUv * uOverlayScale;
    vec4  overlay    = texture2D(uOverlayMap, overlayUv);
    // Overlay blend: screen blend mode — brightens without blowing out
    vec3  screen     = 1.0 - (1.0 - color) * (1.0 - overlay.rgb);
    color = mix(color, screen, uOverlayBlend * overlay.a);
  #endif

  // ── 6. Output ─────────────────────────────────────────────────────────────
  gl_FragColor = vec4(color, 1.0);

  // Three.js color space + tone mapping correction
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
