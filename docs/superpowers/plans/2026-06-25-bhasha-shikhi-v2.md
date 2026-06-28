# BhashaShikhi v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild BhashaShikhi as a production-ready IELTS voice practice platform with dual voice pipelines (Gemini Live + Microsoft Speech), hidden admin analytics, and Vercel deployment.

**Architecture:** Next.js 15 App Router on Vercel handles the frontend, API routes, and admin panel. A lightweight Node.js WebSocket relay on Railway bridges browser audio to the Gemini Live API. Supabase provides PostgreSQL for session data/transcripts and Storage for audio recordings.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Gemini Live API (WebSocket), Gemini Flash text API (@google/genai), Microsoft Azure Speech SDK (microsoft-cognitiveservices-speech-sdk), Supabase (@supabase/supabase-js), ws (WebSocket server), Recharts (admin charts), bcryptjs (admin auth)

## Global Constraints

- TypeScript strict mode everywhere
- Tailwind CSS for all styling; no CSS modules, no styled-components
- No emoji in UI copy; no emdash characters
- No AI/tech branding visible to end users (no "Powered by", no framework meta tags)
- Bengali text uses Noto Sans Bengali font
- All interactive elements minimum 44px touch target
- Mobile-first responsive: 360px base, breakpoints at 768px, 1024px, 1280px
- Source maps disabled in production builds
- Console logs stripped in production
- API keys never in client bundles (NEXT_PUBLIC_ prefix only for relay URL)
- All Supabase access from API routes uses service role key with RLS enforced

---

### Task 1: Project Foundation and Configuration

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tailwind.config.ts`
- Create: `tsconfig.json`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `.env.local.example`
- Create: `.gitignore` (update existing)
- Create: `src/lib/constants.ts`

**Interfaces:**
- Consumes: nothing (first task)
- Produces: working Next.js dev server, Tailwind configured with project color palette, fonts loaded, layout shell with `<html lang="bn">`, constants for languages/modes/levels

- [ ] **Step 1: Initialize Next.js project**

From the project root (`bhasha-shikhi/`), scaffold Next.js alongside the existing code:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias --yes
```

If prompted about existing files, allow overwrite of config files. The old `frontend/` and `backend/` directories remain as reference.

- [ ] **Step 2: Install project dependencies**

```bash
npm install @google/genai @supabase/supabase-js microsoft-cognitiveservices-speech-sdk bcryptjs recharts
npm install -D @types/bcryptjs
```

- [ ] **Step 3: Configure Tailwind with project design tokens**

Replace `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          950: "#042f2e",
        },
        accent: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        surface: {
          50: "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4",
          300: "#d6d3d1",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        bengali: ["Noto Sans Bengali", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 4: Configure next.config.ts for production security**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error", "warn"] }
      : false,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 5: Create root layout with fonts and metadata**

Write `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BhashaShikhi - IELTS Practice",
  description: "Practice IELTS speaking and listening with a personal tutor",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className={inter.variable}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface-50 text-stone-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Write globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-size: 16px;
    line-height: 1.6;
  }

  .font-bengali {
    font-family: "Noto Sans Bengali", sans-serif;
  }
}

@layer components {
  .waveform-bar {
    animation: waveform 1.2s ease-in-out infinite;
  }

  .waveform-bar:nth-child(2) { animation-delay: 0.1s; }
  .waveform-bar:nth-child(3) { animation-delay: 0.2s; }
  .waveform-bar:nth-child(4) { animation-delay: 0.3s; }
  .waveform-bar:nth-child(5) { animation-delay: 0.4s; }
}

@keyframes waveform {
  0%, 100% { height: 4px; }
  50% { height: 20px; }
}
```

- [ ] **Step 7: Create constants file**

Write `src/lib/constants.ts`:

```ts
export const LANGUAGES = [
  { id: "english", name: "English", namebn: "ইংরেজি", flag: "🇬🇧" },
  { id: "german", name: "German", namebn: "জার্মান", flag: "🇩🇪" },
  { id: "hindi", name: "Hindi", namebn: "হিন্দি", flag: "🇮🇳" },
] as const;

export const MODES = [
  {
    id: "speaking_part1",
    name: "Speaking Part 1",
    namebn: "স্পিকিং পার্ট ১",
    description: "Introduction and interview questions",
    descriptionbn: "পরিচিতি এবং সাক্ষাৎকার প্রশ্ন",
    duration: "4-5 min",
  },
  {
    id: "speaking_part2",
    name: "Speaking Part 2",
    namebn: "স্পিকিং পার্ট ২",
    description: "Long turn with cue card",
    descriptionbn: "কিউ কার্ড সহ দীর্ঘ বক্তব্য",
    duration: "3-4 min",
  },
  {
    id: "speaking_part3",
    name: "Speaking Part 3",
    namebn: "স্পিকিং পার্ট ৩",
    description: "In-depth discussion",
    descriptionbn: "গভীর আলোচনা",
    duration: "4-5 min",
  },
  {
    id: "listening",
    name: "Listening Practice",
    namebn: "শ্রবণ অনুশীলন",
    description: "Comprehension exercises",
    descriptionbn: "বোধগম্যতা অনুশীলন",
    duration: "5-7 min",
  },
] as const;

export const LEVELS = [
  { id: "beginner", name: "Beginner", namebn: "প্রাথমিক" },
  { id: "intermediate", name: "Intermediate", namebn: "মধ্যবর্তী" },
  { id: "advanced", name: "Advanced", namebn: "উন্নত" },
] as const;

export const VOICES = [
  {
    id: "gemini",
    name: "Priya",
    namebn: "প্রিয়া",
    bio: "Warm and patient tutor",
    biobn: "উষ্ণ এবং ধৈর্যশীল শিক্ষক",
  },
  {
    id: "microsoft",
    name: "Nabanita",
    namebn: "নবনীতা",
    bio: "Clear and encouraging guide",
    biobn: "স্পষ্ট এবং উৎসাহজনক গাইড",
  },
] as const;

export type Language = (typeof LANGUAGES)[number]["id"];
export type Mode = (typeof MODES)[number]["id"];
export type Level = (typeof LEVELS)[number]["id"];
export type VoiceType = (typeof VOICES)[number]["id"];

export interface SessionConfig {
  language: Language;
  mode: Mode;
  level: Level;
  voice: VoiceType;
}
```

- [ ] **Step 8: Create .env.local.example**

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# WebSocket Relay (Railway)
NEXT_PUBLIC_WS_RELAY_URL=ws://localhost:8081

# Google Gemini (for text API - scoring and Path B chat)
GEMINI_API_KEY=

# Microsoft Azure Speech
AZURE_SPEECH_KEY=
AZURE_SPEECH_REGION=eastus

# Admin Panel
ADMIN_ROUTE_SLUG=panel-secret123
ADMIN_PASSWORD_HASH=
```

- [ ] **Step 9: Create placeholder landing page and verify dev server**

Write `src/app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-4xl font-bold text-brand-700">BhashaShikhi</h1>
    </main>
  );
}
```

Run: `npm run dev`

Expected: Dev server starts on port 3000, page shows "BhashaShikhi" in teal.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: initialize Next.js 15 project with Tailwind and design tokens"
```

---

### Task 2: Supabase Schema and Client

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/types.ts`

**Interfaces:**
- Consumes: Supabase project URL and keys from env vars
- Produces: `createBrowserClient()`, `createServerClient()`, `Database` type, SQL migration ready to apply

- [ ] **Step 1: Write the database migration**

Write `supabase/migrations/001_initial_schema.sql`:

```sql
-- Sessions table
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  language text not null check (language in ('english', 'german', 'hindi')),
  mode text not null check (mode in ('speaking_part1', 'speaking_part2', 'speaking_part3', 'listening')),
  level text not null check (level in ('beginner', 'intermediate', 'advanced')),
  voice_type text not null check (voice_type in ('gemini', 'microsoft')),
  user_name text,
  device_info jsonb default '{}'::jsonb,
  duration_seconds integer,
  status text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  browser_fingerprint text
);

-- Transcripts table
create table public.transcripts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  role text not null check (role in ('user', 'tutor')),
  content text not null,
  created_at timestamptz not null default now(),
  sequence_number integer not null
);

create index idx_transcripts_session on public.transcripts(session_id, sequence_number);

-- Session scores table
create table public.session_scores (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  fluency numeric(3,1) check (fluency between 1.0 and 9.0),
  vocabulary numeric(3,1) check (vocabulary between 1.0 and 9.0),
  grammar numeric(3,1) check (grammar between 1.0 and 9.0),
  pronunciation numeric(3,1) check (pronunciation between 1.0 and 9.0),
  overall numeric(3,1) check (overall between 1.0 and 9.0),
  feedback_text text,
  strengths text[] default '{}',
  improvements text[] default '{}',
  suggested_next text
);

create unique index idx_scores_session on public.session_scores(session_id);

-- Audio recordings table
create table public.audio_recordings (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  storage_path text not null,
  duration_seconds integer,
  file_size_bytes integer,
  created_at timestamptz not null default now()
);

-- Enable RLS on all tables
alter table public.sessions enable row level security;
alter table public.transcripts enable row level security;
alter table public.session_scores enable row level security;
alter table public.audio_recordings enable row level security;

-- Service role can do everything (used by API routes)
create policy "Service role full access" on public.sessions
  for all using (auth.role() = 'service_role');
create policy "Service role full access" on public.transcripts
  for all using (auth.role() = 'service_role');
create policy "Service role full access" on public.session_scores
  for all using (auth.role() = 'service_role');
create policy "Service role full access" on public.audio_recordings
  for all using (auth.role() = 'service_role');

-- Anon role: insert sessions only (for creating sessions from browser via relay)
create policy "Anon can insert sessions" on public.sessions
  for insert with check (auth.role() = 'anon');

-- Create private storage bucket for audio
insert into storage.buckets (id, name, public)
  values ('audio-recordings', 'audio-recordings', false);
```

- [ ] **Step 2: Write TypeScript types for the database**

Write `src/lib/supabase/types.ts`:

```ts
export interface Session {
  id: string;
  started_at: string;
  ended_at: string | null;
  language: string;
  mode: string;
  level: string;
  voice_type: string;
  user_name: string | null;
  device_info: Record<string, unknown>;
  duration_seconds: number | null;
  status: string;
  browser_fingerprint: string | null;
}

export interface Transcript {
  id: string;
  session_id: string;
  role: "user" | "tutor";
  content: string;
  created_at: string;
  sequence_number: number;
}

export interface SessionScore {
  id: string;
  session_id: string;
  fluency: number;
  vocabulary: number;
  grammar: number;
  pronunciation: number;
  overall: number;
  feedback_text: string | null;
  strengths: string[];
  improvements: string[];
  suggested_next: string | null;
}

export interface AudioRecording {
  id: string;
  session_id: string;
  storage_path: string;
  duration_seconds: number | null;
  file_size_bytes: number | null;
  created_at: string;
}
```

- [ ] **Step 3: Write Supabase client utilities**

Write `src/lib/supabase/client.ts`:

```ts
import { createClient } from "@supabase/supabase-js";

export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

Write `src/lib/supabase/server.ts`:

```ts
import { createClient } from "@supabase/supabase-js";

export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add supabase/ src/lib/supabase/
git commit -m "feat: add Supabase schema migration and client utilities"
```

---

### Task 3: Tutor Prompts and IELTS Scoring

**Files:**
- Create: `src/lib/prompts/tutor.ts`
- Create: `src/lib/prompts/scoring.ts`
- Create: `src/lib/prompts/__tests__/tutor.test.ts`
- Create: `src/lib/prompts/__tests__/scoring.test.ts`

**Interfaces:**
- Consumes: `Language`, `Mode`, `Level` from `src/lib/constants.ts`
- Produces: `buildTutorPrompt(language, mode, level): string`, `buildScoringPrompt(transcript, mode): string`, `ScoreResult` type (parsed scoring response shape)

- [ ] **Step 1: Write test for tutor prompt builder**

```ts
// src/lib/prompts/__tests__/tutor.test.ts
import { describe, it, expect } from "vitest";
import { buildTutorPrompt } from "../tutor";

describe("buildTutorPrompt", () => {
  it("includes Bengali introduction instruction for Part 1", () => {
    const prompt = buildTutorPrompt("english", "speaking_part1", "beginner");
    expect(prompt).toContain("introduce yourself in Bengali");
    expect(prompt).toContain("ask the learner their name");
    expect(prompt).toContain("English");
  });

  it("includes cue card instruction for Part 2", () => {
    const prompt = buildTutorPrompt("german", "speaking_part2", "intermediate");
    expect(prompt).toContain("cue card");
    expect(prompt).toContain("1 minute");
    expect(prompt).toContain("German");
  });

  it("includes discussion depth for Part 3", () => {
    const prompt = buildTutorPrompt("hindi", "speaking_part3", "advanced");
    expect(prompt).toContain("challenge");
    expect(prompt).toContain("elaborate");
  });

  it("includes listening comprehension for listening mode", () => {
    const prompt = buildTutorPrompt("english", "listening", "beginner");
    expect(prompt).toContain("passage");
    expect(prompt).toContain("comprehension");
  });
});
```

- [ ] **Step 2: Install vitest and run test to verify it fails**

```bash
npm install -D vitest @vitejs/plugin-react
```

Add to `package.json` scripts: `"test": "vitest run", "test:watch": "vitest"`

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

Run: `npm test -- src/lib/prompts/__tests__/tutor.test.ts`

Expected: FAIL (module not found)

- [ ] **Step 3: Implement tutor prompt builder**

Write `src/lib/prompts/tutor.ts`:

```ts
import type { Language, Mode, Level } from "@/lib/constants";

const LANG_DISPLAY: Record<Language, string> = {
  english: "English",
  german: "German",
  hindi: "Hindi",
};

function basePersona(lang: string): string {
  return `You are a friendly, patient, and encouraging IELTS tutor helping a Bengali (Bangla) speaker practice ${lang}.

CORE RULES:
1. The student's native language is Bengali. Use Bengali for explanations, clarifications, and encouragement.
2. You are helping them practice ${lang} for the IELTS exam.
3. Always be encouraging. Celebrate good answers. Gently correct mistakes with the correct form.
4. Speak clearly and at an appropriate pace for the student's level.
5. Wait for the student's response before continuing.
6. Keep focus on one point at a time.
7. At the very start of the session, introduce yourself in Bengali and ask the learner their name in a warm, natural way. For example: "Assalamu Alaikum! Ami Priya, apnar IELTS practice tutor. Apnar nam ki?"
8. After learning their name, transition to the target language for practice.
9. If the student seems confused, switch to Bengali to explain, then return to ${lang}.`;
}

const MODE_PROMPTS: Record<Mode, Record<Level, (lang: string) => string>> = {
  speaking_part1: {
    beginner: (lang) => `
IELTS SPEAKING PART 1: Interview
LEVEL: Beginner

STRUCTURE:
- After your Bengali introduction and name exchange, begin the interview in ${lang}.
- Ask 4-5 simple questions about familiar topics: home, family, daily routine, hobbies, food.
- Keep questions short and clear. Use simple vocabulary.
- If the student struggles, offer a Bengali hint, then let them try again in ${lang}.
- After each answer, give brief positive feedback and move to the next question.
- End after about 4-5 minutes with encouraging closing remarks in Bengali.

QUESTION STYLE: "Where do you live?", "Do you have any brothers or sisters?", "What do you like to eat?"`,

    intermediate: (lang) => `
IELTS SPEAKING PART 1: Interview
LEVEL: Intermediate

STRUCTURE:
- After your Bengali introduction, conduct the interview in ${lang}.
- Ask 5-6 questions on topics like work/studies, travel, technology, health, neighborhood.
- Use natural question forms including "How often...", "What kind of...", "Would you say...".
- Expect fuller answers. If an answer is too brief, prompt: "Can you tell me more about that?"
- Correct one error per answer naturally by rephrasing, then move on.
- End after 4-5 minutes. Summarize one strength in Bengali.

QUESTION STYLE: "How has your neighborhood changed over the years?", "What kind of music do you enjoy and why?"`,

    advanced: (lang) => `
IELTS SPEAKING PART 1: Interview
LEVEL: Advanced

STRUCTURE:
- Brief Bengali introduction, then conduct entirely in ${lang} at natural speed.
- Ask 5-6 nuanced questions on topics like media, environment, education philosophy, cultural change.
- Expect extended, well-structured answers with examples and opinions.
- Only correct errors that affect clarity or would lower an IELTS score.
- Push for specificity: "You mentioned X, can you give a concrete example?"
- End after 4-5 minutes.

QUESTION STYLE: "To what extent do you think social media has changed the way people communicate?", "How important is it to preserve traditional customs in a rapidly modernizing society?"`,
  },

  speaking_part2: {
    beginner: (lang) => `
IELTS SPEAKING PART 2: Cue Card (Long Turn)
LEVEL: Beginner

STRUCTURE:
- Present a simple topic card. Say: "I will give you a topic. You have 1 minute to think, then speak for 1-2 minutes."
- Read the topic and bullet points aloud slowly in ${lang}, then briefly in Bengali.
- Say "Your preparation time starts now" and wait silently for 60 seconds.
- After 60 seconds, say "Please begin."
- Let them speak. Do not interrupt.
- If they stop too early (under 30 seconds), encourage: "Can you tell me anything more?"
- After they finish, ask 1 simple follow-up question.

TOPIC EXAMPLES:
"Describe a friend you like spending time with. You should say: who this person is, how you met, what you do together, and explain why you enjoy their company."`,

    intermediate: (lang) => `
IELTS SPEAKING PART 2: Cue Card (Long Turn)
LEVEL: Intermediate

STRUCTURE:
- Present a moderately complex topic card in ${lang}.
- Say: "Here is your topic. You have 1 minute to prepare, then please speak for 1-2 minutes."
- Read the topic and bullet points clearly.
- Wait 60 seconds silently.
- Say "You may begin now."
- Let them speak without interruption for up to 2 minutes.
- Ask 1-2 follow-up questions that probe deeper into their answer.

TOPIC EXAMPLES:
"Describe a skill you learned that you found difficult at first. You should say: what the skill was, when you started learning it, how you learned it, and explain how you felt when you finally mastered it."`,

    advanced: (lang) => `
IELTS SPEAKING PART 2: Cue Card (Long Turn)
LEVEL: Advanced

STRUCTURE:
- Present a complex, abstract topic card in ${lang}.
- Allow 1 minute preparation, then expect 2 full minutes of fluent speech.
- After they finish, ask 2 probing follow-up questions that test analytical thinking.
- Assess their ability to structure a coherent monologue with introduction, body, and conclusion.

TOPIC EXAMPLES:
"Describe a decision you made that significantly changed the course of your life. You should say: what the decision was, what alternatives you considered, how others reacted to your decision, and explain whether you would make the same decision again."`,
  },

  speaking_part3: {
    beginner: (lang) => `
IELTS SPEAKING PART 3: Discussion
LEVEL: Beginner

STRUCTURE:
- Ask 3-4 opinion questions in ${lang} related to everyday themes.
- Keep questions accessible: "Do you think... is good or bad?", "Why do some people...?"
- Accept short answers but encourage one reason: "Why do you think so?"
- Explain difficult words in Bengali if the student is confused.
- End after 4-5 minutes.

QUESTION STYLE: "Do you think children should learn to cook? Why or why not?"`,

    intermediate: (lang) => `
IELTS SPEAKING PART 3: Discussion
LEVEL: Intermediate

STRUCTURE:
- Ask 4-5 analytical questions in ${lang} on social or cultural themes.
- Questions should require comparison, speculation, or evaluation.
- If the student gives a one-sided view, challenge gently: "Some people would argue the opposite. What would you say to them?"
- Push for examples and elaboration: "Can you elaborate on that?"
- End after 4-5 minutes with a brief Bengali summary of what they did well.

QUESTION STYLE: "How has technology changed the way people in your country shop?", "Do you think governments should invest more in public transport or roads?"`,

    advanced: (lang) => `
IELTS SPEAKING PART 3: Discussion
LEVEL: Advanced

STRUCTURE:
- Ask 4-5 complex, abstract questions in ${lang} on global, philosophical, or policy themes.
- Expect nuanced, multi-perspective answers with hedging language ("It could be argued that...").
- Challenge their positions respectfully: "That is an interesting point. But how would you respond to the criticism that...?"
- Push for coherence and logical structure across their extended responses.
- Only use Bengali for particularly subtle feedback.
- End after 4-5 minutes.

QUESTION STYLE: "To what extent should individual freedoms be limited for the collective good of society?", "Some argue that globalization erodes cultural identity. Do you agree?"`,
  },

  listening: {
    beginner: (lang) => `
IELTS LISTENING PRACTICE
LEVEL: Beginner

STRUCTURE:
- Tell the student in Bengali: "Ami ekta chhoto golpo bolbo ${lang}-e. Dhore shunben, tarpor ami proshno korbo."
- Read a short, simple passage in ${lang} (5-6 sentences about a daily routine, a place, or an event). Speak slowly and clearly.
- After reading, ask 3 simple comprehension questions in ${lang}.
- If the student answers in Bengali, accept it but ask them to try in ${lang}.
- Give the correct answer if they get it wrong, then move to the next question.
- At the end, read the passage one more time.

PASSAGE STYLE: "Yesterday, Maria went to the market. She bought three apples and some rice. The market was very busy. She met her friend Rina there. They had tea together at a small shop."`,

    intermediate: (lang) => `
IELTS LISTENING PRACTICE
LEVEL: Intermediate

STRUCTURE:
- Brief Bengali introduction, then read a moderate passage in ${lang} (8-10 sentences, could be a news report, a conversation, or a description).
- Speak at moderate pace with natural intonation.
- Ask 4-5 comprehension questions covering main idea, specific details, and speaker intent.
- Expect answers in ${lang}. Ask "Can you put that in ${lang}?" if they respond in Bengali.
- After answering, provide feedback on both comprehension and language.
- Offer to read the passage again if requested.`,

    advanced: (lang) => `
IELTS LISTENING PRACTICE
LEVEL: Advanced

STRUCTURE:
- Read an extended passage in ${lang} at natural speed (academic lecture style, 12-15 sentences). Include complex vocabulary and nuanced arguments.
- Ask 5 comprehension questions ranging from factual recall to inference and opinion.
- All interaction in ${lang}. Bengali only for complex feedback.
- Expect precise, well-formed answers.
- Discuss any misunderstandings by referencing specific parts of the passage.
- Do not offer to re-read unless asked.`,
  },
};

export function buildTutorPrompt(
  language: Language,
  mode: Mode,
  level: Level,
): string {
  const lang = LANG_DISPLAY[language];
  const base = basePersona(lang);
  const modePrompt = MODE_PROMPTS[mode][level](lang);
  return base + "\n" + modePrompt;
}
```

- [ ] **Step 4: Run tutor prompt tests**

Run: `npm test -- src/lib/prompts/__tests__/tutor.test.ts`

Expected: All 4 tests PASS.

- [ ] **Step 5: Write test for scoring prompt builder**

```ts
// src/lib/prompts/__tests__/scoring.test.ts
import { describe, it, expect } from "vitest";
import { buildScoringPrompt, parseScoringResponse } from "../scoring";

describe("buildScoringPrompt", () => {
  it("includes IELTS band descriptors", () => {
    const prompt = buildScoringPrompt(
      [
        { role: "tutor", content: "Where do you live?" },
        { role: "user", content: "I live in Dhaka city." },
      ],
      "speaking_part1",
    );
    expect(prompt).toContain("Fluency and Coherence");
    expect(prompt).toContain("Lexical Resource");
    expect(prompt).toContain("1-9");
    expect(prompt).toContain("I live in Dhaka city.");
  });
});

describe("parseScoringResponse", () => {
  it("parses valid JSON response", () => {
    const raw = JSON.stringify({
      fluency: 6.0,
      vocabulary: 5.5,
      grammar: 6.0,
      pronunciation: 5.0,
      overall: 5.5,
      feedback: "Good attempt with clear basic answers.",
      strengths: ["Clear pronunciation of simple words", "Good eye contact cues"],
      improvements: ["Expand vocabulary range", "Use more complex sentences"],
      suggested_next: "speaking_part2",
    });
    const result = parseScoringResponse(raw);
    expect(result.overall).toBe(5.5);
    expect(result.strengths).toHaveLength(2);
    expect(result.improvements).toHaveLength(2);
  });

  it("returns fallback on invalid JSON", () => {
    const result = parseScoringResponse("not json");
    expect(result.overall).toBe(0);
    expect(result.feedback).toContain("unable");
  });
});
```

- [ ] **Step 6: Implement scoring prompt builder**

Write `src/lib/prompts/scoring.ts`:

```ts
export interface TranscriptLine {
  role: "user" | "tutor";
  content: string;
}

export interface ScoreResult {
  fluency: number;
  vocabulary: number;
  grammar: number;
  pronunciation: number;
  overall: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  suggested_next: string | null;
}

export function buildScoringPrompt(
  transcript: TranscriptLine[],
  mode: string,
): string {
  const formatted = transcript
    .map((t) => `${t.role === "tutor" ? "Examiner" : "Candidate"}: ${t.content}`)
    .join("\n");

  return `You are an experienced IELTS examiner scoring a ${mode.replace("_", " ")} practice session.

TRANSCRIPT:
${formatted}

Score this candidate on the official IELTS band descriptors (1-9 scale, half bands allowed):

1. Fluency and Coherence: How smoothly and logically do they speak? Do they use connectors? Any hesitation or repetition?
2. Lexical Resource: Range and accuracy of vocabulary. Do they paraphrase? Any word-choice errors?
3. Grammatical Range and Accuracy: Variety of sentence structures. Error frequency. Simple vs complex forms.
4. Pronunciation: Clarity, intonation, stress patterns. (Estimate from transcript word choice and phrasing patterns.)

Provide your assessment as JSON with exactly this structure:
{
  "fluency": <number 1.0-9.0>,
  "vocabulary": <number 1.0-9.0>,
  "grammar": <number 1.0-9.0>,
  "pronunciation": <number 1.0-9.0>,
  "overall": <number 1.0-9.0>,
  "feedback": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<area 1>", "<area 2>"],
  "suggested_next": "<one of: speaking_part1, speaking_part2, speaking_part3, listening>"
}

Respond ONLY with the JSON object. No other text.`;
}

export function parseScoringResponse(raw: string): ScoreResult {
  try {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return {
      fluency: Number(parsed.fluency) || 0,
      vocabulary: Number(parsed.vocabulary) || 0,
      grammar: Number(parsed.grammar) || 0,
      pronunciation: Number(parsed.pronunciation) || 0,
      overall: Number(parsed.overall) || 0,
      feedback: String(parsed.feedback || ""),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements.map(String) : [],
      suggested_next: parsed.suggested_next ? String(parsed.suggested_next) : null,
    };
  } catch {
    return {
      fluency: 0,
      vocabulary: 0,
      grammar: 0,
      pronunciation: 0,
      overall: 0,
      feedback: "Scoring was unable to complete. Please try another session.",
      strengths: [],
      improvements: [],
      suggested_next: null,
    };
  }
}
```

- [ ] **Step 7: Run all prompt tests**

Run: `npm test -- src/lib/prompts/`

Expected: All tests PASS.

- [ ] **Step 8: Commit**

```bash
git add src/lib/prompts/ vitest.config.ts
git commit -m "feat: add IELTS tutor prompt builder and scoring with tests"
```

---

### Task 4: WebSocket Relay Server

**Files:**
- Create: `relay/package.json`
- Create: `relay/tsconfig.json`
- Create: `relay/src/index.ts`
- Create: `relay/src/gemini-session.ts`
- Create: `relay/src/supabase.ts`
- Create: `relay/Dockerfile`
- Create: `relay/.env.example`

**Interfaces:**
- Consumes: Gemini Live API WebSocket endpoint, Supabase service client, tutor prompts
- Produces: WebSocket server on configurable port accepting browser connections. Protocol:
  - Browser sends: `{ type: "config", sessionId, language, mode, level }` then `{ type: "audio", data: "<base64 PCM>" }` then `{ type: "end" }`
  - Relay sends: `{ type: "ready" }`, `{ type: "audio", data: "<base64 PCM>" }`, `{ type: "transcript", role, content }`, `{ type: "error", message }`

- [ ] **Step 1: Initialize relay package**

Write `relay/package.json`:

```json
{
  "name": "bhasha-shikhi-relay",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "ws": "^8.18.0",
    "@supabase/supabase-js": "^2.49.0",
    "dotenv": "^16.4.0"
  },
  "devDependencies": {
    "tsx": "^4.19.0",
    "typescript": "^5.7.0",
    "@types/ws": "^8.5.0",
    "@types/node": "^22.0.0"
  }
}
```

Write `relay/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node16",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true
  },
  "include": ["src"]
}
```

```bash
cd relay && npm install && cd ..
```

- [ ] **Step 2: Write Supabase helper for the relay**

Write `relay/src/supabase.ts`:

```ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function insertTranscript(
  sessionId: string,
  role: "user" | "tutor",
  content: string,
  sequenceNumber: number,
): Promise<void> {
  await supabase.from("transcripts").insert({
    session_id: sessionId,
    role,
    content,
    sequence_number: sequenceNumber,
  });
}

export async function updateSessionUserName(
  sessionId: string,
  userName: string,
): Promise<void> {
  await supabase
    .from("sessions")
    .update({ user_name: userName })
    .eq("id", sessionId);
}
```

- [ ] **Step 3: Write Gemini Live session manager**

Write `relay/src/gemini-session.ts`:

```ts
import WebSocket from "ws";

const GEMINI_WS_URL =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent";

export interface GeminiSessionConfig {
  apiKey: string;
  model: string;
  systemPrompt: string;
  voiceName: string;
  onAudio: (base64Audio: string) => void;
  onTranscript: (role: "user" | "tutor", text: string) => void;
  onError: (error: string) => void;
  onClose: () => void;
}

export class GeminiLiveSession {
  private ws: WebSocket | null = null;
  private config: GeminiSessionConfig;

  constructor(config: GeminiSessionConfig) {
    this.config = config;
  }

  connect(): void {
    const url = `${GEMINI_WS_URL}?key=${this.config.apiKey}`;
    this.ws = new WebSocket(url);

    this.ws.on("open", () => {
      this.sendSetup();
    });

    this.ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        this.handleMessage(msg);
      } catch {
        // ignore unparseable messages
      }
    });

    this.ws.on("error", (err) => {
      this.config.onError(err.message);
    });

    this.ws.on("close", () => {
      this.config.onClose();
    });
  }

  private sendSetup(): void {
    const setup = {
      setup: {
        model: `models/${this.config.model}`,
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: this.config.voiceName,
              },
            },
          },
        },
        systemInstruction: {
          parts: [{ text: this.config.systemPrompt }],
        },
      },
    };
    this.ws?.send(JSON.stringify(setup));
  }

  sendAudio(base64Pcm: string): void {
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    const msg = {
      realtimeInput: {
        mediaChunks: [
          {
            mimeType: "audio/pcm;rate=16000",
            data: base64Pcm,
          },
        ],
      },
    };
    this.ws.send(JSON.stringify(msg));
  }

  private handleMessage(msg: Record<string, unknown>): void {
    const serverContent = msg.serverContent as Record<string, unknown> | undefined;
    if (!serverContent) return;

    const modelTurn = serverContent.modelTurn as Record<string, unknown> | undefined;
    if (modelTurn?.parts && Array.isArray(modelTurn.parts)) {
      for (const part of modelTurn.parts) {
        const p = part as Record<string, unknown>;
        if (p.inlineData) {
          const inlineData = p.inlineData as { data?: string };
          if (inlineData.data) {
            this.config.onAudio(inlineData.data);
          }
        }
        if (typeof p.text === "string" && p.text.trim()) {
          this.config.onTranscript("tutor", p.text.trim());
        }
      }
    }

    const inputTranscript = serverContent.inputTranscript as string | undefined;
    if (inputTranscript?.trim()) {
      this.config.onTranscript("user", inputTranscript.trim());
    }
  }

  close(): void {
    this.ws?.close();
    this.ws = null;
  }
}
```

- [ ] **Step 4: Write the relay server entry point**

Write `relay/src/index.ts`:

```ts
import "dotenv/config";
import { WebSocketServer, WebSocket } from "ws";
import http from "node:http";
import { GeminiLiveSession } from "./gemini-session.js";
import { insertTranscript, updateSessionUserName } from "./supabase.js";

const PORT = parseInt(process.env.PORT || "8081", 10);
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",");
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-preview-native-audio-dialog";
const GEMINI_VOICE = process.env.GEMINI_VOICE || "Kore";

// Tutor prompts are duplicated here to keep the relay self-contained.
// In production, these would be fetched from a shared config.
import { buildTutorPrompt } from "./prompts.js";

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  const origin = req.headers.origin || "";
  if (!ALLOWED_ORIGINS.some((o) => origin.startsWith(o))) {
    ws.close(4003, "Origin not allowed");
    return;
  }

  let gemini: GeminiLiveSession | null = null;
  let sessionId: string | null = null;
  let transcriptSeq = 0;
  let nameExtracted = false;

  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      if (msg.type === "config") {
        sessionId = msg.sessionId;
        const prompt = buildTutorPrompt(msg.language, msg.mode, msg.level);

        gemini = new GeminiLiveSession({
          apiKey: GEMINI_API_KEY,
          model: GEMINI_MODEL,
          systemPrompt: prompt,
          voiceName: GEMINI_VOICE,
          onAudio: (data) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "audio", data }));
            }
          },
          onTranscript: (role, content) => {
            transcriptSeq++;
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "transcript", role, content }));
            }
            if (sessionId) {
              insertTranscript(sessionId, role, content, transcriptSeq);

              if (!nameExtracted && role === "user" && transcriptSeq <= 5) {
                const nameMatch = content.match(
                  /(?:my name is|ami |amar nam )\s*(\S+)/i,
                );
                if (nameMatch) {
                  nameExtracted = true;
                  updateSessionUserName(sessionId, nameMatch[1]);
                }
              }
            }
          },
          onError: (message) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "error", message }));
            }
          },
          onClose: () => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "ended" }));
            }
          },
        });

        gemini.connect();
        ws.send(JSON.stringify({ type: "ready" }));
      } else if (msg.type === "audio" && gemini) {
        gemini.sendAudio(msg.data);
      } else if (msg.type === "end") {
        gemini?.close();
      }
    } catch {
      // ignore malformed messages
    }
  });

  ws.on("close", () => {
    gemini?.close();
  });
});

server.listen(PORT, () => {
  console.log(`Relay server listening on port ${PORT}`);
});
```

- [ ] **Step 5: Create a minimal prompts copy for the relay**

Write `relay/src/prompts.ts` (a simplified version that imports from a shared source would be ideal, but for deployment isolation we duplicate the builder):

```ts
type Language = "english" | "german" | "hindi";
type Mode = "speaking_part1" | "speaking_part2" | "speaking_part3" | "listening";
type Level = "beginner" | "intermediate" | "advanced";

const LANG_DISPLAY: Record<Language, string> = {
  english: "English",
  german: "German",
  hindi: "Hindi",
};

export function buildTutorPrompt(
  language: string,
  mode: string,
  level: string,
): string {
  const lang = LANG_DISPLAY[language as Language] || "English";
  return `You are a friendly, patient, and encouraging IELTS tutor helping a Bengali speaker practice ${lang}.

At the very start, introduce yourself in Bengali and ask the learner their name in a warm, natural way.
Then transition to ${lang} for the practice session.

Mode: ${mode.replace(/_/g, " ")}
Level: ${level}

Conduct an IELTS ${mode.replace(/_/g, " ")} practice session at the ${level} level.
Be encouraging, correct mistakes gently, and keep the session focused.
Use Bengali for explanations when the student seems confused.`;
}
```

Note: This is a simplified version. The full prompts from Task 3 can be shared via a build step later. For the initial deploy, this keeps the relay self-contained.

- [ ] **Step 6: Write Dockerfile for Railway**

Write `relay/Dockerfile`:

```dockerfile
FROM node:20-slim
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --production=false
COPY . .
RUN npm run build
RUN npm prune --production
EXPOSE 8081
CMD ["node", "dist/index.js"]
```

Write `relay/.env.example`:

```
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash-preview-native-audio-dialog
GEMINI_VOICE=Kore
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ALLOWED_ORIGINS=http://localhost:3000
PORT=8081
```

- [ ] **Step 7: Verify relay compiles**

```bash
cd relay && npx tsc --noEmit && cd ..
```

Expected: No errors.

- [ ] **Step 8: Commit**

```bash
git add relay/
git commit -m "feat: add WebSocket relay server for Gemini Live API"
```

---

### Task 5: Next.js API Routes

**Files:**
- Create: `src/app/api/session/route.ts`
- Create: `src/app/api/chat/route.ts`
- Create: `src/app/api/speech-token/route.ts`
- Create: `src/app/api/score/route.ts`
- Create: `src/app/api/upload-audio/route.ts`

**Interfaces:**
- Consumes: `createServerClient()` from Task 2, `buildScoringPrompt()` / `parseScoringResponse()` from Task 3, `@google/genai` SDK, Azure Speech SDK token API
- Produces:
  - `POST /api/session` -> `{ id: string }` (creates session)
  - `PATCH /api/session` -> `{ success: true }` (updates session status/end time)
  - `POST /api/chat` -> streaming text response from Gemini Flash
  - `GET /api/speech-token` -> `{ token: string, region: string }`
  - `POST /api/score` -> `ScoreResult` JSON
  - `POST /api/upload-audio` -> `{ path: string }`

- [ ] **Step 1: Write session API route**

Write `src/app/api/session/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { language, mode, level, voice_type, device_info, browser_fingerprint } = body;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("sessions")
    .insert({
      language,
      mode,
      level,
      voice_type,
      device_info: device_info || {},
      browser_fingerprint: browser_fingerprint || null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { sessionId, status, duration_seconds, user_name } = body;

  const supabase = createServerClient();
  const updates: Record<string, unknown> = { status };
  if (status === "completed" || status === "abandoned") {
    updates.ended_at = new Date().toISOString();
  }
  if (duration_seconds !== undefined) {
    updates.duration_seconds = duration_seconds;
  }
  if (user_name) {
    updates.user_name = user_name;
  }

  const { error } = await supabase
    .from("sessions")
    .update(updates)
    .eq("id", sessionId);

  if (error) {
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Write chat API route (Path B - Microsoft voice text pipeline)**

Write `src/app/api/chat/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createServerClient } from "@/lib/supabase/server";
import { buildTutorPrompt } from "@/lib/prompts/tutor";
import type { Language, Mode, Level } from "@/lib/constants";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    sessionId,
    message,
    history,
    language,
    mode,
    level,
  }: {
    sessionId: string;
    message: string;
    history: Array<{ role: string; content: string }>;
    language: Language;
    mode: Mode;
    level: Level;
  } = body;

  const systemPrompt = buildTutorPrompt(language, mode, level);

  const contents = history.map((h) => ({
    role: h.role === "user" ? ("user" as const) : ("model" as const),
    parts: [{ text: h.content }],
  }));

  contents.push({ role: "user", parts: [{ text: message }] });

  try {
    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const text = response.text || "";

    const supabase = createServerClient();

    const { data: maxSeq } = await supabase
      .from("transcripts")
      .select("sequence_number")
      .eq("session_id", sessionId)
      .order("sequence_number", { ascending: false })
      .limit(1)
      .single();

    const nextSeq = (maxSeq?.sequence_number || 0) + 1;

    await supabase.from("transcripts").insert([
      { session_id: sessionId, role: "user", content: message, sequence_number: nextSeq },
      { session_id: sessionId, role: "tutor", content: text, sequence_number: nextSeq + 1 },
    ]);

    return NextResponse.json({ response: text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 3: Write speech token API route**

Write `src/app/api/speech-token/route.ts`:

```ts
import { NextResponse } from "next/server";

export async function GET() {
  const speechKey = process.env.AZURE_SPEECH_KEY;
  const speechRegion = process.env.AZURE_SPEECH_REGION;

  if (!speechKey || !speechRegion) {
    return NextResponse.json(
      { error: "Speech service not configured" },
      { status: 500 },
    );
  }

  try {
    const tokenResponse = await fetch(
      `https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": speechKey,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    if (!tokenResponse.ok) {
      return NextResponse.json(
        { error: "Failed to get speech token" },
        { status: 502 },
      );
    }

    const token = await tokenResponse.text();

    return NextResponse.json({
      token,
      region: speechRegion,
    });
  } catch {
    return NextResponse.json(
      { error: "Speech service unavailable" },
      { status: 503 },
    );
  }
}
```

- [ ] **Step 4: Write scoring API route**

Write `src/app/api/score/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createServerClient } from "@/lib/supabase/server";
import {
  buildScoringPrompt,
  parseScoringResponse,
  type TranscriptLine,
} from "@/lib/prompts/scoring";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sessionId, mode }: { sessionId: string; mode: string } = body;

  const supabase = createServerClient();

  const { data: transcripts } = await supabase
    .from("transcripts")
    .select("role, content")
    .eq("session_id", sessionId)
    .order("sequence_number", { ascending: true });

  if (!transcripts || transcripts.length === 0) {
    return NextResponse.json(
      { error: "No transcript found for this session" },
      { status: 404 },
    );
  }

  const lines: TranscriptLine[] = transcripts.map((t) => ({
    role: t.role as "user" | "tutor",
    content: t.content,
  }));

  const prompt = buildScoringPrompt(lines, mode);

  try {
    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const raw = response.text || "";
    const scores = parseScoringResponse(raw);

    await supabase.from("session_scores").insert({
      session_id: sessionId,
      fluency: scores.fluency,
      vocabulary: scores.vocabulary,
      grammar: scores.grammar,
      pronunciation: scores.pronunciation,
      overall: scores.overall,
      feedback_text: scores.feedback,
      strengths: scores.strengths,
      improvements: scores.improvements,
      suggested_next: scores.suggested_next,
    });

    return NextResponse.json(scores);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scoring failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 5: Write audio upload API route**

Write `src/app/api/upload-audio/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("audio") as File | null;
  const sessionId = formData.get("sessionId") as string | null;

  if (!file || !sessionId) {
    return NextResponse.json(
      { error: "Missing audio file or sessionId" },
      { status: 400 },
    );
  }

  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File too large (max 50MB)" },
      { status: 413 },
    );
  }

  const allowedTypes = ["audio/webm", "audio/ogg", "audio/wav", "audio/mp4"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid audio format" },
      { status: 415 },
    );
  }

  const supabase = createServerClient();
  const path = `sessions/${sessionId}/${Date.now()}.webm`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("audio-recordings")
    .upload(path, buffer, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 },
    );
  }

  await supabase.from("audio_recordings").insert({
    session_id: sessionId,
    storage_path: path,
    file_size_bytes: file.size,
  });

  return NextResponse.json({ path });
}
```

- [ ] **Step 6: Verify all routes compile**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add src/app/api/
git commit -m "feat: add API routes for session, chat, speech-token, scoring, and audio upload"
```

---

### Task 6: Browser Voice Hooks

**Files:**
- Create: `src/hooks/use-gemini-live.ts`
- Create: `src/hooks/use-microsoft-speech.ts`
- Create: `src/hooks/use-audio-recorder.ts`
- Create: `src/hooks/use-session.ts`
- Create: `src/lib/audio/pcm-worklet.ts`
- Create: `public/pcm-processor.js`

**Interfaces:**
- Consumes: `NEXT_PUBLIC_WS_RELAY_URL` env var, `/api/speech-token` endpoint, `/api/chat` endpoint, `/api/session` endpoint, `SessionConfig` type
- Produces:
  - `useGeminiLive(sessionId, config)` -> `{ connect, disconnect, sendAudio, status, transcripts }`
  - `useMicrosoftSpeech(sessionId, config)` -> `{ start, stop, speak, status, transcripts }`
  - `useAudioRecorder()` -> `{ startRecording, stopRecording, getBlob }`
  - `useSession(config)` -> `{ sessionId, status, transcripts, startSession, endSession, agentState }`

- [ ] **Step 1: Write AudioWorklet processor for PCM capture**

Write `public/pcm-processor.js`:

```js
class PcmProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (input && input[0]) {
      const float32 = input[0];
      const int16 = new Int16Array(float32.length);
      for (let i = 0; i < float32.length; i++) {
        const s = Math.max(-1, Math.min(1, float32[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      this.port.postMessage(int16.buffer, [int16.buffer]);
    }
    return true;
  }
}

registerProcessor("pcm-processor", PcmProcessor);
```

- [ ] **Step 2: Write Gemini Live hook**

Write `src/hooks/use-gemini-live.ts`:

```ts
"use client";

import { useCallback, useRef, useState } from "react";
import type { SessionConfig } from "@/lib/constants";

export interface TranscriptEntry {
  role: "user" | "tutor";
  content: string;
  timestamp: number;
}

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";
type AgentState = "idle" | "listening" | "speaking";

export function useGeminiLive(sessionId: string | null, config: SessionConfig) {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [agentState, setAgentState] = useState<AgentState>("idle");
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const playBufferRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);

  const playAudioChunk = useCallback((base64: string) => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const raw = atob(base64);
    const int16 = new Int16Array(raw.length / 2);
    for (let i = 0; i < int16.length; i++) {
      int16[i] = raw.charCodeAt(i * 2) | (raw.charCodeAt(i * 2 + 1) << 8);
    }
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768;
    }
    playBufferRef.current.push(float32);

    if (!isPlayingRef.current) {
      isPlayingRef.current = true;
      setAgentState("speaking");
      drainPlayBuffer(ctx);
    }
  }, []);

  const drainPlayBuffer = useCallback((ctx: AudioContext) => {
    const chunk = playBufferRef.current.shift();
    if (!chunk) {
      isPlayingRef.current = false;
      setAgentState("listening");
      return;
    }
    const buffer = ctx.createBuffer(1, chunk.length, 24000);
    buffer.copyToChannel(chunk, 0);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => drainPlayBuffer(ctx);
    source.start();
  }, []);

  const connect = useCallback(async () => {
    if (!sessionId) return;
    setStatus("connecting");

    try {
      const ctx = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = ctx;

      await ctx.audioWorklet.addModule("/pcm-processor.js");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const source = ctx.createMediaStreamSource(stream);
      const worklet = new AudioWorkletNode(ctx, "pcm-processor");
      workletRef.current = worklet;
      source.connect(worklet);

      const wsUrl = process.env.NEXT_PUBLIC_WS_RELAY_URL!;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: "config",
            sessionId,
            language: config.language,
            mode: config.mode,
            level: config.level,
          }),
        );
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "ready") {
          setStatus("connected");
          setAgentState("listening");

          worklet.port.onmessage = (e) => {
            const buffer = e.data as ArrayBuffer;
            const base64 = btoa(
              String.fromCharCode(...new Uint8Array(buffer)),
            );
            ws.send(JSON.stringify({ type: "audio", data: base64 }));
          };
        } else if (msg.type === "audio") {
          playAudioChunk(msg.data);
        } else if (msg.type === "transcript") {
          setTranscripts((prev) => [
            ...prev,
            { role: msg.role, content: msg.content, timestamp: Date.now() },
          ]);
        } else if (msg.type === "error") {
          setStatus("error");
        }
      };

      ws.onerror = () => setStatus("error");
      ws.onclose = () => setStatus("disconnected");
    } catch {
      setStatus("error");
    }
  }, [sessionId, config, playAudioChunk]);

  const disconnect = useCallback(() => {
    wsRef.current?.send(JSON.stringify({ type: "end" }));
    wsRef.current?.close();
    workletRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioContextRef.current?.close();
    setStatus("disconnected");
    setAgentState("idle");
  }, []);

  return { connect, disconnect, status, agentState, transcripts };
}
```

- [ ] **Step 3: Write Microsoft Speech hook**

Write `src/hooks/use-microsoft-speech.ts`:

```ts
"use client";

import { useCallback, useRef, useState } from "react";
import type { SessionConfig } from "@/lib/constants";
import type { TranscriptEntry } from "./use-gemini-live";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";
type AgentState = "idle" | "listening" | "speaking" | "thinking";

export function useMicrosoftSpeech(
  sessionId: string | null,
  config: SessionConfig,
) {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [agentState, setAgentState] = useState<AgentState>("idle");
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const recognizerRef = useRef<SpeechSDK.SpeechRecognizer | null>(null);
  const synthesizerRef = useRef<SpeechSDK.SpeechSynthesizer | null>(null);
  const historyRef = useRef<Array<{ role: string; content: string }>>([]);

  // Dynamically import the SDK to avoid SSR issues
  const getSpeechSDK = useCallback(async () => {
    const sdk = await import("microsoft-cognitiveservices-speech-sdk");
    return sdk;
  }, []);

  const start = useCallback(async () => {
    if (!sessionId) return;
    setStatus("connecting");

    try {
      const res = await fetch("/api/speech-token");
      const { token, region } = await res.json();

      const SpeechSDK = await getSpeechSDK();

      const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(
        token,
        region,
      );
      speechConfig.speechRecognitionLanguage = getRecognitionLanguage(config.language);

      const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
      recognizerRef.current = recognizer;

      const synthConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(
        token,
        region,
      );
      synthConfig.speechSynthesisVoiceName = "bn-BD-NabanitaNeural";
      const synthesizer = new SpeechSDK.SpeechSynthesizer(synthConfig);
      synthesizerRef.current = synthesizer;

      recognizer.recognized = async (_s, e) => {
        if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
          const userText = e.result.text;
          if (!userText.trim()) return;

          setTranscripts((prev) => [
            ...prev,
            { role: "user", content: userText, timestamp: Date.now() },
          ]);

          setAgentState("thinking");

          historyRef.current.push({ role: "user", content: userText });

          const chatRes = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              message: userText,
              history: historyRef.current,
              language: config.language,
              mode: config.mode,
              level: config.level,
            }),
          });

          const { response: tutorText } = await chatRes.json();
          historyRef.current.push({ role: "tutor", content: tutorText });

          setTranscripts((prev) => [
            ...prev,
            { role: "tutor", content: tutorText, timestamp: Date.now() },
          ]);

          setAgentState("speaking");
          synthesizer.speakTextAsync(
            tutorText,
            () => setAgentState("listening"),
            () => setAgentState("listening"),
          );
        }
      };

      recognizer.startContinuousRecognitionAsync(
        () => {
          setStatus("connected");
          setAgentState("listening");
        },
        () => setStatus("error"),
      );
    } catch {
      setStatus("error");
    }
  }, [sessionId, config, getSpeechSDK]);

  const stop = useCallback(() => {
    recognizerRef.current?.stopContinuousRecognitionAsync();
    recognizerRef.current?.close();
    synthesizerRef.current?.close();
    setStatus("disconnected");
    setAgentState("idle");
  }, []);

  return { start, stop, status, agentState, transcripts };
}

function getRecognitionLanguage(lang: string): string {
  switch (lang) {
    case "german": return "de-DE";
    case "hindi": return "hi-IN";
    default: return "en-US";
  }
}

type SpeechSDK = typeof import("microsoft-cognitiveservices-speech-sdk");
```

- [ ] **Step 4: Write audio recorder hook**

Write `src/hooks/use-audio-recorder.ts`:

```ts
"use client";

import { useCallback, useRef, useState } from "react";

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    recorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.start(1000);
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback((): Promise<Blob> => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current;
      if (!recorder) {
        resolve(new Blob());
        return;
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        recorder.stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        resolve(blob);
      };

      recorder.stop();
    });
  }, []);

  return { isRecording, startRecording, stopRecording };
}
```

- [ ] **Step 5: Write unified session hook**

Write `src/hooks/use-session.ts`:

```ts
"use client";

import { useCallback, useState } from "react";
import { useGeminiLive, type TranscriptEntry } from "./use-gemini-live";
import { useMicrosoftSpeech } from "./use-microsoft-speech";
import { useAudioRecorder } from "./use-audio-recorder";
import type { SessionConfig } from "@/lib/constants";

type SessionStatus = "idle" | "connecting" | "active" | "ending" | "ended" | "error";

export function useSession(config: SessionConfig) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("idle");
  const [startTime, setStartTime] = useState<number>(0);

  const gemini = useGeminiLive(sessionId, config);
  const microsoft = useMicrosoftSpeech(sessionId, config);
  const recorder = useAudioRecorder();

  const isGemini = config.voice === "gemini";
  const voice = isGemini ? gemini : microsoft;

  const startSession = useCallback(async () => {
    setSessionStatus("connecting");

    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: config.language,
          mode: config.mode,
          level: config.level,
          voice_type: config.voice,
          device_info: {
            userAgent: navigator.userAgent,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            language: navigator.language,
          },
        }),
      });

      const { id } = await res.json();
      setSessionId(id);
      setStartTime(Date.now());

      await recorder.startRecording();

      if (isGemini) {
        // Need to wait for sessionId state update
        // The connect will be triggered by effect
      } else {
        // Microsoft path
      }

      setSessionStatus("active");
    } catch {
      setSessionStatus("error");
    }
  }, [config, isGemini, recorder]);

  const endSession = useCallback(async () => {
    if (!sessionId) return;
    setSessionStatus("ending");

    if (isGemini) {
      gemini.disconnect();
    } else {
      microsoft.stop();
    }

    const audioBlob = await recorder.stopRecording();
    const durationSeconds = Math.floor((Date.now() - startTime) / 1000);

    await fetch("/api/session", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        status: "completed",
        duration_seconds: durationSeconds,
      }),
    });

    if (audioBlob.size > 0) {
      const formData = new FormData();
      formData.append("audio", audioBlob, "session.webm");
      formData.append("sessionId", sessionId);
      await fetch("/api/upload-audio", { method: "POST", body: formData });
    }

    setSessionStatus("ended");

    return { sessionId, durationSeconds };
  }, [sessionId, isGemini, gemini, microsoft, recorder, startTime]);

  return {
    sessionId,
    sessionStatus,
    transcripts: voice.transcripts as TranscriptEntry[],
    agentState: voice.agentState,
    startSession,
    endSession,
    connectVoice: isGemini ? gemini.connect : microsoft.start,
  };
}
```

- [ ] **Step 6: Commit**

```bash
git add src/hooks/ public/pcm-processor.js
git commit -m "feat: add voice hooks for Gemini Live and Microsoft Speech pipelines"
```

---

### Task 7: Landing Page

**Files:**
- Create: `src/app/page.tsx` (overwrite placeholder)
- Create: `src/components/landing/hero.tsx`
- Create: `src/components/landing/features.tsx`

**Interfaces:**
- Consumes: Tailwind design tokens, constants for language names
- Produces: Landing page at `/` with hero, features section, and CTA linking to `/practice`

- [ ] **Step 1: Write hero component**

Write `src/components/landing/hero.tsx`:

```tsx
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-bengali text-lg text-brand-600 mb-2">
        ভাষাশিখি
      </p>
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-stone-900 max-w-3xl">
        Practice IELTS Speaking with Your Personal Tutor
      </h1>
      <p className="mt-6 text-lg md:text-xl text-stone-600 max-w-2xl">
        <span className="font-bengali">
          আপনার নিজস্ব টিউটরের সাথে IELTS স্পিকিং অনুশীলন করুন।
        </span>
      </p>
      <p className="mt-2 text-base text-stone-500 max-w-xl">
        Structured practice for Speaking Parts 1, 2, and 3. Instant scoring
        on the IELTS band scale. Available in English, German, and Hindi.
      </p>
      <Link
        href="/practice"
        className="mt-10 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-brand-700 active:bg-brand-800"
      >
        <span className="font-bengali">অনুশীলন শুরু করুন</span>
        <span className="text-brand-200">|</span>
        <span>Start Practicing</span>
      </Link>
    </section>
  );
}
```

- [ ] **Step 2: Write features component**

Write `src/components/landing/features.tsx`:

```tsx
const FEATURES = [
  {
    title: "Structured IELTS Practice",
    titlebn: "কাঠামোবদ্ধ IELTS অনুশীলন",
    description:
      "Practice all three speaking parts and listening comprehension with a format that mirrors the real exam.",
  },
  {
    title: "Instant Band Score Feedback",
    titlebn: "তাৎক্ষণিক ব্যান্ড স্কোর",
    description:
      "Get scored on Fluency, Vocabulary, Grammar, and Pronunciation after every session. Know exactly where you stand.",
  },
  {
    title: "Multiple Languages",
    titlebn: "একাধিক ভাষা",
    description:
      "Practice English, German, or Hindi. Your tutor speaks Bengali for explanations and guidance.",
  },
] as const;

export function Features() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-20">
      <div className="grid gap-8 md:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-stone-900">{f.title}</h3>
            <p className="font-bengali mt-1 text-sm text-brand-600">
              {f.titlebn}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              {f.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Assemble landing page**

Overwrite `src/app/page.tsx`:

```tsx
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <footer className="py-8 text-center text-sm text-stone-400">
        BhashaShikhi
      </footer>
    </main>
  );
}
```

- [ ] **Step 4: Verify in browser**

Run: `npm run dev`

Open http://localhost:3000. Verify: headline renders in both English and Bengali, three feature cards visible, CTA button links to /practice, responsive on mobile width.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/components/landing/
git commit -m "feat: add landing page with hero, features, and CTA"
```

---

### Task 8: Setup Screen

**Files:**
- Create: `src/app/practice/page.tsx`
- Create: `src/components/setup/language-selector.tsx`
- Create: `src/components/setup/mode-selector.tsx`
- Create: `src/components/setup/voice-selector.tsx`
- Create: `src/components/setup/level-selector.tsx`

**Interfaces:**
- Consumes: `LANGUAGES`, `MODES`, `LEVELS`, `VOICES`, `SessionConfig` from constants
- Produces: `/practice` page that collects `SessionConfig` and navigates to `/session?lang=X&mode=Y&level=Z&voice=W`

- [ ] **Step 1: Write selector components**

Write `src/components/setup/language-selector.tsx`:

```tsx
"use client";

import { LANGUAGES, type Language } from "@/lib/constants";

interface Props {
  value: Language;
  onChange: (v: Language) => void;
}

export function LanguageSelector({ value, onChange }: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-stone-800 mb-3">
        Choose Language
        <span className="font-bengali text-sm text-stone-500 ml-2">ভাষা নির্বাচন</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.id}
            onClick={() => onChange(lang.id)}
            className={`rounded-lg border-2 p-4 text-left transition-all ${
              value === lang.id
                ? "border-brand-500 bg-brand-50 shadow-sm"
                : "border-stone-200 bg-white hover:border-stone-300"
            }`}
          >
            <span className="text-2xl mr-2">{lang.flag}</span>
            <span className="font-semibold text-stone-800">{lang.name}</span>
            <span className="font-bengali block text-sm text-stone-500 mt-1">
              {lang.namebn}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

Write `src/components/setup/mode-selector.tsx`:

```tsx
"use client";

import { MODES, type Mode } from "@/lib/constants";

interface Props {
  value: Mode;
  onChange: (v: Mode) => void;
}

export function ModeSelector({ value, onChange }: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-stone-800 mb-3">
        Practice Mode
        <span className="font-bengali text-sm text-stone-500 ml-2">অনুশীলন মোড</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onChange(mode.id)}
            className={`rounded-lg border-2 p-4 text-left transition-all ${
              value === mode.id
                ? "border-brand-500 bg-brand-50 shadow-sm"
                : "border-stone-200 bg-white hover:border-stone-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-800">{mode.name}</span>
              <span className="text-xs text-stone-400">{mode.duration}</span>
            </div>
            <span className="font-bengali block text-sm text-stone-500 mt-1">
              {mode.namebn}
            </span>
            <p className="text-sm text-stone-600 mt-2">{mode.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
```

Write `src/components/setup/voice-selector.tsx`:

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
      <h2 className="text-lg font-semibold text-stone-800 mb-3">
        Your Tutor
        <span className="font-bengali text-sm text-stone-500 ml-2">আপনার টিউটর</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {VOICES.map((voice) => (
          <button
            key={voice.id}
            onClick={() => onChange(voice.id)}
            className={`rounded-lg border-2 p-4 text-left transition-all ${
              value === voice.id
                ? "border-brand-500 bg-brand-50 shadow-sm"
                : "border-stone-200 bg-white hover:border-stone-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-lg">
                {voice.name[0]}
              </div>
              <div>
                <span className="font-semibold text-stone-800">{voice.name}</span>
                <span className="font-bengali block text-sm text-stone-500">
                  {voice.namebn}
                </span>
              </div>
            </div>
            <p className="text-sm text-stone-600 mt-2">{voice.bio}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
```

Write `src/components/setup/level-selector.tsx`:

```tsx
"use client";

import { LEVELS, type Level } from "@/lib/constants";

interface Props {
  value: Level;
  onChange: (v: Level) => void;
}

export function LevelSelector({ value, onChange }: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-stone-800 mb-3">
        Your Level
        <span className="font-bengali text-sm text-stone-500 ml-2">আপনার স্তর</span>
      </h2>
      <div className="inline-flex rounded-lg border border-stone-200 bg-white p-1">
        {LEVELS.map((level) => (
          <button
            key={level.id}
            onClick={() => onChange(level.id)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
              value === level.id
                ? "bg-brand-600 text-white shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {level.name}
            <span className="font-bengali block text-xs opacity-80">
              {level.namebn}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write setup page**

Write `src/app/practice/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LanguageSelector } from "@/components/setup/language-selector";
import { ModeSelector } from "@/components/setup/mode-selector";
import { VoiceSelector } from "@/components/setup/voice-selector";
import { LevelSelector } from "@/components/setup/level-selector";
import type { Language, Mode, Level, VoiceType } from "@/lib/constants";

export default function PracticePage() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("english");
  const [mode, setMode] = useState<Mode>("speaking_part1");
  const [level, setLevel] = useState<Level>("beginner");
  const [voice, setVoice] = useState<VoiceType>("gemini");

  const handleStart = () => {
    const params = new URLSearchParams({
      lang: language,
      mode,
      level,
      voice,
    });
    router.push(`/session?${params.toString()}`);
  };

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-stone-900 mb-1">
          Set Up Your Practice
        </h1>
        <p className="font-bengali text-brand-600 mb-8">
          আপনার অনুশীলন সেট আপ করুন
        </p>

        <div className="space-y-8">
          <LanguageSelector value={language} onChange={setLanguage} />
          <ModeSelector value={mode} onChange={setMode} />
          <LevelSelector value={level} onChange={setLevel} />
          <VoiceSelector value={voice} onChange={setVoice} />
        </div>

        <button
          onClick={handleStart}
          className="mt-10 w-full rounded-lg bg-brand-600 py-4 text-lg font-semibold text-white transition-colors hover:bg-brand-700 active:bg-brand-800"
        >
          Begin Session
          <span className="font-bengali block text-sm text-brand-200">
            সেশন শুরু করুন
          </span>
        </button>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Verify in browser**

Open http://localhost:3000/practice. Verify: all four selectors render, selections highlight properly, "Begin Session" button navigates to /session with query params. Check mobile layout at 360px.

- [ ] **Step 4: Commit**

```bash
git add src/app/practice/ src/components/setup/
git commit -m "feat: add practice setup screen with language, mode, level, and voice selectors"
```

---

### Task 9: Session Screen

**Files:**
- Create: `src/app/session/page.tsx`
- Create: `src/components/session/transcript-view.tsx`
- Create: `src/components/session/waveform.tsx`
- Create: `src/components/session/mic-button.tsx`
- Create: `src/components/session/session-timer.tsx`
- Create: `src/components/session/cue-card.tsx`
- Create: `src/components/session/status-indicator.tsx`

**Interfaces:**
- Consumes: `useSession` hook from Task 6, query params from setup page
- Produces: `/session` page with live voice interaction, transcript display, and session management

- [ ] **Step 1: Write session UI components**

Write `src/components/session/transcript-view.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import type { TranscriptEntry } from "@/hooks/use-gemini-live";

interface Props {
  entries: TranscriptEntry[];
}

export function TranscriptView({ entries }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries.length]);

  if (entries.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-stone-400">
        <p className="font-bengali">কথোপকথন এখানে দেখা যাবে</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 overflow-y-auto p-4">
      {entries.map((entry, i) => (
        <div
          key={i}
          className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
              entry.role === "user"
                ? "bg-brand-600 text-white"
                : "bg-stone-100 text-stone-800"
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
```

Write `src/components/session/waveform.tsx`:

```tsx
"use client";

interface Props {
  active: boolean;
}

export function Waveform({ active }: Props) {
  return (
    <div className="flex items-center justify-center gap-[3px] h-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`w-[3px] rounded-full bg-brand-500 transition-all ${
            active ? "waveform-bar" : "h-1"
          }`}
          style={active ? { animationDelay: `${i * 0.1}s` } : undefined}
        />
      ))}
    </div>
  );
}
```

Write `src/components/session/mic-button.tsx`:

```tsx
"use client";

interface Props {
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function MicButton({ isActive, onClick, disabled }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`h-14 w-14 rounded-full flex items-center justify-center transition-all ${
        isActive
          ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25"
          : "bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/25"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      aria-label={isActive ? "Mute microphone" : "Unmute microphone"}
    >
      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        {isActive ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14a3 3 0 003-3V6a3 3 0 00-6 0v5a3 3 0 003 3zm5-3a5 5 0 01-10 0M12 19v3m-3 0h6" />
        ) : (
          <>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14a3 3 0 003-3V6a3 3 0 00-6 0v5a3 3 0 003 3z" />
            <line x1="3" y1="3" x2="21" y2="21" strokeLinecap="round" />
          </>
        )}
      </svg>
    </button>
  );
}
```

Write `src/components/session/session-timer.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

interface Props {
  startTime: number;
  isRunning: boolean;
}

export function SessionTimer({ startTime, isRunning }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isRunning || !startTime) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <span className="font-mono text-sm text-stone-500 tabular-nums">
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </span>
  );
}
```

Write `src/components/session/cue-card.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

interface Props {
  visible: boolean;
  onTimerEnd: () => void;
}

const SAMPLE_TOPICS = [
  {
    topic: "Describe a place you have visited that you found very beautiful.",
    points: [
      "Where the place is",
      "When you visited it",
      "What you did there",
      "Why you found it beautiful",
    ],
  },
  {
    topic: "Describe a skill you would like to learn in the future.",
    points: [
      "What the skill is",
      "Why you want to learn it",
      "How you would learn it",
      "How it would benefit you",
    ],
  },
];

export function CueCard({ visible, onTimerEnd }: Props) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [topic] = useState(
    () => SAMPLE_TOPICS[Math.floor(Math.random() * SAMPLE_TOPICS.length)],
  );

  useEffect(() => {
    if (!visible || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          onTimerEnd();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [visible, timeLeft, onTimerEnd]);

  if (!visible) return null;

  return (
    <div className="mx-4 rounded-lg border-2 border-amber-300 bg-amber-50 p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-amber-800 uppercase tracking-wide">
          Cue Card
        </span>
        <span
          className={`font-mono text-lg font-bold tabular-nums ${
            timeLeft <= 10 ? "text-red-600 animate-pulse" : "text-amber-700"
          }`}
        >
          {timeLeft}s
        </span>
      </div>
      <p className="text-stone-800 font-medium mb-3">{topic.topic}</p>
      <p className="text-sm text-stone-600 mb-2">You should say:</p>
      <ul className="space-y-1">
        {topic.points.map((point, i) => (
          <li key={i} className="text-sm text-stone-700 flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">-</span>
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

Write `src/components/session/status-indicator.tsx`:

```tsx
"use client";

interface Props {
  state: string;
}

const STATE_CONFIG: Record<string, { label: string; color: string }> = {
  idle: { label: "Ready", color: "bg-stone-400" },
  listening: { label: "Listening", color: "bg-brand-500" },
  thinking: { label: "Thinking", color: "bg-purple-500" },
  speaking: { label: "Speaking", color: "bg-accent-500" },
};

export function StatusIndicator({ state }: Props) {
  const config = STATE_CONFIG[state] || STATE_CONFIG.idle;

  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${config.color}`} />
      <span className="text-sm text-stone-500">{config.label}</span>
    </div>
  );
}
```

- [ ] **Step 2: Write session page**

Write `src/app/session/page.tsx`:

```tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSession } from "@/hooks/use-session";
import { TranscriptView } from "@/components/session/transcript-view";
import { Waveform } from "@/components/session/waveform";
import { MicButton } from "@/components/session/mic-button";
import { SessionTimer } from "@/components/session/session-timer";
import { CueCard } from "@/components/session/cue-card";
import { StatusIndicator } from "@/components/session/status-indicator";
import { VOICES, type SessionConfig, type Language, type Mode, type Level, type VoiceType } from "@/lib/constants";

function SessionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const config: SessionConfig = {
    language: (searchParams.get("lang") || "english") as Language,
    mode: (searchParams.get("mode") || "speaking_part1") as Mode,
    level: (searchParams.get("level") || "beginner") as Level,
    voice: (searchParams.get("voice") || "gemini") as VoiceType,
  };

  const {
    sessionId,
    sessionStatus,
    transcripts,
    agentState,
    startSession,
    endSession,
    connectVoice,
  } = useSession(config);

  const [micActive, setMicActive] = useState(true);
  const [startTime, setStartTime] = useState(0);
  const [showCueCard, setShowCueCard] = useState(config.mode === "speaking_part2");

  useEffect(() => {
    startSession().then(() => {
      setStartTime(Date.now());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (sessionId && sessionStatus === "active") {
      connectVoice();
    }
  }, [sessionId, sessionStatus, connectVoice]);

  const handleEnd = useCallback(async () => {
    const result = await endSession();
    if (result) {
      router.push(
        `/results?sessionId=${result.sessionId}&mode=${config.mode}`,
      );
    }
  }, [endSession, router, config.mode]);

  const handleCueCardEnd = useCallback(() => {
    setShowCueCard(false);
  }, []);

  const voiceName = VOICES.find((v) => v.id === config.voice)?.name || "Tutor";

  if (sessionStatus === "ending") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-stone-500">Ending session and preparing your results...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-sm font-bold">
            {voiceName[0]}
          </div>
          <span className="font-semibold text-stone-800">{voiceName}</span>
          <StatusIndicator state={agentState} />
        </div>
        <div className="flex items-center gap-4">
          <Waveform active={agentState === "speaking"} />
          <SessionTimer startTime={startTime} isRunning={sessionStatus === "active"} />
        </div>
      </header>

      {/* Cue card for Part 2 */}
      {config.mode === "speaking_part2" && (
        <div className="py-4">
          <CueCard visible={showCueCard} onTimerEnd={handleCueCardEnd} />
        </div>
      )}

      {/* Transcript area */}
      <div className="flex-1 overflow-y-auto">
        <TranscriptView entries={transcripts} />
      </div>

      {/* Bottom controls */}
      <footer className="border-t border-stone-200 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <MicButton
            isActive={micActive}
            onClick={() => setMicActive(!micActive)}
          />
          <button
            onClick={handleEnd}
            className="rounded-lg border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
          >
            End Session
          </button>
        </div>
      </footer>
    </main>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-stone-500">Loading session...</p>
      </main>
    }>
      <SessionContent />
    </Suspense>
  );
}
```

- [ ] **Step 3: Verify in browser**

Navigate to http://localhost:3000/practice, select options, click Begin Session. Verify: session page loads, top bar shows tutor name and timer, transcript area visible, mic button and end session button at bottom. Cue card shows for Part 2 mode.

Note: Voice connection will not work without Supabase and relay running, but the UI structure should render correctly.

- [ ] **Step 4: Commit**

```bash
git add src/app/session/ src/components/session/
git commit -m "feat: add session screen with transcript, waveform, mic button, and cue card"
```

---

### Task 10: Results Screen

**Files:**
- Create: `src/app/results/page.tsx`
- Create: `src/components/results/score-card.tsx`
- Create: `src/components/results/feedback-section.tsx`

**Interfaces:**
- Consumes: `/api/score` endpoint, `sessionId` and `mode` from query params
- Produces: `/results` page showing IELTS band scores, feedback, and action buttons

- [ ] **Step 1: Write score card component**

Write `src/components/results/score-card.tsx`:

```tsx
interface Props {
  label: string;
  score: number;
}

export function ScoreCard({ label, score }: Props) {
  const percentage = (score / 9) * 100;

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-stone-600">{label}</span>
        <span className="font-mono text-lg font-bold text-brand-700 tabular-nums">
          {score.toFixed(1)}
        </span>
      </div>
      <div className="h-2 rounded-full bg-stone-100">
        <div
          className="h-2 rounded-full bg-brand-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
```

Write `src/components/results/feedback-section.tsx`:

```tsx
interface Props {
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export function FeedbackSection({ feedback, strengths, improvements }: Props) {
  return (
    <div className="space-y-6">
      <p className="text-stone-700 leading-relaxed">{feedback}</p>

      {strengths.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-brand-700 uppercase tracking-wide mb-2">
            Strengths
          </h3>
          <ul className="space-y-1">
            {strengths.map((s, i) => (
              <li key={i} className="text-sm text-stone-600 flex items-start gap-2">
                <span className="text-brand-500 mt-0.5">+</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {improvements.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-accent-700 uppercase tracking-wide mb-2">
            Areas to Improve
          </h3>
          <ul className="space-y-1">
            {improvements.map((s, i) => (
              <li key={i} className="text-sm text-stone-600 flex items-start gap-2">
                <span className="text-accent-500 mt-0.5">-</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write results page**

Write `src/app/results/page.tsx`:

```tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { ScoreCard } from "@/components/results/score-card";
import { FeedbackSection } from "@/components/results/feedback-section";
import type { ScoreResult } from "@/lib/prompts/scoring";

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("sessionId");
  const mode = searchParams.get("mode") || "speaking_part1";

  const [scores, setScores] = useState<ScoreResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, mode }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setScores(data);
        }
      })
      .catch(() => setError("Failed to load scores"))
      .finally(() => setLoading(false));
  }, [sessionId, mode]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-stone-600">Evaluating your performance...</p>
          <p className="font-bengali text-sm text-stone-400 mt-1">
            আপনার পারফরম্যান্স মূল্যায়ন করা হচ্ছে
          </p>
        </div>
      </main>
    );
  }

  if (error || !scores) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <p className="text-stone-600">{error || "No scores available"}</p>
          <button
            onClick={() => router.push("/practice")}
            className="mt-4 rounded-lg bg-brand-600 px-6 py-2 text-white hover:bg-brand-700"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-stone-900 mb-1">Your Results</h1>
        <p className="font-bengali text-brand-600 mb-8">আপনার ফলাফল</p>

        {/* Overall score */}
        <div className="mb-8 rounded-xl border-2 border-brand-200 bg-brand-50 p-6 text-center">
          <p className="text-sm text-brand-600 uppercase tracking-wide">
            Overall Band Score
          </p>
          <p className="font-mono text-5xl font-bold text-brand-700 mt-2 tabular-nums">
            {scores.overall.toFixed(1)}
          </p>
        </div>

        {/* Individual scores */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <ScoreCard label="Fluency and Coherence" score={scores.fluency} />
          <ScoreCard label="Lexical Resource" score={scores.vocabulary} />
          <ScoreCard label="Grammar" score={scores.grammar} />
          <ScoreCard label="Pronunciation" score={scores.pronunciation} />
        </div>

        {/* Feedback */}
        <div className="rounded-lg border border-stone-200 bg-white p-6 mb-8">
          <FeedbackSection
            feedback={scores.feedback}
            strengths={scores.strengths}
            improvements={scores.improvements}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push("/practice")}
            className="flex-1 rounded-lg bg-brand-600 py-3 text-center font-semibold text-white hover:bg-brand-700"
          >
            Practice Again
          </button>
          <button
            onClick={() => router.push("/practice")}
            className="flex-1 rounded-lg border border-stone-300 bg-white py-3 text-center font-semibold text-stone-700 hover:bg-stone-50"
          >
            Try Different Mode
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-stone-500">Loading results...</p>
      </main>
    }>
      <ResultsContent />
    </Suspense>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/results/ src/components/results/
git commit -m "feat: add results screen with IELTS band scores and feedback"
```

---

### Task 11: Admin Panel

**Files:**
- Create: `src/app/panel/[slug]/layout.tsx`
- Create: `src/app/panel/[slug]/page.tsx`
- Create: `src/app/panel/[slug]/dashboard/page.tsx`
- Create: `src/app/panel/[slug]/sessions/page.tsx`
- Create: `src/app/panel/[slug]/sessions/[id]/page.tsx`
- Create: `src/app/api/admin/auth/route.ts`
- Create: `src/app/api/admin/dashboard/route.ts`
- Create: `src/app/api/admin/sessions/route.ts`
- Create: `src/components/admin/stats-card.tsx`
- Create: `src/components/admin/sessions-table.tsx`
- Create: `src/components/admin/transcript-viewer.tsx`

**Interfaces:**
- Consumes: `ADMIN_ROUTE_SLUG`, `ADMIN_PASSWORD_HASH` env vars, `createServerClient()`, Supabase queries
- Produces: Hidden admin panel with login, dashboard stats, session list with filters, and session detail with transcript and audio playback

- [ ] **Step 1: Write admin auth API route**

Write `src/app/api/admin/auth/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH!;
const COOKIE_NAME = "bhasha_admin";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  const valid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  if (!valid) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = Buffer.from(`admin:${Date.now()}`).toString("base64");

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Write admin API routes for data**

Write `src/app/api/admin/dashboard/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";

async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.has("bhasha_admin");
}

export async function GET(_req: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart = new Date(now.getTime() - 7 * 86400000).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { count: totalSessions },
    { count: todaySessions },
    { count: weekSessions },
    { count: monthSessions },
    { data: langDist },
    { data: modeDist },
    { data: voiceDist },
    { data: statusDist },
    { data: avgDuration },
  ] = await Promise.all([
    supabase.from("sessions").select("*", { count: "exact", head: true }),
    supabase.from("sessions").select("*", { count: "exact", head: true }).gte("started_at", todayStart),
    supabase.from("sessions").select("*", { count: "exact", head: true }).gte("started_at", weekStart),
    supabase.from("sessions").select("*", { count: "exact", head: true }).gte("started_at", monthStart),
    supabase.rpc("count_by_column", { col: "language", tbl: "sessions" }).catch(() => ({ data: [] })),
    supabase.rpc("count_by_column", { col: "mode", tbl: "sessions" }).catch(() => ({ data: [] })),
    supabase.rpc("count_by_column", { col: "voice_type", tbl: "sessions" }).catch(() => ({ data: [] })),
    supabase.rpc("count_by_column", { col: "status", tbl: "sessions" }).catch(() => ({ data: [] })),
    supabase.from("sessions").select("duration_seconds").not("duration_seconds", "is", null),
  ]);

  const avgDur = avgDuration && avgDuration.length > 0
    ? Math.round(avgDuration.reduce((s: number, r: { duration_seconds: number }) => s + r.duration_seconds, 0) / avgDuration.length)
    : 0;

  return NextResponse.json({
    total: totalSessions || 0,
    today: todaySessions || 0,
    week: weekSessions || 0,
    month: monthSessions || 0,
    avgDurationSeconds: avgDur,
    languageDistribution: langDist || [],
    modeDistribution: modeDist || [],
    voiceDistribution: voiceDist || [],
    statusDistribution: statusDist || [],
  });
}
```

Write `src/app/api/admin/sessions/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";

async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.has("bhasha_admin");
}

export async function GET(req: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("id");

  const supabase = createServerClient();

  if (sessionId) {
    const [
      { data: session },
      { data: transcripts },
      { data: scores },
      { data: recordings },
    ] = await Promise.all([
      supabase.from("sessions").select("*").eq("id", sessionId).single(),
      supabase.from("transcripts").select("*").eq("session_id", sessionId).order("sequence_number"),
      supabase.from("session_scores").select("*").eq("session_id", sessionId).single(),
      supabase.from("audio_recordings").select("*").eq("session_id", sessionId),
    ]);

    let audioUrl = null;
    if (recordings && recordings.length > 0) {
      const { data: signedUrl } = await supabase.storage
        .from("audio-recordings")
        .createSignedUrl(recordings[0].storage_path, 3600);
      audioUrl = signedUrl?.signedUrl || null;
    }

    return NextResponse.json({ session, transcripts, scores, audioUrl });
  }

  const language = searchParams.get("language");
  const mode = searchParams.get("mode");
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("sessions")
    .select("*, session_scores(overall)", { count: "exact" })
    .order("started_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (language) query = query.eq("language", language);
  if (mode) query = query.eq("mode", mode);
  if (status) query = query.eq("status", status);

  const { data, count } = await query;

  return NextResponse.json({
    sessions: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  });
}
```

- [ ] **Step 3: Write admin layout with slug check**

Write `src/app/panel/[slug]/layout.tsx`:

```tsx
import { notFound } from "next/navigation";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const expectedSlug = process.env.ADMIN_ROUTE_SLUG;

  if (!expectedSlug || slug !== expectedSlug) {
    notFound();
  }

  return <>{children}</>;
}
```

- [ ] **Step 4: Write admin login page**

Write `src/app/panel/[slug]/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push(`/panel/${params.slug}/dashboard`);
    } else {
      setError("Invalid password");
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-stone-900">Admin Access</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-lg border border-stone-300 px-4 py-3 text-stone-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Enter"}
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 5: Write admin dashboard page**

Write `src/components/admin/stats-card.tsx`:

```tsx
interface Props {
  label: string;
  value: string | number;
}

export function StatsCard({ label, value }: Props) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-stone-900 tabular-nums">{value}</p>
    </div>
  );
}
```

Write `src/app/panel/[slug]/dashboard/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { StatsCard } from "@/components/admin/stats-card";

interface DashboardData {
  total: number;
  today: number;
  week: number;
  month: number;
  avgDurationSeconds: number;
}

export default function DashboardPage() {
  const params = useParams();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-stone-500">Loading dashboard...</p>
      </main>
    );
  }

  const avgMin = Math.floor(data.avgDurationSeconds / 60);
  const avgSec = data.avgDurationSeconds % 60;

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
          <Link
            href={`/panel/${params.slug}/sessions`}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
          >
            View All Sessions
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard label="Total Sessions" value={data.total} />
          <StatsCard label="Today" value={data.today} />
          <StatsCard label="This Week" value={data.week} />
          <StatsCard label="Avg Duration" value={`${avgMin}m ${avgSec}s`} />
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 6: Write sessions list and detail pages**

Write `src/components/admin/sessions-table.tsx`:

```tsx
"use client";

import Link from "next/link";
import type { Session } from "@/lib/supabase/types";

interface Props {
  sessions: (Session & { session_scores?: Array<{ overall: number }> })[];
  slug: string;
}

export function SessionsTable({ sessions, slug }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-200 text-left text-stone-500">
            <th className="pb-2 pr-4">Date</th>
            <th className="pb-2 pr-4">User</th>
            <th className="pb-2 pr-4">Language</th>
            <th className="pb-2 pr-4">Mode</th>
            <th className="pb-2 pr-4">Voice</th>
            <th className="pb-2 pr-4">Duration</th>
            <th className="pb-2 pr-4">Score</th>
            <th className="pb-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s.id} className="border-b border-stone-100 hover:bg-stone-50">
              <td className="py-2 pr-4">
                <Link
                  href={`/panel/${slug}/sessions/${s.id}`}
                  className="text-brand-600 hover:underline"
                >
                  {new Date(s.started_at).toLocaleDateString()}
                </Link>
              </td>
              <td className="py-2 pr-4">{s.user_name || "Anonymous"}</td>
              <td className="py-2 pr-4 capitalize">{s.language}</td>
              <td className="py-2 pr-4">{s.mode.replace(/_/g, " ")}</td>
              <td className="py-2 pr-4 capitalize">{s.voice_type}</td>
              <td className="py-2 pr-4 font-mono tabular-nums">
                {s.duration_seconds ? `${Math.floor(s.duration_seconds / 60)}m` : "-"}
              </td>
              <td className="py-2 pr-4 font-mono tabular-nums">
                {s.session_scores?.[0]?.overall?.toFixed(1) || "-"}
              </td>
              <td className="py-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    s.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : s.status === "abandoned"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {s.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

Write `src/app/panel/[slug]/sessions/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SessionsTable } from "@/components/admin/sessions-table";

export default function SessionsListPage() {
  const params = useParams();
  const [sessions, setSessions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(`/api/admin/sessions?page=${page}`)
      .then((r) => r.json())
      .then((data) => {
        setSessions(data.sessions);
        setTotal(data.total);
      });
  }, [page]);

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-stone-900">Sessions ({total})</h1>
          <Link
            href={`/panel/${params.slug}/dashboard`}
            className="text-sm text-brand-600 hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <SessionsTable sessions={sessions} slug={params.slug as string} />
        </div>

        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm text-stone-500">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={sessions.length < 20}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
}
```

Write `src/components/admin/transcript-viewer.tsx`:

```tsx
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
```

Write `src/app/panel/[slug]/sessions/[id]/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { TranscriptViewer } from "@/components/admin/transcript-viewer";
import { ScoreCard } from "@/components/results/score-card";

export default function SessionDetailPage() {
  const params = useParams();
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch(`/api/admin/sessions?id=${params.id}`)
      .then((r) => r.json())
      .then(setData);
  }, [params.id]);

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-stone-500">Loading session...</p>
      </main>
    );
  }

  const session = data.session as Record<string, unknown>;
  const transcripts = (data.transcripts || []) as Array<Record<string, unknown>>;
  const scores = data.scores as Record<string, unknown> | null;
  const audioUrl = data.audioUrl as string | null;

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/panel/${params.slug}/sessions`}
          className="text-sm text-brand-600 hover:underline"
        >
          Back to Sessions
        </Link>

        <h1 className="text-2xl font-bold text-stone-900 mt-4 mb-6">
          Session Detail
        </h1>

        {/* Session metadata */}
        <div className="rounded-lg border border-stone-200 bg-white p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-stone-500">User</span>
              <p className="font-medium">{(session.user_name as string) || "Anonymous"}</p>
            </div>
            <div>
              <span className="text-stone-500">Language</span>
              <p className="font-medium capitalize">{session.language as string}</p>
            </div>
            <div>
              <span className="text-stone-500">Mode</span>
              <p className="font-medium">{(session.mode as string).replace(/_/g, " ")}</p>
            </div>
            <div>
              <span className="text-stone-500">Duration</span>
              <p className="font-medium font-mono">
                {session.duration_seconds
                  ? `${Math.floor(session.duration_seconds as number / 60)}m ${(session.duration_seconds as number) % 60}s`
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Scores */}
        {scores && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-stone-800 mb-3">Scores</h2>
            <div className="grid grid-cols-2 gap-3">
              <ScoreCard label="Fluency" score={scores.fluency as number} />
              <ScoreCard label="Vocabulary" score={scores.vocabulary as number} />
              <ScoreCard label="Grammar" score={scores.grammar as number} />
              <ScoreCard label="Pronunciation" score={scores.pronunciation as number} />
            </div>
          </div>
        )}

        {/* Audio */}
        {audioUrl && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-stone-800 mb-3">Recording</h2>
            <audio controls src={audioUrl} className="w-full" />
          </div>
        )}

        {/* Transcript */}
        <div>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">
            Transcript ({transcripts.length} messages)
          </h2>
          <div className="rounded-lg border border-stone-200 bg-white p-4">
            <TranscriptViewer transcripts={transcripts as never[]} />
          </div>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/app/panel/ src/app/api/admin/ src/components/admin/
git commit -m "feat: add hidden admin panel with dashboard, sessions list, and session detail"
```

---

### Task 12: Security Hardening, Error Boundary, and Deployment

**Files:**
- Create: `src/app/error.tsx`
- Create: `src/app/not-found.tsx`
- Modify: `src/app/layout.tsx` (clean meta tags)
- Create: `vercel.json`
- Create: `relay/railway.json`
- Modify: `next.config.ts` (final hardening)

**Interfaces:**
- Consumes: All previous tasks
- Produces: Production-ready deployment configuration for Vercel and Railway

- [ ] **Step 1: Write error boundary**

Write `src/app/error.tsx`:

```tsx
"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-stone-900 mb-2">
          Something went wrong
        </h1>
        <p className="font-bengali text-stone-600 mb-4">
          কিছু ভুল হয়েছে। আবার চেষ্টা করুন।
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-brand-600 px-6 py-2 text-white hover:bg-brand-700"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
```

Write `src/app/not-found.tsx`:

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-stone-900 mb-2">
          Page not found
        </h1>
        <p className="font-bengali text-stone-600 mb-4">
          এই পৃষ্ঠাটি পাওয়া যায়নি
        </p>
        <Link
          href="/"
          className="rounded-lg bg-brand-600 px-6 py-2 text-white hover:bg-brand-700"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Clean layout metadata for production**

Update `src/app/layout.tsx` to ensure no tech fingerprints:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BhashaShikhi - IELTS Practice",
  description: "Practice IELTS speaking and listening with a personal tutor. For Bengali speakers learning English, German, and Hindi.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "BhashaShikhi",
    description: "IELTS speaking practice with a personal tutor",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className={inter.variable}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="bg-surface-50 text-stone-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Create deployment configs**

Write `vercel.json`:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install"
}
```

Write `relay/railway.json`:

```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "node dist/index.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 5
  }
}
```

- [ ] **Step 4: Final type check and build test**

```bash
npx tsc --noEmit && npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add error boundaries, not-found page, and deployment configs"
```

- [ ] **Step 6: Generate admin password hash**

Run this to generate a bcrypt hash for the admin password:

```bash
node -e "const b=require('bcryptjs');b.hash('YOUR_ADMIN_PASSWORD',10).then(h=>console.log(h))"
```

Save the output as `ADMIN_PASSWORD_HASH` in Vercel env vars.

- [ ] **Step 7: Deploy to Vercel**

```bash
npx vercel --prod
```

Set all environment variables in the Vercel dashboard before deploying.

- [ ] **Step 8: Deploy relay to Railway**

```bash
cd relay
npx @railway/cli login
npx @railway/cli up
```

Set environment variables in Railway dashboard. Update `NEXT_PUBLIC_WS_RELAY_URL` in Vercel to point to the Railway URL.

- [ ] **Step 9: Apply Supabase migration**

In the Supabase dashboard SQL editor, paste and run the contents of `supabase/migrations/001_initial_schema.sql`.

- [ ] **Step 10: Verify deployment**

Open the Vercel URL. Walk through:
1. Landing page loads, no tech indicators in page source
2. Setup screen allows configuration
3. Session connects and voice works (test both Gemini and Microsoft voices)
4. Results page shows scores
5. Admin panel accessible at `/panel-{slug}` with correct password
6. Browser DevTools: no API keys visible, no tech framework names in network requests
7. Mobile layout works at 360px width

- [ ] **Step 11: Final commit**

```bash
git add -A
git commit -m "chore: deployment verification complete"
```
