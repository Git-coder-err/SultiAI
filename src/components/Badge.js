import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { borderRadius, spacing } from '../theme';

export default function Badge({ title, icon, color, variant = 'default', size = 'sm' }) {
  const { colors } = useTheme();
  const isLarge = size === 'lg';
  const bgMap = {
    default: colors.primaryLight,
    success: colors.success + '20',
    warning: colors.accent + '20',
    error: colors.error + '20',
    info: colors.primaryLight,
  };
  const textMap = {
    default: colors.primary,
    success: colors.success,
    warning: colors.accent,
    error: colors.error,
    info: colors.primary,
  };
  const bg = bgMap[variant] || bgMap.default;
  const tc = textMap[variant] || textMap.default;
  const finalColor = color || tc;

  return (
    <View style={[styles.badge, { backgroundColor: bg }, isLarge && styles.badgeLarge]}>
      {icon && <Ionicons name={icon} size={isLarge ? 16 : 12} color={finalColor} style={{ marginRight: 4 }} />}
      {title && <Text style={[styles.text, { color: finalColor }, isLarge && styles.textLarge]}>{title}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.full, paddingHorizontal: 10, paddingVertical: 4 },
  badgeLarge: { paddingHorizontal: 14, paddingVertical: 6 },
  text: { fontSize: 11, fontWeight: '700' },
  textLarge: { fontSize: 13 },
});
