import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator,
  ScrollView, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-audio';
import { File } from 'expo-file-system';
import * as Speech from 'expo-speech';
import Animated, {
  useSharedValue, useAnimatedProps, useAnimatedStyle, withSpring, withTiming,
  withSequence, withDelay, withRepeat, FadeIn, FadeInRight, FadeInUp,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { DIALECTS } from '../data/pronunciationPhrases';
import { hapticTap } from '../utils/haptics';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const STATS_KEY = 'sultiai_pronunciation_stats';

const PHRASES = [
  { bisaya: 'maayong buntag', english: 'Good morning', pronunciation: 'mah-AH-yong boon-TAG', category: 'Greetings' },
  { bisaya: 'maayong udto', english: 'Good noon', pronunciation: 'mah-AH-yong OOD-toh', category: 'Greetings' },
  { bisaya: 'maayong hapon', english: 'Good afternoon', pronunciation: 'mah-AH-yong HAH-pon', category: 'Greetings' },
  { bisaya: 'maayong gabii', english: 'Good evening', pronunciation: 'mah-AH-yong gah-BEE-ee', category: 'Greetings' },
  { bisaya: 'kumusta', english: 'How are you', pronunciation: 'koo-MOOS-tah', category: 'Greetings' },
  { bisaya: 'salamat', english: 'Thank you', pronunciation: 'sah-LAH-mat', category: 'Politeness' },
  { bisaya: 'palihug', english: 'Please', pronunciation: 'pah-LEE-hoog', category: 'Politeness' },
  { bisaya: 'pasensya', english: 'Sorry', pronunciation: 'pah-SEN-sha', category: 'Politeness' },
  { bisaya: 'oo', english: 'Yes', pronunciation: 'oh-OH', category: 'Essentials' },
  { bisaya: 'dili', english: 'No', pronunciation: 'DEE-lee', category: 'Essentials' },
  { bisaya: 'ako', english: 'I / me', pronunciation: 'ah-KOH', category: 'Essentials' },
  { bisaya: 'ikaw', english: 'You', pronunciation: 'ee-KAW', category: 'Essentials' },
  { bisaya: 'unsa', english: 'What', pronunciation: 'oon-SAH', category: 'Essentials' },
  { bisaya: 'asa', english: 'Where', pronunciation: 'ah-SAH', category: 'Essentials' },
  { bisaya: 'kanus-a', english: 'When', pronunciation: 'kah-NOOS-ah', category: 'Essentials' },
  { bisaya: 'ngano', english: 'Why', pronunciation: 'ngah-NOH', category: 'Essentials' },
  { bisaya: 'usa', english: 'One', pronunciation: 'OO-sah', category: 'Numbers' },
  { bisaya: 'duha', english: 'Two', pronunciation: 'DOO-hah', category: 'Numbers' },
  { bisaya: 'tulo', english: 'Three', pronunciation: 'TOO-loh', category: 'Numbers' },
  { bisaya: 'upat', english: 'Four', pronunciation: 'OO-pat', category: 'Numbers' },
  { bisaya: 'lima', english: 'Five', pronunciation: 'LEE-mah', category: 'Numbers' },
  { bisaya: 'gihigugma', english: 'Love', pronunciation: 'gee-hee-GOOG-mah', category: 'Feelings' },
  { bisaya: 'kalipay', english: 'Happiness', pronunciation: 'kah-LEE-pigh', category: 'Feelings' },
  { bisaya: 'palangga', english: 'Beloved', pronunciation: 'pah-LANG-gah', category: 'Feelings' },
  { bisaya: 'tubig', english: 'Water', pronunciation: 'TOO-big', category: 'Food & Home' },
  { bisaya: 'pagkaon', english: 'Food', pronunciation: 'pag-KAH-on', category: 'Food & Home' },
  { bisaya: 'balay', english: 'House', pronunciation: 'BAH-ligh', category: 'Food & Home' },
  { bisaya: 'eskwela', english: 'School', pronunciation: 'es-KWEH-lah', category: 'Places & Life' },
  { bisaya: 'kauban', english: 'Friend', pronunciation: 'kah-OO-ban', category: 'Places & Life' },
  { bisaya: 'salapi', english: 'Money', pronunciation: 'sah-LAH-pee', category: 'Places & Life' },
  { bisaya: 'gawas', english: 'Outside', pronunciation: 'GAH-was', category: 'Places & Life' },
  { bisaya: 'merkado', english: 'Market', pronunciation: 'mehr-KAH-doh', category: 'Places & Life' },
  { bisaya: 'sakto', english: 'Correct', pronunciation: 'SAK-toh', category: 'Places & Life' },
  { bisaya: 'maayo', english: 'Good', pronunciation: 'mah-AH-yoh', category: 'Places & Life' },
  { bisaya: 'nindot', english: 'Nice', pronunciation: 'NEEN-dot', category: 'Places & Life' },
];

const CATEGORIES = ['Greetings', 'Politeness', 'Essentials', 'Numbers', 'Feelings', 'Food & Home', 'Places & Life'];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function ScoreRing({ score, size = 100 }) {
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(300, withTiming(Math.max(0.08, score / 100), { duration: 1000 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDasharray: `${circumference * progress.value} ${circumference}`,
  }));

  const color = score >= 85 ? '#34D399' : score >= 60 ? '#FBBF24' : '#F87171';

  return (
    <View style={[styles.ringWrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.14)" strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          animatedProps={animatedProps}
        />
      </Svg>
      <Text style={styles.scoreText}>{score}</Text>
      <Text style={styles.scoreCaption}>avg</Text>
    </View>
  );
}

function DialectCard({ dialect, onSelect, index }) {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(index * 100, withSpring(1, { stiffness: 200, damping: 15 }));
    opacity.value = withDelay(index * 100, withTiming(1, { duration: 300 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={styles.dialectCard}
        onPress={() => { hapticTap(); onSelect(dialect); }}
        activeOpacity={0.7}
      >
        <View style={styles.dialectIcon}>
          <Ionicons name={dialect.icon} size={24} color="#7CF7E8" />
        </View>
        <View style={styles.dialectInfo}>
          <Text style={styles.dialectName}>{dialect.name}</Text>
          <Text style={styles.dialectDesc}>{dialect.tagline}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
      </TouchableOpacity>
    </Animated.View>
  );
}

function PhraseCard({ phrase, onListen, isListening }) {
  return (
    <Animated.View entering={FadeInRight.duration(400)} style={styles.phraseCard}>
      <Text style={styles.phraseLabel}>Say this phrase:</Text>
      <Text style={styles.phraseBisaya}>{phrase.bisaya}</Text>
      <Text style={styles.phraseEnglish}>{phrase.english}</Text>
      <View style={styles.pronunciationRow}>
        <TouchableOpacity
          style={[styles.listenBtn, isListening && styles.listenBtnActive]}
          onPress={onListen}
        >
          <Ionicons name={isListening ? 'volume-high' : 'volume-medium'} size={20} color="#2DD4BF" />
        </TouchableOpacity>
        <Text style={styles.phrasePron}>{phrase.pronunciation}</Text>
      </View>
    </Animated.View>
  );
}

function MicButton({ isRecording, onPress }) {
  const pulse = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (isRecording) {
      pulse.value = withRepeat(
        withSequence(withTiming(1.15, { duration: 600 }), withTiming(1, { duration: 600 })),
        -1, true,
      );
      glowOpacity.value = withRepeat(
        withSequence(withTiming(0.6, { duration: 600 }), withTiming(0.2, { duration: 600 })),
        -1, true,
      );
    } else {
      pulse.value = withSpring(1);
      glowOpacity.value = withTiming(0, { duration: 300 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));

  return (
    <View style={styles.micContainer}>
      <Animated.View style={[styles.micGlow, glowStyle]} />
      <Animated.View style={[styles.micBtn, isRecording && styles.micBtnRecording, btnStyle]}>
        <TouchableOpacity style={styles.micTouch} onPress={onPress} activeOpacity={0.8}>
          <Ionicons name={isRecording ? 'stop' : 'mic'} size={40} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function FeedbackScreen({ result, phrase, onNext, onDone }) {
  const isCorrect = result.score >= 85;
  const flashOpacity = useSharedValue(0.3);

  useEffect(() => {
    flashOpacity.value = withSequence(
      withTiming(0.15, { duration: 400 }),
      withTiming(0, { duration: 600 }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flashStyle = useAnimatedStyle(() => ({
    backgroundColor: isCorrect ? `rgba(52,211,153,${flashOpacity.value})` : `rgba(248,113,113,${flashOpacity.value})`,
  }));

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.feedbackContainer}>
      <Animated.View style={[styles.feedbackFlash, flashStyle]} />
      <View style={styles.feedbackHeader}>
        <ScoreRing score={result.score} size={100} />
        <Text style={[styles.feedbackTitle, { color: isCorrect ? '#34D399' : '#F87171' }]}>
          {isCorrect ? 'Perfect!' : 'Almost!'}
        </Text>
        <Text style={styles.feedbackSubtitle}>
          {isCorrect ? 'Excellent pronunciation' : `Try saying \u2018${phrase.bisaya}\u2019 again`}
        </Text>
      </View>

      {result.transcription && (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackLabel}>You said</Text>
          <Text style={styles.feedbackValue}>{result.transcription}</Text>
        </View>
      )}

      {result.feedback && (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackLabel}>Feedback</Text>
          <Text style={styles.feedbackText}>{result.feedback}</Text>
        </View>
      )}

      {result.phoneme_breakdown && result.phoneme_breakdown.length > 0 && (
        <View style={styles.phonemeSection}>
          <Text style={styles.phonemeLabel}>Breakdown</Text>
          <View style={styles.phonemeList}>
            {result.phoneme_breakdown.slice(0, 4).map((p, i) => (
              <View key={i} style={styles.phonemeChip}>
                <Text style={styles.phonemeExpected}>{p.expected}</Text>
                <Ionicons name={p.correct ? 'checkmark-circle' : 'close-circle'} size={14} color={p.correct ? '#34D399' : '#F87171'} />
                <Text style={styles.phonemeHeard}>{p.heard}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.feedbackActions}>
        <TouchableOpacity style={styles.doneBtn} onPress={onDone} activeOpacity={0.8}>
          <Ionicons name="grid-outline" size={18} color="#2DD4BF" />
          <Text style={styles.doneBtnText}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextBtn} onPress={onNext} activeOpacity={0.8}>
          <Text style={styles.nextBtnText}>Next Phrase</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

function LibraryRow({ phrase, onPlay, onPractice }) {
  const [playing, setPlaying] = useState(false);
  const play = async () => {
    if (playing) return;
    setPlaying(true);
    onPlay();
    try {
      await Speech.speak(phrase.bisaya, { language: 'ceb', rate: 0.8, pitch: 1.0 });
    } catch (_) {}
    setPlaying(false);
  };

  return (
    <Animated.View entering={FadeInUp.duration(350)} style={styles.libraryRow}>
      <TouchableOpacity style={styles.libraryRowMain} onPress={onPractice} activeOpacity={0.7}>
        <View>
          <Text style={styles.libraryBisaya}>{phrase.bisaya}</Text>
          <Text style={styles.libraryEnglish}>{phrase.english}</Text>
          <Text style={styles.libraryPron}>{phrase.pronunciation}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.libraryPlay} onPress={play} activeOpacity={0.8} accessibilityLabel={`Listen to ${phrase.bisaya}`}>
        <Ionicons name={playing ? 'volume-high' : 'volume-medium'} size={20} color="#2DD4BF" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.libraryPractice} onPress={onPractice} activeOpacity={0.8} accessibilityLabel={`Practice ${phrase.bisaya}`}>
        <Ionicons name="mic" size={20} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function PronunciationScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const [step, setStep] = useState('home');
  const [selectedDialect, setSelectedDialect] = useState(DIALECTS[0]);
  const [currentPhrase, setCurrentPhrase] = useState(null);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [shuffledPhrases, setShuffledPhrases] = useState([]);
  const [recording, setRecording] = useState(null);
  const [result, setResult] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [stats, setStats] = useState({ bestScore: 0, totalScore: 0, sessions: 0, practiced: 0 });
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STATS_KEY);
        if (raw) setStats(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  const selectDialect = useCallback((dialect) => {
    hapticTap();
    setSelectedDialect(dialect);
    const s = shuffle(PHRASES);
    setShuffledPhrases(s);
    setCurrentPhrase(s[0]);
    setPhraseIndex(0);
    setStep('phrase');
  }, []);

  const startSession = useCallback(() => {
    hapticTap();
    const s = shuffle(PHRASES);
    setShuffledPhrases(s);
    setCurrentPhrase(s[0]);
    setPhraseIndex(0);
    setResult(null);
    setStep('dialect');
  }, []);

  const practicePhrase = useCallback((phrase) => {
    hapticTap();
    setCurrentPhrase(phrase);
    setResult(null);
    setStep('phrase');
  }, []);

  const listenToPhrase = useCallback(async () => {
    if (!currentPhrase) return;
    hapticTap();
    setIsListening(true);
    try {
      await Speech.speak(currentPhrase.bisaya, { language: selectedDialect?.language || 'ceb', rate: 0.8, pitch: 1.0 });
    } catch (_) {
      /* TTS unavailable */
    } finally {
      setIsListening(false);
    }
  }, [currentPhrase, selectedDialect]);

  const startRecording = useCallback(async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission denied', 'Microphone permission is needed');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const rec = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(rec);
      setStep('recording');
    } catch (_) {
      Alert.alert('Error', 'Could not start recording');
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recording) return;
    setStep('analyzing');
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      const audioFile = new File(uri);
      const audioBase64 = await audioFile.base64();
      const data = await api.transcribe(audioBase64, selectedDialect?.language);
      const pronunciation = await api.checkPronunciation(data.text || '');
      setResult({ transcription: data.text, ...pronunciation });
      setStep('result');
      const score = pronunciation.score || 0;
      setStats((prev) => {
        const next = {
          bestScore: Math.max(prev.bestScore, score),
          totalScore: prev.totalScore + score,
          sessions: prev.sessions + 1,
          practiced: prev.practiced + 1,
        };
        try { AsyncStorage.setItem(STATS_KEY, JSON.stringify(next)); } catch {}
        return next;
      });
    } catch (_) {
      Alert.alert('Error', 'Failed to analyze pronunciation');
      setStep('phrase');
    }
  }, [recording, selectedDialect]);

  const toggleRecording = useCallback(() => {
    if (recording) stopRecording(); else startRecording();
  }, [recording, startRecording, stopRecording]);

  const nextPhrase = useCallback(() => {
    hapticTap();
    const nextIndex = phraseIndex + 1;
    if (nextIndex < shuffledPhrases.length) {
      setPhraseIndex(nextIndex);
      setCurrentPhrase(shuffledPhrases[nextIndex]);
    } else {
      const s = shuffle(PHRASES);
      setShuffledPhrases(s);
      setPhraseIndex(0);
      setCurrentPhrase(s[0]);
    }
    setResult(null);
    setStep('phrase');
  }, [phraseIndex, shuffledPhrases]);

  const goHome = useCallback(() => {
    hapticTap();
    setStep('home');
    setCurrentPhrase(null);
    setResult(null);
  }, []);

  const avgScore = stats.sessions ? Math.round(stats.totalScore / stats.sessions) : 0;
  const filtered = useMemoLike(() => {
    const q = query.trim().toLowerCase();
    return PHRASES.filter((p) => {
      const inCat = category === 'All' || p.category === category;
      const inQuery = !q || p.bisaya.toLowerCase().includes(q) || p.english.toLowerCase().includes(q);
      return inCat && inQuery;
    });
  }, [query, category]);

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: isDark ? '#0D1E30' : colors.primary }]}>
      <TouchableOpacity onPress={step === 'home' ? () => navigation?.goBack() : goHome} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Go back">
        <Ionicons name={step === 'home' ? 'arrow-back' : 'chevron-down'} size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>Pronunciation Lab</Text>
        <Text style={styles.headerSubtitle}>
          {step === 'home' ? 'Master the sounds of Bisaya' : 'Record yourself speaking'}
        </Text>
      </View>
      <View style={styles.backBtn}>
        {stats.sessions > 0 && (
          <View style={styles.headerStat}>
            <Ionicons name="flame" size={14} color="#FFD76A" />
            <Text style={styles.headerStatText}>{stats.practiced}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderHome = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.homeContent}>
      <Animated.View entering={FadeInUp.duration(400)} style={styles.heroCard}>
        <View style={styles.heroRing}>
          <ScoreRing score={avgScore} size={120} />
        </View>
        <View style={styles.heroInfo}>
          <Text style={styles.heroTitle}>
            {avgScore >= 85 ? 'Outstanding' : avgScore >= 60 ? 'Keep pushing' : 'Getting started'}
          </Text>
          <Text style={styles.heroSubtitle}>Your average pronunciation score across {stats.sessions} session{stats.sessions === 1 ? '' : 's'}.</Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStatItem}>
              <Ionicons name="trophy" size={16} color="#FFD76A" />
              <Text style={styles.heroStatValue}>{stats.bestScore}</Text>
              <Text style={styles.heroStatLabel}>Best</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Ionicons name="mic" size={16} color="#7CF7E8" />
              <Text style={styles.heroStatValue}>{stats.practiced}</Text>
              <Text style={styles.heroStatLabel}>Practiced</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Ionicons name="time" size={16} color="#A5B4FC" />
              <Text style={styles.heroStatValue}>{stats.sessions}</Text>
              <Text style={styles.heroStatLabel}>Sessions</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <TouchableOpacity style={styles.startBtn} onPress={startSession} activeOpacity={0.85}>
        <View style={styles.startBtnIcon}>
          <Ionicons name="mic" size={22} color="#fff" />
        </View>
        <View style={styles.startBtnTextWrap}>
          <Text style={styles.startBtnTitle}>Start Practicing</Text>
          <Text style={styles.startBtnSubtitle}>Pick a dialect and speak aloud for instant feedback</Text>
        </View>
        <Ionicons name="arrow-forward" size={22} color="#fff" />
      </TouchableOpacity>

      <View style={styles.dialectStrip}>
        {DIALECTS.map((d) => (
          <TouchableOpacity key={d.id} style={styles.dialectChip} onPress={() => selectDialect(d)} activeOpacity={0.8}>
            <Ionicons name={d.icon} size={16} color="#2DD4BF" />
            <Text style={styles.dialectChipText}>{d.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.libraryHeader}>
        <Text style={styles.libraryTitle}>Phrase Library</Text>
        <Text style={styles.libraryCount}>{filtered.length} phrases</Text>
      </View>

      <View style={[styles.searchBox, { backgroundColor: isDark ? 'rgba(13,30,48,0.7)' : '#FFFFFF', borderColor: isDark ? 'rgba(124,247,232,0.14)' : '#E2E8F0' }]}>
        <Ionicons name="search" size={18} color={isDark ? 'rgba(255,255,255,0.5)' : '#94A3B8'} />
        <TextInput
          style={[styles.searchInput, { color: isDark ? '#fff' : '#1E293B' }]}
          placeholder="Search phrases..."
          placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8'}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn} accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={18} color={isDark ? 'rgba(255,255,255,0.5)' : '#94A3B8'} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.categoryRow}>
        {['All', ...CATEGORIES].map((c) => {
          const active = category === c;
          return (
            <TouchableOpacity
              key={c}
              style={[styles.categoryChip, active && { backgroundColor: '#2DD4BF' }]}
              onPress={() => setCategory(c)}
              activeOpacity={0.8}
            >
              <Text style={[styles.categoryChipText, { color: active ? '#04111f' : 'rgba(255,255,255,0.6)' }]}>{c}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyLibrary}>
          <Ionicons name="search-outline" size={40} color="rgba(255,255,255,0.3)" />
          <Text style={styles.emptyLibraryText}>No phrases match your search.</Text>
        </View>
      ) : (
        filtered.map((p) => (
          <LibraryRow key={p.bisaya} phrase={p} onPlay={listenToPhrase} onPractice={() => practicePhrase(p)} />
        ))
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );

  const renderDialect = () => (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.dialectContainer}>
        <Text style={styles.dialectTitle}>Choose your dialect</Text>
        <Text style={styles.dialectSubtitle}>Select a Bisaya dialect to practice</Text>
        {DIALECTS.map((d, i) => (
          <DialectCard key={d.id} dialect={d} onSelect={selectDialect} index={i} />
        ))}
      </View>
    </ScrollView>
  );

  const renderPractice = () => (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.practiceContainer}>
        <TouchableOpacity style={styles.dialectBadge} onPress={() => setStep('dialect')}>
          <Ionicons name={selectedDialect?.icon} size={16} color="#2DD4BF" />
          <Text style={styles.dialectBadgeText}>{selectedDialect?.name}</Text>
          <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>

        {currentPhrase && (
          <PhraseCard phrase={currentPhrase} onListen={listenToPhrase} isListening={isListening} />
        )}

        <MicButton isRecording={step === 'recording'} onPress={toggleRecording} />
        <Text style={styles.statusText}>{step === 'recording' ? 'Tap to stop' : 'Tap to record'}</Text>

        <View style={styles.progressRow}>
          <Text style={styles.progressText}>{phraseIndex + 1} / {shuffledPhrases.length}</Text>
          <TouchableOpacity onPress={goHome} style={styles.exitPractice}>
            <Text style={styles.exitPracticeText}>Exit practice</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderStep = () => {
    switch (step) {
      case 'home': return renderHome();
      case 'dialect': return renderDialect();
      case 'phrase':
      case 'recording': return renderPractice();
      case 'analyzing':
        return (
          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            <View style={styles.analyzingContainer}>
              <ActivityIndicator size="large" color="#2DD4BF" />
              <Text style={styles.analyzingText}>Analyzing pronunciation...</Text>
            </View>
          </ScrollView>
        );
      case 'result':
        return (
          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            <FeedbackScreen result={result} phrase={currentPhrase} onNext={nextPhrase} onDone={goHome} />
          </ScrollView>
        );
      default: return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#07101F' : '#F4F7FB' }]}>
      {renderHeader()}
      {renderStep()}
    </View>
  );
}

function useMemoLike(fn, deps) {
  const ref = React.useRef({});
  const key = deps.join('|');
  if (ref.current.key !== key) {
    ref.current = { key, value: fn() };
  }
  return ref.current.value;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: 16, paddingHorizontal: 16 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  headerStat: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.14)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  headerStatText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  content: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 40 },
  homeContent: { padding: 16, paddingBottom: 40 },

  // Hero
  heroCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0D1E30', borderWidth: 1, borderColor: 'rgba(124,247,232,0.16)',
    borderRadius: 22, padding: 20, marginBottom: 16,
  },
  heroRing: { marginRight: 16 },
  heroInfo: { flex: 1 },
  heroTitle: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  heroSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4, lineHeight: 17 },
  heroStats: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  heroStatItem: { flex: 1, alignItems: 'center', gap: 2 },
  heroStatValue: { fontSize: 16, fontWeight: '800', color: '#fff' },
  heroStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)' },
  heroStatDivider: { width: 1, height: 26, backgroundColor: 'rgba(255,255,255,0.12)' },

  startBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#2DD4BF', borderRadius: 18, padding: 16, marginBottom: 12,
    boxShadow: '0 6px 18px rgba(45,212,191,0.35)', elevation: 6,
  },
  startBtnIcon: {
    width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },
  startBtnTextWrap: { flex: 1 },
  startBtnTitle: { fontSize: 16, fontWeight: '800', color: '#04111f' },
  startBtnSubtitle: { fontSize: 11, color: 'rgba(4,17,31,0.7)', marginTop: 2 },

  dialectStrip: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  dialectChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 999, backgroundColor: 'rgba(45,212,191,0.12)', borderWidth: 1, borderColor: 'rgba(45,212,191,0.3)',
  },
  dialectChipText: { fontSize: 12, fontWeight: '700', color: '#2DD4BF' },

  libraryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  libraryTitle: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  libraryCount: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },

  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, marginBottom: 12 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14 },
  clearBtn: { padding: 2 },

  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  categoryChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: 'rgba(13,30,48,0.7)', borderWidth: 1, borderColor: 'rgba(124,247,232,0.14)' },
  categoryChipText: { fontSize: 12, fontWeight: '700' },

  libraryRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(13,30,48,0.65)', borderWidth: 1, borderColor: 'rgba(124,247,232,0.12)',
    borderRadius: 16, padding: 14, marginBottom: 10,
  },
  libraryRowMain: { flex: 1 },
  libraryBisaya: { fontSize: 16, fontWeight: '800', color: '#fff' },
  libraryEnglish: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  libraryPron: { fontSize: 12, color: 'rgba(255,255,255,0.45)', fontStyle: 'italic', marginTop: 2 },
  libraryPlay: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(45,212,191,0.12)', borderWidth: 1, borderColor: 'rgba(45,212,191,0.3)',
  },
  libraryPractice: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2DD4BF',
  },

  emptyLibrary: { alignItems: 'center', paddingVertical: 40 },
  emptyLibraryText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 10 },

  // Practice flow
  dialectContainer: { paddingTop: 20 },
  dialectTitle: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginBottom: 8 },
  dialectSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 32 },
  dialectCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(13, 30, 48, 0.65)', borderWidth: 1, borderColor: 'rgba(124, 247, 232, 0.14)',
    borderRadius: 16, padding: 16, marginBottom: 12,
  },
  dialectIcon: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(124,247,232,0.12)',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  dialectInfo: { flex: 1 },
  dialectName: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  dialectDesc: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },

  practiceContainer: { alignItems: 'center', paddingTop: 20 },
  dialectBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(45, 212, 191, 0.15)', borderWidth: 1, borderColor: 'rgba(45, 212, 191, 0.3)',
    borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 24, gap: 6,
  },
  dialectBadgeText: { fontSize: 14, fontWeight: '600', color: '#2DD4BF' },

  phraseCard: {
    backgroundColor: 'rgba(13, 30, 48, 0.65)', borderWidth: 1, borderColor: 'rgba(124, 247, 232, 0.14)',
    borderRadius: 18, padding: 20, width: '100%', marginBottom: 32,
  },
  phraseLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  phraseBisaya: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  phraseEnglish: { fontSize: 16, color: 'rgba(255,255,255,0.7)', marginBottom: 16 },
  pronunciationRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  listenBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(45, 212, 191, 0.15)', borderWidth: 1, borderColor: 'rgba(45, 212, 191, 0.3)',
    justifyContent: 'center', alignItems: 'center',
  },
  listenBtnActive: { backgroundColor: 'rgba(45, 212, 191, 0.3)' },
  phrasePron: { fontSize: 15, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', flex: 1 },

  micContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  micGlow: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(45, 212, 191, 0.3)' },
  micBtn: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#2DD4BF',
    justifyContent: 'center', alignItems: 'center',
    boxShadow: '0 4px 16px rgba(45,212,199,0.4)', elevation: 8,
  },
  micBtnRecording: { backgroundColor: '#F87171', boxShadow: '0 4px 16px rgba(248,113,113,0.4)' },
  micTouch: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },

  statusText: { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 24 },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  progressText: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  exitPractice: { paddingHorizontal: 10, paddingVertical: 4 },
  exitPracticeText: { fontSize: 13, color: 'rgba(45,212,191,0.8)', fontWeight: '600' },

  analyzingContainer: { alignItems: 'center', paddingTop: 80 },
  analyzingText: { fontSize: 16, color: 'rgba(255,255,255,0.7)', marginTop: 16 },

  // Feedback
  feedbackContainer: { alignItems: 'center', paddingTop: 20 },
  feedbackFlash: { position: 'absolute', top: 0, left: -16, right: -16, bottom: 0 },
  feedbackHeader: { alignItems: 'center', marginBottom: 24 },
  ringWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  scoreText: { position: 'absolute', fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  scoreCaption: { position: 'absolute', bottom: 18, fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  feedbackTitle: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  feedbackSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.7)' },

  feedbackCard: {
    backgroundColor: 'rgba(13, 30, 48, 0.65)', borderWidth: 1, borderColor: 'rgba(124, 247, 232, 0.14)',
    borderRadius: 16, padding: 16, width: '100%', marginBottom: 16,
  },
  feedbackLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  feedbackText: { fontSize: 15, color: '#FFFFFF', lineHeight: 22 },
  feedbackValue: { fontSize: 18, color: '#FFFFFF', fontWeight: '700' },

  phonemeSection: { width: '100%', marginBottom: 24 },
  phonemeLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  phonemeList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  phonemeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8,
  },
  phonemeExpected: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  phonemeHeard: { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' },

  feedbackActions: { flexDirection: 'row', gap: 12, width: '100%' },
  doneBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'rgba(45,212,191,0.12)', borderWidth: 1, borderColor: 'rgba(45,212,191,0.35)',
    borderRadius: 999, paddingHorizontal: 20, paddingVertical: 16,
  },
  doneBtnText: { fontSize: 15, fontWeight: '700', color: '#2DD4BF' },
  nextBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#2DD4BF', borderRadius: 999, paddingVertical: 16, gap: 8,
    boxShadow: '0 4px 12px rgba(45,212,199,0.4)', elevation: 6,
  },
  nextBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
