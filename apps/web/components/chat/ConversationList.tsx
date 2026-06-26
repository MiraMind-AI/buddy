import type { ConversationSummary } from "@/features/conversation/useConversation";
import { cn } from "@/lib/utils/cn";

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onCreateConversation,
}: {
  conversations: ConversationSummary[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onCreateConversation?: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <button
        type="button"
        onClick={onCreateConversation}
        className="flex h-11 w-full items-center justify-between rounded-lg border border-teal-200/20 bg-teal-200/10 px-3 text-left text-sm font-medium text-teal-50 transition hover:border-teal-200/35 hover:bg-teal-200/15 focus:outline-none focus:ring-2 focus:ring-teal-200/30"
      >
        <span>New conversation</span>
        <span className="grid size-7 place-items-center rounded-md bg-teal-100 text-lg leading-none text-teal-950">
          +
        </span>
      </button>

      <div className="min-h-0 space-y-2 overflow-y-auto pr-1">
      {conversations.length === 0 ? (
        <p className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm leading-5 text-stone-400">
          No conversations yet.
        </p>
      ) : null}
      {conversations.map((conversation) => {
        const selected = conversation.id === selectedConversationId;

        return (
          <button
            key={conversation.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelectConversation(conversation.id)}
            className={cn(
              "grid w-full gap-2 rounded-lg border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-teal-200/25",
              selected
                ? "border-teal-200/45 bg-teal-200/[0.12] shadow-lg shadow-teal-950/20"
                : "border-white/10 bg-white/[0.04] hover:border-white/15 hover:bg-white/[0.07]",
            )}
          >
            <span className="flex min-w-0 items-start justify-between gap-3">
              <span className="truncate text-sm font-medium text-stone-100">
                {conversation.title}
              </span>
              <span
                className={cn(
                  "mt-1 size-2 shrink-0 rounded-full",
                  selected ? "bg-teal-200" : "bg-white/20",
                )}
              />
            </span>
            <span className="text-xs text-stone-500">
              {conversation.message_count} messages
            </span>
          </button>
        );
      })}
      </div>
    </div>
  );
}
