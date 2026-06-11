"use client";

import { useEffect } from "react";
import { updateMouse } from "@/lib/mouse";

/**
 * Mounts the single global pointermove listener that feeds the shared
 * mouse store (src/lib/mouse.ts). Consumers read the store directly in
 * rAF/useFrame loops — no React re-renders on pointer movement.
 */
export function useMousePosition() {
  useEffect(() => {
    const onMove = (e: PointerEvent) => updateMouse(e.clientX, e.clientY);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
}
