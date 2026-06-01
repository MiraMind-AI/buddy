"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import {
  type ConversationDetail,
  type ConversationMessage,
  type ConversationSummary,
  createConversation,
  getConversation,
  listConversations,
  sendConversationMessage,
} from "@/lib/api/conversations";

export type Message = ConversationMessage;
export type MessageRole = ConversationMessage["role"];
export type { ConversationSummary };

const conversationsKey = ["conversations"] as const;
const conversationKey = (id: string | null) => ["conversation", id] as const;

const EMPTY_LIST: ConversationSummary[] = [];

export function useConversation() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: conversationsKey,
    queryFn: listConversations,
  });

  const conversations = listQuery.data ?? EMPTY_LIST;

  useEffect(() => {
    if (selectedId && conversations.some((c) => c.id === selectedId)) {
      return;
    }
    if (conversations.length > 0) {
      setSelectedId(conversations[0].id);
    } else if (selectedId !== null) {
      setSelectedId(null);
    }
  }, [conversations, selectedId]);

  const detailQuery = useQuery({
    queryKey: conversationKey(selectedId),
    queryFn: () => getConversation(selectedId as string),
    enabled: Boolean(selectedId),
  });

  const createMutation = useMutation({
    mutationFn: (title?: string) => createConversation(title),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: conversationsKey });
      setSelectedId(created.id);
    },
  });

  const sendMutation = useMutation({
    mutationFn: async ({
      conversationId,
      content,
    }: {
      conversationId: string;
      content: string;
    }) => {
      const userMessage: ConversationMessage = {
        id: `pending-${Date.now()}`,
        role: "user",
        content,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData<ConversationDetail>(
        conversationKey(conversationId),
        (current) =>
          current
            ? { ...current, messages: [...current.messages, userMessage] }
            : current,
      );

      const reply = await sendConversationMessage(conversationId, content);
      return { conversationId, reply };
    },
    onSuccess: ({ conversationId, reply }) => {
      queryClient.setQueryData<ConversationDetail>(
        conversationKey(conversationId),
        (current) =>
          current
            ? { ...current, messages: [...current.messages, reply] }
            : current,
      );
      queryClient.invalidateQueries({ queryKey: conversationsKey });
    },
    onError: (_error, variables) => {
      queryClient.invalidateQueries({
        queryKey: conversationKey(variables.conversationId),
      });
    },
  });

  const selectedConversation = useMemo(() => {
    if (!selectedId) return null;
    return conversations.find((c) => c.id === selectedId) ?? null;
  }, [conversations, selectedId]);

  const messages = detailQuery.data?.messages ?? [];

  async function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed) return;

    let conversationId = selectedId;
    if (!conversationId) {
      const created = await createMutation.mutateAsync(undefined);
      conversationId = created.id;
    }

    await sendMutation.mutateAsync({ conversationId, content: trimmed });
  }

  async function startNewConversation() {
    await createMutation.mutateAsync(undefined);
  }

  return {
    conversations,
    messages,
    selectedConversation,
    selectedConversationId: selectedId,
    isLoading: listQuery.isLoading || detailQuery.isLoading,
    isResponding: sendMutation.isPending,
    error:
      listQuery.error ??
      detailQuery.error ??
      sendMutation.error ??
      createMutation.error ??
      null,
    selectConversation: setSelectedId,
    sendMessage,
    startNewConversation,
  };
}
