import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { spacing, borderRadius } from '../../../theme';

interface VoiceChallengeProps {
  onRecord?: () => void;
  onListen?: () => void;
}

export function VoiceChallenge({ onRecord, onListen }: VoiceChallengeProps) {
  const { colors, getAnimationDuration } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: getAnimationDuration(600), useNativeDriver: true }).start();
  }, [getAnimationDuration]);

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim }]}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.header}>
          <View style={[styles.iconWrapper, { backgroundColor: colors.softPink }]}>
            <Ionicons name="mic" size={18} color="#EC4899" />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.text }]}>Voice Challenge</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Say: "Maayong buntag"</Text>
          </View>
        </View>

        <View style={[styles.waveform, { backgroundColor: colors.softPurple }]}>
          {Array.from({ length: 24 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.waveBar,
                {
                  backgroundColor: colors.primary,
                  height: 8 + Math.sin(i * 0.8) * 16 + Math.random() * 8,
                  opacity: 0.4 + Math.random() * 0.6,
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.scoreRow}>
          <View style={styles.scoreItem}>
            <Text style={[styles.scoreValue, { color: colors.success }]}>87%</Text>
            <Text style={[styles.scoreLabel, { color: colors.textLight }]}>Accuracy</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={[styles.scoreValue, { color: colors.accent }]}>92%</Text>
            <Text style={[styles.scoreLabel, { color: colors.textLight }]}>Confidence</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.softTeal }]} onPress={onListen} activeOpacity={0.85}>
            <Ionicons name="play" size={16} color={colors.accent} />
            <Text style={[styles.actionText, { color: colors.accent }]}>Listen</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={onRecord} activeOpacity={0.85}>
            <Ionicons name="mic" size={16} color="#fff" />
            <Text style={[styles.actionText, { color: '#fff' }]}>Record</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.softOrange }]} activeOpacity={0.85}>
            <Ionicons name="refresh" size={16} color={colors.secondary} />
            <Text style={[styles.actionText, { color: colors.secondary }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  card: { borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrapper: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  subtitle: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  waveform: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: spacing.md, borderRadius: borderRadius.lg },
  waveBar: { width: 3, borderRadius: 2 },
  scoreRow: { flexDirection: 'row', gap: spacing.xl },
  scoreItem: { alignItems: 'center' },
  scoreValue: { fontSize: 20, fontWeight: '800' },
  scoreLabel: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingVertical: spacing.sm, borderRadius: borderRadius.lg },
  actionText: { fontSize: 13, fontWeight: '600' },
});
