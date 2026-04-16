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
  { code: "bengali", label: "Bengali", flag: "BN" },
  { code: "german", label: "German", flag: "DE" },
  { code: "hindi", label: "Hindi", flag: "HI" },
];

function App() {
  const [token, setToken] = useState<string>("");
  const [connected, setConnected] = useState(false);
  const [fromLang, setFromLang] = useState("english");
  const [toLang, setToLang] = useState("bengali");

  const connect = useCallback(async () => {
    const params = new URLSearchParams({ from_lang: fromLang, to_lang: toLang });
    const res = await fetch(`${BACKEND_URL}/token?${params}`);
    const data = await res.json();
    setToken(data.token);
    setConnected(true);
  }, [fromLang, toLang]);

  const disconnect = useCallback(() => {
    setToken("");
    setConnected(false);
  }, []);

  const swapLanguages = () => {
    setFromLang(toLang);
    setToLang(fromLang);
  };

  const fromLabel = LANGUAGES.find((l) => l.code === fromLang)?.label ?? fromLang;
  const toLabel = LANGUAGES.find((l) => l.code === toLang)?.label ?? toLang;

  if (!connected) {
    return (
      <div className="app">
        <div className="start-screen">
          <h1>Voice Translator</h1>
          <p>Select languages and start speaking</p>

          <div className="lang-selector">
            <div className="lang-group">
              <label className="lang-label">From</label>
              <select
                className="lang-dropdown"
                value={fromLang}
                onChange={(e) => setFromLang(e.target.value)}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <button className="swap-btn" onClick={swapLanguages} aria-label="Swap languages">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>

            <div className="lang-group">
              <label className="lang-label">To</label>
              <select
                className="lang-dropdown"
                value={toLang}
                onChange={(e) => setToLang(e.target.value)}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button className="connect-btn" onClick={connect}>
            <span>Begin Translation</span>
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
          fromLang={fromLabel}
          toLang={toLabel}
        />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}

export default App;
