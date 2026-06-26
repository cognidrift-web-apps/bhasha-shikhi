# BhashaShikhi UI/UX Overhaul Design Spec

## Goal

Transform BhashaShikhi from a functional prototype into a visually outstanding, modern language learning app. The redesign covers color system, typography, all 5 pages (landing, practice setup, voice session, results, admin), Bengali text localization (Dhaka casual), animations, and micro-interactions.

## Architecture

Pure frontend redesign. No backend, API, database, or relay changes. All work happens in:
- `tailwind.config.ts` (color system, animations)
- `src/app/globals.css` (global styles, keyframes)
- `src/app/layout.tsx` (font loading)
- `src/lib/constants.ts` (Bengali text)
- `src/components/**` (all components)
- `src/app/**/page.tsx` (all pages)

## Global Constraints

- All Bengali text uses Dhaka casual register (tumi form, English-Bangla code-switch)
- No emoji anywhere in the UI
- No em-dash characters
- No AI/tech branding visible to users ("Powered by", model names, etc.)
- Minimum 44px touch targets on all interactive elements
- Mobile-first (360px base), responsive to desktop
- Tailwind CSS only, no CSS modules, no styled-components
- No new npm dependencies (CSS-only animations, no framer-motion)
- TypeScript strict mode
- Font stack: Inter (English), Noto Sans Bengali (Bengali), JetBrains Mono (mono)

---

## 1. Color System

### Primary Palette -- Indigo to Cyan

Replace the current teal brand palette with an indigo-cyan gradient family.

| Token | Hex | Usage |
|-------|-----|-------|
| `primary-50` | `#EEF2FF` | Selected card backgrounds, hover states |
| `primary-100` | `#E0E7FF` | Light accent backgrounds |
| `primary-200` | `#C7D2FE` | Borders on hover |
| `primary-300` | `#A5B4FC` | Disabled states, subtle borders |
| `primary-400` | `#818CF8` | Secondary text accents |
| `primary-500` | `#6366F1` | Primary buttons, links, selected borders |
| `primary-600` | `#4F46E5` | Button hover, active links |
| `primary-700` | `#4338CA` | Button pressed/active |
| `primary-800` | `#3730A3` | Dark text on light bg |
| `primary-900` | `#312E81` | Session page dark background |
| `primary-950` | `#1E1B4B` | Deepest dark (session page gradient end) |

| Token | Hex | Usage |
|-------|-----|-------|
| `accent-300` | `#67E8F9` | Orb listening glow, gradient end |
| `accent-400` | `#22D3EE` | Highlights, user bubble gradient end |
| `accent-500` | `#06B6D4` | Secondary buttons, links |

| Token | Hex | Usage |
|-------|-----|-------|
| `warm-400` | `#FBBF24` | Orb speaking glow (amber) |
| `warm-500` | `#F59E0B` | Orb speaking primary |
| `warm-600` | `#D97706` | Speaking state active |

Keep existing `surface-*` (warm stone) neutrals for backgrounds and text.

### Gradient Tokens (CSS custom properties)

```css
--gradient-primary: linear-gradient(135deg, #6366F1, #06B6D4);
--gradient-hero: linear-gradient(135deg, #1E1B4B 0%, #312E81 40%, #4338CA 100%);
--gradient-button: linear-gradient(135deg, #6366F1, #4F46E5);
--gradient-orb-listen: radial-gradient(circle at 35% 35%, #67E8F9, #06B6D4);
--gradient-orb-speak: radial-gradient(circle at 35% 35%, #FBBF24, #F59E0B);
--gradient-orb-idle: radial-gradient(circle at 35% 35%, #A5B4FC, #6366F1);
```

### Where Colors Change

| Component | Old Color | New Color |
|-----------|----------|-----------|
| Primary buttons | `bg-brand-600` (teal #0d9488) | `bg-primary-500` (indigo #6366F1) |
| Button hover | `hover:bg-brand-700` | `hover:bg-primary-600` |
| Selected card border | `border-brand-500` | `border-primary-500` |
| Selected card bg | `bg-brand-50` | `bg-primary-50` |
| Orb idle | teal gradient | indigo gradient |
| Orb listening | brighter teal | cyan gradient |
| Orb speaking | orange gradient | amber gradient (keep warm) |
| User chat bubble | `bg-brand-600` | gradient primary (indigo-to-cyan) |
| Score circle stroke | `brand-700` | gradient primary |
| Score dimension bars | `bg-brand-500` | gradient primary |
| Feature card accent | `text-accent-500` (orange) | `text-accent-500` (cyan) |
| Utility mode selected | `border-accent-500` (orange) | `border-accent-500` (cyan) |

---

## 2. Landing Page -- Interactive Demo Hero

### Layout

```
+--------------------------------------------------+
| [gradient mesh background #1E1B4B -> #4338CA]     |
|                                                    |
|  LEFT SIDE (60%)        RIGHT SIDE (40%)          |
|  +------------------+  +--------------------+     |
|  | "ভাষাশিখি" logo  |  | [Polished CSS Orb] |     |
|  |                  |  |   (pulsing gently)  |     |
|  | কথা বলে          |  +--------------------+     |
|  | ভাষা শিখো        |  | [Mock conversation] |     |
|  |                  |  | bubble 1 (tutor)    |     |
|  | "Learn Languages |  | bubble 2 (user)     |     |
|  |  by Talking"     |  | bubble 3 (tutor)    |     |
|  |                  |  | (auto-animating)    |     |
|  | [শুরু করো|Start] |  +--------------------+     |
|  +------------------+                              |
+--------------------------------------------------+
| FEATURES SECTION (light bg)                       |
| +----------+ +----------+ +----------+            |
| | Card 1   | | Card 2   | | Card 3   |            |
| | icon     | | icon     | | icon     |            |
| | title bn | | title bn | | title bn |            |
| | desc     | | desc     | | desc     |            |
| +----------+ +----------+ +----------+            |
| +----------+ +----------+                          |
| | Card 4   | | Card 5   |                          |
| +----------+ +----------+                          |
+--------------------------------------------------+
| BhashaShikhi (footer)                              |
+--------------------------------------------------+
```

### Mobile Layout

On mobile (<768px), stack vertically: headline + CTA on top, animated demo below (smaller orb, 2 bubbles instead of 3).

### Hero Details

- **Background**: CSS gradient mesh using multiple radial gradients layered on the dark indigo base. Not an image -- pure CSS.
- **Logo text**: "ভাষাশিখি" in gradient text (indigo-to-cyan, `bg-clip-text text-transparent`).
- **Headline**: "কথা বলে ভাষা শিখো" (2 lines, Bengali, 3xl mobile / 5xl desktop). White text with subtle text-shadow glow.
- **Subtitle**: "Learn Languages by Actually Talking" in English, `text-primary-200`, smaller.
- **CTA button**: Gradient bg (indigo-to-cyan), white text, rounded-xl, "শুরু করো | Start Now". 16px padding, subtle shadow, scale(1.02) on hover.

### Mock Conversation Animation

Right side shows a looping simulated conversation:
1. Tutor bubble fades in: "হাই! আমি প্রিয়া। আজকে কী শিখবে?" (delay 0s)
2. User bubble slides in from right: "I want to practice English" (delay 1.5s)
3. Tutor bubble fades in: "Sure! Let's start with introductions. Tell me your name?" (delay 3s)
4. Pause 2s, then all fade out and loop

Bubbles use `@keyframes` for entrance (translateY + opacity). Tutor bubbles: dark glass bg (`rgba(255,255,255,0.1)`, backdrop-blur). User bubbles: gradient bg (primary).

### Feature Cards

- **Container**: Light background (`surface-50`), max-w-5xl centered, py-20.
- **Cards**: White bg, rounded-2xl, p-6, subtle shadow (`shadow-md`), hover: `shadow-lg` + translateY(-2px) transition.
- **Icon**: SVG icon in a 48px circle with `bg-primary-50` and `text-primary-500`. Icons: mic (word by word), chat-bubble (conversation), globe (roleplay), waveform (pronunciation), book (grammar), headphones (listening), translate (live translation).
- **Title**: Bengali name as primary (`text-lg font-bold text-stone-900`), English name below (`text-sm text-stone-500`).
- **Description**: `text-sm text-stone-600 leading-relaxed`.
- **Grid**: 3 columns desktop, 2 columns tablet, 1 column mobile.

---

## 3. Practice Setup Page -- Premium Card Layout

### Section Headers

Each section uses Bengali as the primary label:

```
কোন ভাষা শিখবে?
Which language?
```

Bengali: `text-lg font-semibold text-stone-900 font-bengali`
English: `text-sm text-stone-400 mt-0.5`

### Language Cards (2x2 grid)

Each card (min-h 72px):
- **Flag**: Large text (24px) -- actual flag characters or 2-letter code in a colored circle
- **Language name**: English bold (`text-base font-semibold`), Bengali below (`text-sm text-stone-500`)
- **Unselected**: `border border-stone-200 bg-white rounded-xl`, hover: `border-primary-300 shadow-sm`
- **Selected**: `border-2 border-primary-500 bg-primary-50 rounded-xl shadow-sm` + a 3px left-edge accent bar in gradient (primary)

### Mode Cards (2-column grid)

Each card (min-h 80px):
- **Left accent bar**: 3px wide, rounded, `bg-primary-500` when selected, `bg-stone-200` when not
- **Icon**: 32px SVG in `text-primary-500` (or `text-stone-400` unselected)
- **Bengali name**: Primary text, `text-base font-semibold font-bengali`
- **Bengali description**: Secondary, `text-sm text-stone-500 font-bengali`
- **Duration pill**: Top-right corner, `text-xs bg-stone-100 text-stone-500 rounded-full px-2 py-0.5`
- **Selected**: `border-primary-500 bg-primary-50`
- **Unselected**: `border-stone-200 bg-white`, hover: `border-primary-200`

Utility modes (live_translation) get a different accent color: `accent-500` (cyan) instead of primary.

### Level Selector (3 horizontal pills)

Horizontal row of pill-shaped buttons:
- **Unselected**: `border border-stone-200 bg-white text-stone-700 rounded-full px-6 py-3`
- **Selected**: `bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full px-6 py-3 shadow-sm`
- Show Bengali name only (not both English + Bengali -- the levels are self-explanatory)

### Voice Selector (horizontal cards)

Each voice card (side by side):
- **Avatar circle**: 56px, gradient border ring (primary-to-accent) when selected, `border-stone-200` when not. Letter initial inside.
- **Name**: `text-base font-semibold` (English name), Bengali name in parens
- **Bio**: Bengali bio, `text-sm text-stone-500`
- **Selected**: Gradient border ring, `bg-primary-50`

### Start Button

Full-width, rounded-xl, min-h 56px:
- `bg-gradient-to-r from-primary-500 to-primary-600`
- White text, `text-lg font-semibold`
- "শুরু করো | Start"
- Hover: `from-primary-600 to-primary-700`, subtle scale(1.01)
- Shadow: `shadow-lg shadow-primary-500/25`

---

## 4. Voice Session Page -- Dark Immersive

This is the only dark-themed page. The dark background creates focus and makes the orb the centerpiece.

### Background

Full-screen gradient: `bg-gradient-to-b from-primary-950 via-primary-900 to-primary-950` (#1E1B4B -> #312E81 -> #1E1B4B).

### Top Bar

- Semi-transparent: `bg-white/5 backdrop-blur-sm`
- No hard border (remove `border-b`)
- Left: Mode name in Bengali (`text-white/80 font-bengali text-sm`)
- Center: Language name (`text-white/60 text-sm`)
- Right: Timer in mono font (`text-white/80 font-mono text-sm`)

### Polished CSS Orb (centerpiece)

Size: 180px (mobile) / 220px (desktop).

Structure (concentric layers):
1. **Outer ring 1** (240px): Faint border, expanding animation on listening/speaking
2. **Outer ring 2** (200px): Slightly brighter, offset animation timing
3. **Main orb** (180px): Solid gradient circle with box-shadow glow
4. **Inner highlight** (pseudo-element): Small bright spot at 30% 30% for 3D depth

State animations:

**Idle:**
- Gradient: `radial-gradient(circle at 35% 35%, #A5B4FC, #6366F1)` (light indigo to indigo)
- Box-shadow: `0 0 40px 10px rgba(99, 102, 241, 0.3)`
- Animation: gentle breathing pulse 3s, scale 1.0 -> 1.03
- Outer rings: invisible

**Listening:**
- Gradient: `radial-gradient(circle at 35% 35%, #67E8F9, #06B6D4)` (cyan family)
- Box-shadow: `0 0 60px 20px rgba(6, 182, 212, 0.4)`
- Animation: pulse 1.2s, scale 1.0 -> 1.06
- Outer ring 1: visible, expanding 2s infinite, `border-color: rgba(6, 182, 212, 0.3)`
- Outer ring 2: visible, expanding 2s infinite (0.5s delay), `border-color: rgba(6, 182, 212, 0.15)`

**Speaking:**
- Gradient: `radial-gradient(circle at 35% 35%, #FBBF24, #F59E0B)` (amber/gold)
- Box-shadow: `0 0 70px 24px rgba(245, 158, 11, 0.45)`
- Animation: energetic pulse 0.6s, scale 1.0 -> 1.08
- Outer ring 1: visible, expanding 1s infinite, `border-color: rgba(245, 158, 11, 0.3)`
- Outer ring 2: visible, expanding 1s infinite (0.3s delay), `border-color: rgba(245, 158, 11, 0.15)`

**Transitions:** All state changes use `transition: background 0.5s, box-shadow 0.5s` for smooth morphing.

### State Label

Below orb, centered:
- Bengali text (`text-white/90 font-bengali text-base`)
- Text-shadow glow: `0 0 20px rgba(99, 102, 241, 0.4)` (matches orb color)
- Labels: "শুনছি..." (listening), "বলছি..." (speaking), "অপেক্ষায়..." (idle)

### Transcript Panel

Bottom 35% of screen:
- Container: `bg-white/5 backdrop-blur-md rounded-t-3xl` (glassmorphism)
- Empty state: "কথাবার্তা এখানে দেখাবে" in `text-white/40`
- **User bubbles**: `bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-2xl rounded-br-sm`
- **Tutor bubbles**: `bg-white/10 text-white/90 rounded-2xl rounded-bl-sm backdrop-blur-sm`
- Entrance animation: `@keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }` duration 0.3s
- Auto-scroll to bottom on new message

### End Session Button

Bottom-fixed, centered:
- Small pill shape (not full-width): `bg-red-500/80 hover:bg-red-500 text-white rounded-full px-6 py-2.5 text-sm backdrop-blur-sm`
- "সেশন শেষ" (no English needed here)

---

## 5. Results Page -- Celebration

### Background

Light theme (`bg-surface-50`). Clean, celebratory.

### Score Circle

- Size: 160px (up from 140px)
- Stroke: 8px wide, uses `stroke-dasharray` animation
- Stroke color: Gradient effect via SVG `<linearGradient>` from primary-500 to accent-500
- Track: `stroke: surface-200`
- Center text: Score number in `text-4xl font-mono font-bold text-stone-900`, "%" in `text-lg text-stone-500`, "ওভারঅল" in `text-sm font-bengali text-stone-400`
- Count-up animation: Number counts from 0 to final score over 1.5s using requestAnimationFrame

### Dimension Bars

4 bars (Fluency, Vocabulary, Grammar, Pronunciation):
- Label: English name + Bengali name side by side, score percentage right-aligned
- Bar track: `bg-stone-100 rounded-full h-2.5`
- Bar fill: `bg-gradient-to-r from-primary-500 to-accent-400 rounded-full h-2.5`
- Fill animation: width 0% -> final% over 0.8s, staggered by 150ms per bar
- All bars use CSS transition on width property

### XP Badge

- Larger pill: `bg-primary-50 border border-primary-200 rounded-full px-5 py-2`
- "+X XP" in `text-xl font-mono font-bold text-primary-600`
- "পেয়েছো" in `text-sm font-bengali text-primary-500`

### Bangla Fallback Badge

- If count > 0: `text-warm-600 text-sm font-bengali`
- "X বার বাংলায় চলে গেছো" (tumi form)

### Feedback Sections

**Strengths card:**
- Left border: 3px `bg-emerald-500`
- Header: "ভালো করেছো (Strengths)" in `text-emerald-700`
- Items: Green bullet + text

**Improvements card:**
- Left border: 3px `bg-amber-500`
- Header: "আরো ভালো করতে পারো (To Improve)" in `text-amber-700`
- Items: Amber bullet + text

**Next step card:**
- `bg-primary-50 border border-primary-200 rounded-xl p-4`
- "পরের ধাপ (Next Step)" header

### Action Buttons

- Primary: "আবার প্র্যাকটিস করো | Practice Again" -- gradient button (same as start button)
- Secondary: "অন্য মোড ট্রাই করো | Try Different Mode" -- outlined, `border-stone-300 text-stone-700 hover:border-primary-300`

---

## 6. Bengali Text -- Complete Replacement Map

Every user-facing Bengali string in the app, old vs new:

### Constants (`src/lib/constants.ts`)

**MODES array:**

| Field | Old | New |
|-------|-----|-----|
| word_by_word.namebn | একটা একটা শব্দ | একটা একটা শব্দ (keep) |
| word_by_word.descriptionbn | একটা একটা করে শব্দ শিখুন, মানে, উচ্চারণ আর ব্যবহার সহ | একটা একটা করে শব্দ শিখো -- মানে, উচ্চারণ আর ব্যবহার সহ |
| conversation.namebn | আড্ডা | আড্ডা (keep) |
| conversation.descriptionbn | যেকোনো বিষয়ে আপনার টিউটরের সাথে কথা বলুন | যেকোনো টপিকে তোমার টিউটরের সাথে আড্ডা দাও |
| roleplay.namebn | পরিস্থিতি | সিচুয়েশন প্র্যাকটিস |
| roleplay.descriptionbn | আসল পরিস্থিতি প্র্যাকটিস করুন: ইন্টারভিউ, ডাক্তার, এয়ারপোর্ট | রিয়েল লাইফ সিচুয়েশন প্র্যাকটিস করো -- ইন্টারভিউ, ডাক্তার, এয়ারপোর্ট |
| pronunciation.namebn | উচ্চারণ ঠিক করি | উচ্চারণ ফিক্স |
| pronunciation.descriptionbn | বাংলাভাষীদের কঠিন উচ্চারণগুলো ঠিক করুন | যে সাউন্ডগুলো বাঙালিদের কঠিন লাগে, সেগুলো ঠিক করো |
| grammar.namebn | কথায় কথায় গ্রামার | গ্রামার ইন কথাবার্তা |
| grammar.descriptionbn | কথা বলতে বলতে গ্রামার শিখুন, রুল মুখস্থ না করে | কথা বলতে বলতে গ্রামার শিখো, রুল মুখস্থ না করে |
| listening.namebn | শুনে বুঝি | লিসেনিং চ্যালেঞ্জ |
| listening.descriptionbn | একটা কিছু শুনুন আর প্রশ্নের উত্তর দিন | কিছু শোনো আর প্রশ্নের উত্তর দাও |
| live_translation.namebn | লাইভ অনুবাদ | লাইভ ট্রান্সলেশন |
| live_translation.descriptionbn | যেকোনো ভাষায় বলুন, সাথে সাথে অন্য ভাষায় অনুবাদ পান | যেকোনো ভাষায় বলো, সাথে সাথে অন্য ভাষায় ট্রান্সলেশন পাও |

**LEVELS array:**

| Field | Old | New |
|-------|-----|-----|
| beginner.namebn | একদম নতুন | নতুন শুরু |
| intermediate.namebn | মোটামুটি জানি | মোটামুটি পারি |
| advanced.namebn | ভালো জানি | বেশ ভালো পারি |

**VOICES array:**

| Field | Old | New |
|-------|-----|-----|
| priya.biobn | মায়াবী আর ধৈর্যশীল টিউটর | ফ্রেন্ডলি আর পেশেন্ট টিউটর |
| nabanita.biobn | পরিষ্কার আর উৎসাহী গাইড | ক্লিয়ার আর এনকারেজিং গাইড |

### Page-level strings

| Location | Old | New |
|----------|-----|-----|
| Hero headline | কথা বলে বলে ইংলিশ, জার্মান, আরবি বা হিন্দি শিখুন | কথা বলে ভাষা শিখো |
| Hero CTA | শুরু করুন \| Start Now | শুরু করো \| Start Now |
| Practice page title | কী প্র্যাকটিস করবেন? | কী প্র্যাকটিস করবে? |
| Practice back link | ফিরে যান | পিছনে যাও |
| Practice start button | শুরু করুন \| Start | শুরু করো \| Start |
| Language section header | কোন ভাষা শিখবেন? | কোন ভাষা শিখবে? |
| Mode section header | কী করতে চান? | কী করতে চাও? |
| Level section header | এখন কেমন পারেন? | তোমার লেভেল কোনটা? |
| Voice section header | কোন টিউটর চান? | টিউটর বাছো |
| Utility modes label | টুল | টুলস |
| Session state: idle | অপেক্ষায় আছি | অপেক্ষায়... |
| Session state: listening | শুনছি... | শুনছি... (keep) |
| Session state: thinking | ভাবছি... | ভাবছি... (keep) |
| Session state: speaking | বলছি... | বলছি... (keep) |
| Session end button | সেশন শেষ করুন | সেশন শেষ |
| Session ending text | সেশন শেষ হচ্ছে... | সেশন শেষ হচ্ছে... (keep) |
| Session error text | সংযোগে সমস্যা হয়েছে। | কানেকশনে প্রবলেম হয়েছে |
| Session retry button | আবার চেষ্টা করুন | আবার ট্রাই করো |
| Transcript empty | কথোপকথন এখানে দেখাবে | কথাবার্তা এখানে দেখাবে |
| Results loading | স্কোর হিসাব করা হচ্ছে... | স্কোর বের করছি... |
| Results error | স্কোর পাওয়া যায়নি। | স্কোর পাওয়া যায়নি (keep) |
| Results back link | প্র্যাকটিস পেজে ফিরুন | প্র্যাকটিস পেজে ফিরে যাও |
| Results header bn | সেশন রিপোর্ট কার্ড | সেশন রিপোর্ট কার্ড (keep) |
| Results practice again | আবার প্র্যাকটিস করুন \| Practice Again | আবার প্র্যাকটিস করো \| Practice Again |
| Results try different | অন্য মোড ট্রাই করুন \| Try Different Mode | অন্য মোড ট্রাই করো \| Try Different Mode |
| Score overall label | ওভারঅল | ওভারঅল (keep) |
| XP earned label | পেয়েছেন | পেয়েছো |
| Bangla fallback | X বার বাংলায় চলে গেছেন | X বার বাংলায় চলে গেছো |
| Strengths header | ভালো করেছেন | ভালো করেছো |
| Improvements header | উন্নতি করুন | আরো ভালো করতে পারো |
| Next step header | পরের ধাপ | পরের ধাপ (keep) |
| Features: 7 ways | ৭ রকমে প্র্যাকটিস | ৭ রকম প্র্যাকটিস |
| Features: talk | টাইপ না, কথা বলুন | টাইপ না, কথা বলো |
| Features: 4 langs | ৪টা ভাষা | ৪টা ভাষা (keep) |
| Features: detector | বাংলা ভুল ধরি | বাংলা ভুল ধরি (keep) |
| Features: no account | একাউন্ট লাগবে না | একাউন্ট লাগবে না (keep) |

### Pattern Rules

1. Always use **tumi** form: করো, শিখো, বলো, দাও, যাও (not করুন, শিখুন, বলুন, দিন, যান)
2. Use **তোমার/তুমি** (not আপনার/আপনি)
3. Use English-Bangla code-switch words Dhaka people actually use: ফিক্স, সিচুয়েশন, লেভেল, ট্রাই, প্র্যাকটিস, চ্যালেঞ্জ, ট্রান্সলেশন, টপিক, ফ্রেন্ডলি, পেশেন্ট, ক্লিয়ার, এনকারেজিং, প্রবলেম, কানেকশন
4. Avoid overly formal/literary Bengali: পরিস্থিতি -> সিচুয়েশন, কথোপকথন -> কথাবার্তা, সংযোগ -> কানেকশন, উন্নতি -> ভালো

---

## 7. CSS Animations

All animations defined in `globals.css` as `@keyframes`:

```
orb-breathe: scale 1 -> 1.03 -> 1 (3s)
orb-pulse: scale 1 -> 1.06 -> 1 (1.2s)
orb-energetic: scale 1 -> 1.08 -> 1 (0.6s)
ring-expand: scale 1 -> 1.8, opacity 0.5 -> 0 (2s)
ring-expand-fast: scale 1 -> 1.8, opacity 0.5 -> 0 (1s)
slide-up: translateY(12px) opacity(0) -> translateY(0) opacity(1) (0.3s)
fade-in: opacity(0) -> opacity(1) (0.5s)
fade-up: translateY(20px) opacity(0) -> translateY(0) opacity(1) (0.6s)
count-up: (handled via JS requestAnimationFrame, not CSS)
bar-fill: width 0% -> var(--target-width) (0.8s ease-out)
hero-bubble-in: translateY(16px) opacity(0) -> translateY(0) opacity(1) (0.5s)
hero-bubble-out: opacity(1) -> opacity(0) (0.3s)
gradient-shift: background-position 0% -> 100% (3s, for animated gradient backgrounds)
hover-lift: translateY(0) -> translateY(-2px) (0.2s)
```

---

## 8. Admin Panel (Light Touch)

Minimal changes -- not user-facing:

- Replace `brand-*` color references with `primary-*` throughout admin components
- Table rows: `hover:bg-primary-50` instead of current hover
- Score badges: green (70+), amber (40-69), red (<40) background pills
- Status badges: keep current colors (green completed, red abandoned, amber other)
- Admin login button: `bg-primary-500 hover:bg-primary-600`
- "View All Sessions" button: `border-primary-300 text-primary-700 hover:bg-primary-50`

No structural or layout changes to admin pages.

---

## 9. Component Architecture

No new components needed. All changes happen within existing component files:

| File | Changes |
|------|---------|
| `tailwind.config.ts` | Replace brand palette with primary/accent/warm, add keyframe animations |
| `src/app/globals.css` | Add all @keyframes, gradient CSS variables, animation utility classes |
| `src/app/layout.tsx` | No changes (fonts stay the same) |
| `src/lib/constants.ts` | All Bengali text replacements |
| `src/components/landing/hero.tsx` | Complete rewrite -- dark gradient bg, two-column layout, animated mock conversation |
| `src/components/landing/features.tsx` | New card design with icons, updated Bengali text |
| `src/app/practice/page.tsx` | Updated section headers, button styles |
| `src/components/setup/language-selector.tsx` | New card design with left accent bar |
| `src/components/setup/mode-selector.tsx` | New card design with icons and accent bar |
| `src/components/setup/level-selector.tsx` | Pill shape instead of cards |
| `src/components/setup/voice-selector.tsx` | Avatar gradient ring, new layout |
| `src/app/session/page.tsx` | Dark theme, new layout, glassmorphism transcript |
| `src/components/session/voice-orb.tsx` | Complete rewrite -- multi-ring, new gradients, new animations |
| `src/components/session/transcript-panel.tsx` | Dark theme bubbles, slide-up animation |
| `src/app/results/page.tsx` | Updated colors, animations |
| `src/components/results/score-card.tsx` | Gradient SVG stroke, count-up animation |
| `src/components/results/feedback-panel.tsx` | New card styles, updated Bengali text |
| Admin components | Color swap only (brand -> primary) |

---

## 10. Files NOT Changed

- `src/hooks/*` -- no logic changes
- `src/app/api/*` -- no backend changes
- `relay/*` -- no relay changes
- `supabase/*` -- no database changes
- `public/*` -- no asset changes
- Test files -- no test changes (tests cover logic, not styling)

---

## 11. Testing

- Visual testing only (browser). No unit test changes needed.
- Test on: Chrome mobile (360px), Chrome desktop (1440px), Safari mobile
- Check: all touch targets >= 44px, all text readable, all animations smooth, orb state transitions work, dark session page contrast ratios pass WCAG AA for text
- Verify: no "gemini", "microsoft", "azure", "AI" text visible anywhere in the UI
