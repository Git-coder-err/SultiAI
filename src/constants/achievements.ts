export const ACHIEVEMENTS = [
  {
    id: 'first_100_xp',
    title: 'First Steps',
    description: 'Earn your first 100 XP',
    icon: 'star' as const,
    xpReward: 50,
    coinReward: 20,
    condition: { type: 'xp_threshold' as const, value: 100 },
  },
  {
    id: 'thousand_xp',
    title: 'Century',
    description: 'Earn 1,000 XP',
    icon: 'trophy' as const,
    xpReward: 200,
    coinReward: 100,
    condition: { type: 'xp_threshold' as const, value: 1000 },
  },
  {
    id: 'five_thousand_xp',
    title: 'Dedicated',
    description: 'Earn 5,000 XP',
    icon: 'diamond' as const,
    xpReward: 500,
    coinReward: 250,
    condition: { type: 'xp_threshold' as const, value: 5000 },
  },
  {
    id: 'streak_3',
    title: 'Getting Started',
    description: 'Maintain a 3-day streak',
    icon: 'sparkles' as const,
    xpReward: 50,
    coinReward: 30,
    condition: { type: 'streak' as const, value: 3 },
  },
  {
    id: 'streak_7',
    title: 'Consistent',
    description: 'Maintain a 7-day streak',
    icon: 'calendar' as const,
    xpReward: 100,
    coinReward: 50,
    condition: { type: 'streak' as const, value: 7 },
  },
  {
    id: 'streak_30',
    title: 'Unstoppable',
    description: 'Maintain a 30-day streak',
    icon: 'crown' as const,
    xpReward: 500,
    coinReward: 200,
    condition: { type: 'streak' as const, value: 30 },
  },
  {
    id: 'daily_goal',
    title: 'Goal Crusher',
    description: 'Reach your daily XP goal',
    icon: 'target' as const,
    xpReward: 50,
    coinReward: 25,
    condition: { type: 'daily_goal' as const },
  },
] as const;

export type AchievementId = (typeof ACHIEVEMENTS)[number]['id'];

export function checkAchievementCondition(
  achievement: (typeof ACHIEVEMENTS)[number],
  stats: { xp: number; streak: number; dailyXp: number; dailyGoal: number; source?: string }
): boolean {
  switch (achievement.condition.type) {
    case 'xp_threshold':
      return stats.xp >= achievement.condition.value;
    case 'streak':
      return stats.streak >= achievement.condition.value;
    case 'daily_goal':
      return stats.source === 'lesson' && stats.dailyXp >= stats.dailyGoal;
    default:
      return false;
  }
}
