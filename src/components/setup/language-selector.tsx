"use client";

import { LANGUAGES, type Language } from "@/lib/constants";

interface Props {
  value: Language;
  onSelect: (v: Language) => void;
}

export function LanguageSelector({ value, onSelect }: Props) {
  return (
    <div>
      <h2 className="font-bengali text-xl font-bold text-[#1E1B4B] mb-1">
        কোন ভাষা শিখবে?
      </h2>
      <p className="text-sm text-slate-500 mb-5">Which language?</p>
      <div className="grid grid-cols-2 gap-3">
        {LANGUAGES.map((lang) => {
          const selected = value === lang.id;
          return (
            <button
              key={lang.id}
              onClick={() => onSelect(lang.id)}
              className={`min-h-[80px] rounded-2xl p-4 text-left transition-all duration-300 ${
                selected
                  ? "bg-white/60 backdrop-blur-xl border-2 border-primary-400 shadow-lg shadow-primary-500/15"
                  : "bg-white/40 backdrop-blur-lg border border-white/50 shadow-md shadow-indigo-500/5 hover:bg-white/60 hover:-translate-y-0.5"
              }`}
            >
              <span className="block text-xs font-bold text-slate-400 mb-1">{lang.flag}</span>
              <span className="font-semibold text-[#1E1B4B] text-sm">{lang.name}</span>
              <span className="font-bengali block text-sm text-slate-500 mt-0.5">
                {lang.namebn}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
