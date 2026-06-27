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
        orb: {
          red: "#E53935",
          maroon: "#8B1A1A",
          gold: "#FFB300",
          green: "#16A34A",
          dark: "#1A0A2E",
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
        "orb-breathe": "orb-breathe 3s ease-in-out infinite",
        "orb-pulse": "orb-pulse 1.2s ease-in-out infinite",
        "orb-energetic": "orb-energetic 0.6s ease-in-out infinite",
        "ring-expand": "ring-expand 2s ease-out infinite",
        "ring-expand-fast": "ring-expand-fast 1s ease-out infinite",
        "slide-up": "slide-up 0.3s ease-out both",
        "step-slide": "step-slide 250ms ease-out both",
      },
      keyframes: {
        "orb-breathe": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.03)" },
        },
        "orb-pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.06)" },
        },
        "orb-energetic": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.08)" },
        },
        "ring-expand": {
          "0%": { transform: "scale(1)", opacity: "0.5" },
          "100%": { transform: "scale(1.8)", opacity: "0" },
        },
        "ring-expand-fast": {
          "0%": { transform: "scale(1)", opacity: "0.5" },
          "100%": { transform: "scale(1.8)", opacity: "0" },
        },
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
