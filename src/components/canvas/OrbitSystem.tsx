"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

/**
 * Procedural orbital system: a wireframe dodecahedron core with small
 * glowing satellites tracing tilted elliptical orbits — pure primitives.
 * Interactive: hovering the core grows it; clicking reverses and briefly
 * supercharges the orbits.
 */

const ORBITS = [
  { radius: 1.5, speed: 0.55, tilt: 0.45, size: 0.07, color: "#5eead4", phase: 0 },
  { radius: 2.05, speed: -0.38, tilt: -0.3, size: 0.055, color: "#e879f9", phase: 2.1 },
  { radius: 2.6, speed: 0.26, tilt: 0.7, size: 0.045, color: "#fbbf24", phase: 4.2 },
];

export default function OrbitSystem({ reduced }: { reduced: boolean }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const satRefs = useRef<(THREE.Mesh | null)[]>([]);
  const [hovered, setHovered] = useState(false);
  const direction = useRef(1);
  const boost = useRef(0);
  const angle = useRef(0);

  useFrame((_, delta) => {
    if (reduced) return;
    // Accumulated angle lets us reverse direction without satellites jumping
    angle.current += delta * direction.current * (1 + boost.current);
    boost.current *= 1 - Math.min(delta * 1.2, 0.15);

    if (coreRef.current) {
      coreRef.current.rotation.x += delta * (0.12 + boost.current * 0.5);
      coreRef.current.rotation.y += delta * (0.18 + boost.current * 0.5);
      const target = hovered ? 1.25 : 1;
      coreRef.current.scale.setScalar(
        THREE.MathUtils.lerp(coreRef.current.scale.x, target, 0.12)
      );
    }
    ORBITS.forEach((orbit, i) => {
      const sat = satRefs.current[i];
      if (!sat) return;
      const a = angle.current * orbit.speed + orbit.phase;
      const x = Math.cos(a) * orbit.radius;
      const z = Math.sin(a) * orbit.radius;
      sat.position.set(x, z * Math.sin(orbit.tilt), z * Math.cos(orbit.tilt));
    });
  });

  return (
    <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.8}>
      <group position={[-4.2, 2.8, -5]} scale={0.75}>
        <mesh
          ref={coreRef}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
          onClick={(e) => {
            e.stopPropagation();
            direction.current *= -1;
            boost.current += 5;
          }}
        >
          <dodecahedronGeometry args={[0.7, 0]} />
          <meshStandardMaterial
            color="#5eead4"
            wireframe
            transparent
            opacity={0.4}
            emissive="#134e4a"
            emissiveIntensity={0.7}
          />
        </mesh>

        {ORBITS.map((orbit, i) => (
          <group key={i}>
            {/* Orbit path */}
            <mesh rotation={[Math.PI / 2 - orbit.tilt, 0, 0]}>
              <torusGeometry args={[orbit.radius, 0.006, 6, 80]} />
              <meshBasicMaterial color={orbit.color} transparent opacity={0.18} />
            </mesh>
            {/* Satellite */}
            <mesh
              ref={(el) => {
                satRefs.current[i] = el;
              }}
            >
              <sphereGeometry args={[orbit.size, 12, 12]} />
              <meshBasicMaterial color={orbit.color} />
            </mesh>
          </group>
        ))}
      </group>
    </Float>
  );
}
