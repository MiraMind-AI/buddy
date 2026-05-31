"use client";

import { useState } from "react";

export interface Memory {
  id: string;
  content: string;
  confidence: number;
  reviewed: boolean;
  createdAt: string;
}

const initialMemories: Memory[] = [
  {
    id: "memory-1",
    content: "Prefers concise, concrete next steps.",
    confidence: 0.94,
    reviewed: true,
    createdAt: "2026-05-26T08:00:00.000Z",
  },
  {
    id: "memory-2",
    content: "Wants memory controls to stay visible in the main workspace.",
    confidence: 0.88,
    reviewed: true,
    createdAt: "2026-05-25T17:30:00.000Z",
  },
  {
    id: "memory-3",
    content: "Raw audio should not be stored.",
    confidence: 0.8,
    reviewed: false,
    createdAt: "2026-05-24T10:15:00.000Z",
  },
];

export function useMemory() {
  const [memories, setMemories] = useState(initialMemories);

  function removeMemory(id: string) {
    setMemories((current) => current.filter((memory) => memory.id !== id));
  }

  return { memories, removeMemory };
}
