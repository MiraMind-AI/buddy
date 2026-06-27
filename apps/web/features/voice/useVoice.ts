"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Message } from "@/features/conversation/useConversation";
import { createVoiceSpeech, transcribeVoice } from "@/lib/api/voice";

export type VoiceState =
  | "idle"
  | "listening"
  | "transcribing"
  | "sending"
  | "speaking"
  | "unsupported"
  | "error";

interface UseVoiceOptions {
  messages: Message[];
  isResponding: boolean;
  onSendMessage: (content: string) => Promise<void> | void;
}

const AUDIO_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
];

function toErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Voice could not complete the last action.";
}

function getSpeechLanguage() {
  if (typeof navigator === "undefined") return "de-DE";
  return navigator.language?.startsWith("de") ? navigator.language : "de-DE";
}

function pickRecorderMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  return AUDIO_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

function canRecordAudio() {
  return Boolean(
    typeof navigator !== "undefined" &&
      typeof navigator.mediaDevices?.getUserMedia === "function" &&
      typeof MediaRecorder !== "undefined",
  );
}

function speakWithBrowser(text: string, onStart: () => void, onDone: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = getSpeechLanguage();
  utterance.rate = 1;
  utterance.pitch = 0.96;
  utterance.onstart = onStart;
  utterance.onend = onDone;
  utterance.onerror = onDone;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
}

export function useVoice({
  messages,
  isResponding,
  onSendMessage,
}: UseVoiceOptions) {
  const [state, setState] = useState<VoiceState>("idle");
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const [isSupported, setIsSupported] = useState(true);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const awaitingVoiceReplyRef = useRef(false);
  const lastSpokenMessageIdRef = useRef<string | null>(null);
  const sendMessageRef = useRef(onSendMessage);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    sendMessageRef.current = onSendMessage;
  }, [onSendMessage]);

  useEffect(() => {
    const supported = canRecordAudio();
    setIsSupported(supported);
    setState((current) => (!supported && current === "idle" ? "unsupported" : current));
  }, []);

  const stopMeter = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    void audioContextRef.current?.close();
    audioContextRef.current = null;
    analyserRef.current = null;
    setLevel(0);
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    stopMeter();
  }, [stopMeter]);

  const startMeter = useCallback((stream: MediaStream) => {
    const AudioContextCtor = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextCtor) return;

    const audioContext = new AudioContextCtor();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.78;
    audioContext.createMediaStreamSource(stream).connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const samples = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      samples.forEach((value) => {
        const centered = (value - 128) / 128;
        sum += centered * centered;
      });
      const rms = Math.sqrt(sum / samples.length);
      setLevel(Math.min(1, rms * 5.5));
      animationFrameRef.current = requestAnimationFrame(tick);
    };
    tick();
  }, []);

  const cancelSpeech = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setState((current) => (current === "speaking" ? "idle" : current));
  }, []);

  const playAssistantReply = useCallback(
    async (text: string) => {
      if (!autoSpeak || !text.trim()) return;

      cancelSpeech();
      setErrorMessage(null);

      try {
        const speech = await createVoiceSpeech(text);
        const objectUrl = URL.createObjectURL(speech);
        objectUrlRef.current = objectUrl;

        const audio = new Audio(objectUrl);
        audioRef.current = audio;
        audio.onplaying = () => setState("speaking");
        audio.onended = () => {
          URL.revokeObjectURL(objectUrl);
          objectUrlRef.current = null;
          audioRef.current = null;
          setState((current) => (current === "speaking" ? "idle" : current));
        };
        audio.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          objectUrlRef.current = null;
          audioRef.current = null;
          setState((current) => (current === "speaking" ? "idle" : current));
        };

        await audio.play();
      } catch (error) {
        const usedBrowserSpeech = speakWithBrowser(
          text,
          () => setState("speaking"),
          () => setState((current) => (current === "speaking" ? "idle" : current)),
        );
        if (!usedBrowserSpeech) {
          setErrorMessage(toErrorMessage(error));
          setState("error");
        }
      }
    },
    [autoSpeak, cancelSpeech],
  );

  const processRecording = useCallback(async () => {
    stopStream();
    const mimeType = recorderRef.current?.mimeType || "audio/webm";
    recorderRef.current = null;
    const chunks = chunksRef.current;
    chunksRef.current = [];

    if (chunks.length === 0) {
      setErrorMessage("No microphone audio was captured.");
      setState("error");
      return;
    }

    setState("transcribing");
    const recording = new Blob(chunks, { type: mimeType });

    try {
      const text = await transcribeVoice(recording);
      if (!text.trim()) {
        setErrorMessage("No speech was detected.");
        setState("error");
        return;
      }

      setTranscript(text);
      setState("sending");
      awaitingVoiceReplyRef.current = true;
      await sendMessageRef.current(text);
      setState((current) => (current === "sending" ? "idle" : current));
    } catch (error) {
      awaitingVoiceReplyRef.current = false;
      setErrorMessage(toErrorMessage(error));
      setState("error");
    }
  }, [stopStream]);

  const startListening = useCallback(async () => {
    if (!canRecordAudio()) {
      setIsSupported(false);
      setState("unsupported");
      setErrorMessage("Microphone recording is not supported in this browser.");
      return;
    }

    cancelSpeech();
    setErrorMessage(null);
    setTranscript("");
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      streamRef.current = stream;
      startMeter(stream);

      const mimeType = pickRecorderMimeType();
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onerror = () => {
        stopStream();
        setErrorMessage("Microphone recording failed.");
        setState("error");
      };
      recorder.onstop = () => {
        void processRecording();
      };

      recorder.start(250);
      setState("listening");
    } catch (error) {
      stopStream();
      setErrorMessage(toErrorMessage(error));
      setState("error");
    }
  }, [cancelSpeech, processRecording, startMeter, stopStream]);

  const stopListening = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      return;
    }
    setState("transcribing");
    recorder.stop();
  }, []);

  const toggleVoice = useCallback(() => {
    if (state === "listening") {
      stopListening();
      return;
    }

    if (state === "transcribing" || state === "sending" || isResponding) {
      return;
    }

    void startListening();
  }, [isResponding, startListening, state, stopListening]);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return;
    if (lastSpokenMessageIdRef.current === last.id) return;

    lastSpokenMessageIdRef.current = last.id;
    if (!awaitingVoiceReplyRef.current) return;
    awaitingVoiceReplyRef.current = false;
    void playAssistantReply(last.content);
  }, [messages, playAssistantReply]);

  useEffect(() => {
    return () => {
      recorderRef.current?.state !== "inactive" && recorderRef.current?.stop();
      stopStream();
      cancelSpeech();
    };
  }, [cancelSpeech, stopStream]);

  const statusText = useMemo(() => {
    if (errorMessage) return errorMessage;
    if (transcript) return transcript;
    if (state === "listening") return "Recording through the server voice channel.";
    if (state === "transcribing") return "Transcribing captured audio.";
    if (state === "sending") return "Sending the voice message.";
    if (state === "speaking") return "Playing Buddy's spoken reply.";
    return "Server voice channel ready.";
  }, [errorMessage, state, transcript]);

  return {
    state: isSupported ? state : "unsupported",
    isListening: state === "listening",
    isSending: state === "transcribing" || state === "sending",
    isSpeaking: state === "speaking",
    isSupported,
    autoSpeak,
    transcript: statusText,
    errorMessage,
    level,
    toggleAutoSpeak: () => setAutoSpeak((current) => !current),
    toggleVoice,
    cancelSpeech,
  };
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
