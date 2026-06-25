import { describe, it, expect } from "vitest";
import { buildTutorPrompt } from "@/lib/prompts/tutor";
import type { Language, Mode, Level } from "@/lib/constants";

const LANGUAGES: Language[] = ["english", "german", "hindi"];
const MODES: Mode[] = [
  "word_by_word",
  "conversation",
  "roleplay",
  "pronunciation",
  "grammar",
  "listening",
];
const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];

describe("buildTutorPrompt", () => {
  // -----------------------------------------------------------------------
  // Every combination produces a non-empty prompt
  // -----------------------------------------------------------------------
  describe("generates prompts for all language × mode × level combos", () => {
    for (const lang of LANGUAGES) {
      for (const mode of MODES) {
        for (const level of LEVELS) {
          it(`${lang} / ${mode} / ${level}`, () => {
            const prompt = buildTutorPrompt(lang, mode, level);
            expect(prompt).toBeTruthy();
            expect(prompt.length).toBeGreaterThan(200);
          });
        }
      }
    }
  });

  // -----------------------------------------------------------------------
  // Base persona requirements are in ALL prompts
  // -----------------------------------------------------------------------
  describe("base persona requirements", () => {
    for (const lang of LANGUAGES) {
      for (const mode of MODES) {
        it(`includes name extraction instruction (${lang}/${mode})`, () => {
          const prompt = buildTutorPrompt(lang, mode, "beginner");
          expect(prompt).toContain("Priya");
          expect(prompt).toContain("Apnar nam");
        });

        it(`includes code-switch detection (${lang}/${mode})`, () => {
          const prompt = buildTutorPrompt(lang, mode, "beginner");
          expect(prompt.toLowerCase()).toContain("code-switch");
        });

        it(`includes encouraging tone directive (${lang}/${mode})`, () => {
          const prompt = buildTutorPrompt(lang, mode, "beginner");
          expect(prompt.toLowerCase()).toContain("encouraging");
        });

        it(`includes voice conversation framing (${lang}/${mode})`, () => {
          const prompt = buildTutorPrompt(lang, mode, "beginner");
          expect(prompt.toLowerCase()).toContain("voice conversation");
        });
      }
    }
  });

  // -----------------------------------------------------------------------
  // Mode-specific keywords
  // -----------------------------------------------------------------------
  describe("word_by_word mode", () => {
    it("mentions word count target", () => {
      const prompt = buildTutorPrompt("english", "word_by_word", "beginner");
      expect(prompt).toContain("5-6");
    });

    it("mentions repetition/review", () => {
      const prompt = buildTutorPrompt("english", "word_by_word", "beginner");
      expect(prompt.toLowerCase()).toContain("review");
    });
  });

  describe("conversation mode", () => {
    it("mentions code-switch coaching as key differentiator", () => {
      const prompt = buildTutorPrompt("english", "conversation", "beginner");
      expect(prompt).toContain("CODE-SWITCH COACHING");
      expect(prompt).toContain("KEY DIFFERENTIATOR");
    });

    for (const level of LEVELS) {
      it(`has code-switch coaching at ${level} level`, () => {
        const prompt = buildTutorPrompt("english", "conversation", level);
        expect(prompt).toContain("CODE-SWITCH COACHING");
      });
    }
  });

  describe("roleplay mode", () => {
    it("includes relevant scenario list", () => {
      const prompt = buildTutorPrompt("english", "roleplay", "intermediate");
      expect(prompt.toLowerCase()).toContain("job interview");
      expect(prompt.toLowerCase()).toContain("doctor");
      expect(prompt.toLowerCase()).toContain("airport");
    });

    it("mentions the tutor plays the other person", () => {
      const prompt = buildTutorPrompt("english", "roleplay", "beginner");
      expect(prompt).toContain("YOU play");
    });
  });

  describe("pronunciation mode", () => {
    it("mentions /v/ vs /bh/ for English", () => {
      const prompt = buildTutorPrompt("english", "pronunciation", "beginner");
      expect(prompt).toContain("/v/");
      expect(prompt).toContain("/bh/");
    });

    it('mentions "very" vs "bhery" for English', () => {
      const prompt = buildTutorPrompt("english", "pronunciation", "beginner");
      expect(prompt).toContain("bhery");
      expect(prompt).toContain("very");
    });

    it("mentions /z/ vs /dʒ/ for English", () => {
      const prompt = buildTutorPrompt("english", "pronunciation", "beginner");
      expect(prompt).toContain("/z/");
      expect(prompt).toContain("/dʒ/");
    });

    it("mentions consonant clusters for English", () => {
      const prompt = buildTutorPrompt("english", "pronunciation", "intermediate");
      expect(prompt.toLowerCase()).toContain("consonant cluster");
    });

    it("mentions word stress for English", () => {
      const prompt = buildTutorPrompt("english", "pronunciation", "beginner");
      expect(prompt.toLowerCase()).toContain("stress");
    });

    it("mentions th-sounds for English", () => {
      const prompt = buildTutorPrompt("english", "pronunciation", "beginner");
      expect(prompt).toContain("th");
    });

    it("mentions ü/ö umlauts for German", () => {
      const prompt = buildTutorPrompt("german", "pronunciation", "beginner");
      expect(prompt).toContain("ü");
      expect(prompt).toContain("ö");
    });

    it("mentions ch-laut for German", () => {
      const prompt = buildTutorPrompt("german", "pronunciation", "beginner");
      expect(prompt).toContain("ch-laut");
    });

    it("mentions uvular /r/ for German", () => {
      const prompt = buildTutorPrompt("german", "pronunciation", "beginner");
      expect(prompt).toContain("Uvular /r/");
    });

    it("mentions retroflex consonants for Hindi", () => {
      const prompt = buildTutorPrompt("hindi", "pronunciation", "beginner");
      expect(prompt.toLowerCase()).toContain("retroflex");
    });

    it("mentions aspirated vs unaspirated stops for Hindi", () => {
      const prompt = buildTutorPrompt("hindi", "pronunciation", "beginner");
      expect(prompt.toLowerCase()).toContain("aspirated");
      expect(prompt.toLowerCase()).toContain("unaspirated");
    });
  });

  describe("grammar mode", () => {
    it("mentions articles for English", () => {
      const prompt = buildTutorPrompt("english", "grammar", "beginner");
      expect(prompt.toLowerCase()).toContain("article");
    });

    it("mentions prepositions for English", () => {
      const prompt = buildTutorPrompt("english", "grammar", "beginner");
      expect(prompt.toLowerCase()).toContain("preposition");
    });

    it("mentions grammatical gender for Hindi", () => {
      const prompt = buildTutorPrompt("hindi", "grammar", "beginner");
      expect(prompt.toLowerCase()).toContain("grammatical gender");
    });

    it("mentions case system for German", () => {
      const prompt = buildTutorPrompt("german", "grammar", "beginner");
      expect(prompt.toLowerCase()).toContain("case");
    });

    it("mentions word order for German", () => {
      const prompt = buildTutorPrompt("german", "grammar", "beginner");
      expect(prompt.toLowerCase()).toContain("word order");
    });

    it("teaches grammar through conversation, not rules", () => {
      const prompt = buildTutorPrompt("english", "grammar", "beginner");
      expect(prompt).toContain("THROUGH conversation");
    });
  });

  describe("listening mode", () => {
    it("mentions reading a passage/telling a story", () => {
      const prompt = buildTutorPrompt("english", "listening", "beginner");
      const lower = prompt.toLowerCase();
      expect(lower).toMatch(/passage|story/);
    });

    it("mentions comprehension questions", () => {
      const prompt = buildTutorPrompt("english", "listening", "beginner");
      expect(prompt.toLowerCase()).toContain("comprehension");
    });

    it("increases speed with level", () => {
      const beginner = buildTutorPrompt("english", "listening", "beginner");
      const advanced = buildTutorPrompt("english", "listening", "advanced");
      expect(beginner.toLowerCase()).toContain("slowly");
      expect(advanced.toLowerCase()).toContain("natural speed");
    });
  });

  // -----------------------------------------------------------------------
  // Bengali language style
  // -----------------------------------------------------------------------
  describe("uses Bangladeshi Bangla style", () => {
    it("uses casual Bangla, not formal literary Bengali", () => {
      const prompt = buildTutorPrompt("english", "word_by_word", "beginner");
      // Should contain casual Dhaka-style Bangla
      expect(prompt).toContain("শুনুন");
      // The base persona mentions this rule
      expect(prompt).toContain("Dhaka-style");
    });
  });

  // -----------------------------------------------------------------------
  // Level-appropriate Bangla usage
  // -----------------------------------------------------------------------
  describe("Bangla usage varies by level", () => {
    it("beginner uses mostly Bangla", () => {
      const prompt = buildTutorPrompt("english", "conversation", "beginner");
      expect(prompt.toLowerCase()).toMatch(/bangla|বাংলা/);
    });

    it("advanced uses mostly target language", () => {
      const prompt = buildTutorPrompt("english", "conversation", "advanced");
      expect(prompt.toLowerCase()).toContain("bangla only");
    });
  });
});
