/**
 * Scoring prompt builder and response parser for February
 *
 * Analyzes full session transcripts and produces structured scores
 * across 5 dimensions plus actionable feedback.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TranscriptLine {
  role: "tutor" | "learner";
  text: string;
}

export interface ScoreResult {
  fluency: number;
  vocabulary: number;
  grammar: number;
  pronunciation: number;
  overall: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  suggested_next: string;
  xp: number;
  bangla_fallback_count: number;
}

// ---------------------------------------------------------------------------
// Default / fallback score
// ---------------------------------------------------------------------------

const FALLBACK_SCORE: ScoreResult = {
  fluency: 0,
  vocabulary: 0,
  grammar: 0,
  pronunciation: 0,
  overall: 0,
  feedback: "Unable to evaluate this session.",
  strengths: [],
  improvements: [],
  suggested_next: "conversation:beginner",
  xp: 10,
  bangla_fallback_count: 0,
};

// ---------------------------------------------------------------------------
// Scoring prompt builder
// ---------------------------------------------------------------------------

/**
 * Build the scoring/evaluation prompt for the AI to analyze a session transcript.
 */
export function buildScoringPrompt(
  transcript: TranscriptLine[],
  mode: string,
): string {
  const formattedTranscript = transcript
    .map((line) => `[${line.role.toUpperCase()}]: ${line.text}`)
    .join("\n");

  return `You are a language learning evaluator for February, a voice-first language learning platform for Bangladeshi Bengali speakers.

Analyze the following session transcript from a "${mode}" practice session and provide a detailed evaluation.

TRANSCRIPT:
${formattedTranscript}

EVALUATION CRITERIA:
Score each dimension from 0 to 100:

1. **Fluency** (0-100): How smoothly did the learner speak? Consider response time gaps, hesitation markers ("um", "uh", "err"), sentence completeness, and natural flow. A score of 100 means native-like fluency.

2. **Vocabulary** (0-100): Range and accuracy of word usage. Did they use varied vocabulary? Were words used correctly in context? Did they rely on basic words or stretch to use more advanced ones?

3. **Grammar** (0-100): Correctness of sentence structure. Count grammatical errors relative to total utterances. Common Bengali-speaker errors to watch for: missing articles, wrong prepositions, subject-verb agreement, tense errors.

4. **Pronunciation** (0-100): Estimated clarity and accuracy from transcript patterns. Look for phonetic spellings that suggest pronunciation issues, self-corrections, and tutor corrections of pronunciation.

5. **Overall** (0-100): Weighted average considering all dimensions. Weight fluency and grammar slightly higher for conversation modes, pronunciation higher for pronunciation mode.

ADDITIONAL ANALYSIS:
- **feedback**: Write 2-3 sentences of overall assessment. Be encouraging and specific. Use Bangla for warmth where appropriate.
- **strengths**: List 2-4 specific things the learner did well, with examples quoted from the transcript.
- **improvements**: List 2-4 specific errors with corrections. Format: "You said 'X' — correct: 'Y'" or "You used 'X' when 'Y' would be more natural."
- **suggested_next**: Recommend the next mode:level to practice (e.g., "conversation:intermediate", "pronunciation:beginner"). Base this on where they struggled most.
- **xp**: Award points from 10 to 100 based on overall performance. 10 = minimal effort, 50 = solid practice, 100 = exceptional.
- **bangla_fallback_count**: Count how many times the learner switched to Bangla when they should have been speaking the target language.

Respond with ONLY a valid JSON object in this exact format (no markdown, no explanation, no code fences):
{
  "fluency": <number>,
  "vocabulary": <number>,
  "grammar": <number>,
  "pronunciation": <number>,
  "overall": <number>,
  "feedback": "<string>",
  "strengths": ["<string>", ...],
  "improvements": ["<string>", ...],
  "suggested_next": "<mode>:<level>",
  "xp": <number>,
  "bangla_fallback_count": <number>
}`;
}

// ---------------------------------------------------------------------------
// Score parser
// ---------------------------------------------------------------------------

/**
 * Clamp a number to the 0-100 range.
 */
function clamp(n: unknown, min: number, max: number): number {
  const val = typeof n === "number" ? n : 0;
  return Math.max(min, Math.min(max, val));
}

/**
 * Extract JSON from a string that may contain markdown fences or prose.
 */
function extractJson(raw: string): string {
  // Try to strip ```json ... ``` fences
  const fenceMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }

  // Try to find a JSON object in the string
  const braceMatch = raw.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    return braceMatch[0].trim();
  }

  return raw.trim();
}

/**
 * Parse the scoring LLM response into a structured ScoreResult.
 * Returns a fallback score if parsing fails.
 */
export function parseScoringResponse(raw: string): ScoreResult {
  try {
    const cleaned = extractJson(raw);
    const parsed = JSON.parse(cleaned);

    return {
      fluency: clamp(parsed.fluency, 0, 100),
      vocabulary: clamp(parsed.vocabulary, 0, 100),
      grammar: clamp(parsed.grammar, 0, 100),
      pronunciation: clamp(parsed.pronunciation, 0, 100),
      overall: clamp(parsed.overall, 0, 100),
      feedback:
        typeof parsed.feedback === "string"
          ? parsed.feedback
          : FALLBACK_SCORE.feedback,
      strengths: Array.isArray(parsed.strengths)
        ? parsed.strengths.filter((s: unknown) => typeof s === "string")
        : [],
      improvements: Array.isArray(parsed.improvements)
        ? parsed.improvements.filter((s: unknown) => typeof s === "string")
        : [],
      suggested_next:
        typeof parsed.suggested_next === "string"
          ? parsed.suggested_next
          : FALLBACK_SCORE.suggested_next,
      xp: clamp(parsed.xp, 10, 100),
      bangla_fallback_count:
        typeof parsed.bangla_fallback_count === "number"
          ? Math.max(0, Math.floor(parsed.bangla_fallback_count))
          : 0,
    };
  } catch {
    return { ...FALLBACK_SCORE };
  }
}
