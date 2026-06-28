# Session Page v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the session page into a full-screen, orb-dominant, voice-first experience with double-tap-to-end, pull-up transcript sheet, and dual-line Bengali + target language transcripts.

**Architecture:** Three visual layers on a full-viewport canvas: floating header (mode + timer), dominant orb zone (center, tappable), collapsible transcript bottom sheet (drag gesture). Bengali script translations fetched async via a new `/api/translate` route. No new dependencies.

**Tech Stack:** Next.js 15, React 19, TypeScript strict, Tailwind CSS, Gemini 3.5 Flash (translate API)

## Global Constraints

- All Bengali text uses everyday Bangladeshi Bangla (Dhaka casual), never formal/literary
- No emoji in UI copy
- No AI/tech branding visible to users
- Minimum 44px touch targets, mobile-first (360px base)
- Tailwind CSS only, no CSS modules
- TypeScript strict mode
- No new dependencies
- Existing WebGL orb shader unchanged -- only container sizing and tap handling change
- Error messages to client must be generic -- never leak model names or tech details

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/hooks/use-gemini-live.ts` | Add `bengaliText` to `TranscriptEntry`, expose `setTranscripts` for translation updates |
| Create | `src/app/api/translate/route.ts` | Transliterate/translate text to Bengali script via Gemini |
| Create | `src/hooks/use-transcript-translation.ts` | Async hook that watches transcripts and fills in `bengaliText` |
| Modify | `src/app/globals.css` | Add `orb-pulse` keyframe animation |
| Modify | `tailwind.config.ts` | Register `orb-pulse` animation |
| Create | `src/components/session/transcript-sheet.tsx` | Pull-up bottom sheet with drag gesture + message rendering |
| Modify | `src/app/session/page.tsx` | New immersive layout, orb tap handler, sheet integration |
| Delete | `src/components/session/transcript-panel.tsx` | Replaced by transcript-sheet.tsx |

---

### Task 1: Extend TranscriptEntry type and expose setter

**Files:**
- Modify: `src/hooks/use-gemini-live.ts:1-12` (type definition) and return value

**Interfaces:**
- Consumes: nothing new
- Produces: `TranscriptEntry` with optional `bengaliText?: string` field; `setTranscripts` setter exposed from `useGeminiLive` return for external updates

- [ ] **Step 1: Update TranscriptEntry interface**

In `src/hooks/use-gemini-live.ts`, change the interface at lines 7-11:

```typescript
export interface TranscriptEntry {
  role: "user" | "tutor";
  content: string;
  bengaliText?: string;
  timestamp: number;
}
```

- [ ] **Step 2: Expose setTranscripts in the return value**

In `src/hooks/use-gemini-live.ts`, change line 194 from:

```typescript
  return { connect, disconnect, status, agentState, transcripts };
```

to:

```typescript
  return { connect, disconnect, status, agentState, transcripts, setTranscripts };
```

- [ ] **Step 3: Update use-session.ts to pass through setTranscripts**

In `src/hooks/use-session.ts`, the hook destructures from `useGeminiLive`. Update the return block at lines 103-111.

Add `setTranscripts` to the return:

```typescript
  return {
    sessionId,
    sessionStatus,
    transcripts: voice.transcripts as TranscriptEntry[],
    setTranscripts: isGemini ? gemini.setTranscripts : undefined,
    agentState: voice.agentState,
    startSession,
    endSession,
  };
```

- [ ] **Step 4: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds (may show warnings about unused setTranscripts, that's fine -- Task 6 consumes it)

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-gemini-live.ts src/hooks/use-session.ts
git commit -m "feat: add bengaliText field to TranscriptEntry, expose setTranscripts"
```

---

### Task 2: Create /api/translate route

**Files:**
- Create: `src/app/api/translate/route.ts`

**Interfaces:**
- Consumes: `@google/genai` (already installed), model `gemini-3.5-flash`
- Produces: `POST /api/translate` -- accepts `{ text: string }`, returns `{ translated: string | null }`

- [ ] **Step 1: Create the route file**

Create `src/app/api/translate/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const SYSTEM_PROMPT =
  "Transliterate or translate the following text into Bengali script (বাংলা). Return ONLY the Bengali text, nothing else. Use everyday Bangladeshi Bangla, not formal or literary Bengali. If the text is already in Bengali script, return it as-is.";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ translated: null }, { status: 400 });
  }

  const { text } = body as { text?: string };

  if (!text || typeof text !== "string" || text.trim() === "") {
    return NextResponse.json({ translated: null }, { status: 400 });
  }

  try {
    const response = await genai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ role: "user", parts: [{ text }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    });

    const translated = response.text?.trim() || null;
    return NextResponse.json({ translated });
  } catch (error) {
    console.error("[translate]", error instanceof Error ? error.message : error);
    return NextResponse.json({ translated: null }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -10`
Expected: Build succeeds, new route `/api/translate` appears in the route list

- [ ] **Step 3: Commit**

```bash
git add src/app/api/translate/route.ts
git commit -m "feat: add /api/translate route for Bengali script transliteration"
```

---

### Task 3: Create useTranscriptTranslation hook

**Files:**
- Create: `src/hooks/use-transcript-translation.ts`

**Interfaces:**
- Consumes: `TranscriptEntry` type from `use-gemini-live.ts` (with `bengaliText?: string` field from Task 1); `setTranscripts` setter from Task 1
- Produces: `useTranscriptTranslation(transcripts, setTranscripts)` -- no return value, mutates transcripts in-place via setter

- [ ] **Step 1: Create the hook file**

Create `src/hooks/use-transcript-translation.ts`:

```typescript
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
        if (!data.translated) return;
        setTranscripts((prev) => {
          const updated = [...prev];
          const target = updated[lastIndex];
          if (target && target.role === "tutor" && !target.bengaliText) {
            updated[lastIndex] = { ...target, bengaliText: data.translated };
          }
          return updated;
        });
      })
      .catch(() => {});

    return () => controller.abort();
  }, [transcripts, setTranscripts]);
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-transcript-translation.ts
git commit -m "feat: add useTranscriptTranslation hook for async Bengali script"
```

---

### Task 4: Add orb-pulse animation to CSS and Tailwind config

**Files:**
- Modify: `tailwind.config.ts:33-46` (animation and keyframes)
- Modify: `src/app/globals.css` (bottom of file)

**Interfaces:**
- Consumes: nothing
- Produces: `animate-orb-pulse` Tailwind class; `.orb-exit` CSS class for shrink+fade

- [ ] **Step 1: Add orb-pulse to Tailwind config**

In `tailwind.config.ts`, add to the `animation` object (after `"step-slide"` at line 35):

```typescript
        "orb-pulse": "orb-pulse 300ms ease-out",
```

Add to the `keyframes` object (after `"step-slide"` block at line 45):

```typescript
        "orb-pulse": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
```

- [ ] **Step 2: Add orb-exit class to globals.css**

Append to the end of `src/app/globals.css`, inside the `@layer components` block (before the final `}`):

First, change the closing `}` of `@layer components` at line 130. Add before it:

```css
  .orb-exit {
    animation: orb-exit 400ms ease-out forwards;
  }

  @keyframes orb-exit {
    from {
      transform: scale(1);
      opacity: 1;
    }
    to {
      transform: scale(0.8);
      opacity: 0;
    }
  }
```

- [ ] **Step 3: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts src/app/globals.css
git commit -m "feat: add orb-pulse and orb-exit animations"
```

---

### Task 5: Create TranscriptSheet component

**Files:**
- Create: `src/components/session/transcript-sheet.tsx`

**Interfaces:**
- Consumes: `TranscriptEntry` from `use-gemini-live.ts` (with `bengaliText` field from Task 1)
- Produces: `<TranscriptSheet entries={TranscriptEntry[]} expanded={boolean} onToggle={() => void} />` component

- [ ] **Step 1: Create the component**

Create `src/components/session/transcript-sheet.tsx`:

```tsx
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
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds (component not imported anywhere yet)

- [ ] **Step 3: Commit**

```bash
git add src/components/session/transcript-sheet.tsx
git commit -m "feat: create TranscriptSheet pull-up bottom sheet component"
```

---

### Task 6: Rewrite session page with immersive layout

This is the main integration task. It replaces the existing session page layout, wires up the orb tap handler, integrates the transcript sheet, and connects the translation hook.

**Files:**
- Modify: `src/app/session/page.tsx` (full rewrite of SessionContent)
- Delete: `src/components/session/transcript-panel.tsx`

**Interfaces:**
- Consumes: `TranscriptSheet` from Task 5, `useTranscriptTranslation` from Task 3, `animate-orb-pulse` from Task 4, `setTranscripts` from Task 1
- Produces: Complete immersive session page

- [ ] **Step 1: Rewrite session page**

Replace the entire contents of `src/app/session/page.tsx` with:

```tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useSession } from "@/hooks/use-session";
import { useTranscriptTranslation } from "@/hooks/use-transcript-translation";
import { VoiceOrb } from "@/components/session/voice-orb";
import { TranscriptSheet } from "@/components/session/transcript-sheet";
import {
  MODES,
  type Language,
  type Mode,
  type Level,
  type VoiceType,
  type SessionConfig,
} from "@/lib/constants";

const STATE_LABELS: Record<string, { text: string; color: string }> = {
  idle: { text: "অপেক্ষায়...", color: "text-slate-400" },
  listening: { text: "শুনছি...", color: "text-cyan-500" },
  thinking: { text: "ভাবছি...", color: "text-slate-400" },
  speaking: { text: "বলছি...", color: "text-primary-500" },
};

const END_CONFIRM_LABEL = { text: "আবার ট্যাপ করুন শেষ করতে", color: "text-red-400" };

function SessionTimer({ startTime }: { startTime: number }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <span className="font-mono text-sm text-slate-500/70 tabular-nums">
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </span>
  );
}

function SessionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [startTime, setStartTime] = useState<number>(0);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [endConfirmPending, setEndConfirmPending] = useState(false);
  const [orbPulsing, setOrbPulsing] = useState(false);
  const [orbExiting, setOrbExiting] = useState(false);
  const endConfirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const config: SessionConfig = {
    language: (searchParams.get("language") ?? "english") as Language,
    mode: (searchParams.get("mode") ?? "conversation") as Mode,
    level: (searchParams.get("level") ?? "beginner") as Level,
    voice: (searchParams.get("voice") ?? "priya") as VoiceType,
  };

  const { sessionStatus, transcripts, setTranscripts, agentState, startSession, endSession } =
    useSession(config);

  useTranscriptTranslation(transcripts, setTranscripts);

  useEffect(() => {
    void startSession().then(() => {
      setStartTime(Date.now());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (endConfirmTimer.current) clearTimeout(endConfirmTimer.current);
    };
  }, []);

  const handleEnd = useCallback(async () => {
    const result = await endSession();
    if (result) {
      router.push(`/results?sessionId=${result.sessionId}`);
    } else {
      router.push("/practice");
    }
  }, [endSession, router]);

  const handleOrbTap = useCallback(() => {
    if (sessionStatus !== "active") return;

    if (!endConfirmPending) {
      setEndConfirmPending(true);
      setOrbPulsing(true);
      setTimeout(() => setOrbPulsing(false), 300);

      endConfirmTimer.current = setTimeout(() => {
        setEndConfirmPending(false);
      }, 2000);
    } else {
      if (endConfirmTimer.current) clearTimeout(endConfirmTimer.current);
      setEndConfirmPending(false);
      setOrbExiting(true);
      setTimeout(() => void handleEnd(), 400);
    }
  }, [sessionStatus, endConfirmPending, handleEnd]);

  const modeInfo = MODES.find((m) => m.id === config.mode);
  const stateInfo = endConfirmPending
    ? END_CONFIRM_LABEL
    : STATE_LABELS[agentState] ?? STATE_LABELS.idle;

  if (sessionStatus === "ending") {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-page-mesh">
        <p className="font-bengali text-slate-500">সেশন শেষ হচ্ছে...</p>
      </main>
    );
  }

  if (sessionStatus === "error") {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-page-mesh px-4">
        <div className="glass-panel rounded-3xl p-8 text-center">
          <p className="font-bengali text-slate-600 mb-4">
            কানেকশনে সমস্যা হয়েছে
          </p>
          <button
            onClick={() => router.push("/practice")}
            className="btn-primary rounded-xl bg-gradient-to-b from-primary-500 to-primary-600 px-6 py-2.5 min-h-[44px] text-sm font-semibold text-white hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            <span className="font-bengali">আবার ট্রাই করুন</span>
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col bg-page-mesh">
      <header className="flex items-center justify-between px-6 pt-5 shrink-0">
        <span className="font-bengali text-sm text-slate-500/70">
          {modeInfo?.namebn ?? config.mode}
        </span>
        {startTime > 0 && <SessionTimer startTime={startTime} />}
      </header>

      <div
        className={`flex-1 flex flex-col items-center justify-center pb-[120px] transition-all duration-300 ${
          sheetExpanded ? "scale-[0.85] opacity-40" : "scale-100 opacity-100"
        }`}
        onClick={sheetExpanded ? () => setSheetExpanded(false) : undefined}
      >
        <div
          onClick={(e) => { if (!sheetExpanded) { e.stopPropagation(); handleOrbTap(); } }}
          className={`${sessionStatus === "active" ? "cursor-pointer" : "pointer-events-none"} ${
            orbPulsing ? "animate-orb-pulse" : ""
          } ${orbExiting ? "orb-exit" : ""}`}
        >
          <VoiceOrb state={agentState as "idle" | "listening" | "thinking" | "speaking"} />
        </div>
        <p
          className={`font-bengali text-sm font-medium mt-3 transition-colors duration-300 ${stateInfo.color}`}
        >
          {stateInfo.text}
        </p>
      </div>

      <TranscriptSheet
        entries={transcripts}
        expanded={sheetExpanded}
        onToggle={() => setSheetExpanded((v) => !v)}
      />
    </main>
  );
}

export default function SessionPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh items-center justify-center bg-page-mesh">
          <p className="font-bengali text-slate-500">লোড হচ্ছে...</p>
        </main>
      }
    >
      <SessionContent />
    </Suspense>
  );
}
```

- [ ] **Step 2: Delete the old transcript panel**

```bash
rm src/components/session/transcript-panel.tsx
```

- [ ] **Step 3: Verify build**

Run: `npm run build 2>&1 | tail -10`
Expected: Build succeeds. The route list should show all existing routes plus `/api/translate`.

- [ ] **Step 4: Start dev server and test in browser**

Run: `npm run dev`

Open http://localhost:3000 and start a voice session. Verify:
1. The header is floating (no glass bar, just mode name + timer)
2. The orb is centered and dominant (~60% of screen)
3. State text shows below the orb
4. Transcript sheet is at the bottom, ~120px collapsed
5. Dragging up on the sheet expands it to ~70vh
6. When expanded, clicking the dimmed orb area collapses the sheet
7. Clicking the drag handle toggles expanded/collapsed
8. Tapping the orb once: orb pulses, state text changes to "আবার ট্যাপ করুন শেষ করতে"
9. Not tapping again within 2s: text reverts to normal
10. Double-tapping: orb shrinks + fades, navigates to results
11. Tutor messages show Bengali script (bold) + target language (lighter)
12. User messages show single line, right-aligned, blue

- [ ] **Step 5: Commit**

```bash
git add src/app/session/page.tsx
git rm src/components/session/transcript-panel.tsx
git commit -m "feat: immersive session page with orb-tap-to-end and transcript sheet"
```

---

### Task 7: Deploy and verify

**Files:**
- No code changes -- deployment only

**Interfaces:**
- Consumes: all previous tasks committed to `feat/v2-rebuild`
- Produces: live deployment at https://bhasha-shikhi-demo.vercel.app

- [ ] **Step 1: Push to remote**

```bash
git push origin feat/v2-rebuild
```

- [ ] **Step 2: Deploy to Vercel**

```bash
npx vercel deploy --prod 2>&1 | tail -5
```

Expected: Deployment succeeds, aliased to `bhasha-shikhi-demo.vercel.app`

- [ ] **Step 3: Verify on live site**

Open https://bhasha-shikhi-demo.vercel.app and run through a full session:
1. Start a session (any language/mode)
2. Verify orb is centered, no red button, no glass header bar
3. Wait for tutor greeting -- verify Bengali script appears in transcript
4. Speak -- verify user transcript appears
5. Pull up transcript sheet -- verify orb dims
6. Collapse sheet -- verify orb returns
7. Double-tap orb -- verify session ends and navigates to results
8. Check scoring works (no 500 errors)
9. Check browser console -- no tech details leaked in any error messages

- [ ] **Step 4: Commit any fixes**

If any issues found, fix and redeploy. Otherwise, done.
