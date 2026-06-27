"use client";

import { LEVELS, type Level } from "@/lib/constants";

interface Props {
  value: Level;
  onSelect: (v: Level) => void;
}

export function LevelSelector({ value, onSelect }: Props) {
  return (
    <div>
      <h2 className="font-bengali text-2xl font-semibold text-[#1E1B4B] mb-2 text-center">
        আপনার লেভেল
      </h2>
      <p className="text-sm text-slate-500 mb-8 text-center tracking-[-0.03em]">Your level</p>
      <div className="flex flex-col gap-4">
        {LEVELS.map((level) => (
          <button
            key={level.id}
            onClick={() => onSelect(level.id)}
            className={`min-h-[56px] w-full rounded-3xl px-6 py-4 text-center transition-all duration-200 ${
              value === level.id
                ? "glass-card-selected text-[#1E1B4B]"
                : "glass-card glass-card-hover text-slate-700"
            }`}
          >
            <span className="font-bengali font-medium block">{level.namebn}</span>
            <span className="text-sm text-slate-500 block mt-0.5">{level.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
