"use client";

import { VOICES, type VoiceType } from "@/lib/constants";

interface Props {
  value: VoiceType;
  onChange: (v: VoiceType) => void;
}

export function VoiceSelector({ value, onChange }: Props) {
  return (
    <div>
      <h2 className="font-bengali text-lg font-semibold text-stone-900">
        টিউটর বাছো
      </h2>
      <p className="text-sm text-stone-400 mt-0.5 mb-3">Pick a tutor</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {VOICES.map((voice) => {
          const selected = value === voice.id;
          return (
            <button
              key={voice.id}
              onClick={() => onChange(voice.id)}
              className={`min-h-[44px] rounded-xl p-4 text-left transition-all ${
                selected
                  ? "border-2 border-primary-500 bg-primary-50 shadow-sm"
                  : "border border-stone-200 bg-white hover:border-primary-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                    selected
                      ? "bg-gradient-to-br from-primary-500 to-accent-500 text-white"
                      : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {voice.name[0]}
                </div>
                <div>
                  <span className="font-semibold text-stone-800">
                    {voice.name}{" "}
                    <span className="font-bengali font-normal text-stone-500">({voice.namebn})</span>
                  </span>
                  <span className="font-bengali block text-sm text-stone-500 mt-0.5 leading-snug">
                    {voice.biobn}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
