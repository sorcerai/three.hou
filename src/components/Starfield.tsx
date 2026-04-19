import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useCurrentFrame } from 'remotion';

// Receding-tunnel starfield. Stars are seeded at random Z and march toward the
// camera; when they pass z > limit they wrap back. Driven by frame so it scrubs.
export function Starfield({ count = 800, depth = 80, color = '#7faaff' }: { count?: number; depth?: number; color?: string }) {
  const frame = useCurrentFrame();
  const ref = useRef<THREE.Points>(null);

  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 8 + Math.random() * 18;
      const a = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = Math.sin(a) * r;
      positions[i * 3 + 2] = -depth + Math.random() * depth;
      seeds[i] = Math.random();
    }
    return { positions, seeds };
  }, [count, depth]);

  const attr = useMemo(() => {
    const a = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
    a.setUsage(THREE.DynamicDrawUsage);
    return a;
  }, [count]);

  // March stars forward by frame, wrap on overshoot.
  for (let i = 0; i < count; i++) {
    const speed = 0.18 + seeds[i] * 0.4;
    let z = positions[i * 3 + 2] + frame * speed;
    z = ((z + depth) % (depth * 2)) - depth;
    attr.array[i * 3] = positions[i * 3];
    attr.array[i * 3 + 1] = positions[i * 3 + 1];
    attr.array[i * 3 + 2] = z;
  }
  attr.needsUpdate = true;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <primitive object={attr} attach="attributes-position" />
      </bufferGeometry>
      <pointsMaterial size={0.08} color={color} transparent opacity={0.8} sizeAttenuation toneMapped={false} />
    </points>
  );
}
