import type { ScoreResult } from "@/lib/prompts/scoring";

function toBengaliNumerals(n: number): string {
  const digits = ["০", "১", "२", "३", "४", "५", "६", "७", "८", "९"];
  return String(n)
    .split("")
    .map((ch) => digits[parseInt(ch, 10)] ?? ch)
    .join("");
}

function XpBadge({ xp }: { xp: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-5 py-2">
      <span className="font-mono text-xl font-bold text-primary-600 tabular-nums">
        +{xp} XP
      </span>
      <span className="font-bengali text-sm text-primary-500">পেয়েছো</span>
    </div>
  );
}

function BanglaFallbackBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <p className="font-bengali text-sm text-amber-600">
      {toBengaliNumerals(count)} বার বাংলায় চলে গেছো
    </p>
  );
}

interface Props {
  scores: ScoreResult;
}

export function FeedbackPanel({ scores }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <XpBadge xp={scores.xp} />
        <BanglaFallbackBadge count={scores.bangla_fallback_count} />
      </div>

      {scores.feedback && (
        <p className="font-bengali text-slate-700 leading-relaxed">{scores.feedback}</p>
      )}

      {scores.strengths.length > 0 && (
        <div className="rounded-xl border-l-[3px] border-emerald-500 bg-white pl-4 pr-3 py-3">
          <h3 className="text-sm font-semibold text-emerald-700 mb-3">
            <span className="font-bengali">ভালো করেছো</span>
            <span className="text-emerald-500 ml-1.5">(Strengths)</span>
          </h3>
          <ul className="space-y-2">
            {scores.strengths.map((item, i) => (
              <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                <span className="text-emerald-500 font-bold mt-0.5 shrink-0">+</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {scores.improvements.length > 0 && (
        <div className="rounded-xl border-l-[3px] border-amber-500 bg-white pl-4 pr-3 py-3">
          <h3 className="text-sm font-semibold text-amber-700 mb-3">
            <span className="font-bengali">আরো ভালো করতে পারো</span>
            <span className="text-amber-500 ml-1.5">(To Improve)</span>
          </h3>
          <ul className="space-y-2">
            {scores.improvements.map((item, i) => (
              <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                <span className="text-amber-500 font-bold mt-0.5 shrink-0">!</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {scores.suggested_next && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
          <p className="text-xs text-blue-500 uppercase tracking-wide mb-1">
            <span className="font-bengali normal-case">পরের ধাপ</span>
            <span className="ml-1">(Next Step)</span>
          </p>
          <p className="text-sm font-medium text-slate-700">{scores.suggested_next}</p>
        </div>
      )}
    </div>
  );
}
