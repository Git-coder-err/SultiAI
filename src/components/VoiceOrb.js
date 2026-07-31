import React, { useEffect, useMemo } from 'react';
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

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const rand = seededRandom(42);

const waveBarData = Array.from({ length: WAVE_BAR_COUNT }, (_, i) => ({
  angle: (i / WAVE_BAR_COUNT) * Math.PI,
  width: 3 + rand() * 2,
  phase: rand() * Math.PI * 2,
}));

const particleData = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  x: Math.cos((i / PARTICLE_COUNT) * Math.PI * 2) * (40 + rand() * 30),
  y: Math.sin((i / PARTICLE_COUNT) * Math.PI * 2) * (40 + rand() * 30),
  size: 3 + rand() * 4,
  dur: 3000 + rand() * 3000,
  delay: rand() * 2000,
}));

function FluidTransition({ from, to, sharedVal }) {
  useEffect(() => {
    cancelAnimation(sharedVal);
    if (from === 'idle' && to === 'speaking') {
      sharedVal.value = withSequence(
        withTiming(0.3, { duration: 150 }),
        withTiming(1, { duration: 250 }),
      );
    } else if (to === 'idle') {
      sharedVal.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.sin) });
    } else {
      sharedVal.value = withTiming(1, { duration: 300 });
    }
  }, [to]);
  return null;
}

export default React.memo(function VoiceOrb({ state = 'idle', size = 280 }) {
  const { colors } = useTheme();

  const pulse = useSharedValue(0.96);
  const glow = useSharedValue(0.6);
  const ringScale = useSharedValue(0.85);
  const ringAlpha = useSharedValue(0.3);
  const rotation = useSharedValue(0);
  const waveIntensity = useSharedValue(0);
  const listeningPulse = useSharedValue(0);

  const halfSize = size / 2;
  const wrapperSize = size * 2;

  useEffect(() => {
    cancelAnimation(pulse);
    cancelAnimation(glow);
    cancelAnimation(ringScale);
    cancelAnimation(ringAlpha);
    cancelAnimation(rotation);
    cancelAnimation(waveIntensity);
    cancelAnimation(listeningPulse);

    switch (state) {
      case 'idle':
        pulse.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }), -1, true);
        glow.value = withRepeat(withTiming(0.5, { duration: 2000, easing: Easing.inOut(Easing.sin) }), -1, true);
        ringScale.value = withRepeat(withTiming(0.9, { duration: 3000, easing: Easing.inOut(Easing.sin) }), -1, true);
        ringAlpha.value = withRepeat(withTiming(0.25, { duration: 3000, easing: Easing.inOut(Easing.sin) }), -1, true);
        waveIntensity.value = withTiming(0, { duration: 400 });
        listeningPulse.value = withTiming(0, { duration: 300 });
        rotation.value = withRepeat(withTiming(360, { duration: 20000, easing: Easing.linear }), -1, false);
        break;
      case 'listening':
        pulse.value = withRepeat(withTiming(1.04, { duration: 500, easing: Easing.inOut(Easing.sin) }), -1, true);
        glow.value = withRepeat(withTiming(0.85, { duration: 500, easing: Easing.inOut(Easing.sin) }), -1, true);
        ringScale.value = withRepeat(withSequence(withTiming(1.15, { duration: 700 }), withTiming(0.95, { duration: 700 })), -1, false);
        ringAlpha.value = withRepeat(withSequence(withTiming(0.55, { duration: 700 }), withTiming(0.15, { duration: 700 })), -1, false);
        waveIntensity.value = withRepeat(withTiming(0.5, { duration: 350, easing: Easing.inOut(Easing.sin) }), -1, true);
        listeningPulse.value = withRepeat(withSequence(
          withTiming(1, { duration: 400, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.3, { duration: 400, easing: Easing.inOut(Easing.sin) }),
        ), -1, false);
        rotation.value = withRepeat(withTiming(360, { duration: 15000, easing: Easing.linear }), -1, false);
        break;
      case 'speaking':
        pulse.value = withRepeat(withTiming(1.08, { duration: 350, easing: Easing.inOut(Easing.sin) }), -1, true);
        glow.value = withRepeat(withTiming(1, { duration: 350, easing: Easing.inOut(Easing.sin) }), -1, true);
        ringScale.value = withRepeat(withSequence(withTiming(1.3, { duration: 250 }), withTiming(1.05, { duration: 450 })), -1, false);
        ringAlpha.value = withRepeat(withSequence(withTiming(0.65, { duration: 250 }), withTiming(0.15, { duration: 450 })), -1, false);
        waveIntensity.value = withRepeat(withTiming(1, { duration: 250, easing: Easing.inOut(Easing.sin) }), -1, true);
        listeningPulse.value = withTiming(0, { duration: 200 });
        rotation.value = withRepeat(withTiming(360, { duration: 10000, easing: Easing.linear }), -1, false);
        break;
      case 'thinking':
        pulse.value = withRepeat(withTiming(0.97, { duration: 1000, easing: Easing.inOut(Easing.sin) }), -1, true);
        glow.value = withRepeat(withTiming(0.65, { duration: 1000, easing: Easing.inOut(Easing.sin) }), -1, true);
        ringScale.value = withRepeat(withTiming(0.92, { duration: 1500, easing: Easing.inOut(Easing.sin) }), -1, true);
        ringAlpha.value = withRepeat(withTiming(0.15, { duration: 1500, easing: Easing.inOut(Easing.sin) }), -1, true);
        waveIntensity.value = withTiming(0, { duration: 300 });
        listeningPulse.value = withTiming(0, { duration: 200 });
        rotation.value = withRepeat(withTiming(-360, { duration: 25000, easing: Easing.linear }), -1, false);
        break;
    }
    return () => {
      cancelAnimation(pulse);
      cancelAnimation(glow);
      cancelAnimation(ringScale);
      cancelAnimation(ringAlpha);
      cancelAnimation(rotation);
      cancelAnimation(waveIntensity);
      cancelAnimation(listeningPulse);
    };
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
  }));

  const ring2Style = useAnimatedStyle(() => ({
    width: size * (ringScale.value * 0.92),
    height: size * (ringScale.value * 0.92),
    borderRadius: (size * (ringScale.value * 0.92)) / 2,
    opacity: ringAlpha.value * 0.5,
  }));

  const ring3Style = useAnimatedStyle(() => ({
    width: size * (ringScale.value * 0.84),
    height: size * (ringScale.value * 0.84),
    borderRadius: (size * (ringScale.value * 0.84)) / 2,
    opacity: ringAlpha.value * 0.25,
  }));

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value % 360}deg` }],
  }));

  const listeningDotStyle = useAnimatedStyle(() => ({
    opacity: listeningPulse.value,
    transform: [{ scale: 0.8 + listeningPulse.value * 0.2 }],
  }));

  return (
    <View
      style={[styles.wrapper, { width: wrapperSize, height: wrapperSize, marginLeft: -size, marginTop: -size }]}
      accessibilityLabel={`Voice orb, currently ${state}`}
      accessibilityRole="image"
    >
      <Animated.View style={[glowStyle, styles.glowBase, { backgroundColor: colors.primary + '40' }]} />
      <Animated.View style={[ring3Style, styles.ring, { borderColor: colors.primary + '20' }]} />
      <Animated.View style={[ring2Style, styles.ring, { borderColor: colors.primary + '40' }]} />
      <Animated.View style={[ring1Style, styles.ring, { borderColor: colors.primary + '60' }]} />

      {(state === 'speaking' || state === 'listening') && (
        <WaveBars intensity={waveIntensity} size={size} halfSize={halfSize} color={colors.primary} />
      )}

      <Animated.View style={[styles.liquidContainer, { width: size, height: size, borderRadius: halfSize }, rotateStyle]}>
        <View style={[StyleSheet.absoluteFill, { borderRadius: halfSize, overflow: 'hidden' }]}>
          <LiquidBlob size={size} color1={colors.orbGradient1 || colors.primary} color2={colors.orbGradient2 || colors.secondary} offsetIndex={0} halfSize={halfSize} />
          <LiquidBlob size={size} color1={colors.orbGradient1 || colors.primary} color2={colors.accent || colors.secondary} offsetIndex={1} halfSize={halfSize} />
          <LiquidBlob size={size} color1={colors.orbGradient2 || colors.secondary} color2={colors.orbGradient1 || colors.primary} offsetIndex={2} halfSize={halfSize} />
        </View>
        {Platform.OS !== 'web' ? (
          <BlurView intensity={45} style={[StyleSheet.absoluteFill, { borderRadius: halfSize }]} tint="light" />
        ) : (
          <View style={[StyleSheet.absoluteFill, { borderRadius: halfSize, backgroundColor: 'rgba(255,255,255,0.08)' }]} />
        )}
      </Animated.View>

      <Animated.View style={[styles.orbCore, orbStyle]}>
        <LinearGradient
          colors={[colors.orbGradient1 || colors.primary, colors.orbGradient2 || colors.secondary]}
          start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: halfSize }]}
        />
        <View style={[StyleSheet.absoluteFill, { borderRadius: halfSize }, styles.coreShine]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.35)', 'transparent']}
            style={[StyleSheet.absoluteFill, { borderRadius: halfSize, top: 0, left: 0, right: 0, height: '50%' }]}
          />
        </View>
      </Animated.View>

      <Particles halfSize={halfSize} color={colors.primary} />

      {state === 'listening' && (
        <Animated.View style={[listeningDotStyle, { width: size * 0.28, height: size * 0.28, borderRadius: size * 0.14, borderWidth: 2, borderColor: colors.primary + '80', position: 'absolute', backgroundColor: colors.primary + '30' }]} />
      )}
    </View>
  );
});

const LiquidBlob = React.memo(function LiquidBlob({ size, color1, color2, offsetIndex, halfSize }) {
  const offset = useSharedValue(0);

  const durations = [4000, 5000, 3500];

  useEffect(() => {
    offset.value = withRepeat(
      withTiming(1, { duration: durations[offsetIndex] || 4000, easing: Easing.inOut(Easing.sin) }),
      -1, true
    );
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
      <LinearGradient
        colors={[color1, color2]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: size * 0.275, opacity: 0.7 }]}
      />
    </Animated.View>
  );
});

const WaveBars = React.memo(function WaveBars({ intensity, size, halfSize, color }) {
  return waveBarData.map((bar, i) => (
    <WaveBar key={i} bar={bar} intensity={intensity} size={size} halfSize={halfSize} color={color} />
  ));
});

const WaveBar = React.memo(function WaveBar({ bar, intensity, halfSize, color }) {
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
});

const Particles = React.memo(function Particles({ halfSize, color }) {
  return particleData.map((p, i) => (
    <ParticleItem key={i} data={p} halfSize={halfSize} color={color} />
  ));
});

const ParticleItem = React.memo(function ParticleItem({ data, halfSize, color }) {
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
});

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute', top: '50%', left: '50%',
    alignItems: 'center', justifyContent: 'center',
  },
  glowBase: { position: 'absolute' },
  ring: { position: 'absolute', borderWidth: 1.5 },
  liquidContainer: { position: 'absolute', overflow: 'hidden' },
  orbCore: {
    position: 'absolute', overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 20, elevation: 10,
  },
  coreShine: { zIndex: 2 },
});
