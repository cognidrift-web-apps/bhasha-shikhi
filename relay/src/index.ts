import "dotenv/config";
import { WebSocketServer, WebSocket } from "ws";
import http from "node:http";
import { GeminiLiveSession } from "./gemini-session.js";
import { insertTranscript, updateSessionUserName } from "./supabase.js";

const PORT = parseInt(process.env.PORT || "8081", 10);
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",");
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-live-preview";
const GEMINI_VOICE_DEFAULT = process.env.GEMINI_VOICE || "Kore";
const VOICE_MAP: Record<string, string> = {
  priya: "Kore",
  nabanita: "Aoede",
};

// Tutor prompts are duplicated here to keep the relay self-contained.
// The relay deploys separately to Railway and cannot import from the Next.js app.
import { buildTutorPrompt } from "./prompts.js";

const VALID_LANGUAGES = new Set(["english", "german", "arabic", "hindi"]);
const VALID_MODES = new Set(["word_by_word", "conversation", "roleplay", "pronunciation", "grammar", "listening", "live_translation"]);
const VALID_LEVELS = new Set(["beginner", "intermediate", "advanced"]);

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  const origin = req.headers.origin || "";
  if (!ALLOWED_ORIGINS.some((o) => origin === o)) {
    ws.close(4003, "Origin not allowed");
    return;
  }

  let gemini: GeminiLiveSession | null = null;
  let sessionId: string | null = null;
  let transcriptSeq = 0;
  let nameExtracted = false;

  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      if (msg.type === "config") {
        if (!VALID_LANGUAGES.has(msg.language) || !VALID_MODES.has(msg.mode) || !VALID_LEVELS.has(msg.level)) {
          ws.send(JSON.stringify({ type: "error", message: "Invalid config" }));
          ws.close(4001);
          return;
        }
        sessionId = msg.sessionId;
        const prompt = buildTutorPrompt(msg.language, msg.mode, msg.level);
        const voiceName = VOICE_MAP[msg.voice as string] || GEMINI_VOICE_DEFAULT;

        gemini = new GeminiLiveSession({
          apiKey: GEMINI_API_KEY,
          model: GEMINI_MODEL,
          systemPrompt: prompt,
          voiceName,
          onReady: () => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "ready" }));
            }
          },
          onAudio: (data) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "audio", data }));
            }
          },
          onTranscript: (role, content) => {
            transcriptSeq++;
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "transcript", role, content }));
            }
            if (sessionId) {
              insertTranscript(sessionId, role, content, transcriptSeq);

              if (!nameExtracted && role === "user" && transcriptSeq <= 5) {
                const nameMatch = content.match(
                  /(?:my name is|ami |amar nam )\s*(\S+)/i,
                );
                if (nameMatch) {
                  nameExtracted = true;
                  updateSessionUserName(sessionId, nameMatch[1]);
                }
              }
            }
          },
          onTurnComplete: () => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "turn_complete" }));
            }
          },
          onInterrupted: () => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "interrupted" }));
            }
          },
          onError: (detail) => {
            console.error("[relay] session error:", detail);
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "error", message: "Session error" }));
            }
          },
          onClose: () => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "ended" }));
            }
          },
        });

        gemini.connect();
      } else if (msg.type === "audio" && gemini) {
        gemini.sendAudio(msg.data);
      } else if (msg.type === "end") {
        gemini?.close();
      }
    } catch {
      // ignore malformed messages
    }
  });

  ws.on("close", () => {
    gemini?.close();
  });
});

server.listen(PORT, () => {
  console.log(`Relay server listening on port ${PORT}`);
});
