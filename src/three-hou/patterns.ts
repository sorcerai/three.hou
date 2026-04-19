import { PATTERNS, type PatternType } from './types';

// Returns a 3D velocity for bullet `i` of `count`. Patterns now use Z-axis to
// avoid the flat-plane look. `age` lets time-varying patterns animate.
export function bulletVelocity(
  type: PatternType,
  i: number,
  count: number,
  age: number,
  opts: {
    speed: number;
    spread: number;
    rings: number;
    frequency: number;
    amplitude: number;
    direction: [number, number, number];
  },
): [number, number, number] {
  const { speed, spread, rings, frequency, amplitude, direction } = opts;

  switch (type) {
    case PATTERNS.RING: {
      const ring = Math.floor(i / Math.max(1, Math.floor(count / rings)));
      const perRing = Math.ceil(count / rings);
      const idx = i % perRing;
      const a = (idx / perRing) * Math.PI * 2;
      const s = speed * (1 + ring * 0.25);
      // Tilt successive rings in Z so they form a stack of disks.
      const zTilt = (ring - (rings - 1) / 2) * 0.4;
      return [Math.cos(a) * s, Math.sin(a) * s, zTilt * s * 0.3];
    }
    case PATTERNS.SPIRAL: {
      const a = (i / count) * spread + age * 0.04;
      // Helical Z drift outward.
      return [Math.cos(a) * speed, Math.sin(a) * speed, ((i % 2) - 0.5) * speed * 0.6];
    }
    case PATTERNS.FAN: {
      const halfSpread = spread / 2;
      const a = -halfSpread + (i / Math.max(1, count - 1)) * spread;
      const baseAngle = Math.atan2(direction[1], direction[0]);
      const ang = baseAngle + a;
      // Z fan: arc out of the plane based on i.
      const zArc = Math.sin((i / count) * Math.PI) * speed * 0.7;
      return [Math.cos(ang) * speed, Math.sin(ang) * speed, zArc];
    }
    case PATTERNS.AIMED: {
      const jitter = ((i / count) - 0.5) * 0.2;
      const baseAngle = Math.atan2(direction[1], direction[0]) + jitter;
      const zJitter = ((i % 5) - 2) * 0.3;
      return [Math.cos(baseAngle) * speed, Math.sin(baseAngle) * speed, zJitter];
    }
    case PATTERNS.WAVE: {
      const a = (i / count) * Math.PI * 2;
      const wave = Math.sin(age * 0.1 * frequency + i) * amplitude * 0.05;
      return [Math.cos(a) * speed, Math.sin(a) * speed + wave, Math.cos(a * 2) * speed * 0.5];
    }
    case PATTERNS.SPHERE: {
      // Fibonacci sphere distribution — uniform points on a sphere surface.
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const sx = Math.sin(phi) * Math.cos(theta);
      const sy = Math.sin(phi) * Math.sin(theta);
      const sz = Math.cos(phi);
      return [sx * speed, sy * speed, sz * speed];
    }
    case PATTERNS.HELIX: {
      const turns = 4;
      const a = (i / count) * Math.PI * 2 * turns;
      const r = 1 + (i / count) * 0.3;
      return [Math.cos(a) * speed * r, Math.sin(a) * speed * r, ((i / count) - 0.5) * speed * 4];
    }
    case PATTERNS.NUCLEAR: {
      const a = (i / count) * Math.PI * 2 * spread;
      const glitch = Math.sin(age * 0.8 * frequency + (i * 13.37)) * amplitude * 0.5;
      const r = speed * (1 + glitch);
      const zChaos = Math.sin(i * 99.99) * speed * 3;
      return [Math.cos(a) * r, Math.sin(a) * r, zChaos + (Math.cos(age * 0.1) * 0.5)];
    }
  }
}
