"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useSession } from "@/hooks/use-session";
import { VoiceOrb } from "@/components/session/voice-orb";
import { TranscriptPanel } from "@/components/session/transcript-panel";
import {
  LANGUAGES,
  MODES,
  type Language,
  type Mode,
  type Level,
  type VoiceType,
  type SessionConfig,
} from "@/lib/constants";

const STATE_LABELS: Record<string, string> = {
  idle: "অপেক্ষায়...",
  listening: "শুনছি...",
  thinking: "ভাবছি...",
  speaking: "বলছি...",
};

function SessionTimer({ startTime }: { startTime: number }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <span className="font-mono text-sm text-white/80 tabular-nums">
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </span>
  );
}

function SessionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const startTimeRef = useRef<number>(0);
  const [startTime, setStartTime] = useState<number>(0);

  const config: SessionConfig = {
    language: (searchParams.get("language") ?? "english") as Language,
    mode: (searchParams.get("mode") ?? "conversation") as Mode,
    level: (searchParams.get("level") ?? "beginner") as Level,
    voice: (searchParams.get("voice") ?? "priya") as VoiceType,
  };

  const { sessionStatus, transcripts, agentState, startSession, endSession } =
    useSession(config);

  useEffect(() => {
    void startSession().then(() => {
      const now = Date.now();
      startTimeRef.current = now;
      setStartTime(now);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEnd = useCallback(async () => {
    const result = await endSession();
    if (result) {
      router.push(`/results?sessionId=${result.sessionId}`);
    } else {
      router.push("/practice");
    }
  }, [endSession, router]);

  const modeInfo = MODES.find((m) => m.id === config.mode);
  const langInfo = LANGUAGES.find((l) => l.id === config.language);

  if (sessionStatus === "ending") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-primary-950">
        <p className="font-bengali text-white/60">সেশন শেষ হচ্ছে...</p>
      </main>
    );
  }

  if (sessionStatus === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-primary-950 px-4">
        <div className="text-center">
          <p className="font-bengali text-white/70 mb-4">
            কানেকশনে প্রবলেম হয়েছে
          </p>
          <button
            onClick={() => router.push("/practice")}
            className="rounded-full gradient-button px-6 py-2.5 min-h-[44px] text-sm font-medium text-white"
          >
            <span className="font-bengali">আবার ট্রাই করো</span>
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col bg-gradient-to-b from-primary-950 via-primary-900 to-primary-950">
      {/* Top bar */}
      <header className="flex items-center justify-between bg-white/5 backdrop-blur-sm px-4 py-3 shrink-0">
        <span className="font-bengali text-sm text-white/80">
          {modeInfo?.namebn ?? config.mode}
        </span>
        <span className="text-sm text-white/60">
          {langInfo?.name ?? config.language}
        </span>
        {startTime > 0 && <SessionTimer startTime={startTime} />}
      </header>

      {/* Orb area */}
      <div className="flex flex-col items-center gap-4 py-8 shrink-0">
        <VoiceOrb state={agentState as "idle" | "listening" | "thinking" | "speaking"} />
        <p
          className="font-bengali text-base text-white/90"
          style={{ textShadow: "0 0 20px rgba(99, 102, 241, 0.4)" }}
        >
          {STATE_LABELS[agentState] ?? STATE_LABELS.idle}
        </p>
      </div>

      {/* Transcript - glassmorphism */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-white/5 backdrop-blur-md rounded-t-3xl">
        <TranscriptPanel entries={transcripts} />
      </div>

      {/* End button - small pill */}
      <footer className="shrink-0 flex justify-center py-4 bg-transparent">
        <button
          onClick={() => void handleEnd()}
          disabled={sessionStatus === "connecting"}
          className="rounded-full bg-red-500/80 hover:bg-red-500 backdrop-blur-sm px-6 py-2.5 min-h-[44px] text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="font-bengali">সেশন শেষ করো</span>
        </button>
      </footer>
    </main>
  );
}

export default function SessionPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-primary-950">
          <p className="font-bengali text-white/60">লোড হচ্ছে...</p>
        </main>
      }
    >
      <SessionContent />
    </Suspense>
  );
}
