"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LanguageSelector } from "@/components/setup/language-selector";
import { ModeSelector } from "@/components/setup/mode-selector";
import { LevelSelector } from "@/components/setup/level-selector";
import { VoiceSelector } from "@/components/setup/voice-selector";
import type { Language, Mode, Level, VoiceType } from "@/lib/constants";

export default function PracticePage() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("english");
  const [mode, setMode] = useState<Mode>("word_by_word");
  const [level, setLevel] = useState<Level>("beginner");
  const [voice, setVoice] = useState<VoiceType>("priya");

  const isLiveTranslation = mode === "live_translation";

  function handleStart() {
    const params = new URLSearchParams({
      language,
      mode,
      level: isLiveTranslation ? "beginner" : level,
      voice,
    });
    router.push(`/session?${params.toString()}`);
  }

  return (
    <main className="min-h-screen bg-surface-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 transition-colors mb-6"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span>ফিরে যান</span>
        </Link>

        <h1 className="font-bengali text-2xl font-bold text-stone-900 mb-8">
          কী প্র্যাকটিস করবেন?
        </h1>

        <div className="space-y-8">
          <LanguageSelector value={language} onChange={setLanguage} />
          <ModeSelector value={mode} onChange={setMode} />
          {!isLiveTranslation && (
            <LevelSelector value={level} onChange={setLevel} />
          )}
          <VoiceSelector value={voice} onChange={setVoice} />
        </div>

        <button
          onClick={handleStart}
          className="mt-10 w-full min-h-[52px] rounded-lg bg-brand-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-brand-700 active:bg-brand-800"
        >
          <span className="font-bengali">শুরু করুন</span>
          <span className="text-brand-200 mx-2">|</span>
          <span>Start</span>
        </button>
      </div>
    </main>
  );
}
