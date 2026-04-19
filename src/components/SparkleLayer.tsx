import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useCurrentFrame } from 'remotion';

// Tiny additive specks reactive to hi-hat shimmer. Points are seeded once and
// drift slowly; opacity = `sparkle` so they only appear during busy high-freq
// content (hi-hats, cymbals).
export function SparkleLayer({ sparkle = 0, count = 180 }: { sparkle?: number; count?: number }) {
  const frame = useCurrentFrame();
  const ref = useRef<THREE.Points>(null);

  const seeds = useMemo(() => {
    const s = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 7;
      const a = Math.random() * Math.PI * 2;
      const z = (Math.random() - 0.5) * 10;
      s[i * 3] = Math.cos(a) * r;
      s[i * 3 + 1] = (Math.random() - 0.5) * 8;
      s[i * 3 + 2] = z;
    }
    return s;
  }, [count]);

  const attr = useMemo(() => {
    const a = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
    a.setUsage(THREE.DynamicDrawUsage);
    return a;
  }, [count]);

  for (let i = 0; i < count; i++) {
    const drift = Math.sin(frame * 0.02 + i) * 0.3;
    attr.array[i * 3] = seeds[i * 3] + drift;
    attr.array[i * 3 + 1] = seeds[i * 3 + 1] + Math.cos(frame * 0.015 + i) * 0.3;
    attr.array[i * 3 + 2] = seeds[i * 3 + 2];
  }
  attr.needsUpdate = true;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <primitive object={attr} attach="attributes-position" />
      </bufferGeometry>
      <pointsMaterial
        size={2.5}
        color="#ffffff"
        transparent
        opacity={Math.min(0.9, sparkle * 2.5)}
        sizeAttenuation={false}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  );
}
