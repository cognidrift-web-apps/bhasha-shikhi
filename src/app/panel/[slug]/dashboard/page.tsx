"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { StatsCard } from "@/components/admin/stats-card";

interface DashboardData {
  total: number;
  today: number;
  week: number;
  month: number;
  avgDurationSeconds: number;
  avgScore: number;
}

export default function DashboardPage() {
  const params = useParams();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-stone-500">Loading dashboard...</p>
      </main>
    );
  }

  const avgMin = Math.floor(data.avgDurationSeconds / 60);
  const avgSec = data.avgDurationSeconds % 60;

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
          <Link
            href={`/panel/${params.slug}/sessions`}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
          >
            View All Sessions
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard label="Total Sessions" value={data.total} />
          <StatsCard label="Today" value={data.today} />
          <StatsCard label="This Week" value={data.week} />
          <StatsCard label="Avg Score" value={`${data.avgScore}%`} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard label="Avg Duration" value={`${avgMin}m ${avgSec}s`} />
        </div>
      </div>
    </main>
  );
}
