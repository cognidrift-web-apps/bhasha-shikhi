"use client";

import { VOICES, type VoiceType } from "@/lib/constants";

interface Props {
  value: VoiceType;
  onChange: (v: VoiceType) => void;
}

export function VoiceSelector({ value, onChange }: Props) {
  return (
    <div>
      <h2 className="font-bengali text-xl font-bold text-[#1E1B4B] mb-1">
        টিউটর বাছো
      </h2>
      <p className="text-sm text-slate-500 mb-5">Pick a tutor</p>
      <div className="flex flex-col gap-3">
        {VOICES.map((voice) => {
          const selected = value === voice.id;
          return (
            <button
              key={voice.id}
              onClick={() => onChange(voice.id)}
              className={`min-h-[72px] rounded-xl p-4 text-left transition-all ${
                selected
                  ? "border-2 border-blue-500 bg-white"
                  : "border border-slate-200 bg-white hover:-translate-y-0.5"
              }`}
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-lg font-bold">
                  {voice.name[0]}
                </div>
                <div>
                  <span className="font-semibold text-[#1E1B4B]">
                    {voice.name}{" "}
                    <span className="font-bengali font-normal text-slate-500">({voice.namebn})</span>
                  </span>
                  <span className="font-bengali block text-sm text-slate-500 mt-0.5 leading-snug">
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
