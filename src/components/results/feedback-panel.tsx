/**
 * FeedbackPanel - Feedback text, strengths, improvements, XP badge, and Bangla fallback count.
 *
 * All Bengali text uses casual Dhaka Bangla.
 * No emoji, no emdash.
 */

import type { ScoreResult } from "@/lib/prompts/scoring";

// ---------------------------------------------------------------------------
// Bengali numeral helper (0-9 only; for small counts)
// ---------------------------------------------------------------------------

function toBengaliNumerals(n: number): string {
  const digits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n)
    .split("")
    .map((ch) => digits[parseInt(ch, 10)] ?? ch)
    .join("");
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function XpBadge({ xp }: { xp: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-200 px-4 py-1.5">
      <span className="font-mono text-base font-bold text-brand-700 tabular-nums">
        +{xp} XP
      </span>
      <span className="font-bengali text-sm text-brand-600">অর্জিত</span>
    </div>
  );
}

function BanglaFallbackBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <p className="font-bengali text-sm text-accent-600">
      {toBengaliNumerals(count)} বার বাংলায় চলে গেছেন
    </p>
  );
}

// ---------------------------------------------------------------------------
// FeedbackPanel (exported)
// ---------------------------------------------------------------------------

interface Props {
  scores: ScoreResult;
}

export function FeedbackPanel({ scores }: Props) {
  return (
    <div className="space-y-6">
      {/* XP + fallback row */}
      <div className="flex flex-wrap items-center gap-3">
        <XpBadge xp={scores.xp} />
        <BanglaFallbackBadge count={scores.bangla_fallback_count} />
      </div>

      {/* Overall feedback */}
      {scores.feedback && (
        <p className="font-bengali text-stone-700 leading-relaxed">{scores.feedback}</p>
      )}

      {/* Strengths */}
      {scores.strengths.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-brand-700 uppercase tracking-wide mb-3">
            Strengths{" "}
            <span className="font-bengali normal-case text-brand-500">
              (ভালো করেছেন)
            </span>
          </h3>
          <ul className="space-y-2">
            {scores.strengths.map((item, i) => (
              <li key={i} className="text-sm text-stone-600 flex items-start gap-2">
                <span className="text-brand-500 font-bold mt-0.5 shrink-0">+</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {scores.improvements.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-accent-700 uppercase tracking-wide mb-3">
            To Improve{" "}
            <span className="font-bengali normal-case text-accent-500">
              (উন্নতি করুন)
            </span>
          </h3>
          <ul className="space-y-2">
            {scores.improvements.map((item, i) => (
              <li
                key={i}
                className="text-sm text-stone-600 flex items-start gap-2 rounded-md bg-accent-50 px-3 py-2"
              >
                <span className="text-accent-500 font-bold mt-0.5 shrink-0">!</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested next */}
      {scores.suggested_next && (
        <div className="rounded-md border border-stone-200 bg-surface-50 px-4 py-3">
          <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">
            Next step{" "}
            <span className="font-bengali normal-case">পরের ধাপ</span>
          </p>
          <p className="text-sm font-medium text-stone-700">{scores.suggested_next}</p>
        </div>
      )}
    </div>
  );
}
