---
name: danmaku-designer
description: Touhou-style pattern choreography against the beat map.
---

# Danmaku Designer

## Pattern catalog
| Type | Inspiration | Best for |
|---|---|---|
| `WAVE` | Sakuya | Intros, ambient sections |
| `SPIRAL` | Marisa | Verses, building tension |
| `RING` | Reimu | Chorus / drop |
| `FAN` | Cirno | Forward bursts, pre-chorus |
| `AIMED` | Remilia | Bridges, climax |

## Spawn API
```ts
spawnPattern(PATTERNS.RING, origin, {
  spawnFrame: frame,         // REQUIRED — engine de-dupes on this
  count: 24 + bass * 64,
  speed: 2.5 + bass * 3,
  color: hslByHigh(high),    // hue from high-frequency band
  rings: 1,                  // RING / SPIRAL only
  direction: [0, -1, 0],     // FAN / AIMED only
  lifetime: 120,
});
```

## Choreography rules
- Spawn ONLY inside `useEffect` keyed on `[frame, beat.isBeat, ...]`.
- Use `BeatTrigger[]` windows in `MusicVideo.tsx` — one window per section.
- Density should follow song dynamics: outro RING with `rings: 4-5` on loud climax.

## Forbidden
- Spawning outside an effect (breaks determinism).
- Calling `clearPatterns()` mid-section. Only at unmount or explicit reset.
