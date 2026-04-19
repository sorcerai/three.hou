import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useCurrentFrame } from 'remotion';
import { spawnPattern, updatePatternsByColor, clearPatterns, type PatternType } from '../three-hou';
import type { BeatFrame } from '../hooks/useBeatMap';

export interface BeatTrigger {
  pattern: PatternType;
  fromFrame: number;
  toFrame: number;
  origin?: [number, number, number];
  count?: number;
  speed?: number;
  rings?: number;
  orbital?: boolean;
  emitters?: number;
  orbitRadius?: number;
  color?: string;
  // Display color shown this frame — separate from spawn `color` (bucket key)
  // so palette shifts don't remount InstancedMesh or fragment buckets.
  displayColor?: string;
}

interface Props {
  beat: BeatFrame;
  triggers: BeatTrigger[];
  maxBulletsPerColor?: number;
}

const ColorBucket: React.FC<{ color: string; positions: Float32Array; max: number; scale: number; rotation: number }> = ({
  color, positions, max, scale, rotation,
}) => {
  const coreRef = useRef<THREE.InstancedMesh>(null);
  const haloRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = Math.min(positions.length / 3, max);

  // Core sphere + 3x outer halo sharing the same matrices — poor-man's bloom.
  const writeMatrices = (mesh: THREE.InstancedMesh | null, scaleMul: number) => {
    if (!mesh) return;
    for (let i = 0; i < count; i++) {
      dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      dummy.rotation.set(rotation + i * 0.05, rotation * 1.3, 0);
      dummy.scale.setScalar(scale * scaleMul);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.count = count;
    mesh.instanceMatrix.needsUpdate = true;
  };
  writeMatrices(coreRef.current, 1);
  writeMatrices(haloRef.current, 1.7);

  return (
    <>
      <instancedMesh ref={haloRef} args={[undefined, undefined, max]}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.06} blending={THREE.AdditiveBlending} depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={coreRef} args={[undefined, undefined, max]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </instancedMesh>
    </>
  );
};

export function InstancedDanmaku({ beat, triggers, maxBulletsPerColor = 2000 }: Props) {
  const frame = useCurrentFrame();

  useEffect(() => {
    clearPatterns();
    return () => clearPatterns();
  }, []);

  useEffect(() => {
    const baselinePulse = frame % 10 === 0;
    const beatPulse = beat.isBeat && frame % 5 === 0;
    if (!baselinePulse && !beatPulse) return;

    for (const t of triggers) {
      if (frame < t.fromFrame || frame > t.toFrame) continue;
      const intensity = beat.isBeat ? 0.7 + beat.bass * 0.6 : 0.45;
      const emitters = t.orbital ? (t.emitters ?? 5) : 1;
      const orbitR = t.orbitRadius ?? 4.5;

      for (let e = 0; e < emitters; e++) {
        const a = (e / emitters) * Math.PI * 2 + frame * 0.004;
        const tilt = e * 0.4;
        const origin: [number, number, number] = t.orbital
          ? [
              Math.cos(a) * orbitR,
              Math.sin(a) * orbitR * 0.7 + Math.sin(tilt) * 2,
              Math.sin(a * 1.3) * 3 + Math.cos(tilt + frame * 0.003) * 2,
            ]
          : t.origin ?? [0, 0, 0];

        const dx = -origin[0]; const dy = -origin[1]; const dz = -origin[2];
        const dl = Math.sqrt(dx*dx + dy*dy + dz*dz) || 1;

        spawnPattern(t.pattern, origin, {
          spawnFrame: frame,
          count: t.count ?? Math.round(28 + intensity * 30),
          speed: t.speed ?? 1.4 + intensity * 1.6,
          color: t.color ?? '#ff44aa',
          rings: t.rings ?? 1,
          lifetime: 90,
          direction: [dx/dl, dy/dl, dz/dl],
        });
      }
    }
  }, [frame, beat.isBeat, beat.bass, triggers]);

  const buckets = updatePatternsByColor(frame);
  const scale = 0.12 + beat.bass * 0.05;
  const rot = frame * 0.01;

  // Stable base-color set = stable React keys = no remount. Display color
  // comes from each trigger's `displayColor` override (palette shift / drift).
  const bases = useMemo(() => {
    const m = new Map<string, string>();
    for (const t of triggers) m.set(t.color ?? '#ff44aa', t.displayColor ?? t.color ?? '#ff44aa');
    return m;
  }, [triggers]);

  return (
    <>
      {Array.from(bases.entries()).map(([base, display]) => (
        <ColorBucket key={base} color={display}
          positions={buckets.get(base) ?? new Float32Array(0)}
          max={maxBulletsPerColor} scale={scale} rotation={rot} />
      ))}
    </>
  );
}
