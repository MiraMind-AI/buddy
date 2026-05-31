import type { VoiceState } from "@/features/voice/useVoice";
import { cn } from "@/lib/utils/cn";

export function VoiceButton({
  state,
  isListening,
  onToggle,
}: {
  state: VoiceState;
  isListening: boolean;
  onToggle: () => void;
}) {
  return (
    <section className="rounded-md border border-white/10 bg-[#101010] p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-100">Voice</h2>
          <p className="mt-1 text-sm capitalize text-zinc-400">{state}</p>
        </div>
        <button
          type="button"
          aria-pressed={isListening}
          onClick={onToggle}
          className={cn(
            "grid size-16 place-items-center rounded-full border text-sm font-semibold transition",
            isListening
              ? "border-emerald-300/50 bg-emerald-400/20 text-emerald-50 shadow-lg shadow-emerald-500/20"
              : "border-white/10 bg-white/[0.07] text-zinc-100 hover:bg-white/[0.11]",
          )}
        >
          {isListening ? "Stop" : "Talk"}
        </button>
      </div>
    </section>
  );
}
