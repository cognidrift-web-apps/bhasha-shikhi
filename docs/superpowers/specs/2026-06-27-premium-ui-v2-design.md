# February Premium UI v2 - Design Spec

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild all visual components to iOS Settings-level polish -- consistent icon badges, refined glass cards, depth-rich buttons, and polite Bangladeshi Bengali tone.

**Architecture:** Pure CSS/Tailwind changes across existing components. No new dependencies. No layout restructuring. Same Phosphor Icons library, different weight (`fill` instead of `duotone`). One new CSS utility class for button inner shadow.

**Tech Stack:** Tailwind CSS, Phosphor Icons (`@phosphor-icons/react`), Next.js 15

## Global Constraints

- No emoji anywhere in UI copy or code comments
- No emdash characters
- No AI/tech branding visible to users ("Powered by", "Built with", etc.)
- All Bengali text uses everyday Bangladeshi Bangla in apni (polite) register
- TypeScript strict mode
- Tailwind CSS only, no CSS modules
- Minimum 44px touch targets, mobile-first (360px base)
- `#1E1B4B` for primary text everywhere (never `text-stone-*` or pure black)
- All transitions use `duration-200` (snappier than current 300ms)
- No test files needed (pure visual/CSS changes)

---

## 1. Icon System

### Current State
All icons use `weight="duotone"` with flat `bg-slate-100/80` or `bg-primary-50/80` circular/rounded containers. Colors are inconsistent (voice selector uses `blue-100/blue-600` while mode selector uses `primary-50/primary-600`).

### Target State
iOS Settings-style colored badge containers with white filled icons.

### Badge Container Spec
```
w-9 h-9 rounded-xl flex items-center justify-center
```
Each badge gets a unique background color from this palette. Icon inside is always white, `size={20}`, `weight="fill"`.

### Color Assignments

**Language Selector badges:**
| Language | Badge Color |
|----------|-------------|
| English | `bg-blue-500` |
| German | `bg-emerald-500` |
| Arabic | `bg-amber-500` |
| Hindi | `bg-violet-500` |

Language selector cards currently have no icons. Add flag-style letter codes (EN, DE, AR, IN) as the badge content instead of Phosphor icons -- white text on colored badge.

**Mode Selector icon badges:**
| Mode | Icon | Badge Color |
|------|------|-------------|
| word_by_word | TextAa | `bg-blue-500` |
| conversation | ChatCircleDots | `bg-emerald-500` |
| roleplay | UsersThree | `bg-orange-500` |
| pronunciation | Waveform | `bg-violet-500` |
| grammar | BookOpen | `bg-rose-500` |
| listening | Ear | `bg-cyan-500` |
| live_translation | Translate | `bg-amber-500` |

**Features Landing badges:**
| Feature | Icon | Badge Color |
|---------|------|-------------|
| 7 Ways | SquaresFour | `bg-blue-500` |
| Voice-first | Microphone | `bg-emerald-500` |
| 4 Languages | GlobeHemisphereWest | `bg-violet-500` |
| Bangla Detector | Crosshair | `bg-orange-500` |
| No Account | LockOpen | `bg-cyan-500` |

**Voice Selector:**
Keep the current avatar circle (`flex h-12 w-12 ... rounded-full`) but change background from `bg-blue-100/70 text-blue-600` to `bg-primary-100 text-primary-700` for consistency.

**Error/404 pages:**
| Page | Icon | Badge Color | Size |
|------|------|-------------|------|
| Error | WarningCircle | `bg-amber-500` | `w-14 h-14 rounded-2xl`, icon `size={28}` |
| 404 | MagnifyingGlass | `bg-slate-500` | `w-14 h-14 rounded-2xl`, icon `size={28}` |

All icons switch from `weight="duotone"` to `weight="fill"`.

---

## 2. Card System

### Current State
Glass cards use `bg-white/40-50 backdrop-blur-lg-xl border border-white/40-50 shadow-md-lg shadow-indigo-500/5-10`. Inconsistent opacity and shadow values across components.

### Target State
Unified card system with iOS-level refinement.

### Base Card Class
```
rounded-2xl bg-white/60 backdrop-blur-2xl ring-1 ring-black/[0.04] shadow-sm shadow-black/5
```

### Card Variants

**Selection Card (unselected) -- language, mode, level, voice:**
```
rounded-2xl bg-white/60 backdrop-blur-2xl ring-1 ring-black/[0.04] shadow-sm shadow-black/5
hover:bg-white/70 hover:shadow-md hover:shadow-black/8
transition-all duration-200
```

**Selection Card (selected):**
```
rounded-2xl bg-white/70 backdrop-blur-2xl ring-2 ring-primary-500 shadow-sm shadow-black/5
```

**Feature Card (landing page):**
```
rounded-2xl bg-white/60 backdrop-blur-2xl ring-1 ring-black/[0.04] shadow-sm shadow-black/5 p-5
hover:-translate-y-1 hover:bg-white/70 hover:shadow-lg hover:shadow-black/8
transition-all duration-200
```

**Panel Card (results, error, 404):**
```
rounded-2xl bg-white/60 backdrop-blur-2xl ring-1 ring-black/[0.04] shadow-sm shadow-black/5 p-6
```

**Header/Footer Glass:**
```
bg-white/60 backdrop-blur-2xl ring-1 ring-black/[0.04]
```
Replace `border-t border-white/40` and `border-b border-white/40` with `ring-1 ring-black/[0.04]`.

**Transcript Container:**
```
bg-white/60 backdrop-blur-2xl rounded-t-3xl ring-1 ring-black/[0.04]
```

**Bot Bubble (transcript):**
```
bg-white/60 backdrop-blur-sm ring-1 ring-black/[0.04] text-slate-800 rounded-bl-sm
```

**Feedback Sub-panels (strengths/improvements):**
Keep the current `border-l-[3px]` treatment but update background:
```
rounded-xl border-l-[3px] border-emerald-500 bg-white/50 backdrop-blur-sm ring-1 ring-black/[0.04] pl-4 pr-3 py-3
```

### Padding
- Selection cards: `p-4` (current, fine)
- Feature cards: `p-5` (increase from p-4)
- Panel cards: `p-6` (current, fine)
- Error/404 cards: `p-8` (current, fine)

---

## 3. Button System

### CSS Class Updates
Existing `.btn-primary` and `.btn-danger` classes in `globals.css` already have inner shadow + outer glow. Update them to be tighter and add active states:
```css
.btn-primary {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    0 2px 8px rgba(37, 99, 235, 0.25);
}
.btn-primary:hover {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    0 4px 12px rgba(37, 99, 235, 0.30);
}
.btn-primary:active {
  box-shadow: none;
  filter: brightness(0.95);
}
.btn-danger {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    0 2px 8px rgba(239, 68, 68, 0.25);
}
.btn-danger:hover {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    0 4px 12px rgba(239, 68, 68, 0.30);
}
.btn-danger:active {
  box-shadow: none;
  filter: brightness(0.95);
}
```

### Button Variants

**Primary CTA:**
```
btn-primary rounded-xl bg-gradient-to-b from-primary-500 to-primary-600
font-semibold text-white transition-all duration-200
hover:-translate-y-0.5 active:translate-y-0
disabled:opacity-50 disabled:hover:translate-y-0
min-h-[44px]
```
Remove `active:scale-[0.98]`. The inner shadow + brightness change replaces scale.

**Secondary:**
```
rounded-xl bg-white/60 backdrop-blur-lg ring-1 ring-black/[0.06]
font-semibold text-slate-700 transition-all duration-200
hover:bg-white/70 hover:shadow-sm
min-h-[44px]
```

**Danger:**
```
btn-danger rounded-xl bg-gradient-to-b from-red-500 to-red-600
font-semibold text-white transition-all duration-200
active:translate-y-0
disabled:opacity-50 disabled:cursor-not-allowed
min-h-[44px]
```
Change from `from-red-400` to `from-red-500` for slightly richer color.

**Navigation (text-only):**
```
text-sm font-medium text-slate-500 hover:text-primary-600
transition-colors duration-200 min-h-[44px] px-2
```

### Button Radius
All buttons use `rounded-xl` (12px) to distinguish from cards (`rounded-2xl` 16px). This creates visual hierarchy -- containers are rounder than actions.

---

## 4. Bengali Text Updates

### Register Shift: tumi to apni

All Bengali UI text shifts from casual tumi to polite apni register. Complete list of changes:

**Setup Wizard:**
| Location | Current (tumi) | New (apni) |
|----------|----------------|------------|
| language-selector.tsx heading | কোন ভাষা শিখবে? | কোন ভাষা শিখবেন? |
| mode-selector.tsx heading | কী করতে চাও? | কী করতে চান? |
| level-selector.tsx heading | লেভেল বাছো | লেভেল বাছুন |
| voice-selector.tsx heading | টিউটর বাছো | টিউটর বাছুন |
| setup-wizard.tsx back button | পিছনে | পিছনে |
| setup-wizard.tsx next button | পরেরটা | পরেরটায় যান |
| setup-wizard.tsx start button | শুরু করো | শুরু করুন |

**Session Page:**
| Location | Current | New |
|----------|---------|-----|
| State: idle | অপেক্ষায়... | অপেক্ষায়... |
| State: listening | শুনছি... | শুনছি... |
| State: thinking | ভাবছি... | ভাবছি... |
| State: speaking | বলছি... | বলছি... |
| Error message | কানেকশনে প্রবলেম হয়েছে | কানেকশনে সমস্যা হয়েছে |
| Error button | আবার ট্রাই করো | আবার ট্রাই করুন |
| End session button | সেশন শেষ করো | সেশন শেষ করুন |
| Transcript empty | কথাবার্তা এখানে দেখাবে | কথাবার্তা এখানে দেখাবে |
| Session ending | সেশন শেষ হচ্ছে... | সেশন শেষ হচ্ছে... |

**Results Page:**
| Location | Current | New |
|----------|---------|-----|
| Back link | প্র্যাকটিস পেজে ফিরে যাও | প্র্যাকটিস পেজে ফিরে যান |
| Retry button | আবার ট্রাই করো | আবার ট্রাই করুন |
| Practice again | আবার প্র্যাকটিস করো | আবার প্র্যাকটিস করুন |
| Try different | অন্য মোড ট্রাই করো | অন্য মোড ট্রাই করুন |
| Score card label | ওভারঅল | ওভারঅল |

**Feedback Panel:**
| Location | Current | New |
|----------|---------|-----|
| XP badge | পেয়েছো | পেয়েছেন |
| Bangla fallback | বার বাংলায় চলে গেছো | বার বাংলায় চলে গেছেন |
| Strengths heading | ভালো করেছো | ভালো করেছেন |
| Improvements heading | আরো ভালো করতে পারো | আরো ভালো করতে পারেন |

**Error/404 Pages:**
| Location | Current | New |
|----------|---------|-----|
| error.tsx message | কিছু একটা গোলমাল হয়েছে | কিছু একটা সমস্যা হয়েছে |
| error.tsx button | আবার চেষ্টা করো | আবার চেষ্টা করুন |
| not-found.tsx message | পেজটা খুঁজে পাচ্ছি না | পেজটা খুঁজে পাওয়া যাচ্ছে না |
| not-found.tsx button | হোমে ফিরে যাও | হোমে ফিরে যান |

**Landing Page (hero.tsx):**
| Location | Current | New |
|----------|---------|-----|
| CTA button | শুরু করো | শুরু করুন |

**Note:** State labels (শুনছি, ভাবছি, বলছি) and section labels (পরের ধাপ, টুলস) remain unchanged -- they describe system state, not user-directed instructions.

---

## 5. Font Fixes

### Current Issue
Bengali text may appear thin/broken at small sizes because `font-bengali` class applies Noto Sans Bengali at regular (400) weight.

### Fix
In `globals.css`, ensure the `.font-bengali` or the font import includes weights 400, 500, 600, 700. The font is loaded via `next/font/google` in layout.tsx.

Check `src/app/layout.tsx` for the Noto Sans Bengali import and ensure `weight: ['400', '500', '600', '700']` is specified.

For Bengali body text (descriptions, captions at text-sm), add `font-medium` for better legibility at small sizes where 400 weight looks thin.

---

## 6. Color Consistency Fixes

### Text Colors
Replace all instances of:
- `text-stone-900` with `text-[#1E1B4B]`
- `text-stone-600` with `text-slate-600`

Affected files: `error.tsx`, `not-found.tsx`

### Icon Container Colors
Voice selector avatar: change `bg-blue-100/70 text-blue-600` to `bg-primary-100 text-primary-700`.

---

## 7. Transition Speed

All `duration-300` values change to `duration-200` for snappier feel:
- Card hover transitions
- Button hover/active transitions
- Navigation transitions

**Exceptions (keep current):**
- `duration-500` on voice orb opacity fade-in
- `duration-[800ms]` on score bar animations
- `duration-[1500ms]` on circle progress animation
- `duration-250` on step-slide animation (in tailwind config)

---

## Files Changed

| File | Changes |
|------|---------|
| `src/app/globals.css` | Update `.btn-primary`, `.btn-danger` with tighter shadows + active states |
| `src/components/landing/hero.tsx` | Bengali text apni form, button class update |
| `src/components/landing/features.tsx` | Icon badges (colored bg + fill weight), card classes, transition speed |
| `src/components/setup/setup-wizard.tsx` | Footer glass class, button classes, Bengali text, transition speed |
| `src/components/setup/language-selector.tsx` | Add colored letter badges, card classes, Bengali text, transition speed |
| `src/components/setup/mode-selector.tsx` | Icon badge colors (per-mode), card classes, Bengali text, transition speed |
| `src/components/setup/level-selector.tsx` | Card classes, Bengali text, transition speed |
| `src/components/setup/voice-selector.tsx` | Avatar color fix, card classes, Bengali text, transition speed |
| `src/app/session/page.tsx` | Header/transcript glass, button classes, Bengali text, text color fix, transition speed |
| `src/components/session/transcript-panel.tsx` | Bot bubble class, Bengali text |
| `src/app/results/page.tsx` | Panel card classes, button classes, Bengali text, transition speed |
| `src/components/results/score-card.tsx` | Panel card class |
| `src/components/results/feedback-panel.tsx` | Sub-panel classes, Bengali text |
| `src/app/error.tsx` | Icon badge, card class, button class, text color, Bengali text |
| `src/app/not-found.tsx` | Icon badge, card class, button class, text color, Bengali text |
| `tailwind.config.ts` | No changes needed |
| `src/app/layout.tsx` | Verify Bengali font weights (400, 500, 600, 700) |
