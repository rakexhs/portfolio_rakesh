"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/icons";
import AnimatedText from "@/components/ui/AnimatedText";
import MagneticButton from "@/components/ui/MagneticButton";
import { personal } from "@/data/personal";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        "[data-contact-item]",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true },
        }
      );
      // Closing zoom: the whole block settles into place as you arrive
      gsap.fromTo(
        "[data-contact-inner]",
        { scale: 0.94 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "center center",
            scrub: 1,
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative flex min-h-svh flex-col justify-center px-6 py-28 md:px-10"
      aria-label="Contact"
    >
      <div data-contact-inner className="mx-auto w-full max-w-7xl text-center">
        <p data-contact-item className="hud-label mb-8 !text-accent">
          05 / Transmission
        </p>

        <AnimatedText
          as="h2"
          text="Let's build something sharp."
          className="mx-auto block max-w-5xl font-display text-5xl font-bold leading-[1.02] tracking-tighter text-ice sm:text-6xl md:text-8xl"
        />

        <p
          data-contact-item
          className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-fog md:text-lg"
        >
          Open to internship opportunities, collaborations, and good conversations
          about software. The fastest way to reach me is email.
        </p>

        <div
          data-contact-item
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <MagneticButton href={`mailto:${personal.email}`} variant="solid">
            <Mail size={14} aria-hidden="true" /> {personal.email}
          </MagneticButton>
          <MagneticButton
            href={personal.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile"
          >
            <GithubIcon size={14} aria-hidden /> GitHub
          </MagneticButton>
          <MagneticButton
            href={personal.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn profile"
          >
            <LinkedinIcon size={14} aria-hidden /> LinkedIn
          </MagneticButton>
        </div>
      </div>

      <footer
        data-contact-item
        className="mx-auto mt-24 flex w-full max-w-7xl flex-col items-center justify-between gap-3 border-t border-line pt-6 font-mono text-xs text-fog md:flex-row"
      >
        <span>
          © {new Date().getFullYear()} {personal.name}
        </span>
        <span className="hud-label">{personal.location} — procedurally rendered</span>
      </footer>
    </section>
  );
}
