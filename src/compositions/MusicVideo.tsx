import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useRef } from 'react';
import * as THREE from 'three';
import { InstancedDanmaku, type BeatTrigger } from '../components/InstancedDanmaku';
import { NebulaBackground } from '../components/NebulaBackground';
import { Starfield } from '../components/Starfield';
import { GridFloor } from '../components/GridFloor';
import { SparkleLayer } from '../components/SparkleLayer';
import { shiftHue, driftAmount } from '../lib/colorDrift';
import { useDropDetection } from '../hooks/useDropDetection';
import { patternSetForSection } from '../lib/patternSets';
import { useBeatMap } from '../hooks/useBeatMap';
import { secToFrames } from '../lib/frameUtils';
import { cameraForSection, dropTransitionOffset } from '../lib/cameraTimeline';

export type MusicVideoProps = {
  audioSrc: string;
  [key: string]: unknown;
};

const TorusRing: React.FC<{ beat: number }> = ({ beat }) => {
  const frame = useCurrentFrame();
  const ref = useRef<THREE.Mesh>(null);
  if (ref.current) {
    ref.current.rotation.x = frame * 0.012;
    ref.current.rotation.y = frame * 0.018;
    ref.current.scale.setScalar(1 + beat * 0.4);
  }
  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[2.8, 0.18, 220, 16]} />
      <meshBasicMaterial color="#ff66cc" toneMapped={false} wireframe />
    </mesh>
  );
};

const BassHalo: React.FC<{ bass: number }> = ({ bass }) => {
  const ref = useRef<THREE.Mesh>(null);
  if (ref.current) ref.current.scale.setScalar(2 + bass * 4);
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color="#ff44aa" transparent opacity={0.08 + bass * 0.15} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  );
};

const SpellRings: React.FC<{ beat: number }> = ({ beat }) => {
  const frame = useCurrentFrame();
  const refs = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)];
  refs.forEach((r, i) => {
    if (r.current) {
      r.current.rotation.x = frame * 0.005 * (i + 1);
      r.current.rotation.z = frame * 0.008 * (i % 2 === 0 ? 1 : -1);
      r.current.scale.setScalar(1 + beat * 0.2);
    }
  });
  const colors = ['#22e1ff', '#ff66cc', '#ffd24a'];
  return (
    <>
      {[5, 6.5, 8].map((r, i) => (
        <mesh key={i} ref={refs[i]}>
          <torusGeometry args={[r, 0.04, 8, 128]} />
          <meshBasicMaterial color={colors[i]} toneMapped={false} transparent opacity={0.7} />
        </mesh>
      ))}
    </>
  );
};

// Camera rig: section-based position + bass shake + drop-transition push.
const CameraRig: React.FC<{
  children: React.ReactNode;
  bass: number;
  sectionIndex: number;
  sectionStartFrame: number;
}> = ({ children, bass, sectionIndex, sectionStartFrame }) => {
  const frame = useCurrentFrame();
  const cam = cameraForSection(sectionIndex, frame, sectionStartFrame);
  const drop = dropTransitionOffset(frame, sectionStartFrame);
  const shakeAmt = Math.max(0, bass - 0.3) * 0.35;
  const sx = Math.sin(frame * 13.37) * shakeAmt;
  const sy = Math.cos(frame * 17.19) * shakeAmt;
  return (
    <group position={[-cam.posX * 0.3 + sx, -cam.posY * 0.3 + sy, -cam.posZ + 12 + drop.zShift]}>
      {children}
    </group>
  );
};

const SECTION_PALETTES: Record<string, string>[] = [
  { '#22e1ff': '#22e1ff', '#ff44aa': '#ff44aa', '#ffd24a': '#ffd24a', '#a35cff': '#a35cff', '#5cffb1': '#5cffb1' },
  { '#22e1ff': '#5cffb1', '#ff44aa': '#ff8844', '#ffd24a': '#ff44aa', '#a35cff': '#22e1ff', '#5cffb1': '#ffd24a' },
  { '#22e1ff': '#a35cff', '#ff44aa': '#22e1ff', '#ffd24a': '#5cffb1', '#a35cff': '#ff44aa', '#5cffb1': '#ffffff' },
  { '#22e1ff': '#ff2222', '#ff44aa': '#ffffff', '#ffd24a': '#ff8800', '#a35cff': '#ff0055', '#5cffb1': '#ffaa00' },
];

function repaintTriggers(triggers: BeatTrigger[], sectionIndex: number, hueDrift: number): BeatTrigger[] {
  const palette = SECTION_PALETTES[sectionIndex % SECTION_PALETTES.length];
  return triggers.map((t) => {
    const mapped = palette[t.color ?? '#ff44aa'] ?? t.color ?? '#ff44aa';
    return { ...t, displayColor: shiftHue(mapped, hueDrift) };
  });
}

const Scene: React.FC<{ audioSrc: string; durationSec: number }> = ({ audioSrc, durationSec }) => {
  const beat = useBeatMap(audioSrc);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drop = useDropDetection(audioSrc, frame);

  const ALL = secToFrames(durationSec, fps);
  const baseTriggers = patternSetForSection(drop.sectionIndex, ALL);
  const triggers = repaintTriggers(baseTriggers, drop.sectionIndex, driftAmount(frame, fps));

  return (
    <>
      <fog attach="fog" args={['#08020f', 12, 24]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 8]} intensity={3} color="#ff66cc" />
      <pointLight position={[8, -4, 4]} intensity={2} color="#22e1ff" />
      <pointLight position={[-6, 5, 2]} intensity={1.8} color="#a35cff" />

      <NebulaBackground bass={beat.bass} mid={beat.mid} />
      <Starfield count={1500} depth={100} color="#aabbff" />
      <GridFloor bass={beat.kick} envelope={drop.envelope} />
      <SparkleLayer sparkle={beat.sparkle} />

      <CameraRig bass={beat.kick} sectionIndex={drop.sectionIndex} sectionStartFrame={drop.sectionStartFrame}>
        <BassHalo bass={beat.kick} />
        <SpellRings beat={beat.snare} />
        <TorusRing beat={beat.snare * (0.6 + drop.envelope * 0.8)} />
        <InstancedDanmaku beat={beat} triggers={triggers} />
      </CameraRig>
    </>
  );
};

const DURATION_SEC = 180;

const CameraPunchCanvas: React.FC<{ audioSrc: string; width: number; height: number }> = ({ audioSrc, width, height }) => {
  const beat = useBeatMap(audioSrc);
  const frame = useCurrentFrame();
  const drop = useDropDetection(audioSrc, frame);
  const dropImp = dropTransitionOffset(frame, drop.sectionStartFrame);
  const fov = interpolate(beat.kick, [0, 1], [65, 55], { extrapolateRight: 'clamp' }) + dropImp.fovShift;
  const camZ = interpolate(beat.kick, [0, 1], [12, 14], { extrapolateRight: 'clamp' });
  return (
    <ThreeCanvas width={width} height={height} camera={{ fov, position: [0, 0, camZ] }} gl={{ antialias: true }}>
      <Scene audioSrc={audioSrc} durationSec={DURATION_SEC} />
    </ThreeCanvas>
  );
};

const FADE_FRAMES = 45;

export const MusicVideo: React.FC<MusicVideoProps> = ({ audioSrc }) => {
  const { width, height, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  const fade = interpolate(
    frame,
    [0, FADE_FRAMES, durationInFrames - FADE_FRAMES, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  return (
    <AbsoluteFill style={{ background: '#000', opacity: fade }}>
      <CameraPunchCanvas audioSrc={audioSrc} width={width} height={height} />
      <Html5Audio src={staticFile(audioSrc)} />
    </AbsoluteFill>
  );
};
