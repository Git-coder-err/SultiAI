import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, FlatList,
  ScrollView, AppState,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, withTiming, FadeInDown,
} from 'react-native-reanimated';
import { XP_VALUES } from '../constants';
import { useAccessibility } from '../hooks/useAccessibility';
import {
  useAudioStream, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioSampleListener,
} from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';

import VoiceBackground from '../components/voice/VoiceBackground';
import VoiceOrb from '../components/voice/VoiceOrb';
import StatusPill from '../components/voice/StatusPill';
import Greeting from '../components/voice/Greeting';
import SuggestedChips from '../components/voice/SuggestedChips';
import VoiceControls from '../components/voice/VoiceControls';
import SettingsSheet from '../components/voice/SettingsSheet';
import XpToast from '../components/voice/XpToast';
import { UserMessage, SultiMessage, TypingIndicator } from '../components/voice/MessageBubble';
import { voice } from '../components/voice/palette';
import { useGame } from '../context/GameContext';
import { api } from '../services/api';
import { useConversation } from '@elevenlabs/react-native';
import { speakTTS, stopTTS, setTTSMuted, getAudioPlayer } from '../utils/tts';
import { playRealtimePcm } from '../utils/realtimeAudio';
import {
  VoiceRealtimeSession, fetchVoiceAgentConfig, encodePcm16ToBase64, encodeWavBase64, resampleInt16, REALTIME_INPUT_RATE,
  fetchElevenlabsConfig, ELEVENLABS_INPUT_RATE, ELEVENLABS_AGENT_ID, buildElevenlabsOverrides,
} from '../services/voiceAgent';
import {
  hapticMicStart, hapticMicEnd, hapticAIBeginsSpeaking, hapticAIFinished,
  hapticError, hapticTap, hapticXpGain, setHapticsEnabled,
} from '../utils/haptics';

const ORB_INTRO = 200;
const ORB_TALK = 150;
const PREFS = {
  haptics: 'voice_haptics',
  continuous: 'voice_continuous',
  slow: 'voice_slow',
  muted: 'voice_muted',
  lang: 'voice_lang',
  character: 'voice_character',
};

const LANG_META = {
  bisaya: { flag: '🇵🇭', label: 'Bisaya' },
  tagalog: { flag: '🇵🇭', label: 'Tagalog' },
  english: { flag: '🇺🇸', label: 'English' },
};

export default function VoiceModeScreen({ navigation }) {
  const { addXp, streak } = useGame();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getAnimationDuration } = useAccessibility();

  const [orbState, setOrbState] = useState('idle');
  const [conversation, setConversation] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [hasSpoken, setHasSpoken] = useState(false);
  const [muted, setMuted] = useState(false);
  const [slowMode, setSlowMode] = useState(false);
  const [hapticsEnabled, setHapticsEnabledState] = useState(true);
  const [continuous, setContinuous] = useState(false);
  const [language, setLanguage] = useState('bisaya');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [xpToastVisible, setXpToastVisible] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState('blessica');

  const amplitude = useSharedValue(0);
  const listRef = useRef(null);
  const isRecordingRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const isConnectingRef = useRef(false);
  const voiceSessionRef = useRef(null);
  const elevenSessionRef = useRef(null);
  const agentModeRef = useRef(null); // 'elevenlabs' | 'xai' | 'local'
  const elevenFinalizeTimer = useRef(null);
  const elevenIdleTimer = useRef(null);
  const handleElevenEventRef = useRef(null);
  const transcriptRef = useRef('');
  const audioRef = useRef('');
  const handleRealtimeEventRef = useRef(null);
  const startRecordingRef = useRef(null);
  const sessionIdRef = useRef(null);
  const continuousRef = useRef(false);
  const mutedRef = useRef(false);
  const slowRef = useRef(false);
  const langRef = useRef('bisaya');
  const characterRef = useRef('blessica');
  const lastSampleAt = useRef(0);
  const lastReplyRef = useRef('');
  const durationTimer = useRef(null);
  const xpTimer = useRef(null);
  const restartTimer = useRef(null);
  const stopRecordingRef = useRef(null);
  const abortRecordingRef = useRef(null);
  const localModeRef = useRef(false);
  const audioChunksRef = useRef(null);

  // ElevenLabs Conversational AI SDK (React Native)
  const [sdkConnected, setSdkConnected] = useState(false);
  const elevenConversation = useConversation({
    onConnect: () => {
      setSdkConnected(true);
      setOrbState('listening');
      hapticMicStart();
    },
    onDisconnect: () => {
      setSdkConnected(false);
      if (agentModeRef.current === 'elevenlabs-sdk') {
        agentModeRef.current = null;
      }
    },
    onMessage: (message) => {
      if (!message) return;
      if (message.source === 'user' && message.message && message.message.trim()) {
        addMessage('user', message.message, null);
      }
      if (message.source === 'agent' && message.message) {
        transcriptRef.current = message.message;
        setHasSpoken(true);
      }
    },
    onError: (error) => {
      console.warn('ElevenLabs SDK error:', error);
      if (!isRecordingRef.current) {
        setOrbState('idle');
        hapticError();
      }
    },
    onModeChange: (mode) => {
      if (mode === 'speaking') {
        setOrbState('speaking');
        hapticAIBeginsSpeaking();
      } else if (mode === 'listening') {
        setOrbState('listening');
      } else if (mode === 'idle') {
        // Agent finished — finalize the turn
        const transcript = transcriptRef.current;
        transcriptRef.current = '';
        if (transcript) {
          addMessage('assistant', transcript, null);
          setHasSpoken(true);
        } else {
          addMessage('assistant', 'SULTI!', null);
        }
        addXp(XP_VALUES.VOICE_PRACTICE_TURN, 'voice_practice');
        setXpToastVisible(true);
        hapticXpGain();
        if (xpTimer.current) clearTimeout(xpTimer.current);
        xpTimer.current = setTimeout(() => setXpToastVisible(false), 2400);

        setOrbState('idle');
        hapticAIFinished();
        if (continuousRef.current && !isRecordingRef.current) {
          restartTimer.current = setTimeout(() => startRecordingRef.current && startRecordingRef.current(), 650);
        }
      }
    },
  });

  const clearElevenTimers = useCallback(() => {
    if (elevenFinalizeTimer.current) {
      clearTimeout(elevenFinalizeTimer.current);
      elevenFinalizeTimer.current = null;
    }
    if (elevenIdleTimer.current) {
      clearTimeout(elevenIdleTimer.current);
      elevenIdleTimer.current = null;
    }
  }, []);

  const closeElevenSession = useCallback(() => {
    clearElevenTimers();
    // Close old raw WebSocket session if any
    const s = elevenSessionRef.current;
    if (s) {
      try { s.close(); } catch {}
      elevenSessionRef.current = null;
    }
    // Close ElevenLabs SDK session if active
    if (agentModeRef.current === 'elevenlabs-sdk') {
      try { elevenConversation.endSession(); } catch {}
    }
    if (agentModeRef.current === 'elevenlabs' || agentModeRef.current === 'elevenlabs-sdk') agentModeRef.current = null;
  }, [clearElevenTimers, elevenConversation]);

  const handleStreamBuffer = useCallback((buffer) => {
    try {
      if (buffer && buffer.data) {
        // ElevenLabs SDK mode: SDK handles mic/audio internally, skip manual streaming
        if (agentModeRef.current === 'elevenlabs-sdk') return;

        // ElevenLabs speech-to-speech expects 16 kHz PCM input
        if (agentModeRef.current === 'elevenlabs') {
          const eleven = elevenSessionRef.current;
          if (eleven && eleven.isOpen()) {
            let elData = buffer.data;
            if (buffer.sampleRate && buffer.sampleRate !== ELEVENLABS_INPUT_RATE) {
              elData = resampleInt16(elData, buffer.sampleRate, ELEVENLABS_INPUT_RATE);
            }
            eleven.appendAudio(encodePcm16ToBase64(elData));
          }
        }

        const session = voiceSessionRef.current;
        if (session && session.isOpen()) {
          let data = buffer.data;
          if (buffer.sampleRate && buffer.sampleRate !== REALTIME_INPUT_RATE) {
            data = resampleInt16(data, buffer.sampleRate, REALTIME_INPUT_RATE);
          }
          session.appendAudio(encodePcm16ToBase64(data));
        }

        // Accumulate audio chunks for local mode
        if (localModeRef.current && audioChunksRef.current) {
          const existing = audioChunksRef.current;
          const newData = new Uint8Array(existing.length + buffer.data.byteLength / 2);
          newData.set(new Int16Array(existing.buffer), 0);
          const newChunk = new Int16Array(buffer.data.buffer, buffer.data.byteOffset, buffer.data.byteLength / 2);
          newData.set(newChunk, existing.length);
          audioChunksRef.current = newData;
        }

        const bytes = new Uint8Array(buffer.data);
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        const step = Math.max(1, Math.floor(bytes.byteLength / 2 / 128));
        let sum = 0;
        let n = 0;
        for (let i = 0; i + 1 < bytes.byteLength; i += step * 2) {
          const v = view.getInt16(i, true) / 32768;
          sum += v * v;
          n++;
        }
        const rms = n ? Math.sqrt(sum / n) : 0;
        amplitude.value = Math.min(1, rms * 4);
        lastSampleAt.current = Date.now();
      }
    } catch {}
  }, [amplitude]);

  const audioStream = useAudioStream({
    channels: 1,
    encoding: 'int16',
    sampleRate: REALTIME_INPUT_RATE,
    onBuffer: handleStreamBuffer,
  });
  const { stream: audioStreamObj } = audioStream;

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);
  useEffect(() => {
    continuousRef.current = continuous;
  }, [continuous]);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);
  useEffect(() => {
    slowRef.current = slowMode;
  }, [slowMode]);
  useEffect(() => {
    langRef.current = language;
  }, [language]);

  const charRef = useRef('blessica');
  useEffect(() => {
    charRef.current = selectedCharacter;
  }, [selectedCharacter]);

  // Restore persisted preferences
  useEffect(() => {
    (async () => {
      try {
        const [h, c, s, m, l, ch] = await Promise.all([
          AsyncStorage.getItem(PREFS.haptics),
          AsyncStorage.getItem(PREFS.continuous),
          AsyncStorage.getItem(PREFS.slow),
          AsyncStorage.getItem(PREFS.muted),
          AsyncStorage.getItem(PREFS.lang),
          AsyncStorage.getItem(PREFS.character),
        ]);
        if (h !== null) setHapticsEnabledState(h === '1');
        if (c !== null) setContinuous(c === '1');
        if (s !== null) setSlowMode(s === '1');
        if (m !== null) setMuted(m === '1');
        if (l !== null) setLanguage(l);
        if (ch !== null) setSelectedCharacter(ch);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    setTTSMuted(muted);
    AsyncStorage.setItem(PREFS.muted, muted ? '1' : '0').catch(() => {});
  }, [muted]);

  useEffect(() => {
    setHapticsEnabled(hapticsEnabled);
    AsyncStorage.setItem(PREFS.haptics, hapticsEnabled ? '1' : '0').catch(() => {});
  }, [hapticsEnabled]);

  useEffect(() => {
    AsyncStorage.setItem(PREFS.continuous, continuous ? '1' : '0').catch(() => {});
  }, [continuous]);
  useEffect(() => {
    AsyncStorage.setItem(PREFS.slow, slowMode ? '1' : '0').catch(() => {});
  }, [slowMode]);
  useEffect(() => {
    AsyncStorage.setItem(PREFS.lang, language).catch(() => {});
  }, [language]);

  useEffect(() => {
    AsyncStorage.setItem(PREFS.character, selectedCharacter).catch(() => {});
  }, [selectedCharacter]);

  // Real-time audio level: mic metering while listening, TTS samples while speaking
  const handleSample = useCallback((sample) => {
    try {
      const ch = sample && sample.channels && sample.channels[0];
      if (ch && ch.frames && ch.frames.length) {
        const frames = ch.frames;
        const step = Math.max(1, Math.floor(frames.length / 256));
        let sum = 0;
        let n = 0;
        for (let i = 0; i < frames.length; i += step) {
          const v = frames[i] || 0;
          sum += v * v;
          n++;
        }
        const rms = Math.sqrt(sum / Math.max(1, n));
        amplitude.value = Math.min(1, rms * 4);
        lastSampleAt.current = Date.now();
      }
    } catch {}
  }, [amplitude]);

  useAudioSampleListener(getAudioPlayer(), handleSample);

  useEffect(() => {
    let timer = null;
    if (orbState === 'listening') {
      timer = setInterval(() => {
        if (Date.now() - lastSampleAt.current > 300) {
          amplitude.value = 0.12 + 0.22 * Math.abs(Math.sin(Date.now() / 240));
        }
      }, 90);
    } else if (orbState === 'speaking') {
      let t = 0;
      timer = setInterval(() => {
        t += 0.32;
        if (Date.now() - lastSampleAt.current > 700) {
          amplitude.value = 0.28 + 0.32 * (Math.sin(t) * 0.5 + 0.5);
        }
      }, 50);
    } else if (orbState === 'thinking') {
      amplitude.value = withTiming(0.08, { duration: getAnimationDuration(300) });
    } else {
      amplitude.value = withTiming(0, { duration: getAnimationDuration(500) });
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [orbState, amplitude]);

  // Stop the mic stream if the app goes to the background
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next !== 'active' && isRecordingRef.current) {
        abortRecordingRef.current && abortRecordingRef.current();
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    return () => {
      if (durationTimer.current) clearInterval(durationTimer.current);
      if (restartTimer.current) clearTimeout(restartTimer.current);
      if (xpTimer.current) clearTimeout(xpTimer.current);
      stopTTS();
      try { audioStreamObj && audioStreamObj.stop(); } catch {}
      closeElevenSession();
      const session = voiceSessionRef.current;
      if (session) {
        try { session.close(); } catch {}
        voiceSessionRef.current = null;
      }
    };
  }, [audioStreamObj, closeElevenSession]);

  const addMessage = useCallback((role, text, pronunciation) => {
    setConversation((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, role, text, pronunciation },
    ]);
    setTimeout(() => listRef.current && listRef.current.scrollToEnd({ animated: true }), 150);
  }, []);

  const finishRealtimeTurn = useCallback(({ transcript, audio, sampleRate }) => {
    if (!audio && !transcript) {
      setOrbState('idle');
      return;
    }
    setHasSpoken(true);
    if (transcript) addMessage('assistant', transcript, null);
    else addMessage('assistant', 'SULTI!', null);

    const session = voiceSessionRef.current;
    if (session) {
      try { session.close(); } catch {}
      voiceSessionRef.current = null;
    }
    closeElevenSession();

    const finish = () => {
      setOrbState('idle');
      hapticAIFinished();
      if (continuousRef.current && !isRecordingRef.current) {
        restartTimer.current = setTimeout(() => startRecordingRef.current && startRecordingRef.current(), 650);
      }
    };

    setOrbState('speaking');
    hapticAIBeginsSpeaking();
    if (mutedRef.current || !audio) {
      setTimeout(finish, Math.min(1500, 400 + (transcript || '').length * 40));
    } else {
      playRealtimePcm(audio, sampleRate || REALTIME_INPUT_RATE, { onDone: finish, onError: finish });
    }

    addXp(XP_VALUES.VOICE_PRACTICE_TURN, 'voice_practice');
    setXpToastVisible(true);
    hapticXpGain();
    if (xpTimer.current) clearTimeout(xpTimer.current);
    xpTimer.current = setTimeout(() => setXpToastVisible(false), 2400);
  }, [addMessage, addXp, closeElevenSession]);

  const handleRealtimeEvent = useCallback((event) => {
    if (!event || !event.type) return;
    switch (event.type) {
      case 'conversation.item.input_audio_transcription.completed': {
        const content = event.item && event.item.content;
        const transcript = content && content[0] && content[0].transcript;
        if (transcript && transcript.trim()) {
          addMessage('user', transcript, null);
        }
        break;
      }
      case 'response.output_audio_transcript.delta':
        transcriptRef.current += event.delta || '';
        break;
      case 'response.output_audio.delta':
        audioRef.current += event.delta || '';
        break;
      case 'response.done':
        finishRealtimeTurn({ transcript: transcriptRef.current, audio: audioRef.current });
        transcriptRef.current = '';
        audioRef.current = '';
        break;
      case 'error':
        console.warn('Realtime session error:', event.error);
        if (!isRecordingRef.current) {
          setOrbState('idle');
          hapticError();
        }
        break;
      default:
        break;
    }
  }, [addMessage, finishRealtimeTurn]);

  // ElevenLabs speech-to-speech events. The agent does its own turn detection:
  // we accumulate transcript + audio, then finalize after a short audio silence.
  const handleElevenlabsEvent = useCallback((event) => {
    switch (event.type) {
      case 'user_transcript': {
        const t = event.user_transcription_event && event.user_transcription_event.user_transcript;
        if (t && t.trim()) addMessage('user', t, null);
        break;
      }
      case 'agent_response': {
        const t = event.agent_response_event && event.agent_response_event.agent_response;
        if (t) transcriptRef.current = t;
        break;
      }
      case 'agent_response_correction': {
        const t =
          event.agent_response_correction_event &&
          event.agent_response_correction_event.corrected_agent_response;
        if (t) transcriptRef.current = t;
        break;
      }
      case 'interruption':
        // User spoke over Sulti — drop the partial reply audio, keep going.
        audioRef.current = '';
        break;
      case 'audio': {
        const b64 = event.audio_event && event.audio_event.audio_base_64;
        if (!b64) break;
        if (elevenIdleTimer.current) {
          clearTimeout(elevenIdleTimer.current);
          elevenIdleTimer.current = null;
        }
        const firstChunk = !audioRef.current;
        audioRef.current += b64;
        if (firstChunk) {
          setOrbState('speaking');
          hapticAIBeginsSpeaking();
        }
        if (elevenFinalizeTimer.current) clearTimeout(elevenFinalizeTimer.current);
        elevenFinalizeTimer.current = setTimeout(() => {
          const rate =
            elevenSessionRef.current && elevenSessionRef.current.outputSampleRate
              ? elevenSessionRef.current.outputSampleRate
              : 24000;
          finishRealtimeTurn({ transcript: transcriptRef.current, audio: audioRef.current, sampleRate: rate });
          transcriptRef.current = '';
          audioRef.current = '';
        }, 900);
        break;
      }
      case 'error':
        console.warn('ElevenLabs session error:', event.error || event.message || event);
        if (!isRecordingRef.current) {
          closeElevenSession();
          setOrbState('idle');
          hapticError();
        }
        break;
      default:
        break;
    }
  }, [addMessage, finishRealtimeTurn, closeElevenSession]);

  const abortRecording = useCallback(() => {
    isRecordingRef.current = false;
    setRecording(false);
    if (durationTimer.current) {
      clearInterval(durationTimer.current);
      durationTimer.current = null;
    }
    try { audioStreamObj && audioStreamObj.stop(); } catch {}
    closeElevenSession();
    const session = voiceSessionRef.current;
    if (session) {
      try { session.close(); } catch {}
      voiceSessionRef.current = null;
    }
    agentModeRef.current = null;
    setOrbState('idle');
  }, [audioStreamObj, closeElevenSession]);

  const startRecording = useCallback(async () => {
    if (isConnectingRef.current || isRecordingRef.current) return;
    isConnectingRef.current = true;
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission needed', 'Microphone access is required for voice mode.');
        return;
      }
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });

      setOrbState('thinking');

      // Prefer ElevenLabs Conversational AI SDK, then raw WebSocket fallback, then xAI realtime, then local mode
      let useLocalMode = false;
      let connected = false;

      // Try the ElevenLabs React Native SDK first (WebRTC, lower latency)
      try {
        const overrides = buildElevenlabsOverrides(langRef.current);
        await elevenConversation.startSession({
          agentId: ELEVENLABS_AGENT_ID,
          overrides,
        });
        agentModeRef.current = 'elevenlabs-sdk';
        connected = true;
      } catch (sdkErr) {
        console.warn('ElevenLabs SDK startSession failed, trying WebSocket fallback:', sdkErr);
        connected = false;
      }

      // Fallback: try raw WebSocket ElevenLabs session
      if (!connected) {
        try {
          const elCfg = await fetchElevenlabsConfig(langRef.current);
          if (elCfg && elCfg.signed_url) {
            const eleven = new ElevenLabsVoiceSession({
              url: elCfg.signed_url,
              language: langRef.current,
              overridesAllowed: !!elCfg.overrides_allowed,
              onEvent: (e) => handleElevenEventRef.current && handleElevenEventRef.current(e),
              onError: () => {},
              onClose: () => {},
            });
            await eleven.open();
            elevenSessionRef.current = eleven;
            agentModeRef.current = 'elevenlabs';
            connected = true;
          }
        } catch (e) {
          connected = false;
        }
      }

      if (!connected) {
        try {
          const config = await fetchVoiceAgentConfig();
          if (!config.url || !config.token) {
            useLocalMode = true;
          } else {
            const session = new VoiceRealtimeSession({
              url: config.url,
              token: config.token,
              onEvent: (e) => handleRealtimeEventRef.current && handleRealtimeEventRef.current(e),
              onError: () => {},
              onClose: () => {},
            });
            await session.open();
            session.configure(config.session);
            voiceSessionRef.current = session;
            agentModeRef.current = 'xai';
            connected = true;
          }
        } catch (e) {
          useLocalMode = true;
        }
      }

      localModeRef.current = useLocalMode;
      if (useLocalMode) {
        agentModeRef.current = 'local';
        audioChunksRef.current = new Uint8Array(0);
      }

      // SDK mode handles mic/audio internally — only start expo-audio for non-SDK modes
      if (agentModeRef.current !== 'elevenlabs-sdk') {
        await audioStreamObj.start();
      }
      transcriptRef.current = '';
      audioRef.current = '';
      isRecordingRef.current = true;
      setRecording(true);
      setRecordingDuration(0);
      if (agentModeRef.current !== 'elevenlabs-sdk') {
        setOrbState('listening');
      }
      hapticMicStart();
      durationTimer.current = setInterval(() => {
        setRecordingDuration((d) => d + 1);
      }, 1000);
    } catch (e) {
      setRecording(false);
      setOrbState('idle');
      hapticError();
      Alert.alert('Error', 'Could not start the voice session. Check that the server is reachable.');
    } finally {
      isConnectingRef.current = false;
    }
  }, [audioStreamObj, elevenConversation]);

  const speakReply = useCallback((text, rate = 0.85) => {
    stopTTS();
    isSpeakingRef.current = true;
    lastReplyRef.current = text;
    setOrbState('speaking');
    hapticAIBeginsSpeaking();
    speakTTS(text, {
      voice: charRef.current,
      language: { bisaya: 'ceb', tagalog: 'tl', english: 'en-US' }[langRef.current] || 'en-US',
      rate,
      onDone: () => {
        isSpeakingRef.current = false;
        setOrbState('idle');
        hapticAIFinished();
        if (continuousRef.current && !isRecordingRef.current) {
          restartTimer.current = setTimeout(() => startRecordingRef.current && startRecordingRef.current(), 650);
        }
      },
      onError: () => {
        isSpeakingRef.current = false;
        setOrbState('idle');
        hapticAIFinished();
      },
    });
  }, []);

  const handleAiResponse = useCallback((data) => {
    if (data.session_id) setSessionId(data.session_id);

    if (data.transcription) {
      addMessage('user', data.transcription, data.pronunciation || null);
    }

    if (data.reply) {
      setHasSpoken(true);
      addMessage('assistant', data.reply, null);
      speakReply(data.reply, slowRef.current ? 0.55 : 0.85);
      addXp(XP_VALUES.VOICE_PRACTICE_TURN, 'voice_practice');
      setXpToastVisible(true);
      hapticXpGain();
      if (xpTimer.current) clearTimeout(xpTimer.current);
      xpTimer.current = setTimeout(() => setXpToastVisible(false), 2400);
    } else {
      setOrbState('idle');
    }
  }, [addXp, speakReply]);

  const stopRecording = useCallback(async () => {
    if (!isRecordingRef.current) return;
    isRecordingRef.current = false;
    setRecording(false);
    if (durationTimer.current) {
      clearInterval(durationTimer.current);
      durationTimer.current = null;
    }
    setOrbState('thinking');
    hapticMicEnd();
    // SDK mode: only stop expo-audio if we actually started it (non-SDK modes)
    if (agentModeRef.current !== 'elevenlabs-sdk') {
      try { audioStreamObj.stop(); } catch {}
    }

    if (agentModeRef.current === 'elevenlabs-sdk') {
      // ElevenLabs SDK: the agent detects end-of-speech itself and streams the reply.
      // We signal the SDK we're done talking; it will call onModeChange('idle') when done.
      // Set a safety timeout in case the agent doesn't respond.
      if (elevenIdleTimer.current) clearTimeout(elevenIdleTimer.current);
      elevenIdleTimer.current = setTimeout(() => {
        const hadReply = !!(transcriptRef.current);
        if (!hadReply) {
          setOrbState('idle');
          hapticError();
        }
      }, 6000);
    } else if (agentModeRef.current === 'elevenlabs') {
      // Keep the socket open — the agent detects end-of-speech itself and
      // streams the reply back. Bail out gracefully if nothing arrives.
      if (elevenIdleTimer.current) clearTimeout(elevenIdleTimer.current);
      elevenIdleTimer.current = setTimeout(() => {
        const hadReply = !!(audioRef.current || transcriptRef.current);
        closeElevenSession();
        transcriptRef.current = '';
        audioRef.current = '';
        if (!hadReply) {
          setOrbState('idle');
          hapticError();
        }
      }, 4000);
    } else if (localModeRef.current) {
      // Local mode: send accumulated audio to server for transcription + LLM + TTS
      const chunks = audioChunksRef.current;
      audioChunksRef.current = null;
      if (!chunks || chunks.length === 0) {
        setOrbState('idle');
        return;
      }
      try {
        // Encode as WAV for the server's STT service
        const wavBase64 = encodeWavBase64(chunks, REALTIME_INPUT_RATE);
        const data = await api.tutorChat(null, wavBase64, sessionIdRef.current);
        localModeRef.current = false;

        if (data.session_id) setSessionId(data.session_id);

        if (data.transcription) {
          addMessage('user', data.transcription, data.pronunciation || null);
        }

        if (data.reply) {
          setHasSpoken(true);
          addMessage('assistant', data.reply, null);
          speakReply(data.reply, slowRef.current ? 0.55 : 0.85);
          addXp(XP_VALUES.VOICE_PRACTICE_TURN, 'voice_practice');
          setXpToastVisible(true);
          hapticXpGain();
          if (xpTimer.current) clearTimeout(xpTimer.current);
          xpTimer.current = setTimeout(() => setXpToastVisible(false), 2400);
        } else {
          setOrbState('idle');
        }
      } catch (e) {
        console.error('Local audio processing error:', e);
        localModeRef.current = false;
        setOrbState('idle');
        hapticError();
        Alert.alert('Error', 'Could not process the voice message. The local models may not be loaded yet.');
      }
    } else {
      const session = voiceSessionRef.current;
      if (session) {
        session.commitAndRespond();
      } else {
        setOrbState('idle');
      }
    }
  }, [audioStreamObj, addMessage, addXp, speakReply, closeElevenSession, elevenConversation]);

  useEffect(() => {
    handleRealtimeEventRef.current = handleRealtimeEvent;
    handleElevenEventRef.current = handleElevenlabsEvent;
  });

  useEffect(() => {
    startRecordingRef.current = startRecording;
  }, [startRecording]);

  useEffect(() => {
    stopRecordingRef.current = stopRecording;
  }, [stopRecording]);

  useEffect(() => {
    abortRecordingRef.current = abortRecording;
  }, [abortRecording]);

  const sendText = useCallback(async (message) => {
    if (isSpeakingRef.current) stopTTS();
    if (isRecordingRef.current) {
      await stopRecording();
      return;
    }
    addMessage('user', message, null);
    setOrbState('thinking');
    try {
      const data = await api.tutorChat(message, null, sessionIdRef.current);
      handleAiResponse(data);
    } catch (e) {
      setOrbState('idle');
      hapticError();
      Alert.alert('Error', 'Could not reach the tutor right now.');
    }
  }, [stopRecording, handleAiResponse, addMessage]);

  const toggleRecording = useCallback(() => {
    if (isSpeakingRef.current) {
      stopTTS();
      isSpeakingRef.current = false;
      setOrbState('idle');
      hapticTap();
      return;
    }
    if (isRecordingRef.current || isConnectingRef.current) stopRecording();
    else startRecording();
  }, [startRecording, stopRecording]);

  const replayLast = useCallback(() => {
    if (!lastReplyRef.current) return;
    hapticTap();
    speakReply(lastReplyRef.current, slowRef.current ? 0.55 : 0.85);
  }, [speakReply]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      if (!m) stopTTS();
      hapticTap();
      return !m;
    });
  }, []);

  const toggleSlow = useCallback(() => {
    setSlowMode((s) => !s);
    hapticTap();
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage((l) => (l === 'bisaya' ? 'tagalog' : l === 'tagalog' ? 'english' : 'bisaya'));
    hapticTap();
  }, []);

  const endSession = useCallback(() => {
    stopTTS();
    isSpeakingRef.current = false;
    isRecordingRef.current = false;
    try { audioStreamObj && audioStreamObj.stop(); } catch {}
    closeElevenSession();
    const session = voiceSessionRef.current;
    if (session) {
      try { session.close(); } catch {}
      voiceSessionRef.current = null;
    }
    // Save conversation history to server (memory feature)
    setConversation((prev) => {
      if (prev.length > 0) {
        const messages = prev.map((m) => ({ type: m.role === 'user' ? 'user' : 'assistant', text: m.text }));
        const lang = langRef.current || 'bisaya';
        const title = `Voice ${lang.charAt(0).toUpperCase() + lang.slice(1)} — ${new Date().toLocaleDateString()}`;
        api.saveConversation(messages, title).catch((err) => {
          console.warn('[VoiceMode] Failed to save conversation:', err.message);
        });
      }
      return prev;
    });
    navigation.goBack();
  }, [audioStreamObj, navigation, closeElevenSession]);

  const onSuggestion = useCallback((label) => {
    hapticTap();
    sendText(label);
  }, [sendText]);

  const speakCard = useCallback((rate) => {
    speakReply(lastReplyRef.current, rate);
  }, [speakReply]);

  const inConversation = conversation.length > 0 || hasSpoken;

  const renderItem = useCallback(({ item, index }) => {
    if (item.role === 'user') {
      return <UserMessage text={item.text} pronunciation={item.pronunciation} />;
    }
    const isLast = index === conversation.length - 1;
    return <SultiMessage text={item.text} speaking={orbState === 'speaking' && isLast} onSpeak={speakCard} />;
  }, [orbState, speakCard, conversation.length]);

  const isThinking = orbState === 'thinking';

  return (
    <View style={styles.root}>
      <VoiceBackground>
        {/* Top bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={endSession} style={styles.iconBtn} accessibilityLabel="Close voice mode">
            <View style={styles.iconInner}>
              <Ionicons name="chevron-down" size={22} color={voice.text} />
            </View>
          </TouchableOpacity>
          <View style={styles.topTitleWrap} accessibilityRole="header">
            <Text style={styles.topTitle}>SULTI</Text>
            <Text style={styles.topSubtitle}>Voice Tutor</Text>
          </View>
          <TouchableOpacity
            onPress={toggleLanguage}
            style={[styles.iconBtn, styles.langBtn]}
            accessibilityRole="button"
            accessibilityLabel={`Language: ${(LANG_META[language] || LANG_META.bisaya).label}. Tap to switch.`}
          >
            <View style={styles.langInner}>
              <Text style={styles.langFlag}>{(LANG_META[language] || LANG_META.bisaya).flag}</Text>
              <Text style={styles.langText}>{(LANG_META[language] || LANG_META.bisaya).label}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <XpToast visible={xpToastVisible} amount={15} streak={streak} offset={insets.top + 58} />

        {/* Main content */}
        {inConversation ? (
          <View style={styles.convLayout}>
            <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(400)} style={styles.convOrbZone}>
              <StatusPill state={orbState} />
              <View style={styles.convOrb}>
                <VoiceOrb state={orbState} size={ORB_TALK} amplitude={amplitude} onPress={toggleRecording} />
              </View>
            </Animated.View>
            <FlatList
              ref={listRef}
              data={conversation}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.convList}
              ListFooterComponent={orbState === 'thinking' ? <TypingIndicator /> : null}
              onContentSizeChange={() => listRef.current && listRef.current.scrollToEnd({ animated: true })}
              showsVerticalScrollIndicator={false}
              accessibilityLabel="Conversation with SULTI"
            />
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.introLayout}
            showsVerticalScrollIndicator={false}
          >
            <StatusPill state={orbState} />
            <View style={styles.introOrb}>
              <VoiceOrb state={orbState} size={ORB_INTRO} amplitude={amplitude} onPress={toggleRecording} />
            </View>
            <Greeting visible />
            <View style={styles.chipsWrap}>
              <SuggestedChips onPick={onSuggestion} disabled={isThinking} />
            </View>
          </ScrollView>
        )}

        {/* Recording indicator */}
        {recording && (
          <View style={styles.recordingChip}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>{formatTime(recordingDuration)} · tap orb to finish</Text>
          </View>
        )}

        {/* Bottom controls */}
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 14 }]}>
          <VoiceControls
            onMic={toggleRecording}
            onReplay={replayLast}
            onToggleMute={toggleMute}
            onToggleSlow={toggleSlow}
            onOpenSettings={() => {
              hapticTap();
              setSettingsVisible(true);
            }}
            onEnd={endSession}
            recording={recording}
            muted={muted}
            slowMode={slowMode}
            canReplay={!!lastReplyRef.current}
            disabled={isThinking}
          />
        </View>

        <SettingsSheet
          visible={settingsVisible}
          onClose={() => setSettingsVisible(false)}
          haptics={hapticsEnabled}
          continuous={continuous}
          slowMode={slowMode}
          onHaptics={setHapticsEnabledState}
          onContinuous={setContinuous}
          onSlow={setSlowMode}
          selectedCharacter={selectedCharacter}
          onCharacterChange={setSelectedCharacter}
        />
      </VoiceBackground>
    </View>
  );
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 8,
  },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  iconInner: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    backgroundColor: voice.glass, borderWidth: 1, borderColor: voice.glassBorder,
  },
  langBtn: { width: 'auto', paddingHorizontal: 4 },
  langInner: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999,
    backgroundColor: voice.glass, borderWidth: 1, borderColor: voice.glassBorder,
  },
  langFlag: { fontSize: 13 },
  langText: { color: voice.text, fontSize: 12, fontWeight: '700' },
  topTitleWrap: { alignItems: 'center' },
  topTitle: { color: voice.text, fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
  topSubtitle: { color: voice.textMuted, fontSize: 10, fontWeight: '600', letterSpacing: 1 },
  introLayout: {
    flexGrow: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 8, paddingVertical: 16,
  },
  introOrb: { alignItems: 'center', marginTop: 18, marginBottom: 8 },
  chipsWrap: { marginTop: 16, width: '100%', alignItems: 'center' },
  convLayout: { flex: 1 },
  convOrbZone: { alignItems: 'center', paddingTop: 12 },
  convOrb: { alignItems: 'center', marginTop: 6 },
  convList: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
  recordingChip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingBottom: 4,
  },
  recordingDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: voice.danger,
  },
  recordingText: { color: voice.textSecondary, fontSize: 12, fontWeight: '600' },
  bottomBar: { alignItems: 'center', paddingTop: 12 },
});
