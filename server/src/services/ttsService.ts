import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { CHARACTER_VOICES, CharacterVoice } from '../utils/prompts';
import {
  isVoiceboxEnabled,
  isVoiceboxAvailable,
  voiceboxSynthesize,
  saveVoiceboxAudio,
} from './voiceboxService';

export { CHARACTER_VOICES, CharacterVoice };

const TTS_CACHE_DIR = path.join(process.cwd(), 'audio-cache');

const VOICE_LANGUAGE_HINT: Record<string, string> = {
  blessica: 'bisaya',
  maria: 'tagalog',
  juan: 'tagalog',
};

function sanitizeSsml(input: string): string {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .slice(0, 500);
}

async function synthesizeWithMsEdge(
  cleanText: string,
  voice: CharacterVoice,
  rate?: number,
  pitch?: number
): Promise<Buffer> {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice.voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  const effectiveRate = rate !== undefined ? rate : (voice.rate ?? 1);
  const effectivePitch = pitch !== undefined ? pitch : (voice.pitch ?? 1);

  const { audioStream } = await tts.toStream(cleanText, {
    rate: String(effectiveRate),
    pitch: `${Math.round((effectivePitch - 1) * 100)}%`,
  });

  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    audioStream.on('data', (d: Buffer) => chunks.push(Buffer.from(d)));
    audioStream.on('close', () => resolve());
    audioStream.on('error', (e: Error) => reject(e));
  });

  tts.close();
  return Buffer.concat(chunks);
}

class LocalTTSService {
  private cacheDir: string;

  constructor() {
    this.cacheDir = TTS_CACHE_DIR;
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  getVoices(): Record<string, CharacterVoice> {
    return CHARACTER_VOICES;
  }

  async synthesize(
    text: string,
    voiceKey: string = 'blessica',
    rate?: number,
    pitch?: number,
    language?: string
  ): Promise<{ url: string; cached: boolean; voice: string; provider?: string }> {
    const voice = CHARACTER_VOICES[voiceKey] || CHARACTER_VOICES.blessica;
    const cleanText = sanitizeSsml(text);
    const lang = language || VOICE_LANGUAGE_HINT[voiceKey] || 'bisaya';

    const hash = crypto
      .createHash('sha1')
      .update(`v2|${voice.voiceName}|${rate ?? voice.rate ?? 1}|${pitch ?? voice.pitch ?? 1}|${lang}|${cleanText}`)
      .digest('hex');

    let provider = 'msedge-tts';
    let ext = 'mp3';

    if (isVoiceboxEnabled() && (await isVoiceboxAvailable())) {
      const voiceboxPath = path.join(this.cacheDir, `${hash}.wav`);
      const msedgePath = path.join(this.cacheDir, `${hash}.mp3`);

      if (!fs.existsSync(voiceboxPath)) {
        try {
          const { buffer, ext: voiceboxExt } = await voiceboxSynthesize(cleanText, lang);
          ext = voiceboxExt;
          saveVoiceboxAudio(buffer, this.cacheDir, hash, ext);
          provider = 'voicebox';
        } catch (err) {
          console.warn('[TTS] Voicebox synthesis failed, falling back to msedge-tts:', err);
          if (!fs.existsSync(msedgePath)) {
            const buffer = await synthesizeWithMsEdge(cleanText, voice, rate, pitch);
            fs.writeFileSync(msedgePath, buffer);
          }
          ext = 'mp3';
        }
      } else {
        provider = 'voicebox';
        ext = 'wav';
      }
    } else {
      const filePath = path.join(this.cacheDir, `${hash}.mp3`);
      if (!fs.existsSync(filePath)) {
        const buffer = await synthesizeWithMsEdge(cleanText, voice, rate, pitch);
        fs.writeFileSync(filePath, buffer);
      }
      ext = 'mp3';
    }

    return {
      url: `/audio/tts/${hash}.${ext}`,
      cached: true,
      voice: voice.voiceName,
      provider,
    };
  }
}

const ttsService = new LocalTTSService();
export default ttsService;
export { sanitizeSsml };
