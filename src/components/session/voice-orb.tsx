"use client";

type AgentState = "idle" | "listening" | "thinking" | "speaking";

interface Props {
  state: AgentState;
}

export function VoiceOrb({ state }: Props) {
  const isActive = state === "listening" || state === "speaking";
  const isSpeaking = state === "speaking";

  return (
    <div className="relative flex items-center justify-center h-[240px] w-[240px] md:h-[280px] md:w-[280px]">
      {/* Outer ring 1 */}
      {isActive && (
        <div
          aria-hidden="true"
          className={`absolute inset-0 rounded-full border-2 ${
            isSpeaking
              ? "border-warm-500/30 animate-ring-expand-fast"
              : "border-accent-400/30 animate-ring-expand"
          }`}
        />
      )}
      {/* Outer ring 2 */}
      {isActive && (
        <div
          aria-hidden="true"
          className={`absolute inset-[10px] rounded-full border-2 ${
            isSpeaking
              ? "border-warm-500/15 animate-ring-expand-fast"
              : "border-accent-400/15 animate-ring-expand"
          }`}
          style={{ animationDelay: isSpeaking ? "0.3s" : "0.5s" }}
        />
      )}
      {/* Main orb */}
      <div
        className={`relative z-10 h-[180px] w-[180px] md:h-[220px] md:w-[220px] rounded-full transition-all duration-500 ${
          state === "idle" ? "animate-orb-breathe" :
          state === "listening" ? "animate-orb-pulse" :
          state === "thinking" ? "animate-orb-breathe opacity-75" :
          "animate-orb-energetic"
        }`}
        style={{
          background:
            state === "speaking"
              ? "radial-gradient(circle at 35% 35%, #FBBF24, #F59E0B)"
              : state === "listening"
              ? "radial-gradient(circle at 35% 35%, #67E8F9, #06B6D4)"
              : "radial-gradient(circle at 35% 35%, #A5B4FC, #6366F1)",
          boxShadow:
            state === "speaking"
              ? "0 0 70px 24px rgba(245, 158, 11, 0.45)"
              : state === "listening"
              ? "0 0 60px 20px rgba(6, 182, 212, 0.4)"
              : "0 0 40px 10px rgba(99, 102, 241, 0.3)",
        }}
      >
        {/* Inner highlight for 3D depth */}
        <div
          className="absolute top-[15%] left-[20%] h-[30%] w-[30%] rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.8), transparent)",
          }}
        />
      </div>
    </div>
  );
}
