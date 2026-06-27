"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
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
      <main className="flex min-h-screen items-center justify-center bg-page-mesh px-4">
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
      <main className="flex min-h-screen items-center justify-center bg-page-mesh px-4">
        <div className="rounded-2xl bg-white/50 backdrop-blur-xl border border-white/40 shadow-lg shadow-indigo-500/10 p-8 text-center space-y-4">
          <p className="font-bengali text-slate-600">
            {error ?? "স্কোর পাওয়া যায়নি।"}
          </p>
          <button
            onClick={() => router.push("/practice")}
            className="btn-primary rounded-2xl bg-gradient-to-b from-primary-500 to-primary-600 px-6 py-2.5 min-h-[44px] text-sm font-semibold text-white hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300"
          >
            <span className="font-bengali">আবার ট্রাই করো</span>
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-page-mesh px-4 py-8">
      <div className="mx-auto max-w-lg space-y-8">
        <Link
          href="/practice"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors duration-300"
        >
          <ArrowLeft size={18} weight="duotone" />
          <span className="font-bengali">প্র্যাকটিস পেজে ফিরে যাও</span>
        </Link>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1E1B4B]">Session Report Card</h1>
          <p className="font-bengali text-primary-500 mt-0.5">সেশন রিপোর্ট কার্ড</p>
        </div>

        <ScoreCard scores={scores} />

        <div className="rounded-2xl bg-white/50 backdrop-blur-xl border border-white/40 shadow-lg shadow-indigo-500/10 p-6">
          <FeedbackPanel scores={scores} />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => router.push("/practice")}
            className="btn-primary flex-1 rounded-2xl bg-gradient-to-b from-primary-500 to-primary-600 py-3 text-center text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] min-h-[52px]"
          >
            <span className="font-bengali">আবার প্র্যাকটিস করো</span>
            <span className="text-white/50 mx-1.5">|</span>
            <span>Practice Again</span>
          </button>
          <button
            onClick={() => router.push("/practice")}
            className="flex-1 rounded-2xl bg-white/40 backdrop-blur-lg border border-white/50 shadow-md shadow-indigo-500/5 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-white/60 transition-all duration-300 min-h-[52px]"
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
        <main className="flex min-h-screen items-center justify-center bg-page-mesh">
          <p className="font-bengali text-slate-500 text-sm">লোড হচ্ছে...</p>
        </main>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
