# WebGL Voice Orb Redesign

> Replace the CSS-only voice orb with a WebGL shader-based fluid animated orb matching the cognidrift.com orb style.

**Goal:** Make BhashaShikhi's voice orb visually identical in style to the cognidrift orb -- a fluid, organic, noise-distorted animated blob rendered via WebGL fragment shader with blue-purple palette.

**Architecture:** Single React component (`voice-orb.tsx`) containing a WebGL canvas, GLSL shaders (vertex + fragment), a `requestAnimationFrame` render loop, and a CSS fallback. No external libraries. State changes drive shader uniforms via smooth interpolation.

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

```
<div className="relative flex items-center justify-center h-[200px] w-[200px] md:h-[240px] md:w-[240px]">
  <canvas ref={canvasRef} className="absolute inset-0 w-full h-full rounded-full" />
  {/* CSS fallback shown only if WebGL init fails */}
  {!glReady && <div className="fallback css circle" />}
</div>
```

- Canvas fills the container div. `rounded-full` clips it to a circle.
- Canvas internal resolution: 2x container size for retina (400x400 on desktop, 320x320 on mobile).
- No icon overlay on top of the canvas (unlike cognidrift which has a mic icon -- BhashaShikhi shows the state label text below the orb instead).

### WebGL Setup (runs once in useEffect on mount)

1. Get WebGL context from canvas (`canvas.getContext("webgl")`)
2. If null, set `glReady = false` and show CSS fallback
3. Compile vertex shader (fullscreen quad)
4. Compile fragment shader (noise-based fluid blob)
5. Link program
6. Create fullscreen quad geometry (2 triangles covering clip space)
7. Get uniform locations for all 6 uniforms
8. Start rAF loop

### Vertex Shader

Trivial fullscreen quad. Passes UV coordinates to fragment shader.

```glsl
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
```

### Fragment Shader

Noise-based SDF circle with animated distortion. Key elements:

1. **2D simplex noise** -- distorts the circle boundary for organic feel
2. **Conic gradient** -- rotates around the ring for the gradient sweep effect
3. **Ring SDF** -- renders a hollow ring (not a filled circle) with soft edges
4. **Inner glow** -- lighter fill inside the ring, semi-transparent
5. **Outer blur** -- soft falloff outside the ring edge
6. **HSL color** -- uses `hue` uniform to shift palette per state

```glsl
precision mediump float;

uniform float iTime;
uniform vec3 iResolution;
uniform float hue;
uniform float speed;
uniform float intensity;
uniform float opacity;
varying vec2 vUv;

// Simplex noise helpers
vec3 mod289(vec3 x) { return x - floor(x / 289.0) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x / 289.0) * 289.0; }
vec3 permute(vec3 x) { return mod289((x * 34.0 + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

vec3 hsl2rgb(float h, float s, float l) {
  vec3 rgb = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return l + s * (rgb - 0.5) * (1.0 - abs(2.0 * l - 1.0));
}

void main() {
  vec2 uv = vUv - 0.5;
  float aspect = iResolution.x / iResolution.y;
  uv.x *= aspect;

  float dist = length(uv);
  float angle = atan(uv.y, uv.x);

  float t = iTime * speed;

  // Noise-based distortion on the ring boundary
  float noise1 = snoise(vec2(angle * 2.0, t * 0.5)) * intensity * 0.08;
  float noise2 = snoise(vec2(angle * 3.0 + 100.0, t * 0.3)) * intensity * 0.04;
  float distortion = noise1 + noise2;

  // Ring parameters
  float ringRadius = 0.38 + distortion;
  float ringWidth = 0.06;
  float ringDist = abs(dist - ringRadius);
  float ring = smoothstep(ringWidth, 0.0, ringDist);

  // Rotating conic gradient on the ring
  float rotAngle = angle + t * 0.4;
  float gradientT = (sin(rotAngle) * 0.5 + 0.5);

  // Color: shift between two hues along the ring
  float h1 = hue;
  float h2 = hue + 0.12;
  vec3 ringColor = hsl2rgb(mix(h1, h2, gradientT), 0.7, 0.55);

  // Inner glow (lighter fill inside)
  float innerGlow = smoothstep(ringRadius - 0.02, 0.0, dist) * 0.15;
  vec3 innerColor = hsl2rgb(hue + 0.05, 0.4, 0.75);

  // Outer glow (soft bloom outside)
  float outerGlow = smoothstep(0.5, ringRadius, dist) * 0.3;
  outerGlow = 0.0; // computed below
  float bloom = exp(-pow((dist - ringRadius) * 6.0, 2.0)) * 0.4;
  vec3 bloomColor = hsl2rgb(hue + 0.06, 0.6, 0.6);

  // Composite
  vec3 color = ringColor * ring + innerColor * innerGlow + bloomColor * bloom;
  float alpha = (ring + innerGlow + bloom) * opacity;

  gl_FragColor = vec4(color, alpha);
}
```

### Uniforms & State Mapping

| State | hue | speed | intensity | opacity | Visual |
|-------|-----|-------|-----------|---------|--------|
| idle | 0.65 | 0.3 | 0.4 | 1.0 | Blue, slow drift |
| listening | 0.58 | 0.8 | 0.7 | 1.0 | Cyan-blue shift, faster |
| thinking | 0.65 | 0.5 | 0.3 | 0.6 | Same as idle, dimmed |
| speaking | 0.72 | 1.0 | 0.9 | 1.0 | Purple shift, energetic |

### Animation Loop (rAF)

```typescript
const STATE_UNIFORMS: Record<AgentState, { hue: number; speed: number; intensity: number; opacity: number }> = {
  idle:      { hue: 0.65, speed: 0.3, intensity: 0.4, opacity: 1.0 },
  listening: { hue: 0.58, speed: 0.8, intensity: 0.7, opacity: 1.0 },
  thinking:  { hue: 0.65, speed: 0.5, intensity: 0.3, opacity: 0.6 },
  speaking:  { hue: 0.72, speed: 1.0, intensity: 0.9, opacity: 1.0 },
};
```

- Store current uniform values in a ref object
- Store target uniform values (from `STATE_UNIFORMS[state]`) in another ref
- Each frame: `current = lerp(current, target, 0.05)` for smooth transitions (~300ms at 60fps)
- Update `iTime` each frame: `(performance.now() - startTime) / 1000`
- Set uniforms via `gl.uniform1f` / `gl.uniform3f`
- `gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)`
- The React component renders ONCE. All animation happens via refs in the rAF callback.

### CSS Fallback

If `canvas.getContext("webgl")` returns null:

```tsx
<div
  className="h-[160px] w-[160px] md:h-[200px] md:w-[200px] rounded-full animate-pulse"
  style={{
    background: "radial-gradient(circle at 35% 35%, #6366F1, #3B82F6)",
    boxShadow: "0 0 40px 10px rgba(99,102,241,0.25)",
  }}
/>
```

Simple purple-blue gradient circle with pulse animation. Functional but not fancy.

### Cleanup

On unmount:
1. `cancelAnimationFrame(rafId)`
2. `gl.deleteProgram(program)`
3. `gl.deleteShader(vertexShader)`
4. `gl.deleteShader(fragmentShader)`
5. `gl.deleteBuffer(vertexBuffer)`

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
  idle:      { text: "অপেক্ষায়...", color: "text-blue-500" },
  listening: { text: "শুনছি...",    color: "text-cyan-500" },
  thinking:  { text: "ভাবছি...",   color: "text-slate-400" },
  speaking:  { text: "বলছি...",    color: "text-purple-500" },
};
```

Update `STATE_GLOWS` to match:

```typescript
const STATE_GLOWS: Record<string, string> = {
  idle:      "0 0 12px rgba(99,102,241,0.3)",
  listening: "0 0 12px rgba(6,182,212,0.3)",
  thinking:  "none",
  speaking:  "0 0 12px rgba(168,85,247,0.3)",
};
```

### `src/components/landing/hero.tsx`

Update `DecorativeOrb` to use blue-purple CSS gradient instead of red:

Note: The current hero uses `animate-orb-breathe` which is being removed. Replace with Tailwind's built-in `animate-pulse` (no custom keyframe needed).

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

This is a simple CSS approximation for the landing page. The full WebGL orb only renders on the session page to avoid loading shader code on every page.

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
