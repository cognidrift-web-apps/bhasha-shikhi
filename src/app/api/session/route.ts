import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { LANGUAGES, MODES, LEVELS, VOICES } from "@/lib/constants";

const VALID_LANGUAGES: string[] = LANGUAGES.map((l) => l.id);
const VALID_MODES: string[] = MODES.map((m) => m.id);
const VALID_LEVELS: string[] = LEVELS.map((l) => l.id);
const VALID_VOICE_TYPES: string[] = VOICES.map((v) => v.id);

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { language, mode, level, voice_type, device_info, browser_fingerprint } =
    body as Record<string, unknown>;

  // Input validation
  if (!language || typeof language !== "string" || !VALID_LANGUAGES.includes(language)) {
    return NextResponse.json(
      { error: `Invalid language. Must be one of: ${VALID_LANGUAGES.join(", ")}` },
      { status: 400 },
    );
  }
  if (!mode || typeof mode !== "string" || !VALID_MODES.includes(mode)) {
    return NextResponse.json(
      { error: `Invalid mode. Must be one of: ${VALID_MODES.join(", ")}` },
      { status: 400 },
    );
  }
  if (!level || typeof level !== "string" || !VALID_LEVELS.includes(level)) {
    return NextResponse.json(
      { error: `Invalid level. Must be one of: ${VALID_LEVELS.join(", ")}` },
      { status: 400 },
    );
  }
  if (voice_type && (typeof voice_type !== "string" || !VALID_VOICE_TYPES.includes(voice_type))) {
    return NextResponse.json(
      { error: `Invalid voice_type. Must be one of: ${VALID_VOICE_TYPES.join(", ")}` },
      { status: 400 },
    );
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("sessions")
    .insert({
      language,
      mode,
      level,
      voice_type: voice_type ?? "priya",
      device_info: (device_info as Record<string, unknown>) || {},
      browser_fingerprint: (browser_fingerprint as string) || null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}

export async function PATCH(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { sessionId, status, duration_seconds, user_name } =
    body as Record<string, unknown>;

  // Input validation
  if (!sessionId || typeof sessionId !== "string") {
    return NextResponse.json({ error: "Missing required field: sessionId" }, { status: 400 });
  }
  if (!status || typeof status !== "string") {
    return NextResponse.json({ error: "Missing required field: status" }, { status: 400 });
  }

  const VALID_STATUSES = ["active", "completed", "abandoned"];
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
      { status: 400 },
    );
  }

  const supabase = createServerClient();
  const updates: Record<string, unknown> = { status };

  if (status === "completed" || status === "abandoned") {
    updates.ended_at = new Date().toISOString();
  }
  if (duration_seconds !== undefined) {
    updates.duration_seconds = duration_seconds;
  }
  if (user_name) {
    updates.user_name = user_name;
  }

  const { error } = await supabase
    .from("sessions")
    .update(updates)
    .eq("id", sessionId);

  if (error) {
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
