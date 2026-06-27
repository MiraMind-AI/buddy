import type { VoiceState } from "@/features/voice/useVoice";
import { cn } from "@/lib/utils/cn";

const stateLabels: Record<VoiceState, string> = {
  idle: "Ready",
  listening: "Listening",
  sending: "Sending",
  speaking: "Speaking",
  unsupported: "Unsupported",
  error: "Needs attention",
};

export function VoiceButton({
  state,
  isListening,
  isSpeaking,
  isSending,
  autoSpeak,
  transcript,
  errorMessage,
  onToggle,
  onCancelSpeech,
  onToggleAutoSpeak,
}: {
  state: VoiceState;
  isListening: boolean;
  isSpeaking: boolean;
  isSending: boolean;
  autoSpeak: boolean;
  transcript: string;
  errorMessage?: string | null;
  onToggle: () => void;
  onCancelSpeech: () => void;
  onToggleAutoSpeak: () => void;
}) {
  const disabled = state === "unsupported" || isSending;
  const meterActive = isListening || isSpeaking || isSending;
  const buttonLabel = isListening ? "Stop" : "Talk";

  return (
    <section className="overflow-hidden rounded-lg border border-black/5 bg-white shadow-sm">
      <div className="border-b border-black/5 bg-[#fbfbf7] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-[#111411]">Voice</h2>
            <p className="mt-0.5 text-xs uppercase text-[#6d756f]">
              {stateLabels[state]}
            </p>
          </div>
          <button
            type="button"
            aria-pressed={autoSpeak}
            onClick={onToggleAutoSpeak}
            className={cn(
              "flex h-8 w-14 shrink-0 items-center rounded-full border p-1 transition focus:outline-none focus:ring-2 focus:ring-[#8dc9be]",
              autoSpeak
                ? "border-[#76d7c7] bg-[#dff8f2]"
                : "border-black/10 bg-white",
            )}
          >
            <span
              className={cn(
                "size-6 rounded-full shadow-sm transition",
                autoSpeak ? "translate-x-6 bg-[#106d5f]" : "bg-[#a4aba5]",
              )}
            />
          </button>
        </div>
      </div>

      <div className="grid gap-4 p-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-pressed={isListening}
            aria-label={isListening ? "Stop voice input" : "Start voice input"}
            onClick={onToggle}
            disabled={disabled}
            className={cn(
              "relative grid size-20 shrink-0 place-items-center rounded-full border text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#8dc9be] disabled:cursor-not-allowed disabled:opacity-45",
              isListening
                ? "border-[#1bb89d] bg-[#10211c] text-white shadow-[0_0_0_6px_rgba(43,191,163,0.12),0_18px_38px_rgba(16,33,28,0.28)]"
                : "border-black/10 bg-[#111411] text-white hover:bg-[#213028]",
            )}
          >
            <span
              className={cn(
                "absolute inset-2 rounded-full border",
                isListening ? "border-[#9ff3df]/65" : "border-white/10",
              )}
            />
            <span>{buttonLabel}</span>
          </button>

          <div className="min-w-0 flex-1 rounded-lg border border-black/5 bg-[#eef2ed] px-3 py-2">
            <div className="flex h-12 items-end gap-1.5">
              {[0, 1, 2, 3, 4, 5, 6].map((bar) => (
                <span
                  key={bar}
                  className={cn(
                    "w-1.5 rounded-full transition-all duration-300",
                    meterActive ? "bg-[#159a84]" : "bg-[#7f8a83]/45",
                    meterActive && bar % 3 === 0
                      ? "h-11"
                      : meterActive && bar % 2 === 0
                        ? "h-8"
                        : meterActive
                          ? "h-5"
                          : "h-3",
                  )}
                />
              ))}
            </div>
            <p className="mt-2 max-h-10 min-h-10 overflow-hidden text-sm leading-5 text-[#56615a]">
              {errorMessage ?? transcript ?? "Deutsch voice channel ready"}
            </p>
          </div>
        </div>

        {isSpeaking ? (
          <button
            type="button"
            onClick={onCancelSpeech}
            className="h-9 rounded-md border border-black/10 bg-white px-3 text-sm font-medium text-[#252a26] transition hover:bg-[#f6f7f2] focus:outline-none focus:ring-2 focus:ring-[#8dc9be]"
          >
            Stop reply audio
          </button>
        ) : null}
      </div>
    </section>
  );
}
