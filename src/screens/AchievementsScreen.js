import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { useOfflineSync } from '../hooks/useOfflineSync';
import Header from '../components/Header';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { spacing, borderRadius } from '../theme';

const ALL_BADGES = [
  { id: 'first_100_xp', title: 'First Steps', description: 'Earn 100 XP', icon: 'star', color: '#FFD700' },
  { id: 'thousand_xp', title: 'Century', description: 'Earn 1,000 XP', icon: 'trophy', color: '#FF6B00' },
  { id: 'five_thousand_xp', title: 'Dedicated', description: 'Earn 5,000 XP', icon: 'diamond', color: '#8B5CF6' },
  { id: 'streak_3', title: 'Getting Started', description: '3-day streak', icon: 'sparkles', color: '#CD7F32' },
  { id: 'streak_7', title: 'Consistent', description: '7-day streak', icon: 'calendar', color: '#94A3B8' },
  { id: 'streak_30', title: 'Unstoppable', description: '30-day streak', icon: 'crown', color: '#FFD700' },
  { id: 'daily_goal', title: 'Goal Crusher', description: 'Reach daily goal', icon: 'target', color: '#10B981' },
  { id: 'first_lesson', title: 'First Lesson', description: 'Complete your first lesson', icon: 'school', color: '#1E6F9F' },
  { id: 'ten_lessons', title: 'Dedicated Learner', description: 'Complete 10 lessons', icon: 'school', color: '#1E6F9F' },
  { id: 'voice_pioneer', title: 'Voice Pioneer', description: 'Try voice practice', icon: 'mic', color: '#FFB347' },
  { id: 'community_member', title: 'Community Member', description: 'Join the community', icon: 'people', color: '#8B5CF6' },
  { id: 'native_speaker', title: 'Native Speaker', description: 'Verified native Bisaya speaker', icon: 'shield-checkmark', color: '#10B981' },
];

function getProgress(id, { xp, streak, dailyXp, dailyGoal }) {
  switch (id) {
    case 'first_100_xp': return { current: Math.min(xp, 100), target: 100 };
    case 'thousand_xp': return { current: Math.min(xp, 1000), target: 1000 };
    case 'five_thousand_xp': return { current: Math.min(xp, 5000), target: 5000 };
    case 'streak_3': return { current: Math.min(streak, 3), target: 3 };
    case 'streak_7': return { current: Math.min(streak, 7), target: 7 };
    case 'streak_30': return { current: Math.min(streak, 30), target: 30 };
    case 'daily_goal': return { current: Math.min(dailyXp, dailyGoal || 50), target: dailyGoal || 50 };
    default: return null;
  }
}

const formatEarnedDate = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d) ? null : d.toLocaleDateString();
};

export default function AchievementsScreen({ navigation }) {
  const { colors } = useTheme();
  const { xp, streak, dailyXp, dailyGoal, badges } = useGame();
  const { enqueueAction } = useOfflineSync();

  const earnedById = {};
  badges.forEach((b) => { earnedById[b.id] = b; });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Achievements" subtitle={`${badges.length} of ${ALL_BADGES.length} earned`} leftIcon="arrow-back" onLeftPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          {ALL_BADGES.map((badge) => {
            const earned = !!earnedById[badge.id];
            const progress = getProgress(badge.id, { xp, streak, dailyXp, dailyGoal });
            const pct = progress ? Math.min(100, Math.round((progress.current / progress.target) * 100)) : 0;
            const earnedDate = earned ? formatEarnedDate(earnedById[badge.id].earnedAt) : null;
            return (
              <Card
                key={badge.id}
                style={[
                  styles.badgeCard,
                  earned
                    ? { backgroundColor: badge.color + '0F', borderColor: badge.color + '55' }
                    : styles.lockedCard,
                ]}
                variant={earned ? 'elevated' : 'outlined'}
              >
                <View style={styles.iconWrap}>
                  <View style={[styles.badgeIcon, { backgroundColor: earned ? badge.color + '26' : colors.surfaceSecondary }]}>
                    <Ionicons name={badge.icon} size={28} color={earned ? badge.color : colors.textLight} />
                  </View>
                  {!earned && (
                    <View style={[styles.lockTag, { backgroundColor: colors.overlay }]}>
                      <Ionicons name="lock-closed" size={10} color="#fff" />
                    </View>
                  )}
                </View>
                <Text style={[styles.badgeTitle, { color: earned ? colors.text : colors.textLight }]}>{badge.title}</Text>
                <Text style={[styles.badgeDesc, { color: earned ? colors.textSecondary : colors.textLight }]}>{badge.description}</Text>

                {earned ? (
                  <Badge title={earnedDate ? `Earned ${earnedDate}` : 'Earned'} variant="success" size="sm" icon="checkmark-circle" />
                ) : progress ? (
                  <View style={styles.progressWrap}>
                    <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
                      <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: colors.primary }]} />
                    </View>
                    <Text style={[styles.progressText, { color: colors.textLight }]}>
                      {progress.current} / {progress.target}
                    </Text>
                  </View>
                ) : null}
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'center' },
  badgeCard: { width: '47%', alignItems: 'center', padding: spacing.lg, marginBottom: 0 },
  lockedCard: { opacity: 0.85 },
  iconWrap: { marginBottom: spacing.md },
  badgeIcon: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  lockTag: {
    position: 'absolute', top: -2, right: -2,
    width: 22, height: 22, borderRadius: 11,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  badgeTitle: { fontSize: 14, fontWeight: '700', textAlign: 'center', marginBottom: spacing.xs },
  badgeDesc: { fontSize: 11, textAlign: 'center', lineHeight: 16, marginBottom: spacing.sm },
  progressWrap: { alignSelf: 'stretch', marginTop: spacing.xs },
  progressBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 10, fontWeight: '600', textAlign: 'center', marginTop: 4 },
});
