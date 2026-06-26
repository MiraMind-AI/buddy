import type { VoiceState } from "@/features/voice/useVoice";
import type { AvatarState } from "@/features/avatar/useAvatar";

const avatarLabels: Record<AvatarState, string> = {
  idle: "Ready",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
  error: "Needs attention",
};

export function Header({
  voiceState,
  avatarState,
  memoryCount,
}: {
  voiceState: VoiceState;
  avatarState: AvatarState;
  memoryCount: number;
}) {
  return (
    <header className="flex flex-col gap-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.08] shadow-lg shadow-black/20">
          <span className="text-lg font-semibold text-teal-100">B</span>
        </div>
        <div>
          <p className="text-sm font-medium text-teal-200">Buddy</p>
          <h1 className="mt-0.5 text-xl font-semibold text-stone-50 sm:text-2xl">
            Private companion workspace
          </h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm text-stone-300">
        <span className="inline-flex h-9 items-center gap-2 rounded-lg border border-teal-300/20 bg-teal-300/10 px-3 text-teal-50">
          <span className="size-1.5 rounded-full bg-teal-200 shadow-[0_0_12px_rgba(94,234,212,0.8)]" />
          {avatarLabels[avatarState]}
        </span>
        <span className="inline-flex h-9 items-center rounded-lg border border-amber-300/20 bg-amber-300/10 px-3 text-amber-50">
          Voice {voiceState}
        </span>
        <span className="inline-flex h-9 items-center rounded-lg border border-white/10 bg-white/[0.06] px-3 text-stone-200">
          {memoryCount} memories
        </span>
      </div>
    </header>
  );
}
