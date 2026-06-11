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

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2 uMouse;     // smoothed, normalized [-1, 1]
  uniform float uIntensity;
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

  void main() {
    vec2 uv = vUv;
    vec2 centered = uv * 2.0 - 1.0;

    // Deep base
    vec3 col = vec3(0.018, 0.022, 0.030);

    // Aurora fog drifting with time, nudged by the cursor
    vec2 drift = vec2(uTime * 0.025, -uTime * 0.018) + uMouse * 0.15;
    float fog = fbm(uv * 3.0 + drift);
    fog = smoothstep(0.35, 0.95, fog);

    vec3 teal = vec3(0.10, 0.55, 0.48);
    vec3 violet = vec3(0.35, 0.25, 0.62);
    float blend = fbm(uv * 2.0 - drift * 0.6);
    vec3 aurora = mix(teal, violet, blend);
    col += aurora * fog * 0.22 * uIntensity;

    // Faint console grid, fading toward the top
    vec2 grid = abs(fract(uv * vec2(28.0, 18.0)) - 0.5);
    float line = smoothstep(0.49, 0.5, max(grid.x, grid.y));
    col += vec3(0.5, 0.9, 0.85) * line * 0.02 * (1.0 - uv.y) * uIntensity;

    // Cursor-reactive glow field
    float d = length(centered - uMouse);
    float glow = exp(-d * 2.6);
    col += vec3(0.18, 0.62, 0.55) * glow * 0.16 * uIntensity;

    // Vignette
    float vig = smoothstep(1.55, 0.35, length(centered));
    col *= vig;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function ShaderPlane({ reduced }: { reduced: boolean }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uIntensity: { value: 1 },
    }),
    []
  );

  useFrame((state) => {
    if (!matRef.current || reduced) return;
    matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    matRef.current.uniforms.uMouse.value.set(mouseState.snx, mouseState.sny);
  });

  return (
    <mesh position={[0, 0, -6]} scale={[viewport.width * 2.6, viewport.height * 2.6, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  );
}
