import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, Platform, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming,
  withRepeat, withSequence, Easing,
} from 'react-native-reanimated';
import { useAudioRecorder, useAudioRecorderState, RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync } from 'expo-audio';
import { File } from 'expo-file-system';
import VoiceOrb from '../components/VoiceOrb';
import AuroraBackground from '../components/AuroraBackground';
import WordReveal from '../components/WordReveal';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { api } from '../services/api';
import { speakTTS, stopTTS } from '../utils/tts';

const ORB_SIZE = 280;

export default function VoiceModeScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { addXp } = useGame();
  const insets = useSafeAreaInsets();

  const [orbState, setOrbState] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [hasSpoken, setHasSpoken] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [continuousMode, setContinuousMode] = useState(false);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const durationInterval = useRef(null);
  const voiceLevelInterval = useRef(null);
  const isRecordingRef = useRef(false);
  const listRef = useRef(null);
  const isSpeakingRef = useRef(false);

  const contentOpacity = useSharedValue(0);
  const transcriptOpacity = useSharedValue(0);
  const replyOpacity = useSharedValue(0);

  useEffect(() => {
    contentOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.sin) });
    return () => {
      if (durationInterval.current) clearInterval(durationInterval.current);
      if (voiceLevelInterval.current) clearInterval(voiceLevelInterval.current);
      stopTTS();
    };
  }, []);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const transcriptAnimatedStyle = useAnimatedStyle(() => ({
    opacity: transcriptOpacity.value,
  }));

  const replyAnimatedStyle = useAnimatedStyle(() => ({
    opacity: replyOpacity.value,
  }));

  const startRecording = async () => {
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) { Alert.alert('Permission Denied', 'Microphone access is needed.'); return; }
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      isRecordingRef.current = true;
      setIsRecording(true);
      setOrbState('listening');
      setRecordingDuration(0);
      transcriptOpacity.value = 0;
      replyOpacity.value = 0;

      durationInterval.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      let level = 0;
      voiceLevelInterval.current = setInterval(() => {
        level = Math.min(1, level + (Math.random() * 0.4 - 0.15));
        if (level < 0) level = 0.05;
      }, 100);
    } catch {
      Alert.alert('Error', 'Could not start recording');
      setIsRecording(false);
      setOrbState('idle');
    }
  };

  const stopRecording = async () => {
    if (!isRecordingRef.current && !recorderState.isRecording) return;
    isRecordingRef.current = false;
    setIsRecording(false);
    if (durationInterval.current) { clearInterval(durationInterval.current); durationInterval.current = null; }
    if (voiceLevelInterval.current) { clearInterval(voiceLevelInterval.current); voiceLevelInterval.current = null; }

    setOrbState('thinking');

    try {
      if (recorderState.isRecording) await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (!uri) {
        setOrbState('idle');
        return;
      }
      const audioFile = new File(uri);
      const audioBase64 = await audioFile.base64();
      if (!audioBase64 || audioBase64.length < 100) {
        setOrbState('idle');
        return;
      }

      const data = await api.tutorChat('', audioBase64, sessionId);
      if (data.session_id) setSessionId(data.session_id);

      if (data.transcription) {
        setTranscript(data.transcription);
        transcriptOpacity.value = withTiming(1, { duration: 400 });
        addConversationItem('user', data.transcription);
      }

      if (data.reply) {
        setHasSpoken(true);
        setAiReply(data.reply);
        setOrbState('speaking');
        isSpeakingRef.current = true;

        setTimeout(() => addConversationItem('assistant', data.reply), 200);

        replyOpacity.value = withTiming(1, { duration: 600 });

        speakTTS(data.reply, {
          language: 'ceb', rate: 0.85,
          onDone: () => {
            isSpeakingRef.current = false;
            setOrbState('idle');
            if (continuousMode) {
              setTimeout(() => startRecording(), 500);
            }
          },
          onError: () => {
            isSpeakingRef.current = false;
            setOrbState('idle');
          },
        });
      }

      addXp(15, 'voice_practice');
    } catch {
      setOrbState('idle');
    }
  };

  const addConversationItem = (role, text) => {
    setConversation(prev => [...prev, { id: Date.now().toString(), role, text }]);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const toggleRecording = () => {
    if (isSpeakingRef.current) {
      stopTTS();
      isSpeakingRef.current = false;
      setOrbState('idle');
      return;
    }
    if (isRecordingRef.current || recorderState.isRecording) stopRecording();
    else startRecording();
  };

  const dismiss = () => {
    stopTTS();
    navigation.goBack();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const renderWaveform = () => {
    const barCount = 5;
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, height: 20 }}>
        {Array.from({ length: barCount }, (_, i) => (
          <AnimatedBar key={i} index={i} barCount={barCount} />
        ))}
      </View>
    );
  };

  function AnimatedBar({ index, barCount }) {
    const h = useSharedValue(4);

    useEffect(() => {
      h.value = withRepeat(
        withSequence(
          withTiming(4 + Math.random() * 16, { duration: 300 + index * 50 }),
          withTiming(4, { duration: 300 + index * 50 }),
        ),
        -1, true
      );
    }, []);

    const barStyle = useAnimatedStyle(() => ({
      width: 3,
      height: h.value,
      borderRadius: 1.5,
      backgroundColor: colors.primary,
    }));

    return <Animated.View style={barStyle} />;
  }

  return (
    <View style={styles.root}>
      <AuroraBackground>
        <Animated.View style={[styles.overlay, contentAnimatedStyle]}>
          <BlurView
            intensity={Platform.OS === 'web' ? 0 : 20}
            tint={isDark ? 'dark' : 'light'}
            style={[styles.topBar, { paddingTop: insets.top + 8 }]}
          >
            <TouchableOpacity onPress={dismiss} activeOpacity={0.7} style={styles.closeBtn} accessibilityLabel="Close voice mode">
              <View style={[styles.closeBtnInner, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
                <Ionicons name="chevron-down" size={22} color={colors.text} />
              </View>
            </TouchableOpacity>
            <Text style={[styles.topTitle, { color: colors.text }]}>Voice Mode</Text>
            <TouchableOpacity
              onPress={() => setContinuousMode(!continuousMode)}
              activeOpacity={0.7}
              style={[styles.continuousToggle, continuousMode && { backgroundColor: colors.primary + '30' }]}
            >
              <Ionicons name="infinite" size={18} color={continuousMode ? colors.primary : colors.textLight} />
            </TouchableOpacity>
          </BlurView>

          {conversation.length === 0 ? (
            <View style={styles.mainContent}>
              <View style={styles.orbContainer}>
                <VoiceOrb state={orbState} size={ORB_SIZE} onPress={toggleRecording} />
              </View>

              <View style={styles.statusSection}>
                <Animated.View style={transcriptAnimatedStyle}>
                  {transcript !== '' && (
                    <View style={[styles.transcriptCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
                      <Ionicons name="mic-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                      <Text style={[styles.transcriptText, { color: colors.text }]} numberOfLines={3}>{transcript}</Text>
                    </View>
                  )}
                </Animated.View>

                <Animated.View style={replyAnimatedStyle}>
                  {aiReply !== '' && (
                    <View style={[styles.replyCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
                      <View style={styles.replyHeader}>
                        <LinearGradient colors={[colors.primary, colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.replyAvatar}>
                          <Ionicons name="sparkles" size={12} color="#fff" />
                        </LinearGradient>
                        <Text style={[styles.replyLabel, { color: colors.primary }]}>Sulti</Text>
                      </View>
                      <WordReveal text={aiReply} style={[styles.replyText, { color: colors.text }]} speed={25} />
                    </View>
                  )}
                </Animated.View>

                <Text style={[styles.statusText, {
                  color: orbState === 'listening' ? '#EF4444' : orbState === 'speaking' ? colors.primary : orbState === 'thinking' ? colors.accent : colors.textLight,
                }]}>
                  {orbState === 'idle' && (hasSpoken ? 'Tap orb to continue' : 'Tap orb to speak')}
                  {orbState === 'listening' && 'Listening... tap orb to finish'}
                  {orbState === 'thinking' && 'Sulti is thinking...'}
                  {orbState === 'speaking' && 'Sulti is speaking...'}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.conversationContainer}>
              <FlatList
                ref={listRef}
                data={conversation}
                keyExtractor={item => item.id}
                contentContainerStyle={[styles.conversationList, { paddingTop: insets.top + 60, paddingBottom: 200 }]}
                renderItem={({ item }) => (
                  <View style={[styles.conversationItem, item.role === 'user' ? styles.userItem : styles.assistantItem]}>
                    {item.role === 'assistant' && (
                      <View style={styles.conversationAvatar}>
                        <LinearGradient colors={[colors.primary, colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
                          <Ionicons name="sparkles" size={10} color="#fff" />
                        </LinearGradient>
                      </View>
                    )}
                    <View style={[styles.conversationBubble, {
                      backgroundColor: item.role === 'user' ? colors.primary : colors.glassBg,
                      borderColor: item.role === 'user' ? 'transparent' : colors.glassBorder,
                    }]}>
                      <Text style={[styles.conversationText, { color: item.role === 'user' ? '#fff' : colors.text }]}>
                        {item.text}
                      </Text>
                    </View>
                  </View>
                )}
              />
            </View>
          )}

          <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 20 }]}>
            {isRecording && (
              <>
                <View style={styles.recordingInfo}>
                  <View style={styles.recordingDot} />
                  <Text style={[styles.recordingTime, { color: colors.textSecondary }]}>{formatTime(recordingDuration)}</Text>
                </View>
                <View style={styles.voiceLevelContainer}>
                  {renderWaveform()}
                </View>
                <View style={[styles.liveTranscriptCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
                  <Ionicons name="mic" size={14} color="#EF4444" style={{ marginRight: 6 }} />
                  <Text style={[styles.liveTranscriptText, { color: colors.text }]}>Listening...</Text>
                </View>
              </>
            )}

            {conversation.length > 0 && !isRecording && !isSpeakingRef.current && (
              <TouchableOpacity
                onPress={toggleRecording}
                activeOpacity={0.8}
                style={[styles.miniOrbBtn, { shadowColor: colors.primary }]}
              >
                <LinearGradient
                  colors={[colors.orbGradient1 || colors.primary, colors.orbGradient2 || colors.secondary]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.miniOrbGradient}
                >
                  <Ionicons name="mic" size={24} color="#fff" />
                </LinearGradient>
                <Text style={[styles.miniOrbLabel, { color: colors.textLight }]}>Tap to speak</Text>
              </TouchableOpacity>
            )}

            {conversation.length > 0 && !isRecording && !isSpeakingRef.current && (
              <TouchableOpacity
                onPress={dismiss}
                style={[styles.endSessionBtn, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle-outline" size={18} color={colors.error} />
                <Text style={[styles.endSessionText, { color: colors.error }]}>End Voice Session</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </AuroraBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: { flex: 1 },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 8, zIndex: 10 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  closeBtnInner: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  topTitle: { fontSize: 16, fontWeight: '700' },
  continuousToggle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  mainContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  orbContainer: { alignItems: 'center', justifyContent: 'center' },
  statusSection: { position: 'absolute', bottom: 140, left: 20, right: 20, alignItems: 'center', gap: 12 },
  transcriptCard: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 16, padding: 14, borderWidth: 1, maxWidth: '85%' },
  transcriptText: { fontSize: 15, lineHeight: 20, flex: 1, fontStyle: 'italic' },
  replyCard: { borderRadius: 16, padding: 14, borderWidth: 1, maxWidth: '85%' },
  replyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 },
  replyAvatar: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  replyLabel: { fontSize: 13, fontWeight: '700' },
  replyText: { fontSize: 15, lineHeight: 22 },
  statusText: { fontSize: 14, fontWeight: '500', letterSpacing: 0.3, marginTop: 4 },
  conversationContainer: { flex: 1 },
  conversationList: { paddingHorizontal: 16 },
  conversationItem: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  userItem: { justifyContent: 'flex-end' },
  assistantItem: { justifyContent: 'flex-start', gap: 6 },
  conversationAvatar: { marginBottom: 2 },
  conversationBubble: { maxWidth: '78%', borderRadius: 18, padding: 14, borderWidth: 1 },
  conversationText: { fontSize: 15, lineHeight: 21 },
  bottomSection: { position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center', gap: 12 },
  recordingInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  recordingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  recordingTime: { fontSize: 14, fontWeight: '600', fontVariant: ['tabular-nums'] },
  voiceLevelContainer: { height: 24, justifyContent: 'center', alignItems: 'center' },
  endSessionBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, borderWidth: 1 },
  miniOrbBtn: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  miniOrbGradient: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  miniOrbLabel: { fontSize: 12, fontWeight: '500', letterSpacing: 0.5, marginTop: 4 },
  liveTranscriptCard: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1, marginHorizontal: 20 },
  liveTranscriptText: { fontSize: 14, fontStyle: 'italic', flex: 1 },
  endSessionText: { fontSize: 14, fontWeight: '600' },
});
