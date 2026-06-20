"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { mouseState } from "@/lib/mouse";
import { sceneState } from "@/lib/scene";
import { PALETTE, randomColor } from "@/lib/palette";

/**
 * Procedural floating geometry — all Three.js primitives, no imported models.
 * Every shape is interactive: hover to grow + glow, click to fling it into a
 * spin and cycle its color through the palette.
 *
 * Enhancements: the whole group reacts to scroll progress (ScrollTrigger ->
 * sceneState.scroll), the wireframes ripple toward the cursor via a vertex
 * shader displacement injected into the standard material (onBeforeCompile, so
 * lighting + the existing hover/click behaviour are preserved), and the
 * section-reactive shape lerps its color/emissive to the active section accent.
 */

type ShapeUniforms = {
  uTime: { value: number };
  uMouse: { value: THREE.Vector2 };
  uAmp: { value: number };
};

// Inject cursor-proximity displacement into MeshStandardMaterial's vertex
// stage. We project each vertex to NDC, measure its distance to the (NDC-space)
// cursor, and push it along its object normal with an animated ripple that
// falls off with distance — so the wireframe "leans" toward the cursor.
function patchMaterial(uniforms: ShapeUniforms) {
  return (shader: THREE.WebGLProgramParametersWithUniforms) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uMouse = uniforms.uMouse;
    shader.uniforms.uAmp = uniforms.uAmp;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uAmp;`
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        {
          vec4 _mv = modelViewMatrix * vec4(transformed, 1.0);
          vec4 _clip = projectionMatrix * _mv;
          vec2 _ndc = _clip.xy / max(abs(_clip.w), 1e-4);
          float _d = distance(_ndc, uMouse);
          float _infl = smoothstep(0.85, 0.0, _d);
          float _wave = sin(_d * 9.0 - uTime * 3.0);
          transformed += objectNormal * _infl * _wave * uAmp;
        }`
      );
  };
}

type ShapeProps = {
  children: ReactNode;
  position: [number, number, number];
  scale?: number;
  color: string;
  wireframe?: boolean;
  baseSpin?: [number, number];
  floatSpeed?: number;
  reduced: boolean;
  /** When set, color/emissive track the active section accent (sceneState). */
  sectionReactive?: boolean;
};

function InteractiveShape({
  children,
  position,
  scale = 1,
  color,
  wireframe = true,
  baseSpin = [0.1, 0.16],
  floatSpeed = 1.3,
  reduced,
  sectionReactive = false,
}: ShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const impulse = useRef(0);

  // Per-shape uniforms for the displacement patch; identity is stable so the
  // references handed to the compiled shader stay valid for the material's life.
  const uniforms = useMemo<ShapeUniforms>(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uAmp: { value: 0.15 },
    }),
    []
  );
  const onBeforeCompile = useMemo(() => patchMaterial(uniforms), [uniforms]);

  // Reduced motion fully disables the displacement (no static deformation).
  useEffect(() => {
    uniforms.uAmp.value = reduced ? 0 : 0.15;
  }, [reduced, uniforms]);

  // Section-accent target, updated only when the active accent actually changes
  // (no per-frame allocation; lerp mutates the colors in place).
  const targetColor = useRef(new THREE.Color(color));
  const lastAccent = useRef("");

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh || reduced) return;
    mesh.rotation.x += delta * (baseSpin[0] + impulse.current);
    mesh.rotation.y += delta * (baseSpin[1] + impulse.current * 1.4);
    impulse.current *= 1 - Math.min(delta * 1.6, 0.2);

    const target = hovered ? scale * 1.3 : scale;
    const s = THREE.MathUtils.lerp(mesh.scale.x, target, 0.12);
    mesh.scale.setScalar(s);

    uniforms.uTime.value += delta;
    uniforms.uMouse.value.set(mouseState.snx, mouseState.sny);

    if (matRef.current) {
      matRef.current.opacity = THREE.MathUtils.lerp(
        matRef.current.opacity,
        hovered ? 0.85 : 0.38,
        0.1
      );
      matRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        matRef.current.emissiveIntensity,
        hovered ? 1.6 : 0.6,
        0.1
      );

      if (sectionReactive) {
        if (sceneState.accent !== lastAccent.current) {
          lastAccent.current = sceneState.accent;
          targetColor.current.set(sceneState.accent);
        }
        matRef.current.color.lerp(targetColor.current, 0.06);
        matRef.current.emissive.lerp(targetColor.current, 0.06);
      }
    }
  });

  return (
    <Float speed={floatSpeed} rotationIntensity={0.35} floatIntensity={1.1}>
      <mesh
        ref={meshRef}
        position={position}
        scale={scale}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          impulse.current += 9;
          // The section-reactive shape keeps its accent-driven color; others
          // still cycle through the palette on click.
          if (matRef.current && !sectionReactive) {
            const next = randomColor(`#${matRef.current.color.getHexString()}`);
            matRef.current.color.set(next);
            matRef.current.emissive.set(next);
          }
        }}
      >
        {children}
        <meshStandardMaterial
          ref={matRef}
          color={color}
          wireframe={wireframe}
          transparent
          opacity={0.38}
          emissive={color}
          emissiveIntensity={0.6}
          onBeforeCompile={onBeforeCompile}
        />
      </mesh>
    </Float>
  );
}

export default function FloatingObjects({ reduced }: { reduced: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const ringARef = useRef<THREE.Mesh>(null);
  const ringBRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    const scroll = sceneState.scroll;
    if (groupRef.current) {
      // Mouse parallax (as before) plus a scroll-driven yaw, so the cluster
      // turns as the page advances rather than only with elapsed time.
      groupRef.current.rotation.y +=
        (mouseState.snx * 0.12 + scroll * Math.PI * 0.5 - groupRef.current.rotation.y) *
        0.04;
      groupRef.current.rotation.x +=
        (-mouseState.sny * 0.08 - groupRef.current.rotation.x) * 0.04;
      // Gentle vertical parallax across the scroll range.
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        (scroll - 0.5) * 1.2,
        0.04
      );
    }
    // Rings spin with time and accelerate with scroll progress.
    if (ringARef.current) ringARef.current.rotation.z = t * 0.18 + scroll * Math.PI * 1.4;
    if (ringBRef.current) ringBRef.current.rotation.z = -t * 0.12 - scroll * Math.PI * 1.1;
  });

  return (
    <group ref={groupRef}>
      <InteractiveShape
        position={[3.4, 0.6, -2.5]}
        scale={0.85}
        color={PALETTE[0]}
        baseSpin={[0.15, 0.22]}
        reduced={reduced}
        sectionReactive
      >
        <torusKnotGeometry args={[1, 0.28, 110, 14]} />
      </InteractiveShape>

      <InteractiveShape
        position={[4.6, 3.1, -6]}
        scale={0.7}
        color={PALETTE[2]}
        floatSpeed={1.1}
        reduced={reduced}
      >
        <icosahedronGeometry args={[1, 0]} />
      </InteractiveShape>

      <InteractiveShape
        position={[2.8, -2.4, -3]}
        scale={0.32}
        color={PALETTE[4]}
        baseSpin={[0.2, 0.3]}
        floatSpeed={1.8}
        reduced={reduced}
      >
        <octahedronGeometry args={[1, 0]} />
      </InteractiveShape>

      <InteractiveShape
        position={[-3.4, -0.4, -4.5]}
        scale={0.4}
        color={PALETTE[5]}
        baseSpin={[0.12, 0.2]}
        floatSpeed={1.5}
        reduced={reduced}
      >
        <tetrahedronGeometry args={[1, 0]} />
      </InteractiveShape>

      <mesh ref={ringARef} position={[-2.6, -2.2, -4]} rotation={[1.2, 0.4, 0]}>
        <torusGeometry args={[1.6, 0.012, 8, 90]} />
        <meshBasicMaterial color={PALETTE[1]} transparent opacity={0.4} />
      </mesh>

      <mesh ref={ringBRef} position={[-2.6, -2.2, -4]} rotation={[1.0, -0.3, 0]}>
        <torusGeometry args={[2.1, 0.008, 8, 90]} />
        <meshBasicMaterial color={PALETTE[3]} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
