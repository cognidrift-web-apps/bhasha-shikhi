"use client";

import { VOICES, type VoiceType } from "@/lib/constants";

interface Props {
  value: VoiceType;
  onChange: (v: VoiceType) => void;
}

export function VoiceSelector({ value, onChange }: Props) {
  return (
    <div>
      <h2 className="text-base font-semibold text-stone-800 mb-3">
        কোন টিউটর চান?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {VOICES.map((voice) => (
          <button
            key={voice.id}
            onClick={() => onChange(voice.id)}
            className={`min-h-[44px] rounded-lg border-2 p-4 text-left transition-all ${
              value === voice.id
                ? "border-brand-500 bg-brand-50 shadow-sm"
                : "border-stone-200 bg-white hover:border-brand-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-lg">
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
        ))}
      </div>
    </div>
  );
}
