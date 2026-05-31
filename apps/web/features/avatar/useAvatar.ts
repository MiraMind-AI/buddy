"use client";

export type AvatarState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "error";

export function useAvatar({
  isListening,
  isResponding,
}: {
  isListening: boolean;
  isResponding: boolean;
}) {
  const state: AvatarState = isListening
    ? "listening"
    : isResponding
      ? "thinking"
      : "idle";

  return {
    state,
    label: state[0].toUpperCase() + state.slice(1),
  };
}
