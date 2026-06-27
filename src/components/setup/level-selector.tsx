"use client";

import { LEVELS, type Level } from "@/lib/constants";

interface Props {
  value: Level;
  onSelect: (v: Level) => void;
}

export function LevelSelector({ value, onSelect }: Props) {
  return (
    <div>
      <h2 className="font-bengali text-xl font-bold text-[#1E1B4B] mb-1">
        লেভেল বাছুন
      </h2>
      <p className="text-sm text-slate-500 mb-5">Your level</p>
      <div className="flex flex-col gap-3">
        {LEVELS.map((level) => (
          <button
            key={level.id}
            onClick={() => onSelect(level.id)}
            className={`min-h-[52px] w-full rounded-2xl px-5 py-3 text-left text-sm font-semibold transition-all duration-200 ${
              value === level.id
                ? "bg-primary-600 text-white ring-2 ring-primary-500"
                : "glass-card glass-card-hover text-slate-700"
            }`}
          >
            <span className="font-bengali">{level.namebn}</span>
            <span className="opacity-50 mx-2">|</span>
            <span>{level.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
