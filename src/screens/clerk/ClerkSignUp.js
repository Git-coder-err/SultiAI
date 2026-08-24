import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSignUp, isClerkAPIResponseError } from '@clerk/expo';
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

export default function ClerkSignUp({ onBack }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { signUp, isLoaded, setActive } = useSignUp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setError('');
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await signUp.create({
        emailAddress: email.trim(),
        password,
        firstName: name.trim(),
      });
      await signUp.prepareVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError('');
    if (!code.trim()) {
      setError('Please enter the verification code.');
      return;
    }
    setLoading(true);
    try {
      const result = await signUp.attemptVerification({
        strategy: 'email_code',
        code: code.trim(),
      });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        return;
      }
      setError('Verification could not be completed. Please try again.');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          onPress={() => (pendingVerification ? setPendingVerification(false) : onBack())}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Create Account</Text>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {!pendingVerification ? (
            <>
              <Text style={[styles.title, { color: colors.text }]}>Join SultiAI</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Start your Bisaya learning journey today
              </Text>

              <GoogleSignInButton style={{ marginBottom: spacing.md }} />
              <Divider colors={colors} />

              <Input
                label="Full Name"
                icon="person-outline"
                value={name}
                onChangeText={setName}
                placeholder="Juan Dela Cruz"
                autoComplete="name"
              />
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
                placeholder="At least 8 characters"
                secureTextEntry
                autoComplete="new-password"
              />

              {!!error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
              <Button title="Create Account" gradient fullWidth loading={loading} disabled={!isLoaded} onPress={handleSignUp} style={{ marginTop: spacing.sm }} />
            </>
          ) : (
            <>
              <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="mail-open-outline" size={32} color={colors.primary} />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>Verify your email</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                We sent a verification code to {email.trim()}
              </Text>

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
              <Button title="Verify Email" gradient fullWidth loading={loading} onPress={handleVerify} style={{ marginTop: spacing.sm }} />
            </>
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
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'flex-start', marginBottom: spacing.lg,
  },
});
