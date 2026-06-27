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
    const stream = await genai.models.generateContentStream({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const supabase = createServerClient();

    // Use count of existing transcripts to avoid sequence number race
    const { count } = await supabase
      .from("transcripts")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId);

    const baseSeq = (count ?? 0) + 1;

    const encoder = new TextEncoder();
    let fullText = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const chunkText = chunk.text ?? "";
            if (chunkText) {
              fullText += chunkText;
              controller.enqueue(encoder.encode(chunkText));
            }
          }

          // Save transcripts after streaming completes
          const { error: insertError } = await supabase.from("transcripts").insert([
            { session_id: sessionId, role: "user", content: message, sequence_number: baseSeq },
            { session_id: sessionId, role: "tutor", content: fullText, sequence_number: baseSeq + 1 },
          ]);

          if (insertError) {
            console.error("[chat] transcript insert failed:", insertError.message);
          }

          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[chat]", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Service unavailable" }, { status: 500 });
  }
}
