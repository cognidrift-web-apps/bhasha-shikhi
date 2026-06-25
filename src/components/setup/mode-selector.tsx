"use client";

import { MODES, type Mode } from "@/lib/constants";

interface Props {
  value: Mode;
  onChange: (v: Mode) => void;
}

export function ModeSelector({ value, onChange }: Props) {
  const regularModes = MODES.filter((m) => !("isUtility" in m && m.isUtility));
  const utilityModes = MODES.filter((m) => "isUtility" in m && m.isUtility);

  return (
    <div>
      <h2 className="text-base font-semibold text-stone-800 mb-3">
        কী করতে চান?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {regularModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onChange(mode.id)}
            className={`min-h-[44px] rounded-lg border-2 p-4 text-left transition-all ${
              value === mode.id
                ? "border-brand-500 bg-brand-50 shadow-sm"
                : "border-stone-200 bg-white hover:border-brand-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bengali font-semibold text-stone-800">{mode.namebn}</span>
              <span className="text-xs text-stone-400 shrink-0 ml-2">{mode.duration}</span>
            </div>
            <p className="font-bengali text-sm text-stone-500 mt-1 leading-snug">
              {mode.descriptionbn}
            </p>
          </button>
        ))}
      </div>

      {utilityModes.length > 0 && (
        <div className="mt-3">
          <p className="font-bengali text-xs text-stone-400 mb-2">টুল</p>
          <div className="grid grid-cols-1 gap-3">
            {utilityModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => onChange(mode.id)}
                className={`min-h-[44px] rounded-lg border-2 p-4 text-left transition-all ${
                  value === mode.id
                    ? "border-accent-500 bg-accent-50 shadow-sm"
                    : "border-stone-200 bg-white hover:border-accent-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bengali font-semibold text-stone-800">{mode.namebn}</span>
                  <span className="text-xs text-stone-400 shrink-0 ml-2">{mode.duration}</span>
                </div>
                <p className="font-bengali text-sm text-stone-500 mt-1 leading-snug">
                  {mode.descriptionbn}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
