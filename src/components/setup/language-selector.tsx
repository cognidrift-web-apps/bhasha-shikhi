"use client";

import { LANGUAGES, type Language } from "@/lib/constants";

interface Props {
  value: Language;
  onSelect: (v: Language) => void;
}

const LANG_BADGE_COLORS: Record<string, string> = {
  english: "bg-blue-500",
  german: "bg-emerald-500",
  arabic: "bg-amber-500",
  hindi: "bg-violet-500",
};

export function LanguageSelector({ value, onSelect }: Props) {
  return (
    <div>
      <h2 className="font-bengali text-xl font-bold text-[#1E1B4B] mb-1">
        কোন ভাষা শিখবেন?
      </h2>
      <p className="text-sm text-slate-500 mb-5">Which language?</p>
      <div className="grid grid-cols-2 gap-3">
        {LANGUAGES.map((lang) => {
          const selected = value === lang.id;
          return (
            <button
              key={lang.id}
              onClick={() => onSelect(lang.id)}
              className={`min-h-[80px] rounded-2xl p-4 text-left transition-all duration-200 ${
                selected
                  ? "glass-card-selected"
                  : "glass-card glass-card-hover"
              }`}
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${LANG_BADGE_COLORS[lang.id] ?? "bg-slate-500"} text-white text-xs font-bold mb-2`}>
                {lang.flag}
              </div>
              <span className="font-semibold text-[#1E1B4B] text-sm">{lang.name}</span>
              <span className="font-bengali font-medium block text-sm text-slate-500 mt-0.5">
                {lang.namebn}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
