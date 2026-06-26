# BhashaShikhi

A voice-first AI language learning platform for Bangladeshi people. Practice English, German, Arabic, or Hindi by actually talking with an AI tutor who understands Bengali.

## What It Does

BhashaShikhi ("Learn Language" in Bangla) pairs Bengali speakers with a conversational AI tutor. Instead of multiple-choice quizzes or typing exercises, learners speak and listen in real time. The tutor (Priya) responds naturally, catches mistakes rooted in Bengali language interference, and adapts to the learner's level.

### 7 Practice Modes

| Mode | Bangla | What It Does | Duration |
|------|--------|-------------|----------|
| Word by Word | একটা একটা শব্দ | Learn one word at a time with meaning, pronunciation, usage | 3-5 min |
| Free Conversation | আড্ডা | Open conversation on any topic | 5-10 min |
| Situation Roleplay | পরিস্থিতি | Practice real scenarios: interviews, doctors, airports | 5-7 min |
| Pronunciation Clinic | উচ্চারণ ঠিক করি | Fix sounds Bengali speakers struggle with | 5-7 min |
| Grammar in Conversation | কথায় কথায় গ্রামার | Learn grammar through speaking, not rules | 5-7 min |
| Listening Challenge | শুনে বুঝি | Listen to passages and answer questions | 5-7 min |
| Live Translation | লাইভ অনুবাদ | Speak any language, get instant translation | Unlimited |

### 4 Target Languages

- **English** -- jobs, IELTS, global communication
- **German** -- nursing programs, university admission
- **Arabic** -- Gulf migration, Islamic study
- **Hindi** -- Bollywood, everyday conversation

### Key Differentiators

- **Bangla Interference Detector**: Understands WHY Bengali speakers make specific mistakes. Catches "bhery" instead of "very", missing articles, wrong prepositions.
- **Code-Switch Detection**: Notices when learners fall back to Bangla mid-sentence and gently redirects.
- **Session Report Card**: Scores across Fluency, Vocabulary, Grammar, Pronunciation (0-100%) with specific error examples.
- **No Account Required**: Start practicing immediately. Progress tracks via browser fingerprint.

## Architecture

```
Browser (Next.js)
    |
    |-- Path A (Gemini Voice): WebSocket --> Railway Relay --> Gemini Live API
    |
    |-- Path B (Microsoft Voice): Azure Speech SDK (STT/TTS) --> /api/chat --> Gemini Flash
    |
    |-- Session Data: /api/* --> Supabase (PostgreSQL + Storage)
```

Three services:

| Service | Platform | Purpose |
|---------|----------|---------|
| Next.js 15 App | Vercel | Frontend, API routes, admin panel |
| WebSocket Relay | Railway | Bridges browser audio to Gemini Live API |
| Supabase | Supabase Cloud | PostgreSQL database + audio file storage |

See [docs/architecture.md](docs/architecture.md) for detailed diagrams.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS |
| Voice Path A | Gemini Live API (native audio dialog), AudioWorklet (PCM capture) |
| Voice Path B | Microsoft Azure Speech SDK (STT + TTS), Gemini Flash (text chat) |
| Relay Server | Node.js, ws (WebSocket), TypeScript |
| Database | Supabase PostgreSQL with RLS |
| Storage | Supabase Storage (private bucket for audio recordings) |
| Auth (Admin) | bcryptjs, HTTP-only cookies |
| Testing | Vitest (255 tests) |
| Deployment | Vercel (frontend), Railway (relay), Supabase (database) |

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- API keys: Google Gemini, Microsoft Azure Speech, Supabase project

### 1. Clone and Install

```bash
git clone <repo-url>
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

Create a Supabase project, then run the migration:

```bash
# In Supabase SQL Editor, paste:
supabase/migrations/001_initial_schema.sql
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
|   +-- deployment.md           # Deployment guide
+-- public/                     # Static assets (AudioWorklet, robots.txt)
```

## Documentation

- [Architecture and System Design](docs/architecture.md) -- Diagrams, data flow, component map
- [API Reference](docs/api-reference.md) -- All endpoints with request/response formats
- [Deployment Guide](docs/deployment.md) -- Vercel, Railway, Supabase setup
- [Database Schema](docs/database-schema.md) -- Tables, relationships, RLS policies

## Security

- API keys never reach the browser. Gemini key lives on Railway/Vercel server side. Azure Speech uses short-lived token exchange (10-min TTL).
- Admin panel is hidden behind a configurable URL slug with bcrypt password authentication.
- No "Powered by" headers, no source maps in production, console logs stripped.
- CORS on relay restricted to the Vercel deployment domain.
- All Supabase access from API routes uses service role key with Row Level Security enforced.
- File uploads validated by type and size.

## License

Private. All rights reserved.
