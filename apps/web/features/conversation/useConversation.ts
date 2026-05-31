"use client";

import { useMemo, useState } from "react";

export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  lastMessage: string;
  messageCount: number;
  updatedAt: string;
}

const initialConversations: ConversationSummary[] = [
  {
    id: "morning-check-in",
    title: "Morning check-in",
    lastMessage: "Let us keep today light and deliberate.",
    messageCount: 4,
    updatedAt: "2026-05-26T08:15:00.000Z",
  },
  {
    id: "memory-review",
    title: "Memory review",
    lastMessage: "Three saved facts are ready for review.",
    messageCount: 7,
    updatedAt: "2026-05-25T18:40:00.000Z",
  },
  {
    id: "voice-session-plan",
    title: "Voice session plan",
    lastMessage: "Manual push-to-talk is the first stable path.",
    messageCount: 5,
    updatedAt: "2026-05-24T11:20:00.000Z",
  },
];

const initialMessages: Record<string, Message[]> = {
  "morning-check-in": [
    {
      id: "msg-1",
      role: "assistant",
      content:
        "Good morning. I kept the workspace calm and ready for the next decision.",
      createdAt: "2026-05-26T08:11:00.000Z",
    },
    {
      id: "msg-2",
      role: "user",
      content: "I want one useful step forward, not a pile of options.",
      createdAt: "2026-05-26T08:12:00.000Z",
    },
    {
      id: "msg-3",
      role: "assistant",
      content:
        "Then I will keep the surface narrow: conversation first, memory visible, voice ready when the backend catches up.",
      createdAt: "2026-05-26T08:15:00.000Z",
    },
  ],
  "memory-review": [
    {
      id: "msg-4",
      role: "assistant",
      content: "The memory panel should always show what I believe I know.",
      createdAt: "2026-05-25T18:40:00.000Z",
    },
  ],
  "voice-session-plan": [
    {
      id: "msg-5",
      role: "assistant",
      content:
        "Voice can start as a clear state machine before streaming arrives.",
      createdAt: "2026-05-24T11:20:00.000Z",
    },
  ],
};

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createAssistantReply(content: string) {
  const normalized = content.toLowerCase();

  if (normalized.includes("memory")) {
    return "I will keep memory visible and editable, so stored facts never become a hidden layer.";
  }

  if (normalized.includes("voice")) {
    return "Voice can stay manual for now: clear states, quick feedback, and no raw audio stored.";
  }

  return "I have that. I will keep the next move small, concrete, and easy to verify.";
}

export function useConversation() {
  const [selectedConversationId, setSelectedConversationId] = useState(
    initialConversations[0].id,
  );
  const [conversations, setConversations] = useState(initialConversations);
  const [messagesByConversation, setMessagesByConversation] =
    useState(initialMessages);
  const [isResponding, setIsResponding] = useState(false);

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.id === selectedConversationId,
      ) ?? conversations[0],
    [conversations, selectedConversationId],
  );

  const messages = messagesByConversation[selectedConversation.id] ?? [];

  async function sendMessage(content: string) {
    const trimmed = content.trim();

    if (!trimmed || isResponding) {
      return;
    }

    const now = new Date().toISOString();
    const userMessage: Message = {
      id: createId("user"),
      role: "user",
      content: trimmed,
      createdAt: now,
    };

    setMessagesByConversation((current) => ({
      ...current,
      [selectedConversation.id]: [
        ...(current[selectedConversation.id] ?? []),
        userMessage,
      ],
    }));
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === selectedConversation.id
          ? {
              ...conversation,
              lastMessage: trimmed,
              messageCount: conversation.messageCount + 1,
              updatedAt: now,
            }
          : conversation,
      ),
    );

    setIsResponding(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const assistantMessage: Message = {
      id: createId("assistant"),
      role: "assistant",
      content: createAssistantReply(trimmed),
      createdAt: new Date().toISOString(),
    };

    setMessagesByConversation((current) => ({
      ...current,
      [selectedConversation.id]: [
        ...(current[selectedConversation.id] ?? []),
        assistantMessage,
      ],
    }));
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === selectedConversation.id
          ? {
              ...conversation,
              lastMessage: assistantMessage.content,
              messageCount: conversation.messageCount + 1,
              updatedAt: assistantMessage.createdAt,
            }
          : conversation,
      ),
    );
    setIsResponding(false);
  }

  return {
    conversations,
    messages,
    selectedConversation,
    selectedConversationId,
    isResponding,
    selectConversation: setSelectedConversationId,
    sendMessage,
  };
}
