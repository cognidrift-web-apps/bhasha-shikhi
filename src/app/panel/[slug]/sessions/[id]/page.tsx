"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { TranscriptViewer } from "@/components/admin/transcript-viewer";
import { ScoreCard } from "@/components/results/score-card";
import type { Session, Transcript, SessionScore } from "@/lib/supabase/types";
import type { ScoreResult } from "@/lib/prompts/scoring";

interface SessionDetailData {
  session: Session | null;
  transcripts: Transcript[];
  scores: SessionScore | null;
  audioUrl: string | null;
}

function toScoreResult(s: SessionScore): ScoreResult {
  return {
    fluency: s.fluency,
    vocabulary: s.vocabulary,
    grammar: s.grammar,
    pronunciation: s.pronunciation,
    overall: s.overall,
    feedback: s.feedback_text ?? "",
    strengths: s.strengths,
    improvements: s.improvements,
    suggested_next: s.suggested_next ?? "",
    xp: s.xp,
    bangla_fallback_count: s.bangla_fallback_count,
  };
}

export default function SessionDetailPage() {
  const params = useParams();
  const [data, setData] = useState<SessionDetailData | null>(null);

  useEffect(() => {
    fetch(`/api/admin/sessions?id=${params.id}`)
      .then((r) => r.json())
      .then((d: SessionDetailData) => setData(d))
      .catch(() => {});
  }, [params.id]);

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-stone-500">Loading session...</p>
      </main>
    );
  }

  const { session, transcripts, scores, audioUrl } = data;

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-stone-500">Session not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/panel/${params.slug}/sessions`}
          className="text-sm text-brand-600 hover:underline"
        >
          Back to Sessions
        </Link>

        <h1 className="text-2xl font-bold text-stone-900 mt-4 mb-6">
          Session Detail
        </h1>

        <div className="rounded-lg border border-stone-200 bg-white p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-stone-500">User</span>
              <p className="font-medium">{session.user_name ?? "Anonymous"}</p>
            </div>
            <div>
              <span className="text-stone-500">Language</span>
              <p className="font-medium capitalize">{session.language}</p>
            </div>
            <div>
              <span className="text-stone-500">Mode</span>
              <p className="font-medium">{session.mode.replace(/_/g, " ")}</p>
            </div>
            <div>
              <span className="text-stone-500">Duration</span>
              <p className="font-medium font-mono">
                {session.duration_seconds
                  ? `${Math.floor(session.duration_seconds / 60)}m ${session.duration_seconds % 60}s`
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        {scores && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-stone-800 mb-3">Scores</h2>
            <ScoreCard scores={toScoreResult(scores)} />
          </div>
        )}

        {audioUrl && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-stone-800 mb-3">Recording</h2>
            <audio controls src={audioUrl} className="w-full" />
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">
            Transcript ({transcripts.length} messages)
          </h2>
          <div className="rounded-lg border border-stone-200 bg-white p-4">
            <TranscriptViewer transcripts={transcripts} />
          </div>
        </div>
      </div>
    </main>
  );
}
