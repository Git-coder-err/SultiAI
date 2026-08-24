import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSignIn, isClerkAPIResponseError } from '@clerk/clerk-expo';
import { useTheme } from '../../context/ThemeContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { spacing } from '../../theme';
import GoogleSignInButton, { Divider } from '../../components/GoogleSignInButton';

const extractErrorMessage = (err) => {
  if (isClerkAPIResponseError(err)) {
    return err.errors[0]?.longMessage || err.errors[0]?.message || 'Something went wrong';
  }
  return err?.message || 'Something went wrong';
};

export default function ClerkSignIn({ onBack }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { signIn, isLoaded, setActive } = useSignIn();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState('credentials'); // 'credentials' | 'mfa' | 'reset_code' | 'reset_password'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetFlow = () => {
    setStep('credentials');
    setCode('');
    setNewPassword('');
    setError('');
  };

  const handleSignIn = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const result = await signIn.create({ identifier: email.trim(), password });

      if (result.status === 'needs_second_factor') {
        await signIn.prepareSecondFactor({ strategy: signIn.supportedSecondFactors?.[0]?.strategy || 'totp' });
        setStep('mfa');
        return;
      }
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        return;
      }
      setError('Sign in could not be completed. Please try again.');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleMFA = async () => {
    setError('');
    if (!code.trim()) {
      setError('Please enter the verification code.');
      return;
    }
    setLoading(true);
    try {
      const result = await signIn.attemptSecondFactor({ strategy: 'totp', code: code.trim() });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResetCode = async () => {
    setError('');
    if (!email.trim()) {
      setError('Please enter your email first.');
      return;
    }
    setLoading(true);
    try {
      await signIn.create({ strategy: 'reset_password_email_code', identifier: email.trim() });
      setStep('reset_password');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError('');
    if (!code.trim() || !newPassword) {
      setError('Please enter the code and a new password.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await signIn.attemptFirstFactor({ strategy: 'reset_password_email_code', code: code.trim() });
      await signIn.resetPassword({ password: newPassword });
      const result = await signIn.create({ identifier: email.trim(), password: newPassword });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        return;
      }
      resetFlow();
      setError('Password updated. Please sign in.');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    credentials: 'Welcome back',
    mfa: 'Two-factor verification',
    reset_password: 'Reset password',
  };

  const subtitles = {
    credentials: 'Sign in to continue learning Bisaya',
    mfa: 'Enter the code from your authenticator app',
    reset_password: `We sent a code to ${email.trim()}`,
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          onPress={() => (step === 'credentials' ? onBack() : resetFlow())}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Sign In</Text>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={[styles.title, { color: colors.text }]}>{titles[step]}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitles[step]}</Text>

          {step === 'credentials' && (
            <View>
              <GoogleSignInButton style={{ marginBottom: spacing.md }} />
              <Divider colors={colors} />
              <Input
                label="Email Address"
                icon="mail-outline"
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoComplete="email"
              />
              <Input
                label="Password"
                icon="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                placeholder="Your password"
                secureTextEntry
                autoComplete="password"
              />
              {!!error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
              <Button title="Sign In" gradient fullWidth loading={loading} disabled={!isLoaded} onPress={handleSignIn} style={{ marginTop: spacing.sm }} />
              <TouchableOpacity onPress={handleRequestResetCode}>
                <Text style={[styles.link, { color: colors.primary }]}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'mfa' && (
            <View>
              <Input
                label="Verification Code"
                icon="shield-checkmark-outline"
                value={code}
                onChangeText={setCode}
                placeholder="6-digit code"
                keyboardType="number-pad"
                autoComplete="one-time-code"
              />
              {!!error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
              <Button title="Verify" gradient fullWidth loading={loading} onPress={handleMFA} style={{ marginTop: spacing.sm }} />
            </View>
          )}

          {step === 'reset_password' && (
            <View>
              <Input
                label="Reset Code"
                icon="mail-outline"
                value={code}
                onChangeText={setCode}
                placeholder="Code from your email"
                keyboardType="number-pad"
                autoComplete="one-time-code"
              />
              <Input
                label="New Password"
                icon="lock-closed-outline"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="At least 8 characters"
                secureTextEntry
                autoComplete="new-password"
              />
              {!!error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
              <Button title="Update Password & Sign In" gradient fullWidth loading={loading} onPress={handleResetPassword} style={{ marginTop: spacing.sm }} />
            </View>
          )}
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
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  title: { fontSize: 28, fontWeight: '800', marginBottom: spacing.sm },
  subtitle: { fontSize: 15, marginBottom: spacing.xxl },
  error: { fontSize: 13, fontWeight: '500', marginBottom: spacing.sm },
  link: { fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: spacing.lg },
});
