import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Animated,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { spacing, borderRadius, shadows } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Slide-in wrapper for staggered animations ───────────────────────
function SlideInView({ delay = 0, children, style }) {
  const { colors } = useTheme();
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

// ─── Main LoginScreen ────────────────────────────────────────────────
export default function LoginScreen({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { signIn, signUp } = useUser();
  const [mode, setMode] = useState('landing'); // 'landing' | 'signin' | 'signup'

  // Logo animation
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const heroFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
      Animated.timing(heroFade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  // ── Landing ──────────────────────────────────────────────────────
  if (mode === 'landing') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={[colors.primary, colors.gradientB]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + 44 }]}
        >
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />

          <Animated.View style={[styles.logoOuter, { transform: [{ scale: logoScale }] }]}>
            <View style={styles.logoInner}>
              <Ionicons name="language" size={36} color="#fff" />
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: heroFade, alignItems: 'center' }}>
            <Text style={styles.heroTitle}>SultiAI</Text>
            <Text style={styles.heroSubtitle}>Learn Bisaya with AI</Text>
          </Animated.View>

          <Animated.View style={[styles.langPill, { opacity: heroFade }]}>
            <Text style={styles.langPillText}>🇵🇭 Bisaya · Tagalog · English</Text>
          </Animated.View>
        </LinearGradient>

        <View style={styles.content}>
          <SlideInView delay={200}>
            <Text style={[styles.tagline, { color: colors.text }]}>
              Your AI-powered language partner{'\n'}for conversational fluency
            </Text>
          </SlideInView>

          <SlideInView delay={300} style={styles.features}>
            <FeatureCard icon="chatbubble-ellipses" title="AI Tutor" desc="Real-time conversations" colors={colors} />
            <FeatureCard icon="mic" title="Voice Practice" desc="Pronunciation coaching" colors={colors} />
            <FeatureCard icon="people" title="Community" desc="Learn with others" colors={colors} />
          </SlideInView>

          <SlideInView delay={400} style={[styles.buttonGroup, { marginBottom: insets.bottom + 16 }]}>
            <GoogleBtn colors={colors} />
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textLight }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>
            <TouchableOpacity activeOpacity={0.7} onPress={() => setMode('signin')}
              style={[styles.outlineBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="mail-outline" size={18} color={colors.text} style={{ marginRight: 8 }} />
              <Text style={[styles.outlineBtnText, { color: colors.text }]}>Sign In with Email</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} onPress={() => setMode('signup')}>
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

  // ── Sign In / Sign Up forms ──────────────────────────────────────
  return (
    <AuthForm
      mode={mode}
      onBack={() => setMode('landing')}
      onSwitch={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
      signIn={signIn}
      signUp={signUp}
      colors={colors}
      insets={insets}
      navigation={navigation}
    />
  );
}

// ─── Auth Form (Sign In + Sign Up) ──────────────────────────────────
function AuthForm({ mode, onBack, onSwitch, signIn, signUp, colors, insets, navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isSignUp = mode === 'signup';

  // Staggered form animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSubmit = useCallback(async () => {
    setError('');
    if (isSignUp && !name.trim()) { setError('Please enter your name.'); return; }
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (!password) { setError('Please enter your password.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (isSignUp && !/\S+@\S+\.\S+/.test(email.trim())) { setError('Please enter a valid email.'); return; }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email.trim(), password, name.trim());
      } else {
        await signIn(email.trim(), password);
      }
      // Navigation happens automatically via UserContext → AppNavigator
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, password, name, isSignUp, signIn, signUp]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.formHeader, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Animated.Text style={[styles.formHeaderTitle, { color: colors.text, transform: [{ translateX: headerSlide }] }]}>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </Animated.Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.formScroll} keyboardShouldPersistTaps="handled">
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={[styles.formTitle, { color: colors.text }]}>
            {isSignUp ? 'Join SultiAI' : 'Sign in to continue'}
          </Text>
          <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
            {isSignUp ? 'Start your Bisaya learning journey today' : 'Welcome back! Ready to practice?'}
          </Text>

          {/* Google sign-in */}
          <GoogleBtn colors={colors} style={{ marginBottom: spacing.md }} />
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textLight }]}>or continue with email</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Name field (sign-up only) */}
          {isSignUp && (
            <SlideInView delay={100}>
              <InputField label="Full Name" icon="person-outline" value={name}
                onChangeText={setName} placeholder="Juan Dela Cruz" colors={colors}
                autoComplete="name" />
            </SlideInView>
          )}

          <SlideInView delay={isSignUp ? 150 : 100}>
            <InputField label="Email Address" icon="mail-outline" value={email}
              onChangeText={setEmail} placeholder="your@email.com" colors={colors}
              keyboardType="email-address" autoComplete="email" />
          </SlideInView>

          <SlideInView delay={isSignUp ? 200 : 150}>
            <InputField label="Password" icon="lock-closed-outline" value={password}
              onChangeText={setPassword} placeholder="At least 6 characters" colors={colors}
              secureTextEntry={!showPassword} autoComplete={isSignUp ? 'new-password' : 'password'}
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPassword(!showPassword)} />
          </SlideInView>

          {/* Error */}
          {!!error && (
            <SlideInView delay={0}>
              <View style={[styles.errorBox, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            </SlideInView>
          )}

          {/* Submit button */}
          <SlideInView delay={isSignUp ? 250 : 200} style={{ marginTop: spacing.sm }}>
            <TouchableOpacity activeOpacity={0.8} onPress={handleSubmit} disabled={loading}>
              <LinearGradient
                colors={loading ? [colors.border, colors.border] : [colors.primary, colors.primaryDark || colors.primary]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.submitBtn}>
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </SlideInView>

          {/* Switch mode */}
          <SlideInView delay={isSignUp ? 300 : 250}>
            <TouchableOpacity onPress={onSwitch} style={styles.switchRow}>
              <Text style={[styles.switchText, { color: colors.textSecondary }]}>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </Text>
              <Text style={[styles.switchLink, { color: colors.primary }]}>
                {isSignUp ? ' Sign In' : ' Create Account'}
              </Text>
            </TouchableOpacity>
          </SlideInView>

          {!isSignUp && (
            <SlideInView delay={300}>
              <TouchableOpacity onPress={() => navigation?.navigate?.('ForgotPassword')} style={styles.forgotRow}>
                <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot password?</Text>
              </TouchableOpacity>
            </SlideInView>
          )}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Google Sign-In Button ───────────────────────────────────────────
function GoogleBtn({ colors, style }) {
  const [loading, setLoading] = useState(false);

  const handlePress = useCallback(async () => {
    try {
      setLoading(true);
      const { useOAuth } = await import('@clerk/expo');
      // Google OAuth is optional — only works if Clerk is configured
      console.log('[Google] OAuth not configured yet — use email sign-in');
    } catch {
      console.log('[Google] Clerk not available — use email sign-in');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={handlePress} disabled={loading}
      style={[styles.googleBtn, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>
      {loading ? (
        <ActivityIndicator size="small" color={colors.text} style={{ marginRight: 8 }} />
      ) : (
        <Ionicons name="logo-google" size={20} color="#EA4335" style={{ marginRight: 8 }} />
      )}
      <Text style={[styles.googleBtnText, { color: colors.text }]}>Continue with Google</Text>
    </TouchableOpacity>
  );
}

// ─── Reusable Input ─────────────────────────────────────────────────
function InputField({ label, icon, value, onChangeText, placeholder, colors, secureTextEntry,
  keyboardType, autoComplete, rightIcon, onRightIconPress }) {
  const [focused, setFocused] = useState(false);
  const borderColor = focused ? colors.primary : colors.border;

  return (
    <View style={styles.inputWrap}>
      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.inputRow, { backgroundColor: colors.surfaceSecondary, borderColor }]}>
        <Ionicons name={icon} size={20} color={focused ? colors.primary : colors.textLight}
          style={{ marginRight: 8 }} />
        <TextInput style={[styles.input, { color: colors.text }]} value={value}
          onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.textLight}
          secureTextEntry={secureTextEntry} keyboardType={keyboardType} autoComplete={autoComplete}
          autoCapitalize="none" onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={{ padding: 4 }}>
            <Ionicons name={rightIcon} size={20} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Feature Card ───────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, colors }) {
  return (
    <View style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.featureIcon, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.featureDesc, { color: colors.textLight }]}>{desc}</Text>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },

  // Hero
  hero: { alignItems: 'center', paddingBottom: 36, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden' },
  decorCircle1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.07)', top: -40, right: -60 },
  decorCircle2: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.05)', bottom: 20, left: -30 },
  logoOuter: { width: 88, height: 88, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)', marginBottom: spacing.lg },
  logoInner: { width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontSize: 34, fontWeight: '800', color: '#FFF', textAlign: 'center', letterSpacing: 0.5 },
  heroSubtitle: { fontSize: 17, color: 'rgba(255,255,255,0.85)', fontWeight: '500', textAlign: 'center', marginTop: 4 },
  langPill: { marginTop: spacing.lg, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  langPillText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Content
  content: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xxl },
  tagline: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: spacing.xxl, lineHeight: 28, letterSpacing: -0.3 },
  features: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xxxl },
  featureCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.lg, paddingHorizontal: spacing.sm, borderRadius: borderRadius.lg, borderWidth: 1, ...shadows.sm },
  featureIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  featureTitle: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  featureDesc: { fontSize: 11, fontWeight: '500', textAlign: 'center' },

  // Buttons
  buttonGroup: { gap: spacing.md },
  googleBtn: { height: 52, borderRadius: borderRadius.lg, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', ...shadows.sm },
  googleBtnText: { fontSize: 16, fontWeight: '600' },
  outlineBtn: { height: 54, borderRadius: borderRadius.lg, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', ...shadows.sm },
  outlineBtnText: { fontSize: 17, fontWeight: '600' },
  gradientBtn: { height: 54, borderRadius: borderRadius.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', ...shadows.md },
  gradientBtnText: { fontSize: 17, fontWeight: '700', color: '#FFF' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.md },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: spacing.md, fontSize: 13, fontWeight: '500' },
  terms: { fontSize: 12, textAlign: 'center', lineHeight: 18 },

  // Form
  formHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  formHeaderTitle: { fontSize: 17, fontWeight: '600' },
  formScroll: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  formTitle: { fontSize: 28, fontWeight: '800', marginBottom: spacing.sm },
  formSubtitle: { fontSize: 15, marginBottom: spacing.xxl },

  // Input
  inputWrap: { marginBottom: spacing.lg },
  inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: spacing.sm },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.md, borderWidth: 1.5, paddingHorizontal: spacing.md },
  input: { flex: 1, paddingVertical: 14, fontSize: 16 },

  // Error
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: spacing.md, borderRadius: borderRadius.sm, borderWidth: 1, marginBottom: spacing.sm },
  errorText: { fontSize: 13, fontWeight: '500', color: '#DC2626', flex: 1 },

  // Submit
  submitBtn: { height: 54, borderRadius: borderRadius.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', ...shadows.md },
  submitBtnText: { fontSize: 17, fontWeight: '700', color: '#FFF' },

  // Switch
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xxl },
  switchText: { fontSize: 15 },
  switchLink: { fontSize: 15, fontWeight: '700' },
  forgotRow: { alignItems: 'center', marginTop: spacing.lg },
  forgotText: { fontSize: 14, fontWeight: '600' },
});
