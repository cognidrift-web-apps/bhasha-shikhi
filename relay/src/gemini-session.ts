import WebSocket from "ws";

const GEMINI_WS_URL =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent";

export interface GeminiSessionConfig {
  apiKey: string;
  model: string;
  systemPrompt: string;
  voiceName: string;
  onReady: () => void;
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
      console.log(`[gemini] WebSocket open, sending setup for model ${this.config.model}`);
      this.sendSetup();
    });

    this.ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.setupComplete) {
          console.log("[gemini] Setup complete — session ready");
          this.sendGreetingKick();
          this.config.onReady();
          return;
        }
        this.handleMessage(msg);
      } catch {
        // ignore unparseable messages
      }
    });

    this.ws.on("error", (err) => {
      console.error("[gemini] WebSocket error:", err.message);
      this.config.onError(err.message);
    });

    this.ws.on("close", (code, reason) => {
      console.log(`[gemini] WebSocket closed: ${code} ${reason?.toString()}`);
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
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        systemInstruction: {
          parts: [{ text: this.config.systemPrompt }],
        },
      },
    };
    this.ws?.send(JSON.stringify(setup));
  }

  private sendGreetingKick(): void {
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    this.ws.send(
      JSON.stringify({
        clientContent: {
          turns: [
            {
              role: "user",
              parts: [{ text: "Hi" }],
            },
          ],
          turnComplete: true,
        },
      }),
    );
    console.log("[gemini] Sent greeting kick");
  }

  sendAudio(base64Pcm: string): void {
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    const msg = {
      realtimeInput: {
        audio: {
          mimeType: "audio/pcm;rate=16000",
          data: base64Pcm,
        },
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

    // New transcription format (Gemini 3.x)
    const outputTranscription = serverContent.outputTranscription as { text?: string } | undefined;
    if (outputTranscription?.text?.trim()) {
      this.config.onTranscript("tutor", outputTranscription.text.trim());
    }

    const inputTranscription = serverContent.inputTranscription as { text?: string } | undefined;
    if (inputTranscription?.text?.trim()) {
      this.config.onTranscript("user", inputTranscription.text.trim());
    }

    // Legacy format fallback
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
