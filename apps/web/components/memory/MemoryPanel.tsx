import { MemoryItem } from "@/components/memory/MemoryItem";
import type { Memory } from "@/features/memory/useMemory";

export function MemoryPanel({
  memories,
  onRemoveMemory,
}: {
  memories: Memory[];
  onRemoveMemory: (id: string) => void;
}) {
  return (
    <section className="flex min-h-[360px] flex-col overflow-hidden rounded-lg border border-white/10 bg-stone-950/70 p-3 shadow-2xl shadow-black/20 backdrop-blur-xl xl:min-h-0">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-sm font-semibold text-stone-100">Memory</h2>
          <p className="mt-0.5 text-xs text-stone-500">Visible and removable</p>
        </div>
        <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-1 text-xs text-stone-400">
          {memories.length} saved
        </span>
      </div>

      <div className="min-h-0 space-y-2 overflow-y-auto pr-1">
        {memories.length === 0 ? (
          <p className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm leading-5 text-stone-400">
            Nothing saved right now.
          </p>
        ) : null}
        {memories.map((memory) => (
          <MemoryItem
            key={memory.id}
            memory={memory}
            onRemove={onRemoveMemory}
          />
        ))}
      </div>
    </section>
  );
}
