"use client";

import { LEVELS, type Level } from "@/lib/constants";

interface Props {
  value: Level;
  onChange: (v: Level) => void;
}

export function LevelSelector({ value, onChange }: Props) {
  return (
    <div>
      <h2 className="font-bengali text-lg font-semibold text-stone-900">
        তোমার লেভেল কোনটা?
      </h2>
      <p className="text-sm text-stone-400 mt-0.5 mb-3">Your level</p>
      <div className="flex flex-wrap gap-3">
        {LEVELS.map((level) => (
          <button
            key={level.id}
            onClick={() => onChange(level.id)}
            className={`min-h-[44px] rounded-full px-6 py-3 text-sm font-semibold transition-all ${
              value === level.id
                ? "bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-sm"
                : "border border-stone-200 bg-white text-stone-700 hover:border-primary-300"
            }`}
          >
            <span className="font-bengali">{level.namebn}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
