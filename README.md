# three.hou — Touhou Danmaku Music Visualizer

Automated YouTube music visualizer for Suno-generated (or any) tracks.
Touhou-style bullet-hell patterns, frame-perfect audio reactivity, MP4 out.

Built on Remotion v4 + React Three Fiber + a custom deterministic danmaku engine.

## Quick start

```bash
npm install
cp ~/your-suno-track.mp3 public/music.mp3
npm start                  # Remotion Studio (preview)
npm run render             # MP4 → out/video.mp4
```

## What's inside

| Path | What |
|---|---|
| `src/three-hou/` | Deterministic SoA danmaku engine (RING/SPIRAL/FAN/AIMED/WAVE) |
| `src/hooks/useBeatMap.ts` | Audio → `{bass, mid, high, isBeat}` per frame |
| `src/components/DanmakuLayer.tsx` | Beat → `spawnPattern()` → R3F `<points>` |
| `src/compositions/MusicVideo.tsx` | Main 3-min Touhou visualizer |
| `src/compositions/AudioVisualizer.tsx` | Spectrum-ring sanity check |
| `CLAUDE.md` | Full agent + rule brain for Claude Code |
| `.claude/skills/` | Per-role SKILL.md files |

## Patterns

| Pattern | Inspiration | Use |
|---|---|---|
| `RING` | Reimu | Chorus / drop |
| `SPIRAL` | Marisa | Verses |
| `FAN` | Cirno | Pre-chorus bursts |
| `AIMED` | Remilia | Bridges |
| `WAVE` | Sakuya | Intros / outros |

Edit the `triggers` array in `MusicVideo.tsx` to remap section windows.

## Hard rules

- Animation timing comes ONLY from `useCurrentFrame()`. No real-time clocks.
- `Config.setChromiumOpenGlRenderer('angle')` is set in `remotion.config.ts` — don't change.
- `numberOfSamples` for `visualizeAudio()` must be a power of 2.
- Audio paths go through `staticFile()`.

See `CLAUDE.md` for the full rule set.
