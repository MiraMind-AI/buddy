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
    <article className="rounded-lg border border-black/5 bg-[#fbfbf7] p-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm leading-5 text-[#252a26]">{memory.content}</p>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Remove memory: ${memory.content}`}
          className="h-8 shrink-0 rounded-md px-2 text-[#7b827c] hover:bg-rose-50 hover:text-rose-700"
          onClick={() => onRemove(memory.id)}
        >
          Forget
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#667069]">
        <span className="rounded-md border border-black/5 bg-white px-2 py-1">
          {confidence}% confidence
        </span>
        <span className="rounded-md border border-black/5 bg-white px-2 py-1">
          {memory.reviewed ? "Reviewed" : "Review"}
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
        <div
          className="h-full rounded-full bg-[#2bbfa3]"
          style={{ width: `${confidence}%` }}
        />
      </div>
    </article>
  );
}
