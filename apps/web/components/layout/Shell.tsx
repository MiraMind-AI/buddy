"use client";

import { AvatarCanvas } from "@/components/avatar/AvatarCanvas";
import { ConversationList } from "@/components/chat/ConversationList";
import { MessageInput } from "@/components/chat/MessageInput";
import { MessageList } from "@/components/chat/MessageList";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MemoryPanel } from "@/components/memory/MemoryPanel";
import { VoiceButton } from "@/components/voice/VoiceButton";
import { useAvatar } from "@/features/avatar/useAvatar";
import { useSpeaking } from "@/features/avatar/useSpeaking";
import { useConversation } from "@/features/conversation/useConversation";
import { useMemory } from "@/features/memory/useMemory";
import { useVoice } from "@/features/voice/useVoice";

export function Shell() {
  const conversation = useConversation();
  const memory = useMemory();
  const voice = useVoice();
  const isSpeaking = useSpeaking(conversation.messages);
  const avatar = useAvatar({
    isListening: voice.isListening,
    isResponding: conversation.isResponding,
    isSpeaking,
    hasError: conversation.responseFailed,
  });

  return (
    <main className="min-h-dvh bg-[#080808] text-zinc-100">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1540px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Header voiceState={voice.state} />
        <div className="grid flex-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
          <Sidebar>
            <ConversationList
              conversations={conversation.conversations}
              selectedConversationId={conversation.selectedConversationId}
              onSelectConversation={conversation.selectConversation}
              onCreateConversation={conversation.startNewConversation}
            />
          </Sidebar>

          <section className="min-h-[620px] overflow-hidden rounded-md border border-white/10 bg-[#101010]">
            <div className="grid h-full min-h-[620px] grid-rows-[260px_minmax(0,1fr)_auto]">
              <div className="relative border-b border-white/10">
                <AvatarCanvas state={avatar.state} />
                <div className="absolute left-4 top-4 rounded-md border border-white/10 bg-black/45 px-3 py-2 backdrop-blur">
                  <p className="text-xs text-zinc-400">Avatar</p>
                  <p className="text-sm font-medium text-zinc-100">
                    {avatar.label}
                  </p>
                </div>
              </div>

              <MessageList
                messages={conversation.messages}
                isResponding={conversation.isResponding}
              />

              <MessageInput
                disabled={conversation.isResponding}
                onSendMessage={conversation.sendMessage}
              />
            </div>
          </section>

          <aside className="grid gap-4 lg:grid-rows-[minmax(0,1fr)_auto]">
            <MemoryPanel
              memories={memory.memories}
              onRemoveMemory={memory.removeMemory}
            />
            <VoiceButton
              state={voice.state}
              isListening={voice.isListening}
              onToggle={voice.toggleVoice}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
