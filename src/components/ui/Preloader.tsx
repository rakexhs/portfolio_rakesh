"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { personal } from "@/data/personal";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Cinematic boot sequence: console-style status lines and a progress bar,
 * then the whole overlay lifts away. Skipped under prefers-reduced-motion.
 */
export default function Preloader() {
  const [done, setDone] = useState(false);
  const reduced = useReducedMotion();
  const overlayRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    document.documentElement.style.overflow = "hidden";

    const tl = gsap.timeline({
      onComplete: () => {
        document.documentElement.style.overflow = "";
        setDone(true);
      },
    });

    const lines = linesRef.current?.children;
    if (lines) {
      tl.fromTo(
        lines,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.22, ease: "power2.out" }
      );
    }
    tl.fromTo(
      barRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 1.1, ease: "power3.inOut" },
      0.2
    );
    tl.to(overlayRef.current, {
      yPercent: -100,
      duration: 0.9,
      ease: "power4.inOut",
      delay: 0.15,
    });

    return () => {
      document.documentElement.style.overflow = "";
      tl.kill();
    };
  }, [reduced]);

  if (done || reduced) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-void"
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
        <div ref={barRef} className="h-full w-full origin-left bg-accent" />
      </div>
    </div>
  );
}
