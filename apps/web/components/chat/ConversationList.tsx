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
    <div className="space-y-2">
      <button
        type="button"
        onClick={onCreateConversation}
        className="w-full rounded-md border border-dashed border-white/15 px-3 py-2 text-left text-xs uppercase tracking-wider text-zinc-400 transition hover:border-accent/40 hover:text-zinc-100"
      >
        + New conversation
      </button>
      {conversations.length === 0 ? (
        <p className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm text-zinc-400">
          No conversations yet. Start one from the input below.
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
              "grid w-full gap-1 rounded-md border p-3 text-left transition",
              selected
                ? "border-accent/60 bg-accent/15"
                : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]",
            )}
          >
            <span className="truncate text-sm font-medium text-zinc-100">
              {conversation.title}
            </span>
            <span className="text-xs text-zinc-500">
              {conversation.message_count} messages
            </span>
          </button>
        );
      })}
    </div>
  );
}
