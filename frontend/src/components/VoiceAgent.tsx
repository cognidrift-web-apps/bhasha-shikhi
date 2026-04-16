import { useVoiceAssistant } from "@livekit/components-react";

interface Props {
  onDisconnect: () => void;
  fromLang: string;
  toLang: string;
}

export default function VoiceAgent({ onDisconnect, fromLang, toLang }: Props) {
  const { state } = useVoiceAssistant();

  const orbState =
    state === "listening" || state === "thinking" || state === "speaking"
      ? state
      : state === "connecting" || state === "initializing"
        ? "connecting"
        : "idle";

  const stateLabel: Record<string, string> = {
    disconnected: "Ready",
    connecting: "Connecting",
    initializing: "Initializing",
    listening: "Listening",
    thinking: "Translating",
    speaking: "Speaking",
  };

  return (
    <div className="voice-agent">
      <p className="voice-agent-title">Voice Translator</p>

      <div className="lang-badge-row">
        <span className="lang-badge from">{fromLang}</span>
        <svg className="lang-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14m0 0l-6-6m6 6l-6 6" />
        </svg>
        <span className="lang-badge to">{toLang}</span>
      </div>

      <div className="orb-wrapper">
        <div className={`orb-glow ${orbState}`} />
        <div className={`orb-ring ${orbState}`} />
        <div className={`orb ${orbState}`} />
      </div>

      <p className={`agent-status ${orbState}`}>
        {stateLabel[state] ?? state}
      </p>

      <button className="disconnect-btn" onClick={onDisconnect}>
        End session
      </button>
    </div>
  );
}
