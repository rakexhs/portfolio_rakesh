"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { mouseState } from "@/lib/mouse";

/**
 * Fullscreen procedural backdrop: fbm-based aurora fog over a faint
 * perspective grid, with a glow field that follows the (smoothed) cursor.
 * Custom GLSL — reacts to uTime and uMouse uniforms.
 */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// The MOBILE token is injected as a `#define` (see buildFragmentShader) to
// compile out the expensive domain-warp fbm passes and the per-channel
// chromatic aberration on touch devices — keeping mobile at its prior cost.
const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2 uMouse;     // smoothed, normalized [-1, 1]
  uniform float uIntensity;
  uniform vec2 uResolution; // drawing buffer size, for px-accurate aberration
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.05 + vec2(13.7, 7.3);
      a *= 0.5;
    }
    return v;
  }

  // Aurora colour at a UV. On desktop the second fbm layer is domain-warped by
  // a first fbm field (the classic IQ trick: feed noise into the UVs of more
  // noise) so the fog folds over itself and reads as volume rather than a flat
  // sliding gradient. The two layers drift at different speeds/directions.
  vec3 aurora(vec2 uv, vec2 mouse, float t) {
    vec2 drift = vec2(t * 0.025, -t * 0.018) + mouse * 0.15;

    vec3 teal = vec3(0.10, 0.55, 0.48);
    vec3 violet = vec3(0.35, 0.25, 0.62);

    #ifdef MOBILE
      float fog = fbm(uv * 3.0 + drift);
      float blend = fbm(uv * 2.0 - drift * 0.6);
    #else
      // First field -> a 2D warp vector that displaces the second field's UVs.
      vec2 warpDrift = vec2(-t * 0.045, t * 0.06);
      vec2 q = vec2(
        fbm(uv * 2.2 + drift),
        fbm(uv * 2.2 + drift + vec2(5.2, 1.3))
      );
      float fog = fbm(uv * 3.0 + q * 2.6 + warpDrift);
      float blend = fbm(uv * 2.0 - drift * 0.6 + q * 1.1);
    #endif

    fog = smoothstep(0.35, 0.95, fog);
    return mix(teal, violet, blend) * fog * 0.22;
  }

  void main() {
    vec2 uv = vUv;
    vec2 centered = uv * 2.0 - 1.0;

    // Deep base
    vec3 col = vec3(0.018, 0.022, 0.030);

    // Aurora fog drifting with time, nudged by the cursor
    col += aurora(uv, uMouse, uTime) * uIntensity;

    // Faint console grid, fading toward the top
    vec2 grid = abs(fract(uv * vec2(28.0, 18.0)) - 0.5);
    float line = smoothstep(0.49, 0.5, max(grid.x, grid.y));
    col += vec3(0.5, 0.9, 0.85) * line * 0.02 * (1.0 - uv.y) * uIntensity;

    // Cursor-reactive glow field
    vec2 toCursor = centered - uMouse;
    float d = length(toCursor);
    float glow = exp(-d * 2.6);
    vec3 glowTint = vec3(0.18, 0.62, 0.55);

    #ifdef MOBILE
      col += glowTint * glow * 0.16 * uIntensity;
    #else
      // Chromatic aberration, localized to the glow. A radially symmetric glow
      // barely shows a positional RGB shift (the halo just cancels), so instead
      // we give each channel its own falloff rate: red bleeds wider, blue stays
      // tight. That produces a visible chromatic ring around the cursor halo,
      // plus a small positional split along the radial for directionality.
      float base = d * 2.6;
      vec2 dir = toCursor / max(d, 1e-4);
      vec2 px = 6.0 / uResolution;        // positional split, scaled by glow
      float dR = length(toCursor + dir * px * glow) * 2.6;
      float dB = length(toCursor - dir * px * glow) * 2.6;
      float gR = exp(-dR * 0.82);         // red halo spreads out further
      float gG = exp(-base);
      float gB = exp(-dB * 1.28);         // blue core stays tight
      col += vec3(gR, gG, gB) * glowTint * 0.18 * uIntensity;
    #endif

    // Vignette
    float vig = smoothstep(1.55, 0.35, length(centered));
    col *= vig;

    gl_FragColor = vec4(col, 1.0);
  }
`;

const buildFragmentShader = (mobile: boolean) =>
  (mobile ? "#define MOBILE\n" : "") + fragmentShader;

export default function ShaderPlane({
  reduced,
  isMobile = false,
}: {
  reduced: boolean;
  isMobile?: boolean;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport, size } = useThree();

  const frag = useMemo(() => buildFragmentShader(isMobile), [isMobile]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uIntensity: { value: 1 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
    }),
    // Resolution is kept fresh in useFrame; only seed it once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((state) => {
    const mat = matRef.current;
    if (!mat) return;
    // Update resolution even under reduced motion so the single demand-frame
    // (and any resize) gets a px-accurate aberration scale.
    mat.uniforms.uResolution.value.set(state.size.width, state.size.height);
    if (reduced) return;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    mat.uniforms.uMouse.value.set(mouseState.snx, mouseState.sny);
  });

  return (
    <mesh position={[0, 0, -6]} scale={[viewport.width * 2.6, viewport.height * 2.6, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={frag}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  );
}
