import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { spacing, borderRadius } from '../../../theme';

interface AIChatTutorProps {
  onOpenTutor?: () => void;
}

const QUICK_ACTIONS = [
  { icon: 'language', label: 'Translate', color: '#5B5FEF' },
  { icon: 'book', label: 'Grammar', color: '#2EC4B6' },
  { icon: 'chatbubbles', label: 'Practice', color: '#FF8A65' },
  { icon: 'airplane', label: 'Travel', color: '#F59E0B' },
  { icon: 'briefcase', label: 'Business', color: '#8B5CF6' },
];

export function AIChatTutor({ onOpenTutor }: AIChatTutorProps) {
  const { colors, getAnimationDuration } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: getAnimationDuration(600), useNativeDriver: true }).start();
  }, [getAnimationDuration]);

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim }]}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.header}>
          <View style={[styles.iconWrapper, { backgroundColor: colors.softPurple }]}>
            <Ionicons name="sparkles" size={18} color={colors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.text }]}>AI Chat Tutor</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Ask anything about Cebuano.</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActions}>
          {QUICK_ACTIONS.map((action, i) => (
            <TouchableOpacity key={i} style={[styles.quickAction, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]} activeOpacity={0.8}>
              <Ionicons name={action.icon as any} size={16} color={action.color} />
              <Text style={[styles.quickActionText, { color: colors.text }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={[styles.ctaButton, { backgroundColor: colors.primary }]} onPress={onOpenTutor} activeOpacity={0.85}>
          <Text style={styles.ctaText}>Open AI Tutor</Text>
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
  quickActions: { gap: spacing.sm, paddingVertical: spacing.xs },
  quickAction: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.lg, borderWidth: 1, marginRight: spacing.sm },
  quickActionText: { fontSize: 13, fontWeight: '600' },
  ctaButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.md, borderRadius: borderRadius.xl },
  ctaText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
