import type { ReactNode } from "react";

export function Sidebar({ children }: { children: ReactNode }) {
  return (
    <aside className="flex min-h-[220px] flex-col overflow-hidden rounded-lg bg-[#13221d] p-3 text-white shadow-sm lg:h-[calc(100dvh-104px)] lg:min-h-0">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-sm font-semibold text-white">Conversations</h2>
          <p className="mt-0.5 text-xs text-white/50">Recent sessions</p>
        </div>
        <span className="rounded-md border border-white/10 bg-white/10 px-2 py-1 text-xs text-white/70">
          Live
        </span>
      </div>
      {children}
    </aside>
  );
}
