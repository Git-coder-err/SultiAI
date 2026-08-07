import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { spacing, borderRadius } from '../../../theme';

interface LearningAnalyticsProps {}

const WEEKLY_DATA = [30, 45, 20, 60, 40, 55, 35];
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function LearningAnalytics({}: LearningAnalyticsProps) {
  const { colors, getAnimationDuration } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: getAnimationDuration(600), useNativeDriver: true }).start();
  }, [getAnimationDuration]);

  const maxVal = Math.max(...WEEKLY_DATA);

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim }]}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.header}>
          <View style={[styles.iconWrapper, { backgroundColor: colors.softTeal }]}>
            <Ionicons name="analytics" size={18} color={colors.accent} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.text }]}>Learning Analytics</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Your weekly activity</Text>
          </View>
        </View>

        <View style={styles.chart}>
          {WEEKLY_DATA.map((val, i) => (
            <View key={i} style={styles.barGroup}>
              <View style={[styles.barTrack, { backgroundColor: colors.surfaceSecondary }]}>
                <Animated.View
                  style={[
                    styles.barFill,
                    {
                      height: `${(val / maxVal) * 100}%`,
                      backgroundColor: i === WEEKLY_DATA.length - 1 ? colors.primary : colors.accent + '60',
                    },
                  ]}
                />
              </View>
              <Text style={[styles.dayLabel, { color: colors.textLight }]}>{DAYS[i]}</Text>
            </View>
          ))}
        </View>

        <View style={styles.insights}>
          <View style={styles.insightItem}>
            <Ionicons name="flame" size={14} color={colors.secondary} />
            <Text style={[styles.insightText, { color: colors.textSecondary }]}>Most active: Wednesday</Text>
          </View>
          <View style={styles.insightItem}>
            <Ionicons name="star" size={14} color={colors.warning} />
            <Text style={[styles.insightText, { color: colors.textSecondary }]}>Favorite: Greetings</Text>
          </View>
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
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 80, gap: spacing.xs },
  barGroup: { flex: 1, alignItems: 'center', gap: spacing.xs },
  barTrack: { width: '100%', height: 60, borderRadius: 4, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 4 },
  dayLabel: { fontSize: 10, fontWeight: '600' },
  insights: { gap: spacing.xs },
  insightItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  insightText: { fontSize: 12, fontWeight: '500' },
});
