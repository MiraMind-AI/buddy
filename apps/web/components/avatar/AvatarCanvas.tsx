"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

import type { AvatarState } from "@/features/avatar/useAvatar";

const stateColor: Record<AvatarState, string> = {
  idle: "#8b7cf6",
  listening: "#34d399",
  thinking: "#f59e0b",
  speaking: "#38bdf8",
  error: "#fb7185",
};

function AvatarModel({ state }: { state: AvatarState }) {
  const headRef = useRef<Mesh>(null);
  const mouthRef = useRef<Mesh>(null);
  const pulse =
    state === "listening" ? 0.08 : state === "thinking" ? 0.04 : 0.02;

  useFrame(({ clock }, delta) => {
    if (!headRef.current || !mouthRef.current) {
      return;
    }

    const elapsed = clock.getElapsedTime();
    headRef.current.rotation.y += delta * 0.35;
    headRef.current.position.y = Math.sin(elapsed * 1.4) * pulse;
    mouthRef.current.scale.y =
      state === "thinking" ? 1 + Math.sin(elapsed * 7) * 0.45 : 1;
  });

  return (
    <group>
      <mesh ref={headRef} position={[0, 0.18, 0]}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial
          color={stateColor[state]}
          roughness={0.34}
          metalness={0.12}
        />
      </mesh>
      <mesh position={[-0.34, 0.35, 0.86]}>
        <sphereGeometry args={[0.08, 24, 24]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[0.34, 0.35, 0.86]}>
        <sphereGeometry args={[0.08, 24, 24]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh ref={mouthRef} position={[0, -0.08, 0.93]}>
        <boxGeometry args={[0.44, 0.08, 0.06]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[0, -1.02, 0]}>
        <cylinderGeometry args={[0.64, 0.88, 0.62, 48]} />
        <meshStandardMaterial color="#222225" roughness={0.5} />
      </mesh>
    </group>
  );
}

export function AvatarCanvas({ state }: { state: AvatarState }) {
  return (
    <div className="h-full min-h-[260px] bg-[#121212]">
      <Canvas camera={{ position: [0, 0.1, 4.1], fov: 42 }} dpr={[1, 1.6]}>
        <color attach="background" args={["#121212"]} />
        <ambientLight intensity={0.72} />
        <directionalLight position={[3, 4, 5]} intensity={1.2} />
        <pointLight
          position={[-3, 1, 3]}
          intensity={0.7}
          color={stateColor[state]}
        />
        <AvatarModel state={state} />
      </Canvas>
    </div>
  );
}
