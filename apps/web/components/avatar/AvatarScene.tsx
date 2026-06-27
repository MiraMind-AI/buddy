"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
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

interface Palette {
  core: string;
  glow: string;
  ring: string;
  accent: string;
  speed: number;
  energy: number;
  tilt: number;
  sparkles: number;
}

const PALETTES: Record<AvatarState, Palette> = {
  idle: {
    core: "#9ff3df",
    glow: "#2bbfa3",
    ring: "#7dd3fc",
    accent: "#f4d35e",
    speed: 0.28,
    energy: 0.55,
    tilt: 0,
    sparkles: 18,
  },
  listening: {
    core: "#b9f8ea",
    glow: "#34d399",
    ring: "#86efac",
    accent: "#7dd3fc",
    speed: 1.1,
    energy: 0.95,
    tilt: -0.08,
    sparkles: 44,
  },
  thinking: {
    core: "#fde68a",
    glow: "#f59e0b",
    ring: "#7dd3fc",
    accent: "#9ff3df",
    speed: 1.55,
    energy: 0.85,
    tilt: 0.06,
    sparkles: 72,
  },
  speaking: {
    core: "#7dd3fc",
    glow: "#0ea5e9",
    ring: "#9ff3df",
    accent: "#f4d35e",
    speed: 0.9,
    energy: 1,
    tilt: 0,
    sparkles: 54,
  },
  error: {
    core: "#fecdd3",
    glow: "#fb7185",
    ring: "#fda4af",
    accent: "#fde68a",
    speed: 0.16,
    energy: 0.68,
    tilt: 0.14,
    sparkles: 12,
  },
};

export function AvatarScene({ state }: { state: AvatarState }) {
  return (
    <Canvas
      className="absolute inset-0"
      dpr={[1, 2]}
      camera={{ position: [0, 0.1, 4.9], fov: 34 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
    >
      <ambientLight intensity={0.45} />
      <pointLight position={[2.6, 2.4, 3]} intensity={2.2} color="#ffffff" />
      <pointLight position={[-2.4, -1.2, 2]} intensity={1.1} color="#7dd3fc" />

      <Float speed={1.05} rotationIntensity={0.12} floatIntensity={0.35}>
        <PresenceCore state={state} />
      </Float>
    </Canvas>
  );
}

function PresenceCore({ state }: { state: AvatarState }) {
  const palette = PALETTES[state];
  const group = useRef<Group>(null);
  const core = useRef<Mesh>(null);
  const shell = useRef<Mesh>(null);
  const ringA = useRef<Mesh>(null);
  const ringB = useRef<Mesh>(null);
  const ringC = useRef<Mesh>(null);
  const light = useRef<PointLight>(null);

  const colors = useMemo(
    () => ({
      core: new Color(palette.core),
      glow: new Color(palette.glow),
      ring: new Color(palette.ring),
      accent: new Color(palette.accent),
    }),
    // Recompute color targets when the avatar state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state],
  );

  useFrame((threeState, delta) => {
    const time = threeState.clock.elapsedTime;
    const pulse = 1 + Math.sin(time * (state === "speaking" ? 4.8 : 2.1)) * 0.045;

    if (group.current) {
      group.current.rotation.z = MathUtils.lerp(group.current.rotation.z, palette.tilt, 0.06);
      group.current.rotation.y = Math.sin(time * 0.34) * 0.12;
    }

    if (core.current) {
      core.current.scale.setScalar(pulse);
      const material = core.current.material as MeshStandardMaterial;
      material.color.lerp(colors.core, 0.1);
      material.emissive.lerp(colors.glow, 0.1);
      material.emissiveIntensity = MathUtils.lerp(
        material.emissiveIntensity,
        palette.energy * 1.1,
        0.1,
      );
    }

    if (shell.current) {
      shell.current.scale.setScalar(1.24 + Math.sin(time * 1.4) * 0.018);
      const material = shell.current.material as MeshStandardMaterial;
      material.color.lerp(colors.glow, 0.08);
      material.emissive.lerp(colors.glow, 0.08);
      material.emissiveIntensity = MathUtils.lerp(
        material.emissiveIntensity,
        palette.energy * 0.22,
        0.08,
      );
    }

    const rings = [
      { ref: ringA, direction: 1, accent: false },
      { ref: ringB, direction: -0.72, accent: true },
      { ref: ringC, direction: 0.46, accent: false },
    ];

    rings.forEach(({ ref, direction, accent }, index) => {
      const mesh = ref.current;
      if (!mesh) return;
      mesh.rotation.z += delta * palette.speed * direction;
      mesh.rotation.x = Math.sin(time * 0.42 + index) * 0.16 + index * 0.58;
      const material = mesh.material as MeshStandardMaterial;
      material.color.lerp(accent ? colors.accent : colors.ring, 0.1);
      material.emissive.lerp(colors.glow, 0.1);
      material.emissiveIntensity = MathUtils.lerp(
        material.emissiveIntensity,
        palette.energy * (index === 0 ? 0.9 : 0.55),
        0.1,
      );
    });

    if (light.current) {
      light.current.color.lerp(colors.glow, 0.1);
      light.current.intensity = MathUtils.lerp(
        light.current.intensity,
        palette.energy * 3.4,
        0.1,
      );
    }
  });

  return (
    <group ref={group} scale={0.98}>
      <mesh ref={ringA} rotation={[0.78, 0.1, 0]}>
        <torusGeometry args={[1.13, 0.012, 24, 160]} />
        <meshStandardMaterial
          color={palette.ring}
          emissive={palette.glow}
          emissiveIntensity={0.8}
          metalness={0.4}
          roughness={0.2}
          transparent
          opacity={0.86}
        />
      </mesh>
      <mesh ref={ringB} rotation={[1.25, 0.35, 0.7]}>
        <torusGeometry args={[0.86, 0.01, 18, 140]} />
        <meshStandardMaterial
          color={palette.accent}
          emissive={palette.glow}
          emissiveIntensity={0.45}
          metalness={0.35}
          roughness={0.22}
          transparent
          opacity={0.72}
        />
      </mesh>
      <mesh ref={ringC} rotation={[1.52, -0.2, -0.28]}>
        <torusGeometry args={[1.38, 0.007, 18, 180]} />
        <meshStandardMaterial
          color={palette.ring}
          emissive={palette.glow}
          emissiveIntensity={0.35}
          metalness={0.35}
          roughness={0.26}
          transparent
          opacity={0.46}
        />
      </mesh>

      <mesh ref={shell} scale={1.24}>
        <sphereGeometry args={[0.82, 72, 72]} />
        <meshStandardMaterial
          color={palette.glow}
          emissive={palette.glow}
          emissiveIntensity={0.18}
          roughness={0.12}
          metalness={0.25}
          transparent
          opacity={0.14}
        />
      </mesh>

      <mesh ref={core}>
        <sphereGeometry args={[0.62, 80, 80]} />
        <meshStandardMaterial
          color={palette.core}
          emissive={palette.glow}
          emissiveIntensity={1}
          roughness={0.22}
          metalness={0.18}
        />
      </mesh>

      <mesh position={[-0.18, 0.22, 0.56]} scale={[0.16, 0.1, 0.03]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
      </mesh>

      <pointLight ref={light} position={[0, 0, 0.7]} distance={4} intensity={2.6} />

      <Sparkles
        count={palette.sparkles}
        scale={[2.6, 2.3, 1.8]}
        size={2}
        speed={0.35}
        color={palette.accent}
      />
    </group>
  );
}
