import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { useUser } from '../../../context/UserContext';
import { useGame } from '../../../context/GameContext';
import { spacing, borderRadius } from '../../../theme';

interface SmartWelcomeHeaderProps {
  onNotificationPress?: () => void;
  onSettingsPress?: () => void;
  onProfilePress?: () => void;
}

const TRUTHFUL_LINES = [
  'Ready to practice Bisaya today?',
  'A few minutes a day keeps your skills sharp.',
  'Every sentence you speak builds confidence.',
  'New lessons are waiting whenever you are.',
  'Your next streak day starts with a single word.',
];

export function SmartWelcomeHeader({ onNotificationPress, onSettingsPress, onProfilePress }: SmartWelcomeHeaderProps) {
  const { colors, getAnimationDuration } = useTheme();
  const { user } = useUser();
  const { streak, dailyXp, dailyGoal } = useGame();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-10)).current;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const name = (user as any)?.fullname?.split(' ')[0] || 'Learner';

  const safeStreak = Math.max(0, Number(streak) || 0);
  const safeDailyXp = Math.max(0, Number(dailyXp) || 0);
  const safeGoal = Math.max(1, Number(dailyGoal) || 50);

  const motivationalLine =
    safeStreak > 0
      ? `You're on a ${safeStreak}-day streak. Make it ${safeStreak + 1}!`
      : safeDailyXp >= safeGoal
        ? 'Daily goal reached. Amazing work today!'
        : TRUTHFUL_LINES[new Date().getDay() % TRUTHFUL_LINES.length];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: getAnimationDuration(600), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: getAnimationDuration(500), useNativeDriver: true }),
    ]).start();
  }, [getAnimationDuration]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.row}>
        <TouchableOpacity onPress={onProfilePress} style={[styles.avatar, { backgroundColor: colors.softPurple }]}>
          <Ionicons name="person" size={20} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.textGroup}>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>{greeting}</Text>
          <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={onNotificationPress}
            style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
            <View style={[styles.badge, { backgroundColor: colors.error }]} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSettingsPress}
            style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.View style={[styles.motivationCard, { backgroundColor: colors.softTeal, opacity: fadeAnim }]}>
        <Ionicons name="sparkles" size={16} color={colors.accent} style={styles.motivationIcon} />
        <Text style={[styles.motivationText, { color: colors.text }]}>{motivationalLine}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textGroup: { flex: 1 },
  greeting: { fontSize: 13, fontWeight: '500' },
  name: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  motivationIcon: { marginRight: 2 },
  motivationText: { fontSize: 13, fontWeight: '500', flex: 1 },
});
