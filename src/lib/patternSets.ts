import type { BeatTrigger } from '../components/InstancedDanmaku';
import { PATTERNS } from '../three-hou';

// 4 pattern sets cycled by drop detection's sectionIndex. Colors are stable
// (bucket keys) across all sets; only pattern types / counts change.
const C = { cyan: '#22e1ff', pink: '#ff44aa', yellow: '#ffd24a', purple: '#a35cff', green: '#5cffb1' };

export function patternSetForSection(section: number, fullDurationFrames: number): BeatTrigger[] {
  const common = { fromFrame: 0, toFrame: fullDurationFrames, orbital: true, emitters: 2 };
  const idx = section % 4;
  switch (idx) {
    case 0: // Intro-like: sparse, gentle
      return [
        { ...common, pattern: PATTERNS.SPHERE, orbitRadius: 5, count: 10, color: C.cyan },
        { ...common, pattern: PATTERNS.WAVE,   orbitRadius: 6, count: 12, color: C.pink },
        { ...common, pattern: PATTERNS.RING,   orbitRadius: 4, count: 12, rings: 2, color: C.yellow },
        { ...common, pattern: PATTERNS.SPIRAL, orbitRadius: 7, count: 10, color: C.purple },
        { ...common, pattern: PATTERNS.HELIX,  orbitRadius: 8, count: 10, color: C.green },
      ];
    case 1: // Chorus-like: ring-dominant
      return [
        { ...common, pattern: PATTERNS.RING,   orbitRadius: 5, count: 16, rings: 3, color: C.cyan },
        { ...common, pattern: PATTERNS.RING,   orbitRadius: 6, count: 14, rings: 2, color: C.pink },
        { ...common, pattern: PATTERNS.SPHERE, orbitRadius: 4, count: 10, color: C.yellow },
        { ...common, pattern: PATTERNS.HELIX,  orbitRadius: 7, count: 12, color: C.purple },
        { ...common, pattern: PATTERNS.RING,   orbitRadius: 8, count: 14, rings: 3, color: C.green },
      ];
    case 2: // Bridge: aimed / fan / attack feel
      return [
        { ...common, pattern: PATTERNS.FAN,    orbitRadius: 5, count: 14, color: C.cyan },
        { ...common, pattern: PATTERNS.AIMED,  orbitRadius: 6, count: 18, color: C.pink },
        { ...common, pattern: PATTERNS.FAN,    orbitRadius: 4, count: 12, color: C.yellow },
        { ...common, pattern: PATTERNS.AIMED,  orbitRadius: 7, count: 16, color: C.purple },
        { ...common, pattern: PATTERNS.SPHERE, orbitRadius: 8, count: 10, color: C.green },
      ];
    default: // Climax: chaos (NUCLEAR MELTDOWN)
      return [
        { ...common, pattern: PATTERNS.NUCLEAR, orbitRadius: 0, count: 48, speed: 6, color: C.pink },
        { ...common, pattern: PATTERNS.NUCLEAR, orbitRadius: 2, count: 32, speed: 4, color: C.cyan },
        { ...common, pattern: PATTERNS.RING,    orbitRadius: 4, count: 24, rings: 4, color: C.yellow },
        { ...common, pattern: PATTERNS.AIMED,   orbitRadius: 7, count: 20, color: C.purple },
        { ...common, pattern: PATTERNS.FAN,     orbitRadius: 8, count: 18, color: C.green },
      ];
  }
}
