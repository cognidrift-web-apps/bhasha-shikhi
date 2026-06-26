"use client";

type AgentState = "idle" | "listening" | "thinking" | "speaking";

interface Props {
  state: AgentState;
}

export function VoiceOrb({ state }: Props) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer expanding ring - visible in listening and speaking */}
      <div
        data-state={state}
        className="absolute rounded-full orb-ring"
        aria-hidden="true"
      />
      {/* Main orb circle */}
      <div
        data-state={state}
        className="orb relative z-10 h-36 w-36 rounded-full"
      />
      <style>{`
        .orb {
          background: radial-gradient(circle at 35% 35%, #2dd4bf, #0d9488);
          box-shadow: 0 0 32px 8px rgba(13, 148, 136, 0.3);
          animation: orb-idle-pulse 3s ease-in-out infinite;
          transition: background 0.4s, box-shadow 0.4s;
        }

        .orb[data-state="idle"] {
          background: radial-gradient(circle at 35% 35%, #2dd4bf, #0d9488);
          box-shadow: 0 0 32px 8px rgba(13, 148, 136, 0.3);
          animation: orb-idle-pulse 3s ease-in-out infinite;
        }

        .orb[data-state="listening"] {
          background: radial-gradient(circle at 35% 35%, #5eead4, #14b8a6);
          box-shadow: 0 0 48px 16px rgba(20, 184, 166, 0.45);
          animation: orb-listen-pulse 1s ease-in-out infinite;
        }

        .orb[data-state="thinking"] {
          background: radial-gradient(circle at 35% 35%, #99f6e4, #0f766e);
          box-shadow: 0 0 24px 6px rgba(13, 148, 136, 0.2);
          animation: orb-idle-pulse 4s ease-in-out infinite;
          opacity: 0.75;
        }

        .orb[data-state="speaking"] {
          background: radial-gradient(circle at 35% 35%, #fdba74, #f97316);
          box-shadow: 0 0 56px 20px rgba(249, 115, 22, 0.45);
          animation: orb-speak-pulse 0.6s ease-in-out infinite;
        }

        .orb-ring {
          width: 160px;
          height: 160px;
          border: 2px solid transparent;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .orb-ring[data-state="listening"] {
          border-color: rgba(20, 184, 166, 0.4);
          opacity: 1;
          animation: orb-ring-expand 1.5s ease-out infinite;
        }

        .orb-ring[data-state="speaking"] {
          border-color: rgba(249, 115, 22, 0.4);
          opacity: 1;
          animation: orb-ring-expand 0.8s ease-out infinite;
        }

        @keyframes orb-idle-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }

        @keyframes orb-listen-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        @keyframes orb-speak-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }

        @keyframes orb-ring-expand {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
