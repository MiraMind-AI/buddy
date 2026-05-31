import type { VoiceState } from "@/features/voice/useVoice";

export function Header({ voiceState }: { voiceState: VoiceState }) {
  return (
    <header className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-medium text-accent">Buddy</p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-50 sm:text-3xl">
          Conversation workspace
        </h1>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-300">
        <span className="rounded-md border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-emerald-100">
          API ready
        </span>
        <span className="rounded-md border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-amber-100">
          Voice {voiceState}
        </span>
      </div>
    </header>
  );
}
