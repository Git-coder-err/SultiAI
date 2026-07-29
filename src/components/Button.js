import React, { useRef } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { borderRadius, spacing, shadows, gradients } from '../theme';
import { Ionicons } from '@expo/vector-icons';

export default function Button({
  title, onPress, variant = 'primary', size = 'md', icon, iconPosition = 'left',
  disabled, loading, style, textStyle, gradient = false, fullWidth = false,
}) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  const onPressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.96, friction: 8, tension: 200, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 200, useNativeDriver: true }).start();
  };

  const textColor = variant === 'primary' || variant === 'danger' ? '#fff'
    : variant === 'secondary' ? colors.text
    : variant === 'glass' ? colors.text
    : colors.primary;

  const btnStyles = [
    styles.base,
    isSmall && styles.small,
    isLarge && styles.large,
    fullWidth && styles.fullWidth,
    variant === 'secondary' && { backgroundColor: colors.surfaceSecondary },
    variant === 'outline' && { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
    variant === 'ghost' && { backgroundColor: 'transparent' },
    variant === 'danger' && { backgroundColor: colors.error },
    variant === 'glass' && {
      backgroundColor: colors.glassBg, borderWidth: 1, borderColor: colors.glassBorder,
      ...shadows.glass,
    },
    disabled && styles.disabled,
    variant === 'primary' && !gradient && { backgroundColor: colors.primary },
    style,
  ];

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <Ionicons name={icon} size={isSmall ? 16 : 20} color={textColor} style={{ marginRight: spacing.sm }} />}
          {title && <Text style={[styles.text, isSmall && styles.textSmall, isLarge && styles.textLarge, { color: textColor }, textStyle]}>{title}</Text>}
          {icon && iconPosition === 'right' && <Ionicons name={icon} size={isSmall ? 16 : 20} color={textColor} style={{ marginLeft: spacing.sm }} />}
        </>
      )}
    </>
  );

  const renderBtn = () => {
    if (gradient && variant === 'primary') {
      const gradColors = [colors.primary, colors.primaryDark];
      return (
        <LinearGradient colors={gradColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.base, isSmall && styles.small, isLarge && styles.large, fullWidth && styles.fullWidth, { borderRadius: borderRadius.lg }]}>
          {content}
        </LinearGradient>
      );
    }
    if (variant === 'premium') {
      return (
        <LinearGradient colors={[colors.primary, colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.base, isSmall && styles.small, isLarge && styles.large, fullWidth && styles.fullWidth, { borderRadius: borderRadius.lg, ...shadows.md }]}>
          {content}
        </LinearGradient>
      );
    }
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }], borderRadius: borderRadius.lg }}>
        <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.9} style={btnStyles} onPressIn={onPressIn} onPressOut={onPressOut}>
          {content}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return renderBtn();
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 24, borderRadius: borderRadius.lg },
  small: { paddingVertical: 8, paddingHorizontal: 16 },
  large: { paddingVertical: 18, paddingHorizontal: 32 },
  fullWidth: { width: '100%' },
  text: { fontSize: 17, fontWeight: '600', letterSpacing: -0.41 },
  textSmall: { fontSize: 13, fontWeight: '600' },
  textLarge: { fontSize: 18, fontWeight: '700' },
  disabled: { opacity: 0.5 },
});
