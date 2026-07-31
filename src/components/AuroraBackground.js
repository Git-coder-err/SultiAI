import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';

const BLOBS = [
  { size: 0.65, top: -0.15, left: -0.1, colorKey: 'aurora1', dur: 7000, rangeX: 0.18, rangeY: 0.08, delay: 0, opacity: 0.5 },
  { size: 0.45, top: 0.12, right: -0.08, colorKey: 'aurora2', dur: 9000, rangeX: 0.12, rangeY: 0.06, delay: 1.2, opacity: 0.45 },
  { size: 0.4, bottom: 0.18, left: 0.12, colorKey: 'aurora3', dur: 11000, rangeX: 0.14, rangeY: 0.07, delay: 2.5, opacity: 0.4 },
  { size: 0.3, bottom: 0.08, right: 0.08, colorKey: 'aurora4', dur: 8000, rangeX: 0.1, rangeY: 0.05, delay: 0.8, opacity: 0.35 },
];

const PARTICLE_COUNT = 15;

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function Particle({ particle, width, height }) {
  const anim = useSharedValue(0);

  useEffect(() => {
    anim.value = withRepeat(
      withTiming(1, { duration: particle.dur, easing: Easing.inOut(Easing.sin) }),
      -1, true
    );
  }, []);

  const style = useAnimatedStyle(() => {
    const yOff = -height * 0.15 * anim.value;
    const fade = (0.4 + 0.3 * Math.sin(anim.value * Math.PI)) * particle.opacity;
    const xOff = Math.sin(anim.value * Math.PI * 2) * 20;
    return {
      width: particle.size, height: particle.size,
      borderRadius: particle.size / 2,
      backgroundColor: particle.color,
      opacity: fade,
      position: 'absolute',
      left: particle.x + xOff,
      top: particle.y + yOff,
    };
  });

  return <Animated.View style={style} />;
}

export default function AuroraBackground({ children, style }) {
  const { colors } = useTheme();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();

  const particles = useMemo(() => {
    const r = seededRandom(99);
    const colorKeys = ['aurora1', 'aurora2', 'aurora3'];
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      x: r() * SCREEN_WIDTH,
      y: r() * SCREEN_HEIGHT,
      size: 1.5 + r() * 2.5,
      dur: 4000 + r() * 4000,
      opacity: 0.3 + r() * 0.4,
      color: colors[colorKeys[i % 3]] || colors.primary + '60',
    }));
  }, [SCREEN_WIDTH, SCREEN_HEIGHT]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, style]}>
      {BLOBS.map((cfg, i) => (
        <AuroraBlob key={i} cfg={cfg} colors={colors} screenWidth={SCREEN_WIDTH} screenHeight={SCREEN_HEIGHT} />
      ))}
      {particles.map((p, i) => (
        <Particle key={i} particle={p} width={SCREEN_WIDTH} height={SCREEN_HEIGHT} />
      ))}
      {Platform.OS !== 'web' && (
        <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="default" pointerEvents="none" />
      )}
      <LinearGradient
        colors={['transparent', colors.background]}
        style={[styles.fadeBottom, { height: 120 }]}
        pointerEvents="none"
      />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

function AuroraBlob({ cfg, colors, screenWidth, screenHeight }) {
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
    const x = Math.sin(phase) * screenWidth * cfg.rangeX;
    const y = Math.cos(phase * 0.7) * screenHeight * cfg.rangeY;
    const s = 1 + 0.08 * Math.sin(phase * 0.5);

    const posStyle = {};
    if (cfg.top !== undefined) posStyle.top = cfg.top * screenHeight;
    if (cfg.bottom !== undefined) posStyle.bottom = cfg.bottom * screenHeight;
    if (cfg.left !== undefined) posStyle.left = cfg.left * screenWidth;
    if (cfg.right !== undefined) posStyle.right = cfg.right * screenWidth;

    return {
      width: cfg.size * screenWidth,
      height: cfg.size * screenWidth,
      borderRadius: (cfg.size * screenWidth) / 2,
      backgroundColor: color,
      opacity: cfg.opacity || 0.6,
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
  blob: { position: 'absolute' },
  fadeBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
  },
  content: { flex: 1, zIndex: 2 },
});
