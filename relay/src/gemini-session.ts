import WebSocket from "ws";

const GEMINI_WS_URL =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent";

export interface GeminiSessionConfig {
  apiKey: string;
  model: string;
  systemPrompt: string;
  voiceName: string;
  onAudio: (base64Audio: string) => void;
  onTranscript: (role: "user" | "tutor", text: string) => void;
  onError: (error: string) => void;
  onClose: () => void;
}

export class GeminiLiveSession {
  private ws: WebSocket | null = null;
  private config: GeminiSessionConfig;

  constructor(config: GeminiSessionConfig) {
    this.config = config;
  }

  connect(): void {
    const url = `${GEMINI_WS_URL}?key=${this.config.apiKey}`;
    this.ws = new WebSocket(url);

    this.ws.on("open", () => {
      this.sendSetup();
    });

    this.ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        this.handleMessage(msg);
      } catch {
        // ignore unparseable messages
      }
    });

    this.ws.on("error", (err) => {
      this.config.onError(err.message);
    });

    this.ws.on("close", () => {
      this.config.onClose();
    });
  }

  private sendSetup(): void {
    const setup = {
      setup: {
        model: `models/${this.config.model}`,
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: this.config.voiceName,
              },
            },
          },
        },
        systemInstruction: {
          parts: [{ text: this.config.systemPrompt }],
        },
      },
    };
    this.ws?.send(JSON.stringify(setup));
  }

  sendAudio(base64Pcm: string): void {
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    const msg = {
      realtimeInput: {
        mediaChunks: [
          {
            mimeType: "audio/pcm;rate=16000",
            data: base64Pcm,
          },
        ],
      },
    };
    this.ws.send(JSON.stringify(msg));
  }

  private handleMessage(msg: Record<string, unknown>): void {
    const serverContent = msg.serverContent as Record<string, unknown> | undefined;
    if (!serverContent) return;

    const modelTurn = serverContent.modelTurn as Record<string, unknown> | undefined;
    if (modelTurn?.parts && Array.isArray(modelTurn.parts)) {
      for (const part of modelTurn.parts) {
        const p = part as Record<string, unknown>;
        if (p.inlineData) {
          const inlineData = p.inlineData as { data?: string };
          if (inlineData.data) {
            this.config.onAudio(inlineData.data);
          }
        }
        if (typeof p.text === "string" && p.text.trim()) {
          this.config.onTranscript("tutor", p.text.trim());
        }
      }
    }

    const inputTranscript = serverContent.inputTranscript as string | undefined;
    if (inputTranscript?.trim()) {
      this.config.onTranscript("user", inputTranscript.trim());
    }
  }

  close(): void {
    this.ws?.close();
    this.ws = null;
  }
}
