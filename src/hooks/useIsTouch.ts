"use client";

import { useMediaQuery } from "@/hooks/useMediaQuery";

export function useIsTouch(): boolean {
  return useMediaQuery("(hover: none), (pointer: coarse)");
}
