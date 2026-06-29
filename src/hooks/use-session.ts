"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGeminiLive, type TranscriptEntry } from "./use-gemini-live";
import { useAudioRecorder } from "./use-audio-recorder";
import type { SessionConfig } from "@/lib/constants";

type SessionStatus = "idle" | "connecting" | "active" | "ending" | "ended" | "error";

export function useSession(config: SessionConfig) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("idle");
  const [startTime, setStartTime] = useState<number>(0);
  const disconnectedRef = useRef(false);

  const gemini = useGeminiLive(sessionId, config);
  const recorder = useAudioRecorder();

  useEffect(() => {
    if (!sessionId || sessionStatus !== "active") return;
    void gemini.connect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, sessionStatus]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!disconnectedRef.current) {
        gemini.disconnect();
        disconnectedRef.current = true;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (!disconnectedRef.current) {
        gemini.disconnect();
        disconnectedRef.current = true;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gemini.disconnect]);

  const startSession = useCallback(async () => {
    setSessionStatus("connecting");
    disconnectedRef.current = false;

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

    if (!disconnectedRef.current) {
      gemini.disconnect();
      disconnectedRef.current = true;
    }

    const durationSeconds = Math.floor((Date.now() - startTime) / 1000);

    void (async () => {
      try {
        const audioBlob = await recorder.stopRecording();
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
      } catch {}
    })();

    setSessionStatus("ended");
    return { sessionId, durationSeconds };
  }, [sessionId, gemini, recorder, startTime]);

  return {
    sessionId,
    sessionStatus,
    transcripts: gemini.transcripts as TranscriptEntry[],
    setTranscripts: gemini.setTranscripts,
    turnCompleteCount: gemini.turnCompleteCount,
    agentState: gemini.agentState,
    startSession,
    endSession,
  };
}
