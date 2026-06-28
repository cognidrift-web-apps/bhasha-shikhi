import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const SYSTEM_PROMPT =
  "Transliterate or translate the following text into Bengali script (বাংলা). Return ONLY the Bengali text, nothing else. Use everyday Bangladeshi Bangla, not formal or literary Bengali. If the text is already in Bengali script, return it as-is.";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ translated: null }, { status: 400 });
  }

  const { text } = body as { text?: string };

  if (!text || typeof text !== "string" || text.trim() === "") {
    return NextResponse.json({ translated: null }, { status: 400 });
  }

  try {
    const response = await genai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ role: "user", parts: [{ text }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    });

    const translated = response.text?.trim() || null;
    return NextResponse.json({ translated });
  } catch (error) {
    console.error("[translate]", error instanceof Error ? error.message : error);
    return NextResponse.json({ translated: null }, { status: 500 });
  }
}
