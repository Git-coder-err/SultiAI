import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert,
  Platform, Animated as RNAm, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
} from 'react-native-reanimated';
import * as Speech from 'expo-speech';
import { useAudioRecorder, useAudioRecorderState, RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync } from 'expo-audio';
import { File } from 'expo-file-system';
import VoiceOrb from '../components/VoiceOrb';
import AuroraBackground from '../components/AuroraBackground';
import WordReveal from '../components/WordReveal';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { api } from '../services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ORB_SIZE = 240;

export default function VoiceModeScreen({ navigation, route }) {
  const { colors, isDark } = useTheme();
  const { addXp } = useGame();
  const insets = useSafeAreaInsets();

  const [orbState, setOrbState] = useState('idle');
  const [statusText, setStatusText] = useState('Tap to speak');
  const [transcript, setTranscript] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId, setSessionId] = useState(route?.params?.sessionId || null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [hasSpoken, setHasSpoken] = useState(false);
  const [conversation, setConversation] = useState([]);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const durationInterval = useRef(null);
  const voiceLevelInterval = useRef(null);
  const isRecordingRef = useRef(false);
  const transcriptOpacity = useRef(new RNAm.Value(0)).current;
  const aiReplyOpacity = useRef(new RNAm.Value(0)).current;
  const contentOpacity = useRef(new RNAm.Value(0)).current;
  const listRef = useRef(null);

  const orbScale = useSharedValue(0.8);

  useEffect(() => {
    orbScale.value = withSpring(1, { stiffness: 120, damping: 15 });
    RNAm.timing(contentOpacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    return () => {
      if (durationInterval.current) clearInterval(durationInterval.current);
      if (voiceLevelInterval.current) clearInterval(voiceLevelInterval.current);
      Speech.stop();
    };
  }, []);

  const orbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: orbScale.value }],
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
      setStatusText('Listening...');
      setTranscript('');
      setAiReply('');
      setHasSpoken(false);
      setRecordingDuration(0);

      durationInterval.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      let level = 0;
      voiceLevelInterval.current = setInterval(() => {
        level = Math.min(1, level + (Math.random() * 0.3 - 0.1));
        if (level < 0) level = 0;
        setVoiceLevel(level);
      }, 100);
    } catch {
      Alert.alert('Error', 'Could not start recording');
      setIsRecording(false);
      setOrbState('idle');
      setStatusText('Tap to speak');
    }
  };

  const stopRecording = async () => {
    if (!isRecordingRef.current && !recorderState.isRecording) return;
    isRecordingRef.current = false;
    setIsRecording(false);
    if (durationInterval.current) { clearInterval(durationInterval.current); durationInterval.current = null; }
    if (voiceLevelInterval.current) { clearInterval(voiceLevelInterval.current); voiceLevelInterval.current = null; }

    setOrbState('thinking');
    setStatusText('Thinking...');

    try {
      if (recorderState.isRecording) await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (!uri) {
        setOrbState('idle');
        setStatusText('No audio captured. Try again.');
        return;
      }
      const audioFile = new File(uri);
      const audioBase64 = await audioFile.base64();
      if (!audioBase64 || audioBase64.length < 100) {
        setOrbState('idle');
        setStatusText('Recording too short. Try again.');
        return;
      }

      const data = await api.tutorChat('', audioBase64, sessionId);
      if (data.session_id) setSessionId(data.session_id);

      if (data.transcription) {
        setTranscript(data.transcription);
        RNAm.timing(transcriptOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
        addConversationItem('user', data.transcription, true);
      }

      if (data.reply) {
        setHasSpoken(true);
        setAiReply(data.reply);
        setOrbState('speaking');
        setStatusText('Hoy! is speaking...');

        setTimeout(() => {
          addConversationItem('assistant', data.reply, true);
        }, 200);

        Speech.speak(data.reply, {
          language: 'ceb', rate: 0.85,
          onDone: () => {
            setOrbState('idle');
            setStatusText('Tap to speak');
          },
          onError: () => {
            setOrbState('idle');
            setStatusText('Tap to speak');
          },
        });

        RNAm.timing(aiReplyOpacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();
      }

      addXp(15, 'voice_practice');
    } catch {
      setOrbState('idle');
      setStatusText('Connection error. Try again.');
    }
  };

  const addConversationItem = (role, text, scroll) => {
    setConversation(prev => [...prev, { id: Date.now().toString(), role, text }]);
    if (scroll) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const toggleRecording = () => {
    if (isRecordingRef.current || recorderState.isRecording) stopRecording();
    else startRecording();
  };

  const dismiss = () => {
    Speech.stop();
    navigation.goBack();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <View style={styles.root}>
      <AuroraBackground>
        <View style={styles.overlay}>
          <TouchableOpacity style={[styles.closeBtn, { top: insets.top + 8 }]} onPress={dismiss} activeOpacity={0.7}>
            <View style={[styles.closeBtnInner, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
              <Ionicons name="chevron-down" size={24} color={colors.text} />
            </View>
          </TouchableOpacity>

          {conversation.length === 0 ? (
            <View style={styles.mainContent}>
              <Animated.View style={[styles.orbContainer, orbAnimatedStyle]}>
                <VoiceOrb state={orbState} size={ORB_SIZE} colors={colors} />
              </Animated.View>

              <View style={styles.statusSection}>
                <RNAm.View style={{ opacity: transcriptOpacity }}>
                  {transcript !== '' && (
                    <View style={[styles.transcriptCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
                      <Ionicons name="mic-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                      <Text style={[styles.transcriptText, { color: colors.text }]} numberOfLines={3}>{transcript}</Text>
                    </View>
                  )}
                </RNAm.View>

                <RNAm.View style={{ opacity: aiReplyOpacity }}>
                  {aiReply !== '' && (
                    <View style={[styles.replyCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
                      <View style={styles.replyHeader}>
                        <LinearGradient colors={[colors.primary, colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.replyAvatar}>
                          <Ionicons name="sparkles" size={12} color="#fff" />
                        </LinearGradient>
                        <Text style={[styles.replyLabel, { color: colors.primary }]}>Hoy!</Text>
                      </View>
                      <WordReveal text={aiReply} style={[styles.replyText, { color: colors.text }]} speed={25} />
                    </View>
                  )}
                </RNAm.View>

                <Text style={[styles.statusText, { color: colors.textLight }]}>{statusText}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.conversationContainer}>
              <FlatList
                ref={listRef}
                data={conversation}
                keyExtractor={item => item.id}
                contentContainerStyle={[styles.conversationList, { paddingTop: insets.top + 60 }]}
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
                        {item.role === 'assistant' && item.text.length > 50
                          ? <WordReveal text={item.text} style={{ color: colors.text }} speed={15} />
                          : item.text
                        }
                      </Text>
                    </View>
                  </View>
                )}
              />
            </View>
          )}

          <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 20 }]}>
            {isRecording && (
              <View style={styles.recordingInfo}>
                <View style={styles.recordingDot} />
                <Text style={[styles.recordingTime, { color: colors.textSecondary }]}>{formatTime(recordingDuration)}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.micButton, { shadowColor: isRecording ? '#EF4444' : colors.primary }]}
              onPress={toggleRecording}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isRecording ? ['#EF4444', '#DC2626'] : [colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.micGradient}
              >
                <Ionicons name={isRecording ? 'stop' : 'mic'} size={32} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>

            {!isRecording && !hasSpoken && conversation.length === 0 && (
              <Text style={[styles.tapHint, { color: colors.textLight }]}>Tap to speak</Text>
            )}
            {!isRecording && conversation.length > 0 && (
              <Text style={[styles.tapHint, { color: colors.textLight }]}>Tap to continue the conversation</Text>
            )}

            {isRecording && (
              <View style={styles.voiceLevelBar}>
                <View style={[styles.voiceLevelFill, { width: `${voiceLevel * 100}%`, backgroundColor: colors.primary }]} />
              </View>
            )}
          </View>
        </View>
      </AuroraBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: { flex: 1 },
  closeBtn: { position: 'absolute', left: 16, zIndex: 10 },
  closeBtnInner: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  mainContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  orbContainer: { alignItems: 'center', justifyContent: 'center', marginTop: -80 },
  statusSection: { position: 'absolute', bottom: SCREEN_HEIGHT * 0.28, left: 20, right: 20, alignItems: 'center', gap: 12 },
  transcriptCard: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 16, padding: 14, borderWidth: 1, maxWidth: SCREEN_WIDTH * 0.85 },
  transcriptText: { fontSize: 15, lineHeight: 20, flex: 1, fontStyle: 'italic' },
  replyCard: { borderRadius: 16, padding: 14, borderWidth: 1, maxWidth: SCREEN_WIDTH * 0.85 },
  replyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 },
  replyAvatar: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  replyLabel: { fontSize: 13, fontWeight: '700' },
  replyText: { fontSize: 15, lineHeight: 22 },
  statusText: { fontSize: 14, fontWeight: '500', letterSpacing: 0.3, marginTop: 4 },
  conversationContainer: { flex: 1 },
  conversationList: { paddingHorizontal: 16, paddingBottom: 140 },
  conversationItem: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  userItem: { justifyContent: 'flex-end' },
  assistantItem: { justifyContent: 'flex-start', gap: 6 },
  conversationAvatar: { marginBottom: 2 },
  conversationBubble: { maxWidth: '78%', borderRadius: 18, padding: 14, borderWidth: 1 },
  conversationText: { fontSize: 15, lineHeight: 21 },
  bottomSection: { position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center', gap: 16 },
  recordingInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  recordingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  recordingTime: { fontSize: 14, fontWeight: '600', fontVariant: ['tabular-nums'] },
  micButton: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  micGradient: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center' },
  tapHint: { fontSize: 12, fontWeight: '500', letterSpacing: 0.5, marginTop: -8 },
  voiceLevelBar: { width: 120, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  voiceLevelFill: { height: '100%', borderRadius: 1.5 },
});
