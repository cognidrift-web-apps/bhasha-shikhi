# Architecture and System Design

## High-Level Architecture

```mermaid
graph TB
    subgraph Browser["Browser (Next.js 15)"]
        UI[React UI]
        AW[AudioWorklet - PCM Capture]
        AR[Audio Recorder]
        SDK[Azure Speech SDK]
    end

    subgraph Vercel["Vercel"]
        FE[Next.js Frontend]
        API[API Routes]
        ADMIN[Admin Panel]
    end

    subgraph Railway["Railway"]
        RELAY[WebSocket Relay Server]
    end

    subgraph Google["Google Cloud"]
        GEMINI_LIVE[Gemini Live API - Voice]
        GEMINI_TEXT[Gemini Flash - Text]
    end

    subgraph Azure["Microsoft Azure"]
        AZURE_SPEECH[Azure Speech Service]
    end

    subgraph Supabase["Supabase"]
        DB[(PostgreSQL)]
        STORAGE[(File Storage)]
    end

    UI --> FE
    AW -->|WebSocket - base64 PCM| RELAY
    RELAY -->|WebSocket| GEMINI_LIVE
    GEMINI_LIVE -->|Audio + Transcript| RELAY
    RELAY -->|Audio + Transcript| AW

    SDK -->|STT| AZURE_SPEECH
    AZURE_SPEECH -->|TTS| SDK
    SDK -->|User text| API
    API -->|Chat request| GEMINI_TEXT
    API -->|Score request| GEMINI_TEXT

    API -->|CRUD| DB
    RELAY -->|Insert transcripts| DB
    API -->|Upload audio| STORAGE
    API -->|Token exchange| AZURE_SPEECH
    ADMIN -->|Read analytics| DB
```

## Dual Voice Pipeline

BhashaShikhi offers two voice paths that produce identical session data:

```mermaid
graph LR
    subgraph PathA["Path A: Gemini Voice (Default)"]
        MIC_A[Mic Input] --> WORKLET[AudioWorklet]
        WORKLET -->|PCM base64| WS[WebSocket]
        WS --> RELAY[Relay Server]
        RELAY --> GEMINI[Gemini Live API]
        GEMINI -->|Audio + Text| RELAY
        RELAY -->|Audio| SPEAKER_A[Speaker Output]
        RELAY -->|Transcript| DB_A[(Supabase)]
    end

    subgraph PathB["Path B: Microsoft Voice"]
        MIC_B[Mic Input] --> STT[Azure STT]
        STT -->|Text| CHAT[/api/chat]
        CHAT --> FLASH[Gemini Flash]
        FLASH -->|Text| CHAT
        CHAT -->|Response| TTS[Azure TTS]
        TTS --> SPEAKER_B[Speaker Output]
        CHAT -->|Transcript| DB_B[(Supabase)]
    end
```

### Path A: Gemini Live (Default)

1. Browser captures microphone via `AudioWorklet` (raw PCM at 16kHz)
2. PCM encoded to base64 and sent over WebSocket to Railway relay
3. Relay forwards audio to Gemini Live API with the tutor system prompt
4. Gemini responds with audio chunks + text transcripts
5. Relay stores transcripts in Supabase and forwards audio back to browser
6. Browser plays tutor audio through Web Audio API

### Path B: Microsoft Azure Speech

1. Azure Speech SDK runs in the browser for STT (speech-to-text)
2. Recognized text is sent to `/api/chat` endpoint
3. API route calls Gemini Flash text API with the tutor prompt + conversation history
4. Response streams back to the browser
5. Azure TTS synthesizes the response as audio
6. Transcripts stored via API routes in Supabase

## User Flow

```mermaid
sequenceDiagram
    actor User
    participant Landing as Landing Page
    participant Setup as Setup Screen
    participant Session as Session Screen
    participant Results as Results Screen
    participant API as API Routes
    participant Relay as WebSocket Relay
    participant Gemini as Gemini API
    participant DB as Supabase

    User->>Landing: Open app
    User->>Setup: Click "Start Now"
    User->>Setup: Select language, mode, level, voice

    User->>Session: Click "Start"
    Session->>API: POST /api/session (create)
    API->>DB: Insert session row
    API-->>Session: { id: sessionId }

    alt Path A (Gemini Voice)
        Session->>Relay: WebSocket connect
        Relay->>Gemini: Setup with tutor prompt
        loop Voice Conversation
            User->>Session: Speak
            Session->>Relay: Audio chunks (base64 PCM)
            Relay->>Gemini: Forward audio
            Gemini-->>Relay: Audio response + transcript
            Relay->>DB: Store transcript
            Relay-->>Session: Audio + transcript
            Session->>User: Play tutor audio
        end
    else Path B (Microsoft Voice)
        Session->>API: GET /api/speech-token
        API-->>Session: { token, region }
        loop Voice Conversation
            User->>Session: Speak
            Session->>Session: Azure STT (browser)
            Session->>API: POST /api/chat (text)
            API->>Gemini: Gemini Flash text
            Gemini-->>API: Response text
            API->>DB: Store transcript
            API-->>Session: Stream response
            Session->>Session: Azure TTS (browser)
            Session->>User: Play tutor audio
        end
    end

    User->>Session: End session
    Session->>API: PATCH /api/session (completed)
    Session->>API: POST /api/upload-audio
    API->>DB: Store audio metadata
    Session->>Results: Navigate with sessionId

    Results->>API: POST /api/score
    API->>DB: Fetch transcripts
    API->>Gemini: Score with Gemini Flash
    Gemini-->>API: ScoreResult JSON
    API->>DB: Store scores
    API-->>Results: Display report card
```

## Component Architecture

```mermaid
graph TB
    subgraph Pages["Pages (src/app/)"]
        LP["/  Landing Page"]
        PP["/practice  Setup Screen"]
        SP["/session  Session Screen"]
        RP["/results  Results Screen"]
        AP["/panel/[slug]  Admin Panel"]
    end

    subgraph Components["Components (src/components/)"]
        subgraph Landing
            Hero[hero.tsx]
            Features[features.tsx]
        end
        subgraph Setup
            LangSel[language-selector.tsx]
            ModeSel[mode-selector.tsx]
            LevelSel[level-selector.tsx]
            VoiceSel[voice-selector.tsx]
        end
        subgraph Session
            VoiceOrb[voice-orb.tsx]
            TransPanel[transcript-panel.tsx]
        end
        subgraph Results
            ScoreCard[score-card.tsx]
            FeedbackPanel[feedback-panel.tsx]
        end
        subgraph Admin
            StatsCard[stats-card.tsx]
            SessionsTable[sessions-table.tsx]
            TransViewer[transcript-viewer.tsx]
        end
    end

    subgraph Hooks["Hooks (src/hooks/)"]
        UseSession[use-session.ts]
        UseGemini[use-gemini-live.ts]
        UseMicrosoft[use-microsoft-speech.ts]
        UseRecorder[use-audio-recorder.ts]
    end

    subgraph Lib["Library (src/lib/)"]
        Constants[constants.ts]
        TutorPrompts[prompts/tutor.ts]
        ScoringPrompts[prompts/scoring.ts]
        SupaClient[supabase/client.ts]
        SupaServer[supabase/server.ts]
        SupaTypes[supabase/types.ts]
        PcmWorklet[audio/pcm-worklet.ts]
    end

    LP --> Hero & Features
    PP --> LangSel & ModeSel & LevelSel & VoiceSel
    SP --> VoiceOrb & TransPanel
    SP --> UseSession
    RP --> ScoreCard & FeedbackPanel
    AP --> StatsCard & SessionsTable & TransViewer

    UseSession --> UseGemini & UseMicrosoft & UseRecorder
    UseGemini --> PcmWorklet
```

## Data Model

```mermaid
erDiagram
    sessions ||--o{ transcripts : has
    sessions ||--o| session_scores : has
    sessions ||--o{ audio_recordings : has

    sessions {
        uuid id PK
        timestamptz started_at
        timestamptz ended_at
        text language "english|german|arabic|hindi"
        text mode "word_by_word|conversation|roleplay|pronunciation|grammar|listening|live_translation"
        text level "beginner|intermediate|advanced"
        text voice_type "gemini|microsoft"
        text user_name "nullable, extracted from conversation"
        jsonb device_info "browser fingerprint data"
        integer duration_seconds
        text status "active|completed|abandoned"
        text browser_fingerprint "nullable"
    }

    transcripts {
        uuid id PK
        uuid session_id FK
        text role "user|tutor"
        text content
        timestamptz created_at
        integer sequence_number
    }

    session_scores {
        uuid id PK
        uuid session_id FK "unique"
        numeric fluency "0-100"
        numeric vocabulary "0-100"
        numeric grammar "0-100"
        numeric pronunciation "0-100"
        numeric overall "0-100"
        text feedback_text
        text_array strengths
        text_array improvements
        text suggested_next
        integer xp "10-100"
        integer bangla_fallback_count
    }

    audio_recordings {
        uuid id PK
        uuid session_id FK
        text storage_path
        integer duration_seconds
        integer file_size_bytes
        timestamptz created_at
    }
```

## Prompt Architecture

The tutor prompt is constructed dynamically from three dimensions:

```mermaid
graph LR
    subgraph Inputs
        LANG[Language<br/>english/german/arabic/hindi]
        MODE[Mode<br/>7 practice modes]
        LEVEL[Level<br/>beginner/intermediate/advanced]
    end

    subgraph PromptBuilder["buildTutorPrompt()"]
        BASE[Base Persona<br/>- Name: Priya<br/>- Bangladeshi Bangla<br/>- Name extraction<br/>- Code-switch detection<br/>- Voice framing]
        MODE_BLOCK[Mode Instructions<br/>- Teaching approach<br/>- Session structure<br/>- Example flow]
        LANG_SPEC[Language Specifics<br/>- Phoneme challenges<br/>- Grammar differences<br/>- Cultural context]
    end

    LANG --> BASE
    LANG --> LANG_SPEC
    MODE --> MODE_BLOCK
    LEVEL --> MODE_BLOCK

    BASE --> PROMPT[Final System Prompt]
    MODE_BLOCK --> PROMPT
    LANG_SPEC --> PROMPT
```

### Coverage Matrix

The prompt system covers 84 unique combinations:

- 4 languages x 7 modes x 3 levels = 84 prompts
- Each includes Bengali-speaker-specific phoneme error patterns
- Each includes L1 transfer grammar challenges
- Live Translation mode uses a single translator prompt (level-independent)

## Security Architecture

```mermaid
graph TB
    subgraph Public["Public Internet"]
        BROWSER[Browser]
    end

    subgraph Vercel["Vercel (Server)"]
        NEXT[Next.js API Routes]
        ADMIN_UI[Admin Panel]
    end

    subgraph Railway["Railway (Server)"]
        RELAY_S[Relay Server]
    end

    subgraph Secrets["Server-Side Only"]
        GK[GEMINI_API_KEY]
        AK[AZURE_SPEECH_KEY]
        SK[SUPABASE_SERVICE_ROLE_KEY]
        AH[ADMIN_PASSWORD_HASH]
    end

    BROWSER -->|HTTPS| NEXT
    BROWSER -->|WSS + CORS check| RELAY_S
    BROWSER -.->|Short-lived token only| AZURE_TOKEN[Azure Speech Token<br/>10-min TTL]

    NEXT --> GK & AK & SK & AH
    RELAY_S --> GK & SK

    NEXT -->|Token exchange| AZURE_TOKEN

    style GK fill:#fee,stroke:#f00
    style AK fill:#fee,stroke:#f00
    style SK fill:#fee,stroke:#f00
    style AH fill:#fee,stroke:#f00
```

### Security Measures

| Layer | Measure |
|-------|---------|
| API Keys | Never in client bundles. Server-side only via env vars. |
| Azure Speech | Browser receives 10-minute tokens, never the raw key. |
| Admin Panel | Hidden URL slug + bcrypt password + HTTP-only cookie. |
| CORS | Relay only accepts connections from the Vercel domain. |
| Headers | X-Powered-By removed, X-Frame-Options DENY, strict CSP. |
| Source Maps | Disabled in production. Console logs stripped. |
| Database | Row Level Security on all tables. Service role for API routes only. |
| File Upload | Type validation (audio/* only), size limits enforced. |
| Indexing | robots.txt disallows all, meta noindex on all pages. |

## Relay Server Protocol

```mermaid
sequenceDiagram
    participant B as Browser
    participant R as Relay Server
    participant G as Gemini Live API
    participant DB as Supabase

    B->>R: WebSocket connect
    Note over R: CORS origin check

    B->>R: { type: "config", sessionId, language, mode, level }
    Note over R: Validate config values
    R->>G: WebSocket connect + setup message
    Note over G: System prompt + voice config
    R-->>B: { type: "ready" }

    loop Voice Exchange
        B->>R: { type: "audio", data: "base64 PCM" }
        R->>G: realtimeInput with mediaChunks
        G-->>R: serverContent with audio + text
        R-->>B: { type: "audio", data: "base64 PCM" }
        R-->>B: { type: "transcript", role: "tutor", content: "..." }
        R->>DB: INSERT INTO transcripts
    end

    B->>R: { type: "end" }
    R->>G: Close connection
    R-->>B: { type: "ended" }
```

## Deployment Topology

```mermaid
graph TB
    subgraph CDN["Vercel Edge Network"]
        STATIC[Static Pages<br/>/, /practice, /results]
    end

    subgraph VercelFn["Vercel Serverless Functions"]
        API_FN[API Routes<br/>8 endpoints]
        ADMIN_FN[Admin Pages<br/>SSR with auth]
        SESSION_FN[Session Page<br/>Static shell + client hooks]
    end

    subgraph RailwayNode["Railway Container"]
        RELAY_PROC[Node.js Process<br/>WebSocket Server<br/>Port 8081]
    end

    subgraph SupabaseCloud["Supabase Cloud"]
        PG[(PostgreSQL<br/>4 tables + RLS)]
        S3[(Storage<br/>audio-recordings bucket)]
    end

    subgraph ExternalAPIs["External APIs"]
        GEMINI_API[Gemini Live + Flash APIs]
        AZURE_API[Azure Speech Service]
    end

    CDN --> VercelFn
    VercelFn --> PG & S3
    VercelFn --> GEMINI_API & AZURE_API
    RailwayNode --> PG
    RailwayNode --> GEMINI_API
```
