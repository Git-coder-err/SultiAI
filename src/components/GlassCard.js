import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { borderRadius, spacing, shadows, gradients } from '../theme';
import { BlurView } from 'expo-blur';

export default function GlassCard({
  children, style, variant = 'default', intensity = 30,
  gradientBorder = false, glowColor, padding = 'lg',
}) {
  const { colors } = useTheme();
  const padMap = { sm: spacing.sm, md: spacing.lg, lg: spacing.xl, xl: spacing.xxl, huge: spacing.huge };

  const glassStyle = [
    styles.base,
    { padding: padMap[padding] || spacing.xl },
    style,
  ];

  const content = (
    <View style={glassStyle}>
      {children}
    </View>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={[
        styles.webGlass,
        { backgroundColor: colors.glassBg, borderColor: colors.glassBorder },
        variant === 'elevated' && styles.elevated,
        variant === 'tinted' && { backgroundColor: 'rgba(20,184,166,0.08)', borderColor: 'rgba(20,184,166,0.15)' },
        glassStyle,
      ]}>
        <View style={[styles.shine, { backgroundColor: colors.glassHighlight }]} />
        {children}
      </View>
    );
  }

  return (
    <BlurView intensity={intensity} tint="light" style={[
      styles.base,
      variant === 'elevated' && styles.elevated,
      variant === 'tinted' && { backgroundColor: 'rgba(20,184,166,0.08)' },
      glassStyle,
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
    overflow: 'hidden',
    ...shadows.lg,
  },
  webGlass: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },
  elevated: {
    ...shadows.xl,
  },
  shine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
    borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl,
    opacity: 0.3,
  },
});
