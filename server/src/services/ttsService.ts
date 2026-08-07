import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { CHARACTER_VOICES, CharacterVoice } from '../utils/prompts';

export { CHARACTER_VOICES, CharacterVoice };

const TTS_CACHE_DIR = path.join(process.cwd(), 'audio-cache');

function sanitizeSsml(input: string): string {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .slice(0, 500);
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
    pitch?: number
  ): Promise<{ url: string; cached: boolean; voice: string }> {
    const voice = CHARACTER_VOICES[voiceKey] || CHARACTER_VOICES.blessica;
    const cleanText = sanitizeSsml(text);
    
    const hash = crypto
      .createHash('sha1')
      .update(`${voice.voiceName}|${rate ?? voice.rate ?? 1}|${pitch ?? voice.pitch ?? 1}|${cleanText}`)
      .digest('hex');
    
    const filePath = path.join(this.cacheDir, `${hash}.mp3`);

    if (!fs.existsSync(filePath)) {
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
      fs.writeFileSync(filePath, Buffer.concat(chunks));
    }

    return {
      url: `/audio/tts/${hash}.mp3`,
      cached: true,
      voice: voice.voiceName,
    };
  }
}

const ttsService = new LocalTTSService();
export default ttsService;
export { sanitizeSsml };
