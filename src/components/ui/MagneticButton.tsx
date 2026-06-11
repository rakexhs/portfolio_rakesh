"use client";

import {
  useRef,
  useEffect,
  type ReactNode,
  type AnchorHTMLAttributes,
} from "react";
import gsap from "gsap";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  strength?: number;
  variant?: "solid" | "ghost";
};

/**
 * Anchor with a magnetic pull: within hover range the element eases toward
 * the pointer, then springs back on leave. Disabled automatically for touch
 * and reduced-motion users.
 */
export default function MagneticButton({
  children,
  strength = 0.35,
  variant = "ghost",
  className = "",
  ...rest
}: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const inner = innerRef.current;
    if (!el || !inner) return;
    if (window.matchMedia("(hover: none), (prefers-reduced-motion: reduce)").matches)
      return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
    const xToInner = gsap.quickTo(inner, "x", { duration: 0.6, ease: "power3.out" });
    const yToInner = gsap.quickTo(inner, "y", { duration: 0.6, ease: "power3.out" });

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      xTo(dx * strength);
      yTo(dy * strength);
      xToInner(dx * strength * 0.4);
      yToInner(dy * strength * 0.4);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
      xToInner(0);
      yToInner(0);
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength]);

  const base =
    "group inline-flex items-center gap-2 rounded-full px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] transition-colors duration-300";
  const styles =
    variant === "solid"
      ? "bg-accent text-void hover:bg-ice"
      : "border border-line text-ice hover:border-accent hover:text-accent";

  return (
    <a
      ref={ref}
      data-cursor="button"
      className={`${base} ${styles} ${className}`}
      {...rest}
    >
      <span ref={innerRef} className="inline-flex items-center gap-2">
        {children}
      </span>
    </a>
  );
}
