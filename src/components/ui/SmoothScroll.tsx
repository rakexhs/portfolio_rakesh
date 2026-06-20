"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { sceneState, SECTION_ACCENTS, HERO_ACCENT } from "@/lib/scene";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Anchor links route through Lenis for smooth in-page navigation
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>(
        'a[href^="#"]'
      );
      if (!anchor) return;
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target as HTMLElement, { offset: 0 });
      }
    };
    document.addEventListener("click", onClick);

    // --- Feed the shared scene store so the WebGL layer reacts to scroll ---
    const triggers: ScrollTrigger[] = [];

    // Overall page progress, 0 (top) -> 1 (bottom).
    triggers.push(
      ScrollTrigger.create({
        start: 0,
        end: () => ScrollTrigger.maxScroll(window),
        onUpdate: (self) => {
          sceneState.scroll = self.progress;
        },
      })
    );

    // Active-section accent: each section claims the accent while its body is
    // crossing the viewport center, from either scroll direction.
    SECTION_ACCENTS.forEach(({ id, accent }, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: "top center",
          end: "bottom center",
          onEnter: () => (sceneState.accent = accent),
          onEnterBack: () => (sceneState.accent = accent),
          // Scrolling back above the first section returns to the hero accent.
          onLeaveBack: i === 0 ? () => (sceneState.accent = HERO_ACCENT) : undefined,
        })
      );
    });

    ScrollTrigger.refresh();

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      triggers.forEach((t) => t.kill());
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
