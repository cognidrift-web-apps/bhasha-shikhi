import type { ScoreResult } from "@/lib/prompts/scoring";

function toBengaliNumerals(n: number): string {
  const digits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n)
    .split("")
    .map((ch) => digits[parseInt(ch, 10)] ?? ch)
    .join("");
}

function BanglaFallbackBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <p className="font-bengali text-sm text-amber-600">
      {toBengaliNumerals(count)} বার বাংলায় চলে গেছেন
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
        <span className="text-sm font-medium text-primary-600 tabular-nums">
          {scores.xp} XP
        </span>
        <span className="font-bengali text-sm text-primary-500">পেয়েছেন</span>
        <BanglaFallbackBadge count={scores.bangla_fallback_count} />
      </div>

      {scores.feedback && (
        <p className="font-bengali text-slate-700 leading-relaxed">{scores.feedback}</p>
      )}

      {scores.strengths.length > 0 && (
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-sm font-medium text-emerald-700 mb-3">
            <span className="font-bengali">ভালো করেছেন</span>
            <span className="text-emerald-500 ml-1.5 text-xs">(Strengths)</span>
          </h3>
          <ul className="space-y-2">
            {scores.strengths.map((item, i) => (
              <li key={i} className="text-sm text-slate-600 flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {scores.improvements.length > 0 && (
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-sm font-medium text-amber-700 mb-3">
            <span className="font-bengali">আরো ভালো করতে পারেন</span>
            <span className="text-amber-500 ml-1.5 text-xs">(To Improve)</span>
          </h3>
          <ul className="space-y-2">
            {scores.improvements.map((item, i) => (
              <li key={i} className="text-sm text-slate-600 flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {scores.suggested_next && (
        <div className="glass-card rounded-xl px-4 py-3">
          <p className="text-xs text-primary-500 mb-1">
            <span className="font-bengali">পরের ধাপ</span>
            <span className="ml-1 text-xs">(Next Step)</span>
          </p>
          <p className="text-sm font-medium text-slate-700">{scores.suggested_next}</p>
        </div>
      )}
    </div>
  );
}
