import { useVoiceAssistant } from "@livekit/components-react";

interface Props {
  onDisconnect: () => void;
  lang: string;
  mode: string;
  level: string;
}

export default function VoiceAgent({ onDisconnect, lang, mode, level }: Props) {
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
    thinking: "Thinking",
    speaking: "Speaking",
  };

  return (
    <div className="voice-agent">
      <p className="voice-agent-title">BhashaShikhi</p>

      <div className="session-badge-row">
        <span className="session-badge lang">{lang}</span>
        <span className="session-badge mode">{mode}</span>
        <span className="session-badge level">{level}</span>
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
        End Lesson
      </button>
    </div>
  );
}
