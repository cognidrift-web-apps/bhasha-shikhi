"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SessionsTable } from "@/components/admin/sessions-table";
import type { Session } from "@/lib/supabase/types";

type SessionWithScore = Session & { session_scores?: Array<{ overall: number }> };

const LANGUAGES = ["english", "german", "arabic", "hindi"];
const MODES = [
  "word_by_word",
  "conversation",
  "roleplay",
  "pronunciation",
  "grammar",
  "listening",
  "live_translation",
];

export default function SessionsListPage() {
  const params = useParams();
  const [sessions, setSessions] = useState<SessionWithScore[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [language, setLanguage] = useState("");
  const [mode, setMode] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const qs = new URLSearchParams();
    qs.set("page", String(page));
    if (language) qs.set("language", language);
    if (mode) qs.set("mode", mode);
    if (dateFrom) qs.set("dateFrom", dateFrom);
    if (dateTo) qs.set("dateTo", dateTo);

    fetch(`/api/admin/sessions?${qs.toString()}`)
      .then((r) => r.json())
      .then((data: { sessions: SessionWithScore[]; total: number }) => {
        setSessions(data.sessions);
        setTotal(data.total);
      })
      .catch(() => {});
  }, [page, language, mode, dateFrom, dateTo]);

  const handleFilterChange = () => {
    setPage(1);
  };

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-stone-900">
            Sessions ({total})
          </h1>
          <Link
            href={`/panel/${params.slug}/dashboard`}
            className="text-sm text-primary-500 hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-4 flex flex-wrap gap-3">
          <select
            value={language}
            onChange={(e) => { setLanguage(e.target.value); handleFilterChange(); }}
            className="rounded border border-stone-300 px-3 py-1.5 text-sm text-stone-700"
          >
            <option value="">All Languages</option>
            {LANGUAGES.map((l) => (
              <option key={l} value={l} className="capitalize">
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={mode}
            onChange={(e) => { setMode(e.target.value); handleFilterChange(); }}
            className="rounded border border-stone-300 px-3 py-1.5 text-sm text-stone-700"
          >
            <option value="">All Modes</option>
            {MODES.map((m) => (
              <option key={m} value={m}>
                {m.replace(/_/g, " ")}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 text-sm text-stone-600">
            <label htmlFor="dateFrom">From</label>
            <input
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); handleFilterChange(); }}
              className="rounded border border-stone-300 px-2 py-1.5 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-stone-600">
            <label htmlFor="dateTo">To</label>
            <input
              id="dateTo"
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); handleFilterChange(); }}
              className="rounded border border-stone-300 px-2 py-1.5 text-sm"
            />
          </div>

          {(language || mode || dateFrom || dateTo) && (
            <button
              onClick={() => {
                setLanguage("");
                setMode("");
                setDateFrom("");
                setDateTo("");
                setPage(1);
              }}
              className="rounded border border-stone-300 px-3 py-1.5 text-sm text-stone-500 hover:bg-stone-50"
            >
              Clear
            </button>
          )}
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
