import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../context/ThemeContext';
import { spacing, borderRadius } from '../../../theme';

interface TravelSuggestionProps {
  onPractice?: () => void;
}

const SUGGESTIONS = [
  { place: 'Cebu City Market', emoji: '\ud83c\udfea', phrase: 'Pila ni?', english: 'How much is this?', icon: 'basket', gradient: ['#0EA5E5', '#6366F1'] },
  { place: 'Jeepney Ride', emoji: '\ud83d\ude8c', phrase: 'Maka-abot ba sa Colon?', english: 'Can this reach Colon?', icon: 'bus', gradient: ['#14B8A6', '#06B6D4'] },
  { place: 'Beach Resort', emoji: '\ud83c\udfd6', phrase: 'Palihog ug tubig', english: 'Please bring water', icon: 'water', gradient: ['#F59E0B', '#F97316'] },
  { place: 'Lighthouse Cafe', emoji: '\ud83c\udf77', phrase: 'Unsa ang imong bestseller?', english: 'What is your bestseller?', icon: 'cafe', gradient: ['#8B5CF6', '#6D28D9'] },
];

export function TravelSuggestion({ onPractice }: TravelSuggestionProps) {
  const { getAnimationDuration } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: getAnimationDuration(600), useNativeDriver: true }).start();
  }, [getAnimationDuration]);

  const today = SUGGESTIONS[new Date().getDate() % SUGGESTIONS.length];

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={today.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.label}>TRAVEL SUGGESTION</Text>
            <Text style={styles.title}>{today.emoji} {today.place}</Text>
            <Text style={styles.desc}>Practice this phrase before you go</Text>
          </View>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Ionicons name={today.icon as any} size={22} color="#fff" />
          </View>
        </View>

        <View style={styles.phraseCard}>
          <Text style={styles.phrase}>{today.phrase}</Text>
          <Text style={styles.phraseEnglish}>{today.english}</Text>
        </View>

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={onPractice}
          activeOpacity={0.85}
        >
          <Ionicons name="mic" size={16} color={today.gradient[0]} />
          <Text style={styles.ctaText}>Practice This Phrase</Text>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  card: { borderRadius: borderRadius.xl, padding: spacing.lg, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  headerText: { flex: 1 },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  title: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  desc: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  phraseCard: { backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: borderRadius.lg, padding: spacing.md },
  phrase: { fontSize: 16, fontWeight: '700', color: '#fff' },
  phraseEnglish: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#fff',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
  },
  ctaText: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
});
