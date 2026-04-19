---
name: timeline-architect
description: Converts brief.md timestamps to frames; populates triggers in MusicVideo.tsx.
---

# Timeline Architect

## Role
Read `brief.md`. Produce `BeatTrigger[]` for `<DanmakuLayer>`.

## Pattern
```ts
import { secToFrames } from '../lib/frameUtils';
const triggers: BeatTrigger[] = [
  { pattern: PATTERNS.WAVE, fromFrame: secToFrames(0, fps), toFrame: secToFrames(15, fps) },
  // ...
];
```

## Rules
- All timestamps → frames via `secToFrames(sec, fps)`.
- One trigger per section. Overlapping windows are allowed (multi-pattern moments).
- Default fps = 30. If brief specifies otherwise, update `Root.tsx` Composition.
