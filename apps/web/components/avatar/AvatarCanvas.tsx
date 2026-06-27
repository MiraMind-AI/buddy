"use client";

import dynamic from "next/dynamic";

import type { AvatarState } from "@/features/avatar/useAvatar";

const AvatarScene = dynamic(
  () => import("./AvatarScene").then((mod) => mod.AvatarScene),
  {
    ssr: false,
    loading: () => <AvatarFallback />,
  },
);

export function AvatarCanvas({ state }: { state: AvatarState }) {
  return (
    <div className="relative h-full min-h-[320px] w-full overflow-hidden bg-[radial-gradient(circle_at_50%_28%,rgba(255,255,255,0.16),transparent_12rem),radial-gradient(circle_at_52%_52%,rgba(73,215,195,0.22),transparent_17rem),linear-gradient(180deg,#151a1d_0%,#090b0d_62%,#050607_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:36px_36px] opacity-30" />
      <div className="pointer-events-none absolute inset-x-10 bottom-8 h-24 rounded-full bg-[#49d7c3]/12 blur-3xl" />
      <AvatarFallback />
      <AvatarScene state={state} />
    </div>
  );
}

function AvatarFallback() {
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      <div className="relative grid size-56 place-items-center rounded-full border border-white/10 bg-white/[0.035] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <div className="absolute inset-6 rounded-full border border-[#9ff3df]/18" />
        <div className="absolute inset-12 rounded-full bg-[#49d7c3]/14 blur-xl" />
        <div className="size-24 rounded-full bg-[radial-gradient(circle_at_35%_24%,#ffffff_0%,#d9fff7_19%,#4fd8c3_48%,#1f6f65_100%)] shadow-[0_0_58px_rgba(73,215,195,0.48)]" />
        <div className="absolute bottom-7 h-8 w-36 rounded-full bg-black/28 blur-md" />
      </div>
    </div>
  );
}
