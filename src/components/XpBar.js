import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, Easing,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme';

export default function XpBar({ current, max, label, showLabel = true, color, height = 8 }) {
  const { colors } = useTheme();
  const progress = max > 0 ? Math.min(current / max, 1) : 0;
  const animatedWidth = useSharedValue(0);
  const c = color || colors.accent;

  useEffect(() => {
    animatedWidth.value = withTiming(progress * 100, {
      duration: 800,
      easing: Easing.out(Easing.quad),
    });
  }, [progress, animatedWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  return (
    <View style={styles.container}>
      {showLabel && label && (
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
          <Text style={[styles.value, { color: colors.text }]}>{current} / {max}</Text>
        </View>
      )}
      <View style={[styles.track, { height, backgroundColor: colors.border, borderRadius: height / 2 }]}>
        <Animated.View style={[styles.fill, { height, backgroundColor: c, borderRadius: height / 2 }, animatedStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  label: { fontSize: 12, fontWeight: '500' },
  value: { fontSize: 12, fontWeight: '600' },
  track: { overflow: 'hidden' },
  fill: { position: 'absolute', left: 0, top: 0 },
});
