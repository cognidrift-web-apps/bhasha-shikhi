"use client";

import { useEffect, useRef } from "react";
import type { TranscriptEntry } from "./use-gemini-live";

type SetTranscripts = React.Dispatch<React.SetStateAction<TranscriptEntry[]>>;

export function useTranscriptTranslation(
  transcripts: TranscriptEntry[],
  setTranscripts: SetTranscripts | undefined,
) {
  const translatedIndexes = useRef(new Set<number>());

  useEffect(() => {
    if (!setTranscripts) return;

    const lastIndex = transcripts.length - 1;
    if (lastIndex < 0) return;

    const entry = transcripts[lastIndex];
    if (entry.role !== "tutor") return;
    if (entry.bengaliText) return;
    if (translatedIndexes.current.has(lastIndex)) return;

    translatedIndexes.current.add(lastIndex);

    const controller = new AbortController();

    fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: entry.content }),
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data: { translated: string | null }) => {
        const translated = data.translated;
        if (!translated) return;
        setTranscripts((prev) => {
          const updated = [...prev];
          const target = updated[lastIndex];
          if (target && target.role === "tutor" && !target.bengaliText) {
            updated[lastIndex] = { ...target, bengaliText: translated };
          }
          return updated;
        });
      })
      .catch(() => {});

    return () => controller.abort();
  }, [transcripts, setTranscripts]);
}
