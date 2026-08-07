import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSpring, withSequence,
  withDelay, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';
import { hapticXpGain, hapticTap } from '../utils/haptics';
import { spacing, borderRadius, shadows } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CONFETTI_COUNT = 60;
const BURST_COUNT = 12;

const CONFETTI_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#FF9F40', '#6A0572', '#9B5DE8'];

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const rand = seededRandom(42);

const confettiData = Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
  id: i,
  x: rand() * SCREEN_WIDTH,
  delay: rand() * 1500,
  fallDuration: 3000 + rand() * 2000,
  size: 6 + rand() * 6,
  color: CONFETTI_COLORS[Math.floor(rand() * CONFETTI_COLORS.length)],
  rotation: rand() * 360,
  amplitude: 20 + rand() * 40,
  startX: -50 - rand() * 60,
}));

const burstData = Array.from({ length: BURST_COUNT }, (_, i) => ({
  id: i,
  angle: (i / BURST_COUNT) * Math.PI * 2,
  distance: 50 + rand() * 80,
  delay: rand() * 200,
}));

function ConfettiPiece({ data }) {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      data.delay,
      withTiming(1, { duration: data.fallDuration, easing: Easing.linear })
    );
    opacity.value = withDelay(data.delay, withTiming(1, { duration: 300 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => {
    const y = progress.value * SCREEN_HEIGHT + Math.sin(progress.value * Math.PI * 2) * data.amplitude;
    const x = data.startX + (progress.value * SCREEN_WIDTH * 0.1);
    const r = progress.value * data.rotation * 3;
    return {
      opacity: opacity.value,
      transform: [
        { translateX: x },
        { translateY: y },
        { rotate: `${r}deg` },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.confetti,
        {
          width: data.size,
          height: data.size * (0.5 + rand() * 0.5),
          borderRadius: data.size / 3,
          backgroundColor: data.color,
        },
        style,
      ]}
    />
  );
}

function BurstParticle({ data }) {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      data.delay,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) })
    );
    opacity.value = withDelay(data.delay, withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0, { duration: 400 })
    ));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => {
    const d = progress.value * data.distance;
    const x = Math.cos(data.angle) * d;
    const y = Math.sin(data.angle) * d;
    return {
      opacity: opacity.value,
      transform: [
        { translateX: x },
        { translateY: y },
        { scale: 1 - progress.value * 0.3 },
      ],
    };
  });

  const color = CONFETTI_COLORS[Math.floor(data.id / (BURST_COUNT / CONFETTI_COLORS.length)) % CONFETTI_COLORS.length];

  return (
    <Animated.View
      style={[
        styles.burstParticle,
        { backgroundColor: color },
        style,
      ]}
    />
  );
}

function LevelCard({ levelUpInfo, levelInfo }) {
  const { colors } = useTheme();
  const scale = useSharedValue(0);
  const glow = useSharedValue(0);
  const badgeScale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(300, withSequence(
      withSpring(1.1, { stiffness: 200, damping: 8 }),
      withSpring(1, { stiffness: 200, damping: 15 })
    ));
    glow.value = withDelay(300, withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.5, { duration: 800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1, true
    ));
    badgeScale.value = withDelay(800, withSpring(1, { stiffness: 200, damping: 15 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  return (
    <Animated.View style={[styles.cardWrapper, cardStyle]}>
      <Animated.View style={[styles.cardGlow, { backgroundColor: levelInfo.color }, glowStyle]} />
      <LinearGradient
        colors={[levelInfo.color, colors.primary]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <Ionicons name={levelInfo.icon} size={40} color="#fff" />
          <Text style={styles.congratsText}>Congratulations!</Text>
        </View>

        <View style={styles.levelRow}>
          <Text style={styles.oldLevel}>Lvl {levelUpInfo.oldLevel}</Text>
          <LinearGradient
            colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.levelBadge}
          >
            <Text style={styles.arrow}>→</Text>
          </LinearGradient>
          <Text style={styles.newLevel}>Lvl {levelUpInfo.newLevel}</Text>
        </View>

        <View style={styles.levelLabel}>
          <Text style={styles.levelTitle}>{levelInfo.label} Level!</Text>
        </View>

        <Animated.View style={[badgeStyle, { marginTop: spacing.sm, alignItems: 'center' }]}>
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.xpBadge}
          >
            <Ionicons name="star" size={16} color="#fff" />
            <Text style={styles.xpBadgeText}>+Badge Unlocked!</Text>
          </LinearGradient>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
}

export default function LevelUpCelebration() {
  const { levelUpInfo, clearLevelUp, getLevelInfo, xp, badges } = useGame();
  const { isDark } = useTheme();

  const hasNewBadge = useRef(false);

  useEffect(() => {
    if (levelUpInfo) {
      hapticXpGain();
      hasNewBadge.current = badges.length > 0;
      const timer = setTimeout(() => {
        hapticTap();
        clearLevelUp();
      }, 3500);
      return () => clearTimeout(timer);
    }
   }, [levelUpInfo]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!levelUpInfo) return null;

  const levelInfo = getLevelInfo(xp);

  return (
    <Modal transparent statusBarTranslucent animationType="none">
      <View style={styles.overlay}>
        <BlurView intensity={30} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />

        {/* Burst particles centered on card */}
        <View style={styles.burstContainer}>
          {burstData.map((d) => (
            <BurstParticle key={d.id} data={d} />
          ))}
        </View>

        {/* Confetti */}
        {confettiData.map((d) => (
          <ConfettiPiece key={d.id} data={d} />
        ))}

        <View style={styles.content}>
          <LevelCard levelUpInfo={levelUpInfo} levelInfo={levelInfo} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  burstContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT / 2 - 100,
    left: SCREEN_WIDTH / 2 - 100,
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cardGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0,
    ...shadows.xl,
  },
  card: {
    borderRadius: borderRadius.xxl,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    minWidth: 260,
    ...shadows.xl,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  congratsText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  oldLevel: {
    fontSize: 28,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  arrow: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  newLevel: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
  },
  levelLabel: {
    alignItems: 'center',
  },
  levelTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    ...shadows.lg,
  },
  xpBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  confetti: {
    position: 'absolute',
    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
    elevation: 2,
  },
  burstParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    left: 96,
    top: 96,
  },
});
