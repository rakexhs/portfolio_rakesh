"use client";

import AnimatedText from "@/components/ui/AnimatedText";

type Props = {
  index: string;
  label: string;
  title: string;
  className?: string;
};

export default function SectionHeading({ index, label, title, className = "" }: Props) {
  return (
    <div className={`mb-14 md:mb-20 ${className}`}>
      <div className="mb-5 flex items-center gap-4">
        <span className="border border-ice/70 px-2 py-1 font-mono text-[11px] leading-none text-ice">
          [{index}]
        </span>
        <span className="hud-label">{label}</span>
        <span className="h-px flex-1 bg-line" aria-hidden="true" />
        <span className="font-mono text-sm leading-none text-accent" aria-hidden="true">
          +
        </span>
      </div>
      <AnimatedText
        as="h2"
        text={title}
        className="font-display text-4xl font-semibold tracking-tight text-ice sm:text-5xl md:text-6xl lg:text-7xl"
      />
    </div>
  );
}
