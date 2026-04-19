import { useMemo } from 'react';
import * as THREE from 'three';
import { useCurrentFrame, useVideoConfig } from 'remotion';

// Animated GLSL nebula plane behind everything. Pure fragment shader, no lighting.
// Time uniform is driven by frame so it stays deterministic.
const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uBass;
  uniform float uMid;

  // 2D hash + value noise
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p); vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.,0.));
    float c = hash(i + vec2(0.,1.));
    float d = hash(i + vec2(1.,1.));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a,b,u.x) + (c-a)*u.y*(1.-u.x) + (d-b)*u.x*u.y;
  }
  float fbm(vec2 p){
    float v = 0.0; float a = 0.5;
    for(int i = 0; i < 5; i++){ v += a*noise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    float t = uTime * 0.05;
    vec2 q = uv * 2.0 + vec2(t, -t * 0.7);
    float n = fbm(q + fbm(q + t));
    // Palette lerped by mid-frequency content (vocals / synth lines).
    vec3 magenta = vec3(0.9, 0.2, 0.7);
    vec3 cyan    = vec3(0.2, 0.7, 1.0);
    vec3 violet  = vec3(0.55, 0.25, 0.95);
    vec3 base    = mix(magenta, cyan, n);
    vec3 col     = mix(base, violet, clamp(uMid * 1.6, 0.0, 1.0));
    col *= 0.35 + uBass * 0.6;
    // vignette
    float v = smoothstep(1.4, 0.2, length(uv));
    col *= v;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function NebulaBackground({ bass, mid = 0 }: { bass: number; mid?: number }) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: { uTime: { value: 0 }, uBass: { value: 0 }, uMid: { value: 0 } },
    depthWrite: false,
    depthTest: false,
    toneMapped: false,
  }), []);

  material.uniforms.uTime.value = frame;
  material.uniforms.uBass.value = bass;
  material.uniforms.uMid.value = mid;

  const aspect = width / height;
  return (
    <mesh position={[0, 0, -30]} renderOrder={-1}>
      <planeGeometry args={[60 * aspect, 60]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
