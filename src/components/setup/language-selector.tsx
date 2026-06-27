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
              className={`min-h-[80px] rounded-xl p-4 text-left transition-all ${
                selected
                  ? "border-2 border-blue-500 bg-white"
                  : "border border-slate-200 bg-white hover:-translate-y-0.5"
              }`}
              style={{
                boxShadow: selected
                  ? "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(59,130,246,0.08)"
                  : "var(--shadow-card)",
              }}
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
