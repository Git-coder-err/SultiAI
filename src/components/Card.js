import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { borderRadius, spacing, shadows } from '../theme';

export default function Card({
  children, style, variant = 'default', padding = 'md', onPress, glass = false,
}) {
  const { colors } = useTheme();
  const padMap = { sm: spacing.sm, md: spacing.lg, lg: spacing.xl, xl: spacing.xxl };

  const cardStyles = [
    styles.card,
    { backgroundColor: glass ? colors.glassBg : colors.card },
    variant === 'elevated' && { ...shadows.lg },
    variant === 'outlined' && { borderWidth: 1, borderColor: colors.border },
    variant === 'glass' && {
      backgroundColor: colors.glassBg,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      ...shadows.lg,
    },
    { padding: padMap[padding] || spacing.lg },
    style,
  ];

  return (
    <View style={cardStyles}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
});
