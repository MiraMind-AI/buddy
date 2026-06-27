"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Sparkles } from "@react-three/drei";
import { useMemo, useRef } from "react";
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BackSide,
  Color,
  DoubleSide,
  Fog,
  MathUtils,
  SRGBColorSpace,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
  type MeshPhysicalMaterial,
  type MeshStandardMaterial,
  type PointLight,
  type ShaderMaterial,
} from "three";

import type { AvatarState } from "@/features/avatar/useAvatar";

interface Palette {
  coreA: string;
  coreB: string;
  glass: string;
  rim: string;
  accent: string;
  warning: string;
  metal: string;
  energy: number;
  speed: number;
  scan: number;
}

const PALETTES: Record<AvatarState, Palette> = {
  idle: {
    coreA: "#bffcf0",
    coreB: "#2fc6ad",
    glass: "#dffef7",
    rim: "#7cf0db",
    accent: "#f4c85f",
    warning: "#ff8ea3",
    metal: "#151d20",
    energy: 0.5,
    speed: 0.34,
    scan: 1.5,
  },
  listening: {
    coreA: "#d7fff7",
    coreB: "#11cbaa",
    glass: "#c9fff4",
    rim: "#64ffe2",
    accent: "#74b9ff",
    warning: "#ff8ea3",
    metal: "#102224",
    energy: 1,
    speed: 1.45,
    scan: 4.2,
  },
  thinking: {
    coreA: "#fff3c7",
    coreB: "#ffb13b",
    glass: "#fff7df",
    rim: "#ffd166",
    accent: "#76d6ff",
    warning: "#ff8ea3",
    metal: "#241f17",
    energy: 0.86,
    speed: 1.1,
    scan: 3.2,
  },
  speaking: {
    coreA: "#e1f2ff",
    coreB: "#2f96ff",
    glass: "#d9efff",
    rim: "#78c7ff",
    accent: "#99f7dc",
    warning: "#ff8ea3",
    metal: "#121b29",
    energy: 1,
    speed: 1.82,
    scan: 5.4,
  },
  error: {
    coreA: "#ffe2e7",
    coreB: "#ff526a",
    glass: "#ffe8ec",
    rim: "#ff8ea3",
    accent: "#ffd36b",
    warning: "#ff526a",
    metal: "#24171b",
    energy: 0.68,
    speed: 0.2,
    scan: 1.1,
  },
};

const CORE_VERTEX = `
  uniform float uTime;
  uniform float uEnergy;
  varying vec3 vPosition;
  varying vec3 vNormal;

  void main() {
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    vec3 displaced = position;
    float wave =
      sin((position.y + uTime * 0.68) * 9.0) +
      sin((position.x - uTime * 0.46) * 7.5) +
      sin((position.z + uTime * 0.34) * 8.5);
    displaced += normal * wave * 0.032 * uEnergy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const CORE_FRAGMENT = `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uTime;
  uniform float uEnergy;
  varying vec3 vPosition;
  varying vec3 vNormal;

  void main() {
    float scan = 0.5 + 0.5 * sin(vPosition.y * 24.0 - uTime * (4.0 + uEnergy * 4.0));
    float lattice =
      smoothstep(0.46, 0.52, abs(sin(vPosition.x * 18.0 + uTime))) *
      smoothstep(0.38, 0.5, abs(sin(vPosition.z * 18.0 - uTime * 0.7)));
    float fresnel = pow(1.0 - abs(vNormal.z), 2.25);
    vec3 color = mix(uColorA, uColorB, scan * 0.66 + lattice * 0.24);
    color += fresnel * uColorA * (1.2 + uEnergy);
    float alpha = 0.52 + fresnel * 0.38 + scan * 0.08;
    gl_FragColor = vec4(color, alpha);
  }
`;

const PANEL_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const PANEL_FRAGMENT = `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uEnergy;
  varying vec2 vUv;

  void main() {
    float edge = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x) *
      smoothstep(0.0, 0.08, vUv.y) * smoothstep(1.0, 0.92, vUv.y);
    float scan = smoothstep(0.46, 0.5, sin((vUv.y * 18.0) - uTime * (3.0 + uEnergy * 3.0)));
    float alpha = edge * (0.08 + scan * 0.16 + uEnergy * 0.08);
    gl_FragColor = vec4(uColor * (0.55 + scan), alpha);
  }
`;

const WAVE_COUNT = 34;
const STRUT_COUNT = 12;
const PANEL_COUNT = 0;

export function AvatarScene({
  state,
  level = 0,
}: {
  state: AvatarState;
  level?: number;
}) {
  return (
    <Canvas
      className="absolute inset-0"
      dpr={[1, 2]}
      shadows
      camera={{ position: [0, 0.36, 6.2], fov: 30 }}
      gl={{
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.2;
        gl.outputColorSpace = SRGBColorSpace;
        scene.fog = new Fog("#050607", 7.4, 12.5);
      }}
    >
      <ambientLight intensity={0.2} />
      <hemisphereLight args={["#f8fbff", "#070a0b", 1.25]} />
      <spotLight
        castShadow
        position={[3.4, 4.7, 4.8]}
        angle={0.35}
        penumbra={0.82}
        intensity={5.2}
        color="#ffffff"
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-3.8, 1.7, 2.6]} intensity={2.1} color="#66f4dc" />
      <pointLight position={[2.8, -0.4, 2.4]} intensity={1.2} color="#f4c85f" />

      <HolographicCompanion state={state} level={level} />

      <ContactShadows
        position={[0, -1.78, 0]}
        opacity={0.58}
        scale={5.8}
        blur={2.6}
        far={3.6}
      />
    </Canvas>
  );
}

function HolographicCompanion({
  state,
  level,
}: {
  state: AvatarState;
  level: number;
}) {
  const palette = PALETTES[state];
  const rig = useRef<Group>(null);
  const core = useRef<Mesh>(null);
  const inner = useRef<Mesh>(null);
  const glass = useRef<Mesh>(null);
  const coreAura = useRef<Mesh>(null);
  const projectorLight = useRef<PointLight>(null);
  const rings = useRef<Array<Mesh | null>>([]);
  const struts = useRef<Array<Mesh | null>>([]);
  const panels = useRef<Array<Mesh | null>>([]);
  const waves = useRef<Array<Mesh | null>>([]);

  const uniforms = useMemo(
    () => ({
      core: {
        uTime: { value: 0 },
        uEnergy: { value: palette.energy },
        uColorA: { value: new Color(palette.coreA) },
        uColorB: { value: new Color(palette.coreB) },
      },
      panel: {
        uTime: { value: 0 },
        uEnergy: { value: palette.energy },
        uColor: { value: new Color(palette.rim) },
      },
    }),
    // Uniform containers are created per avatar state so colors transition safely.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state],
  );

  const colors = useMemo(
    () => ({
      coreA: new Color(palette.coreA),
      coreB: new Color(palette.coreB),
      glass: new Color(palette.glass),
      rim: new Color(palette.rim),
      accent: new Color(palette.accent),
      warning: new Color(palette.warning),
      metal: new Color(palette.metal),
    }),
    // Palette objects intentionally change with avatar state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state],
  );

  useFrame(({ clock }, delta) => {
    const time = clock.elapsedTime;
    const audioBoost = MathUtils.clamp(level, 0, 1);
    const energy = palette.energy + audioBoost * 0.6;
    const pulse = 1 + Math.sin(time * palette.scan) * 0.025 + audioBoost * 0.08;

    uniforms.core.uTime.value = time;
    uniforms.core.uEnergy.value = MathUtils.lerp(uniforms.core.uEnergy.value, energy, 0.08);
    uniforms.core.uColorA.value.lerp(colors.coreA, 0.08);
    uniforms.core.uColorB.value.lerp(colors.coreB, 0.08);
    uniforms.panel.uTime.value = time;
    uniforms.panel.uEnergy.value = MathUtils.lerp(uniforms.panel.uEnergy.value, energy, 0.08);
    uniforms.panel.uColor.value.lerp(colors.rim, 0.08);

    if (rig.current) {
      rig.current.rotation.y = Math.sin(time * 0.18) * 0.12;
      rig.current.position.y = Math.sin(time * 0.85) * 0.035;
    }

    if (core.current) {
      core.current.rotation.y += delta * (0.36 + palette.speed * 0.3);
      core.current.rotation.x = Math.sin(time * 0.42) * 0.1;
      core.current.scale.set(0.86 * pulse, 1.22 * pulse, 0.86 * pulse);
    }

    if (inner.current) {
      inner.current.rotation.y -= delta * (0.55 + palette.speed * 0.4);
      inner.current.scale.setScalar(0.54 + Math.sin(time * 1.7) * 0.025 + audioBoost * 0.08);
      const material = inner.current.material as MeshStandardMaterial;
      material.color.lerp(colors.accent, 0.08);
      material.emissive.lerp(colors.accent, 0.08);
      material.emissiveIntensity = MathUtils.lerp(
        material.emissiveIntensity,
        0.9 + energy * 0.9,
        0.08,
      );
    }

    if (glass.current) {
      const material = glass.current.material as MeshPhysicalMaterial;
      material.color.lerp(colors.glass, 0.06);
      material.attenuationColor?.lerp(colors.glass, 0.06);
      material.opacity = MathUtils.lerp(material.opacity, 0.16 + energy * 0.045, 0.06);
    }

    if (coreAura.current) {
      coreAura.current.rotation.z += delta * 0.18;
      coreAura.current.scale.setScalar(1.35 + audioBoost * 0.18 + Math.sin(time * 1.4) * 0.03);
      const material = coreAura.current.material as MeshBasicMaterial;
      material.color.lerp(colors.rim, 0.08);
      material.opacity = MathUtils.lerp(material.opacity, 0.16 + energy * 0.08, 0.08);
    }

    rings.current.forEach((ring, index) => {
      if (!ring) return;
      const direction = index % 2 === 0 ? 1 : -1;
      ring.rotation.z += delta * palette.speed * direction * (0.34 + index * 0.16);
      ring.rotation.x = Math.PI / (2.08 + index * 0.18) + Math.sin(time * 0.36 + index) * 0.06;
      const material = ring.material as MeshStandardMaterial;
      material.color.lerp(index === 1 ? colors.accent : colors.rim, 0.08);
      material.emissive.lerp(index === 2 ? colors.accent : colors.rim, 0.08);
      material.emissiveIntensity = MathUtils.lerp(
        material.emissiveIntensity,
        0.45 + energy * (index === 0 ? 1.1 : 0.62),
        0.08,
      );
    });

    struts.current.forEach((strut, index) => {
      if (!strut) return;
      const material = strut.material as MeshStandardMaterial;
      material.color.lerp(colors.rim, 0.08);
      material.emissive.lerp(colors.rim, 0.08);
      material.emissiveIntensity = 0.16 + energy * 0.22 + Math.sin(time * 2 + index) * 0.05;
      strut.scale.y = 1 + Math.sin(time * 0.8 + index) * 0.025;
    });

    panels.current.forEach((panel, index) => {
      if (!panel) return;
      panel.position.y = 0.08 + Math.sin(time * 0.78 + index) * 0.06;
      panel.rotation.y += delta * (index % 2 === 0 ? 0.08 : -0.06);
      const material = panel.material as ShaderMaterial;
      material.uniforms.uTime.value = time + index * 0.37;
      material.uniforms.uEnergy.value = energy;
      material.uniforms.uColor.value.lerp(index % 3 === 0 ? colors.accent : colors.rim, 0.08);
    });

    waves.current.forEach((wave, index) => {
      if (!wave) return;
      const phase = time * (2.4 + palette.speed) + index * 0.48;
      const height = 0.16 + energy * 0.25 + Math.max(0, Math.sin(phase)) * (0.36 + audioBoost * 0.62);
      wave.scale.y = MathUtils.lerp(wave.scale.y, height, 0.2);
      const material = wave.material as MeshStandardMaterial;
      material.color.lerp(index % 4 === 0 ? colors.accent : colors.rim, 0.08);
      material.emissive.lerp(colors.rim, 0.08);
      material.emissiveIntensity = 0.32 + energy * 0.9;
    });

    if (projectorLight.current) {
      projectorLight.current.color.lerp(state === "error" ? colors.warning : colors.rim, 0.1);
      projectorLight.current.intensity = MathUtils.lerp(
        projectorLight.current.intensity,
        2.6 + energy * 4.8,
        0.1,
      );
    }
  });

  return (
    <group ref={rig} position={[0, -0.02, 0]}>
      <BackdropPanels palette={palette} />

      <mesh position={[0, -1.62, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.46, 1.66, 0.36, 128]} />
        <meshStandardMaterial
          color={palette.metal}
          roughness={0.22}
          metalness={0.78}
          envMapIntensity={1.15}
        />
      </mesh>

      <mesh position={[0, -1.38, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[1.34, 0.038, 24, 190]} />
        <meshStandardMaterial
          color={palette.accent}
          emissive={palette.rim}
          emissiveIntensity={0.48}
          roughness={0.16}
          metalness={0.62}
        />
      </mesh>

      <mesh ref={glass} position={[0, -0.16, 0]}>
        <cylinderGeometry args={[1.12, 1.12, 2.52, 128, 1, true]} />
        <meshPhysicalMaterial
          color={palette.glass}
          roughness={0.02}
          metalness={0}
          transmission={0.35}
          thickness={0.9}
          ior={1.42}
          clearcoat={1}
          clearcoatRoughness={0.035}
          transparent
          opacity={0.18}
          side={DoubleSide}
          attenuationColor={palette.glass}
          attenuationDistance={1.3}
        />
      </mesh>

      {Array.from({ length: STRUT_COUNT }).map((_, index) => {
        const angle = (index / STRUT_COUNT) * Math.PI * 2;
        const radius = 1.13;
        return (
          <mesh
            key={index}
            ref={(node) => {
              struts.current[index] = node;
            }}
            position={[Math.cos(angle) * radius, -0.16, Math.sin(angle) * radius]}
            rotation={[0, -angle, 0]}
            scale={[0.018, 2.44, 0.018]}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={palette.rim}
              emissive={palette.rim}
              emissiveIntensity={0.24}
              roughness={0.18}
              metalness={0.2}
              transparent
              opacity={0.34}
            />
          </mesh>
        );
      })}

      <mesh ref={core} position={[0, -0.08, 0]} castShadow>
        <sphereGeometry args={[0.72, 128, 128]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          uniforms={uniforms.core}
          vertexShader={CORE_VERTEX}
          fragmentShader={CORE_FRAGMENT}
        />
      </mesh>

      <mesh ref={inner} position={[0, -0.08, 0]} scale={0.5}>
        <sphereGeometry args={[1, 80, 80]} />
        <meshStandardMaterial
          color={palette.accent}
          emissive={palette.accent}
          emissiveIntensity={1.2}
          roughness={0.18}
          metalness={0.12}
          transparent
          opacity={0.7}
        />
      </mesh>

      <mesh ref={coreAura} position={[0, -0.08, -0.02]} scale={[1.34, 1.34, 0.06]}>
        <sphereGeometry args={[1, 72, 24]} />
        <meshBasicMaterial
          color={palette.rim}
          transparent
          opacity={0.18}
          blending={AdditiveBlending}
          side={BackSide}
          depthWrite={false}
        />
      </mesh>

      {[0, 1, 2, 3].map((_, index) => (
        <mesh
          key={index}
          ref={(node) => {
            rings.current[index] = node;
          }}
          position={[0, -0.08, 0]}
          rotation={[Math.PI / (2.1 + index * 0.2), index * 0.35, index * 0.42]}
        >
          <torusGeometry args={[0.78 + index * 0.18, 0.007 + index * 0.002, 18, 220]} />
          <meshStandardMaterial
            color={index % 2 === 0 ? palette.rim : palette.accent}
            emissive={palette.rim}
            emissiveIntensity={0.58}
            roughness={0.18}
            metalness={0.35}
            transparent
            opacity={0.66 - index * 0.08}
          />
        </mesh>
      ))}

      <group position={[0, -1.23, 0.05]}>
        {Array.from({ length: WAVE_COUNT }).map((_, index) => {
          const angle = (index / WAVE_COUNT) * Math.PI * 2;
          const radius = 1.05 + (index % 2) * 0.08;
          return (
            <mesh
              key={index}
              ref={(node) => {
                waves.current[index] = node;
              }}
              position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
              rotation={[0, -angle, 0]}
              scale={[0.025, 0.28, 0.025]}
              castShadow
            >
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial
                color={index % 4 === 0 ? palette.accent : palette.rim}
                emissive={palette.rim}
                emissiveIntensity={0.44}
                roughness={0.18}
                metalness={0.22}
              />
            </mesh>
          );
        })}
      </group>

      <group position={[0, 0.0, -0.18]}>
        {Array.from({ length: PANEL_COUNT }).map((_, index) => {
          const angle = (index / PANEL_COUNT) * Math.PI * 2;
          const radius = 1.62;
          return (
            <mesh
              key={index}
              ref={(node) => {
                panels.current[index] = node;
              }}
              position={[Math.cos(angle) * radius, 0.08, Math.sin(angle) * radius]}
              rotation={[0, -angle + Math.PI / 2, 0]}
              scale={[0.36, 0.86, 1]}
            >
              <planeGeometry args={[1, 1, 8, 8]} />
              <shaderMaterial
                transparent
                depthWrite={false}
                side={DoubleSide}
                blending={AdditiveBlending}
                uniforms={{
                  uTime: { value: 0 },
                  uEnergy: { value: palette.energy },
                  uColor: { value: new Color(index % 3 === 0 ? palette.accent : palette.rim) },
                }}
                vertexShader={PANEL_VERTEX}
                fragmentShader={PANEL_FRAGMENT}
              />
            </mesh>
          );
        })}
      </group>

      <pointLight ref={projectorLight} position={[0, -0.35, 0.35]} distance={5.2} intensity={4.2} />
      <Sparkles
        count={state === "error" ? 18 : 76}
        scale={[2.5, 2.6, 1.8]}
        size={1.45}
        speed={0.28 + palette.energy * 0.32}
        opacity={0.58}
        color={palette.accent}
      />

      <mesh position={[0, -1.82, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.65, 128]} />
        <meshStandardMaterial
          color="#070909"
          roughness={0.68}
          metalness={0.12}
          transparent
          opacity={0.62}
        />
      </mesh>
    </group>
  );
}

function BackdropPanels({ palette }: { palette: Palette }) {
  return (
    <group position={[0, -0.18, -1.92]}>
      <mesh scale={[3.6, 2.9, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#071010" transparent opacity={0.42} />
      </mesh>
      {[-1.28, -0.64, 0, 0.64, 1.28].map((x, index) => (
        <mesh key={x} position={[x, 0, 0.01]} scale={[0.012, 2.65, 1]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial
            color={index === 2 ? palette.accent : palette.rim}
            transparent
            opacity={index === 2 ? 0.16 : 0.08}
          />
        </mesh>
      ))}
      {[-1.0, -0.5, 0, 0.5, 1.0].map((y) => (
        <mesh key={y} position={[0, y, 0.012]} scale={[3.25, 0.01, 1]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={palette.rim} transparent opacity={0.06} />
        </mesh>
      ))}
    </group>
  );
}
