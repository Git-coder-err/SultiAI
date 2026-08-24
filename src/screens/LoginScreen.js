import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, shadows } from '../theme';
import ClerkSignIn from './clerk/ClerkSignIn';
import ClerkSignUp from './clerk/ClerkSignUp';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState('landing'); // 'landing' | 'signin' | 'signup'

  if (mode === 'signin') {
    return <ClerkSignIn onBack={() => setMode('landing')} />;
  }

  if (mode === 'signup') {
    return <ClerkSignUp onBack={() => setMode('landing')} />;
  }

  // Landing screen
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.gradientB]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 60 }]}
      >
        <View style={styles.logoCircle}>
          <Ionicons name="language" size={40} color="#fff" />
        </View>
        <Text style={styles.heroTitle}>SultiAI</Text>
        <Text style={styles.heroSubtitle}>Learn Bisaya with AI</Text>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={[styles.tagline, { color: colors.text }]}>
          Your AI-powered language partner for{'\n'}learning Bisaya (Cebuano)
        </Text>

        <View style={styles.features}>
          <FeatureItem icon="chatbubble-ellipses" text="AI Tutor conversations" colors={colors} />
          <FeatureItem icon="mic" text="Voice practice & pronunciation" colors={colors} />
          <FeatureItem icon="people" text="Community learning" colors={colors} />
        </View>

        <View style={[styles.buttonGroup, { marginBottom: insets.bottom + 20 }]}>
          <TouchableOpacity
            style={[styles.signInButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={0.7}
            onPress={() => setMode('signin')}
          >
            <Text style={[styles.signInText, { color: colors.text }]}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} onPress={() => setMode('signup')}>
            <LinearGradient
              colors={[colors.primary, colors.gradientB]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.signUpButton}
            >
              <Text style={styles.signUpText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={[styles.terms, { color: colors.textLight }]}>
          By continuing, you agree to our{' '}
          <Text style={{ color: colors.primary }}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={{ color: colors.primary }}>Privacy Policy</Text>
        </Text>
      </View>
    </View>
  );
}

function FeatureItem({ icon, text, colors }) {
  return (
    <View style={styles.featureRow}>
      <View style={[styles.featureIcon, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={[styles.featureText, { color: colors.textSecondary }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    alignItems: 'center',
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoCircle: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  heroTitle: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', marginBottom: spacing.xs },
  heroSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  content: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xxl },
  tagline: { fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: spacing.xxl, lineHeight: 26 },
  features: { gap: spacing.md, marginBottom: spacing.xxxl },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  featureIcon: { width: 40, height: 40, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  featureText: { fontSize: 15, fontWeight: '500' },
  buttonGroup: { gap: spacing.md },
  signInButton: {
    height: 52, borderRadius: borderRadius.lg, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', ...shadows.sm,
  },
  signInText: { fontSize: 17, fontWeight: '600' },
  signUpButton: {
    height: 52, borderRadius: borderRadius.lg,
    alignItems: 'center', justifyContent: 'center', ...shadows.md,
  },
  signUpText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  terms: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
