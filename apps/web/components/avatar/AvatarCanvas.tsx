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
    <div className="relative h-full min-h-[360px] w-full overflow-hidden bg-[linear-gradient(180deg,#0d1412_0%,#070a09_48%,#030404_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(45,212,191,0.12),transparent_32%),linear-gradient(260deg,rgba(251,191,36,0.09),transparent_38%)]" />
      <AvatarScene state={state} />
    </div>
  );
}

function AvatarFallback() {
  return (
    <div className="grid h-full place-items-center">
      <div className="grid gap-3 place-items-center">
        <div className="size-28 animate-pulse rounded-full border border-white/10 bg-white/[0.04]" />
        <div className="h-2 w-32 rounded-full bg-white/[0.06]" />
      </div>
    </div>
  );
}
