import { describe, it, expect } from "vitest";
import {
  buildScoringPrompt,
  parseScoringResponse,
  type TranscriptLine,
  type ScoreResult,
} from "@/lib/prompts/scoring";

// ---------------------------------------------------------------------------
// Sample transcript for testing
// ---------------------------------------------------------------------------

const SAMPLE_TRANSCRIPT: TranscriptLine[] = [
  { role: "tutor", text: "Hello! How are you today?" },
  { role: "learner", text: "I am good, thank you." },
  { role: "tutor", text: "Great! What did you do yesterday?" },
  { role: "learner", text: "I am go to market." },
  {
    role: "tutor",
    text: "Almost! You should say 'I went to the market.' Try again.",
  },
  { role: "learner", text: "I went to the market." },
];

// ---------------------------------------------------------------------------
// buildScoringPrompt
// ---------------------------------------------------------------------------

describe("buildScoringPrompt", () => {
  it("includes all 5 scoring dimensions", () => {
    const prompt = buildScoringPrompt(SAMPLE_TRANSCRIPT, "conversation");
    expect(prompt).toContain("Fluency");
    expect(prompt).toContain("Vocabulary");
    expect(prompt).toContain("Grammar");
    expect(prompt).toContain("Pronunciation");
    expect(prompt).toContain("Overall");
  });

  it("includes the formatted transcript", () => {
    const prompt = buildScoringPrompt(SAMPLE_TRANSCRIPT, "conversation");
    expect(prompt).toContain("[TUTOR]: Hello! How are you today?");
    expect(prompt).toContain("[LEARNER]: I am good, thank you.");
  });

  it("includes the mode name", () => {
    const prompt = buildScoringPrompt(SAMPLE_TRANSCRIPT, "pronunciation");
    expect(prompt).toContain("pronunciation");
  });

  it("asks for feedback, strengths, and improvements", () => {
    const prompt = buildScoringPrompt(SAMPLE_TRANSCRIPT, "conversation");
    expect(prompt).toContain("feedback");
    expect(prompt).toContain("strengths");
    expect(prompt).toContain("improvements");
  });

  it("asks for suggested_next", () => {
    const prompt = buildScoringPrompt(SAMPLE_TRANSCRIPT, "conversation");
    expect(prompt).toContain("suggested_next");
  });

  it("asks for xp", () => {
    const prompt = buildScoringPrompt(SAMPLE_TRANSCRIPT, "conversation");
    expect(prompt).toContain("xp");
  });

  it("asks for bangla_fallback_count", () => {
    const prompt = buildScoringPrompt(SAMPLE_TRANSCRIPT, "conversation");
    expect(prompt).toContain("bangla_fallback_count");
  });

  it("asks for JSON output format", () => {
    const prompt = buildScoringPrompt(SAMPLE_TRANSCRIPT, "conversation");
    expect(prompt.toLowerCase()).toContain("json");
  });

  it("handles empty transcript", () => {
    const prompt = buildScoringPrompt([], "conversation");
    expect(prompt).toContain("TRANSCRIPT:");
    // Should still be a valid prompt
    expect(prompt).toContain("Fluency");
  });
});

// ---------------------------------------------------------------------------
// parseScoringResponse
// ---------------------------------------------------------------------------

describe("parseScoringResponse", () => {
  const VALID_JSON: ScoreResult = {
    fluency: 72,
    vocabulary: 65,
    grammar: 58,
    pronunciation: 70,
    overall: 66,
    feedback:
      "Bhalo try korchen! Apnar fluency emonki intermediate level-e pouchchhe. Grammar-e ektu focus dile aro beshi improve hobe.",
    strengths: [
      "Good use of past tense: 'I went to the market'",
      "Natural greeting response",
    ],
    improvements: [
      "You said 'I am go' — correct: 'I went' (past tense)",
      "Remember to use articles: 'the market' not 'market'",
    ],
    suggested_next: "grammar:beginner",
    xp: 55,
    bangla_fallback_count: 2,
  };

  it("parses valid JSON correctly", () => {
    const raw = JSON.stringify(VALID_JSON);
    const result = parseScoringResponse(raw);

    expect(result.fluency).toBe(72);
    expect(result.vocabulary).toBe(65);
    expect(result.grammar).toBe(58);
    expect(result.pronunciation).toBe(70);
    expect(result.overall).toBe(66);
    expect(result.feedback).toContain("Bhalo try korchen");
    expect(result.strengths).toHaveLength(2);
    expect(result.improvements).toHaveLength(2);
    expect(result.suggested_next).toBe("grammar:beginner");
    expect(result.xp).toBe(55);
    expect(result.bangla_fallback_count).toBe(2);
  });

  it("parses JSON wrapped in markdown code fences", () => {
    const raw = "```json\n" + JSON.stringify(VALID_JSON) + "\n```";
    const result = parseScoringResponse(raw);

    expect(result.fluency).toBe(72);
    expect(result.overall).toBe(66);
    expect(result.strengths).toHaveLength(2);
    expect(result.xp).toBe(55);
  });

  it("parses JSON wrapped in plain code fences", () => {
    const raw = "```\n" + JSON.stringify(VALID_JSON) + "\n```";
    const result = parseScoringResponse(raw);

    expect(result.fluency).toBe(72);
    expect(result.feedback).toContain("Bhalo try korchen");
  });

  it("parses JSON embedded in prose", () => {
    const raw =
      "Here is the evaluation:\n\n" +
      JSON.stringify(VALID_JSON) +
      "\n\nI hope this helps!";
    const result = parseScoringResponse(raw);

    expect(result.fluency).toBe(72);
    expect(result.overall).toBe(66);
  });

  it("returns fallback on garbage input", () => {
    const result = parseScoringResponse("this is not json at all");

    expect(result.fluency).toBe(0);
    expect(result.vocabulary).toBe(0);
    expect(result.grammar).toBe(0);
    expect(result.pronunciation).toBe(0);
    expect(result.overall).toBe(0);
    expect(result.feedback).toBe("Unable to evaluate this session.");
    expect(result.strengths).toEqual([]);
    expect(result.improvements).toEqual([]);
    expect(result.xp).toBe(10);
    expect(result.bangla_fallback_count).toBe(0);
  });

  it("returns fallback on empty string", () => {
    const result = parseScoringResponse("");

    expect(result.fluency).toBe(0);
    expect(result.overall).toBe(0);
    expect(result.feedback).toBe("Unable to evaluate this session.");
  });

  it("clamps scores to 0-100 range", () => {
    const outOfRange = {
      ...VALID_JSON,
      fluency: 150,
      vocabulary: -20,
      overall: 200,
    };
    const result = parseScoringResponse(JSON.stringify(outOfRange));

    expect(result.fluency).toBe(100);
    expect(result.vocabulary).toBe(0);
    expect(result.overall).toBe(100);
  });

  it("clamps xp to 10-100 range", () => {
    const lowXp = { ...VALID_JSON, xp: 3 };
    const highXp = { ...VALID_JSON, xp: 500 };

    expect(parseScoringResponse(JSON.stringify(lowXp)).xp).toBe(10);
    expect(parseScoringResponse(JSON.stringify(highXp)).xp).toBe(100);
  });

  it("handles missing fields gracefully", () => {
    const partial = { fluency: 50, overall: 45 };
    const result = parseScoringResponse(JSON.stringify(partial));

    expect(result.fluency).toBe(50);
    expect(result.overall).toBe(45);
    expect(result.vocabulary).toBe(0); // missing → clamped default
    expect(result.feedback).toBe("Unable to evaluate this session.");
    expect(result.strengths).toEqual([]);
    expect(result.improvements).toEqual([]);
    expect(result.suggested_next).toBe("conversation:beginner");
    expect(result.xp).toBe(10); // missing → clamped min
  });

  it("filters non-string items from strengths/improvements arrays", () => {
    const withBadArray = {
      ...VALID_JSON,
      strengths: ["good job", 123, null, "nice work"],
      improvements: [true, "fix grammar"],
    };
    const result = parseScoringResponse(JSON.stringify(withBadArray));

    expect(result.strengths).toEqual(["good job", "nice work"]);
    expect(result.improvements).toEqual(["fix grammar"]);
  });
});
