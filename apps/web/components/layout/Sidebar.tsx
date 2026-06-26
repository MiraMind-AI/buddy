import type { ReactNode } from "react";

export function Sidebar({ children }: { children: ReactNode }) {
  return (
    <aside className="flex min-h-[320px] flex-col overflow-hidden rounded-lg border border-white/10 bg-stone-950/70 p-3 shadow-2xl shadow-black/20 backdrop-blur-xl lg:min-h-0 lg:h-[calc(100dvh-104px)]">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-sm font-semibold text-stone-100">Conversations</h2>
          <p className="mt-0.5 text-xs text-stone-500">Recent sessions</p>
        </div>
        <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-1 text-xs text-stone-400">
          Live
        </span>
      </div>
      {children}
    </aside>
  );
}
