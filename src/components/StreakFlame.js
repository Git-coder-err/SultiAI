import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

export default function StreakFlame({ streak, size = 'md' }) {
  const { colors } = useTheme();
  const isLarge = size === 'lg';
  const scale = useSharedValue(1);

  useEffect(() => {
    if (streak > 0) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 800, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        ),
        -1, true
      );
    } else {
      scale.value = 1;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streak]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    transformOrigin: 'center',
  }));

  const flameColor = streak >= 30 ? '#FF6B00' : streak >= 7 ? '#FF9500' : streak >= 3 ? '#FFB347' : '#FFD700';

  return (
    <View style={styles.container}>
      <Animated.View style={animatedStyle}>
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
