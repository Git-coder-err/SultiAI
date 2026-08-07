import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { spacing, borderRadius } from '../../../theme';

interface RecentActivityProps {
  onOpenTutor?: () => void;
}

export function RecentActivity({ onOpenTutor }: RecentActivityProps) {
  const { colors, getAnimationDuration } = useTheme();
  const { history } = useDashboardData();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: getAnimationDuration(600), useNativeDriver: true }).start();
  }, [getAnimationDuration]);

  const items = (Array.isArray(history) && history.length > 0
    ? history.slice(0, 4)
    : []).map((item, idx) => ({
        id: item.id || `hist_${idx}`,
        title: item.title || `Conversation ${idx + 1}`,
        date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '',
        messages: item.messages?.length || 0,
      }));

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Recent Activity</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={onOpenTutor} activeOpacity={0.7}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>Continue</Text>
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        <TouchableOpacity
          style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={onOpenTutor}
          activeOpacity={0.85}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={32} color={colors.textLight} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No conversations yet</Text>
          <Text style={[styles.emptySubtext, { color: colors.textLight }]}>Start learning with SULTI!</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.list}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={onOpenTutor}
              activeOpacity={0.85}
            >
              <View style={[styles.iconWrapper, { backgroundColor: colors.softPurple }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.primary} />
              </View>
              <View style={styles.info}>
                <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                {item.date ? <Text style={[styles.rowDate, { color: colors.textSecondary }]}>{item.date}</Text> : null}
              </View>
              <Text style={[styles.rowCount, { color: colors.textLight }]}>{item.messages} msgs</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  title: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  seeAll: { fontSize: 13, fontWeight: '600' },
  list: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: borderRadius.lg, padding: spacing.md, borderWidth: 1 },
  iconWrapper: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  rowTitle: { fontSize: 14, fontWeight: '600' },
  rowDate: { fontSize: 12, marginTop: 2 },
  rowCount: { fontSize: 12, fontWeight: '500' },
  emptyCard: { alignItems: 'center', padding: spacing.xl, borderRadius: borderRadius.xl, borderWidth: 1, gap: spacing.xs },
  emptyText: { fontSize: 15, fontWeight: '600', marginTop: spacing.sm },
  emptySubtext: { fontSize: 13 },
});
