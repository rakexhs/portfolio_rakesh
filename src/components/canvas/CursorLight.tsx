"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mouseState } from "@/lib/mouse";

/** Teal point light that drifts after the smoothed cursor position. */
export default function CursorLight({ reduced }: { reduced: boolean }) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ viewport }) => {
    if (!lightRef.current || reduced) return;
    lightRef.current.position.x = (mouseState.snx * viewport.width) / 2;
    lightRef.current.position.y = (mouseState.sny * viewport.height) / 2;
  });

  return (
    <pointLight
      ref={lightRef}
      position={[0, 0, 2]}
      intensity={14}
      distance={12}
      color="#5eead4"
    />
  );
}
