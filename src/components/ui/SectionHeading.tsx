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
      <div className="mb-4 flex items-center gap-3">
        <span className="hud-label text-accent">{index}</span>
        <span className="h-px w-10 bg-line" aria-hidden="true" />
        <span className="hud-label">{label}</span>
      </div>
      <AnimatedText
        as="h2"
        text={title}
        className="font-display text-4xl font-semibold tracking-tight text-ice sm:text-5xl md:text-6xl lg:text-7xl"
      />
    </div>
  );
}
