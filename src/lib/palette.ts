/** Shared editorial pigment palette (risograph-style) used across DOM + WebGL. */
export const PALETTE = [
  "#df451d", // vermillion (signal)
  "#21509e", // cobalt
  "#cf971c", // ochre
  "#2f7d6b", // viridian
  "#7d3b63", // plum
  "#1b1712", // ink
] as const;

export function randomColor(except?: string): string {
  const options = PALETTE.filter((c) => c !== except);
  return options[Math.floor(Math.random() * options.length)];
}
