"use client";

import { useCallback, useRef, useState } from "react";
import type { SessionConfig } from "@/lib/constants";
import { encodePcmToBase64, decodeBase64ToFloat32 } from "@/lib/audio/pcm-worklet";

export interface TranscriptEntry {
  role: "user" | "tutor";
  content: string;
  timestamp: number;
}

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";
type AgentState = "idle" | "listening" | "speaking";

export function useGeminiLive(sessionId: string | null, config: SessionConfig) {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [agentState, setAgentState] = useState<AgentState>("idle");
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const playBufferRef = useRef<Float32Array<ArrayBuffer>[]>([]);
  const isPlayingRef = useRef(false);

  const drainPlayBuffer = useCallback((ctx: AudioContext) => {
    const chunk = playBufferRef.current.shift();
    if (!chunk) {
      isPlayingRef.current = false;
      setAgentState("listening");
      return;
    }
    const buffer = ctx.createBuffer(1, chunk.length, 24000);
    buffer.copyToChannel(chunk, 0);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => drainPlayBuffer(ctx);
    source.start();
  }, []);

  const playAudioChunk = useCallback(
    (base64: string) => {
      if (!audioContextRef.current) return;
      const ctx = audioContextRef.current;
      const float32 = decodeBase64ToFloat32(base64);
      playBufferRef.current.push(float32);

      if (!isPlayingRef.current) {
        isPlayingRef.current = true;
        setAgentState("speaking");
        drainPlayBuffer(ctx);
      }
    },
    [drainPlayBuffer],
  );

  const connect = useCallback(async () => {
    if (!sessionId) return;
    setStatus("connecting");

    try {
      const ctx = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = ctx;

      await ctx.audioWorklet.addModule("/pcm-processor.js");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const source = ctx.createMediaStreamSource(stream);
      const worklet = new AudioWorkletNode(ctx, "pcm-processor");
      workletRef.current = worklet;
      source.connect(worklet);

      const wsUrl = process.env.NEXT_PUBLIC_WS_RELAY_URL!;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: "config",
            sessionId,
            language: config.language,
            mode: config.mode,
            level: config.level,
          }),
        );
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data as string);
        if (msg.type === "ready") {
          setStatus("connected");
          setAgentState("listening");

          worklet.port.onmessage = (e) => {
            const buffer = e.data as ArrayBuffer;
            ws.send(JSON.stringify({ type: "audio", data: encodePcmToBase64(buffer) }));
          };
        } else if (msg.type === "audio") {
          playAudioChunk(msg.data as string);
        } else if (msg.type === "transcript") {
          setTranscripts((prev) => [
            ...prev,
            {
              role: msg.role as "user" | "tutor",
              content: msg.content as string,
              timestamp: Date.now(),
            },
          ]);
        } else if (msg.type === "error") {
          setStatus("error");
        }
      };

      ws.onerror = () => setStatus("error");
      ws.onclose = () => {
        if (status !== "error") setStatus("disconnected");
      };
    } catch {
      setStatus("error");
    }
  }, [sessionId, config, playAudioChunk, status]);

  const disconnect = useCallback(() => {
    wsRef.current?.send(JSON.stringify({ type: "end" }));
    wsRef.current?.close();
    workletRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioContextRef.current?.close();
    setStatus("disconnected");
    setAgentState("idle");
  }, []);

  return { connect, disconnect, status, agentState, transcripts };
}
