"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SectionHeading from "@/components/ui/SectionHeading";
import { personal } from "@/data/personal";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const groups = [
  {
    label: "Core",
    items: personal.skills.core,
    labelClass: "!text-accent",
    chipClass:
      "border-accent/50 text-accent hover:bg-accent hover:text-void",
  },
  {
    label: "Frontend & Interactive",
    items: personal.skills.frontend,
    labelClass: "!text-sky-glow",
    chipClass:
      "border-sky-glow/50 text-sky-glow hover:bg-sky-glow hover:text-void",
  },
  {
    label: "Engineering",
    items: personal.skills.engineering,
    labelClass: "!text-amber-glow",
    chipClass:
      "border-amber-glow/50 text-amber-glow hover:bg-amber-glow hover:text-void",
  },
  {
    label: "Exploring",
    items: personal.skills.exploring,
    labelClass: "!text-magenta-glow",
    chipClass:
      "border-magenta-glow/50 text-magenta-glow hover:bg-magenta-glow hover:text-void",
  },
];

function Chip({ skill, chipClass }: { skill: string; chipClass: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  // Magnetic micro-pull on each chip
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(hover: none), (prefers-reduced-motion: reduce)").matches)
      return;
    const rect = el.getBoundingClientRect();
    gsap.to(el, {
      x: (e.clientX - rect.left - rect.width / 2) * 0.3,
      y: (e.clientY - rect.top - rect.height / 2) * 0.3,
      duration: 0.4,
      ease: "power2.out",
    });
  };
  const onLeave = () => {
    if (ref.current)
      gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
  };

  return (
    <span
      ref={ref}
      data-skill-chip
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`inline-block cursor-default rounded-full border px-5 py-2.5 font-mono text-sm transition-colors duration-300 ${chipClass}`}
    >
      {skill}
    </span>
  );
}

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.utils.toArray<HTMLElement>("[data-skill-group]").forEach((group, gi) => {
        const chips = group.querySelectorAll("[data-skill-chip]");
        gsap.fromTo(
          chips,
          { opacity: 0, y: 30, scale: 0.85 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "back.out(1.6)",
            stagger: 0.05,
            scrollTrigger: { trigger: group, start: "top 85%", once: true },
            delay: gi * 0.05,
          }
        );
      });
      // Slow parallax between columns for depth
      gsap.to("[data-skill-col-b]", {
        y: -50,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.4,
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="relative mx-auto max-w-7xl px-6 py-28 md:px-10 md:py-40"
      aria-label="Skills and tech stack"
    >
      <SectionHeading index="03" label="Capabilities" title="Tech Stack" />

      <div className="grid gap-12 md:grid-cols-2 md:gap-x-16">
        {groups.map((group, i) => (
          <div
            key={group.label}
            data-skill-group
            {...(i % 2 === 1 ? { "data-skill-col-b": "" } : {})}
            className="panel-glass rounded-2xl p-7 md:p-9"
          >
            <h3 className={`hud-label mb-6 ${group.labelClass}`}>
              {String(i + 1).padStart(2, "0")} / {group.label}
            </h3>
            <div className="flex flex-wrap gap-3">
              {group.items.map((skill) => (
                <Chip key={skill} skill={skill} chipClass={group.chipClass} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
