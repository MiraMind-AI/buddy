import { Button } from "@/components/ui/Button";
import type { Memory } from "@/features/memory/useMemory";

export function MemoryItem({
  memory,
  onRemove,
}: {
  memory: Memory;
  onRemove: (id: string) => void;
}) {
  return (
    <article className="rounded-md border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm leading-5 text-zinc-200">{memory.content}</p>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 text-zinc-400"
          onClick={() => onRemove(memory.id)}
        >
          Remove
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
        <span className="rounded-md bg-white/[0.07] px-2 py-1">
          {Math.round(memory.confidence * 100)}% confidence
        </span>
        <span className="rounded-md bg-white/[0.07] px-2 py-1">
          {memory.reviewed ? "Reviewed" : "Review"}
        </span>
      </div>
    </article>
  );
}
