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
    <section className="flex min-h-[300px] flex-col overflow-hidden rounded-lg border border-black/5 bg-white p-3 shadow-sm lg:min-h-0">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-sm font-semibold text-[#111411]">Memory</h2>
          <p className="mt-0.5 text-xs text-[#7b827c]">Private notes</p>
        </div>
        <span className="rounded-md border border-black/5 bg-[#f6f7f2] px-2 py-1 text-xs text-[#58625c]">
          {memories.length} saved
        </span>
      </div>

      <div className="min-h-0 space-y-2 overflow-y-auto pr-1">
        {memories.length === 0 ? (
          <p className="rounded-lg border border-black/5 bg-[#fbfbf7] p-3 text-sm leading-5 text-[#667069]">
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
