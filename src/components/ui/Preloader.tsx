"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { personal } from "@/data/personal";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Cinematic boot sequence: console-style status lines and a progress bar,
 * then the whole overlay lifts away. Skipped under prefers-reduced-motion.
 *
 * Uses gsap.context for cleanup and a safety timeout so React Strict Mode
 * (which mounts effects twice in dev) can never leave the overlay stuck.
 */

// Survives Strict Mode remounts within the same page load.
let bootFinished = false;

export default function Preloader() {
  const [done, setDone] = useState(bootFinished);
  const reduced = useReducedMotion();
  const overlayRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced || bootFinished) {
      setDone(true);
      return;
    }

    document.documentElement.style.overflow = "hidden";

    const finish = () => {
      if (bootFinished) return;
      bootFinished = true;
      document.documentElement.style.overflow = "";
      setDone(true);
    };

    // Hard cap — never block the site if GSAP is interrupted.
    const safety = window.setTimeout(finish, 3200);

    const overlay = overlayRef.current;
    const bar = barRef.current;
    if (!overlay || !bar) {
      finish();
      window.clearTimeout(safety);
      return;
    }

    const ctx = gsap.context(() => {
      const lines = linesRef.current?.children;
      const tl = gsap.timeline({
        onComplete: () => {
          window.clearTimeout(safety);
          finish();
        },
      });

      if (lines && lines.length > 0) {
        tl.fromTo(
          lines,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.3, stagger: 0.18, ease: "power2.out" }
        );
      }

      tl.fromTo(
        bar,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.9, ease: "power3.inOut" },
        0.15
      );

      tl.to(overlay, { yPercent: -100, duration: 0.75, ease: "power4.inOut" }, "+=0.1");
    }, overlay);

    return () => {
      window.clearTimeout(safety);
      document.documentElement.style.overflow = "";
      ctx.revert();
    };
  }, [reduced]);

  if (done || reduced) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-void will-change-transform"
      aria-hidden="true"
    >
      <div ref={linesRef} className="mb-8 flex flex-col gap-2 font-mono text-xs text-fog">
        <span>
          <span className="text-accent">$</span> initializing console…
        </span>
        <span>
          <span className="text-accent">$</span> loading procedural scene…
        </span>
        <span>
          <span className="text-accent">$</span> welcome — {personal.name.toLowerCase()}
        </span>
      </div>
      <div className="h-px w-48 overflow-hidden bg-line">
        <div ref={barRef} className="h-full w-full origin-left scale-x-0 bg-accent" />
      </div>
    </div>
  );
}
