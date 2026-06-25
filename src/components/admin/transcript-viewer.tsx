import type { Transcript } from "@/lib/supabase/types";

interface Props {
  transcripts: Transcript[];
}

export function TranscriptViewer({ transcripts }: Props) {
  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {transcripts.map((t) => (
        <div
          key={t.id}
          className={`rounded-lg px-3 py-2 text-sm ${
            t.role === "user" ? "bg-brand-50 ml-8" : "bg-stone-50 mr-8"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-stone-500 uppercase">
              {t.role}
            </span>
            <span className="text-xs text-stone-400">
              {new Date(t.created_at).toLocaleTimeString()}
            </span>
          </div>
          <p className="text-stone-700">{t.content}</p>
        </div>
      ))}
    </div>
  );
}
