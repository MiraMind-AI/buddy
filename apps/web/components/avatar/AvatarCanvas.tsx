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
    <div className="relative h-full min-h-[260px] w-full overflow-hidden bg-gradient-to-b from-[#0c0c12] via-[#0a0a10] to-[#050507]">
      <AvatarScene state={state} />
    </div>
  );
}

function AvatarFallback() {
  return (
    <div className="grid h-full place-items-center">
      <div className="size-32 animate-pulse rounded-full bg-white/5" />
    </div>
  );
}
