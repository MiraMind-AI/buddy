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
    <section className="rounded-lg border border-black/5 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-[#111411]">Voice</h2>
          <p className="mt-1 text-sm capitalize text-[#667069]">{state}</p>
          <div className="mt-3 flex h-5 items-end gap-1">
            {[0, 1, 2, 3].map((bar) => (
              <span
                key={bar}
                className={cn(
                  "w-1.5 rounded-full transition-all",
                  isListening ? "bg-[#2bbfa3]" : "bg-black/15",
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
            "grid size-16 shrink-0 place-items-center rounded-full border text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#8dc9be]",
            isListening
              ? "border-[#2bbfa3] bg-[#9ff3df] text-[#10211c] shadow-sm"
              : "border-black/10 bg-[#f6f7f2] text-[#252a26] hover:bg-white",
          )}
        >
          {isListening ? "Stop" : "Talk"}
        </button>
      </div>
    </section>
  );
}
