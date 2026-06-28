"use client";

import Link from "next/link";
import type { Session } from "@/lib/supabase/types";

interface Props {
  sessions: (Session & { session_scores?: Array<{ overall: number }> })[];
  slug: string;
}

export function SessionsTable({ sessions, slug }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-200 text-left text-stone-500">
            <th className="pb-2 pr-4">Date</th>
            <th className="pb-2 pr-4">User</th>
            <th className="pb-2 pr-4">Language</th>
            <th className="pb-2 pr-4">Mode</th>
            <th className="pb-2 pr-4">Level</th>
            <th className="pb-2 pr-4">Voice</th>
            <th className="pb-2 pr-4">Duration</th>
            <th className="pb-2 pr-4">Score</th>
            <th className="pb-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s.id} className="border-b border-stone-100 hover:bg-stone-50">
              <td className="py-2 pr-4">
                <Link
                  href={`/panel/${slug}/sessions/${s.id}`}
                  className="text-primary-500 hover:underline"
                >
                  {new Date(s.started_at).toLocaleDateString()}
                </Link>
              </td>
              <td className="py-2 pr-4">{s.user_name ?? "Anonymous"}</td>
              <td className="py-2 pr-4 capitalize">{s.language}</td>
              <td className="py-2 pr-4">{s.mode.replace(/_/g, " ")}</td>
              <td className="py-2 pr-4 capitalize">{s.level}</td>
              <td className="py-2 pr-4 capitalize">{s.voice_type}</td>
              <td className="py-2 pr-4 font-mono tabular-nums">
                {s.duration_seconds
                  ? `${Math.floor(s.duration_seconds / 60)}m`
                  : "-"}
              </td>
              <td className="py-2 pr-4 font-mono tabular-nums">
                {s.session_scores?.[0]?.overall?.toFixed(1) ?? "-"}
              </td>
              <td className="py-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    s.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : s.status === "abandoned"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {s.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
