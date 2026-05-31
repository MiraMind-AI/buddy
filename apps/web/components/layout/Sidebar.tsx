import type { ReactNode } from "react";

export function Sidebar({ children }: { children: ReactNode }) {
  return (
    <aside className="min-h-[360px] rounded-md border border-white/10 bg-[#101010] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-zinc-100">Conversations</h2>
        <span className="rounded-md bg-white/[0.07] px-2 py-1 text-xs text-zinc-400">
          Recent
        </span>
      </div>
      {children}
    </aside>
  );
}
