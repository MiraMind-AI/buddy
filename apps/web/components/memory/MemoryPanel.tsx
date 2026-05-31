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
    <section className="min-h-[360px] rounded-md border border-white/10 bg-[#101010] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-zinc-100">Memory</h2>
        <span className="rounded-md bg-white/[0.07] px-2 py-1 text-xs text-zinc-400">
          {memories.length} saved
        </span>
      </div>

      <div className="space-y-2">
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
