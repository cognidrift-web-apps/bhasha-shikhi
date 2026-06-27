"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { ScoreCard } from "@/components/results/score-card";
import { FeedbackPanel } from "@/components/results/feedback-panel";
import type { ScoreResult } from "@/lib/prompts/scoring";

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("sessionId");

  const [scores, setScores] = useState<ScoreResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!sessionId || fetchedRef.current) return;
    fetchedRef.current = true;

    fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then((res) => res.json())
      .then((data: ScoreResult & { error?: string }) => {
        if (data.error) {
          setError(data.error);
        } else {
          setScores(data);
        }
      })
      .catch(() => setError("স্কোর লোড করা যাচ্ছে না।"))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-page px-4">
        <div className="text-center space-y-2">
          <div className="mx-auto h-10 w-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
          <p className="font-bengali text-slate-500 text-sm">
            স্কোর বের করছি...
          </p>
        </div>
      </main>
    );
  }

  if (error || !scores) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-page px-4">
        <div className="text-center space-y-4">
          <p className="font-bengali text-slate-600">
            {error ?? "স্কোর পাওয়া যায়নি।"}
          </p>
          <button
            onClick={() => router.push("/practice")}
            className="rounded-xl bg-primary-600 px-6 py-2.5 min-h-[44px] text-sm font-semibold text-white hover:-translate-y-0.5 active:scale-[0.98] transition-all"
          >
            <span className="font-bengali">আবার ট্রাই করো</span>
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface-page px-4 py-8">
      <div className="mx-auto max-w-xl space-y-6">
        <Link
          href="/practice"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span className="font-bengali">প্র্যাকটিস পেজে ফিরে যাও</span>
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-[#1E1B4B]">Session Report Card</h1>
          <p className="font-bengali text-primary-500 mt-0.5">সেশন রিপোর্ট কার্ড</p>
        </div>

        <ScoreCard scores={scores} />

        <div
          className="rounded-2xl bg-white p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <FeedbackPanel scores={scores} />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => router.push("/practice")}
            className="flex-1 rounded-xl bg-primary-600 py-3 text-center text-sm font-semibold text-white transition-all hover:-translate-y-0.5 active:scale-[0.98] min-h-[52px]"
            style={{ boxShadow: "0 4px 14px rgba(59,130,246,0.25)" }}
          >
            <span className="font-bengali">আবার প্র্যাকটিস করো</span>
            <span className="text-white/50 mx-1.5">|</span>
            <span>Practice Again</span>
          </button>
          <button
            onClick={() => router.push("/practice")}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-center text-sm font-semibold text-slate-700 hover:border-blue-300 transition-colors min-h-[52px]"
          >
            <span className="font-bengali">অন্য মোড ট্রাই করো</span>
            <span className="text-slate-300 mx-1.5">|</span>
            <span>Try Different Mode</span>
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-surface-page">
          <p className="font-bengali text-slate-500 text-sm">লোড হচ্ছে...</p>
        </main>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
