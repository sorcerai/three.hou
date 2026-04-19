// three.hou — deterministic danmaku engine for Remotion.
//
// Design: spawn events are immutable records keyed by spawnFrame. To get the
// state at frame F, we replay every spawn whose lifetime covers F. There is no
// accumulated mutable state — same input frame always yields same Float32Array.
//
// Storage uses SoA-style typed arrays (preserved from the original BulletSystem
// design) but rebuilt per call rather than mutated incrementally.

import { PATTERNS, type PatternType, type SpawnOptions, type SpawnEvent } from './types';
import { bulletVelocity } from './patterns';

export { PATTERNS };
export type { PatternType, SpawnOptions };

const events: SpawnEvent[] = [];

const DEFAULTS = {
  count: 32,
  speed: 3,
  color: '#ff66cc',
  radius: 0.12,
  spread: Math.PI * 2,
  rings: 1,
  frequency: 1,
  amplitude: 1,
  lifetime: 180,
  direction: [0, -1, 0] as [number, number, number],
};

// Drop spawn events older than `cutoffFrame - maxLifetime` to bound memory.
// Called automatically by updatePatterns; safe to call manually.
function gc(currentFrame: number) {
  const horizon = currentFrame - 600;
  while (events.length > 0 && events[0].spawnFrame + events[0].options.lifetime < horizon) {
    events.shift();
  }
}

export function spawnPattern(
  type: PatternType,
  origin: [number, number, number],
  options: SpawnOptions & { spawnFrame: number },
): void {
  const { spawnFrame, ...rest } = options;
  const merged = { ...DEFAULTS, ...rest } as SpawnEvent['options'];
  // Idempotent: dedupe by (type, spawnFrame, origin) so re-renders don't double-spawn.
  for (const e of events) {
    if (
      e.spawnFrame === spawnFrame &&
      e.type === type &&
      e.origin[0] === origin[0] &&
      e.origin[1] === origin[1] &&
      e.origin[2] === origin[2]
    ) {
      return;
    }
  }
  events.push({ type, origin, spawnFrame, options: merged });
}

export function clearPatterns(): void {
  events.length = 0;
}

// Replay all live patterns up to `currentFrame`. Returns interleaved
// [x,y,z, x,y,z, ...] positions and a parallel colors Float32Array.
export interface DanmakuFrame {
  positions: Float32Array;
  colors: Float32Array;
  count: number;
}

let scratchPos = new Float32Array(0);
let scratchCol = new Float32Array(0);

function ensureCapacity(n: number) {
  if (scratchPos.length < n * 3) {
    scratchPos = new Float32Array(n * 3);
    scratchCol = new Float32Array(n * 3);
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace('#', '');
  const v = parseInt(m.length === 3 ? m.split('').map((c) => c + c).join('') : m, 16);
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
}

export function updatePatterns(currentFrame: number): DanmakuFrame {
  gc(currentFrame);

  // Pre-count live bullets.
  let total = 0;
  for (const e of events) {
    const age = currentFrame - e.spawnFrame;
    if (age < 0 || age > e.options.lifetime) continue;
    total += e.options.count;
  }
  ensureCapacity(Math.max(total, 1));

  let write = 0;
  for (const e of events) {
    const age = currentFrame - e.spawnFrame;
    if (age < 0 || age > e.options.lifetime) continue;
    const { count, speed, spread, rings, frequency, amplitude, direction, color } = e.options;
    const [r, g, b] = hexToRgb(color);
    for (let i = 0; i < count; i++) {
      const [vx, vy, vz] = bulletVelocity(e.type, i, count, age, {
        speed,
        spread,
        rings,
        frequency,
        amplitude,
        direction,
      });
      const w = write * 3;
      scratchPos[w] = e.origin[0] + vx * age * 0.05;
      scratchPos[w + 1] = e.origin[1] + vy * age * 0.05;
      scratchPos[w + 2] = e.origin[2] + vz * age * 0.05;
      scratchCol[w] = r;
      scratchCol[w + 1] = g;
      scratchCol[w + 2] = b;
      write++;
    }
  }

  return { positions: scratchPos, colors: scratchCol, count: write };
}

export function getBulletCount(): number {
  return events.length;
}

// Bullets that fly outside this radius are dropped — prevents them from
// passing through / past the camera and appearing huge.
const MAX_RADIUS = 14;
const MAX_RADIUS_SQ = MAX_RADIUS * MAX_RADIUS;

// Per-color bucketed update — used by the multi-mesh renderer that draws each
// color as its own InstancedMesh (avoids the unreliable vertexColors path).
export function updatePatternsByColor(currentFrame: number): Map<string, Float32Array> {
  gc(currentFrame);
  const buckets = new Map<string, number[]>();
  for (const e of events) {
    const age = currentFrame - e.spawnFrame;
    if (age < 0 || age > e.options.lifetime) continue;
    const { count, speed, spread, rings, frequency, amplitude, direction, color } = e.options;
    let arr = buckets.get(color);
    if (!arr) { arr = []; buckets.set(color, arr); }
    for (let i = 0; i < count; i++) {
      const [vx, vy, vz] = bulletVelocity(e.type, i, count, age, {
        speed, spread, rings, frequency, amplitude, direction,
      });
      const px = e.origin[0] + vx * age * 0.05;
      const py = e.origin[1] + vy * age * 0.05;
      const pz = e.origin[2] + vz * age * 0.05;
      if (px*px + py*py + pz*pz > MAX_RADIUS_SQ) continue;
      arr.push(px, py, pz);
    }
  }
  const result = new Map<string, Float32Array>();
  buckets.forEach((arr, color) => result.set(color, new Float32Array(arr)));
  return result;
}

// Same as above but computed at `currentFrame - trailLag` frames — used to
// render motion-trail ghosts behind each live bullet.
export function updatePatternsByColorAtLag(currentFrame: number, trailLag: number): Map<string, Float32Array> {
  const target = currentFrame - trailLag;
  if (target < 0) return new Map();
  const buckets = new Map<string, number[]>();
  for (const e of events) {
    // Only draw a trail if the live bullet ALSO exists at currentFrame.
    const liveAge = currentFrame - e.spawnFrame;
    if (liveAge < 0 || liveAge > e.options.lifetime) continue;
    const age = target - e.spawnFrame;
    if (age < 0) continue;
    const { count, speed, spread, rings, frequency, amplitude, direction, color } = e.options;
    let arr = buckets.get(color);
    if (!arr) { arr = []; buckets.set(color, arr); }
    for (let i = 0; i < count; i++) {
      const [vx, vy, vz] = bulletVelocity(e.type, i, count, age, {
        speed, spread, rings, frequency, amplitude, direction,
      });
      const px = e.origin[0] + vx * age * 0.05;
      const py = e.origin[1] + vy * age * 0.05;
      const pz = e.origin[2] + vz * age * 0.05;
      if (px*px + py*py + pz*pz > MAX_RADIUS_SQ) continue;
      arr.push(px, py, pz);
    }
  }
  const result = new Map<string, Float32Array>();
  buckets.forEach((arr, color) => result.set(color, new Float32Array(arr)));
  return result;
}
