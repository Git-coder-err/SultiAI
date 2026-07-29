import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, borderRadius, typography } from '../theme';

export default function PremiumHeader({
  title, subtitle, leftIcon, onLeftPress, rightIcon, onRightPress,
  variant = 'glass', style, titleStyle, children,
}) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const padTop = Platform.OS === 'ios' ? insets.top + 8 : spacing.xl;

  const renderContent = () => (
    <View style={[styles.content, { paddingTop: padTop }, style]}>
      <View style={styles.row}>
        {leftIcon && onLeftPress && (
          <TouchableOpacity onPress={onLeftPress} style={styles.iconBtn}>
            <View style={[styles.iconBg, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <Ionicons name={leftIcon} size={22} color="#fff" />
            </View>
          </TouchableOpacity>
        )}
        <View style={styles.textContainer}>
          {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {rightIcon && onRightPress && (
          <TouchableOpacity onPress={onRightPress} style={styles.iconBtn}>
            <View style={[styles.iconBg, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <Ionicons name={rightIcon} size={22} color="#fff" />
            </View>
          </TouchableOpacity>
        )}
        {children}
      </View>
    </View>
  );

  if (variant === 'gradient') {
    return (
      <LinearGradient colors={[colors.primary, colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        {renderContent()}
      </LinearGradient>
    );
  }

  if (variant === 'glass' && Platform.OS !== 'web') {
    return (
      <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.glassContainer}>
        {renderContent()}
      </BlurView>
    );
  }

  return (
    <View style={[styles.glassContainer, { backgroundColor: colors.glassBg, borderBottomWidth: 1, borderBottomColor: colors.glassBorder }]}>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  glassContainer: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
  },
  content: { paddingBottom: spacing.lg, paddingHorizontal: spacing.xl },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 48 },
  textContainer: { flex: 1, marginHorizontal: spacing.sm },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', letterSpacing: 0.36 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2, letterSpacing: -0.08 },
  iconBtn: { padding: 4 },
  iconBg: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
});
