import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming,
  withSpring, withSequence, cancelAnimation, Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Path, Ellipse, G, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

export default function AIAvatar({ size = 80, mood = 'neutral' }) {
  const { colors } = useTheme();
  const floatAnim = useSharedValue(0);
  const blinkAnim = useSharedValue(0);
  const mouthAnim = useSharedValue(0);
  const bounceAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(1);

  const halfSize = size / 2;
  const eyeSize = size * 0.08;
  const eyeY = size * 0.32;
  const eyeSpacing = size * 0.15;
  const mouthY = size * 0.55;

  useEffect(() => {
    cancelAnimation(floatAnim);
    cancelAnimation(blinkAnim);
    cancelAnimation(mouthAnim);
    cancelAnimation(bounceAnim);
    cancelAnimation(scaleAnim);

    floatAnim.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      -1, true
    );

    blinkAnim.value = withRepeat(withSequence(
      withTiming(0, { duration: 5000 }),
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 150 }),
    ), -1, false);

    switch (mood) {
      case 'neutral':
        break;
      case 'happy':
        bounceAnim.value = withRepeat(withSequence(
          withSpring(1, { stiffness: 200, damping: 10 }),
          withSpring(0, { stiffness: 200, damping: 10 }),
        ), 2, false);
        scaleAnim.value = withSequence(
          withSpring(1.1, { stiffness: 200, damping: 12 }),
          withSpring(1, { stiffness: 200, damping: 10 }),
        );
        break;
      case 'listening':
        break;
      case 'speaking':
        mouthAnim.value = withRepeat(withSequence(
          withTiming(1, { duration: 200, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 200, easing: Easing.inOut(Easing.sin) }),
        ), -1, true);
        break;
      case 'thinking':
        break;
      case 'celebrating':
        bounceAnim.value = withRepeat(withSequence(
          withSpring(1, { stiffness: 150, damping: 8 }),
          withSpring(0, { stiffness: 150, damping: 8 }),
        ), 3, false);
        scaleAnim.value = withSequence(
          withSpring(1.15, { stiffness: 150, damping: 10 }),
          withSpring(1, { stiffness: 150, damping: 8 }),
        );
        break;
    }

    return () => {
      cancelAnimation(floatAnim);
      cancelAnimation(blinkAnim);
      cancelAnimation(mouthAnim);
    };
  }, [mood]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: Math.sin(floatAnim.value * Math.PI * 2) * 4 },
      { scale: scaleAnim.value },
    ],
  }));

  const leftEyeStyle = useAnimatedStyle(() => {
    const isBlinking = blinkAnim.value > 0.5;
    return {
      opacity: isBlinking ? 0 : 1,
      transform: [{ scaleY: isBlinking ? 0.01 : 1 }],
    };
  });

  const rightEyeStyle = useAnimatedStyle(() => {
    const isBlinking = blinkAnim.value > 0.5;
    return {
      opacity: isBlinking ? 0 : 1,
      transform: [{ scaleY: isBlinking ? 0.01 : 1 }],
    };
  });

  const pupilOffset = mood === 'thinking' ? -2 : mood === 'listening' ? 2 : 0;
  const pupilSize = eyeSize * 0.55;

  const getMouthPath = () => {
    const mw = size * 0.22;
    const mh = size * 0.08;
    switch (mood) {
      case 'happy':
      case 'celebrating':
        return `M${halfSize - mw},${mouthY + 2} Q${halfSize},${mouthY - mh * 1.5} ${halfSize + mw},${mouthY + 2}`;
      case 'speaking':
        return `M${halfSize - mw},${mouthY} Q${halfSize},${mouthY + mh * 1.2} ${halfSize + mw},${mouthY}`;
      case 'thinking':
        return `M${halfSize - mw * 0.7},${mouthY} Q${halfSize},${mouthY - 2} ${halfSize + mw * 0.7},${mouthY + 2}`;
      default:
        return `M${halfSize - mw},${mouthY} Q${halfSize},${mouthY - mh * 0.3} ${halfSize + mw},${mouthY}`;
    }
  };

  const getBlushOpacity = () => {
    if (mood === 'happy' || mood === 'celebrating') return 0.5;
    if (mood === 'speaking') return 0.25;
    return 0.15;
  };

  return (
    <Animated.View style={[styles.container, { width: size, height: size }, containerStyle]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <SvgGradient id="avatarGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.primary} stopOpacity="1" />
            <Stop offset="1" stopColor={colors.secondary} stopOpacity="1" />
          </SvgGradient>
          <SvgGradient id="avatarGrad2" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.primaryLight} stopOpacity="0.3" />
            <Stop offset="1" stopColor="transparent" stopOpacity="0" />
          </SvgGradient>
        </Defs>

        <Circle cx={halfSize} cy={halfSize} r={halfSize - 2} fill="url(#avatarGrad)" />

        <Circle cx={halfSize} cy={halfSize} r={halfSize * 0.4} fill="url(#avatarGrad2)" />

        <G opacity={0.15}>
          <Circle cx={halfSize} cy={halfSize} r={halfSize * 0.3} fill="transparent" stroke={colors.primary + '40'} strokeWidth="0.5" />
        </G>

        <G opacity={getBlushOpacity()}>
          <Ellipse cx={halfSize - eyeSpacing - 3} cy={mouthY - 2} rx={size * 0.07} ry={size * 0.035} fill={colors.primary + '50'} />
          <Ellipse cx={halfSize + eyeSpacing + 3} cy={mouthY - 2} rx={size * 0.07} ry={size * 0.035} fill={colors.primary + '50'} />
        </G>

        <AnimatedG>
          <AnimatedCircle cx={halfSize - eyeSpacing} cy={eyeY} r={eyeSize} fill="white" style={leftEyeStyle} />
          <Circle cx={halfSize - eyeSpacing + pupilOffset} cy={eyeY} r={pupilSize} fill="#1a1a2e" />
        </AnimatedG>

        <AnimatedG>
          <AnimatedCircle cx={halfSize + eyeSpacing} cy={eyeY} r={eyeSize} fill="white" style={rightEyeStyle} />
          <Circle cx={halfSize + eyeSpacing + pupilOffset} cy={eyeY} r={pupilSize} fill="#1a1a2e" />
        </AnimatedG>

        <Path
          d={getMouthPath()}
          fill="none"
          stroke="white"
          strokeWidth={size * 0.025}
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
});
