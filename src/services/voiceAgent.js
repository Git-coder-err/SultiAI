import { api } from './api';

export const REALTIME_INPUT_RATE = 24000;
export const ELEVENLABS_INPUT_RATE = 16000;

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
    elevenlabs_available: !!(status.elevenlabs && status.elevenlabs.available),
  };
}

export async function fetchElevenlabsConfig(language = 'tagalog') {
  const config = await api.elevenlabsSession();
  const languageCode = { tagalog: 'fil', bisaya: 'ceb', english: 'en' }[language] || 'fil';
  return { ...config, language, language_code: languageCode };
}

const LANGUAGE_NAMES = {
  bisaya: 'Bisaya (Cebuano)',
  tagalog: 'Tagalog',
  english: 'English',
};

export function buildElevenlabsPrompt(language = 'tagalog') {
  const langName = LANGUAGE_NAMES[language] || LANGUAGE_NAMES.tagalog;
  return `You are "Sulti", a friendly and patient ${langName} language tutor for the SultiAI app.
Help non-native speakers build conversational fluency, proper pronunciation, and real-world confidence in speaking ${langName}.

RULES:
- Keep every reply CONCISE: 1 to 3 short sentences so it feels like a live conversation.
- Speak plain text only — never use markdown symbols, bullets, emojis, or code blocks; your words are read aloud by TTS.
- Respond primarily in ${langName}, mixed with friendly English explanations when the learner struggles. Switch to full ${langName} immersion only if the learner asks.
- Gently correct grammar or pronunciation mistakes first, then continue the conversation naturally.
- When teaching a new word, say the word slowly, give its English meaning, then use it in a simple example sentence.`;
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

// ElevenLabs Agents (Conversational AI) speech-to-speech WebSocket session.
// Protocol: wss conversation — first message is conversation_initiation_client_data,
// then user_audio_chunk frames in; server streams audio/user_transcript/agent_response back.
export class ElevenLabsVoiceSession {
  constructor({ url, language = 'tagalog', overridesAllowed = false, onEvent, onError, onClose }) {
    this.url = url;
    this.language = language;
    this.overridesAllowed = !!overridesAllowed;
    this.onEvent = onEvent;
    this.onError = onError;
    this.onClose = onClose;
    this.outputSampleRate = 24000; // updated from conversation_initiation_metadata
    this.conversationId = null;
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
        ws = new WebSocket(this.url);
      } catch (e) {
        reject(e);
        return;
      }
      this.ws = ws;
      ws.onopen = () => {
        // The signed URL already authenticates us; kick off the conversation.
        const init = { type: 'conversation_initiation_client_data' };
        if (this.overridesAllowed) {
          init.conversation_config_override = {
            agent: {
              first_message: '',
              prompt: { prompt: buildElevenlabsPrompt(this.language) },
            },
          };
          const code = { tagalog: 'fil', bisaya: 'ceb', english: 'en' }[this.language];
          if (code && code !== 'ceb') init.conversation_config_override.agent.language = code;
        }
        try {
          ws.send(JSON.stringify(init));
        } catch (e) {
          reject(e);
          return;
        }
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
        if (!msg || !msg.type) return;

        // Keep-alive: reply to pings immediately so the socket stays healthy.
        if (msg.type === 'ping') {
          try {
            ws.send(
              JSON.stringify({ type: 'pong', event_id: msg.ping_event && msg.ping_event.event_id })
            );
          } catch {}
          return;
        }

        if (msg.type === 'conversation_initiation_metadata') {
          const meta = msg.conversation_initiation_metadata_event || {};
          const fmt = meta.agent_output_audio_format || '';
          const rateMatch = /pcm_(\d+)/.exec(fmt);
          if (rateMatch) this.outputSampleRate = parseInt(rateMatch[1], 10);
          this.conversationId = meta.conversation_id || this.conversationId;
        }

        if (this.onEvent) this.onEvent(msg);
      };
      ws.onerror = () => {
        if (this._rejectOpen) {
          this._rejectOpen(new Error('ElevenLabs WebSocket error'));
          this._resolveOpen = null;
          this._rejectOpen = null;
        }
        if (this.onError) this.onError(event);
      };
      ws.onclose = (event) => {
        if (this._rejectOpen) {
          this._rejectOpen(new Error('ElevenLabs WebSocket closed before opening'));
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

  appendAudio(base64) {
    if (!this.isOpen()) return false;
    this.ws.send(JSON.stringify({ user_audio_chunk: base64 }));
    return true;
  }

  sendTextMessage(text) {
    if (!this.isOpen()) return false;
    this.ws.send(JSON.stringify({ type: 'user_message', text }));
    return true;
  }

  close() {
    try {
      if (this.ws) this.ws.close();
    } catch {}
    this.ws = null;
  }
}
