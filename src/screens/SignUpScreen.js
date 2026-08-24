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

function LanguagePicker({ label, value, onSelect, colors }) {
  const [open, setOpen] = useState(false);
  const languages = ['Bisaya', 'Tagalog', 'English'];

  return (
    <View>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setOpen(!open)}
        style={[styles.picker, { backgroundColor: colors.surface, borderColor: open ? colors.primary : colors.border }]}
      >
        <Text style={[styles.pickerText, { color: value ? colors.text : colors.textLight }]}>
          {value || `Select ${label.toLowerCase()}`}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textLight} />
      </TouchableOpacity>
      {open && (
        <View style={[styles.pickerDropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang}
              onPress={() => { onSelect(lang); setOpen(false); }}
              style={[styles.pickerOption, value === lang && { backgroundColor: colors.primary + '15' }]}
            >
              <Text style={[styles.pickerOptionText, { color: value === lang ? colors.primary : colors.text }]}>
                {lang}
              </Text>
              {value === lang && <Ionicons name="checkmark" size={16} color={colors.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function SignUpScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { signUp, authError } = useUser();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nativeLang, setNativeLang] = useState('');
  const [targetLang, setTargetLang] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState('');

  useEffect(() => {
    if (error) setError('');
  }, [name, email, password, nativeLang, targetLang]);

  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

  const handleSignUp = async () => {
    setError('');
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const result = await signUp(email.trim(), password, name.trim(), nativeLang || 'English', targetLang || 'Bisaya');
    setLoading(false);

    if (!result.success) {
      setError(result.error);
    }
    // If success, UserContext sets user → AppNavigator switches to main tabs
  };

  const inputStyle = (field) => [
    styles.inputWrap,
    {
      backgroundColor: colors.surface,
      borderColor: focusedField === field ? colors.primary : colors.border,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Create Account</Text>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <FadeSlideIn delay={0}>
            <Text style={[styles.title, { color: colors.text }]}>Join SultiAI</Text>
          </FadeSlideIn>
          <FadeSlideIn delay={50}>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Start your language learning journey today
            </Text>
          </FadeSlideIn>

          {/* Full Name */}
          <FadeSlideIn delay={100}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
            <View style={inputStyle('name')}>
              <Ionicons name="person-outline" size={18} color={focusedField === 'name' ? colors.primary : colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={name}
                onChangeText={setName}
                placeholder="Juan Dela Cruz"
                placeholderTextColor={colors.textLight}
                autoComplete="name"
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField('')}
              />
            </View>
          </FadeSlideIn>

          {/* Email */}
          <FadeSlideIn delay={150}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Email Address</Text>
            <View style={inputStyle('email')}>
              <Ionicons name="mail-outline" size={18} color={focusedField === 'email' ? colors.primary : colors.textLight} style={styles.inputIcon} />
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
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
              />
            </View>
          </FadeSlideIn>

          {/* Password */}
          <FadeSlideIn delay={200}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
            <View style={inputStyle('password')}>
              <Ionicons name="lock-closed-outline" size={18} color={focusedField === 'password' ? colors.primary : colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text, flex: 1 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="At least 6 characters"
                placeholderTextColor={colors.textLight}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textLight} />
              </TouchableOpacity>
            </View>
          </FadeSlideIn>

          {/* Language selectors */}
          <FadeSlideIn delay={250}>
            <View style={styles.langRow}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <LanguagePicker label="I speak" value={nativeLang} onSelect={setNativeLang} colors={colors} />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <LanguagePicker label="Learning" value={targetLang} onSelect={setTargetLang} colors={colors} />
              </View>
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

          {/* Create Account Button */}
          <FadeSlideIn delay={300}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSignUp}
              disabled={loading}
              style={styles.submitBtn}
            >
              <View style={[styles.submitBtnInner, { backgroundColor: colors.primary }]}>
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>Create Account</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 6 }} />
                  </>
                )}
              </View>
            </TouchableOpacity>
          </FadeSlideIn>

          {/* Switch to sign in */}
          <FadeSlideIn delay={350}>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')} style={styles.switchRow}>
              <Text style={[styles.switchText, { color: colors.textSecondary }]}>
                Already have an account?
              </Text>
              <Text style={[styles.switchLink, { color: colors.primary }]}> Sign In</Text>
            </TouchableOpacity>
          </FadeSlideIn>

          {/* Terms */}
          <FadeSlideIn delay={400}>
            <Text style={[styles.terms, { color: colors.textLight }]}>
              By continuing, you agree to our{' '}
              <Text style={{ color: colors.primary, fontWeight: '600' }}>Terms</Text> and{' '}
              <Text style={{ color: colors.primary, fontWeight: '600' }}>Privacy Policy</Text>
            </Text>
          </FadeSlideIn>
        </ScrollView>
      </KeyboardAvoidingView>
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

  langRow: { flexDirection: 'row', marginBottom: spacing.lg },

  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: borderRadius.lg,
    height: 52,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  pickerText: { fontSize: 15, fontWeight: '500' },
  pickerDropdown: {
    position: 'absolute',
    top: 34,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    zIndex: 10,
    ...shadows.md,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
  },
  pickerOptionText: { fontSize: 15, fontWeight: '500' },

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

  submitBtn: { marginTop: spacing.sm, marginBottom: spacing.md },
  submitBtnInner: { height: 54, borderRadius: borderRadius.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', ...shadows.md },
  submitBtnText: { fontSize: 17, fontWeight: '700', color: '#FFF' },

  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.sm, paddingBottom: spacing.md },
  switchText: { fontSize: 15 },
  switchLink: { fontSize: 15, fontWeight: '700' },

  terms: { fontSize: 12, textAlign: 'center', lineHeight: 18, paddingBottom: spacing.xl },
});
