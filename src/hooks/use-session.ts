"use client";

import { useCallback, useEffect, useState } from "react";
import { useGeminiLive, type TranscriptEntry } from "./use-gemini-live";
import { useMicrosoftSpeech } from "./use-microsoft-speech";
import { useAudioRecorder } from "./use-audio-recorder";
import type { SessionConfig } from "@/lib/constants";

type SessionStatus = "idle" | "connecting" | "active" | "ending" | "ended" | "error";

export function useSession(config: SessionConfig) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("idle");
  const [startTime, setStartTime] = useState<number>(0);

  const gemini = useGeminiLive(sessionId, config);
  const microsoft = useMicrosoftSpeech(sessionId, config);
  const recorder = useAudioRecorder();

  const isGemini = config.voice === "gemini";
  const voice = isGemini ? gemini : microsoft;

  // Auto-connect voice pipeline once sessionId is available and session is active.
  // This avoids the race where the consumer calls connect before setState has flushed.
  useEffect(() => {
    if (!sessionId || sessionStatus !== "active") return;
    if (isGemini) {
      void gemini.connect();
    } else {
      void microsoft.start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, sessionStatus]);

  const startSession = useCallback(async () => {
    setSessionStatus("connecting");

    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: config.language,
          mode: config.mode,
          level: config.level,
          voice_type: config.voice,
          device_info: {
            userAgent: navigator.userAgent,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            language: navigator.language,
          },
        }),
      });

      const { id } = (await res.json()) as { id: string };
      setSessionId(id);
      setStartTime(Date.now());

      await recorder.startRecording();

      setSessionStatus("active");
    } catch {
      setSessionStatus("error");
    }
  }, [config, recorder]);

  const endSession = useCallback(async () => {
    if (!sessionId) return;
    setSessionStatus("ending");

    if (isGemini) {
      gemini.disconnect();
    } else {
      microsoft.stop();
    }

    const audioBlob = await recorder.stopRecording();
    const durationSeconds = Math.floor((Date.now() - startTime) / 1000);

    await fetch("/api/session", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        status: "completed",
        duration_seconds: durationSeconds,
      }),
    });

    if (audioBlob.size > 0) {
      const formData = new FormData();
      formData.append("audio", audioBlob, "session.webm");
      formData.append("sessionId", sessionId);
      await fetch("/api/upload-audio", { method: "POST", body: formData });
    }

    setSessionStatus("ended");

    return { sessionId, durationSeconds };
  }, [sessionId, isGemini, gemini, microsoft, recorder, startTime]);

  return {
    sessionId,
    sessionStatus,
    transcripts: voice.transcripts as TranscriptEntry[],
    agentState: voice.agentState,
    startSession,
    endSession,
  };
}
