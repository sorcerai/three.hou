export interface CameraState {
  posX: number; posY: number; posZ: number;
}

// One camera rig per song section. Drop detection picks the target rig; we
// lerp smoothly from the prior rig over TRANSITION_FRAMES (feels like a cut
// with a cinematic push-in rather than a jump).
const SECTION_CAMERAS: CameraState[] = [
  { posX: 0,  posY: 0, posZ: 14 },   // intro: wide / back
  { posX: 0,  posY: 0, posZ: 8  },   // chorus: close & centered
  { posX: 6,  posY: 2, posZ: 10 },   // bridge: orbit sideways
  { posX: 0,  posY: 0, posZ: 18 },   // climax: pulled way back
];

const TRANSITION_FRAMES = 30;
const ease = (t: number) => t * t * (3 - 2 * t);

export function cameraForSection(
  sectionIndex: number,
  frame: number,
  sectionStartFrame: number,
): CameraState {
  const target = SECTION_CAMERAS[sectionIndex % SECTION_CAMERAS.length];
  if (sectionIndex === 0) return target;
  const prev = SECTION_CAMERAS[(sectionIndex - 1) % SECTION_CAMERAS.length];
  const t = Math.min(1, (frame - sectionStartFrame) / TRANSITION_FRAMES);
  const u = ease(t);
  return {
    posX: prev.posX + (target.posX - prev.posX) * u,
    posY: prev.posY + (target.posY - prev.posY) * u,
    posZ: prev.posZ + (target.posZ - prev.posZ) * u,
  };
}

// Extra offset applied for the first N frames after a drop — a "shove" that
// sells the section change.
export function dropTransitionOffset(frame: number, sectionStartFrame: number): { fovShift: number; zShift: number } {
  if (sectionStartFrame === 0) return { fovShift: 0, zShift: 0 };
  const age = frame - sectionStartFrame;
  if (age < 0 || age > 15) return { fovShift: 0, zShift: 0 };
  const t = 1 - age / 15;          // 1 → 0 over 15 frames
  const impulse = ease(t);
  return { fovShift: -12 * impulse, zShift: -3 * impulse };
}
