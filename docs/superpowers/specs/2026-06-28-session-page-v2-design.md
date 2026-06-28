# Session Page v2 -- Immersive Orb Design

## Goal

Redesign the session page into a full-screen, orb-dominant, voice-first experience. Remove the separate end-session button, integrate session control into the orb via double-tap, and add a pull-up transcript sheet with dual-line Bengali script + target language display.

## Architecture

The session page becomes three visual layers on a full-viewport canvas: a floating header, a dominant orb zone, and a collapsible transcript bottom sheet. No glass bars, no borders breaking the visual flow. The orb is the primary interaction surface -- it communicates state visually and accepts the double-tap-to-end gesture. Transcripts are secondary, tucked into a pull-up sheet that shows the last message by default and expands on drag.

## Global Constraints

- All Bengali text uses everyday Bangladeshi Bangla (Dhaka casual), never formal/literary
- No emoji in UI copy
- No AI/tech branding visible to users -- no "Powered by" anything
- Minimum 44px touch targets, mobile-first (360px base)
- Tailwind CSS only, no CSS modules
- TypeScript strict mode
- No new dependencies unless absolutely necessary (prefer native CSS/JS for animations)
- Existing WebGL orb shader is unchanged -- only its container sizing and tap handling change

## Screens & Components

### 1. Page Layout (`src/app/session/page.tsx`)

**Current**: Glass header bar + orb + transcript panel + fixed red end-session button footer.

**New**: Full-viewport `min-h-dvh` flex column with `bg-page-mesh`. Three zones:

- **Floating header** (shrink-0): ~48px. No background, no border. Just floating text.
- **Orb zone** (flex-1): Orb centered vertically and horizontally. State text below orb.
- **Transcript sheet** (absolute/fixed, bottom): Collapsed ~120px, expandable to ~70vh.

No glass-bar header. No red button. No fixed footer.

### 2. Floating Header

A simple flex row floating over the mesh background.

| Position | Content | Styling |
|----------|---------|---------|
| Left | Mode name in Bengali (e.g. "আড্ডা") | `text-sm font-bengali text-slate-500/70` |
| Right | Timer (mm:ss) | `text-sm font-mono text-slate-500/70` |

- Padding: `px-6 pt-5`
- No background, no border, no glass effect
- Language label removed -- user already knows their selection

### 3. Orb Zone

The orb occupies the center of the flex-1 area (upper ~60% of viewport).

**Orb component** (`voice-orb.tsx`):
- Size unchanged: 200x200 mobile, 240x240 desktop
- Existing WebGL shader, existing state colors (purple idle, cyan listening, blue speaking)
- New: `cursor-pointer` when connected, wrapped in a tappable container

**State text** below orb:
- "সংযুক্ত হচ্ছে..." (connecting) -- `text-slate-400`
- "শুনছি..." (listening) -- `text-cyan-500`
- "বলছি..." (speaking) -- `text-primary-500`
- "আবার ট্যাপ করুন শেষ করতে" (tap again to end) -- `text-red-400`, shown during end-confirm window
- Font: `text-sm font-bengali`, centered below orb with `mt-3`

### 4. Double-Tap to End

**Interaction flow**:

1. User taps orb (first tap, `status === "connected"`):
   - Orb pulses: scale `1.0 -> 1.05 -> 1.0` over 300ms (CSS transform + transition)
   - State text changes to "আবার ট্যাপ করুন শেষ করতে"
   - A 2-second timer starts (`endConfirmTimeout`)
2. If user taps again within 2 seconds (second tap):
   - Orb animates: scale `1.0 -> 0.8`, opacity `1 -> 0`, 400ms ease-out
   - Session ends (calls `disconnect()`, navigates to `/results`)
3. If 2 seconds pass with no second tap:
   - State text reverts to current state (listening/speaking)
   - Orb returns to normal

**Implementation** (`src/app/session/page.tsx`):
- `endConfirmPending` boolean state
- `endConfirmTimer` ref for the 2s timeout
- `handleOrbTap()` function:
  - If not connected or connecting: no-op
  - If `endConfirmPending === false`: set to true, start 2s timer, pulse orb
  - If `endConfirmPending === true`: end session with exit animation
- Orb container div gets `onClick={handleOrbTap}`
- During connecting state: orb is not tappable (`pointer-events-none`)

### 5. Transcript Bottom Sheet

A pull-up bottom sheet component: `src/components/session/transcript-sheet.tsx`

**Collapsed state** (default):
- Position: fixed to bottom of viewport
- Height: 120px
- Background: glass-panel styling with `rounded-t-3xl`, backdrop blur
- Top edge: pill-shaped drag handle, 36px wide, 4px tall, `bg-slate-300/60 rounded-full`, centered with `mt-2`
- Content: last tutor message, truncated to 2 lines max with `line-clamp-2`
- Top fade: gradient overlay from transparent to glass background, 24px tall, masks content overflow upward

**Expanded state**:
- Height: 70vh
- Transition: 300ms ease-out (CSS transition on height or transform: translateY)
- Full scrollable transcript history with `overflow-y-auto`
- Auto-scrolls to bottom on new messages
- Drag handle remains visible at top

**Expand/collapse triggers**:
- Drag up on handle or sheet: expand (use touch events: `onTouchStart`, `onTouchMove`, `onTouchEnd` with a 50px drag threshold)
- Drag down on handle: collapse
- Tap dimmed orb area (when expanded): collapse
- On desktop: click the handle area to toggle

**When expanded**:
- Orb zone dims: scale `0.85`, opacity `0.4`, transition 300ms
- This is a CSS class toggle on the orb container, not a prop to the WebGL component
- Orb is still visible but clearly backgrounded

**When collapsed**:
- Orb returns to full scale and opacity

### 6. Transcript Message Format

**Tutor messages** (left-aligned):
```
┌─────────────────────────────────┐
│ আসসালামু আলাইকুম! আমি প্রিয়া।  │  <- Bengali script, font-bengali font-medium text-[#1E1B4B]
│ Assalamu Alaikum! I'm Priya.   │  <- Target language, text-sm text-slate-500 mt-0.5
└─────────────────────────────────┘
```
- Container: glass-card bubble, `rounded-3xl rounded-bl-sm`, `max-w-[85%]`, `p-4`
- Line 1 (Bengali script): `font-bengali font-medium text-[#1E1B4B] text-base`
- Line 2 (target language): `text-sm text-slate-500 mt-0.5`
- Animation: `animate-slide-up` (existing)

**User messages** (right-aligned):
```
                    ┌──────────────────┐
                    │ Hello, I'm Ratul │
                    └──────────────────┘
```
- Container: `bg-primary-600 text-white`, `rounded-3xl rounded-br-sm`, `max-w-[85%]`, `p-4`
- Single line in the target language
- Animation: `animate-slide-up`

**Empty state**: "কথাবার্তা এখানে দেখাবে" centered, `text-slate-400 text-sm font-bengali`

### 7. Bengali Script Translation

The Gemini `outputTranscription` produces Romanized Bengali or target language text. To get proper Bengali script, we add an async translation step.

**New API route**: `src/app/api/translate/route.ts`
- POST body: `{ text: string, toLang: "bn" }`
- Uses `gemini-3.5-flash` to translate/transliterate the text to Bengali script
- System prompt: "Transliterate or translate the following text into Bengali script (বাংলা). Return ONLY the Bengali text, nothing else. Use everyday Bangladeshi Bangla."
- Returns: `{ translated: string }`
- Error: returns `{ translated: null }` (graceful degradation)

**Client-side flow** (`use-gemini-live.ts` or a new `use-transcript-translation.ts` hook):
- When a tutor transcript is flushed to display, it shows immediately as the target language line
- An async call to `/api/translate` fires in the background
- When the translation returns, the Bengali script line fades in above the target language line
- If translation fails or is slow (>3s), display only the target language line -- no error shown
- Debounce: batch translate after a full turn completes (on `turn_complete` message) rather than per-word, to reduce API calls

**Rate limiting**: Max 1 translate call per tutor turn. The full turn text is sent as one request, not fragments.

### 8. State Management Changes

**`use-gemini-live.ts` updates**:
- `transcripts` array entries gain a new optional field: `bengaliText?: string`
- New state: `sheetExpanded: boolean` (or managed locally in the sheet component)
- Expose `endConfirmPending` is managed in session page, not the hook

**`TranscriptEntry` type update**:
```typescript
export interface TranscriptEntry {
  role: "user" | "tutor";
  content: string;        // target language / original transcription
  bengaliText?: string;   // Bengali script translation (tutor only)
  timestamp: number;
}
```

## Files Changed

| Action | File | Purpose |
|--------|------|---------|
| Modify | `src/app/session/page.tsx` | New layout, remove header bar + red button, add orb tap handler, orb dim on sheet expand |
| Create | `src/components/session/transcript-sheet.tsx` | Pull-up bottom sheet with drag gesture |
| Delete | `src/components/session/transcript-panel.tsx` | Replaced by transcript-sheet.tsx which handles both layout and message rendering |
| Modify | `src/components/session/voice-orb.tsx` | Add cursor-pointer, pulse animation CSS class |
| Modify | `src/hooks/use-gemini-live.ts` | Add `bengaliText` to TranscriptEntry type |
| Create | `src/hooks/use-transcript-translation.ts` | Async Bengali script translation hook |
| Create | `src/app/api/translate/route.ts` | Lightweight translation endpoint |
| Modify | `src/app/globals.css` | Add orb pulse keyframe, sheet transition classes |

## Files NOT Changed

- `relay/` -- no relay changes, transcript buffering already handled
- `src/components/setup/` -- setup wizard is a separate pass
- `src/components/results/` -- results page unchanged
- `src/components/landing/` -- landing page unchanged
- `src/lib/constants.ts` -- no new constants needed
- `tailwind.config.ts` -- no new theme values needed (use existing + inline)

## Out of Scope

- Setup wizard card redesign (separate spec)
- Landing page changes
- Results page changes
- Icon system overhaul
- Orb shader modifications (colors, geometry stay as-is)
- Audio playback changes
