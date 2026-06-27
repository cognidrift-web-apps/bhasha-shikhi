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

const MODE_ICONS: Record<string, { icon: ReactElement; color: string }> = {
  word_by_word: { icon: <TextAa size={20} weight="fill" />, color: "bg-blue-500" },
  conversation: { icon: <ChatCircleDots size={20} weight="fill" />, color: "bg-emerald-500" },
  roleplay: { icon: <UsersThree size={20} weight="fill" />, color: "bg-orange-500" },
  pronunciation: { icon: <Waveform size={20} weight="fill" />, color: "bg-violet-500" },
  grammar: { icon: <BookOpen size={20} weight="fill" />, color: "bg-rose-500" },
  listening: { icon: <Ear size={20} weight="fill" />, color: "bg-cyan-500" },
  live_translation: { icon: <Translate size={20} weight="fill" />, color: "bg-amber-500" },
};

export function ModeSelector({ value, onChange }: Props) {
  const regularModes = MODES.filter((m) => !("isUtility" in m && m.isUtility));
  const utilityModes = MODES.filter((m) => "isUtility" in m && m.isUtility);

  function renderCard(m: (typeof MODES)[number]) {
    const selected = value === m.id;
    const modeStyle = MODE_ICONS[m.id];
    return (
      <button
        key={m.id}
        onClick={() => onChange(m.id)}
        className={`min-h-[80px] rounded-2xl p-4 text-left transition-all duration-200 ${
          selected
            ? "glass-card-selected"
            : "glass-card glass-card-hover"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 shrink-0 flex h-9 w-9 items-center justify-center rounded-xl text-white ${
              modeStyle?.color ?? "bg-slate-500"
            }`}
          >
            {modeStyle?.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-bengali font-semibold text-[#1E1B4B]">{m.namebn}</span>
              <span className="text-xs bg-white/40 border border-white/50 text-slate-500 rounded-full px-2 py-0.5 shrink-0 ml-2">
                {m.duration}
              </span>
            </div>
            <p className="font-bengali font-medium text-sm text-slate-500 mt-1 leading-snug">
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
        কী করতে চান?
      </h2>
      <p className="text-sm text-slate-500 mb-5">Choose a mode</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {regularModes.map(renderCard)}
      </div>

      {utilityModes.length > 0 && (
        <div className="mt-4">
          <p className="font-bengali font-medium text-xs text-slate-400 mb-2">টুলস</p>
          <div className="grid grid-cols-1 gap-3">
            {utilityModes.map(renderCard)}
          </div>
        </div>
      )}
    </div>
  );
}
