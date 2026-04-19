---
name: audio-engineer
description: useBeatMap hook + frequency band wiring.
---

# Audio Engineer

## Hook contract
`useBeatMap(audioSrc)` returns `{ ready, bands, bass, mid, high, isBeat, beatPulse }`.

## Tuning knobs
- `BEAT_THRESHOLD` (default 0.55) — raise for sparse spawns, lower for dense.
- `BAND_COUNT` (32) — must be power of 2.
- Band split: `0..BASS_END=3`, `BASS_END..MID_END=11`, `MID_END..32` highs.

## Forbidden
- Real-time clocks. No `requestAnimationFrame`, no `Date.now()`.
- Bare audio paths — always `staticFile('music.mp3')`.

## Verification
After wiring, render frames 0-300 in Studio scrubber. `bass` should peak on kicks. If always 0 → check `staticFile()` path; if `NaN` → check `numberOfSamples` is power of 2.
