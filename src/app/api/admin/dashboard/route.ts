import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";

async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.has("bhasha_admin");
}

export async function GET(_req: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart = new Date(now.getTime() - 7 * 86400000).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { count: totalSessions },
    { count: todaySessions },
    { count: weekSessions },
    { count: monthSessions },
    { data: avgDuration },
    { data: avgScoreRows },
  ] = await Promise.all([
    supabase.from("sessions").select("*", { count: "exact", head: true }),
    supabase.from("sessions").select("*", { count: "exact", head: true }).gte("started_at", todayStart),
    supabase.from("sessions").select("*", { count: "exact", head: true }).gte("started_at", weekStart),
    supabase.from("sessions").select("*", { count: "exact", head: true }).gte("started_at", monthStart),
    supabase.from("sessions").select("duration_seconds").not("duration_seconds", "is", null),
    supabase.from("session_scores").select("overall"),
  ]);

  const avgDur = avgDuration && avgDuration.length > 0
    ? Math.round(
        avgDuration.reduce(
          (s: number, r: { duration_seconds: number | null }) =>
            s + (r.duration_seconds ?? 0),
          0,
        ) / avgDuration.length,
      )
    : 0;

  const avgScore = avgScoreRows && avgScoreRows.length > 0
    ? Math.round(
        avgScoreRows.reduce(
          (s: number, r: { overall: number }) => s + r.overall,
          0,
        ) / avgScoreRows.length,
      )
    : 0;

  return NextResponse.json({
    total: totalSessions ?? 0,
    today: todaySessions ?? 0,
    week: weekSessions ?? 0,
    month: monthSessions ?? 0,
    avgDurationSeconds: avgDur,
    avgScore,
  });
}
