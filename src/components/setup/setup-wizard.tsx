"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { LanguageSelector } from "./language-selector";
import { ModeSelector } from "./mode-selector";
import { LevelSelector } from "./level-selector";
import { VoiceSelector } from "./voice-selector";
import type { Language, Mode, Level, VoiceType } from "@/lib/constants";

const STEPS = [
  { key: "language", label: "ভাষা" },
  { key: "mode", label: "মোড" },
  { key: "level", label: "লেভেল" },
  { key: "tutor", label: "টিউটর" },
] as const;

function ProgressTrack({ currentStep, completedSteps }: { currentStep: number; completedSteps: number }) {
  return (
    <div className="flex items-center justify-center gap-0 px-8 py-6">
      {STEPS.map((step, i) => {
        const isCompleted = i < completedSteps;
        const isActive = i === currentStep;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-[#D4A017] scale-[1.15]"
                    : isCompleted
                    ? "bg-primary-600"
                    : "border-2 border-slate-300 bg-white"
                }`}
                style={isActive ? { boxShadow: "0 0 8px 2px rgba(212, 160, 23, 0.3)" } : undefined}
              />
              <span
                className={`font-bengali text-xs ${
                  isActive ? "text-[#D4A017] font-medium" : isCompleted ? "text-primary-600" : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-12 sm:w-20 h-0.5 mx-2 mt-[-18px]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    i < completedSteps ? "bg-primary-600" : "bg-slate-200"
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function SetupWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState<Language>("english");
  const [mode, setMode] = useState<Mode>("conversation");
  const [level, setLevel] = useState<Level>("beginner");
  const [voice, setVoice] = useState<VoiceType>("priya");
  const [slideDirection, setSlideDirection] = useState<"right" | "left">("right");

  const isLiveTranslation = mode === "live_translation";

  const getEffectiveStep = useCallback(
    (s: number) => {
      if (isLiveTranslation && s >= 2) return s + 1;
      return s;
    },
    [isLiveTranslation]
  );

  const totalSteps = isLiveTranslation ? 3 : 4;

  const goNext = useCallback(() => {
    setSlideDirection("right");
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  }, [totalSteps]);

  const goBack = useCallback(() => {
    setSlideDirection("left");
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const handleLanguageSelect = useCallback(
    (v: Language) => {
      setLanguage(v);
      setTimeout(() => goNext(), 300);
    },
    [goNext]
  );

  const handleLevelSelect = useCallback(
    (v: Level) => {
      setLevel(v);
      setTimeout(() => goNext(), 300);
    },
    [goNext]
  );

  function handleStart() {
    const params = new URLSearchParams({
      language,
      mode,
      level: isLiveTranslation ? "beginner" : level,
      voice,
    });
    router.push(`/session?${params.toString()}`);
  }

  const effectiveStep = getEffectiveStep(step);
  const isLastStep = step === totalSteps - 1;
  const hasSelection =
    (effectiveStep === 0 && language) ||
    (effectiveStep === 1 && mode) ||
    (effectiveStep === 2 && level) ||
    (effectiveStep === 3 && voice);

  return (
    <main className="flex min-h-dvh flex-col bg-page-mesh">
      <ProgressTrack currentStep={effectiveStep} completedSteps={effectiveStep} />

      <div className="flex-1 flex items-start justify-center px-4 pt-4 pb-24 overflow-y-auto">
        <div
          key={step}
          className="w-full max-w-lg animate-step-slide"
          style={{
            animationDirection: slideDirection === "left" ? "reverse" : "normal",
          }}
        >
          {effectiveStep === 0 && (
            <LanguageSelector value={language} onSelect={handleLanguageSelect} />
          )}
          {effectiveStep === 1 && (
            <ModeSelector value={mode} onChange={setMode} />
          )}
          {effectiveStep === 2 && (
            <LevelSelector value={level} onSelect={handleLevelSelect} />
          )}
          {effectiveStep === 3 && (
            <VoiceSelector value={voice} onChange={setVoice} />
          )}
        </div>
      </div>

      <footer className="fixed bottom-0 inset-x-0 glass-bar border-t border-white/45 px-4 py-4">
        <div className="mx-auto max-w-lg flex items-center justify-between gap-3">
          {step > 0 ? (
            <button
              onClick={goBack}
              className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors duration-200 min-h-[44px] px-2"
            >
              <CaretLeft size={18} weight="fill" />
              <span className="font-bengali">পিছনে</span>
            </button>
          ) : (
            <div />
          )}

          {isLastStep ? (
            <button
              onClick={handleStart}
              disabled={!hasSelection}
              className="btn-primary flex-1 max-w-xs rounded-xl bg-gradient-to-b from-primary-500 to-primary-600 py-3.5 text-center font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 min-h-[56px]"
            >
              <span className="font-bengali">শুরু করুন</span>
              <span className="text-white/50 mx-2">|</span>
              <span>Start</span>
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={!hasSelection}
              className="btn-primary flex items-center gap-1 rounded-xl bg-gradient-to-b from-primary-500 to-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 min-h-[44px]"
            >
              <span className="font-bengali">পরেরটায় যান</span>
              <CaretRight size={18} weight="fill" />
            </button>
          )}
        </div>
      </footer>
    </main>
  );
}
