"use client";

import { useRef, useState, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { mouseState } from "@/lib/mouse";
import { PALETTE, randomColor } from "@/lib/palette";

/**
 * Procedural floating geometry — all Three.js primitives, no imported models.
 * Every shape is interactive: hover to grow + glow, click to fling it into a
 * spin and cycle its color through the palette.
 */

type ShapeProps = {
  children: ReactNode;
  position: [number, number, number];
  scale?: number;
  color: string;
  wireframe?: boolean;
  baseSpin?: [number, number];
  floatSpeed?: number;
  reduced: boolean;
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
}: ShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const impulse = useRef(0);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh || reduced) return;
    mesh.rotation.x += delta * (baseSpin[0] + impulse.current);
    mesh.rotation.y += delta * (baseSpin[1] + impulse.current * 1.4);
    impulse.current *= 1 - Math.min(delta * 1.6, 0.2);

    const target = hovered ? scale * 1.3 : scale;
    const s = THREE.MathUtils.lerp(mesh.scale.x, target, 0.12);
    mesh.scale.setScalar(s);

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
          if (matRef.current) {
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
    if (groupRef.current) {
      groupRef.current.rotation.y +=
        (mouseState.snx * 0.12 - groupRef.current.rotation.y) * 0.04;
      groupRef.current.rotation.x +=
        (-mouseState.sny * 0.08 - groupRef.current.rotation.x) * 0.04;
    }
    if (ringARef.current) ringARef.current.rotation.z = t * 0.18;
    if (ringBRef.current) ringBRef.current.rotation.z = -t * 0.12;
  });

  return (
    <group ref={groupRef}>
      <InteractiveShape
        position={[3.4, 0.6, -2.5]}
        scale={0.85}
        color={PALETTE[0]}
        baseSpin={[0.15, 0.22]}
        reduced={reduced}
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
