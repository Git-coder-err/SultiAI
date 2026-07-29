import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import Header from '../components/Header';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { spacing, borderRadius } from '../theme';

const ALL_BADGES = [
  { id: 'first_100_xp', title: 'First Steps', description: 'Earn 100 XP', icon: 'star', color: '#FFD700' },
  { id: 'thousand_xp', title: 'Century', description: 'Earn 1,000 XP', icon: 'trophy', color: '#FF6B00' },
  { id: 'five_thousand_xp', title: 'Dedicated', description: 'Earn 5,000 XP', icon: 'diamond', color: '#8B5CF6' },
  { id: 'streak_3', title: 'Getting Started', description: '3-day streak', icon: 'flame', color: '#FF9500' },
  { id: 'streak_7', title: 'Consistent', description: '7-day streak', icon: 'flame', color: '#FF6B00' },
  { id: 'streak_30', title: 'Unstoppable', description: '30-day streak', icon: 'flame', color: '#FF3B00' },
  { id: 'daily_goal', title: 'Goal Crusher', description: 'Reach daily goal', icon: 'target', color: '#10B981' },
  { id: 'first_lesson', title: 'First Lesson', description: 'Complete your first lesson', icon: 'school', color: '#1E6F9F' },
  { id: 'ten_lessons', title: 'Dedicated Learner', description: 'Complete 10 lessons', icon: 'school', color: '#1E6F9F' },
  { id: 'voice_pioneer', title: 'Voice Pioneer', description: 'Try voice practice', icon: 'mic', color: '#FFB347' },
  { id: 'community_member', title: 'Community Member', description: 'Join the community', icon: 'people', color: '#8B5CF6' },
  { id: 'native_speaker', title: 'Native Speaker', description: 'Verified native Bisaya speaker', icon: 'shield-checkmark', color: '#10B981' },
];

export default function AchievementsScreen({ navigation }) {
  const { colors } = useTheme();
  const { badges } = useGame();

  const earnedIds = new Set(badges.map(b => b.id));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Achievements" subtitle={`${badges.length} of ${ALL_BADGES.length} earned`} leftIcon="arrow-back" onLeftPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          {ALL_BADGES.map((badge) => {
            const earned = earnedIds.has(badge.id);
            return (
              <Card key={badge.id} style={[styles.badgeCard, !earned && styles.earned]} variant={earned ? 'elevated' : 'outlined'}>
                <View style={[styles.badgeIcon, { backgroundColor: earned ? badge.color + '20' : colors.border }]}>
                  <Ionicons name={badge.icon} size={28} color={earned ? badge.color : colors.textLight} />
                </View>
                <Text style={[styles.badgeTitle, { color: earned ? colors.text : colors.textLight }]}>{badge.title}</Text>
                <Text style={[styles.badgeDesc, { color: earned ? colors.textSecondary : colors.textLight }]}>{badge.description}</Text>
                {earned && (
                  <Badge title="Earned" variant="success" size="sm" />
                )}
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
  earned: { opacity: 0.6 },
  badgeIcon: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  badgeTitle: { fontSize: 14, fontWeight: '700', textAlign: 'center', marginBottom: spacing.xs },
  badgeDesc: { fontSize: 11, textAlign: 'center', lineHeight: 16, marginBottom: spacing.sm },
});
