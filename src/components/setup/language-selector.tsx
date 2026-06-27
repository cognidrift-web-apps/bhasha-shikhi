"use client";

import { LANGUAGES, type Language } from "@/lib/constants";

interface Props {
  value: Language;
  onChange: (v: Language) => void;
}

export function LanguageSelector({ value, onChange }: Props) {
  return (
    <div>
      <h2 className="font-bengali text-lg font-semibold text-stone-900">
        কোন ভাষা শিখবে?
      </h2>
      <p className="text-sm text-stone-400 mt-0.5 mb-3">Which language?</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.id}
            onClick={() => onChange(lang.id)}
            className={`relative min-h-[72px] rounded-xl p-4 text-left transition-all overflow-hidden ${
              value === lang.id
                ? "border-2 border-primary-500 bg-primary-50 shadow-sm"
                : "border border-stone-200 bg-white hover:border-primary-300 hover:shadow-sm"
            }`}
          >
            {value === lang.id && (
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r bg-gradient-to-b from-primary-500 to-accent-500" />
            )}
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
