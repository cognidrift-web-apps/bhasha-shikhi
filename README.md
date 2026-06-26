# BhashaShikhi

A voice-first AI language learning platform for Bangladeshi people. Practice English, German, Arabic, or Hindi by actually talking with an AI tutor who understands Bengali.

**Live**: https://bhasha-shikhi-demo.vercel.app

## How to Use

1. Open https://bhasha-shikhi-demo.vercel.app
2. Click **"Start Now"**
3. Pick a language (English, German, Arabic, or Hindi)
4. Pick a mode (conversation, pronunciation, grammar, etc.)
5. Pick your level (beginner, intermediate, advanced)
6. Pick a voice (Priya for now -- Microsoft voice coming soon)
7. Click **Start** -- allow microphone access when prompted
8. Talk! The AI tutor speaks Bengali and your target language
9. Click **End Session** to see your report card with scores

No account needed. Just open and talk.

## What It Does

BhashaShikhi ("Learn Language" in Bangla) pairs Bengali speakers with a conversational AI tutor. Instead of multiple-choice quizzes or typing exercises, learners speak and listen in real time. The tutor responds naturally, catches mistakes rooted in Bengali language interference, and adapts to the learner's level.

### 7 Practice Modes

| Mode | Bangla | What It Does |
|------|--------|-------------|
| Word by Word | একটা একটা শব্দ | Learn one word at a time with meaning, pronunciation, usage |
| Free Conversation | আড্ডা | Open conversation on any topic |
| Situation Roleplay | পরিস্থিতি | Practice real scenarios: interviews, doctors, airports |
| Pronunciation Clinic | উচ্চারণ ঠিক করি | Fix sounds Bengali speakers struggle with |
| Grammar in Conversation | কথায় কথায় গ্রামার | Learn grammar through speaking, not rules |
| Listening Challenge | শুনে বুঝি | Listen to passages and answer questions |
| Live Translation | লাইভ অনুবাদ | Speak any language, get instant translation |

### 4 Target Languages

- **English** -- jobs, IELTS, global communication
- **German** -- nursing programs, university admission
- **Arabic** -- Gulf migration, Islamic study
- **Hindi** -- Bollywood, everyday conversation

### Key Differentiators

- **Bangla Interference Detector**: Understands WHY Bengali speakers make specific mistakes. Catches "bhery" instead of "very", missing articles, wrong prepositions.
- **Code-Switch Detection**: Notices when learners fall back to Bangla mid-sentence and gently redirects.
- **Session Report Card**: Scores across Fluency, Vocabulary, Grammar, Pronunciation (0-100%) with specific error examples and XP earned.
- **No Account Required**: Start practicing immediately. Progress tracks via browser fingerprint.

## Architecture

```
Browser (Next.js)
    |
    |-- Path A (Gemini Voice): WebSocket --> Railway Relay --> Gemini Live API
    |
    |-- Path B (Microsoft Voice): Azure Speech SDK --> /api/chat --> Gemini Flash [coming soon]
    |
    |-- Session Data: /api/* --> Supabase (PostgreSQL + Storage)
```

Three services:

| Service | Platform | URL |
|---------|----------|-----|
| Next.js 15 App | Vercel | https://bhasha-shikhi-demo.vercel.app |
| WebSocket Relay | Railway | https://bhasha-shikhi-relay-demo-production.up.railway.app |
| Database + Storage | Supabase | Project: `hstqzvhawnokvethhdla` |

See [docs/architecture.md](docs/architecture.md) for detailed diagrams.

## Deployment Details

### Accounts and Projects

| Service | Account | Project Name |
|---------|---------|-------------|
| **Vercel** | ratul.kuet@gmail.com (team: ratulalahy) | bhasha-shikhi-demo |
| **Railway** | qratul@uvu.edu | bhasha-shikhi-relay-demo |
| **Supabase** | Dashboard project | bhasha-shikhi-demo-v01 (ref: `hstqzvhawnokvethhdla`) |
| **GitHub** | cognidrift-web-apps org | bhasha-shikhi (branch: `feat/v2-rebuild`) |

### URLs

| What | URL |
|------|-----|
| Live App | https://bhasha-shikhi-demo.vercel.app |
| Admin Panel | https://bhasha-shikhi-demo.vercel.app/panel/bhasha-panel-x7k9m2 |
| Relay Health | https://bhasha-shikhi-relay-demo-production.up.railway.app/health |
| Supabase Dashboard | https://supabase.com/dashboard/project/hstqzvhawnokvethhdla |
| Vercel Dashboard | https://vercel.com/ratulalahy/bhasha-shikhi-demo |
| Railway Dashboard | https://railway.com/project/0b03a7ea-cbd9-4be6-982b-f4e4b20ace43 |
| GitHub Repo | https://github.com/cognidrift-web-apps/bhasha-shikhi |
| PR | https://github.com/cognidrift-web-apps/bhasha-shikhi/pull/1 |

### Database

- **Host**: Supabase (project ref `hstqzvhawnokvethhdla`)
- **Tables**: `sessions`, `transcripts`, `session_scores`, `audio_recordings`
- **Storage Bucket**: `audio-recordings` (private)
- **RLS**: Enabled on all tables. Service role for API routes, anon for session creation.

### Environment Variables (set on platforms)

**Vercel** (6 vars set across production/preview/development):
- `NEXT_PUBLIC_SUPABASE_URL` -- Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` -- Supabase anon key (public, safe)
- `NEXT_PUBLIC_WS_RELAY_URL` -- Railway WebSocket URL
- `SUPABASE_SERVICE_ROLE_KEY` -- server-side only
- `GEMINI_API_KEY` -- server-side only
- `ADMIN_ROUTE_SLUG` -- hidden admin URL path
- `ADMIN_PASSWORD_HASH` -- bcrypt hash of admin password

**Railway** (7 vars):
- `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_VOICE`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `ALLOWED_ORIGINS` -- CORS (Vercel domain + localhost)
- `PORT` -- 8081

**Not yet configured**:
- `AZURE_SPEECH_KEY` -- needed for Microsoft voice (Path B)
- `AZURE_SPEECH_REGION` -- needed for Microsoft voice (Path B)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS |
| Voice Path A | Gemini Live API (native audio dialog), AudioWorklet (PCM capture) |
| Voice Path B | Microsoft Azure Speech SDK (STT + TTS), Gemini Flash (not yet active) |
| Relay Server | Node.js 20, ws (WebSocket), TypeScript |
| Database | Supabase PostgreSQL with RLS |
| Storage | Supabase Storage (private bucket for audio recordings) |
| Auth (Admin) | bcryptjs, HTTP-only cookies |
| AI Model | Gemini 2.5 Flash Preview (native audio dialog) |
| Testing | Vitest (255 tests) |
| CI/CD | GitHub Actions (test + build + relay build on push/PR) |
| Deployment | Vercel (frontend), Railway (relay), Supabase (database) |

## Getting Started (Local Development)

### Prerequisites

- Node.js 20+
- npm 10+
- API keys: Google Gemini, Supabase project (optionally Azure Speech)

### 1. Clone and Install

```bash
git clone https://github.com/cognidrift-web-apps/bhasha-shikhi.git
cd bhasha-shikhi

# Install frontend dependencies
npm install

# Install relay dependencies
cd relay && npm install && cd ..
```

### 2. Set Up Environment Variables

```bash
cp .env.local.example .env.local
cp relay/.env.example relay/.env
```

Edit both files with your API keys. See [docs/deployment.md](docs/deployment.md) for details.

### 3. Set Up Database

Either use the deployed Supabase instance or create a new one. To create fresh:

```bash
# Install Supabase CLI
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db query --linked -f supabase/migrations/001_initial_schema.sql
```

### 4. Run Locally

```bash
# Terminal 1: Next.js dev server
npm run dev

# Terminal 2: WebSocket relay
cd relay && npm run dev
```

Open http://localhost:3000.

### 5. Run Tests

```bash
npm test          # Run all 255 tests
npm run test:watch # Watch mode
```

## Project Structure

```
bhasha-shikhi/
|-- src/
|   |-- app/                    # Next.js pages and API routes
|   |   |-- api/                # 8 API endpoints
|   |   |-- panel/[slug]/       # Hidden admin dashboard
|   |   |-- practice/           # Session setup screen
|   |   |-- session/            # Voice practice screen
|   |   |-- results/            # Post-session report card
|   |   +-- page.tsx            # Landing page
|   |-- components/             # React components (13 total)
|   |-- hooks/                  # Voice pipeline hooks (4 total)
|   +-- lib/                    # Constants, prompts, Supabase clients
|-- relay/                      # WebSocket relay server (Railway)
|   +-- src/                    # Relay source code
|-- supabase/
|   +-- migrations/             # Database schema
|-- docs/                       # Documentation
|   |-- architecture.md         # System design and diagrams
|   |-- api-reference.md        # API endpoint documentation
|   |-- deployment.md           # Deployment guide
|   +-- database-schema.md      # Database schema docs
|-- .github/
|   +-- workflows/ci.yml        # GitHub Actions CI
+-- public/                     # Static assets (AudioWorklet, robots.txt)
```

## Documentation

- [Architecture and System Design](docs/architecture.md) -- Diagrams, data flow, component map
- [API Reference](docs/api-reference.md) -- All endpoints with request/response formats
- [Deployment Guide](docs/deployment.md) -- Vercel, Railway, Supabase setup
- [Database Schema](docs/database-schema.md) -- Tables, relationships, RLS policies

## Admin Panel

Access at: https://bhasha-shikhi-demo.vercel.app/panel/bhasha-panel-x7k9m2

Features:
- Total session count, today/this week stats
- Average scores and session duration
- Session list with filters (language, mode, date)
- Per-session transcript viewer and audio playback

## Security

- API keys never reach the browser. Gemini key lives on Railway/Vercel server side.
- Azure Speech will use short-lived token exchange (10-min TTL) when enabled.
- Admin panel is hidden behind a configurable URL slug with bcrypt password authentication.
- No "Powered by" headers, no source maps in production, console logs stripped.
- CORS on relay restricted to the Vercel deployment domain.
- All Supabase access from API routes uses service role key with Row Level Security enforced.
- File uploads validated by type and size.
- robots.txt disallows all crawling.

## Version

**v0.1 -- Demo Build**

This is a demo deployment. To move to production:
1. Upgrade Vercel to Pro (enables GitHub integration for org repos)
2. Add custom domain
3. Add Azure Speech keys for Path B (Microsoft voice)
4. Set up monitoring and alerting
5. Review and tighten RLS policies for production traffic

## License

Private. All rights reserved.
