/**
 * PCM audio utilities shared between voice hooks.
 *
 * encodePcmToBase64  — converts a raw Int16 PCM ArrayBuffer to a base64 string
 *                      for transmission over WebSocket.
 *
 * decodeBase64ToFloat32 — converts a base64-encoded PCM Int16 payload received
 *                         from the relay server back to a Float32Array suitable
 *                         for the Web Audio API.
 */

/**
 * Encode an ArrayBuffer of Int16 PCM samples as a base64 string.
 * The worklet posts `int16.buffer` — pass that here before sending over WS.
 */
export function encodePcmToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

/**
 * Decode a base64 Int16 PCM string into a Float32Array.
 * Used by the playback pipeline in useGeminiLive to render audio chunks.
 */
export function decodeBase64ToFloat32(base64: string): Float32Array<ArrayBuffer> {
  const raw = atob(base64);
  const int16 = new Int16Array(raw.length / 2);
  for (let i = 0; i < int16.length; i++) {
    int16[i] = raw.charCodeAt(i * 2) | (raw.charCodeAt(i * 2 + 1) << 8);
  }
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / 32768;
  }
  // Return as Float32Array<ArrayBuffer> for Web Audio API compatibility
  return new Float32Array(float32.buffer as ArrayBuffer);
}
