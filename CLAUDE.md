# BhashaShikhi v0.1 (Demo)

Voice-first AI language learning platform for Bangladeshi Bengali speakers. Practice English, German, Arabic, or Hindi by speaking with an AI tutor.

**Live**: https://bhasha-shikhi-demo.vercel.app

## Architecture

Three services:

- **Next.js 15 App** (`src/`): Frontend, API routes, admin panel. Deployed to Vercel.
- **WebSocket Relay** (`relay/`): Node.js server bridging browser audio to Gemini Live API. Deployed to Railway.
- **Supabase**: PostgreSQL database + Storage for audio recordings.

Two voice pipelines:
- **Path A (Gemini)**: Browser mic -> AudioWorklet PCM -> WebSocket -> Relay -> Gemini Live API (active)
- **Path B (Microsoft)**: Azure Speech SDK (browser STT/TTS) -> /api/chat -> Gemini Flash text (not yet configured)

## Deployment

| Service | Account | Project | URL |
|---------|---------|---------|-----|
| Vercel | ratul.kuet@gmail.com | bhasha-shikhi-demo | https://bhasha-shikhi-demo.vercel.app |
| Railway | qratul@uvu.edu | bhasha-shikhi-relay-demo | https://bhasha-shikhi-relay-demo-production.up.railway.app |
| Supabase | -- | bhasha-shikhi-demo-v01 | ref: hstqzvhawnokvethhdla |
| GitHub | cognidrift-web-apps | bhasha-shikhi | branch: feat/v2-rebuild |

Admin panel: `/panel/bhasha-panel-x7k9m2`

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
| `AZURE_SPEECH_KEY` | Server | Azure Speech key (not yet set) |
| `AZURE_SPEECH_REGION` | Server | Azure region (not yet set) |
| `ADMIN_ROUTE_SLUG` | Server | Hidden admin URL path |
| `ADMIN_PASSWORD_HASH` | Server | bcrypt hash of admin password |

### Relay (relay/.env)

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key |
| `GEMINI_MODEL` | Model ID (gemini-2.5-flash-preview-native-audio-dialog) |
| `GEMINI_VOICE` | Voice name (Kore) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) |
| `PORT` | Server port (8081) |

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

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs on push/PR:
- Test (255 tests)
- Next.js build
- Relay build

Vercel deploy is manual (`vercel deploy --prod`) since GitHub integration requires Pro plan for org repos.

## Documentation

- [Architecture and Diagrams](docs/architecture.md)
- [API Reference](docs/api-reference.md)
- [Deployment Guide](docs/deployment.md)
- [Database Schema](docs/database-schema.md)
