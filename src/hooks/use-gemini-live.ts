"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SessionConfig } from "@/lib/constants";
import { encodePcmToBase64, decodeBase64ToFloat32 } from "@/lib/audio/pcm-worklet";

export interface TranscriptEntry {
  role: "user" | "tutor";
  content: string;
  bengaliText?: string;
  timestamp: number;
}

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";
type AgentState = "idle" | "listening" | "speaking";

export function useGeminiLive(sessionId: string | null, config: SessionConfig) {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const statusRef = useRef<ConnectionStatus>("disconnected");
  const [agentState, setAgentState] = useState<AgentState>("idle");
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [turnCompleteCount, setTurnCompleteCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const playBufferRef = useRef<Float32Array<ArrayBuffer>[]>([]);
  const isPlayingRef = useRef(false);
  const pendingTutorTextRef = useRef<string[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const connectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressUntilRef = useRef(0);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const drainPlayBuffer = useCallback((ctx: AudioContext) => {
    const chunk = playBufferRef.current.shift();
    if (!chunk) {
      isPlayingRef.current = false;
      currentSourceRef.current = null;
      setAgentState("listening");
      return;
    }
    const buffer = ctx.createBuffer(1, chunk.length, 24000);
    buffer.copyToChannel(chunk, 0);
    const source = ctx.createBufferSource();
    currentSourceRef.current = source;
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => drainPlayBuffer(ctx);
    source.start();
  }, []);

  const stopPlayback = useCallback(() => {
    playBufferRef.current = [];
    try { currentSourceRef.current?.stop(); } catch {}
    currentSourceRef.current = null;
    isPlayingRef.current = false;
  }, []);

  const flushPendingTranscripts = useCallback(() => {
    if (pendingTutorTextRef.current.length === 0) return;
    const text = pendingTutorTextRef.current.join(" ");
    pendingTutorTextRef.current = [];
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    setTranscripts((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === "tutor" && Date.now() - last.timestamp < 5000) {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...last,
          content: last.content + " " + text,
          timestamp: Date.now(),
        };
        return updated;
      }
      return [...prev, { role: "tutor", content: text, timestamp: Date.now() }];
    });
  }, []);

  const playAudioChunk = useCallback(
    (base64: string) => {
      if (!audioContextRef.current || Date.now() < suppressUntilRef.current) return;
      const ctx = audioContextRef.current;
      const float32 = decodeBase64ToFloat32(base64);
      playBufferRef.current.push(float32);

      flushPendingTranscripts();

      if (!isPlayingRef.current) {
        isPlayingRef.current = true;
        setAgentState("speaking");
        drainPlayBuffer(ctx);
      }
    },
    [drainPlayBuffer, flushPendingTranscripts],
  );

  const connect = useCallback(async () => {
    if (!sessionId) return;
    if (wsRef.current && (wsRef.current.readyState === WebSocket.CONNECTING || wsRef.current.readyState === WebSocket.OPEN)) return;
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

      connectTimeoutRef.current = setTimeout(() => {
        if (statusRef.current !== "connecting") return;
        statusRef.current = "error";
        wsRef.current?.close();
        wsRef.current = null;
        workletRef.current?.disconnect();
        workletRef.current = null;
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        audioContextRef.current?.close();
        audioContextRef.current = null;
        setStatus("error");
        setAgentState("idle");
      }, 15000);

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: "config",
            sessionId,
            language: config.language,
            mode: config.mode,
            level: config.level,
            voice: config.voice,
          }),
        );
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data as string);
        if (msg.type === "ready") {
          if (connectTimeoutRef.current) {
            clearTimeout(connectTimeoutRef.current);
            connectTimeoutRef.current = null;
          }
          setStatus("connected");
          setAgentState("listening");

          worklet.port.onmessage = (e) => {
            const buffer = e.data as ArrayBuffer;
            ws.send(JSON.stringify({ type: "audio", data: encodePcmToBase64(buffer) }));
          };
        } else if (msg.type === "audio") {
          playAudioChunk(msg.data as string);
        } else if (msg.type === "interrupted") {
          suppressUntilRef.current = Date.now() + 500;
          stopPlayback();
          flushPendingTranscripts();
          setAgentState("listening");
        } else if (msg.type === "transcript") {
          const role = msg.role as "user" | "tutor";
          const content = msg.content as string;
          if (role === "tutor") {
            pendingTutorTextRef.current.push(content);
            if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
            flushTimerRef.current = setTimeout(flushPendingTranscripts, 3000);
          } else {
            suppressUntilRef.current = Date.now() + 500;
            stopPlayback();
            setTranscripts((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.role === "user" && Date.now() - last.timestamp < 5000) {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...last,
                  content: last.content + " " + content,
                  timestamp: Date.now(),
                };
                return updated;
              }
              return [...prev, { role: "user", content, timestamp: Date.now() }];
            });
          }
        } else if (msg.type === "turn_complete") {
          flushPendingTranscripts();
          setTurnCompleteCount((c) => c + 1);
        } else if (msg.type === "error") {
          statusRef.current = "error";
          setStatus("error");
        }
      };

      ws.onerror = () => {
        statusRef.current = "error";
        setStatus("error");
      };
      ws.onclose = () => {
        if (statusRef.current === "connected" || statusRef.current === "connecting") {
          setStatus("error");
        }
      };
    } catch {
      setStatus("error");
    }
  }, [sessionId, config, playAudioChunk, stopPlayback, flushPendingTranscripts]);

  const disconnect = useCallback(() => {
    if (connectTimeoutRef.current) {
      clearTimeout(connectTimeoutRef.current);
      connectTimeoutRef.current = null;
    }
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    playBufferRef.current = [];
    try { currentSourceRef.current?.stop(); } catch {}
    currentSourceRef.current = null;
    isPlayingRef.current = false;
    statusRef.current = "disconnected";
    try { wsRef.current?.send(JSON.stringify({ type: "end" })); } catch {}
    wsRef.current?.close();
    wsRef.current = null;
    workletRef.current?.disconnect();
    workletRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioContextRef.current?.close();
    audioContextRef.current = null;
    setStatus("disconnected");
    setAgentState("idle");
  }, []);

  useEffect(() => {
    return () => {
      if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current);
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
      try { currentSourceRef.current?.stop(); } catch {}
      try { wsRef.current?.send(JSON.stringify({ type: "end" })); } catch {}
      wsRef.current?.close();
      workletRef.current?.disconnect();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioContextRef.current?.close();
    };
  }, []);

  return { connect, disconnect, status, agentState, transcripts, setTranscripts, turnCompleteCount };
}
