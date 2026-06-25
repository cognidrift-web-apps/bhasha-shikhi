# API Reference

All API routes are under `/api/` and run as Vercel serverless functions. They use the Supabase service role key for database access.

## Session Management

### POST /api/session

Create a new practice session.

**Request:**

```json
{
  "language": "english",
  "mode": "conversation",
  "level": "intermediate",
  "voice_type": "gemini",
  "device_info": { "userAgent": "...", "screen": "390x844" },
  "browser_fingerprint": "abc123"
}
```

**Validation:**
- `language` must be one of: `english`, `german`, `arabic`, `hindi`
- `mode` must be one of: `word_by_word`, `conversation`, `roleplay`, `pronunciation`, `grammar`, `listening`, `live_translation`
- `level` must be one of: `beginner`, `intermediate`, `advanced`
- `voice_type` must be one of: `gemini`, `microsoft`
- `device_info` and `browser_fingerprint` are optional

**Response (201):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### PATCH /api/session

Update session status (end or abandon).

**Request:**

```json
{
  "sessionId": "550e8400-...",
  "status": "completed",
  "duration_seconds": 342,
  "user_name": "Rahim"
}
```

**Validation:**
- `sessionId` is required (string)
- `status` must be one of: `active`, `completed`, `abandoned`
- `duration_seconds` and `user_name` are optional

**Response (200):**

```json
{
  "success": true
}
```

## Voice Pipeline

### POST /api/chat

Text-based chat with the AI tutor (used by Path B / Microsoft voice pipeline). Returns a streaming text response.

**Request:**

```json
{
  "language": "english",
  "mode": "conversation",
  "level": "intermediate",
  "message": "Hello, how are you?",
  "history": [
    { "role": "user", "content": "Hi" },
    { "role": "model", "content": "Hello! How can I help?" }
  ]
}
```

**Validation:**
- `language`, `mode`, `level` validated against constants
- `message` must be a non-empty string
- `history` defaults to `[]` if not provided

**Response:** `ReadableStream` of `text/plain`

The response streams progressively. Read it with:

```ts
const reader = response.body.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value);
  // Append chunk to display
}
```

### GET /api/speech-token

Exchange the server-side Azure Speech key for a short-lived browser token.

**Request:** No body (GET request).

**Response (200):**

```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciO...",
  "region": "eastus"
}
```

The token expires after 10 minutes. The browser uses it to initialize the Azure Speech SDK for STT and TTS.

## Scoring

### POST /api/score

Evaluate a completed session using Gemini Flash.

**Request:**

```json
{
  "sessionId": "550e8400-..."
}
```

The API fetches the session's transcripts from the database, builds a scoring prompt, and sends it to Gemini Flash for evaluation.

**Response (200):**

```json
{
  "fluency": 72,
  "vocabulary": 65,
  "grammar": 68,
  "pronunciation": 78,
  "overall": 71,
  "feedback": "Good effort! Your fluency is improving...",
  "strengths": [
    "Used varied vocabulary when describing hobbies",
    "Maintained conversation flow without long pauses"
  ],
  "improvements": [
    "You said 'I am go' -- correct: 'I am going'",
    "Missing article: 'I want book' -- correct: 'I want a book'"
  ],
  "suggested_next": "grammar:intermediate",
  "xp": 65,
  "bangla_fallback_count": 3
}
```

All score dimensions are 0-100 integers. XP ranges from 10 to 100. `bangla_fallback_count` tracks how many times the learner switched to Bangla during target language practice.

## Audio Upload

### POST /api/upload-audio

Upload a recorded session audio file to Supabase Storage.

**Request:** `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `audio` | File | Audio file (webm, ogg, mp4, wav) |
| `sessionId` | string | Session UUID |

**Validation:**
- File must be present and non-empty
- MIME type must start with `audio/`
- `sessionId` must be a non-empty string

**Response (200):**

```json
{
  "path": "550e8400-.../recording.webm"
}
```

## Admin API

All admin endpoints require a valid `bhasha_admin` cookie (set via the login endpoint).

### POST /api/admin/auth

Authenticate as admin.

**Request:**

```json
{
  "password": "your-admin-password"
}
```

**Response (200) on success:**

```json
{
  "success": true
}
```

Sets an HTTP-only `bhasha_admin` cookie with 24-hour expiry.

**Response (401) on failure:**

```json
{
  "error": "Invalid password"
}
```

### GET /api/admin/dashboard

Fetch dashboard statistics.

**Response (200):**

```json
{
  "totalSessions": 142,
  "todaySessions": 12,
  "weekSessions": 47,
  "avgScore": 68.5,
  "avgDuration": 312
}
```

### GET /api/admin/sessions

List sessions with optional filters.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `language` | string | Filter by language |
| `mode` | string | Filter by mode |
| `from` | string | Start date (ISO 8601) |
| `to` | string | End date (ISO 8601) |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 20) |

**Response (200):**

```json
{
  "sessions": [
    {
      "id": "550e8400-...",
      "started_at": "2026-06-25T10:30:00Z",
      "language": "english",
      "mode": "conversation",
      "level": "intermediate",
      "voice_type": "gemini",
      "user_name": "Rahim",
      "duration_seconds": 342,
      "status": "completed",
      "session_scores": [{ "overall": 72 }]
    }
  ],
  "total": 142,
  "page": 1,
  "limit": 20
}
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Description of what went wrong"
}
```

Common HTTP status codes:

| Code | Meaning |
|------|---------|
| 400 | Invalid input (missing fields, bad values) |
| 401 | Unauthorized (admin routes without valid cookie) |
| 404 | Resource not found |
| 405 | Method not allowed |
| 500 | Server error (database failure, API error) |
