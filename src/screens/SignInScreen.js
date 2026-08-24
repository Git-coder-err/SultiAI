import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Animated, TextInput, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, shadows } from '../theme';

/* ── Animations ──────────────────────────────────────────────────── */
function FadeSlideIn({ delay = 0, children, style }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 450, delay, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, friction: 8, tension: 50, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity: fade, transform: [{ translateY: slide }] }, style]}>
      {children}
    </Animated.View>
  );
}

/* ── Main Component ──────────────────────────────────────────────── */
export default function SignInScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { signIn, authError } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Clear error when user types
  useEffect(() => {
    if (error) setError('');
  }, [email, password]);

  // Show auth context errors
  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

  const handleSignIn = async () => {
    setError('');
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    const result = await signIn(email.trim(), password);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
    }
    // If success, UserContext sets user → AppNavigator switches to main tabs
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Sign In</Text>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <FadeSlideIn delay={0}>
            <Text style={[styles.title, { color: colors.text }]}>Welcome back</Text>
          </FadeSlideIn>
          <FadeSlideIn delay={50}>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Sign in to continue learning
            </Text>
          </FadeSlideIn>

          {/* Email */}
          <FadeSlideIn delay={100}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Email Address</Text>
            <View style={[
              styles.inputWrap,
              { backgroundColor: colors.surface, borderColor: emailFocused ? colors.primary : colors.border },
            ]}>
              <Ionicons name="mail-outline" size={18} color={emailFocused ? colors.primary : colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor={colors.textLight}
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>
          </FadeSlideIn>

          {/* Password */}
          <FadeSlideIn delay={150}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
            <View style={[
              styles.inputWrap,
              { backgroundColor: colors.surface, borderColor: passwordFocused ? colors.primary : colors.border },
            ]}>
              <Ionicons name="lock-closed-outline" size={18} color={passwordFocused ? colors.primary : colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text, flex: 1 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Your password"
                placeholderTextColor={colors.textLight}
                secureTextEntry={!showPassword}
                autoComplete="password"
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={colors.textLight}
                />
              </TouchableOpacity>
            </View>
          </FadeSlideIn>

          {/* Error */}
          {!!error && (
            <FadeSlideIn delay={0}>
              <View style={[styles.errorBox, { backgroundColor: '#FF3B3015', borderColor: '#FF3B3030' }]}>
                <Ionicons name="alert-circle" size={16} color="#FF3B30" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            </FadeSlideIn>
          )}

          {/* Sign In Button */}
          <FadeSlideIn delay={200}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSignIn}
              disabled={loading}
              style={styles.signInBtn}
            >
              <LinearGradientBg colors={[colors.primary, colors.primaryDark || colors.primary]}>
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.signInBtnText}>Sign In</Text>
                )}
              </LinearGradientBg>
            </TouchableOpacity>
          </FadeSlideIn>

          {/* Forgot Password */}
          <FadeSlideIn delay={250}>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={[styles.forgotLink, { color: colors.primary }]}>Forgot password?</Text>
            </TouchableOpacity>
          </FadeSlideIn>

          {/* Divider */}
          <FadeSlideIn delay={300}>
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textLight }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>
          </FadeSlideIn>

          {/* Sign Up Link */}
          <FadeSlideIn delay={350}>
            <TouchableOpacity
              onPress={() => navigation.navigate('SignUp')}
              style={styles.switchRow}
            >
              <Text style={[styles.switchText, { color: colors.textSecondary }]}>
                Don't have an account?
              </Text>
              <Text style={[styles.switchLink, { color: colors.primary }]}> Create Account</Text>
            </TouchableOpacity>
          </FadeSlideIn>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/* Simple gradient-like wrapper using View background */
function LinearGradientBg({ children, colors: gradientColors, style }) {
  return (
    <View style={[{ backgroundColor: gradientColors?.[0] || '#4A90D9', borderRadius: borderRadius.lg, height: 54, alignItems: 'center', justifyContent: 'center' }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600' },

  scroll: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.lg },

  title: { fontSize: 28, fontWeight: '800', marginBottom: spacing.sm },
  subtitle: { fontSize: 15, marginBottom: spacing.xxl, lineHeight: 22 },

  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginLeft: 2 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: borderRadius.lg,
    height: 52,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, paddingVertical: 0 },
  eyeBtn: { padding: 4 },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  errorText: { fontSize: 13, fontWeight: '500', color: '#FF3B30', flex: 1 },

  signInBtn: { marginTop: spacing.sm, marginBottom: spacing.md },
  signInBtnText: { fontSize: 17, fontWeight: '700', color: '#FFF' },

  forgotLink: { fontSize: 14, fontWeight: '600', textAlign: 'center', marginBottom: spacing.lg },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: spacing.md, fontSize: 13, fontWeight: '500' },

  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.sm, paddingBottom: spacing.xl },
  switchText: { fontSize: 15 },
  switchLink: { fontSize: 15, fontWeight: '700' },
});
