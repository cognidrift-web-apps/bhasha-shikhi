import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createServerClient } from "@/lib/supabase/server";
import { MODES } from "@/lib/constants";
import {
  buildScoringPrompt,
  parseScoringResponse,
  type TranscriptLine,
} from "@/lib/prompts/scoring";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const VALID_MODES: string[] = MODES.map((m) => m.id);

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { sessionId, mode: modeFromBody } = body as Record<string, unknown>;

  // Input validation
  if (!sessionId || typeof sessionId !== "string") {
    return NextResponse.json({ error: "Missing required field: sessionId" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Resolve mode: prefer body param, fall back to the sessions table
  let mode: string | null = typeof modeFromBody === "string" ? modeFromBody : null;
  if (!mode) {
    const { data: sessionRow } = await supabase
      .from("sessions")
      .select("mode")
      .eq("id", sessionId)
      .single();
    mode = sessionRow?.mode ?? null;
  }

  if (!mode || !VALID_MODES.includes(mode)) {
    return NextResponse.json(
      { error: `Could not determine a valid mode. Must be one of: ${VALID_MODES.join(", ")}` },
      { status: 400 },
    );
  }

  const { data: transcripts } = await supabase
    .from("transcripts")
    .select("role, content")
    .eq("session_id", sessionId)
    .order("sequence_number", { ascending: true });

  if (!transcripts || transcripts.length === 0) {
    return NextResponse.json(
      { error: "No transcript found for this session" },
      { status: 404 },
    );
  }

  // Map DB role ("user" | "tutor") to TranscriptLine role ("learner" | "tutor")
  // TranscriptLine.role is "tutor" | "learner", field is "text" not "content"
  const lines: TranscriptLine[] = transcripts.map((t) => ({
    role: t.role === "tutor" ? "tutor" : ("learner" as "tutor" | "learner"),
    text: t.content,
  }));

  const prompt = buildScoringPrompt(lines, mode as string);

  try {
    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const raw = response.text || "";
    const scores = parseScoringResponse(raw);

    // Insert all ScoreResult fields including xp and bangla_fallback_count
    await supabase.from("session_scores").insert({
      session_id: sessionId,
      fluency: scores.fluency,
      vocabulary: scores.vocabulary,
      grammar: scores.grammar,
      pronunciation: scores.pronunciation,
      overall: scores.overall,
      feedback_text: scores.feedback,
      strengths: scores.strengths,
      improvements: scores.improvements,
      suggested_next: scores.suggested_next,
      xp: scores.xp,
      bangla_fallback_count: scores.bangla_fallback_count,
    });

    return NextResponse.json(scores);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Scoring failed";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
