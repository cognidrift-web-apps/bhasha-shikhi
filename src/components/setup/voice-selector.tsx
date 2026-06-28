"use client";

import { VOICES, type VoiceType } from "@/lib/constants";

interface Props {
  value: VoiceType;
  onChange: (v: VoiceType) => void;
}

export function VoiceSelector({ value, onChange }: Props) {
  return (
    <div>
      <h2 className="font-bengali text-2xl font-semibold text-[#1E1B4B] mb-2 text-center">
        আপনার টিউটর
      </h2>
      <p className="text-sm text-slate-500 mb-8 text-center tracking-[-0.03em]">Pick a tutor</p>
      <div className="flex flex-col gap-4">
        {VOICES.map((voice) => {
          const selected = value === voice.id;
          return (
            <button
              key={voice.id}
              onClick={() => onChange(voice.id)}
              className={`min-h-[80px] rounded-3xl p-6 text-center transition-all duration-200 ${
                selected
                  ? "glass-card-selected"
                  : "glass-card glass-card-hover"
              }`}
            >
              <span className="font-medium text-[#1E1B4B] block tracking-[-0.03em]">
                {voice.name}{" "}
                <span className="font-bengali font-normal text-slate-500">({voice.namebn})</span>
              </span>
              <span className="font-bengali text-sm text-slate-500 block mt-1.5 leading-snug">
                {voice.biobn}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
