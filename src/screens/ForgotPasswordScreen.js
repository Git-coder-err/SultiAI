import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { spacing } from '../theme';

export default function ForgotPasswordScreen({ navigation }) {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleReset = () => {
    if (!email) return Alert.alert('Error', 'Please enter your email');
    setSent(true);
  };

  return (
    <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Button title="" icon="arrow-back" variant="ghost" textStyle={{ color: '#fff' }} onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start', marginBottom: spacing.xl }} />

          <Ionicons name="lock-closed" size={64} color="#fff" style={{ marginBottom: spacing.lg }} />
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter your email and we'll send you reset instructions.</Text>

          {sent ? (
            <View style={[styles.sentCard, { backgroundColor: colors.surface }]}>
              <Ionicons name="checkmark-circle" size={48} color={colors.success} />
              <Text style={[styles.sentTitle, { color: colors.text }]}>Email Sent!</Text>
              <Text style={[styles.sentDesc, { color: colors.textSecondary }]}>Check your inbox for reset instructions.</Text>
              <Button title="Back to Login" variant="outline" onPress={() => navigation.goBack()} style={{ marginTop: spacing.xl }} />
            </View>
          ) : (
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <Input
                id="resetEmail"
                name="resetEmail"
                label="Email Address"
                icon="mail-outline"
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoComplete="email"
                testID="resetEmail-input"
              />
              <Button title="Send Reset Link" onPress={handleReset} gradient fullWidth />
              <Button title="Back to Login" variant="ghost" onPress={() => navigation.goBack()} style={{ marginTop: spacing.md }} />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xxl },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: spacing.xxl },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: spacing.xxl, elevation: 8 },
  sentCard: { backgroundColor: '#fff', borderRadius: 20, padding: spacing.xxl, alignItems: 'center', elevation: 8 },
  sentTitle: { fontSize: 20, fontWeight: '700', marginTop: spacing.md },
  sentDesc: { fontSize: 14, textAlign: 'center', marginTop: spacing.sm },
});
