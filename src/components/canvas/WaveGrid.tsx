"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mouseState } from "@/lib/mouse";

/**
 * Procedural terrain floor: a wireframe plane displaced in the vertex shader
 * by layered sine waves plus a ripple that radiates from the cursor position.
 * Third custom GLSL material in the scene — reacts to uTime and uMouse.
 */

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  varying float vElev;
  varying float vDist;

  void main() {
    vec3 pos = position;

    // Layered travelling waves
    float wave =
      sin(pos.x * 0.45 + uTime * 0.7) * 0.45 +
      sin(pos.y * 0.65 - uTime * 0.5) * 0.35 +
      sin((pos.x + pos.y) * 0.3 + uTime * 0.4) * 0.25;

    // Cursor ripple: uMouse mapped to plane space
    vec2 mousePos = uMouse * vec2(16.0, 9.0);
    float d = distance(pos.xy, mousePos);
    float ripple = sin(d * 1.4 - uTime * 2.4) * exp(-d * 0.22) * 1.1;

    pos.z += wave + ripple;
    vElev = pos.z;
    vDist = length(position.xy) / 22.0;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision mediump float;
  varying float vElev;
  varying float vDist;

  void main() {
    vec3 low = vec3(0.07, 0.14, 0.24);    // deep blue valleys
    vec3 mid = vec3(0.37, 0.92, 0.83);    // teal slopes
    vec3 high = vec3(0.91, 0.55, 0.98);   // magenta crests
    float t = smoothstep(-1.0, 1.4, vElev);
    vec3 col = mix(low, mid, smoothstep(0.0, 0.6, t));
    col = mix(col, high, smoothstep(0.6, 1.0, t));
    float alpha = (0.34 - vDist * 0.26) * smoothstep(-1.2, 0.8, vElev);
    gl_FragColor = vec4(col, max(alpha, 0.0));
  }
`;

export default function WaveGrid({
  reduced,
  segments = 96,
}: {
  reduced: boolean;
  segments?: number;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    []
  );

  useFrame((state) => {
    if (!matRef.current || reduced) return;
    matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    matRef.current.uniforms.uMouse.value.set(mouseState.snx, mouseState.sny);
  });

  return (
    <mesh position={[0, -4.2, -4]} rotation={[-Math.PI / 2.35, 0, 0]}>
      <planeGeometry args={[36, 20, segments, Math.round(segments / 2)]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        wireframe
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
