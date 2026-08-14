import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { useGame } from '../../../context/GameContext';
import { spacing, borderRadius } from '../../../theme';

interface AchievementsPreviewProps {
  onViewAll?: () => void;
}

const ALL_BADGES = [
  { id: 'first_100_xp', icon: 'star', color: '#FFD700' },
  { id: 'thousand_xp', icon: 'trophy', color: '#94A3B8' },
  { id: 'streak_7', icon: 'flame', color: '#FF8A65' },
  { id: 'voice_pioneer', icon: 'mic', color: '#A855F7' },
];

export function AchievementsPreview({ onViewAll }: AchievementsPreviewProps) {
  const { colors, getAnimationDuration } = useTheme();
  const game = useGame() as any;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const earnedIds = new Set(((game.achievements as any[]) || []).map((a: any) => a.id));
  const badges = ALL_BADGES.map((b) => ({ ...b, earned: earnedIds.has(b.id) }));
  const earnedCount = badges.filter((b) => b.earned).length;

  const safeXp = Math.max(0, Number(game.xp) || 0);
  const level = game.getLevelInfo(safeXp);
  const nextThreshold = Math.max(safeXp, Number(level.xpForNext) || 0);
  const toGo = Math.max(0, nextThreshold - safeXp);

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
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{earnedCount} badges earned</Text>
          </View>
          <TouchableOpacity onPress={onViewAll}>
            <Text style={[styles.viewAll, { color: colors.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.badgesRow}>
          {badges.map((badge) => (
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
          <Text style={[styles.nextText, { color: colors.textSecondary }]}>
            {toGo > 0
              ? `Next level ${Number(level.level) + 1}: ${toGo.toLocaleString()} XP to go`
              : `Level ${level.level} complete — ${level.label}!`}
          </Text>
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
