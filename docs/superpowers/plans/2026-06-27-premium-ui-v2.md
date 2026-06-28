# February Premium UI v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild all visual components to iOS Settings-level polish with consistent icon badges, refined glass cards, depth-rich buttons, and polite Bangladeshi Bengali tone.

**Architecture:** Pure CSS/Tailwind class changes across existing components. No new dependencies. Same Phosphor Icons library switched from `weight="duotone"` to `weight="fill"`. Updated `.btn-primary`/`.btn-danger` CSS classes. Bengali text shifted from tumi to apni register.

**Tech Stack:** Tailwind CSS, Phosphor Icons (`@phosphor-icons/react`), Next.js 15, TypeScript strict

## Global Constraints

- No emoji anywhere in UI copy or code comments
- No emdash characters
- No AI/tech branding visible to users
- All Bengali text uses everyday Bangladeshi Bangla in apni (polite) register
- TypeScript strict mode
- `#1E1B4B` for primary text everywhere (never `text-stone-*` or pure black)
- All interactive transitions use `duration-200` (not 300)
- No test files needed (pure visual/CSS changes) -- verification is `npm run build`
- Buttons use `rounded-xl` (12px). Cards use `rounded-2xl` (16px).
- Selected cards: `ring-2 ring-primary-500 bg-white/70`. Unselected: `ring-1 ring-black/[0.04] bg-white/60`.
- All icons: `weight="fill"` (not `"duotone"`)

---

### Task 1: CSS Foundation and Font Fix

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: Nothing
- Produces: Updated `.btn-primary` and `.btn-danger` CSS classes used by all button components. Updated `body` class in layout.tsx.

- [ ] **Step 1: Update button CSS classes in globals.css**

Replace the entire `@layer components` block in `src/app/globals.css` with:

```css
@layer components {
  .bg-page-mesh {
    background-color: #EEF0F8;
    background-image:
      radial-gradient(at 20% 25%, rgba(99,102,241,0.18) 0%, transparent 55%),
      radial-gradient(at 80% 75%, rgba(59,130,246,0.14) 0%, transparent 55%),
      radial-gradient(at 50% 50%, rgba(139,92,246,0.06) 0%, transparent 70%);
  }

  .btn-primary {
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.2),
      0 2px 8px rgba(37,99,235,0.25);
  }
  .btn-primary:hover {
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.2),
      0 4px 12px rgba(37,99,235,0.30);
  }
  .btn-primary:active {
    box-shadow: none;
    filter: brightness(0.95);
  }

  .btn-danger {
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.2),
      0 2px 8px rgba(239,68,68,0.25);
  }
  .btn-danger:hover {
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.2),
      0 4px 12px rgba(239,68,68,0.30);
  }
  .btn-danger:active {
    box-shadow: none;
    filter: brightness(0.95);
  }
}
```

- [ ] **Step 2: Fix body text color in layout.tsx**

In `src/app/layout.tsx`, change the `<body>` className from:
```
bg-surface-page text-stone-900 antialiased font-sans
```
to:
```
bg-surface-page text-[#1E1B4B] antialiased font-sans
```

- [ ] **Step 3: Verify Bengali font weights are loaded**

In `src/app/layout.tsx`, confirm the Google Fonts link includes weights 400, 500, 600, 700:
```html
<link
  href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap"
  rel="stylesheet"
/>
```
This is already correct in the current file. No change needed.

- [ ] **Step 4: Build verification**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "style: update button shadows and fix body text color"
```

---

### Task 2: Landing Page (Hero + Features)

**Files:**
- Modify: `src/components/landing/hero.tsx`
- Modify: `src/components/landing/features.tsx`

**Interfaces:**
- Consumes: `.btn-primary` CSS class from Task 1
- Produces: Nothing consumed by later tasks

- [ ] **Step 1: Update hero.tsx**

In `src/components/landing/hero.tsx`, make these changes:

1. Change the hero heading from tumi to apni form. Replace:
```tsx
ভাষা শিখো
```
with:
```tsx
ভাষা শিখুন
```

2. Change the CTA button Bengali text and classes. Replace the entire `<Link>` element:
```tsx
<Link
  href="/practice"
  className="btn-primary inline-flex items-center gap-2 rounded-2xl bg-gradient-to-b from-primary-500 to-primary-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] min-h-[44px]"
>
  <span className="font-bengali">শুরু করো</span>
  <span className="text-white/50">|</span>
  <span>Start Now</span>
</Link>
```
with:
```tsx
<Link
  href="/practice"
  className="btn-primary inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-primary-500 to-primary-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 min-h-[44px]"
>
  <span className="font-bengali">শুরু করুন</span>
  <span className="text-white/50">|</span>
  <span>Start Now</span>
</Link>
```

3. Change the features Bengali title. Replace:
```tsx
টাইপ না, কথা বলো
```
with:
```tsx
টাইপ না, কথা বলুন
```

- [ ] **Step 2: Update features.tsx icons and cards**

In `src/components/landing/features.tsx`, make these changes:

1. Change all icon weights and add badge colors. Replace the entire `FEATURES` array:

```tsx
interface Feature {
  title: string;
  titlebn: string;
  description: string;
  icon: ReactElement;
  badgeColor: string;
}

const FEATURES: Feature[] = [
  {
    title: "7 Ways to Practice",
    titlebn: "৭ রকম প্র্যাকটিস",
    description:
      "Word by Word, Free Conversation, Situation Roleplay, Pronunciation Clinic, Grammar in Conversation, Listening Challenge, and Live Translation.",
    icon: <SquaresFour size={20} weight="fill" />,
    badgeColor: "bg-blue-500",
  },
  {
    title: "Talk, Don't Type",
    titlebn: "টাইপ না, কথা বলুন",
    description:
      "Voice-first learning. Your AI tutor Priya listens and responds naturally. No multiple choice, no typing. Just real conversation.",
    icon: <Microphone size={20} weight="fill" />,
    badgeColor: "bg-emerald-500",
  },
  {
    title: "4 Languages",
    titlebn: "৪টা ভাষা",
    description:
      "English for jobs and IELTS, German for nursing and university, Arabic for the Gulf and Islamic study, Hindi for Bollywood and casual life.",
    icon: <GlobeHemisphereWest size={20} weight="fill" />,
    badgeColor: "bg-violet-500",
  },
  {
    title: "Bangla Interference Detector",
    titlebn: "বাংলা ভুল ধরি",
    description:
      'Understands why you make mistakes because of Bangla. Catches "bhery" instead of "very", missing articles, and wrong prepositions.',
    icon: <Crosshair size={20} weight="fill" />,
    badgeColor: "bg-orange-500",
  },
  {
    title: "No Account Needed",
    titlebn: "একাউন্ট লাগবে না",
    description:
      "Just open and start talking. Your progress saves automatically so you can pick up right where you left off.",
    icon: <LockOpen size={20} weight="fill" />,
    badgeColor: "bg-cyan-500",
  },
];
```

2. Update the card rendering. Replace the entire `{FEATURES.map(...)}` block inside the grid div:

```tsx
{FEATURES.map((feature) => (
  <div
    key={feature.title}
    className="rounded-2xl bg-white/60 backdrop-blur-2xl ring-1 ring-black/[0.04] shadow-sm shadow-black/5 p-5 transition-all duration-200 hover:bg-white/70 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/8"
  >
    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${feature.badgeColor} text-white mb-4`}>
      {feature.icon}
    </div>
    <h3 className="font-bengali text-lg font-bold text-[#1E1B4B]">
      {feature.titlebn}
    </h3>
    <p className="text-sm text-slate-500 mt-0.5 mb-2">{feature.title}</p>
    <p className="text-sm text-slate-600 leading-relaxed">
      {feature.description}
    </p>
  </div>
))}
```

- [ ] **Step 3: Build verification**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/hero.tsx src/components/landing/features.tsx
git commit -m "style: iOS badge icons and refined cards on landing page"
```

---

### Task 3: Setup Wizard (All Selectors + Wizard Chrome)

**Files:**
- Modify: `src/components/setup/language-selector.tsx`
- Modify: `src/components/setup/mode-selector.tsx`
- Modify: `src/components/setup/level-selector.tsx`
- Modify: `src/components/setup/voice-selector.tsx`
- Modify: `src/components/setup/setup-wizard.tsx`

**Interfaces:**
- Consumes: `.btn-primary` CSS class from Task 1
- Produces: Nothing consumed by later tasks

- [ ] **Step 1: Update language-selector.tsx**

Replace the entire content of `src/components/setup/language-selector.tsx` with:

```tsx
"use client";

import { LANGUAGES, type Language } from "@/lib/constants";

interface Props {
  value: Language;
  onSelect: (v: Language) => void;
}

const LANG_BADGE_COLORS: Record<string, string> = {
  english: "bg-blue-500",
  german: "bg-emerald-500",
  arabic: "bg-amber-500",
  hindi: "bg-violet-500",
};

export function LanguageSelector({ value, onSelect }: Props) {
  return (
    <div>
      <h2 className="font-bengali text-xl font-bold text-[#1E1B4B] mb-1">
        কোন ভাষা শিখবেন?
      </h2>
      <p className="text-sm text-slate-500 mb-5">Which language?</p>
      <div className="grid grid-cols-2 gap-3">
        {LANGUAGES.map((lang) => {
          const selected = value === lang.id;
          return (
            <button
              key={lang.id}
              onClick={() => onSelect(lang.id)}
              className={`min-h-[80px] rounded-2xl p-4 text-left transition-all duration-200 ${
                selected
                  ? "bg-white/70 backdrop-blur-2xl ring-2 ring-primary-500 shadow-sm shadow-black/5"
                  : "bg-white/60 backdrop-blur-2xl ring-1 ring-black/[0.04] shadow-sm shadow-black/5 hover:bg-white/70 hover:shadow-md hover:shadow-black/8"
              }`}
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${LANG_BADGE_COLORS[lang.id] ?? "bg-slate-500"} text-white text-xs font-bold mb-2`}>
                {lang.flag}
              </div>
              <span className="font-semibold text-[#1E1B4B] text-sm">{lang.name}</span>
              <span className="font-bengali font-medium block text-sm text-slate-500 mt-0.5">
                {lang.namebn}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update mode-selector.tsx**

Replace the entire content of `src/components/setup/mode-selector.tsx` with:

```tsx
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
            ? "bg-white/70 backdrop-blur-2xl ring-2 ring-primary-500 shadow-sm shadow-black/5"
            : "bg-white/60 backdrop-blur-2xl ring-1 ring-black/[0.04] shadow-sm shadow-black/5 hover:bg-white/70 hover:shadow-md hover:shadow-black/8"
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
              <span className="text-xs bg-white/60 ring-1 ring-black/[0.04] text-slate-500 rounded-full px-2 py-0.5 shrink-0 ml-2">
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
```

- [ ] **Step 3: Update level-selector.tsx**

In `src/components/setup/level-selector.tsx`, make these changes:

1. Replace the heading Bengali text:
```
লেভেল বাছো
```
with:
```
লেভেল বাছুন
```

2. Replace the unselected card class:
```
bg-white/40 backdrop-blur-lg border border-white/50 shadow-md shadow-indigo-500/5 text-slate-700 hover:bg-white/60 hover:-translate-y-0.5
```
with:
```
bg-white/60 backdrop-blur-2xl ring-1 ring-black/[0.04] shadow-sm shadow-black/5 text-slate-700 hover:bg-white/70 hover:shadow-md hover:shadow-black/8
```

3. Replace the selected card class. Find the selected branch (the one with `bg-primary-600 text-white`) and ensure it has:
```
bg-primary-600 text-white ring-2 ring-primary-500
```

4. Change all `duration-300` to `duration-200` in this file.

- [ ] **Step 4: Update voice-selector.tsx**

Replace the entire content of `src/components/setup/voice-selector.tsx` with:

```tsx
"use client";

import { VOICES, type VoiceType } from "@/lib/constants";

interface Props {
  value: VoiceType;
  onChange: (v: VoiceType) => void;
}

export function VoiceSelector({ value, onChange }: Props) {
  return (
    <div>
      <h2 className="font-bengali text-xl font-bold text-[#1E1B4B] mb-1">
        টিউটর বাছুন
      </h2>
      <p className="text-sm text-slate-500 mb-5">Pick a tutor</p>
      <div className="flex flex-col gap-3">
        {VOICES.map((voice) => {
          const selected = value === voice.id;
          return (
            <button
              key={voice.id}
              onClick={() => onChange(voice.id)}
              className={`min-h-[72px] rounded-2xl p-4 text-left transition-all duration-200 ${
                selected
                  ? "bg-white/70 backdrop-blur-2xl ring-2 ring-primary-500 shadow-sm shadow-black/5"
                  : "bg-white/60 backdrop-blur-2xl ring-1 ring-black/[0.04] shadow-sm shadow-black/5 hover:bg-white/70 hover:shadow-md hover:shadow-black/8"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-lg font-bold">
                  {voice.name[0]}
                </div>
                <div>
                  <span className="font-semibold text-[#1E1B4B]">
                    {voice.name}{" "}
                    <span className="font-bengali font-normal text-slate-500">({voice.namebn})</span>
                  </span>
                  <span className="font-bengali font-medium block text-sm text-slate-500 mt-0.5 leading-snug">
                    {voice.biobn}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Update setup-wizard.tsx**

In `src/components/setup/setup-wizard.tsx`, make these changes:

1. Replace the footer className:
```
fixed bottom-0 inset-x-0 bg-white/40 backdrop-blur-xl border-t border-white/40 px-4 py-4
```
with:
```
fixed bottom-0 inset-x-0 bg-white/60 backdrop-blur-2xl ring-1 ring-black/[0.04] px-4 py-4
```

2. Replace the back button:
```tsx
<button
  onClick={goBack}
  className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors duration-300 min-h-[44px] px-2"
>
  <CaretLeft size={18} weight="duotone" />
  <span className="font-bengali">পিছনে</span>
</button>
```
with:
```tsx
<button
  onClick={goBack}
  className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors duration-200 min-h-[44px] px-2"
>
  <CaretLeft size={18} weight="fill" />
  <span className="font-bengali">পিছনে</span>
</button>
```

3. Replace the "Start" button (the `isLastStep` branch):
```tsx
<button
  onClick={handleStart}
  disabled={!hasSelection}
  className="btn-primary flex-1 max-w-xs rounded-2xl bg-gradient-to-b from-primary-500 to-primary-600 py-3.5 text-center font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0 min-h-[56px]"
>
  <span className="font-bengali">শুরু করো</span>
  <span className="text-white/50 mx-2">|</span>
  <span>Start</span>
</button>
```
with:
```tsx
<button
  onClick={handleStart}
  disabled={!hasSelection}
  className="btn-primary flex-1 max-w-xs rounded-xl bg-gradient-to-b from-primary-500 to-primary-600 py-3.5 text-center font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 min-h-[56px]"
>
  <span className="font-bengali">শুরু করুন</span>
  <span className="text-white/50 mx-2">|</span>
  <span>Start</span>
</button>
```

4. Replace the "Next" button:
```tsx
<button
  onClick={goNext}
  disabled={!hasSelection}
  className="btn-primary flex items-center gap-1 rounded-2xl bg-gradient-to-b from-primary-500 to-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0 min-h-[44px]"
>
  <span className="font-bengali">পরেরটা</span>
  <CaretRight size={18} weight="duotone" />
</button>
```
with:
```tsx
<button
  onClick={goNext}
  disabled={!hasSelection}
  className="btn-primary flex items-center gap-1 rounded-xl bg-gradient-to-b from-primary-500 to-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 min-h-[44px]"
>
  <span className="font-bengali">পরেরটায় যান</span>
  <CaretRight size={18} weight="fill" />
</button>
```

- [ ] **Step 6: Build verification**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/setup/
git commit -m "style: iOS badge icons, refined cards, apni Bengali in setup wizard"
```

---

### Task 4: Session Page

**Files:**
- Modify: `src/app/session/page.tsx`
- Modify: `src/components/session/transcript-panel.tsx`

**Interfaces:**
- Consumes: `.btn-primary`, `.btn-danger` CSS classes from Task 1
- Produces: Nothing consumed by later tasks

- [ ] **Step 1: Update session/page.tsx**

In `src/app/session/page.tsx`, make these changes:

1. Replace the session header className:
```
flex items-center justify-between bg-white/40 backdrop-blur-xl border-b border-white/40 px-4 py-3 shrink-0
```
with:
```
flex items-center justify-between bg-white/60 backdrop-blur-2xl ring-1 ring-black/[0.04] px-4 py-3 shrink-0
```

2. Replace the transcript container className:
```
flex-1 overflow-y-auto min-h-0 bg-white/50 backdrop-blur-xl rounded-t-3xl border-t border-white/40
```
with:
```
flex-1 overflow-y-auto min-h-0 bg-white/60 backdrop-blur-2xl rounded-t-3xl ring-1 ring-black/[0.04]
```

3. Replace the error state card className:
```
rounded-2xl bg-white/50 backdrop-blur-xl border border-white/40 shadow-lg shadow-indigo-500/10 p-8 text-center
```
with:
```
rounded-2xl bg-white/60 backdrop-blur-2xl ring-1 ring-black/[0.04] shadow-sm shadow-black/5 p-8 text-center
```

4. Replace the error state Bengali text:
```
কানেকশনে প্রবলেম হয়েছে
```
with:
```
কানেকশনে সমস্যা হয়েছে
```

5. Replace the error retry button:
```tsx
className="btn-primary rounded-2xl bg-gradient-to-b from-primary-500 to-primary-600 px-6 py-2.5 min-h-[44px] text-sm font-medium text-white hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300"
```
with:
```tsx
className="btn-primary rounded-xl bg-gradient-to-b from-primary-500 to-primary-600 px-6 py-2.5 min-h-[44px] text-sm font-semibold text-white hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
```

6. Replace the error retry Bengali text:
```
আবার ট্রাই করো
```
with:
```
আবার ট্রাই করুন
```

7. Replace the end session button:
```tsx
className="btn-danger rounded-2xl bg-gradient-to-b from-red-400 to-red-500 px-6 py-2.5 min-h-[44px] text-sm font-semibold text-white transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
```
with:
```tsx
className="btn-danger rounded-xl bg-gradient-to-b from-red-500 to-red-600 px-6 py-2.5 min-h-[44px] text-sm font-semibold text-white transition-all duration-200 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
```

8. Replace the end session Bengali text:
```
সেশন শেষ করো
```
with:
```
সেশন শেষ করুন
```

- [ ] **Step 2: Update transcript-panel.tsx**

In `src/components/session/transcript-panel.tsx`, replace the bot bubble className:
```
bg-white/50 backdrop-blur-sm text-slate-800 border border-white/40 rounded-bl-sm
```
with:
```
bg-white/60 backdrop-blur-sm ring-1 ring-black/[0.04] text-slate-800 rounded-bl-sm
```

- [ ] **Step 3: Build verification**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/session/page.tsx src/components/session/transcript-panel.tsx
git commit -m "style: refined glass, iOS buttons, apni Bengali on session page"
```

---

### Task 5: Results, Feedback, Error, and 404 Pages

**Files:**
- Modify: `src/app/results/page.tsx`
- Modify: `src/components/results/score-card.tsx`
- Modify: `src/components/results/feedback-panel.tsx`
- Modify: `src/app/error.tsx`
- Modify: `src/app/not-found.tsx`

**Interfaces:**
- Consumes: `.btn-primary`, `.btn-danger` CSS classes from Task 1
- Produces: Nothing consumed by later tasks

- [ ] **Step 1: Update results/page.tsx**

In `src/app/results/page.tsx`, make these changes:

1. Replace the error state card className:
```
rounded-2xl bg-white/50 backdrop-blur-xl border border-white/40 shadow-lg shadow-indigo-500/10 p-8 text-center space-y-4
```
with:
```
rounded-2xl bg-white/60 backdrop-blur-2xl ring-1 ring-black/[0.04] shadow-sm shadow-black/5 p-8 text-center space-y-4
```

2. Replace the error retry button className:
```
btn-primary rounded-2xl bg-gradient-to-b from-primary-500 to-primary-600 px-6 py-2.5 min-h-[44px] text-sm font-semibold text-white hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300
```
with:
```
btn-primary rounded-xl bg-gradient-to-b from-primary-500 to-primary-600 px-6 py-2.5 min-h-[44px] text-sm font-semibold text-white hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200
```

3. Replace the error retry Bengali text `আবার ট্রাই করো` with `আবার ট্রাই করুন`.

4. Replace the feedback panel wrapper card className:
```
rounded-2xl bg-white/50 backdrop-blur-xl border border-white/40 shadow-lg shadow-indigo-500/10 p-6
```
with:
```
rounded-2xl bg-white/60 backdrop-blur-2xl ring-1 ring-black/[0.04] shadow-sm shadow-black/5 p-6
```

5. Replace the "Practice Again" button className:
```
btn-primary flex-1 rounded-2xl bg-gradient-to-b from-primary-500 to-primary-600 py-3 text-center text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] min-h-[52px]
```
with:
```
btn-primary flex-1 rounded-xl bg-gradient-to-b from-primary-500 to-primary-600 py-3 text-center text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 min-h-[52px]
```

6. Replace the "Practice Again" Bengali text `আবার প্র্যাকটিস করো` with `আবার প্র্যাকটিস করুন`.

7. Replace the secondary "Try Different Mode" button className:
```
flex-1 rounded-2xl bg-white/40 backdrop-blur-lg border border-white/50 shadow-md shadow-indigo-500/5 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-white/60 transition-all duration-300 min-h-[52px]
```
with:
```
flex-1 rounded-xl bg-white/60 backdrop-blur-lg ring-1 ring-black/[0.06] py-3 text-center text-sm font-semibold text-slate-700 hover:bg-white/70 hover:shadow-sm transition-all duration-200 min-h-[52px]
```

8. Replace the "Try Different Mode" Bengali text `অন্য মোড ট্রাই করো` with `অন্য মোড ট্রাই করুন`.

9. Replace the back link Bengali text `প্র্যাকটিস পেজে ফিরে যাও` with `প্র্যাকটিস পেজে ফিরে যান`.

10. Change the ArrowLeft icon weight from `"duotone"` to `"fill"`.

- [ ] **Step 2: Update score-card.tsx**

In `src/components/results/score-card.tsx`, replace the outer card className:
```
rounded-2xl bg-white/50 backdrop-blur-xl border border-white/40 shadow-lg shadow-indigo-500/10 p-6 space-y-6
```
with:
```
rounded-2xl bg-white/60 backdrop-blur-2xl ring-1 ring-black/[0.04] shadow-sm shadow-black/5 p-6 space-y-6
```

- [ ] **Step 3: Update feedback-panel.tsx**

In `src/components/results/feedback-panel.tsx`, make these changes:

1. Replace the strengths panel className:
```
rounded-xl border-l-[3px] border-emerald-500 bg-white/50 backdrop-blur-sm pl-4 pr-3 py-3
```
with:
```
rounded-xl border-l-[3px] border-emerald-500 bg-white/50 backdrop-blur-sm ring-1 ring-black/[0.04] pl-4 pr-3 py-3
```

2. Replace the improvements panel className (same pattern but with `border-amber-500`):
```
rounded-xl border-l-[3px] border-amber-500 bg-white/50 backdrop-blur-sm pl-4 pr-3 py-3
```
with:
```
rounded-xl border-l-[3px] border-amber-500 bg-white/50 backdrop-blur-sm ring-1 ring-black/[0.04] pl-4 pr-3 py-3
```

3. Replace Bengali text:
- `পেয়েছো` with `পেয়েছেন`
- `বার বাংলায় চলে গেছো` with `বার বাংলায় চলে গেছেন`
- `ভালো করেছো` with `ভালো করেছেন`
- `আরো ভালো করতে পারো` with `আরো ভালো করতে পারেন`

- [ ] **Step 4: Update error.tsx**

Replace the entire content of `src/app/error.tsx` with:

```tsx
"use client";

import { WarningCircle } from "@phosphor-icons/react";

export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-page-mesh px-4">
      <div className="rounded-2xl bg-white/60 backdrop-blur-2xl ring-1 ring-black/[0.04] shadow-sm shadow-black/5 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-white mx-auto mb-4">
          <WarningCircle size={28} weight="fill" />
        </div>
        <h1 className="text-2xl font-bold text-[#1E1B4B] mb-2">
          Something went wrong
        </h1>
        <p className="font-bengali font-medium text-slate-600 mb-4">
          কিছু একটা সমস্যা হয়েছে
        </p>
        <button
          onClick={reset}
          className="btn-primary rounded-xl bg-gradient-to-b from-primary-500 to-primary-600 px-6 py-2.5 min-h-[44px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        >
          <span className="font-bengali">আবার চেষ্টা করুন</span>
          <span className="text-white/50 mx-1.5">|</span>
          <span>Try Again</span>
        </button>
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Update not-found.tsx**

Replace the entire content of `src/app/not-found.tsx` with:

```tsx
"use client";

import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-page-mesh px-4">
      <div className="rounded-2xl bg-white/60 backdrop-blur-2xl ring-1 ring-black/[0.04] shadow-sm shadow-black/5 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-500 text-white mx-auto mb-4">
          <MagnifyingGlass size={28} weight="fill" />
        </div>
        <h1 className="text-2xl font-bold text-[#1E1B4B] mb-2">
          Page not found
        </h1>
        <p className="font-bengali font-medium text-slate-600 mb-4">
          পেজটা খুঁজে পাওয়া যাচ্ছে না
        </p>
        <Link
          href="/"
          className="btn-primary inline-block rounded-xl bg-gradient-to-b from-primary-500 to-primary-600 px-6 py-2.5 min-h-[44px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        >
          <span className="font-bengali">হোমে ফিরে যান</span>
          <span className="text-white/50 mx-1.5">|</span>
          <span>Go Home</span>
        </Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 6: Build verification**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 7: Commit**

```bash
git add src/app/results/page.tsx src/components/results/score-card.tsx src/components/results/feedback-panel.tsx src/app/error.tsx src/app/not-found.tsx
git commit -m "style: refined cards, iOS buttons, apni Bengali on results and error pages"
```
