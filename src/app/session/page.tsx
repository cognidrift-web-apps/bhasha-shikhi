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

const STATE_LABELS: Record<string, { text: string; color: string }> = {
  idle: { text: "অপেক্ষায়...", color: "text-purple-500" },
  listening: { text: "শুনছি...", color: "text-cyan-500" },
  thinking: { text: "ভাবছি...", color: "text-slate-400" },
  speaking: { text: "বলছি...", color: "text-blue-500" },
};

const STATE_GLOWS: Record<string, string> = {
  idle: "0 0 12px rgba(139,92,246,0.3)",
  listening: "0 0 12px rgba(6,182,212,0.3)",
  thinking: "none",
  speaking: "0 0 12px rgba(59,130,246,0.3)",
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
    <span className="font-mono text-sm text-slate-500 tabular-nums">
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
  const stateInfo = STATE_LABELS[agentState] ?? STATE_LABELS.idle;

  if (sessionStatus === "ending") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-page">
        <p className="font-bengali text-slate-500">সেশন শেষ হচ্ছে...</p>
      </main>
    );
  }

  if (sessionStatus === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-page px-4">
        <div className="text-center">
          <p className="font-bengali text-slate-600 mb-4">
            কানেকশনে প্রবলেম হয়েছে
          </p>
          <button
            onClick={() => router.push("/practice")}
            className="rounded-full bg-primary-600 px-6 py-2.5 min-h-[44px] text-sm font-medium text-white hover:-translate-y-0.5 active:scale-[0.98] transition-all"
          >
            <span className="font-bengali">আবার ট্রাই করো</span>
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col bg-surface-page">
      <header className="flex items-center justify-between bg-white border-b border-surface-border px-4 py-3 shrink-0">
        <span className="font-bengali text-sm text-slate-600">
          {modeInfo?.namebn ?? config.mode}
        </span>
        <span className="text-sm text-slate-500">
          {langInfo?.name ?? config.language}
        </span>
        {startTime > 0 && <SessionTimer startTime={startTime} />}
      </header>

      <div className="flex flex-col items-center gap-4 py-8 shrink-0">
        <VoiceOrb state={agentState as "idle" | "listening" | "thinking" | "speaking"} />
        <p
          className={`font-bengali text-base font-medium ${stateInfo.color}`}
          style={{ textShadow: STATE_GLOWS[agentState] ?? "none" }}
        >
          {stateInfo.text}
        </p>
      </div>

      <div
        className="flex-1 overflow-y-auto min-h-0 bg-white rounded-t-2xl"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <TranscriptPanel entries={transcripts} />
      </div>

      <footer className="shrink-0 flex justify-center py-4 bg-surface-page">
        <button
          onClick={() => void handleEnd()}
          disabled={sessionStatus === "connecting"}
          className="rounded-full bg-red-500 hover:bg-red-600 px-6 py-2.5 min-h-[44px] text-sm font-semibold text-white transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
        <main className="flex min-h-screen items-center justify-center bg-surface-page">
          <p className="font-bengali text-slate-500">লোড হচ্ছে...</p>
        </main>
      }
    >
      <SessionContent />
    </Suspense>
  );
}
