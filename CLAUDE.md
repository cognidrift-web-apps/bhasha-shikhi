# BhashaShikhi v2

Voice-first AI language learning platform for Bangladeshi Bengali speakers. Practice English, German, Arabic, or Hindi by speaking with an AI tutor.

## Architecture

Three services:

- **Next.js 15 App** (`src/`): Frontend, API routes, admin panel. Deploys to Vercel.
- **WebSocket Relay** (`relay/`): Node.js server bridging browser audio to Gemini Live API. Deploys to Railway.
- **Supabase**: PostgreSQL database + Storage for audio recordings.

Two voice pipelines:
- **Path A (Gemini)**: Browser mic -> AudioWorklet PCM -> WebSocket -> Relay -> Gemini Live API
- **Path B (Microsoft)**: Azure Speech SDK (browser STT/TTS) -> /api/chat -> Gemini Flash text

## Running Locally

```bash
# Terminal 1: Next.js
npm run dev

# Terminal 2: Relay
cd relay && npm run dev
```

Copy `.env.local.example` to `.env.local` and `relay/.env.example` to `relay/.env` first.

## Key Files

| Path | Purpose |
|------|---------|
| `src/lib/constants.ts` | Languages, modes, levels, voices, types |
| `src/lib/prompts/tutor.ts` | Dynamic tutor prompt builder (4 langs x 7 modes x 3 levels) |
| `src/lib/prompts/scoring.ts` | Session scoring prompt + parser |
| `src/hooks/use-session.ts` | Unified session state manager |
| `src/hooks/use-gemini-live.ts` | Path A voice hook |
| `src/hooks/use-microsoft-speech.ts` | Path B voice hook |
| `relay/src/index.ts` | Relay server entry point |
| `relay/src/gemini-session.ts` | Gemini Live WebSocket client |

## Environment Variables

### Next.js (.env.local)

| Variable | Scope | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Supabase service role key |
| `NEXT_PUBLIC_WS_RELAY_URL` | Public | WebSocket relay URL (wss://...) |
| `GEMINI_API_KEY` | Server | Google Gemini API key |
| `AZURE_SPEECH_KEY` | Server | Azure Speech key |
| `AZURE_SPEECH_REGION` | Server | Azure region (e.g., eastus) |
| `ADMIN_ROUTE_SLUG` | Server | Hidden admin URL path |
| `ADMIN_PASSWORD_HASH` | Server | bcrypt hash of admin password |

### Relay (relay/.env)

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key |
| `GEMINI_MODEL` | Model ID (default: gemini-2.5-flash-preview-native-audio-dialog) |
| `GEMINI_VOICE` | Voice name (default: Kore) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) |
| `PORT` | Server port (default: 8081) |

## Constraints

- All Bengali text uses everyday Bangladeshi Bangla (Dhaka casual), never formal/literary
- No emoji in UI copy, no emdash characters
- No AI/tech branding visible to users
- API keys never in client bundles (NEXT_PUBLIC_ prefix only for public URLs)
- TypeScript strict mode everywhere
- Tailwind CSS only, no CSS modules
- Minimum 44px touch targets, mobile-first (360px base)

## Testing

```bash
npm test           # 255 tests across tutor prompts + scoring
npm run test:watch # Watch mode
```

## Documentation

- [Architecture and Diagrams](docs/architecture.md)
- [API Reference](docs/api-reference.md)
- [Deployment Guide](docs/deployment.md)
- [Database Schema](docs/database-schema.md)
