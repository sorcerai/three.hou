---
name: export-pipeline
description: renderMedia + Lambda config. Always sets gl:'angle'.
---

# Export Pipeline

## Local render
```bash
npx remotion render src/Root.tsx MusicVideo out/video.mp4 \
  --props='{"audioSrc":"music.mp3"}' --crf=18 --concurrency=1
```

## Programmatic
```ts
import { renderMedia, selectComposition } from '@remotion/renderer';
const composition = await selectComposition({ serveUrl, id: 'MusicVideo' });
await renderMedia({
  composition, serveUrl, codec: 'h264', outputLocation: 'out/video.mp4',
  chromiumOptions: { gl: 'angle' },        // REQUIRED for Three.js
  crf: 18,
});
```

## Quality presets
| Preset | crf | codec |
|---|---|---|
| 1080p30 default | 18 | h264 |
| Draft | 28 | h264 |
| 4K master | 16 | h264 |

## Common failures
- WebGL context lost → missing `gl: 'angle'`.
- Silent video → no `<Audio>` tag in composition.
- Concurrency > 1 + Three.js → flaky frames; keep `concurrency: 1` until you have GPU instances.
