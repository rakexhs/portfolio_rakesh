"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MapPin, Terminal, Cpu } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import AnimatedText from "@/components/ui/AnimatedText";
import { personal } from "@/data/personal";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        "[data-about-panel]",
        { opacity: 0, y: 60, rotateX: 6 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true },
        }
      );
      // Gentle parallax drift on the developer card
      gsap.to("[data-about-card]", {
        y: -40,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative mx-auto max-w-7xl px-6 py-28 md:px-10 md:py-40"
      aria-label="About"
    >
      <SectionHeading index="02" label="System Profile" title="About" />

      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
        <div className="space-y-8">
          <AnimatedText
            as="p"
            text={personal.about.intro}
            className="font-display text-2xl font-medium leading-snug text-ice md:text-3xl"
          />
          {personal.about.body.map((paragraph, i) => (
            <p
              key={i}
              data-about-panel
              className="max-w-2xl text-base leading-relaxed text-fog md:text-lg"
            >
              {paragraph}
            </p>
          ))}

          <div data-about-panel className="flex flex-wrap gap-2 pt-2">
            {personal.about.interests.map((interest) => (
              <span
                key={interest}
                className="rounded-full border border-line px-4 py-1.5 font-mono text-xs text-fog transition-colors duration-300 hover:border-accent hover:text-accent"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Developer card */}
        <div data-about-panel data-about-card className="lg:pt-8">
          <div className="panel-glass rounded-2xl p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
              <span className="hud-label !text-accent">{"// developer_card"}</span>
              <span className="flex gap-1.5" aria-hidden="true">
                <span className="h-2 w-2 rounded-full bg-line" />
                <span className="h-2 w-2 rounded-full bg-line" />
                <span className="h-2 w-2 rounded-full bg-accent/60" />
              </span>
            </div>

            <dl className="space-y-5 font-mono text-sm">
              <div className="flex items-start gap-3">
                <Terminal size={15} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <dt className="hud-label mb-1">Identity</dt>
                  <dd className="text-ice">{personal.name}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Cpu size={15} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <dt className="hud-label mb-1">Role</dt>
                  <dd className="text-ice">{personal.role}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={15} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <dt className="hud-label mb-1">Location</dt>
                  <dd className="text-ice">{personal.location}</dd>
                </div>
              </div>
              <div className="border-t border-line pt-4">
                <dt className="hud-label mb-2">Status</dt>
                <dd className="flex items-center gap-2 text-accent">
                  <span className="inline-block h-1.5 w-1.5 animate-blink rounded-full bg-accent" />
                  {personal.availability}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
