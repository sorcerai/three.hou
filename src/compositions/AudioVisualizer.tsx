import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useBeatMap } from '../hooks/useBeatMap';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

// Minimal pure-spectrum visualizer — no danmaku. A radial bar ring driven by
// the 32-band frequency map. Useful as a sanity check for audio reactivity.
const SpectrumRing: React.FC<{ src: string }> = ({ src }) => {
  const beat = useBeatMap(src);
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colors = useMemo(() => new Float32Array(32 * 3), []);

  if (beat.ready && beat.bands && ref.current) {
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * Math.PI * 2;
      const r = 4;
      const h = 0.2 + beat.bands[i] * 5;
      dummy.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      dummy.scale.set(0.25, h, 0.25);
      dummy.lookAt(0, 0, 0);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
      const c = new THREE.Color().setHSL(i / 32, 1, 0.55);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) {
      ref.current.instanceColor.array.set(colors);
      ref.current.instanceColor.needsUpdate = true;
    } else {
      ref.current.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
    }
  }

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, 32]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial vertexColors toneMapped={false} />
    </instancedMesh>
  );
};

const Spinner: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <group rotation={[0.4, frame * 0.005, 0]}>
      <SpectrumRing src="music.mp3" />
    </group>
  );
};

export const AudioVisualizer: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 60, position: [0, 3, 10] }}>
        <ambientLight intensity={0.5} />
        <Spinner />
      </ThreeCanvas>
      <Html5Audio src={staticFile('music.mp3')} />
    </AbsoluteFill>
  );
};
