import React, { useState, useCallback } from 'react';
import {
  TouchableOpacity, Text, View, StyleSheet, ActivityIndicator, Alert, Platform,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

// Complete any pending web auth sessions (required on web)
WebBrowser.maybeCompleteAuthSession();

// Replace with your Google Web Client ID from Google Cloud Console
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';

/**
 * Google sign-in button.
 * Calls onSuccess(idToken) with the Google ID token on success.
 * The parent is responsible for calling the backend and saving the JWT.
 */
export default function GoogleSignInButton({ onSuccess, onError, label, style }) {
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: GOOGLE_WEB_CLIENT_ID || undefined,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || undefined,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || undefined,
    scopes: ['profile', 'email'],
  });

  // Handle the response from Google
  React.useEffect(() => {
    if (!response) return;

    if (response.type === 'success') {
      const { idToken } = response.params;
      if (idToken && onSuccess) {
        onSuccess(idToken);
      } else {
        const msg = 'No ID token received from Google. Ensure your OAuth client is configured correctly.';
        if (onError) onError(msg);
        else Alert.alert('Sign-In Error', msg);
      }
    } else if (response.type === 'error') {
      const msg = response.error?.message || 'Google sign-in was cancelled or failed.';
      if (onError) onError(msg);
      else console.warn('Google sign-in error:', msg);
    }
  }, [response]);

  const handlePress = useCallback(async () => {
    if (!GOOGLE_WEB_CLIENT_ID && !process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID) {
      Alert.alert(
        'Google Sign-In not configured',
        'Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in your .env file to enable Google sign-in.\n\nCreate credentials at console.cloud.google.com → APIs & Services → Credentials.',
      );
      return;
    }

    try {
      setLoading(true);
      await promptAsync({
        showInRecents: true,
      });
    } catch (err) {
      console.warn('Google prompt error:', err);
      if (onError) onError(err.message);
    } finally {
      setLoading(false);
    }
  }, [promptAsync, onError]);

  const isDisabled = !request || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      disabled={isDisabled}
      style={[styles.btn, style, isDisabled && styles.btnDisabled]}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#5F6368" />
      ) : (
        <>
          <View style={styles.googleIcon}>
            <Text style={styles.googleG}>G</Text>
          </View>
          <Text style={styles.btnText}>{label || 'Continue with Google'}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

function Divider({ colors }) {
  return (
    <View style={styles.dividerRow}>
      <View style={[styles.dividerLine, { backgroundColor: colors?.border || '#E5E7EB' }]} />
      <Text style={[styles.dividerText, { color: colors?.textLight || '#9CA3AF' }]}>or</Text>
      <View style={[styles.dividerLine, { backgroundColor: colors?.border || '#E5E7EB' }]} />
    </View>
  );
}

export { Divider };

const styles = StyleSheet.create({
  btn: {
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DADCE0',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  googleIcon: {
    width: 22,
    height: 22,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
    fontFamily: Platform.OS === 'ios' ? 'GeezaPro-Bold' : 'sans-serif-medium',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C4043',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 14,
    fontSize: 13,
    fontWeight: '500',
  },
});
