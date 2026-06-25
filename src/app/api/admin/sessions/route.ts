import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";

async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.has("bhasha_admin");
}

export async function GET(req: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("id");

  const supabase = createServerClient();

  if (sessionId) {
    const [
      { data: session },
      { data: transcripts },
      { data: scores },
      { data: recordings },
    ] = await Promise.all([
      supabase.from("sessions").select("*").eq("id", sessionId).single(),
      supabase
        .from("transcripts")
        .select("*")
        .eq("session_id", sessionId)
        .order("sequence_number"),
      supabase
        .from("session_scores")
        .select("*")
        .eq("session_id", sessionId)
        .single(),
      supabase
        .from("audio_recordings")
        .select("*")
        .eq("session_id", sessionId),
    ]);

    let audioUrl: string | null = null;
    if (recordings && recordings.length > 0) {
      const { data: signedUrl } = await supabase.storage
        .from("audio-recordings")
        .createSignedUrl(recordings[0].storage_path, 3600);
      audioUrl = signedUrl?.signedUrl ?? null;
    }

    return NextResponse.json({ session, transcripts, scores, audioUrl });
  }

  const language = searchParams.get("language");
  const mode = searchParams.get("mode");
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("sessions")
    .select("*, session_scores(overall)", { count: "exact" })
    .order("started_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (language) query = query.eq("language", language);
  if (mode) query = query.eq("mode", mode);
  if (status) query = query.eq("status", status);

  const { data, count } = await query;

  return NextResponse.json({
    sessions: data ?? [],
    total: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / limit),
  });
}
