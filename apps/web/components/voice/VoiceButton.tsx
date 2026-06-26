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
    <section className="rounded-lg border border-white/10 bg-stone-950/70 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-stone-100">Voice</h2>
          <p className="mt-1 text-sm capitalize text-stone-400">{state}</p>
          <div className="mt-3 flex h-5 items-end gap-1">
            {[0, 1, 2, 3].map((bar) => (
              <span
                key={bar}
                className={cn(
                  "w-1.5 rounded-full transition-all",
                  isListening ? "bg-teal-200" : "bg-white/20",
                  isListening && bar % 2 === 0 ? "h-5" : "h-3",
                )}
              />
            ))}
          </div>
        </div>
        <button
          type="button"
          aria-pressed={isListening}
          aria-label={isListening ? "Stop voice input" : "Start voice input"}
          onClick={onToggle}
          className={cn(
            "grid size-16 shrink-0 place-items-center rounded-full border text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-teal-200/30",
            isListening
              ? "border-teal-200/50 bg-teal-200 text-teal-950 shadow-lg shadow-teal-500/20"
              : "border-white/10 bg-white/[0.07] text-stone-100 hover:bg-white/[0.11]",
          )}
        >
          {isListening ? "Stop" : "Talk"}
        </button>
      </div>
    </section>
  );
}
