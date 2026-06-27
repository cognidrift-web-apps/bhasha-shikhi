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
              className={`min-h-[72px] rounded-2xl p-4 text-left transition-all duration-300 ${
                selected
                  ? "bg-white/60 backdrop-blur-xl border-2 border-primary-400 shadow-lg shadow-primary-500/15"
                  : "bg-white/40 backdrop-blur-lg border border-white/50 shadow-md shadow-indigo-500/5 hover:bg-white/60 hover:-translate-y-0.5"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100/70 backdrop-blur-sm text-blue-600 text-lg font-bold">
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
