"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useSession } from "@/hooks/use-session";
import { useTranscriptTranslation } from "@/hooks/use-transcript-translation";
import { VoiceOrb } from "@/components/session/voice-orb";
import { TranscriptSheet } from "@/components/session/transcript-sheet";
import {
  MODES,
  type Language,
  type Mode,
  type Level,
  type VoiceType,
  type SessionConfig,
} from "@/lib/constants";

const STATE_LABELS: Record<string, { text: string; color: string }> = {
  idle: { text: "অপেক্ষায়...", color: "text-slate-400" },
  listening: { text: "শুনছি...", color: "text-cyan-500" },
  thinking: { text: "ভাবছি...", color: "text-slate-400" },
  speaking: { text: "বলছি...", color: "text-primary-500" },
};

const END_CONFIRM_LABEL = { text: "আবার ট্যাপ করুন শেষ করতে", color: "text-red-400" };

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
    <span className="font-mono text-sm text-slate-500/70 tabular-nums">
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </span>
  );
}

function SessionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [startTime, setStartTime] = useState<number>(0);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [endConfirmPending, setEndConfirmPending] = useState(false);
  const [orbPulsing, setOrbPulsing] = useState(false);
  const [orbExiting, setOrbExiting] = useState(false);
  const endConfirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const config: SessionConfig = {
    language: (searchParams.get("language") ?? "english") as Language,
    mode: (searchParams.get("mode") ?? "conversation") as Mode,
    level: (searchParams.get("level") ?? "beginner") as Level,
    voice: (searchParams.get("voice") ?? "priya") as VoiceType,
  };

  const { sessionStatus, transcripts, setTranscripts, agentState, startSession, endSession } =
    useSession(config);

  useTranscriptTranslation(transcripts, setTranscripts);

  useEffect(() => {
    void startSession().then(() => {
      setStartTime(Date.now());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (endConfirmTimer.current) clearTimeout(endConfirmTimer.current);
    };
  }, []);

  const handleEnd = useCallback(async () => {
    const result = await endSession();
    if (result) {
      router.push(`/results?sessionId=${result.sessionId}`);
    } else {
      router.push("/practice");
    }
  }, [endSession, router]);

  const handleOrbTap = useCallback(() => {
    if (sessionStatus !== "active") return;

    if (!endConfirmPending) {
      setEndConfirmPending(true);
      setOrbPulsing(true);
      setTimeout(() => setOrbPulsing(false), 300);

      endConfirmTimer.current = setTimeout(() => {
        setEndConfirmPending(false);
      }, 2000);
    } else {
      if (endConfirmTimer.current) clearTimeout(endConfirmTimer.current);
      setEndConfirmPending(false);
      setOrbExiting(true);
      setTimeout(() => void handleEnd(), 400);
    }
  }, [sessionStatus, endConfirmPending, handleEnd]);

  const modeInfo = MODES.find((m) => m.id === config.mode);
  const stateInfo = endConfirmPending
    ? END_CONFIRM_LABEL
    : STATE_LABELS[agentState] ?? STATE_LABELS.idle;

  if (sessionStatus === "ending") {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-page-mesh">
        <p className="font-bengali text-slate-500">সেশন শেষ হচ্ছে...</p>
      </main>
    );
  }

  if (sessionStatus === "error") {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-page-mesh px-4">
        <div className="glass-panel rounded-3xl p-8 text-center">
          <p className="font-bengali text-slate-600 mb-4">
            কানেকশনে সমস্যা হয়েছে
          </p>
          <button
            onClick={() => router.push("/practice")}
            className="btn-primary rounded-xl bg-gradient-to-b from-primary-500 to-primary-600 px-6 py-2.5 min-h-[44px] text-sm font-semibold text-white hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            <span className="font-bengali">আবার ট্রাই করুন</span>
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col bg-page-mesh">
      <header className="flex items-center justify-between px-6 pt-5 shrink-0">
        <span className="font-bengali text-sm text-slate-500/70">
          {modeInfo?.namebn ?? config.mode}
        </span>
        {startTime > 0 && <SessionTimer startTime={startTime} />}
      </header>

      <div
        className={`flex-1 flex flex-col items-center justify-center pb-[120px] transition-all duration-300 ${
          sheetExpanded ? "scale-[0.85] opacity-40" : "scale-100 opacity-100"
        }`}
        onClick={sheetExpanded ? () => setSheetExpanded(false) : undefined}
      >
        <div
          onClick={(e) => { if (!sheetExpanded) { e.stopPropagation(); handleOrbTap(); } }}
          className={`${sessionStatus === "active" ? "cursor-pointer" : "pointer-events-none"} ${
            orbPulsing ? "animate-orb-pulse" : ""
          } ${orbExiting ? "orb-exit" : ""}`}
        >
          <VoiceOrb state={agentState as "idle" | "listening" | "thinking" | "speaking"} />
        </div>
        <p
          className={`font-bengali text-sm font-medium mt-3 transition-colors duration-300 ${stateInfo.color}`}
        >
          {stateInfo.text}
        </p>
      </div>

      <TranscriptSheet
        entries={transcripts}
        expanded={sheetExpanded}
        onToggle={() => setSheetExpanded((v) => !v)}
      />
    </main>
  );
}

export default function SessionPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh items-center justify-center bg-page-mesh">
          <p className="font-bengali text-slate-500">লোড হচ্ছে...</p>
        </main>
      }
    >
      <SessionContent />
    </Suspense>
  );
}
