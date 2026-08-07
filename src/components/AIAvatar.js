import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, useAnimatedProps, withRepeat, withTiming,
  withSpring, withSequence, cancelAnimation, Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Path, Ellipse, G, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

let instanceCounter = 0;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

export default React.memo(function AIAvatar({ size = 80, mood = 'neutral' }) {
  const { colors, isDark } = useTheme();
  const instanceId = useRef(++instanceCounter);
  const gradId = `avatarGrad_${instanceId.current}`;
  const grad2Id = `avatarGrad2_${instanceId.current}`;

  const floatAnim = useSharedValue(0);
  const blinkAnim = useSharedValue(0);
  const mouthAnim = useSharedValue(0);
  const bounceAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(1);
  const browAnim = useSharedValue(0);

  const halfSize = size / 2;
  const eyeSize = size * 0.08;
  const eyeY = size * 0.32;
  const eyeSpacing = size * 0.15;
  const mouthY = size * 0.55;
  const browY = size * 0.24;
  const browW = size * 0.12;
  const pupilColor = isDark ? '#ffffff' : '#1a1a2e';

  useEffect(() => {
    cancelAnimation(floatAnim);
    cancelAnimation(blinkAnim);
    cancelAnimation(mouthAnim);
    cancelAnimation(bounceAnim);
    cancelAnimation(scaleAnim);
    cancelAnimation(browAnim);

    floatAnim.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      -1, true
    );

    const blinkInterval = () => {
      blinkAnim.value = withRepeat(withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 100 }),
      ), 1, false);
    };

    setTimeout(blinkInterval, 4000);

    setInterval(() => {
      cancelAnimation(blinkAnim);
      blinkAnim.value = withRepeat(withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 100 }),
      ), 1, false);
    }, 5000);

    switch (mood) {
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
      case 'speaking':
        mouthAnim.value = withRepeat(withSequence(
          withTiming(1, { duration: 200, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 200, easing: Easing.inOut(Easing.sin) }),
        ), -1, true);
        break;
      case 'thinking':
        browAnim.value = withRepeat(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          -1, true
        );
        break;
      case 'listening':
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
      default:
        break;
    }

    return () => {
      cancelAnimation(floatAnim);
      cancelAnimation(blinkAnim);
      cancelAnimation(mouthAnim);
      cancelAnimation(bounceAnim);
      cancelAnimation(scaleAnim);
      cancelAnimation(browAnim);
    };
  }, [mood]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: Math.sin(floatAnim.value * Math.PI * 2) * 4 },
      { scale: scaleAnim.value },
    ],
  }));

  const leftEyeProps = useAnimatedProps(() => {
    const closed = blinkAnim.value > 0.5;
    return {
      opacity: closed ? 0 : 1,
      transform: `scaleY(${closed ? 0.01 : 1})`,
    };
  });

  const rightEyeProps = useAnimatedProps(() => {
    const closed = blinkAnim.value > 0.5;
    return {
      opacity: closed ? 0 : 1,
      transform: `scaleY(${closed ? 0.01 : 1})`,
    };
  });

  const mouthProps = useAnimatedProps(() => {
    const open = mouthAnim.value;
    return { transform: `scaleY(${0.75 + 0.25 * open})` };
  });

  const leftBrowProps = useAnimatedProps(() => {
    const tilt = mood === 'thinking' ? browAnim.value * (-4) : 0;
    return { transform: `translateY(${tilt}px)` };
  });

  const rightBrowProps = useAnimatedProps(() => {
    const tilt = mood === 'thinking' ? browAnim.value * 4 : 0;
    return { transform: `translateY(${tilt}px)` };
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
    <Animated.View
      style={[styles.container, { width: size, height: size }, containerStyle]}
      accessibilityLabel={`Sulti avatar, mood is ${mood}`}
      accessibilityRole="image"
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <SvgGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.primary} stopOpacity="1" />
            <Stop offset="1" stopColor={colors.secondary} stopOpacity="1" />
          </SvgGradient>
          <SvgGradient id={grad2Id} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.primaryLight || colors.primary} stopOpacity="0.3" />
            <Stop offset="1" stopColor="transparent" stopOpacity="0" />
          </SvgGradient>
        </Defs>

        <Circle cx={halfSize} cy={halfSize} r={halfSize - 2} fill={`url(#${gradId})`} />
        <Circle cx={halfSize} cy={halfSize} r={halfSize * 0.4} fill={`url(#${grad2Id})`} />

        <G opacity={0.12}>
          <Circle cx={halfSize} cy={halfSize} r={halfSize * 0.3} fill="transparent" stroke={colors.primary + '40'} strokeWidth="0.5" />
        </G>

        <G opacity={getBlushOpacity()}>
          <Ellipse cx={halfSize - eyeSpacing - 3} cy={mouthY - 2} rx={size * 0.07} ry={size * 0.035} fill={colors.primary + '50'} />
          <Ellipse cx={halfSize + eyeSpacing + 3} cy={mouthY - 2} rx={size * 0.07} ry={size * 0.035} fill={colors.primary + '50'} />
        </G>

        <AnimatedG animatedProps={leftBrowProps}>
          <Path
            d={`M${halfSize - eyeSpacing - browW},${browY} Q${halfSize - eyeSpacing},${browY - 3} ${halfSize - eyeSpacing + browW},${browY}`}
            fill="none"
            stroke={pupilColor}
            strokeWidth={size * 0.02}
            strokeLinecap="round"
          />
        </AnimatedG>
        <AnimatedG animatedProps={rightBrowProps}>
          <Path
            d={`M${halfSize + eyeSpacing - browW},${browY} Q${halfSize + eyeSpacing},${browY - 3} ${halfSize + eyeSpacing + browW},${browY}`}
            fill="none"
            stroke={pupilColor}
            strokeWidth={size * 0.02}
            strokeLinecap="round"
          />
        </AnimatedG>

        <AnimatedG>
          <AnimatedCircle cx={halfSize - eyeSpacing} cy={eyeY} r={eyeSize} fill="white" animatedProps={leftEyeProps} />
          <Circle cx={halfSize - eyeSpacing + pupilOffset} cy={eyeY} r={pupilSize} fill={pupilColor} />
        </AnimatedG>

        <AnimatedG>
          <AnimatedCircle cx={halfSize + eyeSpacing} cy={eyeY} r={eyeSize} fill="white" animatedProps={rightEyeProps} />
          <Circle cx={halfSize + eyeSpacing + pupilOffset} cy={eyeY} r={pupilSize} fill={pupilColor} />
        </AnimatedG>

        <AnimatedG animatedProps={mouthProps}>
          <Path
            d={getMouthPath()}
            fill="none"
            stroke="white"
            strokeWidth={size * 0.025}
            strokeLinecap="round"
          />
        </AnimatedG>
      </Svg>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(20,184,166,0.3)',
    elevation: 6,
  },
});
