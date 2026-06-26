import { Button } from "@/components/ui/Button";
import type { Memory } from "@/features/memory/useMemory";

export function MemoryItem({
  memory,
  onRemove,
}: {
  memory: Memory;
  onRemove: (id: string) => void;
}) {
  const confidence = Math.round(memory.confidence * 100);

  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.04] p-3 shadow-lg shadow-black/10">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm leading-5 text-stone-200">{memory.content}</p>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Remove memory: ${memory.content}`}
          className="h-8 shrink-0 rounded-md px-2 text-stone-400 hover:text-rose-100"
          onClick={() => onRemove(memory.id)}
        >
          Forget
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone-500">
        <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-1">
          {confidence}% confidence
        </span>
        <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-1">
          {memory.reviewed ? "Reviewed" : "Review"}
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-teal-200"
          style={{ width: `${confidence}%` }}
        />
      </div>
    </article>
  );
}
