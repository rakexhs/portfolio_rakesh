"use client";

import { createElement, useRef, type JSX } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Props = {
  text: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  /** "scroll" reveals when entering viewport; "load" plays immediately */
  trigger?: "scroll" | "load";
  delay?: number;
  stagger?: number;
};

/**
 * Word-by-word masked reveal. Each word sits inside an overflow-hidden line
 * and slides up with a stagger — driven by ScrollTrigger or on load.
 */
export default function AnimatedText({
  text,
  as = "span",
  className = "",
  trigger = "scroll",
  delay = 0,
  stagger = 0.045,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const words = el.querySelectorAll<HTMLElement>(".reveal-word");
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(words, { yPercent: 0, opacity: 1 });
        return;
      }
      gsap.set(words, { yPercent: 110, opacity: 0 });
      gsap.to(words, {
        yPercent: 0,
        opacity: 1,
        duration: 0.9,
        ease: "power4.out",
        stagger,
        delay,
        ...(trigger === "scroll"
          ? { scrollTrigger: { trigger: el, start: "top 88%", once: true } }
          : {}),
      });
    },
    { scope: ref }
  );

  return createElement(
    as,
    { className, "aria-label": text },
    <span ref={ref}>
      {text.split(" ").map((word, i) => (
        <span
          key={i}
          className="reveal-line mr-[0.28em] !inline-block align-bottom"
          aria-hidden="true"
        >
          <span className="reveal-word">{word}</span>
        </span>
      ))}
    </span>
  );
}
