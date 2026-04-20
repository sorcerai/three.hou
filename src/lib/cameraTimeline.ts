// Smooth orbital camera helpers. No section snapping, no zoom punches.
// The scene group slowly rotates around Y and drifts in X/Y, giving the
// appearance of a camera orbiting the bullet pattern.

export function orbitRotation(frame: number): [number, number, number] {
  const yAngle = (frame / 1200) * Math.PI * 2; // full orbit every 40s
  const xTilt  = Math.sin(frame / 900) * 0.08;  // subtle vertical tilt
  return [xTilt, yAngle, 0];
}

export function subtleShake(frame: number, bass: number): [number, number] {
  const amt = Math.max(0, bass - 0.55) * 0.06; // only fires on hard kicks, very small
  return [Math.sin(frame * 13.37) * amt, Math.cos(frame * 17.19) * amt];
}
