"use client";

import { useRef, useState, type ComponentRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { randomColor } from "@/lib/palette";

/**
 * Gooey interactive blob: a distorted sphere that slowly cycles hue,
 * wobbles harder when hovered, and pops to a new color when clicked.
 * Procedural (drei's distort shader over a sphere primitive).
 */
export default function PlayBlob({ reduced }: { reduced: boolean }) {
  const matRef = useRef<ComponentRef<typeof MeshDistortMaterial>>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const pop = useRef(0);

  useFrame((_, delta) => {
    if (reduced) return;
    const mat = matRef.current;
    if (mat) {
      mat.distort = THREE.MathUtils.lerp(
        mat.distort,
        (hovered ? 0.55 : 0.3) + pop.current,
        0.08
      );
    }
    pop.current *= 1 - Math.min(delta * 2.5, 0.25);
    if (meshRef.current) {
      const target = hovered ? 1.15 : 1;
      meshRef.current.scale.setScalar(
        THREE.MathUtils.lerp(meshRef.current.scale.x, target, 0.1)
      );
    }
  });

  return (
    <Float speed={1.6} rotationIntensity={0.4} floatIntensity={1.4}>
      <mesh
        ref={meshRef}
        position={[-4.4, -2.6, -3.5]}
        scale={1}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          pop.current += 0.5;
          matRef.current?.color.set(
            randomColor(`#${matRef.current.color.getHexString()}`)
          );
        }}
      >
        <sphereGeometry args={[0.9, 48, 48]} />
        <MeshDistortMaterial
          ref={matRef}
          color="#e879f9"
          roughness={0.25}
          metalness={0.3}
          distort={0.3}
          speed={2.2}
          transparent
          opacity={0.85}
        />
      </mesh>
    </Float>
  );
}
