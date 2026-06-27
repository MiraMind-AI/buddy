"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float, Sparkles } from "@react-three/drei";
import { useMemo, useRef } from "react";
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  Color,
  DoubleSide,
  Fog,
  MathUtils,
  SRGBColorSpace,
  type Group,
  type Mesh,
  type MeshPhysicalMaterial,
  type MeshStandardMaterial,
  type PointLight,
} from "three";

import type { AvatarState } from "@/features/avatar/useAvatar";

interface Palette {
  glass: string;
  core: string;
  halo: string;
  accent: string;
  metal: string;
  floor: string;
  energy: number;
  speed: number;
  wave: number;
  tilt: number;
  sparkles: number;
}

const PALETTES: Record<AvatarState, Palette> = {
  idle: {
    glass: "#d8fff6",
    core: "#b7f8ed",
    halo: "#32c6ad",
    accent: "#f7c857",
    metal: "#20272b",
    floor: "#101312",
    energy: 0.58,
    speed: 0.28,
    wave: 1.7,
    tilt: 0,
    sparkles: 26,
  },
  listening: {
    glass: "#cafff4",
    core: "#73f0d5",
    halo: "#16bfa5",
    accent: "#6db8ff",
    metal: "#18292a",
    floor: "#0d1718",
    energy: 1,
    speed: 1.35,
    wave: 4.6,
    tilt: -0.06,
    sparkles: 58,
  },
  thinking: {
    glass: "#fff1c9",
    core: "#ffd56b",
    halo: "#f49f2f",
    accent: "#6db8ff",
    metal: "#29241b",
    floor: "#17130d",
    energy: 0.9,
    speed: 1.05,
    wave: 3.2,
    tilt: 0.05,
    sparkles: 70,
  },
  speaking: {
    glass: "#d8edff",
    core: "#89ccff",
    halo: "#2f95ff",
    accent: "#91f4d9",
    metal: "#192333",
    floor: "#0e1119",
    energy: 1,
    speed: 1.85,
    wave: 6.2,
    tilt: 0,
    sparkles: 66,
  },
  error: {
    glass: "#ffe3e6",
    core: "#ff9dab",
    halo: "#f05265",
    accent: "#ffd36b",
    metal: "#2b1b20",
    floor: "#170d10",
    energy: 0.74,
    speed: 0.18,
    wave: 1.15,
    tilt: 0.12,
    sparkles: 14,
  },
};

const BAR_COUNT = 17;
const ORBIT_COUNT = 4;

export function AvatarScene({ state }: { state: AvatarState }) {
  return (
    <Canvas
      className="absolute inset-0"
      dpr={[1, 2]}
      shadows
      camera={{ position: [0, 0.45, 5.6], fov: 32 }}
      gl={{
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.18;
        gl.outputColorSpace = SRGBColorSpace;
        scene.fog = new Fog("#070909", 7.2, 12);
      }}
    >
      <ambientLight intensity={0.28} />
      <hemisphereLight args={["#f7fbff", "#111314", 1.4]} />
      <spotLight
        castShadow
        position={[3.2, 4.1, 3.8]}
        angle={0.38}
        penumbra={0.82}
        intensity={4.2}
        color="#ffffff"
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-3.2, 1.6, 2.4]} intensity={1.45} color="#49d7c3" />
      <pointLight position={[2.4, -0.9, 2.1]} intensity={0.85} color="#f7c857" />

      <AssistantDevice state={state} />

      <ContactShadows
        position={[0, -1.64, 0]}
        opacity={0.52}
        scale={5.2}
        blur={2.2}
        far={3.2}
      />
    </Canvas>
  );
}

function AssistantDevice({ state }: { state: AvatarState }) {
  const palette = PALETTES[state];
  const rig = useRef<Group>(null);
  const head = useRef<Group>(null);
  const core = useRef<Mesh>(null);
  const innerCore = useRef<Mesh>(null);
  const glass = useRef<Mesh>(null);
  const base = useRef<Mesh>(null);
  const light = useRef<PointLight>(null);
  const orbits = useRef<Array<Mesh | null>>([]);
  const bars = useRef<Array<Mesh | null>>([]);

  const colors = useMemo(
    () => ({
      glass: new Color(palette.glass),
      core: new Color(palette.core),
      halo: new Color(palette.halo),
      accent: new Color(palette.accent),
      metal: new Color(palette.metal),
      floor: new Color(palette.floor),
    }),
    // Palette objects intentionally change with avatar state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state],
  );

  useFrame(({ clock }, delta) => {
    const time = clock.elapsedTime;
    const pulse = 1 + Math.sin(time * palette.wave) * (0.025 + palette.energy * 0.03);
    const slowBreath = 1 + Math.sin(time * 0.9) * 0.018;

    if (rig.current) {
      rig.current.rotation.y = Math.sin(time * 0.22) * 0.1;
    }

    if (head.current) {
      head.current.rotation.z = MathUtils.lerp(head.current.rotation.z, palette.tilt, 0.055);
      head.current.position.y = -0.04 + Math.sin(time * 1.1) * 0.045;
    }

    if (glass.current) {
      glass.current.scale.setScalar(1.03 + Math.sin(time * 1.35) * 0.012);
      const material = glass.current.material as MeshPhysicalMaterial;
      material.color.lerp(colors.glass, 0.08);
      material.attenuationColor?.lerp(colors.glass, 0.08);
      material.opacity = MathUtils.lerp(material.opacity, 0.23 + palette.energy * 0.05, 0.08);
    }

    if (core.current) {
      core.current.scale.setScalar(pulse);
      core.current.rotation.x += delta * palette.speed * 0.28;
      core.current.rotation.y += delta * palette.speed * 0.4;
      const material = core.current.material as MeshStandardMaterial;
      material.color.lerp(colors.core, 0.1);
      material.emissive.lerp(colors.halo, 0.1);
      material.emissiveIntensity = MathUtils.lerp(
        material.emissiveIntensity,
        1.2 + palette.energy * 1.35,
        0.08,
      );
    }

    if (innerCore.current) {
      innerCore.current.scale.setScalar(slowBreath);
      const material = innerCore.current.material as MeshStandardMaterial;
      material.color.lerp(colors.accent, 0.1);
      material.emissive.lerp(colors.accent, 0.1);
      material.emissiveIntensity = MathUtils.lerp(
        material.emissiveIntensity,
        0.55 + palette.energy * 0.7,
        0.08,
      );
    }

    if (base.current) {
      const material = base.current.material as MeshStandardMaterial;
      material.color.lerp(colors.metal, 0.05);
    }

    orbits.current.forEach((orbit, index) => {
      if (!orbit) return;
      const direction = index % 2 === 0 ? 1 : -1;
      orbit.rotation.z += delta * palette.speed * direction * (0.38 + index * 0.12);
      orbit.rotation.x =
        Math.sin(time * 0.32 + index) * 0.08 + Math.PI / (index === 0 ? 2.35 : 2.7);
      const material = orbit.material as MeshStandardMaterial;
      material.color.lerp(index === 1 ? colors.accent : colors.halo, 0.08);
      material.emissive.lerp(index === 2 ? colors.accent : colors.halo, 0.08);
      material.emissiveIntensity = MathUtils.lerp(
        material.emissiveIntensity,
        0.35 + palette.energy * (index === 0 ? 0.95 : 0.52),
        0.08,
      );
    });

    bars.current.forEach((bar, index) => {
      if (!bar) return;
      const phase = time * palette.wave + index * 0.78;
      const targetHeight =
        0.18 + palette.energy * (0.32 + Math.max(0, Math.sin(phase)) * 0.58);
      bar.scale.y = MathUtils.lerp(bar.scale.y, targetHeight, 0.18);
      const material = bar.material as MeshStandardMaterial;
      material.color.lerp(index % 3 === 0 ? colors.accent : colors.halo, 0.08);
      material.emissive.lerp(colors.halo, 0.08);
      material.emissiveIntensity = MathUtils.lerp(
        material.emissiveIntensity,
        0.35 + palette.energy * 0.9,
        0.1,
      );
    });

    if (light.current) {
      light.current.color.lerp(colors.halo, 0.1);
      light.current.intensity = MathUtils.lerp(light.current.intensity, 2 + palette.energy * 4.4, 0.1);
    }
  });

  return (
    <group ref={rig} position={[0, 0.05, 0]}>
      <mesh ref={base} position={[0, -1.42, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.32, 1.54, 0.34, 128]} />
        <meshStandardMaterial
          color={palette.metal}
          roughness={0.24}
          metalness={0.76}
          envMapIntensity={1.2}
        />
      </mesh>

      <mesh position={[0, -1.2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[1.18, 0.035, 24, 160]} />
        <meshStandardMaterial
          color={palette.accent}
          emissive={palette.halo}
          emissiveIntensity={0.3}
          roughness={0.18}
          metalness={0.58}
        />
      </mesh>

      <group ref={head}>
        <Float speed={1.35} rotationIntensity={0.08} floatIntensity={0.28}>
          <mesh ref={glass} castShadow>
            <sphereGeometry args={[1, 96, 96]} />
            <meshPhysicalMaterial
              color={palette.glass}
              roughness={0.025}
              metalness={0}
              transmission={0.46}
              thickness={1.2}
              ior={1.46}
              clearcoat={1}
              clearcoatRoughness={0.035}
              transparent
              opacity={0.26}
              attenuationColor={palette.glass}
              attenuationDistance={1.6}
            />
          </mesh>

          <mesh ref={core} castShadow>
            <icosahedronGeometry args={[0.58, 5]} />
            <meshStandardMaterial
              color={palette.core}
              emissive={palette.halo}
              emissiveIntensity={1.5}
              roughness={0.2}
              metalness={0.24}
            />
          </mesh>

          <mesh ref={innerCore} scale={0.46}>
            <sphereGeometry args={[1, 64, 64]} />
            <meshStandardMaterial
              color={palette.accent}
              emissive={palette.accent}
              emissiveIntensity={0.8}
              roughness={0.3}
              metalness={0.05}
              transparent
              opacity={0.54}
            />
          </mesh>

          {Array.from({ length: ORBIT_COUNT }).map((_, index) => (
            <mesh
              key={index}
              ref={(node) => {
                orbits.current[index] = node;
              }}
              rotation={[Math.PI / (2.35 + index * 0.12), index * 0.28, index * 0.44]}
            >
              <torusGeometry args={[0.82 + index * 0.14, 0.009 + index * 0.0015, 18, 190]} />
              <meshStandardMaterial
                color={index % 2 === 0 ? palette.halo : palette.accent}
                emissive={palette.halo}
                emissiveIntensity={0.55}
                roughness={0.18}
                metalness={0.42}
                transparent
                opacity={0.72 - index * 0.1}
              />
            </mesh>
          ))}

          <mesh position={[0, 0, -0.42]} scale={[1.18, 1.18, 0.04]}>
            <sphereGeometry args={[1, 64, 24]} />
            <meshBasicMaterial
              color={palette.halo}
              transparent
              opacity={0.15}
              blending={AdditiveBlending}
              side={DoubleSide}
              depthWrite={false}
            />
          </mesh>

          <group position={[0, -0.96, 0.84]}>
            {Array.from({ length: BAR_COUNT }).map((_, index) => {
              const x = (index - (BAR_COUNT - 1) / 2) * 0.105;
              return (
                <mesh
                  key={index}
                  ref={(node) => {
                    bars.current[index] = node;
                  }}
                  position={[x, 0, Math.abs(x) * -0.04]}
                  scale={[0.028, 0.22, 0.028]}
                  castShadow
                >
                  <boxGeometry args={[1, 1, 1]} />
                  <meshStandardMaterial
                    color={index % 3 === 0 ? palette.accent : palette.halo}
                    emissive={palette.halo}
                    emissiveIntensity={0.45}
                    roughness={0.18}
                    metalness={0.18}
                  />
                </mesh>
              );
            })}
          </group>

          <pointLight ref={light} position={[0, 0.1, 0.28]} distance={4.6} intensity={3.8} />
          <Sparkles
            count={palette.sparkles}
            scale={[2.1, 2.1, 1.4]}
            size={1.6}
            speed={0.24 + palette.energy * 0.38}
            opacity={0.62}
            color={palette.accent}
          />
        </Float>
      </group>

      <mesh position={[0, -1.63, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.45, 128]} />
        <meshStandardMaterial
          color={palette.floor}
          roughness={0.62}
          metalness={0.16}
          transparent
          opacity={0.58}
        />
      </mesh>
    </group>
  );
}
