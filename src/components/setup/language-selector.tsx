"use client";

import { LANGUAGES, type Language } from "@/lib/constants";

interface Props {
  value: Language;
  onChange: (v: Language) => void;
}

export function LanguageSelector({ value, onChange }: Props) {
  return (
    <div>
      <h2 className="text-base font-semibold text-stone-800 mb-3">
        কোন ভাষা শিখবেন?
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.id}
            onClick={() => onChange(lang.id)}
            className={`min-h-[56px] rounded-lg border-2 p-4 text-left transition-all ${
              value === lang.id
                ? "border-brand-500 bg-brand-50 shadow-sm"
                : "border-stone-200 bg-white hover:border-brand-300"
            }`}
          >
            <span className="block text-xs font-bold text-stone-400 mb-1">{lang.flag}</span>
            <span className="font-semibold text-stone-800 text-sm">{lang.name}</span>
            <span className="font-bengali block text-sm text-stone-500 mt-0.5">
              {lang.namebn}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
