"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { ScoreCard } from "@/components/results/score-card";
import { FeedbackPanel } from "@/components/results/feedback-panel";
import type { ScoreResult } from "@/lib/prompts/scoring";

// ---------------------------------------------------------------------------
// Inner component (needs useSearchParams so wrapped in Suspense)
// ---------------------------------------------------------------------------

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

  // Loading state
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-50 px-4">
        <div className="text-center space-y-2">
          <div className="mx-auto h-10 w-10 rounded-full border-4 border-brand-200 border-t-brand-500 animate-spin" />
          <p className="font-bengali text-stone-500 text-sm">
            আপনার পারফরম্যান্স বিশ্লেষণ করা হচ্ছে...
          </p>
        </div>
      </main>
    );
  }

  // Error state
  if (error || !scores) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-50 px-4">
        <div className="text-center space-y-4">
          <p className="font-bengali text-stone-600">
            {error ?? "স্কোর পাওয়া যায়নি।"}
          </p>
          <button
            onClick={() => router.push("/practice")}
            className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            <span className="font-bengali">আবার চেষ্টা করুন</span>
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface-50 px-4 py-8">
      <div className="mx-auto max-w-xl space-y-6">
        {/* Back link */}
        <Link
          href="/practice"
          className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span className="font-bengali">প্র্যাকটিস পেজে ফিরুন</span>
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Session Report Card</h1>
          <p className="font-bengali text-brand-600 mt-0.5">সেশন রিপোর্ট কার্ড</p>
        </div>

        {/* Score card: circle + dimension bars */}
        <ScoreCard scores={scores} />

        {/* Feedback panel: XP, Bangla fallback, strengths, improvements */}
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <FeedbackPanel scores={scores} />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => router.push("/practice")}
            className="flex-1 rounded-lg bg-brand-600 py-3 text-center text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            <span className="font-bengali">আবার প্র্যাকটিস করুন</span>
            <span className="text-brand-200 mx-1.5">|</span>
            <span>Practice Again</span>
          </button>
          <button
            onClick={() => router.push("/practice")}
            className="flex-1 rounded-lg border border-stone-300 bg-white py-3 text-center text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <span className="font-bengali">অন্য মোড ট্রাই করুন</span>
            <span className="text-stone-300 mx-1.5">|</span>
            <span>Try Different Mode</span>
          </button>
        </div>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Page export (Suspense boundary for useSearchParams)
// ---------------------------------------------------------------------------

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-surface-50">
          <p className="font-bengali text-stone-500 text-sm">লোড হচ্ছে...</p>
        </main>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
