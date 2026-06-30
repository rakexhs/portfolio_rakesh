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

  // Paper mottle: a faint, organic ink stain so the stock doesn't read as a
  // flat fill. On desktop the second fbm layer is domain-warped by a first fbm
  // field (the IQ trick: feed noise into the UVs of more noise) so the stain
  // folds over itself. Returns a 0..1 stain mask plus a warm/cool tint mix.
  vec3 paperStain(vec2 uv, vec2 mouse, float t) {
    vec2 drift = vec2(t * 0.012, -t * 0.009) + mouse * 0.08;

    #ifdef MOBILE
      float fog = fbm(uv * 3.0 + drift);
      float blend = fbm(uv * 2.0 - drift * 0.6);
    #else
      vec2 warpDrift = vec2(-t * 0.02, t * 0.03);
      vec2 q = vec2(
        fbm(uv * 2.2 + drift),
        fbm(uv * 2.2 + drift + vec2(5.2, 1.3))
      );
      float fog = fbm(uv * 3.0 + q * 2.6 + warpDrift);
      float blend = fbm(uv * 2.0 - drift * 0.6 + q * 1.1);
    #endif

    fog = smoothstep(0.25, 0.95, fog);
    // Warm sepia vs cool ink pigment for the stain.
    vec3 warm = vec3(0.20, 0.12, 0.05);
    vec3 cool = vec3(0.08, 0.08, 0.12);
    return mix(warm, cool, blend) * fog;
  }

  void main() {
    vec2 uv = vUv;
    vec2 centered = uv * 2.0 - 1.0;

    // Warm paper stock.
    vec3 paper = vec3(0.914, 0.882, 0.812);
    vec3 col = paper;

    // Ink mottle (multiply so it darkens the stock like absorbed pigment).
    vec3 stain = paperStain(uv, uMouse, uTime);
    col *= 1.0 - stain * 0.10 * uIntensity;

    // Faint ruled grid pressed into the paper.
    vec2 grid = abs(fract(uv * vec2(26.0, 16.0)) - 0.5);
    float line = smoothstep(0.48, 0.5, max(grid.x, grid.y));
    col *= 1.0 - line * 0.06 * uIntensity;

    // Cursor ink-wash: a vermillion bloom that stains the paper near the
    // pointer. Multiply blending reads as colored pigment soaking in.
    vec2 toCursor = centered - uMouse;
    float d = length(toCursor);
    float glow = exp(-d * 2.6);
    vec3 ink = vec3(0.87, 0.27, 0.11); // vermillion

    #ifdef MOBILE
      col *= mix(vec3(1.0), ink, glow * 0.16 * uIntensity);
    #else
      // Chromatic edge: each channel soaks at a different radius, so the wash
      // carries a subtle RGB fringe at its boundary (red wider, blue tighter).
      float base = d * 2.6;
      vec2 dir = toCursor / max(d, 1e-4);
      vec2 px = 6.0 / uResolution;
      float gR = exp(-length(toCursor + dir * px * glow) * 2.6 * 0.82);
      float gG = exp(-base);
      float gB = exp(-length(toCursor - dir * px * glow) * 2.6 * 1.28);
      col *= mix(vec3(1.0), ink, vec3(gR, gG, gB) * 0.18 * uIntensity);
    #endif

    // Fine paper grain.
    float grain = hash(floor(uv * uResolution)) - 0.5;
    col += grain * 0.018;

    // Soft printed vignette — edges of the stock sit a touch darker.
    float vig = smoothstep(1.8, 0.35, length(centered));
    col *= mix(0.93, 1.0, vig);

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
