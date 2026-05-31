import type { ConversationSummary } from "@/features/conversation/useConversation";
import { cn } from "@/lib/utils/cn";

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
}: {
  conversations: ConversationSummary[];
  selectedConversationId: string;
  onSelectConversation: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const selected = conversation.id === selectedConversationId;

        return (
          <button
            key={conversation.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelectConversation(conversation.id)}
            className={cn(
              "grid w-full gap-2 rounded-md border p-3 text-left transition",
              selected
                ? "border-accent/60 bg-accent/15"
                : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]",
            )}
          >
            <span className="truncate text-sm font-medium text-zinc-100">
              {conversation.title}
            </span>
            <span className="line-clamp-2 min-h-10 text-sm text-zinc-400">
              {conversation.lastMessage}
            </span>
            <span className="text-xs text-zinc-500">
              {conversation.messageCount} messages
            </span>
          </button>
        );
      })}
    </div>
  );
}
