import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { spacing, borderRadius } from '../../../theme';

interface AchievementsPreviewProps {
  onViewAll?: () => void;
}

const BADGES = [
  { id: 'first_100_xp', icon: 'star', color: '#FFD700', earned: true },
  { id: 'streak_7', icon: 'flame', color: '#FF8A65', earned: true },
  { id: 'voice_pioneer', icon: 'mic', color: '#A855F7', earned: true },
  { id: 'thousand_xp', icon: 'trophy', color: '#94A3B8', earned: false },
];

export function AchievementsPreview({ onViewAll }: AchievementsPreviewProps) {
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
            <Ionicons name="medal" size={18} color={colors.warning} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.text }]}>Achievements</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{BADGES.filter((b) => b.earned).length} badges earned</Text>
          </View>
          <TouchableOpacity onPress={onViewAll}>
            <Text style={[styles.viewAll, { color: colors.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.badgesRow}>
          {BADGES.map((badge) => (
            <View
              key={badge.id}
              style={[
                styles.badgeItem,
                { backgroundColor: badge.earned ? colors.softPurple : colors.surfaceSecondary, opacity: badge.earned ? 1 : 0.5 },
              ]}
            >
              <Ionicons name={badge.icon as any} size={20} color={badge.earned ? badge.color : colors.textLight} />
            </View>
          ))}
        </View>

        <View style={[styles.nextBadge, { backgroundColor: colors.softTeal }]}>
          <Ionicons name="arrow-up-circle" size={14} color={colors.accent} />
          <Text style={[styles.nextText, { color: colors.textSecondary }]}>Next: Century Club (1,000 XP) — 380 XP to go</Text>
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
  viewAll: { fontSize: 13, fontWeight: '600' },
  badgesRow: { flexDirection: 'row', gap: spacing.sm },
  badgeItem: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  nextBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: borderRadius.md },
  nextText: { fontSize: 12, fontWeight: '500' },
});
