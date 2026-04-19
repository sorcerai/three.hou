#!/usr/bin/env node
/**
 * Batch-render a music video for an arbitrary audio file.
 *
 * Usage:
 *   node scripts/render-track.mjs <audio-path> [--title "My Track"] [--out out/foo.mp4] [--draft]
 *
 * The audio is copied into public/ (Remotion requires staticFile-served assets),
 * then `remotion render` is invoked with the copied filename as inputProps.
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
if (args.length === 0 || args[0].startsWith('--')) {
  console.error('usage: render-track <audio-path> [--title "T"] [--out file.mp4] [--draft]');
  process.exit(1);
}
const src = resolve(args[0]);
if (!existsSync(src)) {
  console.error(`not found: ${src}`);
  process.exit(1);
}

const getFlag = (name, dflt) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : dflt;
};
const draft = args.includes('--draft');
const title = getFlag('--title', basename(src).replace(/\.[^.]+$/, ''));

const pubDir = resolve('public');
if (!existsSync(pubDir)) mkdirSync(pubDir);
const staticName = basename(src);
const staticPath = resolve(pubDir, staticName);
if (src !== staticPath) copyFileSync(src, staticPath);

const outDir = resolve('out');
if (!existsSync(outDir)) mkdirSync(outDir);
const defaultOut = resolve(outDir, `${title.replace(/\s+/g, '_')}${draft ? '.draft' : ''}.mp4`);
const out = getFlag('--out', defaultOut);

const props = JSON.stringify({ audioSrc: staticName, trackTitle: title });
const cli = ['remotion', 'render', 'src/index.ts', 'MusicVideo', out,
  '--concurrency=1',
  `--props=${props}`,
  ...(draft ? ['--crf=30', '--width=1280', '--height=720'] : ['--crf=18']),
];

console.log(`→ rendering "${title}" from ${staticName} → ${out}`);
const r = spawnSync('npx', cli, { stdio: 'inherit' });
process.exit(r.status ?? 1);
