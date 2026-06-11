"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mouseState } from "@/lib/mouse";

/**
 * Procedural starfield rendered as GPU points with a custom shader:
 * per-particle twinkle, soft round sprites, slow rotation, and parallax
 * shift driven by the uMouse uniform.
 */

const vertexShader = /* glsl */ `
  attribute float aScale;
  attribute float aPhase;
  uniform float uTime;
  uniform vec2 uMouse;
  varying float vAlpha;
  varying float vTint;

  void main() {
    vec3 p = position;

    // Parallax: deeper particles shift more with the cursor
    float depth = (p.z + 14.0) / 28.0;
    p.x += uMouse.x * depth * 1.6;
    p.y += uMouse.y * depth * 1.2;

    // Gentle vertical drift
    p.y += sin(uTime * 0.18 + aPhase) * 0.25;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aScale * 42.0 / -mv.z;

    float twinkle = 0.55 + 0.45 * sin(uTime * 1.4 + aPhase * 6.2831);
    vAlpha = twinkle * smoothstep(28.0, 6.0, -mv.z);
    vTint = aPhase;
  }
`;

const fragmentShader = /* glsl */ `
  precision mediump float;
  varying float vAlpha;
  varying float vTint;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float circle = smoothstep(0.5, 0.08, d);
    // Playful multicolor tinting: teal -> sky -> violet -> magenta -> amber
    vec3 teal = vec3(0.62, 0.93, 0.86);
    vec3 sky = vec3(0.42, 0.78, 0.98);
    vec3 violet = vec3(0.72, 0.62, 0.98);
    vec3 magenta = vec3(0.91, 0.55, 0.98);
    vec3 amber = vec3(0.98, 0.78, 0.36);
    vec3 col = teal;
    col = mix(col, sky, smoothstep(0.15, 0.35, vTint));
    col = mix(col, violet, smoothstep(0.35, 0.55, vTint));
    col = mix(col, magenta, smoothstep(0.55, 0.78, vTint));
    col = mix(col, amber, smoothstep(0.78, 0.96, vTint));
    gl_FragColor = vec4(col, circle * vAlpha * 0.85);
  }
`;

export default function ParticleField({
  count = 1200,
  reduced,
}: {
  count?: number;
  reduced: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, scales, phases } = useMemo(() => {
    // Deterministic seeded PRNG (mulberry32) — keeps the generator pure so
    // the field is identical across renders and hydration-safe.
    let seed = 1337;
    const rand = () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Distribute in a flat ellipsoid shell behind the UI
      const r = 6 + rand() * 14;
      const theta = rand() * Math.PI * 2;
      const y = (rand() - 0.5) * 14;
      positions[i * 3] = Math.cos(theta) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * r - 8;
      scales[i] = 0.4 + rand() * 1.6;
      phases[i] = rand();
    }
    return { positions, scales, phases };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    []
  );

  useFrame((state) => {
    if (reduced) return;
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      matRef.current.uniforms.uMouse.value.set(mouseState.snx, mouseState.sny);
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.012;
    }
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
