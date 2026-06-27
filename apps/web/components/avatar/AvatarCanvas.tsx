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
    <div className="relative h-full min-h-[320px] w-full overflow-hidden bg-[radial-gradient(circle_at_50%_38%,rgba(159,243,223,0.16),transparent_19rem),linear-gradient(180deg,#14231f_0%,#0c1211_58%,#070909_100%)]">
      <AvatarFallback />
      <AvatarScene state={state} />
    </div>
  );
}

function AvatarFallback() {
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      <div className="relative grid size-52 place-items-center rounded-full border border-white/10 bg-white/[0.03]">
        <div className="absolute inset-8 rounded-full border border-[#9ff3df]/25" />
        <div className="absolute inset-14 rounded-full bg-[#9ff3df]/12 blur-md" />
        <div className="size-24 rounded-full bg-[radial-gradient(circle_at_34%_28%,#ffffff_0%,#bff9ed_18%,#35bda4_55%,#0e5a4d_100%)] shadow-[0_0_48px_rgba(45,191,163,0.45)]" />
      </div>
    </div>
  );
}
