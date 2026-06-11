"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ArrowUpRight } from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";
import type { Project } from "@/lib/github";

type Props = {
  project: Project;
  featured?: boolean;
  /** Accent color for this card's glow, label, and hover states */
  tint?: string;
};

function hexToRgba(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/**
 * Collectible-card style project tile: tilts in 3D toward the pointer,
 * reveals metadata + actions on hover, and carries the data-cursor hook
 * for the custom cursor "View" state.
 */
export default function ProjectCard({
  project,
  featured = false,
  tint = "#5eead4",
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    if (window.matchMedia("(hover: none), (prefers-reduced-motion: reduce)").matches)
      return;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    gsap.to(card, {
      rotationY: (px - 0.5) * 10,
      rotationX: -(py - 0.5) * 10,
      transformPerspective: 900,
      duration: 0.5,
      ease: "power2.out",
    });
    if (glowRef.current) {
      glowRef.current.style.background = `radial-gradient(420px circle at ${
        px * 100
      }% ${py * 100}%, ${hexToRgba(tint, 0.12)}, transparent 65%)`;
    }
  };

  const onLeave = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.7,
        ease: "elastic.out(1, 0.5)",
      });
    }
    if (glowRef.current) glowRef.current.style.background = "transparent";
  };

  return (
    <div
      ref={cardRef}
      data-cursor="project"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`group relative h-full overflow-hidden rounded-2xl border border-line bg-panel/70 transition-colors duration-500 hover:border-[var(--tint)]/40 ${
        featured ? "p-8 md:p-12" : "p-6 md:p-8"
      }`}
      style={
        {
          transformStyle: "preserve-3d",
          "--tint": tint,
        } as React.CSSProperties
      }
    >
      <div ref={glowRef} className="pointer-events-none absolute inset-0 transition-opacity duration-300" />

      <div className="relative flex h-full flex-col">
        <div className="mb-6 flex items-center justify-between">
          <span className="hud-label" style={{ color: tint }}>
            {project.domain}
          </span>
          {featured && (
            <span className="rounded-full border border-accent/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              Featured
            </span>
          )}
        </div>

        <h3
          className={`font-display font-semibold tracking-tight text-ice transition-colors duration-300 group-hover:text-[var(--tint)] ${
            featured ? "text-3xl md:text-5xl" : "text-xl md:text-2xl"
          }`}
        >
          {project.title}
        </h3>

        <p
          className={`mt-4 leading-relaxed text-fog ${
            featured ? "max-w-xl text-base md:text-lg" : "text-sm"
          }`}
        >
          {project.description}
        </p>

        <div className="mt-auto pt-8">
          <div className="flex items-center gap-3">
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-line px-4 py-2 font-mono text-xs text-ice transition-colors duration-300 hover:border-accent hover:text-accent"
              aria-label={`${project.title} on GitHub`}
            >
              <GithubIcon size={12} aria-hidden /> Code
            </a>
            {project.homepage && (
              <a
                href={project.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 font-mono text-xs text-void transition-colors duration-300 hover:bg-ice"
                aria-label={`${project.title} live demo`}
              >
                Live <ArrowUpRight size={12} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
