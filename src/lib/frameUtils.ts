export const secToFrames = (sec: number, fps: number): number => Math.round(sec * fps);
export const bpmToFrames = (bpm: number, fps: number): number => Math.round((60 / bpm) * fps);

// Returns true on the *exact* beat frames for a given BPM — useful for spawning
// patterns from inside an effect without re-triggering between beats.
export const isBeatFrame = (frame: number, bpm: number, fps: number, offsetFrames = 0): boolean => {
  const period = bpmToFrames(bpm, fps);
  return period > 0 && (frame - offsetFrames) % period === 0;
};
