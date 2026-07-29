import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BLOBS = [
  { size: 0.65, top: -0.15, left: -0.1, colorKey: 'aurora1', dur: 7000, rangeX: 0.18, rangeY: 0.08, delay: 0 },
  { size: 0.45, top: 0.12, right: -0.08, colorKey: 'aurora2', dur: 9000, rangeX: 0.12, rangeY: 0.06, delay: 1.2 },
  { size: 0.4, bottom: 0.18, left: 0.12, colorKey: 'aurora3', dur: 11000, rangeX: 0.14, rangeY: 0.07, delay: 2.5 },
  { size: 0.3, bottom: 0.08, right: 0.08, colorKey: 'aurora4', dur: 8000, rangeX: 0.1, rangeY: 0.05, delay: 0.8 },
];

export default function AuroraBackground({ children, style }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, style]}>
      {BLOBS.map((cfg, i) => (
        <AuroraBlob key={i} cfg={cfg} colors={colors} />
      ))}
      <LinearGradient
        colors={['transparent', colors.background]}
        style={styles.fadeBottom}
        pointerEvents="none"
      />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

function AuroraBlob({ cfg, colors }) {
  const progress = useSharedValue(0);
  const color = colors[cfg.colorKey] || 'rgba(20,184,166,0.08)';

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: cfg.dur, easing: Easing.inOut(Easing.sin) }),
      -1, true
    );
  }, []);

  const style = useAnimatedStyle(() => {
    const t = (progress.value + cfg.delay * 0.1) % 1;
    const phase = t * Math.PI * 2;
    const x = Math.sin(phase) * SCREEN_WIDTH * cfg.rangeX;
    const y = Math.cos(phase * 0.7) * SCREEN_HEIGHT * cfg.rangeY;
    const s = 1 + 0.08 * Math.sin(phase * 0.5);

    const posStyle = {};
    if (cfg.top !== undefined) posStyle.top = cfg.top * SCREEN_HEIGHT;
    if (cfg.bottom !== undefined) posStyle.bottom = cfg.bottom * SCREEN_HEIGHT;
    if (cfg.left !== undefined) posStyle.left = cfg.left * SCREEN_WIDTH;
    if (cfg.right !== undefined) posStyle.right = cfg.right * SCREEN_WIDTH;

    return {
      width: cfg.size * SCREEN_WIDTH,
      height: cfg.size * SCREEN_WIDTH,
      borderRadius: (cfg.size * SCREEN_WIDTH) / 2,
      backgroundColor: color,
      ...posStyle,
      transform: [
        { translateX: x },
        { translateY: y },
        { scale: s },
      ],
    };
  });

  return <Animated.View style={[styles.blob, style]} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative' },
  blob: { position: 'absolute', opacity: 0.6 },
  fadeBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
  },
  content: { flex: 1, zIndex: 2 },
});
