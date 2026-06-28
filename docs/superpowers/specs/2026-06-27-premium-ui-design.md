# Premium UI Overhaul -- iOS Glass Design

> Replace flat white UI with frosted glass cards, gradient buttons, Phosphor duotone icons, centered layouts, and premium micro-interactions across all pages.

**Goal:** Transform BhashaShikhi from a functional but flat UI into a polished, soft, premium iOS-like experience using glassmorphism, Phosphor Icons (duotone weight), and refined spacing.

**Architecture:** Pure visual layer changes. No data flow, hook, or API changes. One new dependency (`@phosphor-icons/react`). All changes are in component files, globals.css, and tailwind.config.ts.

**Tech Stack:** Tailwind CSS (backdrop-blur, gradients), Phosphor Icons (duotone), CSS custom properties

## Global Constraints

- No emoji in UI copy
- TypeScript strict mode
- Tailwind CSS for all styling
- Minimum 44px touch targets
- All Bengali text in Dhaka casual tumi form
- No AI/tech branding visible to users
- One new dependency only: `@phosphor-icons/react`
- Must not look AI-designed -- restrained, intentional choices
- Mobile-first (360px base)

---

## 1. Page Background Mesh

Every `<main>` currently uses flat `bg-surface-page` (#F8F9FC). Add a subtle radial mesh so glass has something to blur against.

**New CSS class `bg-page-mesh`** in globals.css:

```css
.bg-page-mesh {
  background-color: #F8F9FC;
  background-image:
    radial-gradient(at 20% 30%, rgba(99,102,241,0.06) 0%, transparent 50%),
    radial-gradient(at 80% 70%, rgba(59,130,246,0.05) 0%, transparent 50%);
}
```

Apply to all `<main>` elements across pages. Replace `bg-surface-page` with `bg-page-mesh` where it's the page-level background.

Pages that use `bg-surface-page`:
- `src/app/session/page.tsx` (3 instances: main content, ending state, error state)
- `src/app/results/page.tsx` (1 instance)
- `src/app/error.tsx` (uses `min-h-screen` wrapper, no explicit bg -- add it)
- `src/app/not-found.tsx` (same as error)
- `src/components/landing/hero.tsx` (hero section has its own dark gradient -- keep it)
- `src/components/landing/features.tsx` (features section -- add mesh)
- Session footer uses `bg-surface-page` -- change to `bg-page-mesh`

The landing hero keeps its dark gradient (`--gradient-hero`). The features section below it and all other pages get `bg-page-mesh`.

---

## 2. Glass Card Styles

**Base glass card** (replaces current `bg-white` + `var(--shadow-card)`):

```
bg-white/70 backdrop-blur-xl border border-white/20 
shadow-lg shadow-blue-500/[0.03] rounded-2xl
```

**Glass card hover** (replaces `var(--shadow-card-hover)`):

```
hover:bg-white/80 hover:-translate-y-0.5 hover:shadow-xl
transition-all duration-300
```

### Where applied:

**Feature cards** (`src/components/landing/features.tsx`):
- Current: `rounded-2xl bg-white p-6` + inline `boxShadow: "var(--shadow-card)"`
- New: `rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg shadow-blue-500/[0.03] p-6 hover:bg-white/80 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300`
- Remove inline `boxShadow` style prop

**Setup selector cards -- unselected** (`language-selector.tsx`, `mode-selector.tsx`, `voice-selector.tsx`):
- Current: `border border-slate-200 bg-white hover:-translate-y-0.5` + inline shadow
- New: `rounded-2xl bg-white/60 backdrop-blur-lg border border-white/30 hover:bg-white/80 hover:-translate-y-0.5 transition-all duration-300`
- Remove inline `boxShadow` style prop

**Setup selector cards -- selected**:
- Current: `border-2 border-blue-500 bg-white` + inline shadow
- New: `rounded-2xl bg-white/80 backdrop-blur-xl border-2 border-primary-400 shadow-lg shadow-primary-500/10`
- Remove inline `boxShadow` style prop

**Level selector** (`level-selector.tsx`):
- Unselected: `rounded-2xl bg-white/60 backdrop-blur-lg border border-white/30 text-slate-700 hover:bg-white/80 hover:-translate-y-0.5 transition-all duration-300`
- Selected: keep `bg-primary-600 text-white rounded-2xl` (solid -- small element, glass would be fussy)
- Current uses `rounded-lg` -- bump to `rounded-2xl`

**Score card + feedback panel** (`results/page.tsx`):
- Current: `rounded-2xl bg-white p-6` + inline shadow
- New: `rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg shadow-blue-500/[0.03] p-6`

**Feedback sub-cards** (`feedback-panel.tsx` -- strengths/improvements/suggested):
- Keep the colored left borders (emerald/amber/blue) -- they add hierarchy
- Background: change `bg-white` to `bg-white/50 backdrop-blur-sm`

**Transcript panel** (`session/page.tsx`):
- Current: `bg-white rounded-t-2xl` + inline shadow
- New: `bg-white/70 backdrop-blur-xl rounded-t-3xl border-t border-white/30`
- Remove inline `boxShadow` style

**Bot message bubbles** (`transcript-panel.tsx`):
- Current: `bg-slate-100`
- New: `bg-white/60 backdrop-blur-sm`
- User bubbles: keep `bg-primary-600 text-white` (needs contrast)

**Session header** (`session/page.tsx`):
- Current: `bg-white border-b border-surface-border`
- New: `bg-white/60 backdrop-blur-xl border-b border-white/20`

**XP badge** (`feedback-panel.tsx`):
- Current: `bg-blue-50 border border-blue-200`
- New: `bg-blue-50/60 backdrop-blur-sm border border-blue-200/50`

---

## 3. Button Styles

### Primary CTA

Used by: hero "Start Now", setup wizard "Start", results "Practice Again"

```
bg-gradient-to-b from-primary-500 to-primary-600
text-white rounded-2xl font-semibold
shadow-lg shadow-primary-600/25
shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]
hover:shadow-xl hover:shadow-primary-600/30 hover:-translate-y-0.5
active:scale-[0.98]
transition-all duration-300
min-h-[44px]
```

Replace current `bg-primary-600 rounded-xl` on these buttons. The inner inset shadow creates the "lit from above" iOS effect.

Note on Tailwind shadow stacking: Tailwind's `shadow-*` and `shadow-[inset_...]` utilities conflict (last one wins). To combine them, use a CSS custom property approach in globals.css:

```css
.btn-primary {
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.2),
    0 10px 15px -3px rgba(37,99,235,0.25);
}
.btn-primary:hover {
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.2),
    0 20px 25px -5px rgba(37,99,235,0.30);
}
```

Then buttons use `btn-primary` class alongside Tailwind utilities for everything else.

### Secondary

Used by: results "Try Different Mode", setup wizard "Next" (reconsider -- see below)

```
bg-white/60 backdrop-blur-lg border border-white/30
text-slate-700 rounded-2xl font-semibold
hover:bg-white/80 hover:-translate-y-0.5
active:scale-[0.98]
transition-all duration-300
min-h-[44px]
```

Note: The setup wizard "Next" button is currently primary blue. It should stay primary since it's the main forward action. Only the "Try Different Mode" on results page uses secondary style.

### Ghost/Text

Used by: back buttons, navigation links, results back link

```
text-slate-500 hover:text-slate-700 transition-colors duration-300
```

No background, no border. Icon + text only.

### Danger (Session End)

```
bg-gradient-to-b from-red-400 to-red-500
text-white rounded-2xl font-semibold
shadow-lg shadow-red-500/25
shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]
hover:shadow-xl hover:shadow-red-500/30
active:scale-[0.98]
transition-all duration-300
min-h-[44px]
```

Same gradient + inset pattern as primary, but red. Apply via a `btn-danger` CSS class.

```css
.btn-danger {
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.2),
    0 10px 15px -3px rgba(239,68,68,0.25);
}
.btn-danger:hover {
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.2),
    0 20px 25px -5px rgba(239,68,68,0.30);
}
```

### Error/404 page buttons

Currently `rounded-lg bg-primary-500`. Change to primary CTA style (`btn-primary` + gradient classes).

---

## 4. Phosphor Icons

**Dependency:** `@phosphor-icons/react`

**Import pattern:**
```tsx
import { Microphone } from "@phosphor-icons/react";
// Usage:
<Microphone size={22} weight="duotone" />
```

All icons use `weight="duotone"` and `size={22}` unless noted.

### Icon Mapping

| Location | File | Current | Phosphor Import | Notes |
|----------|------|---------|----------------|-------|
| Features: "7 Ways" | `features.tsx` | Inline SVG grid | `SquaresFour` | |
| Features: "Talk" | `features.tsx` | Inline SVG mic | `Microphone` | |
| Features: "4 Languages" | `features.tsx` | Inline SVG globe | `GlobeHemisphereWest` | |
| Features: "Bangla Interference" | `features.tsx` | Inline SVG target | `Crosshair` | |
| Features: "No Account" | `features.tsx` | Inline SVG lock | `LockOpen` | |
| Mode: word_by_word | `mode-selector.tsx` | Inline SVG document | `TextAa` | |
| Mode: conversation | `mode-selector.tsx` | Inline SVG chat | `ChatCircleDots` | |
| Mode: roleplay | `mode-selector.tsx` | Inline SVG people | `UsersThree` | |
| Mode: pronunciation | `mode-selector.tsx` | Inline SVG waves | `Waveform` | |
| Mode: grammar | `mode-selector.tsx` | Inline SVG book | `BookOpen` | |
| Mode: listening | `mode-selector.tsx` | Inline SVG mic+waves | `Ear` | |
| Mode: live_translation | `mode-selector.tsx` | Inline SVG globe+speech | `Translate` | |
| Setup: back arrow | `setup-wizard.tsx` | Inline SVG chevron | `CaretLeft` | size={18} |
| Setup: next arrow | `setup-wizard.tsx` | Inline SVG chevron | `CaretRight` | size={18} |
| Results: back link | `results/page.tsx` | Inline SVG arrow | `ArrowLeft` | size={18} |
| Error page | `error.tsx` | None | `WarningCircle` | size={48}, add icon |
| 404 page | `not-found.tsx` | None | `MagnifyingGlass` | size={48}, add icon |

### Icon Containers

**Feature cards** (`features.tsx`):
- Current: `h-12 w-12 rounded-full bg-blue-50 text-blue-600`
- New: `h-11 w-11 rounded-xl bg-primary-50/80 backdrop-blur-sm text-primary-600 flex items-center justify-center`
- Shape change: `rounded-full` to `rounded-xl` (squircle = more iOS)

**Mode selector cards** (`mode-selector.tsx`):
- Current: `h-9 w-9 rounded-full` with `bg-blue-50`/`bg-slate-100`
- New: `h-10 w-10 rounded-xl` with `bg-primary-50/80`/`bg-slate-100/80 backdrop-blur-sm`
- Selected: `bg-primary-50/80 text-primary-600`
- Unselected: `bg-slate-100/80 text-slate-400`

**Error/404 pages:**
- Add a large icon above the text: `text-primary-400` with `size={48}`
- No container needed -- icon floats above the message

### Voice Selector Avatars

Keep as letter circles (`h-12 w-12 rounded-full bg-blue-100 text-blue-600`). These feel personal. Apply subtle glass: `bg-blue-100/70 backdrop-blur-sm`.

---

## 5. Layout and Alignment

### Landing Hero (`hero.tsx`)

**Current:** `grid grid-cols-1 md:grid-cols-5` with text left-aligned in `md:col-span-3` and orb in `md:col-span-2`.

**New:** Vertically stacked, centered layout:
```
flex flex-col items-center text-center gap-8
```
- Decorative orb on top
- Title below (centered)
- Subtitle below title
- CTA button below subtitle
- Remove the grid layout entirely

### Results Page (`results/page.tsx`)

**Current:** Content stacks left-aligned with full width.

**New:** Center-constrained:
```
max-w-lg mx-auto
```
- Score card and feedback panel centered within the max-width container
- CTA buttons centered: `flex flex-col sm:flex-row gap-3 justify-center`

### Error + 404 Pages

Already centered. Add:
- Phosphor icon above text
- Glass card wrapper: `rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 p-8 text-center`
- Page gets `bg-page-mesh`

### Spacing

Increase vertical breathing room across the app:
- Feature cards grid gap: `gap-6` stays (already good)
- Setup wizard content area: current padding stays but add `gap-8` between sections
- Results page sections: `gap-6` to `gap-8`
- Session page orb area: `py-8` to `py-10`

---

## 6. Micro-interactions

### Transition Timing
- All `transition-all` gets explicit `duration-300` (some currently default to 150ms)
- Hover effects: smooth and premium

### Session State Label
- Add `transition-colors duration-500` to the state label `<p>` tag in `session/page.tsx`
- Smooth color fade between purple/cyan/blue states

### Setup Step Transitions
- Current `animate-step-slide` keyframes stay as-is (already good)

### Score Card
- Existing 1500ms stroke animation stays (already polished)

### What We're NOT Adding
- No parallax scrolling
- No scroll-triggered animations
- No skeleton loaders
- No confetti/celebration effects

---

## 7. CSS Custom Properties Updates

### globals.css changes

**Remove** (no longer used after glass migration):
```css
--shadow-card: 0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(59,130,246,0.04);
--shadow-card-hover: 0 1px 3px rgba(0,0,0,0.04), 0 12px 32px rgba(59,130,246,0.08);
```

**Add:**
```css
.bg-page-mesh {
  background-color: #F8F9FC;
  background-image:
    radial-gradient(at 20% 30%, rgba(99,102,241,0.06) 0%, transparent 50%),
    radial-gradient(at 80% 70%, rgba(59,130,246,0.05) 0%, transparent 50%);
}

.btn-primary {
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.2),
    0 10px 15px -3px rgba(37,99,235,0.25);
}
.btn-primary:hover {
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.2),
    0 20px 25px -5px rgba(37,99,235,0.30);
}

.btn-danger {
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.2),
    0 10px 15px -3px rgba(239,68,68,0.25);
}
.btn-danger:hover {
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.2),
    0 20px 25px -5px rgba(239,68,68,0.30);
}
```

### tailwind.config.ts changes

**Remove from colors:**
```
surface.page (no longer needed -- bg-page-mesh replaces it)
```

Wait -- `surface.page` is still used in non-background contexts (e.g., session footer `bg-surface-page`). Keep `surface.page` in the config. The `bg-page-mesh` class uses the same `#F8F9FC` as its base color, so they're compatible. Pages use `bg-page-mesh` for backgrounds, `bg-surface-page` remains available for smaller elements if needed.

**No Tailwind config removals needed.** Only globals.css additions.

Actually -- `--shadow-card` and `--shadow-card-hover` CSS vars. Check if anything still uses them after migration. The transcript panel inline style uses `var(--shadow-card)` -- that gets removed. Feature cards use `var(--shadow-card)` inline -- gets removed. Setup selectors use `var(--shadow-card)` inline -- gets removed. Results cards use `var(--shadow-card)` inline -- gets removed.

After all glass migrations, nothing will reference these vars. Remove them from globals.css.

---

## Files Changed

| File | Action | Reason |
|------|--------|--------|
| `package.json` | Modify | Add `@phosphor-icons/react` dependency |
| `src/app/globals.css` | Modify | Remove shadow vars, add bg-page-mesh + btn-primary + btn-danger |
| `src/components/landing/hero.tsx` | Modify | Centered layout, gradient button, glass card |
| `src/components/landing/features.tsx` | Modify | Glass cards, Phosphor icons, squircle containers |
| `src/components/setup/setup-wizard.tsx` | Modify | Phosphor nav icons, glass styling |
| `src/components/setup/language-selector.tsx` | Modify | Glass selector cards |
| `src/components/setup/mode-selector.tsx` | Modify | Glass cards, Phosphor duotone icons |
| `src/components/setup/level-selector.tsx` | Modify | Glass unselected style |
| `src/components/setup/voice-selector.tsx` | Modify | Glass cards, avatar glass |
| `src/app/session/page.tsx` | Modify | Glass header, glass transcript, gradient end button, bg-page-mesh, state label transition |
| `src/components/session/transcript-panel.tsx` | Modify | Glass bot bubbles |
| `src/app/results/page.tsx` | Modify | Glass cards, centered layout, gradient buttons, Phosphor back icon |
| `src/components/results/score-card.tsx` | No change | Already polished |
| `src/components/results/feedback-panel.tsx` | Modify | Glass sub-cards, glass XP badge |
| `src/app/error.tsx` | Modify | Glass card, Phosphor icon, gradient button, bg-page-mesh |
| `src/app/not-found.tsx` | Modify | Glass card, Phosphor icon, gradient button, bg-page-mesh |

## Files NOT Changed

- `src/hooks/*` -- no logic changes
- `src/lib/*` -- no data changes
- `src/app/api/*` -- no API changes
- `src/components/session/voice-orb.tsx` -- WebGL orb stays as-is
- `src/components/results/score-card.tsx` -- already polished
- `tailwind.config.ts` -- no config changes needed
- `relay/*` -- backend untouched
- Admin panel pages -- not user-facing in this scope

## Anti-AI-Vibe Check

- Glass is subtle (70% opacity, not 30%)
- Gradient only on buttons, not text
- No rainbow gradients or neon glows
- Squircle icon containers, not perfect circles (iOS native)
- Duotone icons are cohesive, not decorative
- Breathing room via spacing, not emptiness
- Colors stay within blue-indigo-primary palette
- No "glassmorphism showcase" energy -- glass is a material choice, not the feature
