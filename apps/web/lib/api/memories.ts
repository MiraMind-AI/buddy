import { apiRequest } from "@/lib/api/client";

export interface Memory {
  id: string;
  content: string;
  confidence: number;
  reviewed: boolean;
  created_at: string;
}

export interface MemoryListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export function listMemories(params: MemoryListParams = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.search) search.set("search", params.search);
  const qs = search.toString();
  return apiRequest<Memory[]>(`/memories${qs ? `?${qs}` : ""}`);
}

export function deleteMemory(id: string) {
  return apiRequest<void>(`/memories/${id}`, { method: "DELETE" });
}
