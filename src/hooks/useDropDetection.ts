import { useMemo } from 'react';
import { useVideoConfig, staticFile } from 'remotion';
import { useAudioData, visualizeAudio } from '@remotion/media-utils';

// Precomputes a bass envelope over the entire track at bundle time, then uses a
// rolling mean to detect song drops — bass spikes above 1.7× the rolling mean.
// Returns an array of drop frames (sorted). Deterministic.

export interface DropInfo {
  dropFrames: number[];        // frames where drops start
  sectionIndex: number;        // which section current frame belongs to
  sectionStartFrame: number;
  envelope: number;            // smoothed bass energy at current frame, 0-1
}

const ROLLING_WINDOW_SEC = 4;
const DROP_RATIO = 2.3;
const MIN_GAP_SEC = 40; // minimum distance between detected drops

export function useDropDetection(audioSrc: string, currentFrame: number): DropInfo {
  const { fps } = useVideoConfig();
  const audioData = useAudioData(staticFile(audioSrc));

  // Precompute bass envelope + drop frames for the whole track. Memoized on
  // audioData reference so it runs once per bundle.
  const { dropFrames, envelopeArr } = useMemo(() => {
    if (!audioData) return { dropFrames: [] as number[], envelopeArr: new Float32Array(0) };

    const sampleRate = audioData.sampleRate;
    const totalSamples = audioData.channelWaveforms[0].length;
    const durationSec = totalSamples / sampleRate;
    const totalFrames = Math.floor(durationSec * fps);

    // Per-frame bass value (indices 0-2 of a 32-band FFT).
    const bass = new Float32Array(totalFrames);
    for (let f = 0; f < totalFrames; f += 1) {
      const bands = visualizeAudio({ fps, frame: f, audioData, numberOfSamples: 32 });
      bass[f] = (bands[0] + bands[1] + bands[2]) / 3;
    }

    // Rolling mean window.
    const win = Math.max(1, Math.round(ROLLING_WINDOW_SEC * fps));
    const rolling = new Float32Array(totalFrames);
    let sum = 0;
    for (let f = 0; f < totalFrames; f++) {
      sum += bass[f];
      if (f >= win) sum -= bass[f - win];
      rolling[f] = sum / Math.min(f + 1, win);
    }

    // Detect drops: bass > DROP_RATIO × rolling mean, with min gap.
    const drops: number[] = [];
    const minGap = MIN_GAP_SEC * fps;
    for (let f = win; f < totalFrames; f++) {
      if (rolling[f] > 0.05 && bass[f] > rolling[f] * DROP_RATIO) {
        if (drops.length === 0 || f - drops[drops.length - 1] > minGap) {
          drops.push(f);
        }
      }
    }
    // Global intensity envelope: rolling mean normalized to track-global peak.
    let peak = 0;
    for (let f = 0; f < totalFrames; f++) if (rolling[f] > peak) peak = rolling[f];
    const envelopeArr = new Float32Array(totalFrames);
    for (let f = 0; f < totalFrames; f++) envelopeArr[f] = peak > 0 ? rolling[f] / peak : 0;

    return { dropFrames: drops, envelopeArr };
  }, [audioData, fps]);

  // Which section are we in right now?
  let sectionIndex = 0;
  let sectionStartFrame = 0;
  for (let i = 0; i < dropFrames.length; i++) {
    if (dropFrames[i] <= currentFrame) {
      sectionIndex = i + 1;
      sectionStartFrame = dropFrames[i];
    } else break;
  }

  const envelope = envelopeArr[Math.min(currentFrame, envelopeArr.length - 1)] ?? 0;
  return { dropFrames, sectionIndex, sectionStartFrame, envelope };
}
