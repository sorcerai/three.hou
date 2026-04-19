export const PATTERNS = {
  RING: 'RING',
  SPIRAL: 'SPIRAL',
  FAN: 'FAN',
  AIMED: 'AIMED',
  WAVE: 'WAVE',
  SPHERE: 'SPHERE',
  HELIX: 'HELIX',
} as const;

export type PatternType = (typeof PATTERNS)[keyof typeof PATTERNS];

export interface SpawnOptions {
  count?: number;
  speed?: number;
  color?: string;
  radius?: number;
  spread?: number;
  rings?: number;
  frequency?: number;
  amplitude?: number;
  direction?: [number, number, number];
  lifetime?: number;
}

export interface SpawnEvent {
  type: PatternType;
  origin: [number, number, number];
  spawnFrame: number;
  options: Required<Omit<SpawnOptions, 'direction'>> & { direction: [number, number, number] };
}
