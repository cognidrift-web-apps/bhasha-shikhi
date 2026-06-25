export const LANGUAGES = [
  { id: "english", name: "English", namebn: "ইংরেজি", flag: "EN" },
  { id: "german", name: "German", namebn: "জার্মান", flag: "DE" },
  { id: "hindi", name: "Hindi", namebn: "হিন্দি", flag: "IN" },
] as const;

export const MODES = [
  {
    id: "vocabulary",
    name: "Vocabulary",
    namebn: "শব্দভান্ডার",
    description: "Learn new words and phrases through guided practice",
    descriptionbn: "নির্দেশিত অনুশীলনের মাধ্যমে নতুন শব্দ ও বাক্যাংশ শিখুন",
    duration: "5-7 min",
  },
  {
    id: "grammar",
    name: "Grammar",
    namebn: "ব্যাকরণ",
    description: "Learn grammar rules through examples and exercises",
    descriptionbn: "উদাহরণ ও অনুশীলনের মাধ্যমে ব্যাকরণ শিখুন",
    duration: "5-7 min",
  },
  {
    id: "conversation",
    name: "Conversation",
    namebn: "কথোপকথন",
    description: "Practice speaking through guided dialogues and role-play",
    descriptionbn: "কথোপকথন ও ভূমিকা অভিনয়ের মাধ্যমে কথা বলা অনুশীলন করুন",
    duration: "5-10 min",
  },
  {
    id: "pronunciation",
    name: "Pronunciation",
    namebn: "উচ্চারণ",
    description: "Improve your accent and pronunciation with focused drills",
    descriptionbn: "কেন্দ্রীভূত অনুশীলনে আপনার উচ্চারণ উন্নত করুন",
    duration: "5-7 min",
  },
  {
    id: "listening",
    name: "Listening",
    namebn: "শ্রবণ",
    description: "Build comprehension by listening and answering questions",
    descriptionbn: "শুনে এবং প্রশ্নের উত্তর দিয়ে বোধগম্যতা তৈরি করুন",
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
