"use client";

import { useEffect, useRef, useState } from "react";
import type { TranscriptEntry } from "@/hooks/use-gemini-live";

interface Props {
  entries: TranscriptEntry[];
  expanded: boolean;
  onToggle: () => void;
}

export function TranscriptSheet({ entries, expanded, onToggle }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (expanded) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [entries.length, expanded]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    const delta = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(delta) < 50) return;
    if (delta > 0 && !expanded) onToggle();
    if (delta < 0 && expanded) onToggle();
  };

  const lastTutorEntry = entries.filter((e) => e.role === "tutor").at(-1);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-20 glass-panel rounded-t-3xl transition-all duration-300 ease-out ${
        expanded ? "h-[70vh]" : "h-[120px]"
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex justify-center pt-2 pb-1 cursor-pointer"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onToggle(); }}
      >
        <div className="w-9 h-1 rounded-full bg-slate-300/60" />
      </div>

      {!expanded ? (
        <div className="px-4 relative">
          <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-white/40 to-transparent z-10 pointer-events-none rounded-t-3xl" />
          {lastTutorEntry ? (
            <div className="glass-card rounded-3xl rounded-bl-sm max-w-[85%] p-4">
              {lastTutorEntry.bengaliText && (
                <p className="font-bengali font-medium text-[#1E1B4B] text-base animate-slide-up">
                  {lastTutorEntry.bengaliText}
                </p>
              )}
              <p className={`text-sm text-slate-500 line-clamp-2 ${lastTutorEntry.bengaliText ? "mt-0.5" : ""}`}>
                {lastTutorEntry.content}
              </p>
            </div>
          ) : (
            <p className="font-bengali text-center text-slate-400 text-sm pt-4">
              কথাবার্তা এখানে দেখাবে
            </p>
          )}
        </div>
      ) : (
        <div ref={scrollRef} className="overflow-y-auto h-[calc(100%-32px)] px-4 pb-4 space-y-3">
          {entries.length === 0 ? (
            <p className="font-bengali text-center text-slate-400 text-sm pt-8">
              কথাবার্তা এখানে দেখাবে
            </p>
          ) : (
            entries.map((entry, i) => (
              <div
                key={i}
                className={`flex animate-slide-up ${entry.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {entry.role === "user" ? (
                  <div className="max-w-[85%] rounded-3xl rounded-br-sm bg-primary-600 text-white p-4 text-sm leading-relaxed">
                    {entry.content}
                  </div>
                ) : (
                  <div className="max-w-[85%] rounded-3xl rounded-bl-sm glass-card p-4">
                    {entry.bengaliText && (
                      <p className="font-bengali font-medium text-[#1E1B4B] text-base">
                        {entry.bengaliText}
                      </p>
                    )}
                    <p className={`text-sm text-slate-500 leading-relaxed ${entry.bengaliText ? "mt-0.5" : ""}`}>
                      {entry.content}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
