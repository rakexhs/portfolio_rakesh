"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SectionHeading from "@/components/ui/SectionHeading";
import ProjectCard from "@/components/ui/ProjectCard";
import type { Project } from "@/lib/github";
import { personal } from "@/data/personal";
import { PALETTE } from "@/lib/palette";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Projects({ projects }: { projects: Project[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const featured = projects.find((p) => p.featured) ?? projects[0];
  const rest = projects.filter((p) => p !== featured);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        // Spatial entrance: cards rise from depth with rotation, not a flat fade
        gsap.utils
          .toArray<HTMLElement>("[data-project-item]")
          .forEach((item, i) => {
            gsap.fromTo(
              item,
              {
                opacity: 0,
                y: 110,
                z: -180,
                rotateX: 14,
                scale: 0.92,
                transformPerspective: 1000,
              },
              {
                opacity: 1,
                y: 0,
                z: 0,
                rotateX: 0,
                scale: 1,
                duration: 1.1,
                ease: "power3.out",
                scrollTrigger: { trigger: item, start: "top 85%", once: true },
                delay: (i % 2) * 0.12,
              }
            );
            // Alternating vertical parallax drift while scrolling through
            gsap.to(item, {
              y: i % 2 === 0 ? -36 : -72,
              ease: "none",
              scrollTrigger: {
                trigger: item,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.2,
              },
            });
          });
      });

      mm.add("(max-width: 767px)", () => {
        // Lighter treatment on mobile
        gsap.utils.toArray<HTMLElement>("[data-project-item]").forEach((item) => {
          gsap.fromTo(
            item,
            { opacity: 0, y: 48 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power2.out",
              scrollTrigger: { trigger: item, start: "top 90%", once: true },
            }
          );
        });
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="work"
      className="relative mx-auto max-w-7xl px-6 py-28 md:px-10 md:py-40"
      aria-label="Projects"
    >
      <SectionHeading index="01" label="Selected Work" title="Projects" />

      <div style={{ perspective: "1400px" }}>
        {featured && (
          <div data-project-item className="mb-8 md:mb-12">
            <ProjectCard project={featured} featured tint={PALETTE[0]} />
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          {rest.map((project, i) => (
            <div key={project.name} data-project-item>
              <ProjectCard
                project={project}
                tint={PALETTE[(i + 1) % PALETTE.length]}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-14 flex justify-center">
        <a
          href={personal.github}
          target="_blank"
          rel="noopener noreferrer"
          className="hud-label !text-fog transition-colors duration-300 hover:!text-accent"
        >
          → Full archive on GitHub
        </a>
      </div>
    </section>
  );
}
