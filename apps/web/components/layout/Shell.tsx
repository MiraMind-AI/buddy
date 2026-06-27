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
  const activeTitle =
    conversation.selectedConversation?.title ?? "New conversation";
  const apiMessage =
    conversation.error instanceof Error ? conversation.error.message : null;

  return (
    <main className="min-h-dvh overflow-x-hidden text-[#111411]">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(17,20,17,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(17,20,17,0.035)_1px,transparent_1px)] bg-[size:42px_42px] opacity-45" />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[1680px] flex-col gap-3 px-3 py-3 sm:px-5 lg:px-6">
        <Header
          voiceState={voice.state}
          avatarState={avatar.state}
          memoryCount={memory.memories.length}
        />

        {apiMessage && !conversation.responseFailed ? (
          <div
            role="alert"
            className="rounded-lg border border-amber-300/50 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm"
          >
            Buddy could not complete the last request: {apiMessage}
          </div>
        ) : null}

        <div className="grid flex-1 gap-3 lg:grid-cols-[280px_minmax(0,1fr)_360px]">
          <Sidebar>
            <ConversationList
              conversations={conversation.conversations}
              selectedConversationId={conversation.selectedConversationId}
              onSelectConversation={conversation.selectConversation}
              onCreateConversation={conversation.startNewConversation}
            />
          </Sidebar>

          <section className="grid min-h-[560px] overflow-hidden rounded-lg border border-black/5 bg-white shadow-sm lg:h-[calc(100dvh-104px)] lg:min-h-0 lg:grid-rows-[auto_minmax(0,1fr)_auto]">
            <div className="flex items-center justify-between gap-3 border-b border-black/5 bg-white px-4 py-3">
              <div className="min-w-0">
                <p className="text-xs uppercase text-[#7b827c]">Conversation</p>
                <h2 className="mt-1 truncate text-lg font-semibold text-[#111411]">
                  {activeTitle}
                </h2>
              </div>
              <span className="shrink-0 rounded-md border border-black/5 bg-[#f6f7f2] px-2.5 py-1 text-xs text-[#58625c]">
                {conversation.messages.length} messages
              </span>
            </div>

            <MessageList
              messages={conversation.messages}
              isResponding={conversation.isResponding}
              errorMessage={conversation.responseFailed ? apiMessage : null}
            />

            <MessageInput
              disabled={conversation.isResponding}
              onSendMessage={conversation.sendMessage}
            />
          </section>

          <aside className="grid gap-3 lg:h-[calc(100dvh-104px)] lg:grid-rows-[minmax(300px,0.9fr)_auto_minmax(0,1fr)]">
            <section className="relative min-h-[320px] overflow-hidden rounded-lg border border-black/5 bg-[#101916] shadow-sm">
              <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4">
                <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 backdrop-blur-xl">
                  <p className="text-xs uppercase text-white/45">Presence</p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {avatar.label}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-right backdrop-blur-xl">
                  <p className="text-xs uppercase text-white/45">Session</p>
                  <p className="mt-1 max-w-40 truncate text-sm font-medium text-white">
                    {activeTitle}
                  </p>
                </div>
              </div>
              <AvatarCanvas state={avatar.state} />
            </section>

            <VoiceButton
              state={voice.state}
              isListening={voice.isListening}
              onToggle={voice.toggleVoice}
            />

            <MemoryPanel
              memories={memory.memories}
              onRemoveMemory={memory.removeMemory}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
