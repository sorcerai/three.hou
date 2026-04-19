import { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, staticFile } from 'remotion';
import { useAudioData, visualizeAudio } from '@remotion/media-utils';

export interface BeatFrame {
  ready: boolean;
  bands: number[] | null;
  bass: number;
  mid: number;
  high: number;
  kick: number;    // sub-bass (kick drum)
  snare: number;   // low-mid (snare / clap body)
  sparkle: number; // very high (hi-hat shimmer)
  isBeat: boolean;
  beatPulse: number;
}

const BAND_COUNT = 32;
const BASS_END = 3;
const MID_END = 11;
const BEAT_THRESHOLD = 0.18;

const mean = (arr: number[], start: number, end: number): number => {
  let s = 0;
  for (let i = start; i < end; i++) s += arr[i];
  return s / Math.max(1, end - start);
};

export function useBeatMap(audioSrc: string): BeatFrame {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audioData = useAudioData(staticFile(audioSrc));

  return useMemo<BeatFrame>(() => {
    if (!audioData) {
      return { ready: false, bands: null, bass: 0, mid: 0, high: 0, kick: 0, snare: 0, sparkle: 0, isBeat: false, beatPulse: 0 };
    }
    const bands = visualizeAudio({ fps, frame, audioData, numberOfSamples: BAND_COUNT });
    const kick = mean(bands, 0, 2);              // sub-bass
    const snare = mean(bands, 2, 5);             // low-mid body
    const bass = mean(bands, 0, BASS_END);
    const mid = mean(bands, BASS_END, MID_END);
    const high = mean(bands, MID_END, BAND_COUNT);
    const sparkle = mean(bands, 20, BAND_COUNT); // hi-hat shimmer
    const isBeat = bass > BEAT_THRESHOLD;
    const beatPulse = Math.min(1, bass / BEAT_THRESHOLD);
    return { ready: true, bands, bass, mid, high, kick, snare, sparkle, isBeat, beatPulse };
  }, [audioData, fps, frame]);
}
