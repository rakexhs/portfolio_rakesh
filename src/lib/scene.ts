/**
 * Module-level scene store. ScrollTrigger (set up in SmoothScroll) writes
 * here; the R3F useFrame loops read it directly without triggering React
 * re-renders — same pattern as the mouse store. Keeps UI scroll state and the
 * 3D scene in sync cheaply.
 */
import { PALETTE } from "@/lib/palette";

export const sceneState = {
  /** Overall page scroll progress, 0 (top) -> 1 (bottom). */
  scroll: 0,
  /** Accent hex of the section currently in view. */
  accent: PALETTE[0] as string,
};

/** Section id -> accent, in document order. "top"/hero falls back to teal. */
export const SECTION_ACCENTS: { id: string; accent: string }[] = [
  { id: "work", accent: PALETTE[1] }, // sky
  { id: "about", accent: PALETTE[2] }, // violet
  { id: "skills", accent: PALETTE[3] }, // magenta
  { id: "journey", accent: PALETTE[4] }, // coral
  { id: "contact", accent: PALETTE[5] }, // amber
];

export const HERO_ACCENT = PALETTE[0] as string; // teal
