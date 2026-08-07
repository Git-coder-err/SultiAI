import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { XP_VALUES } from '../constants';
import { useGame } from '../context/GameContext';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { api } from '../services/api';
import Header from '../components/Header';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { spacing, borderRadius } from '../theme';

const { width } = Dimensions.get('window');

export default function FlashcardsScreen({ navigation }) {
  const { colors } = useTheme();
  const { addXp } = useGame();
  const { enqueueAction, isOnline } = useOfflineSync();
  const [phrases, setPhrases] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [knownCount, setKnownCount] = useState(0);
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { loadPhrases(); }, []);

  const loadPhrases = async () => {
    try {
      const data = await api.getSavedPhrases();
      setPhrases(Array.isArray(data) ? data : []);
    } catch {} finally {
      setLoading(false);
    }
  };

  const flipCard = () => {
    Animated.spring(flipAnim, {
      toValue: flipped ? 0 : 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setFlipped(!flipped);
  };

  const frontInterpolate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backInterpolate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const frontOpacity = flipAnim.interpolate({ inputRange: [0, 0.5, 0.5, 1], outputRange: [1, 1, 0, 0] });
  const backOpacity = flipAnim.interpolate({ inputRange: [0, 0.5, 0.5, 1], outputRange: [0, 0, 1, 1] });

  const markKnown = () => {
    setKnownCount(k => k + 1);
    addXp(XP_VALUES.FLASHCARD_KNOWN, 'flashcard');
    const currentPhrase = phrases[index];
    if (currentPhrase) {
      enqueueAction({
        endpoint: '/api/v2/vocabulary/review',
        method: 'POST',
        payload: { word: currentPhrase.phrase || currentPhrase.bisaya, quality: 4 },
      });
    }
    nextCard();
  };

  const markUnknown = () => {
    const currentPhrase = phrases[index];
    if (currentPhrase) {
      enqueueAction({
        endpoint: '/api/v2/vocabulary/review',
        method: 'POST',
        payload: { word: currentPhrase.phrase || currentPhrase.bisaya, quality: 1 },
      });
    }
    nextCard();
  };

  const nextCard = () => {
    if (index < phrases.length - 1) {
      setIndex(i => i + 1);
      setFlipped(false);
      flipAnim.setValue(0);
    }
  };

  if (loading) return <LoadingState fullScreen />;

  if (phrases.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Flashcards" subtitle="Review saved phrases" leftIcon="arrow-back" onLeftPress={() => navigation.goBack()} />
        <EmptyState icon="book" title="No phrases yet" message="Save phrases from conversations to review them here." actionLabel="Start Learning" onAction={() => navigation.navigate('Learn')} />
      </View>
    );
  }

  const current = phrases[index];
  const progress = ((index + 1) / phrases.length) * 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Flashcards" subtitle={`${index + 1} of ${phrases.length}`} leftIcon="arrow-back" onLeftPress={() => navigation.goBack()} />

      <View style={styles.progressContainer}>
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.primary }]} />
        </View>
      </View>

      <View style={styles.cardContainer}>
        <TouchableOpacity activeOpacity={0.9} onPress={flipCard} style={styles.cardTouchable}>
          <Animated.View style={[styles.card, { backgroundColor: colors.card, transform: [{ rotateY: frontInterpolate }], opacity: frontOpacity, backfaceVisibility: 'hidden' }]}>
            <Text style={[styles.cardText, { color: colors.text }]}>{current.phrase || current.phrase_text || current.word}</Text>
            {current.category && <Text style={[styles.category, { color: colors.primary }]}>{current.category}</Text>}
            <Text style={[styles.tapHint, { color: colors.textLight }]}>Tap to reveal</Text>
          </Animated.View>

          <Animated.View style={[styles.card, styles.cardBack, { backgroundColor: colors.primaryLight, transform: [{ rotateY: backInterpolate }], opacity: backOpacity, backfaceVisibility: 'hidden' }]}>
            <Ionicons name="checkmark-circle" size={32} color={colors.primary} />
            <Text style={[styles.cardText, { color: colors.text }]}>{current.translation || current.meaning || current.english}</Text>
            {current.pronunciation && <Text style={[styles.pronunciation, { color: colors.textSecondary }]}>{current.pronunciation}</Text>}
            <Text style={[styles.tapHint, { color: colors.textLight }]}>Tap to flip back</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.error + '20' }]} onPress={markUnknown}>
          <Ionicons name="close" size={24} color={colors.error} />
          <Text style={[styles.actionLabel, { color: colors.error }]}>Need Review</Text>
        </TouchableOpacity>
        <Text style={[styles.knownCount, { color: colors.textSecondary }]}>Known: {knownCount}</Text>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.success + '20' }]} onPress={markKnown}>
          <Ionicons name="checkmark" size={24} color={colors.success} />
          <Text style={[styles.actionLabel, { color: colors.success }]}>Got It!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressContainer: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  progressTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  cardContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  cardTouchable: { width: '100%', maxWidth: 340, aspectRatio: 0.7 },
  card: { position: 'absolute', width: '100%', height: '100%', borderRadius: borderRadius.xl, justifyContent: 'center', alignItems: 'center', padding: spacing.xxl, elevation: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' },
  cardBack: { backgroundColor: '#E8F4F8' },
  cardText: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: spacing.md, lineHeight: 32 },
  category: { fontSize: 13, fontWeight: '600', marginBottom: spacing.sm },
  pronunciation: { fontSize: 16, fontStyle: 'italic', marginBottom: spacing.lg },
  tapHint: { fontSize: 12, fontWeight: '500', position: 'absolute', bottom: spacing.xl },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, gap: spacing.xl },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.xxl, borderRadius: borderRadius.full, gap: spacing.sm },
  actionLabel: { fontSize: 15, fontWeight: '700' },
  knownCount: { fontSize: 14, fontWeight: '600' },
});
