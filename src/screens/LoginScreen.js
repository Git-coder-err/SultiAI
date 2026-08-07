import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, Alert, ActivityIndicator, Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { spacing, borderRadius, typography, shadows } from '../theme';

export default function LoginScreen({ navigation }) {
  const { colors } = useTheme();
  const { signIn, signUp } = useUser();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (!email || !password) return Alert.alert('Error', 'Email and password are required');
    if (isSignUp && !name) return Alert.alert('Error', 'Name is required');
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, name, 'English', 'Bisaya');
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      style={styles.container}
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <Ionicons name="language" size={40} color="#fff" />
            </View>
            <Text style={styles.brandName}>SultiAI</Text>
            <Text style={styles.tagline}>Learn Bisaya with AI</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              {isSignUp ? 'Start your Bisaya learning journey' : 'Continue your language adventure'}
            </Text>

            {isSignUp && (
              <View style={[styles.inputGroup, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                <Ionicons name="person-outline" size={20} color={colors.textLight} style={styles.inputIcon} />
                <TextInput
                  id="fullName"
                  name="fullName"
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Full Name"
                  placeholderTextColor={colors.textLight}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoComplete="name"
                  testID="fullName-input"
                />
              </View>
            )}

            <View style={[styles.inputGroup, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
              <Ionicons name="mail-outline" size={20} color={colors.textLight} style={styles.inputIcon} />
              <TextInput
                id="email"
                name="email"
                style={[styles.input, { color: colors.text }]}
                placeholder="Email"
                placeholderTextColor={colors.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                testID="email-input"
              />
            </View>

            <View style={[styles.inputGroup, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textLight} style={styles.inputIcon} />
              <TextInput
                id="password"
                name="password"
                style={[styles.input, { color: colors.text }]}
                placeholder="Password"
                placeholderTextColor={colors.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="current-password"
                testID="password-input"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textLight} />
              </TouchableOpacity>
            </View>

            {!isSignUp && (
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotRow}>
                <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <LinearGradient colors={[colors.primary, colors.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradient}>
                  <Text style={styles.buttonText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textLight }]}>or</Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </View>

            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={styles.toggleBtn}>
              <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </Text>
              <Text style={[styles.toggleAction, { color: colors.primary }]}>{isSignUp ? 'Sign In' : 'Sign Up'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  logoContainer: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  brandName: { fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  tagline: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  card: { borderRadius: 24, padding: 24, ...shadows.xl },
  cardTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  cardSubtitle: { fontSize: 13, textAlign: 'center', marginTop: 4, marginBottom: 24 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 14, marginBottom: 14, borderWidth: 1.5 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15 },
  eyeBtn: { padding: 4 },
  forgotRow: { alignItems: 'flex-end', marginBottom: 8 },
  forgotText: { fontSize: 13, fontWeight: '600' },
  button: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  buttonDisabled: { opacity: 0.5 },
  gradient: { paddingVertical: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  divider: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 12, fontSize: 13, fontWeight: '500' },
  toggleBtn: { flexDirection: 'row', justifyContent: 'center', gap: 4 },
  toggleText: { fontSize: 14 },
  toggleAction: { fontSize: 14, fontWeight: '700' },
});
