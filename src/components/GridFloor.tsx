import { useRef } from 'react';
import * as THREE from 'three';
import { useCurrentFrame } from 'remotion';

// Neon tunnel grid — purely frame-driven, no beat influence.
// Constant scroll + slow spin tied to camera orbit period.
const SCROLL_SPEED = 0.07;
const OPACITY_FLOOR = 0.22;

export function GridFloor() {
  const frame = useCurrentFrame();
  const floorRef = useRef<THREE.Mesh>(null);
  const ceilRef  = useRef<THREE.Mesh>(null);
  const leftRef  = useRef<THREE.Mesh>(null);
  const rightRef = useRef<THREE.Mesh>(null);

  const zScroll = (frame * SCROLL_SPEED) % 40;
  const spin    = (frame / 1200) * Math.PI * 2 * 0.25;

  if (floorRef.current) {
    floorRef.current.position.z = zScroll;
    floorRef.current.rotation.z = spin;
  }
  if (ceilRef.current) {
    ceilRef.current.position.z = -zScroll;
    ceilRef.current.rotation.z = -spin;
  }
  if (leftRef.current)  leftRef.current.position.z  = zScroll * 0.6;
  if (rightRef.current) rightRef.current.position.z = zScroll * 0.6;

  return (
    <>
      <mesh ref={floorRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -6, 0]}>
        <planeGeometry args={[80, 80, 28, 28]} />
        <meshBasicMaterial color="#22e1ff" wireframe transparent opacity={OPACITY_FLOOR} toneMapped={false} />
      </mesh>

      <mesh ref={ceilRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 10, 0]}>
        <planeGeometry args={[80, 80, 20, 20]} />
        <meshBasicMaterial color="#ff44aa" wireframe transparent opacity={OPACITY_FLOOR * 0.5} toneMapped={false} />
      </mesh>

      <mesh ref={leftRef} rotation={[0, Math.PI / 2, 0]} position={[-14, 2, 0]}>
        <planeGeometry args={[80, 16, 28, 8]} />
        <meshBasicMaterial color="#a35cff" wireframe transparent opacity={OPACITY_FLOOR * 0.35} toneMapped={false} />
      </mesh>

      <mesh ref={rightRef} rotation={[0, -Math.PI / 2, 0]} position={[14, 2, 0]}>
        <planeGeometry args={[80, 16, 28, 8]} />
        <meshBasicMaterial color="#a35cff" wireframe transparent opacity={OPACITY_FLOOR * 0.35} toneMapped={false} />
      </mesh>
    </>
  );
}
