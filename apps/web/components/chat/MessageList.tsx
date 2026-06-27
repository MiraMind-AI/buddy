"use client";

import { useEffect, useRef } from "react";

import { Spinner } from "@/components/ui/Spinner";
import type { Message } from "@/features/conversation/useConversation";
import { cn } from "@/lib/utils/cn";

export function MessageList({
  messages,
  isResponding,
  errorMessage,
}: {
  messages: Message[];
  isResponding: boolean;
  errorMessage?: string | null;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isResponding]);

  return (
    <div className="min-h-0 overflow-y-auto bg-[#fbfbf7] px-4 py-5" aria-live="polite">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        {messages.length === 0 ? (
          <div className="mx-auto grid max-w-lg place-items-center rounded-lg border border-black/5 bg-white px-6 py-8 text-center shadow-sm">
            <p className="text-base font-semibold text-[#111411]">
              Start a private thread.
            </p>
            <p className="mt-2 text-sm leading-6 text-[#667069]">
              A calm place for the next conversation.
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
                <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#13221d] text-xs font-semibold text-[#9ff3df] shadow-sm">
                  B
                </div>
              ) : null}
              <div
                className={cn(
                  "max-w-[82%] rounded-lg border px-4 py-3 text-sm leading-6 shadow-sm",
                  isUser
                    ? "border-[#8dc9be] bg-[#e7f5f1] text-[#10211c]"
                    : "border-black/5 bg-white text-[#252a26]",
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              {isUser ? (
                <div className="grid size-8 shrink-0 place-items-center rounded-lg border border-black/5 bg-white text-xs font-semibold text-[#355249] shadow-sm">
                  Y
                </div>
              ) : null}
            </article>
          );
        })}

        {isResponding ? (
          <div className="flex items-end gap-3">
            <div className="grid size-8 place-items-center rounded-lg bg-[#13221d] text-xs font-semibold text-[#9ff3df]">
              B
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-black/5 bg-white px-4 py-3 text-sm text-[#58625c] shadow-sm">
              <Spinner className="text-[#147967]" />
              Thinking
            </div>
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mx-auto max-w-xl rounded-lg border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950 shadow-sm">
            Buddy could not reply. {errorMessage}
          </div>
        ) : null}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
