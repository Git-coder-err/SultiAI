import { createAudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';
import { api, BASE_URL } from '../services/api';
import { sanitizeForSpeech } from './speech';

let player = null;
let listener = null;
let currentToken = 0;
let muted = false;

function getPlayer() {
  if (!player) player = createAudioPlayer(null);
  return player;
}

export function getAudioPlayer() {
  return getPlayer();
}

export function setTTSMuted(value) {
  muted = !!value;
}

export function isTTSMuted() {
  return muted;
}

export function stopTTS() {
  currentToken++;
  try {
    if (player) {
      if (listener) {
        player.removeListener(listener);
        listener = null;
      }
      player.pause();
      player.seekTo(0);
    }
  } catch {}
  Speech.stop();
}

function speakFallback(clean, { language, rate, onDone, onError }) {
  Speech.speak(clean, {
    language: language || 'ceb',
    rate,
    onDone,
    onError,
  });
}

export function speakTTS(text, { voice = 'fil', rate = 0.9, language, onDone, onError } = {}) {
  const clean = sanitizeForSpeech(text);
  if (!clean) {
    if (onDone) onDone();
    return;
  }
  const token = ++currentToken;
  let finished = false;
  const finish = (err) => {
    if (finished) return;
    finished = true;
    if (token !== currentToken) return;
    if (err) {
      if (onError) onError();
    } else if (onDone) {
      onDone();
    }
  };

  if (muted) {
    const simulatedMs = Math.min(3000, 500 + clean.length * 55);
    setTimeout(() => finish(), simulatedMs);
    return;
  }

  api
    .ttsSynthesize(clean, voice, rate)
    .then(({ url }) => {
      if (token !== currentToken) return;
      try {
        const p = getPlayer();
        p.pause();
        if (listener) p.removeListener(listener);
        p.replace({ uri: `${BASE_URL}${url}` });
        listener = p.addListener('playbackStatusUpdate', (status) => {
          if (status && status.didJustFinish) finish();
        });
        p.play();
      } catch (e) {
        speakFallback(clean, { language, rate, onDone: finish, onError: finish });
      }
    })
    .catch(() => {
      if (token !== currentToken) return;
      speakFallback(clean, { language, rate, onDone: finish, onError: finish });
    });
}
