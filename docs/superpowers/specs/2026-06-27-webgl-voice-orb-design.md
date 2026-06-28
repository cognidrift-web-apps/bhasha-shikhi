# WebGL Voice Orb Redesign

> Replace the CSS-only voice orb with a WebGL shader-based fluid animated orb matching the cognidrift.com orb style.

**Goal:** Make BhashaShikhi's voice orb visually identical to the cognidrift orb -- a fluid, organic, noise-distorted animated blob rendered via WebGL fragment shader with blue-purple palette.

**Architecture:** Single React component (`voice-orb.tsx`) containing a WebGL canvas, GLSL shaders (vertex + fragment), a `requestAnimationFrame` render loop, and a CSS fallback. No external libraries. State changes drive the `hue` uniform via smooth interpolation.

**Source reference:** The exact shader and WebGL setup come from `cognidrift_website/frontend/src/components/ui/Orb.jsx`. This spec ports that JSX component to TypeScript for BhashaShikhi's React 19 / Next.js 15 codebase.

**Tech Stack:** WebGL 1.0 (browser-native), GLSL ES 1.0, React 19 refs

## Global Constraints

- No new npm dependencies
- No emoji in UI copy
- TypeScript strict mode
- Tailwind CSS for layout/sizing (shader handles all visual rendering)
- Minimum 44px touch targets
- All Bengali text in Dhaka casual tumi form
- No AI/tech branding visible to users
- WebGL is a browser API, not a dependency

---

## Component: `src/components/session/voice-orb.tsx`

### Props

```typescript
type AgentState = "idle" | "listening" | "thinking" | "speaking";
interface Props {
  state: AgentState;
}
```

Same interface as current. No breaking changes to consumers.

### Internal Structure

```tsx
<div className="relative flex items-center justify-center h-[200px] w-[200px] md:h-[240px] md:w-[240px]">
  <div ref={containerRef} className="absolute inset-0 rounded-full overflow-hidden" />
  {!glReady && <FallbackOrb />}
</div>
```

- Container div holds the WebGL canvas (created dynamically in useEffect, same pattern as cognidrift Orb.jsx).
- `rounded-full overflow-hidden` clips the square canvas to a circle.
- Canvas is created via `document.createElement('canvas')` and appended to the container (not a JSX element) -- matches cognidrift's approach for clean WebGL lifecycle management.
- Canvas internal resolution: `clientWidth * devicePixelRatio` x `clientHeight * devicePixelRatio` for retina.

### Shaders (ported verbatim from cognidrift Orb.jsx)

**Vertex shader:**

```glsl
precision highp float;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
```

**Fragment shader:**

The exact cognidrift fragment shader. Key elements:
- **YIQ color space rotation** via `rgb2yiq`/`yiq2rgb`/`adjustHue` for hue shifting
- **3D simplex noise** (`snoise3` with `hash33`) for organic boundary distortion
- **Light attenuation functions** (`light1`, `light2`) for ring glow
- **Three base colors** shifted by hue uniform:
  - `baseColor1`: `vec3(0.611765, 0.262745, 0.996078)` -- purple
  - `baseColor2`: `vec3(0.298039, 0.760784, 0.913725)` -- cyan
  - `baseColor3`: `vec3(0.062745, 0.078431, 0.600000)` -- deep blue
- **Inner radius**: 0.6 with noise scale 0.65
- **Rotation** via `rot` uniform
- **Hover distortion** via `hover` and `hoverIntensity` uniforms
- **Background-adaptive blending** via `backgroundColor` uniform (uses luminance to blend between dark/light rendering paths)

**Uniforms:**

| Uniform | Type | Purpose |
|---------|------|---------|
| `iTime` | float | `performance.now() * 0.001` -- drives all animation |
| `iResolution` | vec3 | `(canvas.width, canvas.height, aspect)` |
| `hue` | float | Hue rotation in degrees. State-dependent. |
| `hover` | float | 0-1, lerped. Always 0 for BhashaShikhi (no mouse hover on mobile voice orb). |
| `rot` | float | Accumulated rotation angle. Increments each frame. |
| `hoverIntensity` | float | Distortion strength. Fixed at 0.2. |
| `backgroundColor` | vec3 | RGB of the page background. `#F8F9FC` = `(0.973, 0.976, 0.988)`. |

### State Mapping

Cognidrift uses `hue=0` for idle and `hue=240` for connected. BhashaShikhi maps 4 states:

| State | hue | rot speed | opacity | Visual |
|-------|-----|-----------|---------|--------|
| idle | 0 | 0.0 (no rotation) | 1.0 | Default purple-cyan, still |
| listening | 120 | 0.3 | 1.0 | Green-shifted, slowly rotating |
| thinking | 0 | 0.0 | 0.6 | Same as idle, dimmed |
| speaking | 240 | 0.5 | 1.0 | Blue-shifted, rotating faster |

The `hue` values are in degrees (matching cognidrift's `adjustHue` which takes degrees). Rotation accumulates: `currentRot += dt * rotSpeed`.

### Animation Loop

```typescript
const STATE_CONFIG: Record<AgentState, { hue: number; rotSpeed: number; opacity: number }> = {
  idle:      { hue: 0,   rotSpeed: 0.0, opacity: 1.0 },
  listening: { hue: 120, rotSpeed: 0.3, opacity: 1.0 },
  thinking:  { hue: 0,   rotSpeed: 0.0, opacity: 0.6 },
  speaking:  { hue: 240, rotSpeed: 0.5, opacity: 1.0 },
};
```

- `currentHue` lerps toward target: `currentHue += (targetHue - currentHue) * 0.05`
- `currentOpacity` lerps toward target: `currentOpacity += (targetOpacity - currentOpacity) * 0.08`
- `currentRot` accumulates: `currentRot += dt * currentRotSpeed`
- `hover` is always 0 (no mouse interaction on the voice orb -- it's not a button)
- Container div applies `style={{ opacity: currentOpacity }}` for the thinking dim effect (simpler than adding opacity to the shader)
- React component renders ONCE. All animation via refs in rAF callback.

### WebGL Setup (in useEffect)

Follows cognidrift Orb.jsx pattern exactly:

1. Create canvas element, append to container ref
2. Get WebGL context with `{ alpha: true, premultipliedAlpha: false }`
3. `gl.clearColor(0, 0, 0, 0)` for transparent background
4. Compile vertex + fragment shaders
5. Link program, get uniform locations
6. Create single-triangle fullscreen geometry: `Float32Array([-1, -1, 3, -1, -1, 3])`
7. `gl.drawArrays(gl.TRIANGLES, 0, 3)` (single oversized triangle, not triangle strip)
8. Resize handler: `canvas.width = container.clientWidth * dpr`

### CSS Fallback

If `canvas.getContext("webgl")` returns null:

```tsx
function FallbackOrb() {
  return (
    <div
      className="absolute inset-0 rounded-full animate-pulse"
      style={{
        background: "radial-gradient(circle at 35% 35%, #6366F1, #3B82F6)",
        boxShadow: "0 0 40px 10px rgba(99,102,241,0.25)",
      }}
    />
  );
}
```

### Cleanup

On unmount (same as cognidrift):
1. `cancelAnimationFrame(rafId)`
2. `window.removeEventListener('resize', resize)`
3. `container.removeChild(canvas)`
4. `gl.getExtension('WEBGL_lose_context')?.loseContext()`

---

## Downstream Changes

### `src/app/globals.css`

Remove the three orb CSS vars that are no longer used:
```css
/* REMOVE these lines: */
--gradient-orb-idle: radial-gradient(circle at 35% 35%, #E53935, #8B1A1A);
--gradient-orb-listen: radial-gradient(circle at 35% 35%, #22C55E, #16A34A);
--gradient-orb-speak: radial-gradient(circle at 35% 35%, #FFB300, #F59E0B);
```

Keep `--gradient-cta`, `--gradient-hero`, `--shadow-card`, `--shadow-card-hover`.

### `tailwind.config.ts`

Remove from `colors`:
```
orb: { red, maroon, gold, green, dark }
```

Remove from `animation`:
```
orb-breathe, orb-pulse, orb-energetic, ring-expand, ring-expand-fast
```

Remove corresponding `keyframes` entries for all five above.

Keep: `slide-up`, `step-slide` animations and their keyframes.

### `src/app/session/page.tsx`

Update `STATE_LABELS` colors from red/green/amber to blue-purple matching the new orb:

```typescript
const STATE_LABELS: Record<string, { text: string; color: string }> = {
  idle:      { text: "অপেক্ষায়...", color: "text-purple-500" },
  listening: { text: "শুনছি...",    color: "text-cyan-500" },
  thinking:  { text: "ভাবছি...",   color: "text-slate-400" },
  speaking:  { text: "বলছি...",    color: "text-blue-500" },
};
```

Update `STATE_GLOWS` to match:

```typescript
const STATE_GLOWS: Record<string, string> = {
  idle:      "0 0 12px rgba(139,92,246,0.3)",
  listening: "0 0 12px rgba(6,182,212,0.3)",
  thinking:  "none",
  speaking:  "0 0 12px rgba(59,130,246,0.3)",
};
```

### `src/components/landing/hero.tsx`

Update `DecorativeOrb` to use blue-purple CSS gradient instead of red. The current hero uses `animate-orb-breathe` which is being removed -- replace with Tailwind's built-in `animate-pulse`.

```tsx
function DecorativeOrb() {
  return (
    <div className="relative flex items-center justify-center">
      <div
        className="h-28 w-28 md:h-36 md:w-36 rounded-full animate-pulse"
        style={{
          background: "radial-gradient(circle at 35% 35%, #818CF8, #3B82F6)",
          boxShadow: "0 0 40px 10px rgba(99,102,241,0.25)",
        }}
      >
        <div
          className="absolute top-[15%] left-[20%] h-[30%] w-[30%] rounded-full opacity-40"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.8), transparent)",
          }}
        />
      </div>
    </div>
  );
}
```

CSS approximation for the landing page. Full WebGL orb only on session page.

---

## Files Changed

| File | Action | Reason |
|------|--------|--------|
| `src/components/session/voice-orb.tsx` | Rewrite | WebGL shader replaces CSS orb |
| `src/app/session/page.tsx` | Edit | State label colors to blue/purple |
| `src/app/globals.css` | Edit | Remove 3 orb CSS vars |
| `tailwind.config.ts` | Edit | Remove orb colors + orb animations |
| `src/components/landing/hero.tsx` | Edit | DecorativeOrb blue-purple palette |

## Files NOT Changed

- `src/hooks/use-session.ts`
- `src/hooks/use-gemini-live.ts`
- `src/components/session/transcript-panel.tsx`
- Any API routes, admin pages, setup wizard components
- `package.json` (no new dependencies)

## Anti-AI-Vibe Check

- No gradient text anywhere
- No glassmorphism
- The orb is the ONLY animated/gradient element on the page
- Buttons remain solid blue, not gradient
- Cards remain flat white with shadow
- No "powered by" or tech branding
