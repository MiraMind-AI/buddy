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
    <main className="min-h-dvh overflow-hidden text-stone-100">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px] opacity-35" />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[1760px] flex-col gap-3 px-3 py-3 sm:px-5 lg:px-6">
        <Header
          voiceState={voice.state}
          avatarState={avatar.state}
          memoryCount={memory.memories.length}
        />

        {apiMessage ? (
          <div
            role="status"
            className="rounded-lg border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-50"
          >
            API status: {apiMessage}
          </div>
        ) : null}

        <div className="grid flex-1 gap-3 lg:grid-cols-[296px_minmax(0,1fr)] xl:grid-cols-[296px_minmax(0,1fr)_344px]">
          <Sidebar>
            <ConversationList
              conversations={conversation.conversations}
              selectedConversationId={conversation.selectedConversationId}
              onSelectConversation={conversation.selectConversation}
              onCreateConversation={conversation.startNewConversation}
            />
          </Sidebar>

          <section className="grid min-h-[760px] gap-3 lg:min-h-0 lg:h-[calc(100dvh-104px)] lg:grid-rows-[minmax(360px,42vh)_minmax(0,1fr)]">
            <section className="relative min-h-[360px] overflow-hidden rounded-lg border border-white/10 bg-[#070a09] shadow-2xl shadow-black/30">
              <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4">
                <div className="rounded-lg border border-white/10 bg-black/35 px-3 py-2 backdrop-blur-xl">
                  <p className="text-xs uppercase text-stone-500">Presence</p>
                  <p className="mt-1 text-sm font-medium text-stone-100">
                    {avatar.label}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-right backdrop-blur-xl">
                  <p className="text-xs uppercase text-stone-500">Session</p>
                  <p className="mt-1 max-w-48 truncate text-sm font-medium text-stone-100">
                    {activeTitle}
                  </p>
                </div>
              </div>
              <AvatarCanvas state={avatar.state} />
            </section>

            <section className="grid min-h-[420px] overflow-hidden rounded-lg border border-white/10 bg-stone-950/80 shadow-2xl shadow-black/25 backdrop-blur-xl lg:min-h-0 lg:grid-rows-[auto_minmax(0,1fr)_auto]">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase text-stone-500">Dialogue</p>
                  <h2 className="mt-1 truncate text-base font-semibold text-stone-50">
                    {activeTitle}
                  </h2>
                </div>
                <span className="rounded-md border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs text-stone-400">
                  {conversation.messages.length} messages
                </span>
              </div>

              <MessageList
                messages={conversation.messages}
                isResponding={conversation.isResponding}
              />

              <MessageInput
                disabled={conversation.isResponding}
                onSendMessage={conversation.sendMessage}
              />
            </section>
          </section>

          <aside className="grid gap-3 lg:col-span-2 xl:col-span-1 xl:grid-rows-[minmax(0,1fr)_auto]">
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
