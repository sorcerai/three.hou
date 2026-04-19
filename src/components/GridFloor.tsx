import { useRef } from 'react';
import * as THREE from 'three';
import { useCurrentFrame } from 'remotion';

// Touhou-stage-5 wireframe tunnel floor. Slowly rotates, subtly pulses with bass.
export function GridFloor({ bass = 0, envelope = 0 }: { bass?: number; envelope?: number }) {
  const frame = useCurrentFrame();
  const ref = useRef<THREE.Mesh>(null);
  if (ref.current) {
    // Rotation speed scales with song energy envelope — slow in intro, faster in climax.
    ref.current.rotation.z = frame * (0.0015 + envelope * 0.004);
    ref.current.position.y = -6 + bass * 0.5;
  }
  return (
    <>
      <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -6, 0]}>
        <planeGeometry args={[80, 80, 32, 32]} />
        <meshBasicMaterial color="#22e1ff" wireframe transparent opacity={0.25} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 10, 0]}>
        <planeGeometry args={[80, 80, 24, 24]} />
        <meshBasicMaterial color="#ff44aa" wireframe transparent opacity={0.12} toneMapped={false} />
      </mesh>
    </>
  );
}
