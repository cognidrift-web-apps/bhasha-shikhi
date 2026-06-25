import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

const ALLOWED_AUDIO_TYPES = ["audio/webm", "audio/ogg", "audio/wav", "audio/mp4"];
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("audio") as File | null;
  const sessionId = formData.get("sessionId") as string | null;

  // Input validation
  if (!sessionId || typeof sessionId !== "string" || sessionId.trim() === "") {
    return NextResponse.json(
      { error: "Missing required field: sessionId" },
      { status: 400 },
    );
  }

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Missing required field: audio (must be a file)" },
      { status: 400 },
    );
  }

  if (file.size === 0) {
    return NextResponse.json(
      { error: "Audio file is empty" },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File too large (max 50MB)" },
      { status: 413 },
    );
  }

  if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `Invalid audio format. Allowed: ${ALLOWED_AUDIO_TYPES.join(", ")}` },
      { status: 415 },
    );
  }

  const supabase = createServerClient();
  const extension = file.type === "audio/wav" ? "wav" : file.type === "audio/ogg" ? "ogg" : file.type === "audio/mp4" ? "mp4" : "webm";
  const path = `sessions/${sessionId}/${Date.now()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("audio-recordings")
    .upload(path, buffer, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 },
    );
  }

  const { error: insertError } = await supabase.from("audio_recordings").insert({
    session_id: sessionId,
    storage_path: path,
    file_size_bytes: file.size,
  });

  if (insertError) {
    return NextResponse.json(
      { error: "Failed to save audio recording metadata" },
      { status: 500 },
    );
  }

  return NextResponse.json({ path });
}
