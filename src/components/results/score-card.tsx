"use client";

import { useEffect, useState } from "react";
import type { ScoreResult } from "@/lib/prompts/scoring";

function useCountUp(target: number, duration = 1500): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf: number;
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(progress * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

interface DimensionBarProps {
  labelEn: string;
  labelBn: string;
  score: number;
  delay: number;
}

function DimensionBar({ labelEn, labelBn, score, delay }: DimensionBarProps) {
  const pct = Math.round(score);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(pct), delay);
    return () => clearTimeout(timer);
  }, [pct, delay]);

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-slate-700">{labelEn}</span>
          <span className="font-bengali text-xs text-slate-400">{labelBn}</span>
        </div>
        <span className="font-mono text-sm font-semibold text-primary-600 tabular-nums">
          {pct}%
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-100">
        <div
          className="h-2.5 rounded-full bg-primary-600 transition-all duration-[800ms] ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

interface CircleProgressProps {
  score: number;
}

function CircleProgress({ score }: CircleProgressProps) {
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const displayScore = useCountUp(Math.round(score));
  const offset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width="160"
        height="160"
        viewBox="0 0 160 160"
        className="rotate-[-90deg]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="10" />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-[1500ms] ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-4xl font-bold text-[#1E1B4B] tabular-nums leading-none">
          {displayScore}
        </span>
        <span className="text-lg text-slate-500 mt-0.5">%</span>
        <span className="font-bengali text-sm text-slate-400 mt-1">ওভারঅল</span>
      </div>
    </div>
  );
}

interface Props {
  scores: ScoreResult;
}

const DIMENSIONS: { key: keyof ScoreResult; labelEn: string; labelBn: string }[] = [
  { key: "fluency", labelEn: "Fluency", labelBn: "ফ্লুয়েন্সি" },
  { key: "vocabulary", labelEn: "Vocabulary", labelBn: "ভোক্যাবুলারি" },
  { key: "grammar", labelEn: "Grammar", labelBn: "গ্রামার" },
  { key: "pronunciation", labelEn: "Pronunciation", labelBn: "প্রনান্সিয়েশন" },
];

export function ScoreCard({ scores }: Props) {
  return (
    <div
      className="rounded-2xl bg-white p-6 space-y-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex justify-center">
        <CircleProgress score={scores.overall} />
      </div>
      <div className="space-y-4">
        {DIMENSIONS.map(({ key, labelEn, labelBn }, i) => (
          <DimensionBar
            key={key}
            labelEn={labelEn}
            labelBn={labelBn}
            score={scores[key] as number}
            delay={i * 150}
          />
        ))}
      </div>
    </div>
  );
}
