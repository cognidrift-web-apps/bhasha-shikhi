import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
          950: "#1E1B4B",
        },
        accent: {
          300: "#67E8F9",
          400: "#22D3EE",
          500: "#06B6D4",
        },
        warm: {
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
        },
        surface: {
          50: "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4",
          300: "#d6d3d1",
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
        "fade-up": "fade-up 0.6s ease-out both",
        "hero-bubble-in": "hero-bubble-in 0.5s ease-out both",
        "hero-bubble-out": "hero-bubble-out 0.3s ease-out both",
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
        "fade-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "hero-bubble-in": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "hero-bubble-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
