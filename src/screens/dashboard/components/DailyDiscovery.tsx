import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { spacing, borderRadius, shadows } from '../../../theme';

interface DailyDiscoveryProps {
  onLearnMore?: () => void;
}

const DISCOVERIES = [
  { type: 'Cultural Fact', title: 'The Sinulog Festival', description: 'Cebu\'s biggest celebration honors the Santo Niño with vibrant dances every January.', icon: 'color-palette' },
  { type: 'Useful Expression', title: 'Palihog', description: 'Means "please" in Bisaya. Use it to politely ask for anything.', icon: 'hand-left' },
  { type: 'Common Mistake', title: 'Ko vs. Ko', description: '"Ako" means "I/Me" while "ko" is a contraction. Mind the spelling!', icon: 'alert-circle' },
  { type: 'Idiom', title: 'Walay Sapayan', description: "Literally 'no matter' — used to express that something is okay or forgivable.", icon: 'chatbubble' },
  { type: 'Travel Tip', title: 'Jeepney Routes', description: 'Look for the route number on the side. Ask the driver "Maka-abot sa [place]?"', icon: 'bus' },
];

export function DailyDiscovery({ onLearnMore }: DailyDiscoveryProps) {
  const { colors, getAnimationDuration } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const today = DISCOVERIES[new Date().getDate() % DISCOVERIES.length];

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: getAnimationDuration(600), useNativeDriver: true }).start();
  }, [getAnimationDuration]);

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim }]}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, ...shadows.card }]}>
        <View style={styles.header}>
          <View style={[styles.iconWrapper, { backgroundColor: colors.softOrange }]}>
            <Ionicons name="compass" size={18} color={colors.secondary} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.text }]}>Cultural Discovery</Text>
            <Text style={[styles.didYouKnow, { color: colors.textSecondary }]}>Did you know?</Text>
          </View>
          <View style={[styles.typeBadge, { backgroundColor: colors.softPurple }]}>
            <Text style={[styles.typeText, { color: colors.primary }]}>{today.type}</Text>
          </View>
        </View>

        <Text style={[styles.discoveryTitle, { color: colors.text }]}>{today.title}</Text>
        <Text style={[styles.discoveryDesc, { color: colors.textSecondary }]}>{today.description}</Text>

        <View style={styles.footer}>
          <Ionicons name="calendar-outline" size={12} color={colors.textLight} />
          <Text style={[styles.footerText, { color: colors.textLight }]}>Come back tomorrow for a new discovery!</Text>
        </View>

        {onLearnMore && (
          <TouchableOpacity
            style={[styles.learnMore, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
            onPress={onLearnMore}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <Text style={[styles.learnMoreText, { color: colors.primary }]}>Learn more</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: spacing.xl, marginBottom: spacing.xl },
  card: { borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrapper: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  didYouKnow: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  typeBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: borderRadius.full },
  typeText: { fontSize: 10, fontWeight: '600' },
  discoveryTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  discoveryDesc: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  footerText: { fontSize: 11, fontWeight: '500' },
  learnMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },
  learnMoreText: { fontSize: 13, fontWeight: '700' },
});