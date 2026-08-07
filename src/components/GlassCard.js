import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, shadows } from '../theme';

export default function GlassCard({
  children, style, variant = 'default', intensity = 30,
  gradientBorder = false, glowColor, padding = 'lg', floating = false,
}) {
  const { colors, isDark } = useTheme();
  const padMap = { sm: spacing.sm, md: spacing.lg, lg: spacing.xl, xl: spacing.xxl, huge: spacing.huge };

  const baseStyle = [
    styles.base,
    { padding: padMap[padding] || spacing.xl },
    style,
  ];

  if (Platform.OS === 'web') {
    return (
      <View style={[
        styles.webGlass,
        { backgroundColor: colors.glassBg, borderColor: colors.glassBorder },
        variant === 'elevated' && styles.elevated,
        variant === 'tinted' && { backgroundColor: colors.primary + '10', borderColor: colors.primary + '20' },
        floating && styles.floatShadow,
        baseStyle,
      ]}>
        <View style={[styles.shine, { backgroundColor: colors.glassHighlight }]} />
        {children}
      </View>
    );
  }

  return (
    <BlurView
      intensity={intensity}
      tint={isDark ? 'dark' : 'light'}
      style={[
        styles.base,
        styles.inner,
        variant === 'elevated' && styles.elevated,
        variant === 'tinted' && { backgroundColor: colors.primary + '10' },
        floating && styles.floatShadow,
        baseStyle,
      ]}>
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    ...shadows.lg,
  },
  inner: {
    overflow: 'hidden',
    borderRadius: borderRadius.xl,
  },
  webGlass: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },
  elevated: {
    ...shadows.xl,
  },
  floatShadow: {
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    elevation: 10,
  },
  shine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
    borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl,
    opacity: 0.3,
  },
});
