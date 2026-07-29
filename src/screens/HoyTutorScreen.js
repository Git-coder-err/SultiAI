import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Speech from 'expo-speech';
import { useAudioRecorder, useAudioRecorderState, RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync } from 'expo-audio';
import { File } from 'expo-file-system';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  withSequence, withDelay, withRepeat, Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import GlassCard from '../components/GlassCard';
import Badge from '../components/Badge';
import AIAvatar from '../components/AIAvatar';
import AuroraBackground from '../components/AuroraBackground';
import { spacing, borderRadius } from '../theme';
import useAdaptiveTutor from '../hooks/useAdaptiveTutor';

const SITUATIONS = [
  { label: 'Greetings', icon: 'hand-left', desc: 'Meeting someone new', color: '#14B8A6' },
  { label: 'Market', icon: 'cart', desc: 'Buying at the market', color: '#10B981' },
  { label: 'Restaurant', icon: 'restaurant', desc: 'Ordering food', color: '#F59E0B' },
  { label: 'Directions', icon: 'compass', desc: 'Asking for directions', color: '#8B5CF6' },
  { label: 'Jeepney', icon: 'bus', desc: 'Riding jeepney', color: '#EF4444' },
  { label: 'Emergency', icon: 'warning', desc: 'Emergency situations', color: '#FF6B6B' },
  { label: 'Friends', icon: 'people', desc: 'Casual conversation', color: '#EC4899' },
  { label: 'Travel', icon: 'airplane', desc: 'Travel & tourism', color: '#2563EB' },
];

const ROLEPLAY_SITUATIONS = [
  { label: 'Restaurant', emoji: '\u{1F37D}\uFE0F', prompt: 'Ordering food at a restaurant in Cebu' },
  { label: 'Market', emoji: '\u{1F6D2}', prompt: 'Bargaining at the local market' },
  { label: 'Jeepney', emoji: '\u{1F68C}', prompt: 'Riding the jeepney' },
  { label: 'Hospital', emoji: '\u{1F3E5}', prompt: 'At the hospital' },
  { label: 'Interview', emoji: '\u{1F4BC}', prompt: 'Job interview in Bisaya' },
  { label: 'Friends', emoji: '\u{1F44B}', prompt: 'Meeting new friends' },
  { label: 'Travel', emoji: '\u2708\uFE0F', prompt: 'Traveling around Cebu' },
  { label: 'Emergency', emoji: '\u{1F6A8}', prompt: 'Emergency situation' },
];

function AnimatedMessage({ children, index }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    const delay = Math.min(index * 60, 300);
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
    translateY.value = withDelay(delay, withSpring(0, { stiffness: 200, damping: 20 }));
    scale.value = withDelay(delay, withSpring(1, { stiffness: 200, damping: 20 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

function TypingDots() {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const anim = (dot, delay) => {
      dot.value = withRepeat(
        withSequence(
          withDelay(delay, withTiming(-6, { duration: 300, easing: Easing.inOut(Easing.sin) })),
          withTiming(0, { duration: 300, easing: Easing.inOut(Easing.sin) }),
        ),
        -1, false
      );
    };
    anim(dot1, 0);
    anim(dot2, 200);
    anim(dot3, 400);
  }, []);

  const style1 = useAnimatedStyle(() => ({ transform: [{ translateY: dot1.value }] }));
  const style2 = useAnimatedStyle(() => ({ transform: [{ translateY: dot2.value }] }));
  const style3 = useAnimatedStyle(() => ({ transform: [{ translateY: dot3.value }] }));

  return (
    <View style={{ flexDirection: 'row', gap: 5, paddingVertical: 8, paddingLeft: 4 }}>
      <Animated.View style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#14B8A6', opacity: 0.6 }, style1]} />
      <Animated.View style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#14B8A6', opacity: 0.6 }, style2]} />
      <Animated.View style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#14B8A6', opacity: 0.6 }, style3]} />
    </View>
  );
}

export default function HoyTutorScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { addXp, hearts } = useGame();
  const insets = useSafeAreaInsets();
  const adaptiveTutor = useAdaptiveTutor();

  const [messages, setMessages] = useState([{
    id: '0', role: 'assistant',
    text: `Kumusta! I'm **Hoy!**, your Bisaya language companion.\n\nTap a topic below to start learning, or type/speak anything!`,
    quickActions: true,
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [level, setLevel] = useState(null);
  const [showRoleplay, setShowRoleplay] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [continuousMode, setContinuousMode] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const flatListRef = useRef(null);
  const isRecordingRef = useRef(false);
  const durationInterval = useRef(null);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const micGlow = useSharedValue(0);

  useEffect(() => {
    if (recorderState?.isRecording || isSpeaking) {
      micGlow.value = withRepeat(withTiming(1, { duration: 800, easing: Easing.inOut(Easing.sin) }), -1, true);
    } else {
      micGlow.value = withTiming(0, { duration: 300 });
    }
  }, [recorderState?.isRecording, isSpeaking]);

  const micGlowStyle = useAnimatedStyle(() => ({
    shadowColor: recorderState?.isRecording ? '#EF4444' : colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4 + micGlow.value * 0.4,
    shadowRadius: 8 + micGlow.value * 12,
    elevation: 4 + micGlow.value * 6,
  }));

  useEffect(() => {
    loadLevel();
    adaptiveTutor.loadState();
    return () => {
      if (durationInterval.current) clearInterval(durationInterval.current);
      Speech.stop();
    };
  }, []);

  const loadLevel = async () => {
    try {
      const d = await api.getTutorLevel();
      setLevel(d);
    } catch {}
  };

  const startRecording = async () => {
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) return Alert.alert('Permission Denied', 'Microphone access is needed.');
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      isRecordingRef.current = true;
      setRecordingDuration(0);
      durationInterval.current = setInterval(() => { setRecordingDuration(prev => prev + 1); }, 1000);
    } catch { Alert.alert('Error', 'Could not start recording'); }
  };

  const stopRecording = async () => {
    if (!isRecordingRef.current && !recorderState.isRecording) return;
    isRecordingRef.current = false;
    if (durationInterval.current) { clearInterval(durationInterval.current); durationInterval.current = null; }
    setRecordingDuration(0);
    setLoading(true);

    try {
      if (recorderState.isRecording) await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (!uri) { addMessage('assistant', 'No audio captured. Please try again.'); setLoading(false); return; }
      const audioFile = new File(uri);
      const audioBase64 = await audioFile.base64();
      if (!audioBase64 || audioBase64.length < 100) { addMessage('assistant', 'Recording too short.'); setLoading(false); return; }

      addMessage('user_voice', '', { audio: true, transcription: '' });

      const data = await api.tutorChat('', audioBase64, sessionId);
      if (data.session_id) setSessionId(data.session_id);

      addMessage('assistant', data.reply, { pronunciation: data.pronunciation, transcription: data.transcription, analysis: data.analysis });

      if (data.analysis?.user_level) setLevel(p => ({ ...p, level: data.analysis.user_level }));
      const topic = data.analysis?.topics?.[0] || 'general';
      const pronScore = data.pronunciation?.score || 80;
      adaptiveTutor.recordInteraction(topic, pronScore >= 60, pronScore);
      addXp(15, 'voice_practice');
      if (data.reply) speakReply(data.reply);

      if (messages.length > 0) {
        setMessages(prev => prev.map((m, i) =>
          i === prev.length - 1 && m.role === 'user_voice'
            ? { ...m, transcription: data.transcription || 'Voice message' }
            : m
        ));
      }
    } catch (e) { addMessage('assistant', `Could not process audio: ${e.message}`); }
    finally { setLoading(false); }
  };

  const toggleRecording = () => {
    if (isSpeaking) { Speech.stop(); setIsSpeaking(false); if (continuousMode) setTimeout(() => startRecording(), 300); return; }
    if (isRecordingRef.current || recorderState.isRecording) stopRecording();
    else startRecording();
  };

  const speakReply = (text) => {
    if (!text) return;
    setIsSpeaking(true);
    Speech.speak(text.replace(/\*\*(.*?)\*\*/g, '$1'), {
      language: 'ceb', rate: 0.85,
      onDone: () => { setIsSpeaking(false); if (continuousMode) setTimeout(() => startRecording(), 600); },
      onError: () => setIsSpeaking(false),
    });
  };

  const addMessage = (role, text, extra = {}) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role, text, ...extra }]);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    if (hearts <= 0) { Alert.alert('No Hearts', "You're out of hearts! Refill to continue."); return; }
    addMessage('user', text);
    setInput('');
    setLoading(true);

    try {
      const data = await api.tutorChat(text, null, sessionId);
      if (data.session_id) setSessionId(data.session_id);
      addMessage('assistant', data.reply, { pronunciation: data.pronunciation, analysis: data.analysis });
      if (data.analysis?.user_level) setLevel(p => ({ ...p, level: data.analysis.user_level }));
      const chatTopic = data.analysis?.topics?.[0] || 'general';
      adaptiveTutor.recordInteraction(chatTopic, true, 85);
      addXp(10, 'chat');
      if (data.reply) speakReply(data.reply);
    } catch (err) { addMessage('assistant', `Sorry: ${err.message}`); }
    finally { setLoading(false); }
  };

  const pickSituation = async (situation) => {
    setLoading(true);
    addMessage('user', `Teach me about: ${situation}`);
    try {
      const data = await api.generateLesson(situation);
      addMessage('lesson', data.reply || data.lesson, { ...data });
      addXp(20, 'lesson');
    } catch (err) { addMessage('assistant', `Sorry: ${err.message}`); }
    finally { setLoading(false); }
  };

  const startRoleplay = async (prompt) => {
    setShowRoleplay(false);
    setLoading(true);
    addMessage('user', `Let's roleplay: ${prompt}`);
    try {
      const data = await api.tutorChat(`Let's roleplay a scenario: ${prompt}. Start the conversation naturally.`, null, sessionId);
      if (data.session_id) setSessionId(data.session_id);
      addMessage('assistant', data.reply);
      addXp(15, 'roleplay');
    } catch (err) { addMessage('assistant', `Sorry: ${err.message}`); }
    finally { setLoading(false); }
  };

  const openVoiceMode = () => {
    navigation.navigate('VoiceMode', { sessionId });
  };

  const renderMessage = useCallback(({ item, index }) => {
    if (item.role === 'lesson') return <AnimatedMessage index={index}>{renderLessonCard(item)}</AnimatedMessage>;
    if (item.role === 'assistant' && item.quickActions) return <AnimatedMessage index={index}>{renderWelcomeCard(item)}</AnimatedMessage>;

    const isUser = item.role === 'user' || item.role === 'user_voice';
    return (
      <AnimatedMessage index={index}>
        <View style={{ marginBottom: spacing.sm, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
          {!isUser && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, marginLeft: 4, gap: 4 }}>
              <LinearGradient colors={[colors.primary, colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bubbleAvatar}>
                <Ionicons name="sparkles" size={10} color="#fff" />
              </LinearGradient>
              <Text style={[styles.bubbleSender, { color: colors.primary }]}>Hoy!</Text>
            </View>
          )}
          <LinearGradient
            colors={isUser ? [colors.primary, colors.primaryDark] : [colors.glassBg, colors.glassBg]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[
              styles.bubble,
              isUser ? styles.userBubble : styles.assistantBubble,
              { borderColor: isUser ? 'transparent' : colors.glassBorder },
            ]}
          >
            {item.role === 'user_voice' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: item.transcription ? 4 : 0, gap: 4 }}>
                <Ionicons name="mic" size={14} color="#fff" />
                {item.transcription && <Text style={[styles.voiceLabel, { color: 'rgba(255,255,255,0.7)' }]}>Voice</Text>}
              </View>
            )}
            <Text style={[styles.bubbleText, { color: isUser ? '#fff' : colors.text }]}>
              {item.role === 'user_voice' ? (item.transcription || 'Voice message') : item.text}
            </Text>
          </LinearGradient>
          {item.role === 'assistant' && item.pronunciation && renderPronunciationCard(item.pronunciation, item.transcription)}
          {!isUser && !item.pronunciation && !item.quickActions && (
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, marginLeft: 4 }}
              onPress={() => item.text && speakReply(item.text)}
            >
              <Ionicons name="volume-medium-outline" size={14} color={colors.textLight} />
              <Text style={[styles.listenLabel, { color: colors.textLight }]}>Listen</Text>
            </TouchableOpacity>
          )}
        </View>
      </AnimatedMessage>
    );
  }, [colors, level, adaptiveTutor.difficulty, loading, showRoleplay]);

  const renderWelcomeCard = (msg) => (
    <GlassCard variant="elevated" style={styles.welcomeCard}>
      <View style={styles.welcomeHeader}>
        <AIAvatar size={56} mood={adaptiveTutor.difficulty === 'advanced' ? 'happy' : 'neutral'} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.welcomeName, { color: colors.text }]}>Hoy!</Text>
          <Text style={[styles.welcomeTitle, { color: colors.textSecondary }]}>Your Bisaya Companion</Text>
          <View style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>
            {level && (
              <Badge
                title={level.level === 'advanced' ? 'Abante' : level.level === 'intermediate' ? 'Tunga' : 'Sugod'}
                variant={level.level === 'advanced' ? 'error' : level.level === 'intermediate' ? 'warning' : 'success'}
                size="sm"
              />
            )}
            {adaptiveTutor.difficulty && (
              <Badge title={`A-${adaptiveTutor.difficulty[0].toUpperCase()}`} variant="info" size="sm" />
            )}
          </View>
        </View>
      </View>
      <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>{msg.text}</Text>
      <Text style={[styles.promptLabel, { color: colors.textLight }]}>Choose a topic to practice</Text>
      <View style={styles.situationGrid}>
        {SITUATIONS.map((s) => (
          <TouchableOpacity
            key={s.label}
            style={[styles.situationChip, { backgroundColor: s.color + '15', borderColor: s.color + '30' }]}
            onPress={() => pickSituation(s.situation || s.label)}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Ionicons name={s.icon} size={16} color={s.color} />
            <Text style={[styles.chipLabel, { color: s.color }]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.roleplayToggle} onPress={() => setShowRoleplay(!showRoleplay)} activeOpacity={0.7}>
        <Ionicons name="game-controller" size={16} color={colors.primary} />
        <Text style={[styles.roleplayText, { color: colors.primary }]}>Role-Play Scenarios</Text>
        <Ionicons name={showRoleplay ? 'chevron-up' : 'chevron-down'} size={16} color={colors.primary} />
      </TouchableOpacity>
      {showRoleplay && (
        <View style={styles.roleplayGrid}>
          {ROLEPLAY_SITUATIONS.map((r) => (
            <TouchableOpacity
              key={r.label}
              style={[styles.roleplayChip, { backgroundColor: colors.primary + '15' }]}
              onPress={() => startRoleplay(r.prompt)}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.roleplayEmoji}>{r.emoji}</Text>
              <Text style={[styles.roleplayLabel, { color: colors.primary }]}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </GlassCard>
  );

  const renderPronunciationCard = (pron, transcription) => {
    if (!pron) return null;
    const scoreColor = pron.score >= 80 ? '#10B981' : pron.score >= 50 ? '#F59E0B' : '#EF4444';
    return (
      <GlassCard style={styles.pronCard} padding="md">
        <View style={styles.pronHeader}>
          <LinearGradient colors={[colors.primary, colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.pronIcon}>
            <Ionicons name="mic-outline" size={12} color="#fff" />
          </LinearGradient>
          <Text style={[styles.pronLabel, { color: colors.primary }]}>Pronunciation Score</Text>
        </View>
        <View style={styles.pronScoreRow}>
          <Text style={[styles.pronScoreValue, { color: scoreColor }]}>{pron.score}</Text>
          <Text style={[styles.pronScoreUnit, { color: colors.textSecondary }]}>/100</Text>
          <View style={[styles.pronScoreBar, { backgroundColor: colors.border }]}>
            <View style={[styles.pronScoreFill, { width: `${pron.score}%`, backgroundColor: scoreColor }]} />
          </View>
        </View>
        {transcription && (
          <View style={styles.pronTranscription}>
            <Text style={[styles.pronLabelSmall, { color: colors.textSecondary }]}>You said:</Text>
            <Text style={[styles.pronValue, { color: colors.text }]}>{transcription}</Text>
          </View>
        )}
        {pron.feedback && (
          <View style={[styles.pronFeedbackBox, { backgroundColor: scoreColor + '10', borderColor: scoreColor + '20' }]}>
            <Ionicons name={pron.score >= 80 ? 'checkmark-circle' : 'information-circle'} size={14} color={scoreColor} />
            <Text style={[styles.pronFeedback, { color: colors.text }]}>{pron.feedback}</Text>
          </View>
        )}
        {pron.phoneme_breakdown?.length > 0 && (
          <View style={[styles.phonemeContainer, { borderTopColor: colors.border }]}>
            {pron.phoneme_breakdown.map((p, i) => (
              <View key={i} style={[styles.phonemeRow, p.correct && { backgroundColor: '#10B981' + '08', borderRadius: 6 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons
                    name={p.correct ? 'checkmark-circle' : 'close-circle'}
                    size={14}
                    color={p.correct ? '#10B981' : '#EF4444'}
                  />
                  <Text style={[styles.phonemeText, { color: colors.text }, !p.correct && { color: '#EF4444' }]}>
                    {p.expected}
                  </Text>
                </View>
                {!p.correct && (
                  <Text style={[styles.phonemeTip, { color: colors.textSecondary }]}>{p.tip}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </GlassCard>
    );
  };

  const renderLessonCard = (msg) => {
    const phrases = msg.phrases || [];
    const dialogue = msg.dialogue || [];
    return (
      <GlassCard variant="elevated" style={styles.lessonCard}>
        <LinearGradient colors={[colors.primary, colors.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.lessonHeader}>
          <View style={styles.lessonHeaderIcon}>
            <Ionicons name="school-outline" size={16} color="#fff" />
          </View>
          <Text style={styles.lessonTitle}>{msg.situation || 'Practice Lesson'}</Text>
        </LinearGradient>
        {msg.text && <Text style={[styles.lessonIntro, { color: colors.text }]}>{msg.text}</Text>}
        {phrases.length > 0 && (
          <View style={styles.lessonSection}>
            <View style={styles.sectionBadge}>
              <Badge title="Key Phrases" variant="info" size="sm" />
            </View>
            {phrases.map((p, i) => (
              <View key={i} style={[styles.phraseRow, { backgroundColor: colors.glassBg }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.phraseBisaya, { color: colors.text }]}>{p.bisaya}</Text>
                  <Text style={[styles.phraseEnglish, { color: colors.textSecondary }]}>{p.english}</Text>
                  {p.pronunciation && (
                    <Text style={[styles.phrasePron, { color: colors.textLight }]}>{p.pronunciation}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.phraseListenBtn, { backgroundColor: colors.primary + '15' }]}
                  onPress={() => p.bisaya && speakReply(p.bisaya)}
                >
                  <Ionicons name="volume-high" size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        {dialogue.length > 0 && (
          <View style={styles.lessonSection}>
            <View style={styles.sectionBadge}>
              <Badge title="Practice Dialogue" variant="warning" size="sm" />
            </View>
            {dialogue.map((d, i) => (
              <View key={i} style={[styles.dialogueRow, { borderLeftColor: i % 2 === 0 ? colors.primary : colors.accent }]}>
                <Text style={[styles.dialogueSpeaker, { color: i % 2 === 0 ? colors.primary : colors.accent }]}>
                  {d.speaker}:
                </Text>
                <Text style={[styles.dialogueText, { color: colors.text }]}>{d.bisaya}</Text>
                <Text style={[styles.dialogueEnglish, { color: colors.textSecondary }]}>{d.english}</Text>
              </View>
            ))}
          </View>
        )}
        {msg.cultural_note && (
          <View style={[styles.cultureNote, { backgroundColor: colors.accentLight, borderColor: colors.accent + '20' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.xs }}>
              <Ionicons name="leaf-outline" size={14} color={colors.accent} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.accent }}>Culture Tip</Text>
            </View>
            <Text style={[styles.cultureText, { color: colors.text }]}>{msg.cultural_note}</Text>
          </View>
        )}
      </GlassCard>
    );
  };

  const renderTypingIndicator = () => (
    <View style={{ marginBottom: spacing.sm, alignItems: 'flex-start' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, marginLeft: 4, gap: 4 }}>
        <LinearGradient colors={[colors.primary, colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bubbleAvatar}>
          <Ionicons name="sparkles" size={10} color="#fff" />
        </LinearGradient>
        <Text style={[styles.bubbleSender, { color: colors.primary }]}>Hoy!</Text>
      </View>
      <GlassCard padding="md" style={[styles.typingBubble, { borderColor: colors.glassBorder }]}>
        <TypingDots />
      </GlassCard>
    </View>
  );

  return (
    <AuroraBackground style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <AIAvatar size={36} mood={isSpeaking ? 'speaking' : loading ? 'thinking' : 'neutral'} />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.headerTitle}>Hoy!</Text>
              <Text style={styles.headerSubtitle}>
                {isSpeaking ? 'Speaking...' : loading ? 'Thinking...' : level?.level || 'Learning'}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerBtn} onPress={openVoiceMode} activeOpacity={0.7}>
              <Ionicons name="mic-circle" size={28} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerPill}>
              <Ionicons name="heart" size={14} color="#FF6B6B" />
              <Text style={styles.headerPillText}>{hearts}</Text>
            </View>
            {level?.level && (
              <View style={styles.headerPill}>
                <Text style={styles.headerPillText}>
                  {level.level === 'advanced' ? 'A' : level.level === 'intermediate' ? 'T' : 'S'}
                </Text>
              </View>
            )}
          </View>
        </View>
        {level && (
          <Text style={styles.headerStat}>
            {level.total_sessions || 0} sessions · {level.total_xp || 0} XP
          </Text>
        )}
      </LinearGradient>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={styles.messageList}
        renderItem={renderMessage}
        ListFooterComponent={loading ? renderTypingIndicator() : null}
        showsVerticalScrollIndicator={false}
      />

      <BlurView intensity={90} tint={isDark ? 'dark' : 'light'} style={[styles.inputContainer, { borderTopColor: colors.glassBorder }]}>
        {(recorderState.isRecording || isSpeaking) && (
          <View style={[styles.statusBar, { backgroundColor: recorderState.isRecording ? '#EF4444' : colors.primary }]}>
            <Ionicons name={recorderState.isRecording ? 'mic' : 'volume-high'} size={14} color="#fff" />
            <Text style={styles.statusText}>
              {recorderState.isRecording
                ? `Listening ${String(Math.floor(recordingDuration / 60)).padStart(2, '0')}:${String(recordingDuration % 60).padStart(2, '0')}`
                : isSpeaking ? 'Hoy! is speaking...' : ''}
            </Text>
            {recorderState.isRecording && (
              <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <View key={i} style={{ width: 3, height: 10 + Math.random() * 10, borderRadius: 1.5, backgroundColor: '#fff', opacity: 0.8 }} />
                ))}
              </View>
            )}
            {isSpeaking && (
              <TouchableOpacity onPress={() => { Speech.stop(); setIsSpeaking(false); }}>
                <Text style={styles.statusActionText}>Skip</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={[styles.continuousToggle, { borderColor: colors.border }, continuousMode && { backgroundColor: colors.primary, borderColor: colors.primary }]}
            onPress={() => setContinuousMode(!continuousMode)}
          >
            <Ionicons name="infinite" size={16} color={continuousMode ? '#fff' : colors.textLight} />
          </TouchableOpacity>
          <View style={[styles.inputWrap, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Type in Bisaya or English..."
              placeholderTextColor={colors.textLight}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={sendMessage}
              editable={!loading}
              multiline
            />
          </View>
          <Animated.View style={micGlowStyle}>
          <TouchableOpacity
            style={[styles.micBtn, { backgroundColor: colors.primary }, recorderState.isRecording && { backgroundColor: '#EF4444' }, isSpeaking && { backgroundColor: '#10B981' }]}
            onPress={toggleRecording}
            disabled={loading}
          >
            <Ionicons
              name={isSpeaking ? 'volume-high' : recorderState.isRecording ? 'stop' : 'mic'}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
          </Animated.View>
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: colors.primary }, (!input.trim() || loading) && { opacity: 0.5 }]}
            onPress={sendMessage}
            disabled={loading || !input.trim()}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </BlurView>
      </KeyboardAvoidingView>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingBottom: spacing.md, paddingHorizontal: spacing.xl },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: 0.36 },
  headerSubtitle: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 4, gap: 4 },
  headerPillText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  headerStat: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2, marginLeft: 44 },
  messageList: { padding: spacing.lg, paddingBottom: spacing.md },
  bubble: { maxWidth: '82%', borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: 2, borderWidth: 1 },
  userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 4, borderWidth: 0 },
  assistantBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  bubbleAvatar: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  bubbleSender: { fontSize: 12, fontWeight: '700' },
  bubbleText: { fontSize: 15, lineHeight: 22, letterSpacing: -0.24 },
  voiceLabel: { fontSize: 11, fontWeight: '600' },
  listenLabel: { fontSize: 11, fontWeight: '500' },
  welcomeCard: { marginBottom: spacing.md },
  welcomeHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  welcomeName: { fontSize: 20, fontWeight: '800', letterSpacing: 0.35 },
  welcomeTitle: { fontSize: 13, marginTop: 1 },
  welcomeText: { fontSize: 14, lineHeight: 20, marginBottom: spacing.md },
  promptLabel: { fontSize: 11, fontWeight: '700', marginBottom: spacing.sm, letterSpacing: 0.5, textTransform: 'uppercase' },
  situationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  situationChip: { flexDirection: 'row', alignItems: 'center', borderRadius: 9999, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.xs, borderWidth: 1 },
  chipLabel: { fontSize: 12, fontWeight: '700' },
  roleplayToggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.sm },
  roleplayText: { fontSize: 13, fontWeight: '700' },
  roleplayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  roleplayChip: { flexDirection: 'row', alignItems: 'center', borderRadius: 9999, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.xs },
  roleplayEmoji: { fontSize: 16 },
  roleplayLabel: { fontSize: 12, fontWeight: '700' },
  pronCard: { marginTop: -4, marginBottom: spacing.md, marginLeft: spacing.xs },
  pronHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  pronIcon: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  pronLabel: { fontSize: 13, fontWeight: '700' },
  pronScoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: spacing.sm },
  pronScoreValue: { fontSize: 36, fontWeight: '800' },
  pronScoreUnit: { fontSize: 14, fontWeight: '600' },
  pronScoreBar: { flex: 1, height: 4, borderRadius: 2, marginLeft: 8, overflow: 'hidden' },
  pronScoreFill: { height: '100%', borderRadius: 2 },
  pronTranscription: { marginBottom: spacing.sm },
  pronLabelSmall: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  pronValue: { fontSize: 15 },
  pronFeedbackBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, borderRadius: 8, padding: 8, borderWidth: 1, marginBottom: spacing.sm },
  pronFeedback: { fontSize: 13, lineHeight: 18, flex: 1 },
  phonemeContainer: { borderTopWidth: 1, paddingTop: spacing.sm },
  phonemeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 4 },
  phonemeText: { fontSize: 14, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  phonemeTip: { fontSize: 12, flex: 1, textAlign: 'right', marginLeft: spacing.sm },
  lessonCard: { marginBottom: spacing.md },
  lessonHeader: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.md, gap: spacing.sm },
  lessonHeaderIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  lessonTitle: { fontSize: 15, fontWeight: '700', color: '#fff', flex: 1 },
  lessonIntro: { fontSize: 14, lineHeight: 20, marginBottom: spacing.md },
  lessonSection: { marginBottom: spacing.md },
  sectionBadge: { marginBottom: spacing.sm },
  phraseRow: { borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.xs, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', flexDirection: 'row', alignItems: 'center' },
  phraseBisaya: { fontSize: 16, fontWeight: '700' },
  phraseEnglish: { fontSize: 13, marginTop: 2 },
  phrasePron: { fontSize: 12, fontStyle: 'italic', marginTop: 2 },
  phraseListenBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginLeft: spacing.sm },
  dialogueRow: { marginBottom: spacing.xs, borderLeftWidth: 2, paddingLeft: spacing.md, paddingVertical: 4 },
  dialogueSpeaker: { fontSize: 13, fontWeight: '700', marginBottom: 1 },
  dialogueText: { fontSize: 14 },
  dialogueEnglish: { fontSize: 12, marginTop: 1 },
  cultureNote: { borderRadius: borderRadius.md, padding: spacing.md, marginTop: spacing.md, borderWidth: 1 },
  cultureText: { fontSize: 13, lineHeight: 18 },
  typingBubble: { borderWidth: 1 },
  inputContainer: { borderTopWidth: 1 },
  statusBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: 8, gap: spacing.sm },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '600', flex: 1 },
  statusActionText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },
  inputRow: { flexDirection: 'row', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, alignItems: 'flex-end', gap: spacing.sm },
  inputWrap: { flex: 1, borderRadius: 9999, borderWidth: 1, paddingHorizontal: spacing.md, minHeight: 44, justifyContent: 'center' },
  input: { fontSize: 15, maxHeight: 100, paddingVertical: 10 },
  micBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  continuousToggle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
});
