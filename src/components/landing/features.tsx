const FEATURES = [
  {
    title: "7 Ways to Practice",
    titlebn: "৭ রকমে প্র্যাকটিস",
    description:
      "Word by Word like Duolingo, Free Conversation, Situation Roleplay, Pronunciation Clinic, Grammar in Conversation, Listening Challenge, and Live Translation.",
  },
  {
    title: "Talk, Don't Type",
    titlebn: "টাইপ না, কথা বলুন",
    description:
      "Voice-first learning. Your AI tutor Priya listens and responds naturally. No multiple choice, no typing. Just real conversation.",
  },
  {
    title: "4 Languages",
    titlebn: "৪টা ভাষা",
    description:
      "English for jobs and IELTS, German for nursing and university, Arabic for the Gulf and Islamic study, Hindi for Bollywood and casual life.",
  },
  {
    title: "Bangla Interference Detector",
    titlebn: "বাংলা ভুল ধরি",
    description:
      "Understands why you make mistakes because of Bangla. Catches \"bhery\" instead of \"very\", missing articles, and wrong prepositions before they become habits.",
  },
  {
    title: "No Account Needed",
    titlebn: "একাউন্ট লাগবে না",
    description:
      "Just open and start talking. Your progress saves automatically so you can pick up right where you left off.",
  },
] as const;

export function Features() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-20">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-lg border border-surface-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-base font-semibold text-stone-900">{f.title}</h3>
            <p className="font-bengali mt-1 text-sm font-medium text-accent-500">
              {f.titlebn}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              {f.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
