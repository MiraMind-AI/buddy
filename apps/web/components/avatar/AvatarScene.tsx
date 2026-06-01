"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  Sparkles,
} from "@react-three/drei";
import { useMemo, useRef } from "react";
import {
  Color,
  type Group,
  MathUtils,
  type Mesh,
  type MeshStandardMaterial,
  type PointLight,
} from "three";

import type { AvatarState } from "@/features/avatar/useAvatar";

interface StatePalette {
  primary: string;
  accent: string;
  emissive: string;
  emissiveIntensity: number;
  ringSpeed: number;
  sparkles: number;
  jawOpen: number;
  tilt: number;
}

const PALETTES: Record<AvatarState, StatePalette> = {
  idle: {
    primary: "#8a7bf7",
    accent: "#b9aaff",
    emissive: "#3a2dd1",
    emissiveIntensity: 0.45,
    ringSpeed: 0.25,
    sparkles: 0,
    jawOpen: 0.0,
    tilt: 0,
  },
  listening: {
    primary: "#4ade80",
    accent: "#a7f3d0",
    emissive: "#10b981",
    emissiveIntensity: 0.9,
    ringSpeed: 0.9,
    sparkles: 0,
    jawOpen: 0.05,
    tilt: -0.06,
  },
  thinking: {
    primary: "#fbbf24",
    accent: "#fde68a",
    emissive: "#d97706",
    emissiveIntensity: 0.7,
    ringSpeed: 1.6,
    sparkles: 60,
    jawOpen: 0.0,
    tilt: 0.04,
  },
  speaking: {
    primary: "#38bdf8",
    accent: "#bae6fd",
    emissive: "#0284c7",
    emissiveIntensity: 1.0,
    ringSpeed: 0.6,
    sparkles: 0,
    jawOpen: 0.32,
    tilt: 0.0,
  },
  error: {
    primary: "#fb7185",
    accent: "#fecdd3",
    emissive: "#be123c",
    emissiveIntensity: 0.8,
    ringSpeed: 0.15,
    sparkles: 0,
    jawOpen: 0.0,
    tilt: 0.15,
  },
};

export function AvatarScene({ state }: { state: AvatarState }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0.4, 3.4], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={["#070710"]} />
      <fog attach="fog" args={["#070710", 4, 9]} />

      <ambientLight intensity={0.35} />
      <directionalLight
        position={[2.5, 3, 2]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight
        position={[-3, 1, -2]}
        intensity={0.35}
        color="#7c6af7"
      />

      <Float speed={1.1} rotationIntensity={0.25} floatIntensity={0.6}>
        <AvatarFigure state={state} />
      </Float>

      <ContactShadows
        position={[0, -1.05, 0]}
        opacity={0.55}
        scale={6}
        blur={2.6}
        far={2}
        color="#000000"
      />

      <Environment preset="city" />
    </Canvas>
  );
}

function AvatarFigure({ state }: { state: AvatarState }) {
  const palette = PALETTES[state];

  const group = useRef<Group>(null);
  const head = useRef<Mesh>(null);
  const ring = useRef<Mesh>(null);
  const jaw = useRef<Mesh>(null);
  const eyeL = useRef<Mesh>(null);
  const eyeR = useRef<Mesh>(null);
  const innerLight = useRef<PointLight>(null);

  // Reusable color targets so we can lerp every frame.
  const targets = useMemo(
    () => ({
      primary: new Color(palette.primary),
      accent: new Color(palette.accent),
      emissive: new Color(palette.emissive),
    }),
    // We intentionally recompute targets when the state palette changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state],
  );

  useFrame((threeState, delta) => {
    const t = threeState.clock.elapsedTime;

    // Group level: gentle sway + state tilt.
    if (group.current) {
      group.current.rotation.z = MathUtils.lerp(
        group.current.rotation.z,
        palette.tilt,
        0.05,
      );
      group.current.rotation.y = Math.sin(t * 0.4) * 0.12;
    }

    // Head breathing + color lerp.
    if (head.current) {
      const breath = 1 + Math.sin(t * 1.6) * 0.015;
      head.current.scale.setScalar(breath);

      const mat = head.current.material as MeshStandardMaterial;
      mat.color.lerp(targets.primary, 0.08);
      mat.emissive.lerp(targets.emissive, 0.08);
      mat.emissiveIntensity = MathUtils.lerp(
        mat.emissiveIntensity,
        palette.emissiveIntensity,
        0.08,
      );
    }

    // Rotating halo ring.
    if (ring.current) {
      ring.current.rotation.z += delta * palette.ringSpeed;
      ring.current.rotation.x = Math.sin(t * 0.6) * 0.15;
      const mat = ring.current.material as MeshStandardMaterial;
      mat.color.lerp(targets.accent, 0.08);
      mat.emissive.lerp(targets.emissive, 0.08);
      const pulse = state === "listening" ? 0.8 + Math.sin(t * 6) * 0.4 : 0.6;
      mat.emissiveIntensity = MathUtils.lerp(mat.emissiveIntensity, pulse, 0.1);
    }

    // Jaw animation (mouth opens when speaking).
    if (jaw.current) {
      const targetOpen =
        state === "speaking"
          ? palette.jawOpen * (0.5 + Math.abs(Math.sin(t * 11)) * 0.7)
          : palette.jawOpen;
      jaw.current.scale.y = MathUtils.lerp(
        jaw.current.scale.y,
        0.18 + targetOpen,
        0.25,
      );
    }

    // Eyes — subtle blink and color hint.
    const blink = Math.sin(t * 0.7) > 0.97 ? 0.12 : 1; // brief blink every few seconds
    [eyeL, eyeR].forEach((ref) => {
      if (!ref.current) return;
      ref.current.scale.y = MathUtils.lerp(ref.current.scale.y, blink, 0.4);
      const mat = ref.current.material as MeshStandardMaterial;
      mat.emissive.lerp(targets.accent, 0.1);
      mat.emissiveIntensity = MathUtils.lerp(
        mat.emissiveIntensity,
        state === "error" ? 1.5 : 0.9,
        0.1,
      );
    });

    // Wandering gaze (micro-saccades) so the eyes feel alive instead of fixed.
    const gazeX = Math.sin(t * 0.5) * 0.025 + Math.sin(t * 1.3) * 0.008;
    const gazeY = Math.cos(t * 0.4) * 0.018;
    if (eyeL.current) {
      eyeL.current.position.x = -0.28 + gazeX;
      eyeL.current.position.y = 0.12 + gazeY;
    }
    if (eyeR.current) {
      eyeR.current.position.x = 0.28 + gazeX;
      eyeR.current.position.y = 0.12 + gazeY;
    }

    // Inner glow light follows palette.
    if (innerLight.current) {
      innerLight.current.color.lerp(targets.emissive, 0.1);
      innerLight.current.intensity = MathUtils.lerp(
        innerLight.current.intensity,
        palette.emissiveIntensity * 2.4,
        0.1,
      );
    }
  });

  return (
    <group ref={group}>
      {/* Halo ring */}
      <mesh ref={ring} position={[0, 0.05, -0.05]} rotation={[0, 0, 0]}>
        <torusGeometry args={[1.05, 0.035, 32, 128]} />
        <meshStandardMaterial
          color={palette.accent}
          emissive={palette.emissive}
          emissiveIntensity={0.6}
          metalness={0.6}
          roughness={0.25}
        />
      </mesh>

      {/* Head */}
      <mesh ref={head} castShadow receiveShadow>
        <sphereGeometry args={[0.85, 96, 96]} />
        <meshStandardMaterial
          color={palette.primary}
          emissive={palette.emissive}
          emissiveIntensity={palette.emissiveIntensity}
          metalness={0.35}
          roughness={0.28}
        />
      </mesh>

      {/* Inner glow */}
      <pointLight
        ref={innerLight}
        position={[0, 0, 0]}
        distance={2.5}
        intensity={1}
        color={palette.emissive}
      />

      {/* Eyes */}
      <mesh ref={eyeL} position={[-0.28, 0.12, 0.74]}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshStandardMaterial
          color="#0b0b14"
          emissive={palette.accent}
          emissiveIntensity={0.9}
          metalness={0.4}
          roughness={0.2}
        />
      </mesh>
      <mesh ref={eyeR} position={[0.28, 0.12, 0.74]}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshStandardMaterial
          color="#0b0b14"
          emissive={palette.accent}
          emissiveIntensity={0.9}
          metalness={0.4}
          roughness={0.2}
        />
      </mesh>

      {/* Mouth (jaw) */}
      <mesh ref={jaw} position={[0, -0.28, 0.74]} scale={[0.34, 0.18, 0.05]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#0b0b14"
          emissive={palette.emissive}
          emissiveIntensity={0.6}
          metalness={0.2}
          roughness={0.6}
        />
      </mesh>

      {/* Thinking sparkles */}
      {palette.sparkles > 0 ? (
        <Sparkles
          count={palette.sparkles}
          scale={[2.4, 2.4, 2.4]}
          size={2.2}
          speed={0.5}
          color={palette.accent}
        />
      ) : null}
    </group>
  );
}
