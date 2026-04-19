# three.hou Animation Studio

Automated **Touhou-style danmaku music visualizer** for Suno-generated tracks.
Remotion v4 renders the video; React Three Fiber draws the bullets; `@remotion/media-utils`
makes everything react to the audio. Output: 1080p MP4, ready for YouTube.

## Stack
| Layer | Tech |
|---|---|
| Renderer | Remotion v4 |
| 3D + particles | React Three Fiber + `@remotion/three` |
| Audio | `@remotion/media-utils` (`useAudioData` + `visualizeAudio`) |
| Danmaku | `src/three-hou/` — deterministic SoA particle engine |

## Golden Rules (NEVER violate)
1. **`useCurrentFrame()` is the only timer.** No `Date.now`, `setTimeout`, `setInterval`, R3F `useFrame`.
2. **OpenGL = `angle`** in `remotion.config.ts` and any `renderMedia({chromiumOptions:{gl:'angle'}})`.
3. **`<ThreeCanvas>` needs explicit `width` / `height`** props.
4. **`<Sequence>` inside `<ThreeCanvas>` requires `layout="none"`**.
5. **`useAudioData(staticFile('music.mp3'))`** — bare paths 404.
6. **`numberOfSamples` must be a power of 2** (16/32/64/128).
7. **`<Audio src={...} />`** must be in the composition or the MP4 has no sound.
8. **three.hou determinism**: spawn calls live inside `useEffect([frame])`; engine de-dupes by `(type, spawnFrame, origin)`.

## Audio Band Map (32 samples)
- `0–2` bass — kick / sub → beat detection (`bass > 0.55` triggers spawn)
- `3–10` mid — synths / vocals → modulation
- `11–31` high — hats / shimmer → HSL hue shift on bullet color

## three.hou Engine
```ts
import { spawnPattern, updatePatterns, clearPatterns, PATTERNS } from '@three-hou/index';

spawnPattern(PATTERNS.RING, [0,0,0], {
  spawnFrame: frame, count: 64, speed: 4, color: '#ff66cc', rings: 3,
});
const { positions, colors, count } = updatePatterns(frame); // Float32Array
```
Patterns: `RING` (Reimu), `SPIRAL` (Marisa), `FAN` (Cirno), `AIMED` (Remilia), `WAVE` (Sakuya).

## File Map
```
src/Root.tsx                    Compositions registered here
src/compositions/MusicVideo.tsx Main Touhou-style danmaku visualizer
src/compositions/AudioVisualizer.tsx Spectrum-ring sanity check
src/components/DanmakuLayer.tsx Beat → spawnPattern wiring + Points renderer
src/hooks/useBeatMap.ts         Audio → {bass, mid, high, isBeat}
src/three-hou/                  Deterministic particle engine
src/lib/frameUtils.ts           secToFrames, bpmToFrames, isBeatFrame
public/music.mp3                Drop your Suno track here
.claude/skills/                 Per-agent SKILL.md files
```

## Agents
| Agent | Skill | Trigger |
|---|---|---|
| Scene Director | `.claude/skills/scene-director/SKILL.md` | "Make a video about X" |
| Timeline Architect | `.claude/skills/timeline-architect/SKILL.md` | After brief.md exists |
| Audio Engineer | `.claude/skills/audio-engineer/SKILL.md` | Audio reactivity work |
| Danmaku Designer | `.claude/skills/danmaku-designer/SKILL.md` | Pattern choreography |
| Export Pipeline | `.claude/skills/export-pipeline/SKILL.md` | Final render |

## Quick Start
```bash
npm install
cp ~/your-suno-track.mp3 public/music.mp3
npm start                      # Remotion Studio at localhost:3000
npm run render                 # → out/video.mp4
```

## Common Errors
| Symptom | Fix |
|---|---|
| Black canvas in Studio | Add `width={width} height={height}` to `<ThreeCanvas>` |
| Audio always null | Wrap path in `staticFile()` |
| WebGL crash on render | Confirm `Config.setChromiumOpenGlRenderer('angle')` |
| Frequencies throw | `numberOfSamples` must be power of 2 |
| No audio in MP4 | Add `<Audio src={staticFile(...)}/>` to composition |
