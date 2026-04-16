import { useCallback, useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import VoiceAgent from "./components/VoiceAgent";
import "./App.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

const LANGUAGES = [
  { code: "english", label: "English", flag: "EN" },
  { code: "german", label: "German", flag: "DE" },
  { code: "hindi", label: "Hindi", flag: "HI" },
];

const MODES = [
  { code: "vocabulary", label: "Vocabulary", description: "Learn new words & phrases", icon: "\u{1F4DA}" },
  { code: "grammar", label: "Grammar", description: "Master language rules", icon: "\u{1F4DD}" },
  { code: "conversation", label: "Conversation", description: "Practice real dialogue", icon: "\u{1F4AC}" },
];

const LEVELS = [
  { code: "beginner", label: "Beginner" },
  { code: "intermediate", label: "Intermediate" },
  { code: "advanced", label: "Advanced" },
];

function App() {
  const [token, setToken] = useState<string>("");
  const [connected, setConnected] = useState(false);
  const [lang, setLang] = useState("english");
  const [mode, setMode] = useState("vocabulary");
  const [level, setLevel] = useState("beginner");

  const connect = useCallback(async () => {
    const params = new URLSearchParams({ lang, mode, level });
    const res = await fetch(`${BACKEND_URL}/token?${params}`);
    const data = await res.json();
    setToken(data.token);
    setConnected(true);
  }, [lang, mode, level]);

  const disconnect = useCallback(() => {
    setToken("");
    setConnected(false);
  }, []);

  const langLabel = LANGUAGES.find((l) => l.code === lang)?.label ?? lang;
  const modeLabel = MODES.find((m) => m.code === mode)?.label ?? mode;
  const levelLabel = LEVELS.find((l) => l.code === level)?.label ?? level;

  if (!connected) {
    return (
      <div className="app">
        <div className="start-screen">
          <h1>BhashaShikhi</h1>
          <p>Your AI Language Tutor</p>

          <div className="lang-selector">
            <label className="lang-label">I want to learn</label>
            <select
              className="lang-dropdown"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mode-selector">
            {MODES.map((m) => (
              <button
                key={m.code}
                className={`mode-card ${mode === m.code ? "selected" : ""}`}
                onClick={() => setMode(m.code)}
              >
                <span className="mode-card-icon">{m.icon}</span>
                <span className="mode-card-label">{m.label}</span>
                <span className="mode-card-desc">{m.description}</span>
              </button>
            ))}
          </div>

          <div className="level-selector">
            {LEVELS.map((l) => (
              <button
                key={l.code}
                className={`level-btn ${level === l.code ? "selected" : ""}`}
                onClick={() => setLevel(l.code)}
              >
                {l.label}
              </button>
            ))}
          </div>

          <button className="connect-btn" onClick={connect}>
            <span>Start Learning</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <LiveKitRoom
        serverUrl={import.meta.env.VITE_LIVEKIT_URL}
        token={token}
        connect={true}
        audio={{
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }}
        onDisconnected={disconnect}
      >
        <VoiceAgent
          onDisconnect={disconnect}
          lang={langLabel}
          mode={modeLabel}
          level={levelLabel}
        />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}

export default App;
