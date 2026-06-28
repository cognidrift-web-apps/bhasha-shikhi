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
          page: "#E0E4F3",
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
        "orb-pulse": "orb-pulse 300ms ease-out",
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
        "orb-pulse": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
