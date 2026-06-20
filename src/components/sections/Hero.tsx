"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowDown } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/icons";
import MagneticButton from "@/components/ui/MagneticButton";
import { personal } from "@/data/personal";
import { randomColor } from "@/lib/palette";

gsap.registerPlugin(useGSAP);

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const tl = gsap.timeline({ delay: 1.9, defaults: { ease: "power4.out" } });
      tl.fromTo(
        "[data-hero-line] .hero-char",
        { yPercent: 115, rotate: 4 },
        { yPercent: 0, rotate: 0, duration: 1.1, stagger: 0.035 }
      )
        .fromTo(
          "[data-hero-meta]",
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 },
          "-=0.6"
        )
        .fromTo(
          "[data-hero-cta]",
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 },
          "-=0.5"
        )
        .fromTo(
          "[data-hero-hud]",
          { opacity: 0 },
          { opacity: 1, duration: 0.9, stagger: 0.1 },
          "-=0.4"
        )
        // Unclip the reveal masks so letters can bounce on hover afterwards
        .set("[data-hero-line] .reveal-line", { overflow: "visible" });
    },
    { scope: sectionRef }
  );

  // Playful per-letter bounce with a random palette color on hover
  useEffect(() => {
    const el = nameRef.current;
    if (!el) return;
    if (window.matchMedia("(hover: none), (prefers-reduced-motion: reduce)").matches)
      return;

    const onOver = (e: MouseEvent) => {
      const char = (e.target as HTMLElement).closest<HTMLElement>(".hero-char");
      if (!char || char.dataset.bouncing) return;
      char.dataset.bouncing = "1";
      gsap
        .timeline({
          onComplete: () => {
            delete char.dataset.bouncing;
            gsap.set(char, { clearProps: "color" });
          },
        })
        .to(char, {
          y: -16,
          rotation: gsap.utils.random(-14, 14),
          scale: 1.12,
          color: randomColor(),
          duration: 0.18,
          ease: "power2.out",
        })
        .to(char, {
          y: 0,
          rotation: 0,
          scale: 1,
          duration: 0.55,
          ease: "bounce.out",
        });
    };

    el.addEventListener("mouseover", onOver);
    return () => el.removeEventListener("mouseover", onOver);
  }, []);

  // Subtle 3D distortion of the name following the cursor
  useEffect(() => {
    const el = nameRef.current;
    if (!el) return;
    if (window.matchMedia("(hover: none), (prefers-reduced-motion: reduce)").matches)
      return;

    const rotX = gsap.quickTo(el, "rotationX", { duration: 0.8, ease: "power3.out" });
    const rotY = gsap.quickTo(el, "rotationY", { duration: 0.8, ease: "power3.out" });

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      rotY(px * 7);
      rotX(-py * 7);
    };
    const onLeave = () => {
      rotX(0);
      rotY(0);
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const renderChars = (word: string) => (
    <span className="reveal-line !inline-block align-bottom">
      {word.split("").map((char, i) => (
        <span key={i} className="hero-char inline-block will-change-transform">
          {char}
        </span>
      ))}
    </span>
  );

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-svh flex-col justify-center overflow-hidden px-6 md:px-10"
      aria-label="Introduction"
    >
      <div className="mx-auto w-full max-w-7xl" style={{ perspective: "1200px" }}>
        <p data-hero-meta className="hud-label mb-6 flex items-center gap-3 !text-accent">
          <span className="inline-block h-1.5 w-1.5 animate-blink rounded-full bg-accent" />
          {personal.role} — {personal.location}
        </p>

        <h1
          ref={nameRef}
          className="font-display text-[clamp(3rem,11vw,9.5rem)] font-bold leading-[0.95] tracking-tighter text-ice will-change-transform"
          style={{ transformStyle: "preserve-3d" }}
        >
          <span data-hero-line className="block">
            {renderChars("Rakesh")}
          </span>
          <span data-hero-line className="text-gradient block">
            {renderChars("Saraswat")}
          </span>
        </h1>

        <p
          data-hero-meta
          className="mt-8 max-w-xl text-base leading-relaxed text-fog md:text-lg"
        >
          {personal.tagline}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <span data-hero-cta>
            <MagneticButton href="#work" variant="solid">
              View Projects
            </MagneticButton>
          </span>
          <span data-hero-cta>
            <MagneticButton href="#contact">Contact Me</MagneticButton>
          </span>
          <span data-hero-cta>
            <MagneticButton
              href={personal.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
            >
              <GithubIcon size={14} aria-hidden /> GitHub
            </MagneticButton>
          </span>
          <span data-hero-cta>
            <MagneticButton
              href={personal.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile"
            >
              <LinkedinIcon size={14} aria-hidden /> LinkedIn
            </MagneticButton>
          </span>
        </div>
      </div>

      <a
        data-hero-hud
        href="#work"
        className="hud-label absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 !text-fog transition-colors hover:!text-accent"
        aria-label="Scroll to projects"
      >
        Scroll to explore
        <ArrowDown size={14} className="animate-bounce" aria-hidden="true" />
      </a>
    </section>
  );
}
