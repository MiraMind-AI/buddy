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
        className="flex h-11 w-full items-center justify-between rounded-lg bg-[#9ff3df] px-3 text-left text-sm font-semibold text-[#10211c] shadow-sm transition hover:bg-[#b9f8ea] focus:outline-none focus:ring-2 focus:ring-white/40"
      >
        <span>New conversation</span>
        <span className="grid size-7 place-items-center rounded-md bg-[#10211c] text-lg leading-none text-white">
          +
        </span>
      </button>

      <div className="min-h-0 space-y-2 overflow-y-auto pr-1">
      {conversations.length === 0 ? (
        <p className="rounded-lg border border-white/10 bg-white/10 p-3 text-sm leading-5 text-white/70">
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
              "grid w-full gap-2 rounded-lg border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-white/30",
              selected
                ? "border-[#9ff3df]/70 bg-white/[0.14]"
                : "border-white/10 bg-white/[0.06] hover:border-white/20 hover:bg-white/10",
            )}
          >
            <span className="flex min-w-0 items-start justify-between gap-3">
              <span className="truncate text-sm font-medium text-white">
                {conversation.title}
              </span>
              <span
                className={cn(
                  "mt-1 size-2 shrink-0 rounded-full",
                  selected ? "bg-[#9ff3df]" : "bg-white/25",
                )}
              />
            </span>
            <span className="text-xs text-white/45">
              {conversation.message_count} messages
            </span>
          </button>
        );
      })}
      </div>
    </div>
  );
}
