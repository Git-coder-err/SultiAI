import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme';

export default function ProgressRing({
  progress = 0, size = 100, strokeWidth = 8, color, trackColor,
  label, showPercent = true, children,
}) {
  const { colors } = useTheme();
  const c = color || colors.primary;
  const t = trackColor || colors.border;
  const dim = size;
  const radius = (dim - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressVal = Math.min(Math.max(progress, 0), 1);
  const offset = circumference * (1 - progressVal);

  return (
    <View style={[styles.container, { width: dim, height: dim }]}>
      <Svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        <Circle
          cx={dim / 2} cy={dim / 2} r={radius}
          fill="none" stroke={t} strokeWidth={strokeWidth}
        />
        <Circle
          cx={dim / 2} cy={dim / 2} r={radius}
          fill="none" stroke={c} strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${dim / 2}, ${dim / 2}`}
        />
      </Svg>
      <View style={styles.content}>
        {children || (
          showPercent && (
            <Text style={[styles.percent, { color: c }]}>
              {Math.round(progressVal * 100)}%
            </Text>
          )
        )}
        {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center' },
  content: { position: 'absolute', alignItems: 'center' },
  percent: { fontSize: 20, fontWeight: '800', ...typography.h3 },
  label: { fontSize: 11, fontWeight: '500', marginTop: 2 },
});
