export const LANGUAGES = [
  { id: "english", name: "English", namebn: "ইংলিশ", flag: "EN" },
  { id: "german", name: "German", namebn: "জার্মান", flag: "DE" },
  { id: "arabic", name: "Arabic", namebn: "আরবি", flag: "AR" },
  { id: "hindi", name: "Hindi", namebn: "হিন্দি", flag: "IN" },
] as const;

export const MODES = [
  {
    id: "word_by_word",
    name: "Word by Word",
    namebn: "একটা একটা শব্দ",
    description: "Learn one word at a time with meaning, pronunciation, and usage",
    descriptionbn: "একটা একটা করে শব্দ শিখুন -- মানে, উচ্চারণ আর ব্যবহার সহ",
    duration: "3-5 min",
  },
  {
    id: "conversation",
    name: "Free Conversation",
    namebn: "আড্ডা",
    description: "Have a real conversation with your tutor on any topic",
    descriptionbn: "যেকোনো টপিকে আপনার টিউটরের সাথে আড্ডা দিন",
    duration: "5-10 min",
  },
  {
    id: "roleplay",
    name: "Situation Roleplay",
    namebn: "সিচুয়েশন প্র্যাকটিস",
    description: "Practice real scenarios: job interview, doctor visit, airport, shopping",
    descriptionbn: "রিয়েল লাইফ সিচুয়েশন প্র্যাকটিস করুন -- ইন্টারভিউ, ডাক্তার, এয়ারপোর্ট",
    duration: "5-7 min",
  },
  {
    id: "pronunciation",
    name: "Pronunciation Clinic",
    namebn: "উচ্চারণ ফিক্স",
    description: "Fix the sounds Bengali speakers struggle with most",
    descriptionbn: "যে সাউন্ডগুলো বাঙালিদের কঠিন লাগে, সেগুলো ঠিক করুন",
    duration: "5-7 min",
  },
  {
    id: "grammar",
    name: "Grammar in Conversation",
    namebn: "গ্রামার ইন কথাবার্তা",
    description: "Learn grammar naturally through speaking, not rules",
    descriptionbn: "কথা বলতে বলতে গ্রামার শিখুন, রুল মুখস্থ না করে",
    duration: "5-7 min",
  },
  {
    id: "listening",
    name: "Listening Challenge",
    namebn: "লিসেনিং চ্যালেঞ্জ",
    description: "Listen to a passage and answer comprehension questions",
    descriptionbn: "কিছু শুনুন আর প্রশ্নের উত্তর দিন",
    duration: "5-7 min",
  },
  {
    id: "live_translation",
    name: "Live Translation",
    namebn: "লাইভ ট্রান্সলেশন",
    description: "Speak in any language, get instant voice translation to any other language",
    descriptionbn: "যেকোনো ভাষায় বলুন, সাথে সাথে অন্য ভাষায় ট্রান্সলেশন পান",
    duration: "Unlimited",
    isUtility: true,
  },
] as const;

export const LEVELS = [
  { id: "beginner", name: "Beginner", namebn: "নতুন শুরু" },
  { id: "intermediate", name: "Intermediate", namebn: "মোটামুটি পারি" },
  { id: "advanced", name: "Advanced", namebn: "বেশ ভালো পারি" },
] as const;

export const VOICES = [
  {
    id: "priya",
    name: "Priya",
    namebn: "প্রিয়া",
    bio: "Warm and patient tutor",
    biobn: "ফ্রেন্ডলি আর পেশেন্ট টিউটর",
  },
  {
    id: "nabanita",
    name: "Nabanita",
    namebn: "নবনীতা",
    bio: "Clear and encouraging guide",
    biobn: "ক্লিয়ার আর এনকারেজিং গাইড",
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
