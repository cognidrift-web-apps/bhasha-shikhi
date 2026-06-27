"use client";

import { LANGUAGES, type Language } from "@/lib/constants";

interface Props {
  value: Language;
  onSelect: (v: Language) => void;
}

export function LanguageSelector({ value, onSelect }: Props) {
  return (
    <div>
      <h2 className="font-bengali text-2xl font-semibold text-[#1E1B4B] mb-2 text-center">
        কোন ভাষা শিখবেন?
      </h2>
      <p className="text-sm text-slate-500 mb-8 text-center tracking-[-0.03em]">Which language?</p>
      <div className="grid grid-cols-2 gap-4">
        {LANGUAGES.map((lang) => {
          const selected = value === lang.id;
          return (
            <button
              key={lang.id}
              onClick={() => onSelect(lang.id)}
              className={`min-h-[90px] rounded-3xl p-6 text-center transition-all duration-200 ${
                selected
                  ? "glass-card-selected"
                  : "glass-card glass-card-hover"
              }`}
            >
              <span className="font-semibold text-[#1E1B4B] block tracking-[-0.03em]">{lang.name}</span>
              <span className="font-bengali text-sm text-slate-500 block mt-1">
                {lang.namebn}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
