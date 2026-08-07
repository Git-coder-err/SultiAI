import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { spacing, borderRadius } from '../../../theme';

interface AILearningCoachProps {
  onStartCoaching?: () => void;
}

interface Recommendation {
  type: 'improved' | 'practice';
  text: string;
}

const RECOMMENDATIONS: Recommendation[] = [
  { type: 'improved', text: 'Greetings improved' },
  { type: 'practice', text: 'NG pronunciation' },
  { type: 'practice', text: 'Market conversations' },
];

export function AILearningCoach({ onStartCoaching }: AILearningCoachProps) {
  const { colors, getAnimationDuration } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: getAnimationDuration(600), useNativeDriver: true }).start();
  }, [getAnimationDuration]);

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim }]}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.header}>
          <View style={[styles.iconWrapper, { backgroundColor: colors.softPurple }]}>
            <Ionicons name="bulb" size={18} color={colors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.text }]}>AI Learning Coach</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Based on your recent activity</Text>
          </View>
        </View>

        <View style={styles.recommendations}>
          {RECOMMENDATIONS.map((rec, i) => (
            <View key={i} style={styles.recRow}>
              <Ionicons
                name={rec.type === 'improved' ? 'checkmark-circle' : 'arrow-forward-circle'}
                size={16}
                color={rec.type === 'improved' ? colors.success : colors.accent}
              />
              <Text style={[styles.recText, { color: colors.text }]}>{rec.text}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.estimateRow, { backgroundColor: colors.softTeal }]}>
          <Ionicons name="time-outline" size={14} color={colors.accent} />
          <Text style={[styles.estimateText, { color: colors.textSecondary }]}>Estimated practice: 8 minutes</Text>
        </View>

        <TouchableOpacity style={[styles.ctaButton, { backgroundColor: colors.primary }]} onPress={onStartCoaching} activeOpacity={0.85}>
          <Text style={styles.ctaText}>Start AI Coaching</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  card: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrapper: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  subtitle: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  recommendations: { gap: spacing.sm },
  recRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  recText: { fontSize: 14, fontWeight: '500' },
  estimateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: borderRadius.md, alignSelf: 'flex-start' },
  estimateText: { fontSize: 12, fontWeight: '500' },
  ctaButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.md, borderRadius: borderRadius.xl },
  ctaText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
