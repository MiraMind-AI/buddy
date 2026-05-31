import { apiRequest } from "@/lib/api/client";

export type MessageRole = "user" | "assistant" | "system";

export interface ConversationSummary {
  id: string;
  title: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

export interface ConversationDetail {
  id: string;
  title: string;
  messages: ConversationMessage[];
  created_at: string;
}

export function listConversations() {
  return apiRequest<ConversationSummary[]>("/conversations");
}

export function getConversation(id: string) {
  return apiRequest<ConversationDetail>(`/conversations/${id}`);
}

export function createConversation(title?: string) {
  return apiRequest<ConversationSummary>("/conversations", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export function sendConversationMessage(id: string, content: string) {
  return apiRequest<ConversationMessage>(`/conversations/${id}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}
