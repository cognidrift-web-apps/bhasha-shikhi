"use client";

import { LEVELS, type Level } from "@/lib/constants";

interface Props {
  value: Level;
  onChange: (v: Level) => void;
}

export function LevelSelector({ value, onChange }: Props) {
  return (
    <div>
      <h2 className="text-base font-semibold text-stone-800 mb-3">
        এখন কেমন পারেন?
      </h2>
      <div className="flex flex-wrap gap-3">
        {LEVELS.map((level) => (
          <button
            key={level.id}
            onClick={() => onChange(level.id)}
            className={`min-h-[56px] min-w-[100px] rounded-lg border-2 px-5 py-3 text-center transition-all ${
              value === level.id
                ? "border-brand-500 bg-brand-50 shadow-sm"
                : "border-stone-200 bg-white hover:border-brand-300"
            }`}
          >
            <span className="block font-medium text-stone-800 text-sm">{level.name}</span>
            <span className="font-bengali block text-sm text-stone-500 mt-0.5">
              {level.namebn}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
