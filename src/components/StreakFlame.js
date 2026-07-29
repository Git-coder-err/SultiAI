import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function StreakFlame({ streak, size = 'md' }) {
  const { colors } = useTheme();
  const pulse = useRef(new Animated.Value(1)).current;
  const isLarge = size === 'lg';

  useEffect(() => {
    if (streak > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [streak]);

  const flameColor = streak >= 30 ? '#FF6B00' : streak >= 7 ? '#FF9500' : streak >= 3 ? '#FFB347' : '#FFD700';

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <Ionicons name="flame" size={isLarge ? 32 : 24} color={flameColor} />
      </Animated.View>
      <Text style={[styles.count, { color: flameColor }, isLarge && styles.countLarge]}>
        {streak}
      </Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>day streak</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  count: { fontSize: 18, fontWeight: '800' },
  countLarge: { fontSize: 24 },
  label: { fontSize: 12, fontWeight: '500' },
});
