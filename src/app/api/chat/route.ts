import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createServerClient } from "@/lib/supabase/server";
import { buildTutorPrompt } from "@/lib/prompts/tutor";
import { LANGUAGES, MODES, LEVELS } from "@/lib/constants";
import type { Language, Mode, Level } from "@/lib/constants";

const VALID_LANGUAGES: string[] = LANGUAGES.map((l) => l.id);
const VALID_MODES: string[] = MODES.map((m) => m.id);
const VALID_LEVELS: string[] = LEVELS.map((l) => l.id);

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    sessionId,
    message,
    history,
    language,
    mode,
    level,
  } = body as {
    sessionId?: string;
    message?: string;
    history?: Array<{ role: string; content: string }>;
    language?: Language;
    mode?: Mode;
    level?: Level;
  };

  // Input validation
  if (!sessionId || typeof sessionId !== "string") {
    return NextResponse.json({ error: "Missing required field: sessionId" }, { status: 400 });
  }
  if (!message || typeof message !== "string" || message.trim() === "") {
    return NextResponse.json({ error: "Missing required field: message" }, { status: 400 });
  }
  if (!language || !VALID_LANGUAGES.includes(language)) {
    return NextResponse.json(
      { error: `Invalid language. Must be one of: ${VALID_LANGUAGES.join(", ")}` },
      { status: 400 },
    );
  }
  if (!mode || !VALID_MODES.includes(mode)) {
    return NextResponse.json(
      { error: `Invalid mode. Must be one of: ${VALID_MODES.join(", ")}` },
      { status: 400 },
    );
  }
  if (!level || !VALID_LEVELS.includes(level)) {
    return NextResponse.json(
      { error: `Invalid level. Must be one of: ${VALID_LEVELS.join(", ")}` },
      { status: 400 },
    );
  }

  // Default history to empty array to avoid map errors
  const safeHistory = Array.isArray(history) ? history : [];

  const systemPrompt = buildTutorPrompt(language, mode, level);

  const contents = safeHistory.map((h) => ({
    role: h.role === "user" ? ("user" as const) : ("model" as const),
    parts: [{ text: h.content }],
  }));

  contents.push({ role: "user", parts: [{ text: message }] });

  try {
    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const text = response.text || "";

    const supabase = createServerClient();

    const { data: maxSeq } = await supabase
      .from("transcripts")
      .select("sequence_number")
      .eq("session_id", sessionId)
      .order("sequence_number", { ascending: false })
      .limit(1)
      .single();

    const nextSeq = (maxSeq?.sequence_number || 0) + 1;

    await supabase.from("transcripts").insert([
      { session_id: sessionId, role: "user", content: message, sequence_number: nextSeq },
      { session_id: sessionId, role: "tutor", content: text, sequence_number: nextSeq + 1 },
    ]);

    return NextResponse.json({ response: text });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
