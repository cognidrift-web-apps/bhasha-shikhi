/**
 * ScoreCard - Overall score circle + 4 dimension bars
 *
 * Scores are 0-100 percentages (not band scores).
 * Bengali labels use transliterated everyday Bangladeshi Bangla.
 */

import type { ScoreResult } from "@/lib/prompts/scoring";

// ---------------------------------------------------------------------------
// Dimension bar
// ---------------------------------------------------------------------------

interface DimensionBarProps {
  labelEn: string;
  labelBn: string;
  score: number;
}

function DimensionBar({ labelEn, labelBn, score }: DimensionBarProps) {
  const pct = Math.round(score);

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-stone-700">{labelEn}</span>
          <span className="font-bengali text-xs text-stone-400">{labelBn}</span>
        </div>
        <span className="font-mono text-sm font-semibold text-brand-700 tabular-nums">
          {pct}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-stone-100">
        <div
          className="h-2 rounded-full bg-brand-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SVG circular progress
// ---------------------------------------------------------------------------

interface CircleProgressProps {
  score: number;
}

function CircleProgress({ score }: CircleProgressProps) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.round(score);
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width="140"
        height="140"
        viewBox="0 0 140 140"
        className="rotate-[-90deg]"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#e7e5e4"
          strokeWidth="12"
        />
        {/* Progress */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#14b8a6"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      {/* Score label centred inside the ring */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-4xl font-bold text-brand-700 tabular-nums leading-none">
          {pct}
        </span>
        <span className="text-xs text-stone-400 mt-0.5">%</span>
        <span className="font-bengali text-xs text-stone-500 mt-1">ওভারঅল</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ScoreCard (exported)
// ---------------------------------------------------------------------------

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
    <div className="rounded-xl border border-stone-200 bg-white p-6 space-y-6">
      {/* Overall circle */}
      <div className="flex justify-center">
        <CircleProgress score={scores.overall} />
      </div>

      {/* Dimension bars */}
      <div className="space-y-4">
        {DIMENSIONS.map(({ key, labelEn, labelBn }) => (
          <DimensionBar
            key={key}
            labelEn={labelEn}
            labelBn={labelBn}
            score={scores[key] as number}
          />
        ))}
      </div>
    </div>
  );
}
