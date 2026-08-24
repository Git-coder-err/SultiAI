import React, { useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useTheme } from '../context/ThemeContext';
import { borderRadius, spacing, shadows } from '../theme';

// Warm up the browser on Android for smoother UX
if (Platform.OS === 'android') {
  WebBrowser.maybeCompleteAuthSession();
}

export default function GoogleSignInButton({ loading: externalLoading, style }) {
  const { colors } = useTheme();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const handleGoogleSignIn = useCallback(async () => {
    try {
      const redirectUrl = Linking.createURL('/', { scheme: 'sultiai' });
      const { createdSessionId, setActive } = await startOAuthFlow({ redirectUrl });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.warn('[GoogleSignIn] Error:', err.message || err);
    }
  }, [startOAuthFlow]);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handleGoogleSignIn}
      disabled={externalLoading}
      style={[styles.button, { backgroundColor: colors.surface, borderColor: colors.border }, style]}
    >
      {externalLoading ? (
        <ActivityIndicator size="small" color={colors.text} style={styles.icon} />
      ) : (
        <Ionicons name="logo-google" size={20} color="#EA4335" style={styles.icon} />
      )}
      <Text style={[styles.text, { color: colors.text }]}>Continue with Google</Text>
    </TouchableOpacity>
  );
}

function Divider({ text = 'or', colors }) {
  return (
    <View style={styles.dividerRow}>
      <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
      <Text style={[styles.dividerText, { color: colors.textLight }]}>{text}</Text>
      <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
    </View>
  );
}

export { Divider };

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  icon: { marginRight: spacing.sm },
  text: { fontSize: 16, fontWeight: '600' },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: 13,
    fontWeight: '500',
  },
});
