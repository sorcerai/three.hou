import * as THREE from 'three';

// Rotates a hex color's hue by `hueShift` (0-1). Used to gradually drift the
// danmaku palette over song time so the scene evolves without new elements.
export function shiftHue(hex: string, hueShift: number): string {
  const c = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  hsl.h = (hsl.h + hueShift) % 1;
  c.setHSL(hsl.h, hsl.s, hsl.l);
  return `#${c.getHexString()}`;
}

// Frame-based drift amount. Full revolution over `loopSec` seconds — sinusoidal
// so the palette breathes instead of continuously rotating.
export function driftAmount(frame: number, fps: number, loopSec = 45, maxShift = 0.08): number {
  const t = (frame / fps) / loopSec;
  return Math.sin(t * Math.PI * 2) * maxShift;
}
