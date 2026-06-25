export const LANGUAGES = [
  { id: "english", name: "English", namebn: "ইংরেজি", flag: "EN" },
  { id: "german", name: "German", namebn: "জার্মান", flag: "DE" },
  { id: "hindi", name: "Hindi", namebn: "হিন্দি", flag: "IN" },
] as const;

export const MODES = [
  {
    id: "speaking_part1",
    name: "Speaking Part 1",
    namebn: "স্পিকিং পার্ট ১",
    description: "Introduction and interview questions",
    descriptionbn: "পরিচিতি এবং সাক্ষাৎকার প্রশ্ন",
    duration: "4-5 min",
  },
  {
    id: "speaking_part2",
    name: "Speaking Part 2",
    namebn: "স্পিকিং পার্ট ২",
    description: "Long turn with cue card",
    descriptionbn: "কিউ কার্ড সহ দীর্ঘ বক্তব্য",
    duration: "3-4 min",
  },
  {
    id: "speaking_part3",
    name: "Speaking Part 3",
    namebn: "স্পিকিং পার্ট ৩",
    description: "In-depth discussion",
    descriptionbn: "গভীর আলোচনা",
    duration: "4-5 min",
  },
  {
    id: "listening",
    name: "Listening Practice",
    namebn: "শ্রবণ অনুশীলন",
    description: "Comprehension exercises",
    descriptionbn: "বোধগম্যতা অনুশীলন",
    duration: "5-7 min",
  },
] as const;

export const LEVELS = [
  { id: "beginner", name: "Beginner", namebn: "প্রাথমিক" },
  { id: "intermediate", name: "Intermediate", namebn: "মধ্যবর্তী" },
  { id: "advanced", name: "Advanced", namebn: "উন্নত" },
] as const;

export const VOICES = [
  {
    id: "gemini",
    name: "Priya",
    namebn: "প্রিয়া",
    bio: "Warm and patient tutor",
    biobn: "উষ্ণ এবং ধৈর্যশীল শিক্ষক",
  },
  {
    id: "microsoft",
    name: "Nabanita",
    namebn: "নবনীতা",
    bio: "Clear and encouraging guide",
    biobn: "স্পষ্ট এবং উৎসাহজনক গাইড",
  },
] as const;

export type Language = (typeof LANGUAGES)[number]["id"];
export type Mode = (typeof MODES)[number]["id"];
export type Level = (typeof LEVELS)[number]["id"];
export type VoiceType = (typeof VOICES)[number]["id"];

export interface SessionConfig {
  language: Language;
  mode: Mode;
  level: Level;
  voice: VoiceType;
}
