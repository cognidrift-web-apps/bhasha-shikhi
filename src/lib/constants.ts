export const LANGUAGES = [
  { id: "english", name: "English", namebn: "ইংলিশ", flag: "EN" },
  { id: "german", name: "German", namebn: "জার্মান", flag: "DE" },
  { id: "hindi", name: "Hindi", namebn: "হিন্দি", flag: "IN" },
] as const;

export const MODES = [
  {
    id: "word_by_word",
    name: "Word by Word",
    namebn: "একটা একটা শব্দ",
    description: "Learn one word at a time with meaning, pronunciation, and usage",
    descriptionbn: "একটা একটা করে শব্দ শিখুন, মানে, উচ্চারণ আর ব্যবহার সহ",
    duration: "3-5 min",
  },
  {
    id: "conversation",
    name: "Free Conversation",
    namebn: "আড্ডা",
    description: "Have a real conversation with your tutor on any topic",
    descriptionbn: "যেকোনো বিষয়ে আপনার টিউটরের সাথে কথা বলুন",
    duration: "5-10 min",
  },
  {
    id: "roleplay",
    name: "Situation Roleplay",
    namebn: "পরিস্থিতি অভিনয়",
    description: "Practice real scenarios: job interview, doctor visit, airport, shopping",
    descriptionbn: "আসল পরিস্থিতি প্র্যাকটিস করুন: ইন্টারভিউ, ডাক্তার, এয়ারপোর্ট",
    duration: "5-7 min",
  },
  {
    id: "pronunciation",
    name: "Pronunciation Clinic",
    namebn: "উচ্চারণ প্র্যাকটিস",
    description: "Fix the sounds Bengali speakers struggle with most",
    descriptionbn: "বাংলাভাষীদের কঠিন উচ্চারণগুলো ঠিক করুন",
    duration: "5-7 min",
  },
  {
    id: "grammar",
    name: "Grammar in Conversation",
    namebn: "কথায় কথায় গ্রামার",
    description: "Learn grammar naturally through speaking, not rules",
    descriptionbn: "কথা বলতে বলতে গ্রামার শিখুন, রুল মুখস্থ না করে",
    duration: "5-7 min",
  },
  {
    id: "listening",
    name: "Listening Challenge",
    namebn: "শোনার চ্যালেঞ্জ",
    description: "Listen to a passage and answer comprehension questions",
    descriptionbn: "একটা কিছু শুনুন আর প্রশ্নের উত্তর দিন",
    duration: "5-7 min",
  },
] as const;

export const LEVELS = [
  { id: "beginner", name: "Beginner", namebn: "একদম নতুন" },
  { id: "intermediate", name: "Intermediate", namebn: "মোটামুটি জানি" },
  { id: "advanced", name: "Advanced", namebn: "ভালো জানি" },
] as const;

export const VOICES = [
  {
    id: "gemini",
    name: "Priya",
    namebn: "প্রিয়া",
    bio: "Warm and patient tutor",
    biobn: "মায়াবী আর ধৈর্যশীল টিউটর",
  },
  {
    id: "microsoft",
    name: "Nabanita",
    namebn: "নবনীতা",
    bio: "Clear and encouraging guide",
    biobn: "পরিষ্কার আর উৎসাহী গাইড",
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
