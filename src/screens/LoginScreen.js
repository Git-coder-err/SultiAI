import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, shadows, typography } from '../theme';
import GoogleSignInButton, { Divider } from '../components/GoogleSignInButton';
import ClerkSignIn from './clerk/ClerkSignIn';
import ClerkSignUp from './clerk/ClerkSignUp';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LoginScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState('landing'); // 'landing' | 'signin' | 'signup'

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  if (mode === 'signin') {
    return <ClerkSignIn onBack={() => setMode('landing')} />;
  }
  if (mode === 'signup') {
    return <ClerkSignUp onBack={() => setMode('landing')} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hero section with gradient */}
      <LinearGradient
        colors={[colors.primary, colors.gradientB]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 48 }]}
      >
        {/* Decorative circles */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />

        <Animated.View style={[styles.logoWrap, { transform: [{ scale: logoScale }] }]}>
          <View style={styles.logoOuter}>
            <View style={styles.logoInner}>
              <Ionicons name="language" size={36} color="#fff" />
            </View>
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={styles.heroTitle}>SultiAI</Text>
          <Text style={styles.heroSubtitle}>Learn Bisaya with AI</Text>
        </Animated.View>

        {/* Language pill */}
        <Animated.View style={[styles.langPill, { opacity: fadeAnim }]}>
          <Text style={styles.langPillText}>🇵🇭 Bisaya • Tagalog • English</Text>
        </Animated.View>
      </LinearGradient>

      {/* Content section */}
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={[styles.tagline, { color: colors.text }]}>
          Your AI-powered language partner{'\n'}for conversational fluency
        </Text>

        {/* Feature cards */}
        <View style={styles.features}>
          <FeatureCard
            icon="chatbubble-ellipses"
            title="AI Tutor"
            desc="Real-time conversations"
            colors={colors}
          />
          <FeatureCard
            icon="mic"
            title="Voice Practice"
            desc="Pronunciation coaching"
            colors={colors}
          />
          <FeatureCard
            icon="people"
            title="Community"
            desc="Learn with others"
            colors={colors}
          />
        </View>

        {/* Social + Email auth */}
        <View style={[styles.buttonGroup, { marginBottom: insets.bottom + 16 }]}>
          <GoogleSignInButton />
          <Divider colors={colors} />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setMode('signin')}
            style={[styles.signInBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[styles.signInText, { color: colors.text }]}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} onPress={() => setMode('signup')}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark || colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.signUpBtn}
            >
              <Text style={styles.signUpText}>Get Started Free</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={[styles.terms, { color: colors.textLight }]}>
          By continuing, you agree to our{' '}
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Terms</Text>
          {' '}and{' '}
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Privacy Policy</Text>
        </Text>
      </Animated.View>
    </View>
  );
}

function FeatureCard({ icon, title, desc, colors }) {
  return (
    <View style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.featureIcon, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.featureTextWrap}>
        <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.featureDesc, { color: colors.textLight }]}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    alignItems: 'center',
    paddingBottom: 36,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  decorCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -40,
    right: -60,
  },
  decorCircle2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: 20,
    left: -30,
  },
  logoWrap: { marginBottom: spacing.lg },
  logoOuter: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  logoInner: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  langPill: {
    marginTop: spacing.lg,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  langPillText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
  tagline: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xxl,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  features: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxxl,
  },
  featureCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    ...shadows.sm,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  featureTextWrap: { alignItems: 'center' },
  featureTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonGroup: { gap: spacing.md },
  signInBtn: {
    height: 54,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  signInText: { fontSize: 17, fontWeight: '600' },
  signUpBtn: {
    height: 54,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  signUpText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  terms: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
