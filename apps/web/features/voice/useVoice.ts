"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Message } from "@/features/conversation/useConversation";

export type VoiceState =
  | "idle"
  | "listening"
  | "sending"
  | "speaking"
  | "unsupported"
  | "error";

interface UseVoiceOptions {
  messages: Message[];
  isResponding: boolean;
  onSendMessage: (content: string) => Promise<void> | void;
}

interface BrowserSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
  message?: string;
}

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

type SpeechWindow = Window &
  typeof globalThis & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

const DEFAULT_LANGUAGE = "de-DE";

function getRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const speechWindow = window as SpeechWindow;
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

function getSpeechLanguage() {
  if (typeof navigator === "undefined") return DEFAULT_LANGUAGE;
  return navigator.language?.startsWith("de") ? navigator.language : DEFAULT_LANGUAGE;
}

function toErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Voice could not complete the last action.";
}

function pickVoiceForLanguage() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }

  const language = getSpeechLanguage();
  const voices = window.speechSynthesis.getVoices();

  return (
    voices.find((voice) => voice.lang === language) ??
    voices.find((voice) => voice.lang.startsWith(language.slice(0, 2))) ??
    null
  );
}

export function useVoice({
  messages,
  isResponding,
  onSendMessage,
}: UseVoiceOptions) {
  const [state, setState] = useState<VoiceState>("idle");
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const latestTranscriptRef = useRef("");
  const shouldSendOnEndRef = useRef(false);
  const awaitingVoiceReplyRef = useRef(false);
  const lastSpokenMessageIdRef = useRef<string | null>(null);
  const sendMessageRef = useRef(onSendMessage);

  useEffect(() => {
    sendMessageRef.current = onSendMessage;
  }, [onSendMessage]);

  useEffect(() => {
    const supported = Boolean(getRecognitionConstructor());
    setIsSupported(supported);
    setState((current) => (!supported && current === "idle" ? "unsupported" : current));
  }, []);

  const sendCapturedTranscript = useCallback(async () => {
    const captured = latestTranscriptRef.current.trim();
    setInterimTranscript("");
    setTranscript(captured);

    if (!captured) {
      setState("idle");
      return;
    }

    setState("sending");
    awaitingVoiceReplyRef.current = true;

    try {
      await sendMessageRef.current(captured);
      setState((current) => (current === "sending" ? "idle" : current));
    } catch (error) {
      awaitingVoiceReplyRef.current = false;
      setErrorMessage(toErrorMessage(error));
      setState("error");
    }
  }, []);

  const stopListening = useCallback(() => {
    shouldSendOnEndRef.current = true;
    recognitionRef.current?.stop();
  }, []);

  const cancelSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setState((current) => (current === "speaking" ? "idle" : current));
  }, []);

  const startListening = useCallback(() => {
    const Recognition = getRecognitionConstructor();
    if (!Recognition) {
      setIsSupported(false);
      setState("unsupported");
      setErrorMessage("Voice input is supported in Chrome and Edge.");
      return;
    }

    cancelSpeech();
    setErrorMessage(null);
    setTranscript("");
    setInterimTranscript("");
    latestTranscriptRef.current = "";
    shouldSendOnEndRef.current = true;

    const recognition = new Recognition();
    recognition.lang = getSpeechLanguage();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        const resultText = result[0]?.transcript ?? "";
        if (result.isFinal) {
          finalText += resultText;
        } else {
          interimText += resultText;
        }
      }

      latestTranscriptRef.current = `${finalText} ${interimText}`.trim();
      setTranscript(finalText.trim());
      setInterimTranscript(interimText.trim());
    };

    recognition.onerror = (event) => {
      shouldSendOnEndRef.current = false;
      const message =
        event.error === "not-allowed"
          ? "Microphone permission was blocked."
          : event.error === "no-speech"
            ? "No speech was detected."
            : event.message || `Voice input failed: ${event.error}.`;
      setErrorMessage(message);
      setState("error");
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      if (shouldSendOnEndRef.current) {
        void sendCapturedTranscript();
      }
    };

    recognitionRef.current = recognition;
    setState("listening");

    try {
      recognition.start();
    } catch (error) {
      recognitionRef.current = null;
      shouldSendOnEndRef.current = false;
      setErrorMessage(toErrorMessage(error));
      setState("error");
    }
  }, [cancelSpeech, sendCapturedTranscript]);

  const toggleVoice = useCallback(() => {
    if (state === "listening") {
      stopListening();
      return;
    }

    if (state === "sending" || isResponding) {
      return;
    }

    startListening();
  }, [isResponding, startListening, state, stopListening]);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return;
    if (lastSpokenMessageIdRef.current === last.id) return;

    lastSpokenMessageIdRef.current = last.id;
    if (!awaitingVoiceReplyRef.current) return;
    awaitingVoiceReplyRef.current = false;

    if (!autoSpeak || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(last.content);
    utterance.lang = getSpeechLanguage();
    utterance.rate = 1;
    utterance.pitch = 0.96;

    try {
      utterance.voice = pickVoiceForLanguage();
    } catch {
      utterance.voice = null;
    }

    utterance.onstart = () => setState("speaking");
    utterance.onend = () => setState((current) => (current === "speaking" ? "idle" : current));
    utterance.onerror = () => setState((current) => (current === "speaking" ? "idle" : current));

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [autoSpeak, messages]);

  useEffect(() => {
    return () => {
      shouldSendOnEndRef.current = false;
      recognitionRef.current?.abort();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const displayedTranscript = useMemo(
    () => [transcript, interimTranscript].filter(Boolean).join(" ").trim(),
    [interimTranscript, transcript],
  );

  return {
    state: isSupported ? state : "unsupported",
    isListening: state === "listening",
    isSending: state === "sending",
    isSpeaking: state === "speaking",
    isSupported,
    autoSpeak,
    transcript: displayedTranscript,
    errorMessage,
    toggleAutoSpeak: () => setAutoSpeak((current) => !current),
    toggleVoice,
    cancelSpeech,
  };
}
