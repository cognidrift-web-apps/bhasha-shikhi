"use client";

import { useEffect, useRef } from "react";
import type { TranscriptEntry } from "@/hooks/use-gemini-live";

interface Props {
  entries: TranscriptEntry[];
}

export function TranscriptPanel({ entries }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries.length]);

  if (entries.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <p className="font-bengali text-center text-slate-400 text-sm">
          কথাবার্তা এখানে দেখাবে
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 px-4 py-3">
      {entries.map((entry, i) => (
        <div
          key={i}
          className={`flex animate-slide-up ${entry.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              entry.role === "user"
                ? "bg-primary-600 text-white rounded-br-sm"
                : "bg-slate-100 text-slate-800 rounded-bl-sm"
            }`}
          >
            {entry.content}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
