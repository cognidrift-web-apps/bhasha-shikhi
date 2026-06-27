# WebGL Voice Orb Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the CSS-only voice orb with a WebGL shader-based fluid animated orb ported from the cognidrift Orb.jsx component.

**Architecture:** Single component rewrite (`voice-orb.tsx`) containing the cognidrift WebGL shader (3D simplex noise, YIQ hue rotation, light attenuation), driven by agent state via smooth uniform interpolation. Supporting changes to remove dead CSS/Tailwind tokens and update downstream color references.

**Tech Stack:** WebGL 1.0 (browser-native), GLSL ES 1.0, React 19, TypeScript, Tailwind CSS

## Global Constraints

- No new npm dependencies
- No emoji in UI copy
- TypeScript strict mode
- Tailwind CSS for layout/sizing
- Minimum 44px touch targets
- All Bengali text in Dhaka casual tumi form
- No AI/tech branding visible to users
- WebGL is a browser API, not a dependency
- Source shader: `cognidrift_website/frontend/src/components/ui/Orb.jsx`

---

### Task 1: WebGL Voice Orb + Token Cleanup

**Files:**
- Rewrite: `src/components/session/voice-orb.tsx`
- Modify: `src/app/globals.css:18-20` (remove 3 orb CSS vars)
- Modify: `tailwind.config.ts:21-27,41-45,50-69` (remove orb colors + orb animations/keyframes)

**Interfaces:**
- Consumes: `AgentState` type used by `src/app/session/page.tsx` (unchanged: `"idle" | "listening" | "thinking" | "speaking"`)
- Produces: `VoiceOrb` named export with same `{ state: AgentState }` props interface as current

- [ ] **Step 1: Rewrite `src/components/session/voice-orb.tsx`**

Replace the entire file with:

```tsx
"use client";

import { useEffect, useRef } from "react";

type AgentState = "idle" | "listening" | "thinking" | "speaking";

interface Props {
  state: AgentState;
}

const VERT = `
  precision highp float;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAG = `
  precision highp float;

  uniform float iTime;
  uniform vec3 iResolution;
  uniform float hue;
  uniform float hover;
  uniform float rot;
  uniform float hoverIntensity;
  uniform vec3 backgroundColor;
  varying vec2 vUv;

  vec3 rgb2yiq(vec3 c) {
    return vec3(
      dot(c, vec3(0.299, 0.587, 0.114)),
      dot(c, vec3(0.596, -0.274, -0.322)),
      dot(c, vec3(0.211, -0.523, 0.312))
    );
  }

  vec3 yiq2rgb(vec3 c) {
    return vec3(
      c.x + 0.956 * c.y + 0.621 * c.z,
      c.x - 0.272 * c.y - 0.647 * c.z,
      c.x - 1.106 * c.y + 1.703 * c.z
    );
  }

  vec3 adjustHue(vec3 color, float hueDeg) {
    float hueRad = hueDeg * 3.14159265 / 180.0;
    vec3 yiq = rgb2yiq(color);
    float cosA = cos(hueRad);
    float sinA = sin(hueRad);
    yiq.yz = vec2(yiq.y * cosA - yiq.z * sinA, yiq.y * sinA + yiq.z * cosA);
    return yiq2rgb(yiq);
  }

  vec3 hash33(vec3 p3) {
    p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));
    p3 += dot(p3, p3.yxz + 19.19);
    return -1.0 + 2.0 * fract(vec3(p3.x + p3.y, p3.x + p3.z, p3.y + p3.z) * p3.zyx);
  }

  float snoise3(vec3 p) {
    const float K1 = 0.333333333;
    const float K2 = 0.166666667;
    vec3 i = floor(p + (p.x + p.y + p.z) * K1);
    vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
    vec3 e = step(vec3(0.0), d0 - d0.yzx);
    vec3 i1 = e * (1.0 - e.zxy);
    vec3 i2 = 1.0 - e.zxy * (1.0 - e);
    vec3 d1 = d0 - (i1 - K2);
    vec3 d2 = d0 - (i2 - K1);
    vec3 d3 = d0 - 0.5;
    vec4 h = max(0.6 - vec4(dot(d0,d0), dot(d1,d1), dot(d2,d2), dot(d3,d3)), 0.0);
    vec4 n = h * h * h * h * vec4(
      dot(d0, hash33(i)),
      dot(d1, hash33(i + i1)),
      dot(d2, hash33(i + i2)),
      dot(d3, hash33(i + 1.0))
    );
    return dot(vec4(31.316), n);
  }

  vec4 extractAlpha(vec3 colorIn) {
    float a = max(max(colorIn.r, colorIn.g), colorIn.b);
    return vec4(colorIn.rgb / (a + 1e-5), a);
  }

  const vec3 baseColor1 = vec3(0.611765, 0.262745, 0.996078);
  const vec3 baseColor2 = vec3(0.298039, 0.760784, 0.913725);
  const vec3 baseColor3 = vec3(0.062745, 0.078431, 0.600000);
  const float innerRadius = 0.6;
  const float noiseScale = 0.65;

  float light1(float intensity, float attenuation, float dist) {
    return intensity / (1.0 + dist * attenuation);
  }
  float light2(float intensity, float attenuation, float dist) {
    return intensity / (1.0 + dist * dist * attenuation);
  }

  vec4 draw(vec2 uv) {
    vec3 color1 = adjustHue(baseColor1, hue);
    vec3 color2 = adjustHue(baseColor2, hue);
    vec3 color3 = adjustHue(baseColor3, hue);

    float len = length(uv);
    float invLen = len > 0.0 ? 1.0 / len : 0.0;
    float bgLuminance = dot(backgroundColor, vec3(0.299, 0.587, 0.114));

    float n0 = snoise3(vec3(uv * noiseScale, iTime * 0.5)) * 0.5 + 0.5;
    float r0 = mix(mix(innerRadius, 1.0, 0.4), mix(innerRadius, 1.0, 0.6), n0);
    float d0 = distance(uv, (r0 * invLen) * uv);
    float v0 = light1(1.0, 10.0, d0);

    v0 *= smoothstep(r0 * 1.05, r0, len);
    float innerFade = smoothstep(r0 * 0.8, r0 * 0.95, len);
    v0 *= mix(innerFade, 1.0, bgLuminance * 0.7);
    float ang = atan(uv.y, uv.x);
    float cl = cos(ang + iTime * 2.0) * 0.5 + 0.5;

    float a = iTime * -1.0;
    vec2 pos = vec2(cos(a), sin(a)) * r0;
    float d = distance(uv, pos);
    float v1 = light2(1.5, 5.0, d);
    v1 *= light1(1.0, 50.0, d0);

    float v2 = smoothstep(1.0, mix(innerRadius, 1.0, n0 * 0.5), len);
    float v3 = smoothstep(innerRadius, mix(innerRadius, 1.0, 0.5), len);

    vec3 colBase = mix(color1, color2, cl);
    float fadeAmount = mix(1.0, 0.1, bgLuminance);

    vec3 darkCol = mix(color3, colBase, v0);
    darkCol = (darkCol + v1) * v2 * v3;
    darkCol = clamp(darkCol, 0.0, 1.0);

    vec3 lightCol = (colBase + v1) * mix(1.0, v2 * v3, fadeAmount);
    lightCol = mix(backgroundColor, lightCol, v0);
    lightCol = clamp(lightCol, 0.0, 1.0);

    vec3 finalCol = mix(darkCol, lightCol, bgLuminance);
    return extractAlpha(finalCol);
  }

  void main() {
    vec2 center = iResolution.xy * 0.5;
    float size = min(iResolution.x, iResolution.y);
    vec2 uv = (vUv * iResolution.xy - center) / size * 2.0;

    float s = sin(rot);
    float c = cos(rot);
    uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);

    uv.x += hover * hoverIntensity * 0.1 * sin(uv.y * 10.0 + iTime);
    uv.y += hover * hoverIntensity * 0.1 * sin(uv.x * 10.0 + iTime);

    vec4 col = draw(uv);
    gl_FragColor = vec4(col.rgb * col.a, col.a);
  }
`;

const STATE_CONFIG: Record<
  AgentState,
  { hue: number; rotSpeed: number; opacity: number }
> = {
  idle: { hue: 0, rotSpeed: 0.0, opacity: 1.0 },
  listening: { hue: 120, rotSpeed: 0.3, opacity: 1.0 },
  thinking: { hue: 0, rotSpeed: 0.0, opacity: 0.6 },
  speaking: { hue: 240, rotSpeed: 0.5, opacity: 1.0 },
};

const BG_COLOR: [number, number, number] = [0.973, 0.976, 0.988];

function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

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

export function VoiceOrb({ state }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const glReadyRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    container.appendChild(canvas);

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
    });
    if (!gl) return;

    glReadyRef.current = true;
    gl.clearColor(0, 0, 0, 0);

    const vs = createShader(gl, gl.VERTEX_SHADER, VERT);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const vertices = new Float32Array([-1, -1, 3, -1, -1, 3]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      iTime: gl.getUniformLocation(program, "iTime"),
      iResolution: gl.getUniformLocation(program, "iResolution"),
      hue: gl.getUniformLocation(program, "hue"),
      hover: gl.getUniformLocation(program, "hover"),
      rot: gl.getUniformLocation(program, "rot"),
      hoverIntensity: gl.getUniformLocation(program, "hoverIntensity"),
      backgroundColor: gl.getUniformLocation(program, "backgroundColor"),
    };

    let currentHue = 0;
    let currentRot = 0;
    let currentOpacity = 1.0;
    let currentRotSpeed = 0;
    let lastTime = 0;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const w = container.clientWidth;
      const h = container.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      gl!.viewport(0, 0, canvas.width, canvas.height);
    }

    window.addEventListener("resize", resize);
    resize();

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    let rafId: number;
    const render = (t: number) => {
      rafId = requestAnimationFrame(render);
      const dt = (t - lastTime) * 0.001;
      lastTime = t;

      const target = STATE_CONFIG[stateRef.current];
      currentHue += (target.hue - currentHue) * 0.05;
      currentRotSpeed += (target.rotSpeed - currentRotSpeed) * 0.08;
      currentOpacity += (target.opacity - currentOpacity) * 0.08;
      currentRot += dt * currentRotSpeed;

      container.style.opacity = String(currentOpacity);

      gl!.uniform1f(uniforms.iTime, t * 0.001);
      gl!.uniform3f(
        uniforms.iResolution,
        canvas.width,
        canvas.height,
        canvas.width / canvas.height
      );
      gl!.uniform1f(uniforms.hue, currentHue);
      gl!.uniform1f(uniforms.hover, 0);
      gl!.uniform1f(uniforms.rot, currentRot);
      gl!.uniform1f(uniforms.hoverIntensity, 0.2);
      gl!.uniform3f(uniforms.backgroundColor, BG_COLOR[0], BG_COLOR[1], BG_COLOR[2]);

      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    };
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      container.removeChild(canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <div className="relative flex items-center justify-center h-[200px] w-[200px] md:h-[240px] md:w-[240px]">
      <div
        ref={containerRef}
        className="absolute inset-0 rounded-full overflow-hidden"
      />
      {!glReadyRef.current && <FallbackOrb />}
    </div>
  );
}
```

- [ ] **Step 2: Update `src/app/globals.css` -- remove orb CSS vars**

Replace the entire file with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-size: 16px;
    line-height: 1.6;
  }

  .font-bengali {
    font-family: "Noto Sans Bengali", sans-serif;
  }

  :root {
    --gradient-cta: linear-gradient(135deg, #2563EB, #3B82F6);
    --gradient-hero: linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%);
    --shadow-card: 0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(59,130,246,0.04);
    --shadow-card-hover: 0 1px 3px rgba(0,0,0,0.04), 0 12px 32px rgba(59,130,246,0.08);
  }
}
```

The three `--gradient-orb-*` vars are removed. Nothing references them anymore.

- [ ] **Step 3: Update `tailwind.config.ts` -- remove orb tokens and animations**

Replace the entire file with:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
          950: "#0F172A",
        },
        surface: {
          page: "#F8F9FC",
          card: "#FFFFFF",
          border: "#E2E8F0",
          divider: "#F1F5F9",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        bengali: ["Noto Sans Bengali", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "slide-up": "slide-up 0.3s ease-out both",
        "step-slide": "step-slide 250ms ease-out both",
      },
      keyframes: {
        "slide-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "step-slide": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

Removed: `orb` color block, `orb-breathe`/`orb-pulse`/`orb-energetic`/`ring-expand`/`ring-expand-fast` animations and their keyframes.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Compiles successfully with 0 TypeScript errors. All 15 pages generated.

Check for any remaining references to removed tokens:

Run: `grep -rn "orb-breathe\|orb-pulse\|orb-energetic\|ring-expand\|orb-red\|orb-maroon\|orb-gold\|orb-green\|orb-dark\|gradient-orb" src/ --include="*.tsx" --include="*.ts" --include="*.css"`
Expected: No matches (only files in this task should have referenced them, and they've been updated).

If any matches found in files NOT covered by this task (e.g., `session/page.tsx` still references `text-orb-red`), those are fixed in Task 2.

- [ ] **Step 5: Run tests**

Run: `npm test`
Expected: 255 tests pass. No test references the orb component (it's purely visual).

- [ ] **Step 6: Commit**

```bash
git add src/components/session/voice-orb.tsx src/app/globals.css tailwind.config.ts
git commit -m "feat: replace CSS voice orb with WebGL shader from cognidrift"
```

---

### Task 2: Update Session Page and Hero Colors

**Files:**
- Modify: `src/app/session/page.tsx:18-30` (STATE_LABELS + STATE_GLOWS)
- Modify: `src/components/landing/hero.tsx:3-22` (DecorativeOrb)

**Interfaces:**
- Consumes: Task 1 removed `orb-red` Tailwind token and `--gradient-orb-idle` CSS var. This task replaces all references to them.
- Produces: No new interfaces. Visual-only changes.

- [ ] **Step 1: Update `src/app/session/page.tsx` -- state label colors and glows**

Replace lines 18-30 (the `STATE_LABELS` and `STATE_GLOWS` constants) with:

```typescript
const STATE_LABELS: Record<string, { text: string; color: string }> = {
  idle: { text: "অপেক্ষায়...", color: "text-purple-500" },
  listening: { text: "শুনছি...", color: "text-cyan-500" },
  thinking: { text: "ভাবছি...", color: "text-slate-400" },
  speaking: { text: "বলছি...", color: "text-blue-500" },
};

const STATE_GLOWS: Record<string, string> = {
  idle: "0 0 12px rgba(139,92,246,0.3)",
  listening: "0 0 12px rgba(6,182,212,0.3)",
  thinking: "none",
  speaking: "0 0 12px rgba(59,130,246,0.3)",
};
```

Colors now match the WebGL orb's hue states: purple (idle, hue=0), cyan (listening, hue=120), blue (speaking, hue=240).

- [ ] **Step 2: Update `src/components/landing/hero.tsx` -- DecorativeOrb palette**

Replace the `DecorativeOrb` function (lines 3-22) with:

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
            background:
              "radial-gradient(circle, rgba(255,255,255,0.8), transparent)",
          }}
        />
      </div>
    </div>
  );
}
```

Changes: `animate-orb-breathe` (removed in Task 1) replaced with Tailwind's built-in `animate-pulse`. Red gradient replaced with blue-purple. Red glow replaced with indigo glow.

- [ ] **Step 3: Verify no remaining references to removed tokens**

Run: `grep -rn "orb-breathe\|orb-pulse\|orb-energetic\|ring-expand\|text-orb\|orb-red\|orb-maroon\|orb-gold\|orb-green\|orb-dark\|gradient-orb" src/ --include="*.tsx" --include="*.ts" --include="*.css"`
Expected: Zero matches.

- [ ] **Step 4: Build and test**

Run: `npm run build && npm test`
Expected: Build succeeds (15 pages), 255 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/session/page.tsx src/components/landing/hero.tsx
git commit -m "feat: update session and hero colors to match WebGL orb palette"
```
