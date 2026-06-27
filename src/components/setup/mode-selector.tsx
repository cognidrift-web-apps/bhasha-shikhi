"use client";

import { type ReactElement } from "react";
import {
  TextAa,
  ChatCircleDots,
  UsersThree,
  Waveform,
  BookOpen,
  Ear,
  Translate,
} from "@phosphor-icons/react";
import { MODES, type Mode } from "@/lib/constants";

interface Props {
  value: Mode;
  onChange: (v: Mode) => void;
}

const MODE_ICONS: Record<string, ReactElement> = {
  word_by_word: <TextAa size={22} weight="duotone" />,
  conversation: <ChatCircleDots size={22} weight="duotone" />,
  roleplay: <UsersThree size={22} weight="duotone" />,
  pronunciation: <Waveform size={22} weight="duotone" />,
  grammar: <BookOpen size={22} weight="duotone" />,
  listening: <Ear size={22} weight="duotone" />,
  live_translation: <Translate size={22} weight="duotone" />,
};

export function ModeSelector({ value, onChange }: Props) {
  const regularModes = MODES.filter((m) => !("isUtility" in m && m.isUtility));
  const utilityModes = MODES.filter((m) => "isUtility" in m && m.isUtility);

  function renderCard(m: (typeof MODES)[number]) {
    const selected = value === m.id;
    return (
      <button
        key={m.id}
        onClick={() => onChange(m.id)}
        className={`min-h-[80px] rounded-2xl p-4 text-left transition-all duration-300 ${
          selected
            ? "bg-white/60 backdrop-blur-xl border-2 border-primary-400 shadow-lg shadow-primary-500/15"
            : "bg-white/40 backdrop-blur-lg border border-white/50 shadow-md shadow-indigo-500/5 hover:bg-white/60 hover:-translate-y-0.5"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 shrink-0 flex h-10 w-10 items-center justify-center rounded-xl ${
              selected ? "bg-primary-50/80 text-primary-600" : "bg-slate-100/80 backdrop-blur-sm text-slate-400"
            }`}
          >
            {MODE_ICONS[m.id]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-bengali font-semibold text-[#1E1B4B]">{m.namebn}</span>
              <span className="text-xs bg-slate-100/80 text-slate-500 rounded-full px-2 py-0.5 shrink-0 ml-2">
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
  }

  return (
    <div>
      <h2 className="font-bengali text-xl font-bold text-[#1E1B4B] mb-1">
        কী করতে চাও?
      </h2>
      <p className="text-sm text-slate-500 mb-5">Choose a mode</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {regularModes.map(renderCard)}
      </div>

      {utilityModes.length > 0 && (
        <div className="mt-4">
          <p className="font-bengali text-xs text-slate-400 mb-2">টুলস</p>
          <div className="grid grid-cols-1 gap-3">
            {utilityModes.map(renderCard)}
          </div>
        </div>
      )}
    </div>
  );
}
