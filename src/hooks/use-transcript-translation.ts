"use client";

import { useEffect, useRef } from "react";
import type { TranscriptEntry } from "./use-gemini-live";

type SetTranscripts = React.Dispatch<React.SetStateAction<TranscriptEntry[]>>;

export function useTranscriptTranslation(
  transcripts: TranscriptEntry[],
  setTranscripts: SetTranscripts | undefined,
  turnCompleteCount: number,
) {
  const translatedContents = useRef(new Map<number, string>());

  useEffect(() => {
    if (!setTranscripts || turnCompleteCount === 0) return;

    const controllers: AbortController[] = [];

    transcripts.forEach((entry, index) => {
      if (entry.role !== "tutor") return;
      if (translatedContents.current.get(index) === entry.content) return;

      translatedContents.current.set(index, entry.content);

      const controller = new AbortController();
      controllers.push(controller);

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
            if (updated[index] && updated[index].role === "tutor") {
              updated[index] = { ...updated[index], bengaliText: translated };
            }
            return updated;
          });
        })
        .catch(() => {
          translatedContents.current.delete(index);
        });
    });

    return () => controllers.forEach((c) => c.abort());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnCompleteCount]);
}
