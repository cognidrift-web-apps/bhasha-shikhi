"use client";

import { type ReactElement } from "react";
import {
  SquaresFour,
  Microphone,
  GlobeHemisphereWest,
  Crosshair,
  LockOpen,
} from "@phosphor-icons/react";

interface Feature {
  title: string;
  titlebn: string;
  description: string;
  icon: ReactElement;
}

const FEATURES: Feature[] = [
  {
    title: "7 Ways to Practice",
    titlebn: "৭ রকম প্র্যাকটিস",
    description:
      "Word by Word, Free Conversation, Situation Roleplay, Pronunciation Clinic, Grammar in Conversation, Listening Challenge, and Live Translation.",
    icon: <SquaresFour size={22} weight="duotone" />,
  },
  {
    title: "Talk, Don't Type",
    titlebn: "টাইপ না, কথা বলো",
    description:
      "Voice-first learning. Your AI tutor Priya listens and responds naturally. No multiple choice, no typing. Just real conversation.",
    icon: <Microphone size={22} weight="duotone" />,
  },
  {
    title: "4 Languages",
    titlebn: "৪টা ভাষা",
    description:
      "English for jobs and IELTS, German for nursing and university, Arabic for the Gulf and Islamic study, Hindi for Bollywood and casual life.",
    icon: <GlobeHemisphereWest size={22} weight="duotone" />,
  },
  {
    title: "Bangla Interference Detector",
    titlebn: "বাংলা ভুল ধরি",
    description:
      'Understands why you make mistakes because of Bangla. Catches "bhery" instead of "very", missing articles, and wrong prepositions.',
    icon: <Crosshair size={22} weight="duotone" />,
  },
  {
    title: "No Account Needed",
    titlebn: "একাউন্ট লাগবে না",
    description:
      "Just open and start talking. Your progress saves automatically so you can pick up right where you left off.",
    icon: <LockOpen size={22} weight="duotone" />,
  },
];

export function Features() {
  return (
    <section className="bg-page-mesh py-20 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl bg-white/50 backdrop-blur-xl border border-white/40 shadow-lg shadow-indigo-500/10 p-6 transition-all duration-300 hover:bg-white/70 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/15"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50/80 backdrop-blur-sm text-primary-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="font-bengali text-lg font-bold text-[#1E1B4B]">
                {feature.titlebn}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5 mb-2">{feature.title}</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
