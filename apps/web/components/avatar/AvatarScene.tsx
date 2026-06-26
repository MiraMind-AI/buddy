"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Float,
  PresentationControls,
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
  shell: string;
  face: string;
  core: string;
  accent: string;
  glow: string;
  ringSpeed: number;
  energy: number;
  mouth: number;
  tilt: number;
  sparkles: number;
}

const PALETTES: Record<AvatarState, StatePalette> = {
  idle: {
    shell: "#dce7e4",
    face: "#121816",
    core: "#2dd4bf",
    accent: "#facc15",
    glow: "#14b8a6",
    ringSpeed: 0.22,
    energy: 0.58,
    mouth: 0.03,
    tilt: 0,
    sparkles: 0,
  },
  listening: {
    shell: "#d8f5ea",
    face: "#0b1a14",
    core: "#5eead4",
    accent: "#86efac",
    glow: "#34d399",
    ringSpeed: 1.05,
    energy: 0.95,
    mouth: 0.06,
    tilt: -0.08,
    sparkles: 18,
  },
  thinking: {
    shell: "#f2ead7",
    face: "#18140a",
    core: "#fbbf24",
    accent: "#38bdf8",
    glow: "#f59e0b",
    ringSpeed: 1.65,
    energy: 0.85,
    mouth: 0.02,
    tilt: 0.05,
    sparkles: 72,
  },
  speaking: {
    shell: "#dff0f8",
    face: "#09151b",
    core: "#7dd3fc",
    accent: "#2dd4bf",
    glow: "#0ea5e9",
    ringSpeed: 0.78,
    energy: 1,
    mouth: 0.24,
    tilt: 0,
    sparkles: 28,
  },
  error: {
    shell: "#f3d9dd",
    face: "#1b0c11",
    core: "#fb7185",
    accent: "#fda4af",
    glow: "#e11d48",
    ringSpeed: 0.12,
    energy: 0.72,
    mouth: 0.01,
    tilt: 0.16,
    sparkles: 0,
  },
};

export function AvatarScene({ state }: { state: AvatarState }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0.46, 5.8], fov: 34 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
    >
      <color attach="background" args={["#050706"]} />
      <fog attach="fog" args={["#050706", 6, 11]} />

      <ambientLight intensity={0.32} />
      <hemisphereLight args={["#c7fff4", "#12100a", 0.62]} />
      <spotLight
        position={[2.6, 4.2, 3.5]}
        angle={0.42}
        penumbra={0.8}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-4, 2.2, -2]} intensity={0.75} color="#7dd3fc" />

      <PresentationControls
        global={false}
        cursor
        speed={1.2}
        zoom={1}
        rotation={[0.02, -0.08, 0]}
        polar={[-0.18, 0.18]}
        azimuth={[-0.35, 0.35]}
      >
        <Float speed={1.15} rotationIntensity={0.18} floatIntensity={0.48}>
          <Companion state={state} />
        </Float>
      </PresentationControls>

      <ContactShadows
        position={[0, -1.55, 0]}
        opacity={0.62}
        scale={6.5}
        blur={2.8}
        far={2.4}
        color="#000000"
      />
    </Canvas>
  );
}

function Companion({ state }: { state: AvatarState }) {
  const palette = PALETTES[state];
  const rig = useRef<Group>(null);
  const head = useRef<Mesh>(null);
  const visor = useRef<Mesh>(null);
  const chest = useRef<Mesh>(null);
  const core = useRef<Mesh>(null);
  const mouth = useRef<Mesh>(null);
  const leftEye = useRef<Mesh>(null);
  const rightEye = useRef<Mesh>(null);
  const haloA = useRef<Mesh>(null);
  const haloB = useRef<Mesh>(null);
  const baseRing = useRef<Mesh>(null);
  const innerLight = useRef<PointLight>(null);

  const targets = useMemo(
    () => ({
      shell: new Color(palette.shell),
      face: new Color(palette.face),
      core: new Color(palette.core),
      accent: new Color(palette.accent),
      glow: new Color(palette.glow),
    }),
    // Recompute the immutable color targets when the state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state],
  );

  useFrame((threeState, delta) => {
    const time = threeState.clock.elapsedTime;
    const speakingWave = Math.abs(Math.sin(time * 12.5));
    const listeningPulse = state === "listening" ? Math.sin(time * 6) * 0.045 : 0;

    if (rig.current) {
      rig.current.rotation.z = MathUtils.lerp(
        rig.current.rotation.z,
        palette.tilt,
        0.06,
      );
      rig.current.rotation.y = Math.sin(time * 0.42) * 0.1;
      rig.current.position.y = Math.sin(time * 1.1) * 0.035;
    }

    if (head.current) {
      const breath = 1 + Math.sin(time * 1.45) * 0.012;
      head.current.scale.set(0.84 * breath, 0.96 * breath, 0.74 * breath);
      const material = head.current.material as MeshStandardMaterial;
      material.color.lerp(targets.shell, 0.08);
      material.emissive.lerp(targets.glow, 0.06);
      material.emissiveIntensity = MathUtils.lerp(
        material.emissiveIntensity,
        palette.energy * 0.08,
        0.08,
      );
    }

    if (visor.current) {
      const material = visor.current.material as MeshStandardMaterial;
      material.color.lerp(targets.face, 0.1);
      material.emissive.lerp(targets.glow, 0.1);
      material.emissiveIntensity = MathUtils.lerp(
        material.emissiveIntensity,
        palette.energy * 0.42,
        0.1,
      );
    }

    if (chest.current) {
      const material = chest.current.material as MeshStandardMaterial;
      material.color.lerp(targets.shell, 0.08);
      material.emissive.lerp(targets.glow, 0.08);
      material.emissiveIntensity = MathUtils.lerp(
        material.emissiveIntensity,
        palette.energy * 0.06,
        0.08,
      );
    }

    if (core.current) {
      const pulse = 1 + Math.sin(time * (state === "thinking" ? 5.4 : 2.8)) * 0.08;
      core.current.scale.setScalar(pulse);
      const material = core.current.material as MeshStandardMaterial;
      material.color.lerp(targets.core, 0.12);
      material.emissive.lerp(targets.glow, 0.12);
      material.emissiveIntensity = MathUtils.lerp(
        material.emissiveIntensity,
        palette.energy * 1.4,
        0.12,
      );
    }

    if (mouth.current) {
      const targetOpen =
        state === "speaking"
          ? palette.mouth * (0.55 + speakingWave * 0.75)
          : palette.mouth;
      mouth.current.scale.y = MathUtils.lerp(
        mouth.current.scale.y,
        0.08 + targetOpen,
        0.28,
      );
      mouth.current.position.y = MathUtils.lerp(
        mouth.current.position.y,
        -0.22 - targetOpen * 0.16,
        0.22,
      );
      const material = mouth.current.material as MeshStandardMaterial;
      material.emissive.lerp(targets.glow, 0.1);
      material.emissiveIntensity = MathUtils.lerp(
        material.emissiveIntensity,
        palette.energy * 0.7,
        0.1,
      );
    }

    const blink = Math.sin(time * 0.82) > 0.965 ? 0.14 : 1;
    const errorSquint = state === "error" ? 0.46 : 1;
    const gazeX = Math.sin(time * 0.58) * 0.026 + Math.sin(time * 1.7) * 0.01;
    const gazeY = Math.cos(time * 0.5) * 0.015;

    [leftEye, rightEye].forEach((eye, index) => {
      if (!eye.current) return;
      eye.current.scale.y = MathUtils.lerp(
        eye.current.scale.y,
        blink * errorSquint,
        0.35,
      );
      eye.current.position.x = (index === 0 ? -0.23 : 0.23) + gazeX;
      eye.current.position.y = 0.12 + gazeY;
      const material = eye.current.material as MeshStandardMaterial;
      material.color.lerp(targets.accent, 0.12);
      material.emissive.lerp(targets.accent, 0.12);
      material.emissiveIntensity = MathUtils.lerp(
        material.emissiveIntensity,
        palette.energy * 1.15,
        0.1,
      );
    });

    if (haloA.current) {
      haloA.current.rotation.z += delta * palette.ringSpeed;
      haloA.current.rotation.x = Math.sin(time * 0.45) * 0.16;
      haloA.current.scale.setScalar(1 + listeningPulse);
      const material = haloA.current.material as MeshStandardMaterial;
      material.color.lerp(targets.accent, 0.1);
      material.emissive.lerp(targets.glow, 0.1);
      material.emissiveIntensity = MathUtils.lerp(
        material.emissiveIntensity,
        palette.energy,
        0.1,
      );
    }

    if (haloB.current) {
      haloB.current.rotation.z -= delta * palette.ringSpeed * 0.72;
      haloB.current.rotation.y = Math.sin(time * 0.38) * 0.2;
      const material = haloB.current.material as MeshStandardMaterial;
      material.color.lerp(targets.core, 0.1);
      material.emissive.lerp(targets.core, 0.1);
      material.emissiveIntensity = MathUtils.lerp(
        material.emissiveIntensity,
        palette.energy * 0.7,
        0.1,
      );
    }

    if (baseRing.current) {
      baseRing.current.rotation.z += delta * 0.18;
      baseRing.current.scale.setScalar(1 + Math.sin(time * 1.8) * 0.012);
      const material = baseRing.current.material as MeshStandardMaterial;
      material.color.lerp(targets.glow, 0.08);
      material.emissive.lerp(targets.glow, 0.08);
    }

    if (innerLight.current) {
      innerLight.current.color.lerp(targets.glow, 0.12);
      innerLight.current.intensity = MathUtils.lerp(
        innerLight.current.intensity,
        palette.energy * 3.2,
        0.1,
      );
    }
  });

  return (
    <group ref={rig} position={[0, -0.1, 0]} scale={0.62}>
      <mesh ref={baseRing} position={[0, -1.34, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.15, 0.018, 18, 160]} />
        <meshStandardMaterial
          color={palette.glow}
          emissive={palette.glow}
          emissiveIntensity={0.42}
          metalness={0.65}
          roughness={0.22}
          transparent
          opacity={0.72}
        />
      </mesh>

      <mesh ref={haloA} position={[0, 0.13, -0.18]} rotation={[0.15, 0.1, 0]}>
        <torusGeometry args={[1.06, 0.018, 24, 160]} />
        <meshStandardMaterial
          color={palette.accent}
          emissive={palette.glow}
          emissiveIntensity={0.8}
          metalness={0.72}
          roughness={0.18}
        />
      </mesh>
      <mesh ref={haloB} position={[0, -0.18, -0.1]} rotation={[1.15, 0.25, 0.6]}>
        <torusGeometry args={[0.88, 0.012, 18, 140]} />
        <meshStandardMaterial
          color={palette.core}
          emissive={palette.core}
          emissiveIntensity={0.55}
          metalness={0.68}
          roughness={0.2}
          transparent
          opacity={0.74}
        />
      </mesh>

      <group position={[0, -0.78, 0]}>
        <mesh ref={chest} castShadow receiveShadow scale={[0.72, 0.86, 0.48]}>
          <sphereGeometry args={[0.72, 64, 64]} />
          <meshStandardMaterial
            color={palette.shell}
            emissive={palette.glow}
            emissiveIntensity={0.05}
            metalness={0.28}
            roughness={0.46}
          />
        </mesh>
        <mesh ref={core} position={[0, 0.1, 0.47]} scale={[0.28, 0.28, 0.07]}>
          <sphereGeometry args={[1, 40, 24]} />
          <meshStandardMaterial
            color={palette.core}
            emissive={palette.glow}
            emissiveIntensity={1.1}
            metalness={0.35}
            roughness={0.18}
          />
        </mesh>
        <pointLight ref={innerLight} position={[0, 0.08, 0.58]} distance={3.5} intensity={2} />

        <mesh position={[-0.68, 0.08, 0.02]} castShadow scale={[0.23, 0.38, 0.23]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial
            color="#b9c9c5"
            emissive={palette.glow}
            emissiveIntensity={0.05}
            metalness={0.32}
            roughness={0.42}
          />
        </mesh>
        <mesh position={[0.68, 0.08, 0.02]} castShadow scale={[0.23, 0.38, 0.23]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial
            color="#b9c9c5"
            emissive={palette.glow}
            emissiveIntensity={0.05}
            metalness={0.32}
            roughness={0.42}
          />
        </mesh>
      </group>

      <mesh position={[0, -0.28, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.26, 0.34, 32]} />
        <meshStandardMaterial
          color="#9fb1ad"
          emissive={palette.glow}
          emissiveIntensity={0.05}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      <group position={[0, 0.28, 0]}>
        <mesh ref={head} castShadow receiveShadow scale={[0.84, 0.96, 0.74]}>
          <sphereGeometry args={[0.78, 80, 80]} />
          <meshStandardMaterial
            color={palette.shell}
            emissive={palette.glow}
            emissiveIntensity={0.07}
            metalness={0.24}
            roughness={0.38}
          />
        </mesh>

        <mesh ref={visor} position={[0, 0.08, 0.58]} scale={[0.54, 0.26, 0.06]}>
          <sphereGeometry args={[1, 40, 24]} />
          <meshStandardMaterial
            color={palette.face}
            emissive={palette.glow}
            emissiveIntensity={0.38}
            metalness={0.5}
            roughness={0.22}
          />
        </mesh>

        <mesh ref={leftEye} position={[-0.23, 0.12, 0.64]} scale={[0.1, 0.08, 0.035]}>
          <sphereGeometry args={[1, 28, 16]} />
          <meshStandardMaterial
            color={palette.accent}
            emissive={palette.accent}
            emissiveIntensity={1}
            metalness={0.15}
            roughness={0.15}
          />
        </mesh>
        <mesh ref={rightEye} position={[0.23, 0.12, 0.64]} scale={[0.1, 0.08, 0.035]}>
          <sphereGeometry args={[1, 28, 16]} />
          <meshStandardMaterial
            color={palette.accent}
            emissive={palette.accent}
            emissiveIntensity={1}
            metalness={0.15}
            roughness={0.15}
          />
        </mesh>

        <mesh ref={mouth} position={[0, -0.22, 0.65]} scale={[0.24, 0.08, 0.035]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#050706"
            emissive={palette.glow}
            emissiveIntensity={0.6}
            metalness={0.25}
            roughness={0.35}
          />
        </mesh>

        <mesh position={[-0.71, 0.03, -0.02]} rotation={[0, 0, -0.12]} scale={[0.12, 0.36, 0.18]}>
          <sphereGeometry args={[1, 28, 28]} />
          <meshStandardMaterial
            color="#aab9b5"
            emissive={palette.glow}
            emissiveIntensity={0.12}
            metalness={0.42}
            roughness={0.32}
          />
        </mesh>
        <mesh position={[0.71, 0.03, -0.02]} rotation={[0, 0, 0.12]} scale={[0.12, 0.36, 0.18]}>
          <sphereGeometry args={[1, 28, 28]} />
          <meshStandardMaterial
            color="#aab9b5"
            emissive={palette.glow}
            emissiveIntensity={0.12}
            metalness={0.42}
            roughness={0.32}
          />
        </mesh>
      </group>

      {palette.sparkles > 0 ? (
        <Sparkles
          count={palette.sparkles}
          scale={[2.4, 2.2, 2.2]}
          size={2.1}
          speed={0.42}
          color={palette.accent}
        />
      ) : null}
    </group>
  );
}
