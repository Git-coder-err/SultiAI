import { File, Paths } from 'expo-file-system';
import { getAudioPlayer } from './tts';

let rtListener = null;

export function base64ToPcmBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function pcmBytesToWav(pcm, sampleRate, channels = 1) {
  const dataSize = pcm.length;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const writeAscii = (offset, text) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };
  writeAscii(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(8, 'WAVE');
  writeAscii(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channels * 2, true);
  view.setUint16(32, channels * 2, true);
  view.setUint16(34, 16, true);
  writeAscii(36, 'data');
  view.setUint32(40, dataSize, true);
  new Uint8Array(buffer, 44).set(pcm);
  return buffer;
}

export function playRealtimePcm(base64, sampleRate = 24000, { onDone, onError } = {}) {
  try {
    const pcm = base64ToPcmBytes(base64);
    if (!pcm.length) {
      if (onDone) onDone();
      return;
    }
    const wavBytes = new Uint8Array(pcmBytesToWav(pcm, sampleRate));
    const file = new File(Paths.cache, `sulti-reply-${Date.now()}.wav`);
    if (!file.exists) file.create({ idempotent: true });
    file.write(wavBytes);

    const player = getAudioPlayer();
    player.pause();
    if (rtListener) {
      player.removeListener(rtListener);
      rtListener = null;
    }
    player.replace({ uri: file.uri });
    rtListener = player.addListener('playbackStatusUpdate', (status) => {
      if (status && status.didJustFinish) {
        player.removeListener(rtListener);
        rtListener = null;
        if (onDone) onDone();
      }
    });
    player.play();
    setTimeout(() => {
      try {
        if (file.exists) file.delete();
      } catch {}
    }, 60000);
  } catch (e) {
    if (onError) onError(e);
  }
}
