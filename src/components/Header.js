import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, typography } from '../theme';

export default function Header({
  title, subtitle, leftIcon, onLeftPress, rightIcon, onRightPress,
  gradient = true, style, titleStyle, children,
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const padTop = Platform.OS === 'ios' ? insets.top : spacing.xl;

  const content = (
    <View style={[styles.container, { paddingTop: padTop }, style]}>
      <View style={styles.row}>
        {leftIcon && onLeftPress && (
          <TouchableOpacity onPress={onLeftPress} style={styles.iconBtn}>
            <Ionicons name={leftIcon} size={24} color="#fff" />
          </TouchableOpacity>
        )}
        <View style={styles.textContainer}>
          {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {rightIcon && onRightPress && (
          <TouchableOpacity onPress={onRightPress} style={styles.iconBtn}>
            <Ionicons name={rightIcon} size={24} color="#fff" />
          </TouchableOpacity>
        )}
        {children}
      </View>
    </View>
  );

  if (gradient) {
    return (
      <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        {content}
      </LinearGradient>
    );
  }

  return <View style={[styles.container, { paddingTop: padTop, backgroundColor: colors.primary }]}>{content}</View>;
}

const styles = StyleSheet.create({
  container: { paddingBottom: spacing.lg, paddingHorizontal: spacing.xl },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 48 },
  textContainer: { flex: 1 },
  title: { fontSize: 24, fontWeight: '800', color: '#fff', ...typography.h2 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  iconBtn: { padding: spacing.sm, marginLeft: spacing.sm },
});
