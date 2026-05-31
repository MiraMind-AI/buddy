"use client";

import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/Button";

export function MessageInput({
  disabled,
  onSendMessage,
}: {
  disabled?: boolean;
  onSendMessage: (content: string) => Promise<void> | void;
}) {
  const [content, setContent] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!content.trim() || disabled) {
      return;
    }

    const message = content;
    setContent("");
    await onSendMessage(message);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-white/10 bg-black/25 p-4"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          disabled={disabled}
          rows={2}
          placeholder="Message Buddy"
          className="min-h-12 flex-1 resize-none rounded-md border border-white/10 bg-black/30 px-3 py-3 text-sm leading-5 text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={!content.trim() || disabled}
          className="sm:w-28"
        >
          Send
        </Button>
      </div>
    </form>
  );
}
