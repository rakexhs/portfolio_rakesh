"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import ShaderPlane from "@/components/canvas/ShaderPlane";
import ParticleField from "@/components/canvas/ParticleField";
import FloatingObjects from "@/components/canvas/FloatingObjects";
import WaveGrid from "@/components/canvas/WaveGrid";
import OrbitSystem from "@/components/canvas/OrbitSystem";
import PlayBlob from "@/components/canvas/PlayBlob";
import CursorLight from "@/components/canvas/CursorLight";
import { mouseState } from "@/lib/mouse";
import { lerp } from "@/lib/utils";

/** Smooths the shared mouse store once per frame for all consumers. */
function MouseSmoother() {
  useFrame(() => {
    mouseState.snx = lerp(mouseState.snx, mouseState.nx, 0.05);
    mouseState.sny = lerp(mouseState.sny, mouseState.ny, 0.05);
  });
  return null;
}

type Props = {
  reduced: boolean;
  isMobile: boolean;
};

export default function Scene({ reduced, isMobile }: Props) {
  return (
    <Canvas
      dpr={[1, isMobile ? 1.5 : 2]}
      camera={{ position: [0, 0, 8], fov: 50 }}
      gl={{ antialias: !isMobile, alpha: true, powerPreference: "high-performance" }}
      frameloop={reduced ? "demand" : "always"}
      style={{ pointerEvents: "none" }}
      // Canvas sits behind the DOM with pointer-events: none, so raycast
      // events are sourced from the document body instead — this is what
      // makes the 3D objects hoverable/clickable through the page.
      eventSource={document.body}
      eventPrefix="client"
      aria-hidden="true"
    >
      <MouseSmoother />
      <ambientLight intensity={0.4} />
      <CursorLight reduced={reduced} />
      <ShaderPlane reduced={reduced} />
      <ParticleField reduced={reduced} count={isMobile ? 450 : 1200} />
      <WaveGrid reduced={reduced} segments={isMobile ? 48 : 96} />
      {!isMobile && (
        <>
          <FloatingObjects reduced={reduced} />
          <OrbitSystem reduced={reduced} />
          <PlayBlob reduced={reduced} />
        </>
      )}
    </Canvas>
  );
}
