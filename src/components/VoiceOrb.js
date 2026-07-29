import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming,
  withSequence, withDelay, cancelAnimation, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';

const WAVE_BAR_COUNT = 16;
const PARTICLE_COUNT = 8;

const waveBarData = Array.from({ length: WAVE_BAR_COUNT }, (_, i) => ({
  angle: (i / WAVE_BAR_COUNT) * Math.PI,
  width: 3 + Math.random() * 2,
  phase: Math.random() * Math.PI * 2,
}));

const particleData = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  x: Math.cos((i / PARTICLE_COUNT) * Math.PI * 2) * (40 + Math.random() * 30),
  y: Math.sin((i / PARTICLE_COUNT) * Math.PI * 2) * (40 + Math.random() * 30),
  size: 3 + Math.random() * 4,
  dur: 3000 + Math.random() * 3000,
  delay: Math.random() * 2000,
}));

export default function VoiceOrb({ state = 'idle', size = 280, colors }) {
  const { colors: themeColors } = useTheme();
  const c = colors || themeColors;

  const pulse = useSharedValue(0.96);
  const glow = useSharedValue(0.6);
  const ringScale = useSharedValue(0.85);
  const ringAlpha = useSharedValue(0.3);
  const rotation = useSharedValue(0);
  const waveIntensity = useSharedValue(0);

  const halfSize = size / 2;

  useEffect(() => {
    cancelAnimation(pulse);
    cancelAnimation(glow);
    cancelAnimation(ringScale);
    cancelAnimation(ringAlpha);
    cancelAnimation(rotation);
    cancelAnimation(waveIntensity);

    switch (state) {
      case 'idle':
        pulse.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }), -1, true);
        glow.value = withRepeat(withTiming(0.5, { duration: 2000, easing: Easing.inOut(Easing.sin) }), -1, true);
        ringScale.value = 0.85; ringAlpha.value = 0.3; waveIntensity.value = 0;
        rotation.value = withRepeat(withTiming(360, { duration: 20000, easing: Easing.linear }), -1, false);
        break;
      case 'listening':
        pulse.value = withRepeat(withTiming(1.05, { duration: 600, easing: Easing.inOut(Easing.sin) }), -1, true);
        glow.value = withRepeat(withTiming(0.9, { duration: 600, easing: Easing.inOut(Easing.sin) }), -1, true);
        ringScale.value = withRepeat(withSequence(withTiming(1.1, { duration: 800 }), withTiming(0.9, { duration: 800 })), -1, false);
        ringAlpha.value = withRepeat(withSequence(withTiming(0.5, { duration: 800 }), withTiming(0.2, { duration: 800 })), -1, false);
        waveIntensity.value = withRepeat(withTiming(0.6, { duration: 400, easing: Easing.inOut(Easing.sin) }), -1, true);
        rotation.value = withRepeat(withTiming(360, { duration: 15000, easing: Easing.linear }), -1, false);
        break;
      case 'speaking':
        pulse.value = withRepeat(withTiming(1.08, { duration: 400, easing: Easing.inOut(Easing.sin) }), -1, true);
        glow.value = withRepeat(withTiming(1, { duration: 400, easing: Easing.inOut(Easing.sin) }), -1, true);
        ringScale.value = withRepeat(withSequence(withTiming(1.25, { duration: 300 }), withTiming(1.05, { duration: 500 })), -1, false);
        ringAlpha.value = withRepeat(withSequence(withTiming(0.6, { duration: 300 }), withTiming(0.2, { duration: 500 })), -1, false);
        waveIntensity.value = withRepeat(withTiming(1, { duration: 300, easing: Easing.inOut(Easing.sin) }), -1, true);
        rotation.value = withRepeat(withTiming(360, { duration: 12000, easing: Easing.linear }), -1, false);
        break;
      case 'thinking':
        pulse.value = withRepeat(withTiming(0.98, { duration: 1200, easing: Easing.inOut(Easing.sin) }), -1, true);
        glow.value = withRepeat(withTiming(0.7, { duration: 1200, easing: Easing.inOut(Easing.sin) }), -1, true);
        ringScale.value = 0.9; ringAlpha.value = 0.2; waveIntensity.value = 0;
        rotation.value = withRepeat(withTiming(-360, { duration: 25000, easing: Easing.linear }), -1, false);
        break;
    }
    return () => { cancelAnimation(pulse); cancelAnimation(glow); cancelAnimation(rotation); };
  }, [state]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    width: size, height: size, borderRadius: halfSize,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    width: size * 1.6, height: size * 1.6, borderRadius: size * 0.8,
    opacity: glow.value * 0.35,
  }));

  const ring1Style = useAnimatedStyle(() => ({
    width: size * ringScale.value, height: size * ringScale.value,
    borderRadius: (size * ringScale.value) / 2, opacity: ringAlpha.value,
    borderWidth: 1.5, borderColor: c.primary + '60', position: 'absolute',
  }));

  const ring2Style = useAnimatedStyle(() => ({
    width: size * (ringScale.value * 0.92), height: size * (ringScale.value * 0.92),
    borderRadius: (size * (ringScale.value * 0.92)) / 2, opacity: ringAlpha.value * 0.5,
    borderWidth: 1.5, borderColor: c.primary + '40', position: 'absolute',
  }));

  const ring3Style = useAnimatedStyle(() => ({
    width: size * (ringScale.value * 0.84), height: size * (ringScale.value * 0.84),
    borderRadius: (size * (ringScale.value * 0.84)) / 2, opacity: ringAlpha.value * 0.25,
    borderWidth: 1.5, borderColor: c.primary + '20', position: 'absolute',
  }));

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={[styles.wrapper, { width: size * 2, height: size * 2 }]}>
      <Animated.View style={[glowStyle, styles.glowBase, { backgroundColor: c.primary + '40' }]} />
      <Animated.View style={ring3Style} />
      <Animated.View style={ring2Style} />
      <Animated.View style={ring1Style} />

      {state === 'speaking' && (
        <WaveBars intensity={waveIntensity} size={size} halfSize={halfSize} color={c.primary} />
      )}

      <Animated.View style={[styles.liquidContainer, { width: size, height: size, borderRadius: halfSize }, rotateStyle]}>
        <View style={[StyleSheet.absoluteFill, { borderRadius: halfSize, overflow: 'hidden' }]}>
          <LiquidBlob size={size} color1={c.primary} color2={c.secondary} offsetIndex={0} halfSize={halfSize} />
          <LiquidBlob size={size} color1={c.primary} color2={c.accent} offsetIndex={1} halfSize={halfSize} />
          <LiquidBlob size={size} color1={c.secondary} color2={c.primary} offsetIndex={2} halfSize={halfSize} />
        </View>
        {Platform.OS !== 'web' && (
          <BlurView intensity={40} style={[StyleSheet.absoluteFill, { borderRadius: halfSize }]} tint="light" />
        )}
      </Animated.View>

      <Animated.View style={[styles.orbCore, orbStyle]}>
        <LinearGradient colors={[c.primary, c.secondary]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: halfSize }]} />
        <View style={[StyleSheet.absoluteFill, { borderRadius: halfSize }, styles.coreShine]}>
          <LinearGradient colors={['rgba(255,255,255,0.3)', 'transparent']} style={[StyleSheet.absoluteFill, { borderRadius: halfSize, top: 0, left: 0, right: 0, height: '50%' }]} />
        </View>
      </Animated.View>

      <Particles halfSize={halfSize} color={c.primary} />

      {state === 'listening' && (
        <View style={[styles.listeningRing, { width: size * 0.28, height: size * 0.28, borderRadius: size * 0.14, borderColor: c.primary + '80' }]} />
      )}
    </View>
  );
}

function LiquidBlob({ size, color1, color2, offsetIndex, halfSize }) {
  const offset = useSharedValue(0);

  useEffect(() => {
    const durations = [4000, 5000, 3500];
    offset.value = withRepeat(withTiming(1, { duration: durations[offsetIndex] || 4000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, []);

  const blobStyle = useAnimatedStyle(() => {
    const angle = offset.value * Math.PI * 2 + offsetIndex * 2.1;
    const dist = size * (0.15 + offsetIndex * 0.04);
    const x = Math.cos(angle) * dist;
    const y = Math.sin(angle * 0.7) * dist * 0.6;
    const s = 0.6 + 0.15 * Math.sin(offset.value * Math.PI * 2 + offsetIndex);
    return {
      width: size * 0.55, height: size * 0.55, borderRadius: size * 0.275,
      position: 'absolute',
      left: halfSize - size * 0.275 + x,
      top: halfSize - size * 0.275 + y,
      transform: [{ scale: s }],
    };
  });

  return (
    <Animated.View style={blobStyle}>
      <LinearGradient colors={[color1, color2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: size * 0.275, opacity: 0.7 }]} />
    </Animated.View>
  );
}

function WaveBars({ intensity, size, halfSize, color }) {
  return waveBarData.map((bar, i) => (
    <WaveBar key={i} bar={bar} intensity={intensity} size={size} halfSize={halfSize} color={color} />
  ));
}

function WaveBar({ bar, intensity, halfSize, color }) {
  const style = useAnimatedStyle(() => {
    const raw = Math.sin((intensity.value * Math.PI * 2) + bar.phase) * 0.5 + 0.5;
    const h = Math.max(4, raw * 30);
    const radius = halfSize + 4;
    const x = halfSize + Math.cos(bar.angle) * radius - bar.width / 2;
    const y = halfSize + Math.sin(bar.angle) * radius;
    return {
      width: bar.width, height: h,
      backgroundColor: color + 'CC',
      borderRadius: bar.width / 2,
      position: 'absolute', left: x, top: y,
    };
  });

  return <Animated.View style={style} />;
}

function Particles({ halfSize, color }) {
  return particleData.map((p, i) => (
    <ParticleItem key={i} data={p} halfSize={halfSize} color={color} />
  ));
}

function ParticleItem({ data, halfSize, color }) {
  const anim = useSharedValue(0);

  useEffect(() => {
    anim.value = withRepeat(withSequence(
      withDelay(data.delay, withTiming(1, { duration: data.dur, easing: Easing.inOut(Easing.sin) })),
      withTiming(0, { duration: data.dur, easing: Easing.inOut(Easing.sin) }),
    ), -1, false);
  }, []);

  const style = useAnimatedStyle(() => {
    const progress = anim.value;
    const yOff = -60 * progress;
    const fade = 0.6 * (1 - progress * 0.6);
    return {
      width: data.size, height: data.size, borderRadius: data.size / 2,
      backgroundColor: color,
      opacity: fade,
      position: 'absolute',
      left: halfSize + data.x - data.size / 2,
      top: halfSize + data.y + yOff - data.size / 2,
    };
  });

  return <Animated.View style={style} />;
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', top: '50%', left: '50%', marginLeft: -140, marginTop: -140, alignItems: 'center', justifyContent: 'center' },
  glowBase: { position: 'absolute' },
  liquidContainer: { position: 'absolute', overflow: 'hidden' },
  orbCore: { position: 'absolute', overflow: 'hidden', shadowColor: '#14B8A6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10 },
  coreShine: { zIndex: 2 },
  listeningRing: { position: 'absolute', borderWidth: 2 },
});
