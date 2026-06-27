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
      className="border-t border-black/5 bg-white p-3 sm:p-4"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-lg border border-black/10 bg-[#fbfbf7] p-2 shadow-inner sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={2}
            placeholder="Message Buddy"
            className="min-h-14 w-full resize-none rounded-md border border-transparent bg-transparent px-3 py-3 text-sm leading-5 text-[#111411] outline-none transition placeholder:text-[#8a918b] focus:border-[#8dc9be] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={!content.trim() || disabled}
          className="h-12 shrink-0 rounded-md bg-[#13221d] px-5 text-sm text-white shadow-sm hover:bg-[#1d332c] sm:w-28"
        >
          Send
        </Button>
      </div>
    </form>
  );
}
