"use client";

import { type FormEvent, type KeyboardEvent, useState } from "react";

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

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || disabled) {
      return;
    }

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-white/10 bg-black/20 p-3 sm:p-4"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-2 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={2}
            placeholder="Message Buddy"
            className="min-h-14 w-full resize-none rounded-md border border-transparent bg-transparent px-3 py-3 text-sm leading-5 text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-teal-200/30 focus:bg-black/20 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <div className="px-3 pb-1 text-xs text-stone-500">
            {content.trim().length} characters
          </div>
        </div>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={!content.trim() || disabled}
          className="h-12 shrink-0 rounded-md bg-teal-300 px-5 text-sm text-teal-950 shadow-lg shadow-teal-950/20 hover:bg-teal-200 sm:w-28"
        >
          Send
        </Button>
      </div>
    </form>
  );
}
