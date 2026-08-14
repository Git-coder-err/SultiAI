import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { useGame } from '../../../context/GameContext';
import { api } from '../../../services/api';
import { spacing, borderRadius } from '../../../theme';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function toDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function lastSevenDays() {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(toDateKey(d));
  }
  return days;
}

export function WeeklyActivity() {
  const { colors, getAnimationDuration } = useTheme();
  const { streak } = useGame();
  const [activeDates, setActiveDates] = useState<string[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.getStreakData();
        if (mounted && data && Array.isArray(data.activeDates)) {
          setActiveDates(data.activeDates);
        }
      } catch {
      }
    })();
    Animated.timing(fadeAnim, { toValue: 1, duration: getAnimationDuration(600), useNativeDriver: true }).start();
    return () => {
      mounted = false;
    };
  }, [getAnimationDuration]);

  const week = lastSevenDays();
  const activeSet = new Set(activeDates);
  const activeThisWeek = week.filter((d) => activeSet.has(d)).length;

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim }]}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.header}>
          <View style={[styles.iconWrapper, { backgroundColor: colors.softOrange }]}>
            <Ionicons name="flame" size={18} color={colors.secondary} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.text }]}>Learning Streak</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {streak > 0
                ? `${streak} day${streak === 1 ? '' : 's'} in a row`
                : activeThisWeek > 0
                  ? `${activeThisWeek} active day${activeThisWeek === 1 ? '' : 's'} this week`
                  : 'Practice today to start your streak'}
            </Text>
          </View>
        </View>

        <View style={styles.weekRow}>
          {week.map((dateKey, i) => {
            const active = activeSet.has(dateKey);
            const isToday = i === week.length - 1;
            return (
              <View key={dateKey} style={styles.dayItem}>
                <Text style={[styles.dayLabel, { color: isToday ? colors.primary : colors.textSecondary }]}>
                  {DAY_LABELS[i]}
                </Text>
                <View
                  style={[
                    styles.dayDot,
                    {
                      backgroundColor: active
                        ? colors.success
                        : isToday
                          ? colors.softOrange
                          : colors.surfaceSecondary,
                      borderColor: active ? colors.success : colors.border,
                    },
                  ]}
                >
                  <Ionicons name={active ? 'checkmark' : isToday ? 'ellipse' : 'ellipse-outline'} size={12} color={active ? '#fff' : colors.textLight} />
                </View>
              </View>
            );
          })}
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
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayItem: { alignItems: 'center', gap: spacing.xs },
  dayLabel: { fontSize: 11, fontWeight: '700' },
  dayDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
