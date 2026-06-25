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

// Bangla status labels for each agent state (casual Dhaka style)
const STATE_LABELS: Record<string, string> = {
  idle: "অপেক্ষায় আছি",
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
    <span className="font-mono text-sm text-stone-500 tabular-nums">
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
    voice: (searchParams.get("voice") ?? "gemini") as VoiceType,
  };

  const { sessionStatus, transcripts, agentState, startSession, endSession } =
    useSession(config);

  // Start session on mount
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
      <main className="flex min-h-screen items-center justify-center bg-surface-50">
        <p className="font-bengali text-stone-500">সেশন শেষ হচ্ছে...</p>
      </main>
    );
  }

  if (sessionStatus === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-50 px-4">
        <div className="text-center">
          <p className="font-bengali text-stone-600 mb-4">
            সংযোগে সমস্যা হয়েছে।
          </p>
          <button
            onClick={() => router.push("/practice")}
            className="rounded-lg bg-brand-600 px-6 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <span className="font-bengali">আবার চেষ্টা করুন</span>
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col bg-surface-50">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 shrink-0">
        <div className="flex flex-col">
          <span className="font-bengali text-xs text-stone-400">
            {modeInfo?.namebn ?? config.mode}
          </span>
          <span className="text-sm font-semibold text-stone-800">
            {langInfo?.name ?? config.language}
          </span>
        </div>
        {startTime > 0 && <SessionTimer startTime={startTime} />}
      </header>

      {/* Orb area */}
      <div className="flex flex-col items-center gap-4 py-10 shrink-0">
        <VoiceOrb state={agentState as "idle" | "listening" | "thinking" | "speaking"} />
        <p className="font-bengali text-sm text-stone-500">
          {STATE_LABELS[agentState] ?? STATE_LABELS.idle}
        </p>
      </div>

      {/* Transcript - scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-surface-100 rounded-t-2xl">
        <TranscriptPanel entries={transcripts} />
      </div>

      {/* Bottom controls */}
      <footer className="shrink-0 border-t border-stone-200 bg-white px-4 py-4">
        <button
          onClick={() => void handleEnd()}
          disabled={sessionStatus === "connecting"}
          className="w-full rounded-lg bg-red-500 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 active:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="font-bengali">সেশন শেষ করুন</span>
        </button>
      </footer>
    </main>
  );
}

export default function SessionPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-surface-50">
          <p className="font-bengali text-stone-500">লোড হচ্ছে...</p>
        </main>
      }
    >
      <SessionContent />
    </Suspense>
  );
}
