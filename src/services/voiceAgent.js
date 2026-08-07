import { api } from './api';

export const REALTIME_INPUT_RATE = 24000;

export async function fetchVoiceAgentConfig() {
  try {
    return await api.agentToken();
  } catch (err) {
    // xAI realtime requires XAI_API_KEY - fall back to local mode
    const status = await api.agentStatus().catch(() => ({ realtime: false, local_available: true }));
    if (status.local_available) {
      return { local: true, url: null, token: null, session: null };
    }
    throw err;
  }
}

export async function checkVoiceMode() {
  const status = await api.agentStatus();
  return {
    realtime: status.realtime,
    local_available: status.local_available ?? true,
  };
}

export function encodePcm16ToBase64(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  const CHUNK = 0x4000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

export function encodeWavBase64(int16Array, sampleRate) {
  const buffer = new ArrayBuffer(44 + int16Array.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset, str) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + int16Array.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, int16Array.length * 2, true);

  let offset = 44;
  for (let i = 0; i < int16Array.length; i++) {
    view.setInt16(offset, int16Array[i], true);
    offset += 2;
  }

  const bytes = new Uint8Array(view.buffer);
  let binary = '';
  const CHUNK = 0x4000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

export function resampleInt16(arrayBuffer, fromRate, toRate) {
  if (!fromRate || fromRate === toRate) return arrayBuffer;
  const src = new Int16Array(arrayBuffer);
  if (!src.length) return arrayBuffer;
  const outLen = Math.max(1, Math.round(src.length * (toRate / fromRate)));
  const out = new Int16Array(outLen);
  const ratio = src.length / outLen;
  for (let i = 0; i < outLen; i++) {
    out[i] = src[Math.min(src.length - 1, Math.round(i * ratio))];
  }
  return out.buffer;
}

export function buildSessionUpdate(session) {
  return {
    type: 'session.update',
    session: {
      instructions: session.instructions,
      voice: session.voice,
      turn_detection: null,
      audio: {
        input: {
          transcription: { model: 'grok-transcribe' },
        },
      },
    },
  };
}

export class VoiceRealtimeSession {
  constructor({ url, token, onEvent, onError, onClose }) {
    this.url = url;
    this.token = token;
    this.onEvent = onEvent;
    this.onError = onError;
    this.onClose = onClose;
    this.ws = null;
    this._resolveOpen = null;
    this._rejectOpen = null;
  }

  open() {
    if (this.ws) this.close();
    return new Promise((resolve, reject) => {
      this._resolveOpen = resolve;
      this._rejectOpen = reject;
      let ws;
      try {
        ws = new WebSocket(this.url, [`xai-client-secret.${this.token}`]);
      } catch (e) {
        reject(e);
        return;
      }
      this.ws = ws;
      ws.onopen = () => {
        if (this._resolveOpen) {
          this._resolveOpen();
          this._resolveOpen = null;
          this._rejectOpen = null;
        }
      };
      ws.onmessage = (event) => {
        let msg;
        try {
          msg = JSON.parse(event.data);
        } catch {
          return;
        }
        if (this.onEvent) this.onEvent(msg);
      };
      ws.onerror = (event) => {
        if (this._rejectOpen) {
          this._rejectOpen(new Error('WebSocket error'));
          this._resolveOpen = null;
          this._rejectOpen = null;
        }
        if (this.onError) this.onError(event);
      };
      ws.onclose = (event) => {
        if (this._rejectOpen) {
          this._rejectOpen(new Error('WebSocket closed before opening'));
          this._resolveOpen = null;
          this._rejectOpen = null;
        }
        if (this.onClose) this.onClose(event);
      };
    });
  }

  isOpen() {
    return !!(this.ws && this.ws.readyState === WebSocket.OPEN);
  }

  _send(obj) {
    if (!this.isOpen()) return false;
    this.ws.send(JSON.stringify(obj));
    return true;
  }

  configure(session) {
    return this._send(buildSessionUpdate(session));
  }

  appendAudio(base64) {
    return this._send({ type: 'input_audio_buffer.append', audio: base64 });
  }

  commitAndRespond() {
    if (!this.isOpen()) return;
    this.ws.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
    this.ws.send(JSON.stringify({ type: 'response.create' }));
  }

  close() {
    try {
      if (this.ws) this.ws.close();
    } catch {}
    this.ws = null;
  }
}
