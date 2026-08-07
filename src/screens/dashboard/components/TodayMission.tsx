import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { spacing, borderRadius } from '../../../theme';

interface TodayMissionProps {
  onStart?: () => void;
}

const MISSIONS = [
  { id: 1, title: 'Practice 5 phrases', xp: 25, done: true },
  { id: 2, title: 'Voice recording', xp: 15, done: true },
  { id: 3, title: 'Review vocabulary', xp: 20, done: false },
  { id: 4, title: 'Chat with AI Tutor', xp: 30, done: false },
];

export function TodayMission({ onStart }: TodayMissionProps) {
  const { colors, getAnimationDuration } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const completed = MISSIONS.filter((m) => m.done).length;
  const totalXP = MISSIONS.reduce((sum, m) => sum + m.xp, 0);
  const earnedXP = MISSIONS.filter((m) => m.done).reduce((sum, m) => sum + m.xp, 0);
  const progress = (completed / MISSIONS.length) * 100;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: getAnimationDuration(500), useNativeDriver: true }),
      Animated.timing(progressAnim, { toValue: 1, duration: getAnimationDuration(800), useNativeDriver: false }),
    ]).start();
  }, [getAnimationDuration]);

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${progress}%`] });

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim }]}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.header}>
          <View style={[styles.iconWrapper, { backgroundColor: colors.softOrange }]}>
            <Ionicons name="trophy" size={18} color={colors.secondary} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.text }]}>Today's Mission</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{completed}/{MISSIONS.length} completed</Text>
          </View>
          <View style={[styles.xpBadge, { backgroundColor: colors.softPurple }]}>
            <Text style={[styles.xpText, { color: colors.primary }]}>{earnedXP}/{totalXP} XP</Text>
          </View>
        </View>

          <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth, backgroundColor: colors.primary }]} />
        </View>

        <View style={styles.missionsList}>
          {MISSIONS.map((mission) => (
            <View key={mission.id} style={styles.missionRow}>
              <Ionicons
                name={mission.done ? 'checkmark-circle' : 'ellipse-outline'}
                size={18}
                color={mission.done ? colors.success : colors.textLight}
              />
              <Text style={[styles.missionText, { color: mission.done ? colors.textSecondary : colors.text, textDecorationLine: mission.done ? 'line-through' : 'none' }]}>
                {mission.title}
              </Text>
              <Text style={[styles.missionXp, { color: colors.warning }]}>+{mission.xp}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={[styles.ctaButton, { backgroundColor: colors.secondary }]} onPress={onStart} activeOpacity={0.85}>
          <Text style={styles.ctaText}>Continue Mission</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
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
  xpBadge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.full },
  xpText: { fontSize: 11, fontWeight: '700' },
  progressBarBg: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  missionsList: { gap: spacing.sm },
  missionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  missionText: { flex: 1, fontSize: 14, fontWeight: '500' },
  missionXp: { fontSize: 12, fontWeight: '700' },
  ctaButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.md, borderRadius: borderRadius.xl },
  ctaText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
