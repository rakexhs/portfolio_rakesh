"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SectionHeading from "@/components/ui/SectionHeading";
import { personal } from "@/data/personal";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Journey() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      // Timeline spine draws itself as you scroll
      gsap.fromTo(
        "[data-journey-line]",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-journey-list]",
            start: "top 75%",
            end: "bottom 60%",
            scrub: 0.8,
          },
        }
      );
      gsap.utils.toArray<HTMLElement>("[data-journey-item]").forEach((item) => {
        gsap.fromTo(
          item,
          { opacity: 0, x: -36 },
          {
            opacity: 1,
            x: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: item, start: "top 82%", once: true },
          }
        );
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="journey"
      className="relative mx-auto max-w-7xl px-6 py-28 md:px-10 md:py-40"
      aria-label="Journey"
    >
      <SectionHeading index="04" label="Trajectory" title="Journey" />

      <div data-journey-list className="relative ml-2 md:ml-6">
        <div
          data-journey-line
          className="absolute bottom-0 left-0 top-0 w-px origin-top bg-gradient-to-b from-accent via-line to-transparent"
          aria-hidden="true"
        />
        <ol className="space-y-14 md:space-y-20">
          {personal.journey.map((step) => (
            <li key={step.index} data-journey-item className="relative pl-10 md:pl-16">
              <span
                className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full border border-accent bg-void"
                aria-hidden="true"
              />
              <span className="hud-label !text-accent">{step.index}</span>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ice md:text-3xl">
                {step.title}
              </h3>
              <p className="mt-3 max-w-2xl leading-relaxed text-fog">{step.body}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {step.tags.map((tag) => (
                  <span key={tag} className="font-mono text-xs text-fog">
                    #{tag}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
