"use client";

import { useState } from "react";

export type VoiceState = "idle" | "listening";

export function useVoice() {
  const [state, setState] = useState<VoiceState>("idle");

  function toggleVoice() {
    setState((current) => (current === "listening" ? "idle" : "listening"));
  }

  return {
    state,
    isListening: state === "listening",
    toggleVoice,
  };
}
