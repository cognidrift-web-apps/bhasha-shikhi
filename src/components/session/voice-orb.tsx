"use client";

type AgentState = "idle" | "listening" | "thinking" | "speaking";

interface Props {
  state: AgentState;
}

const ORB_STYLES: Record<AgentState, { gradient: string; glow: string }> = {
  idle: {
    gradient: "var(--gradient-orb-idle)",
    glow: "0 0 40px 10px rgba(229,57,53,0.25)",
  },
  listening: {
    gradient: "var(--gradient-orb-listen)",
    glow: "0 0 50px 14px rgba(22,163,74,0.3)",
  },
  thinking: {
    gradient: "var(--gradient-orb-idle)",
    glow: "0 0 30px 8px rgba(229,57,53,0.15)",
  },
  speaking: {
    gradient: "var(--gradient-orb-speak)",
    glow: "0 0 60px 18px rgba(249,168,37,0.35)",
  },
};

const RING_COLORS: Record<string, string> = {
  listening: "border-green-500/30",
  speaking: "border-amber-500/30",
};

export function VoiceOrb({ state }: Props) {
  const isActive = state === "listening" || state === "speaking";
  const isSpeaking = state === "speaking";
  const style = ORB_STYLES[state];

  return (
    <div className="relative flex items-center justify-center h-[200px] w-[200px] md:h-[240px] md:w-[240px]">
      {isActive && (
        <div
          aria-hidden="true"
          className={`absolute inset-0 rounded-full border-2 ${RING_COLORS[state]} ${
            isSpeaking ? "animate-ring-expand-fast" : "animate-ring-expand"
          }`}
        />
      )}
      {isSpeaking && (
        <div
          aria-hidden="true"
          className="absolute inset-[10px] rounded-full border-2 border-amber-500/15 animate-ring-expand-fast"
          style={{ animationDelay: "0.3s" }}
        />
      )}
      <div
        className={`relative z-10 h-[160px] w-[160px] md:h-[200px] md:w-[200px] rounded-full transition-all duration-500 ${
          state === "idle"
            ? "animate-orb-breathe"
            : state === "listening"
            ? "animate-orb-pulse"
            : state === "thinking"
            ? "animate-orb-breathe opacity-60"
            : "animate-orb-energetic"
        }`}
        style={{
          background: style.gradient,
          boxShadow: style.glow,
        }}
      >
        <div
          className="absolute top-[15%] left-[20%] h-[30%] w-[30%] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.6), transparent)",
          }}
        />
      </div>
    </div>
  );
}
