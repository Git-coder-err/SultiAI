import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { borderRadius, spacing } from '../theme';

export default function XpBar({ current, max, label, showLabel = true, color, height = 8 }) {
  const { colors } = useTheme();
  const anim = useRef(new Animated.Value(0)).current;
  const c = color || colors.accent;
  const progress = max > 0 ? Math.min(current / max, 1) : 0;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: progress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const widthInterpolated = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {showLabel && label && (
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
          <Text style={[styles.value, { color: colors.text }]}>{current} / {max}</Text>
        </View>
      )}
      <View style={[styles.track, { height, backgroundColor: colors.border, borderRadius: height / 2 }]}>
        <Animated.View style={[styles.fill, { width: widthInterpolated, height, backgroundColor: c, borderRadius: height / 2 }]} />
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
