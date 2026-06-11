/**
 * Module-level mouse store. A single pointermove listener (mounted in
 * CustomCursor) writes here; consumers (R3F useFrame loops, cursor lerp)
 * read directly without triggering React re-renders.
 */
export const mouseState = {
  /** Raw pixel coordinates */
  x: 0,
  y: 0,
  /** Normalized to [-1, 1], y up (WebGL convention) */
  nx: 0,
  ny: 0,
  /** Lerped normalized values, smoothed inside the R3F frame loop */
  snx: 0,
  sny: 0,
  active: false,
};

export function updateMouse(clientX: number, clientY: number) {
  mouseState.x = clientX;
  mouseState.y = clientY;
  mouseState.nx = (clientX / window.innerWidth) * 2 - 1;
  mouseState.ny = -((clientY / window.innerHeight) * 2 - 1);
  mouseState.active = true;
}
