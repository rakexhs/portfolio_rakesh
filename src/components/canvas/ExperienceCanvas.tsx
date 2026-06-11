"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsTouch } from "@/hooks/useIsTouch";

// WebGL scene is heavy — load it client-side only, after hydration.
const Scene = dynamic(() => import("@/components/canvas/Scene"), {
  ssr: false,
});

/**
 * Persistent fullscreen WebGL layer fixed behind all DOM content.
 * Mobile gets a lighter scene; reduced-motion gets a near-static one.
 */
export default function ExperienceCanvas() {
  const reduced = useReducedMotion();
  const isTouch = useIsTouch();

  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <Scene reduced={reduced} isMobile={isTouch} />
      {/* Soft top/bottom fades blend the canvas into the page */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-void to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-void to-transparent" />
    </div>
  );
}
