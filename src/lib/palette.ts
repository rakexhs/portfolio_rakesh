/** Shared playful accent palette used across DOM and WebGL. */
export const PALETTE = [
  "#5eead4", // teal
  "#38bdf8", // sky
  "#a78bfa", // violet
  "#e879f9", // magenta
  "#fb7185", // coral
  "#fbbf24", // amber
] as const;

export function randomColor(except?: string): string {
  const options = PALETTE.filter((c) => c !== except);
  return options[Math.floor(Math.random() * options.length)];
}
