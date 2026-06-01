"use client";

import { useEffect, useRef, useState } from "react";

import type { Message } from "@/features/conversation/useConversation";

// Estimated speaking duration until real text-to-speech reports actual
// playback time. Assumes ~3 spoken words per second, clamped to a sensible
// 1.2s–8s window so the avatar's "speaking" animation matches reply length.
function estimateSpeakingMs(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const ms = (words / 3) * 1000;
  return Math.min(8000, Math.max(1200, ms));
}

/**
 * Returns `true` for a short window after a new assistant message arrives,
 * driving the avatar's "speaking" state. Tracks the last spoken message id so
 * re-renders (e.g. cache updates) don't retrigger the animation.
 */
export function useSpeaking(messages: Message[]): boolean {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const lastSpokenId = useRef<string | null>(null);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return;
    if (lastSpokenId.current === last.id) return;
    lastSpokenId.current = last.id;

    setIsSpeaking(true);
    const timer = setTimeout(
      () => setIsSpeaking(false),
      estimateSpeakingMs(last.content),
    );
    return () => clearTimeout(timer);
  }, [messages]);

  return isSpeaking;
}
