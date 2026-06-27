import type { VoiceState } from "@/features/voice/useVoice";
import type { AvatarState } from "@/features/avatar/useAvatar";

const avatarLabels: Record<AvatarState, string> = {
  idle: "Ready",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
  error: "Needs attention",
};

const voiceLabels: Record<VoiceState, string> = {
  idle: "Ready",
  listening: "Listening",
  sending: "Sending",
  speaking: "Speaking",
  unsupported: "Unsupported",
  error: "Attention",
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
    <header className="flex flex-col gap-4 rounded-lg border border-black/5 bg-white/75 px-4 py-3 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-[#11201b] shadow-sm">
          <span className="text-lg font-semibold text-[#9ff3df]">B</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#147967]">Buddy</p>
          <h1 className="mt-0.5 text-xl font-semibold text-[#111411] sm:text-2xl">
            Companion workspace
          </h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm text-[#46514b]">
        <span className="inline-flex h-9 items-center gap-2 rounded-lg border border-emerald-700/10 bg-emerald-50 px-3 text-emerald-900">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          {avatarLabels[avatarState]}
        </span>
        <span className="inline-flex h-9 items-center rounded-lg border border-amber-700/10 bg-amber-50 px-3 text-amber-900">
          Voice {voiceLabels[voiceState]}
        </span>
        <span className="inline-flex h-9 items-center rounded-lg border border-black/5 bg-[#f6f7f2] px-3 text-[#46514b]">
          {memoryCount} memories
        </span>
      </div>
    </header>
  );
}
