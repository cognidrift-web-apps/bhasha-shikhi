"use client";

import { type ReactElement } from "react";
import { MODES, type Mode } from "@/lib/constants";

interface Props {
  value: Mode;
  onChange: (v: Mode) => void;
}

const MODE_ICONS: Record<string, ReactElement> = {
  word_by_word: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  conversation: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  ),
  roleplay: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  pronunciation: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
  ),
  grammar: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  listening: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
    </svg>
  ),
  live_translation: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
    </svg>
  ),
};

export function ModeSelector({ value, onChange }: Props) {
  const regularModes = MODES.filter((m) => !("isUtility" in m && m.isUtility));
  const utilityModes = MODES.filter((m) => "isUtility" in m && m.isUtility);

  return (
    <div>
      <h2 className="font-bengali text-xl font-bold text-[#1E1B4B] mb-1">
        কী করতে চাও?
      </h2>
      <p className="text-sm text-slate-500 mb-5">Choose a mode</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {regularModes.map((m) => {
          const selected = value === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onChange(m.id)}
              className={`min-h-[80px] rounded-xl p-4 text-left transition-all ${
                selected
                  ? "border-2 border-blue-500 bg-white"
                  : "border border-slate-200 bg-white hover:-translate-y-0.5"
              }`}
              style={{ boxShadow: selected ? "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(59,130,246,0.08)" : "var(--shadow-card)" }}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 shrink-0 flex h-9 w-9 items-center justify-center rounded-full ${
                    selected ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {MODE_ICONS[m.id]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bengali font-semibold text-[#1E1B4B]">{m.namebn}</span>
                    <span className="text-xs bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 shrink-0 ml-2">
                      {m.duration}
                    </span>
                  </div>
                  <p className="font-bengali text-sm text-slate-500 mt-1 leading-snug">
                    {m.descriptionbn}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {utilityModes.length > 0 && (
        <div className="mt-4">
          <p className="font-bengali text-xs text-slate-400 mb-2">টুলস</p>
          <div className="grid grid-cols-1 gap-3">
            {utilityModes.map((m) => {
              const selected = value === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => onChange(m.id)}
                  className={`min-h-[80px] rounded-xl p-4 text-left transition-all ${
                    selected
                      ? "border-2 border-blue-500 bg-white"
                      : "border border-slate-200 bg-white hover:-translate-y-0.5"
                  }`}
                  style={{ boxShadow: selected ? "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(59,130,246,0.08)" : "var(--shadow-card)" }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 shrink-0 flex h-9 w-9 items-center justify-center rounded-full ${
                        selected ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {MODE_ICONS[m.id]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bengali font-semibold text-[#1E1B4B]">{m.namebn}</span>
                        <span className="text-xs bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 shrink-0 ml-2">
                          {m.duration}
                        </span>
                      </div>
                      <p className="font-bengali text-sm text-slate-500 mt-1 leading-snug">
                        {m.descriptionbn}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
