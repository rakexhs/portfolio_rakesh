"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mouseState } from "@/lib/mouse";

/**
 * Procedural starfield rendered as GPU points with a custom shader:
 * per-particle twinkle, soft round sprites, slow rotation, and parallax
 * shift driven by the uMouse uniform.
 *
 * A constellation pass draws thin lines between nearby particles. Its topology
 * is precomputed once (via a spatial hash grid, not an O(n^2) scan) and baked
 * into a single LineSegments BufferGeometry — one draw call. The line vertices
 * carry the same aPhase as their particle and replicate the point shader's
 * displacement, so endpoints stay glued to the points. The whole field lives in
 * one group that rotates as a coherent volume, which keeps relative distances
 * fixed and the precomputed links valid.
 */

const POINT_DRIFT = /* glsl */ `
  // Shared displacement so points and constellation lines move identically.
  vec3 displace(vec3 p, float aPhase, vec2 mouse, float t) {
    float depth = (p.z + 14.0) / 28.0;
    p.x += mouse.x * depth * 1.6;
    p.y += mouse.y * depth * 1.2;
    p.y += sin(t * 0.18 + aPhase) * 0.25;
    return p;
  }
`;

const vertexShader = /* glsl */ `
  attribute float aScale;
  attribute float aPhase;
  uniform float uTime;
  uniform vec2 uMouse;
  varying float vAlpha;
  varying float vTint;

  ${POINT_DRIFT}

  void main() {
    vec3 p = displace(position, aPhase, uMouse, uTime);

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

const lineVertexShader = /* glsl */ `
  attribute float aPhase;
  attribute float aLineAlpha;
  uniform float uTime;
  uniform vec2 uMouse;
  varying float vAlpha;

  ${POINT_DRIFT}

  void main() {
    vec3 p = displace(position, aPhase, uMouse, uTime);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    // Fade with depth, like the points, so distant links recede.
    vAlpha = aLineAlpha * smoothstep(28.0, 6.0, -mv.z);
  }
`;

const lineFragmentShader = /* glsl */ `
  precision mediump float;
  varying float vAlpha;
  void main() {
    gl_FragColor = vec4(vec3(0.36, 0.80, 0.74), vAlpha * 0.16);
  }
`;

export default function ParticleField({
  count = 1200,
  reduced,
}: {
  count?: number;
  reduced: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const lineMatRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, scales, phases, linePositions, linePhases, lineAlphas } =
    useMemo(() => {
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

      // --- Constellation topology (computed once) ---
      // Link distance is scaled by density so connectivity stays visually
      // consistent as `count` changes between desktop and mobile.
      const linkDist = 1.7 * Math.cbrt(3500 / count);
      const linkDist2 = linkDist * linkDist;
      const maxPerParticle = 4;
      const maxLinks = count * 2;

      // Spatial hash grid: bucket particles into cells of size linkDist so each
      // particle only tests its 27 neighboring cells -> O(n * k), not O(n^2).
      const cell = linkDist;
      const grid = new Map<string, number[]>();
      const cellKey = (x: number, y: number, z: number) =>
        `${Math.floor(x / cell)},${Math.floor(y / cell)},${Math.floor(z / cell)}`;
      for (let i = 0; i < count; i++) {
        const k = cellKey(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
        const bucket = grid.get(k);
        if (bucket) bucket.push(i);
        else grid.set(k, [i]);
      }

      const connCount = new Int16Array(count);
      // Pairs stored flat: [aIndex, bIndex, ...]
      const pairs: number[] = [];
      const dists: number[] = [];
      outer: for (let i = 0; i < count; i++) {
        if (connCount[i] >= maxPerParticle) continue;
        const xi = positions[i * 3];
        const yi = positions[i * 3 + 1];
        const zi = positions[i * 3 + 2];
        const cx = Math.floor(xi / cell);
        const cy = Math.floor(yi / cell);
        const cz = Math.floor(zi / cell);
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            for (let dz = -1; dz <= 1; dz++) {
              const bucket = grid.get(`${cx + dx},${cy + dy},${cz + dz}`);
              if (!bucket) continue;
              for (let b = 0; b < bucket.length; b++) {
                const j = bucket[b];
                // i<j guarantees each pair is considered once and skips self.
                if (j <= i) continue;
                if (connCount[i] >= maxPerParticle) continue;
                if (connCount[j] >= maxPerParticle) continue;
                const ex = positions[j * 3] - xi;
                const ey = positions[j * 3 + 1] - yi;
                const ez = positions[j * 3 + 2] - zi;
                const d2 = ex * ex + ey * ey + ez * ez;
                if (d2 < linkDist2) {
                  pairs.push(i, j);
                  dists.push(Math.sqrt(d2));
                  connCount[i]++;
                  connCount[j]++;
                  if (pairs.length / 2 >= maxLinks) break outer;
                }
              }
            }
          }
        }
      }

      const linkCount = pairs.length / 2;
      const linePositions = new Float32Array(linkCount * 2 * 3);
      const linePhases = new Float32Array(linkCount * 2);
      const lineAlphas = new Float32Array(linkCount * 2);
      for (let l = 0; l < linkCount; l++) {
        const a = pairs[l * 2];
        const b = pairs[l * 2 + 1];
        // Shorter links read brighter; longer ones fade toward the threshold.
        const alpha = 1.0 - dists[l] / linkDist;
        for (let e = 0; e < 2; e++) {
          const idx = e === 0 ? a : b;
          const v = (l * 2 + e) * 3;
          linePositions[v] = positions[idx * 3];
          linePositions[v + 1] = positions[idx * 3 + 1];
          linePositions[v + 2] = positions[idx * 3 + 2];
          linePhases[l * 2 + e] = phases[idx];
          lineAlphas[l * 2 + e] = alpha;
        }
      }

      return { positions, scales, phases, linePositions, linePhases, lineAlphas };
    }, [count]);

  // One uniforms object shared by both materials — single per-frame update,
  // and guarantees points + lines read the exact same time/mouse values.
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    []
  );

  useFrame((state) => {
    if (reduced) return;
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uMouse.value.set(mouseState.snx, mouseState.sny);
    if (groupRef.current) {
      // Slow coherent rotation: the field reads as one rotating volume rather
      // than static twinkling points. A faint wobble on X adds a sense of orbit.
      const t = state.clock.elapsedTime;
      groupRef.current.rotation.y = t * 0.018;
      groupRef.current.rotation.x = Math.sin(t * 0.05) * 0.06;
    }
  });

  return (
    <group ref={groupRef}>
      <points frustumCulled={false}>
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

      {linePositions.length > 0 && (
        <lineSegments frustumCulled={false}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
            <bufferAttribute attach="attributes-aPhase" args={[linePhases, 1]} />
            <bufferAttribute attach="attributes-aLineAlpha" args={[lineAlphas, 1]} />
          </bufferGeometry>
          <shaderMaterial
            ref={lineMatRef}
            vertexShader={lineVertexShader}
            fragmentShader={lineFragmentShader}
            uniforms={uniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>
      )}
    </group>
  );
}
