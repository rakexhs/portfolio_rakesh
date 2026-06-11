"use client";

import { useEffect, useRef } from "react";
import { mouseState, updateMouse } from "@/lib/mouse";
import { lerp } from "@/lib/utils";
import { useIsTouch } from "@/hooks/useIsTouch";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type CursorMode = "default" | "link" | "button" | "project";

/**
 * Physics-feeling global cursor: a crisp center dot that tracks 1:1 and a
 * trailing glow ring smoothed with lerp inside a rAF loop. Hover states are
 * driven by data-cursor attributes on DOM ancestors. Hidden on touch devices
 * and under prefers-reduced-motion; pointer-events: none throughout.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const isTouch = useIsTouch();
  const reduced = useReducedMotion();
  const enabled = !isTouch && !reduced;

  useEffect(() => {
    if (!enabled) {
      document.documentElement.classList.remove("custom-cursor-active");
      return;
    }
    document.documentElement.classList.add("custom-cursor-active");

    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const label = labelRef.current!;

    let rx = window.innerWidth / 2;
    let ry = window.innerHeight / 2;
    let mode: CursorMode = "default";
    let visible = false;
    let raf = 0;

    const setMode = (next: CursorMode) => {
      if (next === mode) return;
      mode = next;
      const size =
        mode === "project" ? 84 : mode === "button" ? 56 : mode === "link" ? 44 : 32;
      ring.style.width = `${size}px`;
      ring.style.height = `${size}px`;
      ring.style.borderColor =
        mode === "default" ? "rgba(232,236,244,0.35)" : "rgba(94,234,212,0.8)";
      ring.style.background =
        mode === "project" ? "rgba(94,234,212,0.08)" : "transparent";
      label.style.opacity = mode === "project" ? "1" : "0";
      dot.style.transform = `translate(-50%, -50%) scale(${
        mode === "default" ? 1 : 0.5
      })`;
    };

    const onMove = (e: PointerEvent) => {
      updateMouse(e.clientX, e.clientY);
      if (!visible) {
        visible = true;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }
      const target = e.target as HTMLElement;
      if (target.closest("[data-cursor='project']")) setMode("project");
      else if (target.closest("button, [data-cursor='button']")) setMode("button");
      else if (target.closest("a, [data-cursor='link']")) setMode("link");
      else setMode("default");
    };

    const onLeave = () => {
      visible = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };

    const loop = () => {
      rx = lerp(rx, mouseState.x, 0.16);
      ry = lerp(ry, mouseState.y, 0.16);
      dot.style.left = `${mouseState.x}px`;
      dot.style.top = `${mouseState.y}px`;
      ring.style.left = `${rx}px`;
      ring.style.top = `${ry}px`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100]">
      <div
        ref={dotRef}
        className="pointer-events-none fixed h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent opacity-0 transition-[transform,opacity] duration-200"
        style={{ left: 0, top: 0 }}
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border opacity-0 shadow-[0_0_30px_rgba(94,234,212,0.15)] transition-[width,height,border-color,background,opacity] duration-300"
        style={{ left: 0, top: 0, borderColor: "rgba(232,236,244,0.35)" }}
      >
        <span
          ref={labelRef}
          className="hud-label text-accent opacity-0 transition-opacity duration-200"
        >
          View
        </span>
      </div>
    </div>
  );
}
