import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { spacing, borderRadius } from '../../../theme';

interface PhraseOfTheDayProps {
  onPractice?: () => void;
}

const PHRASE = {
  cebuano: 'Kumusta ka?',
  english: 'How are you?',
  pronunciation: 'ku-MUS-ta ka',
  category: 'Greetings',
};

export function PhraseOfTheDay({ onPractice }: PhraseOfTheDayProps) {
  const { colors, getAnimationDuration } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: getAnimationDuration(600), useNativeDriver: true }).start();
  }, [getAnimationDuration]);

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim }]}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.header}>
          <View style={[styles.iconWrapper, { backgroundColor: colors.softOrange }]}>
            <Ionicons name="chatbubble-ellipses" size={18} color={colors.secondary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Phrase of the Day</Text>
          <View style={[styles.categoryBadge, { backgroundColor: colors.softPurple }]}>
            <Text style={[styles.categoryText, { color: colors.primary }]}>{PHRASE.category}</Text>
          </View>
        </View>

        <View style={styles.phraseSection}>
          <Text style={[styles.cebuano, { color: colors.text }]}>{PHRASE.cebuano}</Text>
          <Text style={[styles.english, { color: colors.textSecondary }]}>{PHRASE.english}</Text>
          <View style={styles.pronunciationRow}>
            <Ionicons name="volume-high" size={14} color={colors.accent} />
            <Text style={[styles.pronunciation, { color: colors.accent }]}>{PHRASE.pronunciation}</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.practiceBtn, { backgroundColor: colors.accent }]} onPress={onPractice} activeOpacity={0.85}>
          <Ionicons name="mic" size={16} color="#fff" />
          <Text style={styles.practiceText}>Practice Pronunciation</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  card: { borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconWrapper: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '700', flex: 1, letterSpacing: -0.2 },
  categoryBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: borderRadius.full },
  categoryText: { fontSize: 10, fontWeight: '600' },
  phraseSection: { gap: spacing.xs },
  cebuano: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  english: { fontSize: 14, fontWeight: '500' },
  pronunciationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 2 },
  pronunciation: { fontSize: 13, fontWeight: '600' },
  practiceBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.md, borderRadius: borderRadius.xl },
  practiceText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
