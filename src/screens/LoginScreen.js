import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, shadows } from '../theme';
import GoogleSignInButton, { Divider } from '../components/GoogleSignInButton';
import { useUser } from '../context/UserContext';

function SlideInView({ delay = 0, children, style }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, friction: 8, tension: 50, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity: fade, transform: [{ translateY: slide }] }, style]}>
      {children}
    </Animated.View>
  );
}

export default function LoginScreen({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { signInWithGoogle } = useUser();

  const logoScale = useRef(new Animated.Value(0.3)).current;
  const heroFade = useRef(new Animated.Value(0)).current;
  const orb1 = useRef(new Animated.Value(0)).current;
  const orb2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
      Animated.timing(heroFade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(orb1, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(orb2, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const orb1Translate = orb1.interpolate({ inputRange: [0, 1], outputRange: [0, -15] });
  const orb2Translate = orb2.interpolate({ inputRange: [0, 1], outputRange: [0, 12] });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.gradientB]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 44 }]}
      >
        <Animated.View style={[styles.decorCircle1, { transform: [{ translateY: orb1Translate }] }]} />
        <Animated.View style={[styles.decorCircle2, { transform: [{ translateX: orb2Translate }] }]} />
        <View style={styles.decorCircle3} />

        <Animated.View style={[styles.logoOuter, { transform: [{ scale: logoScale }] }]}>
          <View style={styles.logoInner}>
            <Ionicons name="language" size={36} color="#fff" />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: heroFade, alignItems: 'center' }}>
          <Text style={styles.heroTitle}>SultiAI</Text>
          <Text style={styles.heroSubtitle}>Your AI Language Partner</Text>
        </Animated.View>

        <Animated.View style={[styles.langPill, { opacity: heroFade }]}>
          <Text style={styles.langPillText}>Bisaya  ·  Tagalog  ·  English</Text>
        </Animated.View>
      </LinearGradient>

      <View style={styles.content}>
        <SlideInView delay={200}>
          <Text style={[styles.tagline, { color: colors.text }]}>
            Learn conversational Filipino{'\n'}through natural AI conversations
          </Text>
        </SlideInView>

        <SlideInView delay={300} style={styles.features}>
          <FeatureCard icon="chatbubble-ellipses" title="AI Tutor" desc="Real-time conversations" colors={colors} />
          <FeatureCard icon="mic" title="Voice Practice" desc="Pronunciation coaching" colors={colors} />
          <FeatureCard icon="people" title="Community" desc="Learn with others" colors={colors} />
        </SlideInView>

        <SlideInView delay={400} style={[styles.buttonGroup, { marginBottom: insets.bottom + 16 }]}>
          <GoogleSignInButton
            onSuccess={async (idToken) => {
              const result = await signInWithGoogle(idToken);
              if (result.success) {
                // UserContext sets user → AppNavigator auto-switches to Main tabs
              }
            }}
            onError={(err) => console.warn('Google sign-in error:', err)}
          />

          <Divider colors={colors} />

          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('SignIn')}
            style={[styles.outlineBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="mail-outline" size={18} color={colors.text} style={{ marginRight: 8 }} />
            <Text style={[styles.outlineBtnText, { color: colors.text }]}>Sign In with Email</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('SignUp')}>
            <LinearGradient colors={[colors.primary, colors.primaryDark || colors.primary]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientBtn}>
              <Text style={styles.gradientBtnText}>Create Account</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
            </LinearGradient>
          </TouchableOpacity>
        </SlideInView>

        <SlideInView delay={500}>
          <Text style={[styles.terms, { color: colors.textLight }]}>
            By continuing, you agree to our{' '}
            <Text style={{ color: colors.primary, fontWeight: '600' }}>Terms</Text> and{' '}
            <Text style={{ color: colors.primary, fontWeight: '600' }}>Privacy Policy</Text>
          </Text>
        </SlideInView>
      </View>
    </View>
  );
}

function FeatureCard({ icon, title, desc, colors }) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.95, friction: 8, tension: 200, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, friction: 8, tension: 200, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, styles.featureCardWrap]}>
      <View style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.featureIcon, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.featureDesc, { color: colors.textLight }]}>{desc}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  hero: { alignItems: 'center', paddingBottom: 36, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden' },
  decorCircle1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.07)', top: -40, right: -60 },
  decorCircle2: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.05)', bottom: 20, left: -30 },
  decorCircle3: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.04)', top: 60, left: 40 },
  logoOuter: { width: 88, height: 88, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)', marginBottom: spacing.lg },
  logoInner: { width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontSize: 34, fontWeight: '800', color: '#FFF', textAlign: 'center', letterSpacing: 0.5 },
  heroSubtitle: { fontSize: 17, color: 'rgba(255,255,255,0.85)', fontWeight: '500', textAlign: 'center', marginTop: 4 },
  langPill: { marginTop: spacing.lg, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  langPillText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  content: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xxl },
  tagline: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: spacing.xxl, lineHeight: 28, letterSpacing: -0.3 },
  features: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xxxl },
  featureCardWrap: { flex: 1 },
  featureCard: { alignItems: 'center', paddingVertical: spacing.lg, paddingHorizontal: spacing.sm, borderRadius: borderRadius.lg, borderWidth: 1, ...shadows.sm },
  featureIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  featureTitle: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  featureDesc: { fontSize: 11, fontWeight: '500', textAlign: 'center' },

  buttonGroup: { gap: spacing.md },
  outlineBtn: { height: 54, borderRadius: borderRadius.lg, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', ...shadows.sm },
  outlineBtnText: { fontSize: 17, fontWeight: '600' },
  gradientBtn: { height: 54, borderRadius: borderRadius.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', ...shadows.md },
  gradientBtnText: { fontSize: 17, fontWeight: '700', color: '#FFF' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.md },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: spacing.md, fontSize: 13, fontWeight: '500' },
  terms: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
