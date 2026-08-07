import React, { useEffect } from 'react';
import { View, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, shadows } from '../theme';
import { useFadeIn, useScaleIn, usePulse } from '../hooks/useAnimations';

const PremiumCard = React.forwardRef(({
  children,
  style,
  variant = 'default',
  padding = 'lg',
  gradientBorder = false,
  glow = false,
  floating = false,
  pulse: pulseProp = false,
  intensity = 25,
  radiusKey = 'xl',
}, ref) => {
  PremiumCard.displayName = 'PremiumCard';
  const { colors, isDark } = useTheme();
  const padMap = { sm: spacing.sm, md: spacing.lg, lg: spacing.xl, xl: spacing.xxl, huge: spacing.huge };
  const radiusMap = { sm: borderRadius.sm, md: borderRadius.md, lg: borderRadius.lg, xl: borderRadius.xl, xxl: borderRadius.xxl, full: borderRadius.full };
  const radius = radiusMap[radiusKey] || borderRadius.xl;

  const { style: fadeStyle, fadeIn } = useFadeIn({ duration: 500 });
  const { style: scaleStyle, scaleIn } = useScaleIn({ delay: 50, from: 0.96 });
  const { style: pulseStyle, start: startPulse, stop: stopPulse } = usePulse({ min: 0.98, max: 1.02, duration: 2000 });

  useEffect(() => {
    fadeIn();
    scaleIn();
    if (pulseProp) startPulse();
    return () => stopPulse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const baseStyle = {
    padding: padMap[padding] || spacing.xl,
    borderRadius: radius,
  };

  const cardShadow = glow
    ? { boxShadow: `0 0 20px ${colors.primary}4D`, elevation: 12 }
    : floating
      ? shadows.xl
      : {};

  const animatedWrapper = [fadeStyle, scaleStyle, pulseProp && pulseStyle, cardShadow, { borderRadius: radius }];

  if (gradientBorder) {
    return (
      <Animated.View style={[animatedWrapper, style]} ref={ref}>
        <LinearGradient
          colors={[colors.primary, colors.secondary, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: radius, padding: 1 }}
        >
          {Platform.OS === 'web' ? (
            <View style={[baseStyle, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder, borderWidth: 1 }, style]}>
              {children}
            </View>
          ) : (
            <BlurView
              intensity={intensity}
              tint={isDark ? 'dark' : 'light'}
              style={[baseStyle, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder, borderWidth: 1 }]}
            >
              {children}
            </BlurView>
          )}
        </LinearGradient>
      </Animated.View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <Animated.View style={[animatedWrapper, baseStyle, {
        backgroundColor: colors.glassBg,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }, style]} ref={ref}>
        {children}
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[animatedWrapper, style]} ref={ref}>
      <BlurView
        intensity={intensity}
        tint={isDark ? 'dark' : 'light'}
        style={[baseStyle, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder, borderWidth: 1 }]}
      >
        {children}
      </BlurView>
    </Animated.View>
  );
});

export default PremiumCard;
