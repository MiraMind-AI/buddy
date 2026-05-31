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
    <div className="overflow-y-auto px-4 py-5" aria-live="polite">
      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        {messages.map((message) => {
          const isUser = message.role === "user";

          return (
            <article
              key={message.id}
              className={cn("flex", isUser ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[82%] rounded-md border px-4 py-3 text-sm leading-6",
                  isUser
                    ? "border-accent/50 bg-accent/20 text-zinc-50"
                    : "border-white/10 bg-white/[0.06] text-zinc-200",
                )}
              >
                <p>{message.content}</p>
              </div>
            </article>
          );
        })}

        {isResponding ? (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-zinc-300">
              <Spinner className="text-accent" />
              Thinking
            </div>
          </div>
        ) : null}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
