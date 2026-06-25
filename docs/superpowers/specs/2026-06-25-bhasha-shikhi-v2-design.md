# BhashaShikhi v2: Design Specification

## Overview

BhashaShikhi is a voice-based IELTS preparation platform for Bengali speakers learning English, German, or Hindi. Users practice speaking and listening with an AI tutor that converses naturally, scores performance on the IELTS band scale, and provides targeted feedback.

This spec covers the rebuild from a LiveKit-dependent prototype into a production-ready product deployable on Vercel, with a hidden admin panel for business intelligence.

## Success Criteria

- Client demo-ready: no visible technology indicators, no security leaks
- Responsive: fully functional on mobile (360px+) through desktop
- Complete IELTS speaking practice (Parts 1, 2, 3) and listening practice
- Two selectable tutor voices (Gemini Live, Microsoft Speech)
- Hidden admin panel with full session analytics, transcripts, and audio playback
- Deployable within a 12-hour build window

---

## Architecture

### Services

| Service | Purpose | Host |
|---------|---------|------|
| Next.js 15 (App Router) | Frontend, API routes, admin panel | Vercel |
| Node.js WebSocket relay | Bridges browser audio to Gemini Live API | Railway |
| Supabase | PostgreSQL database, file storage | Supabase Cloud |

### Voice Pipeline

**Path A: Gemini Live (default tutor)**

```
Browser mic
  -> WebSocket connection
  -> Railway relay server
  -> Gemini Live API (gemini-2.5-flash-preview-native-audio-dialog, or latest stable live model)
  -> Audio response back through relay
  -> Browser speaker

Relay captures transcripts -> Supabase
```

- API key for Gemini lives only on Railway
- Relay also handles session instructions (language, mode, level, persona)
- Relay extracts text transcripts from Gemini Live responses and stores them

**Path B: Microsoft Voice (alternative tutor)**

```
Browser mic
  -> Microsoft Speech SDK (STT, runs in browser)
  -> Text sent to Next.js API route (/api/chat)
  -> Gemini Flash text API
  -> Response text returned
  -> Microsoft Speech SDK (TTS, runs in browser)
  -> Browser speaker

Transcripts sent to Supabase via API route
```

- Azure Speech key uses token exchange: browser requests short-lived token from /api/speech-token
- Real Azure key stays server-side in Vercel env vars

**Audio recording (both paths):**

Browser records full session audio via MediaRecorder API. On session end, audio is uploaded to Supabase Storage via a Next.js API route. Both the user's speech and tutor's output are captured.

### Why Two Paths

Gemini Live provides superior voice-to-voice latency and natural conversation flow. Microsoft Speech offers Bangla-native voices (bn-BD-NabanitaNeural, bn-BD-PradeepNeural) that some Bengali users may prefer over Gemini's Indian-accented Bengali. Both paths use Gemini as the conversation brain. The difference is delivery.

---

## Pages and User Flow

### 1. Landing Page (`/`)

Purpose: First impression for clients. Sells the product without revealing technology.

Content:
- Headline in Bengali and English (e.g., "IELTS Speaking Practice with Your Personal Tutor")
- Three value propositions (structured IELTS practice, instant feedback, multiple languages)
- Supported languages displayed with flag icons
- Single CTA button: "Start Practicing" / "অনুশীলন শুরু করুন"
- Clean, warm, institutional aesthetic (language school, not tech startup)

### 2. Setup Screen (`/practice`)

Purpose: Configure the practice session.

Controls:
- Language selection: English, German, Hindi (cards with country flags)
- Mode selection: Speaking Part 1, Speaking Part 2, Speaking Part 3, Listening Practice (cards with brief descriptions)
- Tutor voice: Two persona cards with name, short bio, and a "Preview Voice" button to hear a sample
- Level: Beginner, Intermediate, Advanced (segmented control)
- "Begin Session" button

### 3. Session Screen (`/session`)

Purpose: The core tutoring experience.

Layout:
- Top bar: tutor name, session timer, status indicator (subtle text: "Listening", "Speaking")
- Center: live transcript area showing both sides of the conversation, scrolling as new messages appear
- For Part 2: cue card component overlaid with topic text and a countdown timer (1 minute prep)
- Bottom: mic button (large, thumb-reachable on mobile), mute toggle, "End Session" button
- Waveform visualization when tutor is speaking (thin line animation, not an orb)

State management:
- WebSocket connection state (connecting, connected, reconnecting, disconnected)
- Agent state (idle, listening, thinking, speaking)
- Transcript accumulation
- Audio recording state

### 4. Results Screen (`/results`)

Purpose: Post-session feedback and scoring.

Content:
- IELTS band scores displayed as a radar chart or score cards:
  - Fluency and Coherence (1-9)
  - Lexical Resource (1-9)
  - Grammatical Range and Accuracy (1-9)
  - Pronunciation (1-9)
  - Overall Band Score (1-9)
- 2-3 specific strengths (bullet points)
- 2-3 areas for improvement (bullet points)
- Suggested next practice mode
- "Practice Again" and "Try Different Mode" buttons

Scoring implementation:
- On session end, full transcript is sent to Gemini Flash via /api/score
- Scoring prompt includes official IELTS band descriptors
- Response is structured JSON, parsed and stored in session_scores table
- Scores are also displayed immediately to the user

### 5. Admin Panel (`/panel-{env-configured-slug}`)

Purpose: Business intelligence for the product owner. Completely hidden from end users.

Access: Password-protected. Password hash stored in Vercel env var. Simple login form, session cookie.

Dashboard view:
- Total sessions (today, this week, this month)
- Average session duration
- Language distribution (pie chart)
- Mode distribution (bar chart)
- Voice preference split (Gemini vs Microsoft)
- Completion rate (completed vs abandoned)
- Peak usage hours

Sessions list view:
- Table with columns: date, user name, language, mode, level, voice, duration, overall score, status
- Filters: language, mode, date range, voice type, status
- Search by user name
- Click to open session detail

Session detail view:
- Full transcript with timestamps and role labels
- Audio playback (embedded player)
- Band scores breakdown
- Device info: browser, OS, screen size
- Session metadata: start time, end time, duration, voice path used

User insights view:
- Repeat visitors (tracked by browser fingerprint)
- Per-user session history
- Preferred settings per user
- Usage frequency

---

## IELTS Practice Modes

### Speaking Part 1: Interview (4-5 minutes)

Flow:
1. Tutor introduces themselves in Bengali, asks learner's name naturally
2. Transitions to target language
3. Asks 4-6 general questions about familiar topics (home, family, work, studies, interests, hobbies)
4. Questions progress from simple to slightly more complex
5. Session ends after timer or natural conclusion

Tutor behavior:
- Warm, encouraging tone
- Does not interrupt
- Asks follow-up questions if answers are too short
- Adapts vocabulary to selected level

### Speaking Part 2: Long Turn / Cue Card (3-4 minutes)

Flow:
1. Tutor presents a topic (displayed as a cue card on screen)
2. Cue card shows: topic statement + 3-4 guiding bullet points
3. 1-minute preparation timer starts (visible countdown)
4. After prep time, tutor prompts learner to begin
5. Learner speaks for 1-2 minutes
6. Tutor asks 1-2 brief follow-up questions

Cue card UI: a distinct card component with the topic, styled like a real IELTS cue card (bordered, slightly different background). Not just text in the chat.

### Speaking Part 3: Discussion (4-5 minutes)

Flow:
1. Tutor asks abstract, analytical questions related to the Part 2 topic
2. Questions require opinions, comparisons, speculation, evaluation
3. Tutor may respectfully challenge answers to test depth
4. 4-5 questions total

Tutor behavior:
- More formal tone than Parts 1 and 2
- Pushes for elaboration ("Can you explain why you think that?")
- Tests ability to organize ideas coherently

### User Name Extraction

The tutor's system prompt instructs it to introduce itself in Bengali and ask the learner's name early in the conversation. The relay (Path A) and API route (Path B) monitor transcript lines for the user's first response after the name prompt. A lightweight extraction (regex or a short Gemini call) pulls the name and updates the session record in Supabase. If no name is detected, the session remains anonymous in the admin panel.

### Listening Practice

Flow:
1. Tutor reads a passage or simulates a conversation scenario
2. Learner listens (mic stays active for "I'm ready" or "Please repeat")
3. Tutor asks 3-5 comprehension questions
4. Learner answers verbally
5. Tutor provides immediate feedback on each answer

Content types:
- Monologue (academic lecture style)
- Dialogue (two-person conversation, tutor plays both roles)
- Description (place, process, or event)

---

## Data Model (Supabase)

### sessions

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key, auto-generated |
| started_at | timestamptz | Session start |
| ended_at | timestamptz | Nullable, set on session end |
| language | text | english, german, hindi |
| mode | text | speaking_part1, speaking_part2, speaking_part3, listening |
| level | text | beginner, intermediate, advanced |
| voice_type | text | gemini, microsoft |
| user_name | text | Nullable, extracted from transcript |
| device_info | jsonb | Browser, OS, screen size |
| duration_seconds | integer | Calculated on session end |
| status | text | active, completed, abandoned |
| browser_fingerprint | text | For repeat visitor tracking |

### transcripts

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| session_id | uuid | FK to sessions |
| role | text | user, tutor |
| content | text | The spoken/generated text |
| created_at | timestamptz | When this line was captured |
| sequence_number | integer | Ordering within session |

### session_scores

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| session_id | uuid | FK to sessions |
| fluency | numeric(3,1) | 1.0-9.0 |
| vocabulary | numeric(3,1) | 1.0-9.0 |
| grammar | numeric(3,1) | 1.0-9.0 |
| pronunciation | numeric(3,1) | 1.0-9.0 |
| overall | numeric(3,1) | 1.0-9.0 |
| feedback_text | text | Overall feedback paragraph |
| strengths | text[] | Array of strength points |
| improvements | text[] | Array of improvement areas |
| suggested_next | text | Suggested next practice mode |

### audio_recordings

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| session_id | uuid | FK to sessions |
| storage_path | text | Path in Supabase Storage bucket |
| duration_seconds | integer | Recording length |
| file_size_bytes | integer | File size |
| created_at | timestamptz | Upload timestamp |

---

## UI/UX Direction

### Visual Language

- No AI aesthetic: no orbs, no gradient meshes, no "neural" motifs, no emoji
- Language school feel: trustworthy, warm, educational
- Light, warm background (off-white with slight warmth, e.g., stone-50)
- Primary color: deep teal (trust, education)
- Accent: warm coral or amber (energy, encouragement)
- Text: near-black on light backgrounds

### Typography

- Headings: clean sans-serif (Inter or Geist)
- Bengali text: Noto Sans Bengali
- Body: 16px base, generous line height
- IELTS scores: monospace or tabular figures for alignment

### Components

- Cards with subtle shadows, rounded corners (8px)
- Buttons: solid fills, no outlines, clear hover/active states
- Inputs: clean borders, generous padding
- Waveform: thin animated line during tutor speech (2-3px height, teal color)
- Status indicators: small text labels with dot indicators, no animations
- Cue card (Part 2): bordered card with cream/light background, slightly offset shadow

### Responsive Strategy

- Mobile-first breakpoints: 360px, 768px, 1024px, 1280px
- Session screen on mobile: full-width transcript, bottom-fixed mic button (large, 56px+)
- Setup screen on mobile: stacked cards, single column
- Admin panel: responsive tables with horizontal scroll on mobile
- Touch targets: minimum 44px for all interactive elements

### Animations

- Page transitions: subtle fade (200ms)
- Card hover: slight elevation change
- Waveform: CSS animation, no JavaScript
- Transcript: new messages slide in from bottom
- Timer: countdown with subtle pulse at 10 seconds remaining
- No loading spinners that look techy: use simple progress bars or skeleton screens

---

## Security

### API Key Protection

- Gemini API key: stored as Railway env var, never sent to browser
- Azure Speech key: stored as Vercel env var, browser receives short-lived tokens (10-min TTL) via /api/speech-token
- Supabase keys: anon key in browser (RLS enforced), service role key only in API routes
- No API keys in client-side JavaScript bundles

### Admin Panel

- Route uses a non-guessable slug configured via env var (ADMIN_ROUTE_SLUG)
- Password authentication with bcrypt-hashed password (ADMIN_PASSWORD_HASH env var)
- Session cookie (httpOnly, secure, sameSite: strict)
- No link to admin panel anywhere in the public UI
- Admin API routes check auth cookie before responding

### Client-Facing Security

- CORS on Railway relay: restricted to the Vercel deployment domain
- Rate limiting on all API routes (simple in-memory or Vercel KV)
- No technology fingerprints:
  - Remove X-Powered-By header
  - Generic meta tags (no framework mentions)
  - Source maps disabled in production
  - Console logs stripped via next.config
  - Error boundaries show user-friendly messages in Bengali/English
- Network requests to external APIs proxied so third-party domains are not visible in browser DevTools
- Supabase RLS policies on all tables (only service role can read/write)

### Input Handling

- All user inputs sanitized before database insertion
- Transcript content stored as plain text, rendered with proper escaping
- File uploads (audio) validated for type and size before storage

---

## Testing Strategy

Scoped for a 12-hour build:

### Unit Tests
- API route handlers: /api/speech-token, /api/chat, /api/score, /api/session
- Scoring prompt construction
- Transcript extraction logic
- Admin authentication

### Component Tests
- Setup screen: selection state management, form validation
- Session screen: connection state transitions, transcript rendering
- Results screen: score display, feedback rendering

### Integration / E2E
- One smoke test: load landing page, navigate to setup, configure session, verify connection initiates, end session, verify results page renders
- Mobile viewport test: verify layout on 360px width

### Manual QA
- Test each IELTS mode end-to-end
- Test voice switching (Gemini vs Microsoft)
- Test on mobile browser (Chrome Android or Safari iOS)
- Verify admin panel data populates after a session
- Verify no tech leaks in browser DevTools (network tab, console, page source)

---

## Deployment

### Vercel (Next.js app)

Environment variables:
- NEXT_PUBLIC_WS_RELAY_URL (Railway WebSocket URL; intentionally public since the browser must connect to it directly; the relay validates origins via CORS)
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- AZURE_SPEECH_KEY
- AZURE_SPEECH_REGION
- ADMIN_ROUTE_SLUG
- ADMIN_PASSWORD_HASH
- GEMINI_API_KEY (for text API scoring and Path B chat)

Build config:
- Source maps: disabled
- Console stripping: enabled
- X-Powered-By: disabled

### Railway (WebSocket relay)

Environment variables:
- GEMINI_API_KEY
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- ALLOWED_ORIGINS (Vercel domain)

Single process: Node.js WebSocket server (ws library)

### Supabase

- Create project via dashboard
- Apply schema migration (4 tables)
- Create private storage bucket for audio recordings
- Enable RLS on all tables
- Create service role policies for API routes

### Domain

Vercel provides a clean .vercel.app URL by default. Custom domain can be added later if needed for the client demo.

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15, App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Voice (default) | Gemini Live API via WebSocket relay |
| Voice (alternative) | Microsoft Azure Speech SDK (browser) |
| LLM | Gemini Flash (text API for scoring and Path B) |
| Database | Supabase PostgreSQL |
| File Storage | Supabase Storage |
| Charts (admin) | Recharts or lightweight alternative |
| Deployment | Vercel (app) + Railway (relay) |

---

## Out of Scope (Phase 2)

- User authentication and persistent accounts
- Progress tracking across sessions
- Lesson plans and structured curricula
- Payment integration
- Multi-tenant admin
- Native mobile app
- Writing and reading practice modes
