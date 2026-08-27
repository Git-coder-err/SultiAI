import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import { spacing, borderRadius, shadows } from '../theme';

export default function ForgotPasswordScreen({ navigation }) {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async () => {
    setError('');
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'sultiai://reset-password',
      });

      if (resetError) throw resetError;
      setSent(true);
    } catch (err) {
      const message = err?.message || 'Failed to send reset email. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: 44 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Reset Password</Text>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Icon */}
          <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="lock-closed" size={40} color={colors.primary} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>Forgot Password?</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Enter your email and we'll send you a link to reset your password.
          </Text>

          {sent ? (
            /* Success state */
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.successIcon, { backgroundColor: '#34C75915' }]}>
                <Ionicons name="checkmark-circle" size={48} color="#34C759" />
              </View>
              <Text style={[styles.sentTitle, { color: colors.text }]}>Email Sent!</Text>
              <Text style={[styles.sentDesc, { color: colors.textSecondary }]}>
                Check your inbox ({email}) for reset instructions.
              </Text>
              <Text style={[styles.sentNote, { color: colors.textLight }]}>
                Didn't receive it? Check your spam folder or try again.
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.goBack()}
                style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.primaryBtnText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Form state */
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {/* Email input */}
              <Text style={[styles.label, { color: colors.textSecondary }]}>Email Address</Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Ionicons name="mail-outline" size={18} color={colors.textLight} style={styles.inputIcon} />
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
                />
              </View>

              {/* Error */}
              {!!error && (
                <View style={[styles.errorBox, { backgroundColor: '#FF3B3015', borderColor: '#FF3B3030' }]}>
                  <Ionicons name="alert-circle" size={16} color="#FF3B30" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Submit */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleReset}
                disabled={loading}
                style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.primaryBtnText}>Send Reset Link</Text>
                )}
              </TouchableOpacity>

              {/* Back */}
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
                <Text style={[styles.backLinkText, { color: colors.primary }]}>Back to Sign In</Text>
              </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600' },

  scroll: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xl, alignItems: 'center' },

  iconWrap: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },

  title: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { fontSize: 15, textAlign: 'center', marginBottom: spacing.xxl, lineHeight: 22, paddingHorizontal: spacing.md },

  card: {
    width: '100%',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.xl,
    ...shadows.md,
  },

  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginLeft: 2 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: borderRadius.lg,
    height: 52,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, paddingVertical: 0 },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  errorText: { fontSize: 13, fontWeight: '500', color: '#FF3B30', flex: 1 },

  primaryBtn: {
    height: 54,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '700', color: '#FFF' },

  backLink: { marginTop: spacing.md, alignItems: 'center' },
  backLinkText: { fontSize: 15, fontWeight: '600' },

  successIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: spacing.md },
  sentTitle: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: spacing.sm },
  sentDesc: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: spacing.sm },
  sentNote: { fontSize: 13, textAlign: 'center', marginBottom: spacing.xl },
});
