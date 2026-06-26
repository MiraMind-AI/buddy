"use client";

import { useEffect, useRef } from "react";

import { Spinner } from "@/components/ui/Spinner";
import type { Message } from "@/features/conversation/useConversation";
import { cn } from "@/lib/utils/cn";

export function MessageList({
  messages,
  isResponding,
}: {
  messages: Message[];
  isResponding: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isResponding]);

  return (
    <div className="min-h-0 overflow-y-auto px-4 py-5" aria-live="polite">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        {messages.length === 0 ? (
          <div className="mx-auto grid max-w-md place-items-center rounded-lg border border-white/10 bg-white/[0.04] px-6 py-8 text-center">
            <p className="text-sm font-medium text-stone-100">
              Ready when you are.
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-400">
              Buddy will keep the conversation here and keep memory controls
              visible.
            </p>
          </div>
        ) : null}

        {messages.map((message) => {
          const isUser = message.role === "user";

          return (
            <article
              key={message.id}
              className={cn(
                "flex items-end gap-3",
                isUser ? "justify-end" : "justify-start",
              )}
            >
              {!isUser ? (
                <div className="grid size-8 shrink-0 place-items-center rounded-lg border border-teal-200/20 bg-teal-200/10 text-xs font-semibold text-teal-50">
                  B
                </div>
              ) : null}
              <div
                className={cn(
                  "max-w-[82%] rounded-lg border px-4 py-3 text-sm leading-6 shadow-lg shadow-black/10",
                  isUser
                    ? "border-cyan-200/30 bg-cyan-200/[0.12] text-cyan-50"
                    : "border-white/10 bg-white/[0.06] text-stone-200",
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              {isUser ? (
                <div className="grid size-8 shrink-0 place-items-center rounded-lg border border-cyan-200/20 bg-cyan-200/10 text-xs font-semibold text-cyan-50">
                  Y
                </div>
              ) : null}
            </article>
          );
        })}

        {isResponding ? (
          <div className="flex items-end gap-3">
            <div className="grid size-8 place-items-center rounded-lg border border-amber-200/20 bg-amber-200/10 text-xs font-semibold text-amber-50">
              B
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-stone-300 shadow-lg shadow-black/10">
              <Spinner className="text-amber-200" />
              Thinking
            </div>
          </div>
        ) : null}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
