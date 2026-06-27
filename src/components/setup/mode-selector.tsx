"use client";

import { MODES, type Mode } from "@/lib/constants";

interface Props {
  value: Mode;
  onChange: (v: Mode) => void;
}

export function ModeSelector({ value, onChange }: Props) {
  const regularModes = MODES.filter((m) => !("isUtility" in m && m.isUtility));
  const utilityModes = MODES.filter((m) => "isUtility" in m && m.isUtility);

  function renderCard(m: (typeof MODES)[number]) {
    const selected = value === m.id;
    return (
      <button
        key={m.id}
        onClick={() => onChange(m.id)}
        className={`min-h-[100px] rounded-3xl p-6 text-center transition-all duration-200 ${
          selected
            ? "glass-card-selected"
            : "glass-card glass-card-hover"
        }`}
      >
        <span className="font-bengali font-medium text-[#1E1B4B] block">
          {m.namebn}
        </span>
        <p className="font-bengali text-sm text-slate-500 mt-2 leading-snug">
          {m.descriptionbn}
        </p>
        <span className="inline-block text-xs text-slate-400 mt-3">
          {m.duration}
        </span>
      </button>
    );
  }

  return (
    <div>
      <h2 className="font-bengali text-2xl font-semibold text-[#1E1B4B] mb-2 text-center">
        কী করতে চান?
      </h2>
      <p className="text-sm text-slate-500 mb-8 text-center tracking-[-0.03em]">Choose a mode</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {regularModes.map(renderCard)}
      </div>

      {utilityModes.length > 0 && (
        <div className="mt-6">
          <p className="text-xs text-slate-400 mb-3 text-center tracking-wide uppercase">
            Tools
          </p>
          <div className="grid grid-cols-1 gap-4">
            {utilityModes.map(renderCard)}
          </div>
        </div>
      )}
    </div>
  );
}
