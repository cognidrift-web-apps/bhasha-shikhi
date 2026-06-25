"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SessionsTable } from "@/components/admin/sessions-table";
import type { Session } from "@/lib/supabase/types";

type SessionWithScore = Session & { session_scores?: Array<{ overall: number }> };

export default function SessionsListPage() {
  const params = useParams();
  const [sessions, setSessions] = useState<SessionWithScore[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(`/api/admin/sessions?page=${page}`)
      .then((r) => r.json())
      .then((data: { sessions: SessionWithScore[]; total: number }) => {
        setSessions(data.sessions);
        setTotal(data.total);
      })
      .catch(() => {});
  }, [page]);

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-stone-900">
            Sessions ({total})
          </h1>
          <Link
            href={`/panel/${params.slug}/dashboard`}
            className="text-sm text-brand-600 hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <SessionsTable sessions={sessions} slug={params.slug as string} />
        </div>

        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm text-stone-500">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={sessions.length < 20}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
}
