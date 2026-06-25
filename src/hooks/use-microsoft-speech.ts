"use client";

import { useCallback, useRef, useState } from "react";
import type { SessionConfig } from "@/lib/constants";
import type { TranscriptEntry } from "./use-gemini-live";

// Type-only import is erased at build time — safe for SSR.
// The runtime SDK is loaded dynamically below.
import type * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";
type AgentState = "idle" | "listening" | "speaking" | "thinking";

export function useMicrosoftSpeech(
  sessionId: string | null,
  config: SessionConfig,
) {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [agentState, setAgentState] = useState<AgentState>("idle");
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const recognizerRef = useRef<SpeechSDK.SpeechRecognizer | null>(null);
  const synthesizerRef = useRef<SpeechSDK.SpeechSynthesizer | null>(null);
  const historyRef = useRef<Array<{ role: string; content: string }>>([]);

  // Dynamically import the SDK to avoid SSR issues
  const getSpeechSDK = useCallback(async () => {
    const sdk = await import("microsoft-cognitiveservices-speech-sdk");
    return sdk;
  }, []);

  const start = useCallback(async () => {
    if (!sessionId) return;
    setStatus("connecting");

    try {
      const res = await fetch("/api/speech-token");
      const { token, region } = (await res.json()) as {
        token: string;
        region: string;
      };

      const sdk = await getSpeechSDK();

      const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(token, region);
      speechConfig.speechRecognitionLanguage = getRecognitionLanguage(config.language);

      const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
      recognizerRef.current = recognizer;

      const synthConfig = sdk.SpeechConfig.fromAuthorizationToken(token, region);
      synthConfig.speechSynthesisVoiceName = "bn-BD-NabanitaNeural";
      const synthesizer = new sdk.SpeechSynthesizer(synthConfig);
      synthesizerRef.current = synthesizer;

      recognizer.recognized = async (_s, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
          const userText = e.result.text;
          if (!userText.trim()) return;

          setTranscripts((prev) => [
            ...prev,
            { role: "user", content: userText, timestamp: Date.now() },
          ]);

          setAgentState("thinking");
          historyRef.current.push({ role: "user", content: userText });

          const chatRes = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              message: userText,
              history: historyRef.current,
              language: config.language,
              mode: config.mode,
              level: config.level,
            }),
          });

          // /api/chat returns a text/plain ReadableStream — accumulate chunks
          const reader = chatRes.body?.getReader();
          const decoder = new TextDecoder();
          let tutorText = "";
          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              tutorText += decoder.decode(value, { stream: true });
            }
            // Flush any remaining bytes
            tutorText += decoder.decode();
          }

          historyRef.current.push({ role: "tutor", content: tutorText });

          setTranscripts((prev) => [
            ...prev,
            { role: "tutor", content: tutorText, timestamp: Date.now() },
          ]);

          setAgentState("speaking");
          synthesizer.speakTextAsync(
            tutorText,
            () => setAgentState("listening"),
            () => setAgentState("listening"),
          );
        }
      };

      recognizer.startContinuousRecognitionAsync(
        () => {
          setStatus("connected");
          setAgentState("listening");
        },
        () => setStatus("error"),
      );
    } catch {
      setStatus("error");
    }
  }, [sessionId, config, getSpeechSDK]);

  const stop = useCallback(() => {
    recognizerRef.current?.stopContinuousRecognitionAsync();
    recognizerRef.current?.close();
    synthesizerRef.current?.close();
    setStatus("disconnected");
    setAgentState("idle");
  }, []);

  return { start, stop, status, agentState, transcripts };
}

function getRecognitionLanguage(lang: string): string {
  switch (lang) {
    case "german":
      return "de-DE";
    case "arabic":
      return "ar-SA";
    case "hindi":
      return "hi-IN";
    default:
      return "en-US";
  }
}
