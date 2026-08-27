import React, { useState, useCallback } from 'react';
import {
  TouchableOpacity, Text, View, StyleSheet, ActivityIndicator, Alert, Platform,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

function getRedirectTo() {
  if (Platform.OS === 'web') {
    return window.location.origin;
  }
  return 'sultiai://callback';
}

export default function GoogleSignInButton({ onSuccess, onError, label, style }) {
  const [loading, setLoading] = useState(false);

  const handlePress = useCallback(async () => {
    try {
      setLoading(true);

      const redirectTo = getRedirectTo();
      console.log('[GoogleAuth] Starting OAuth flow, platform:', Platform.OS, 'redirectTo:', redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        console.error('[GoogleAuth] Supabase OAuth error:', error.message);
        throw error;
      }

      console.log('[GoogleAuth] OAuth URL received:', data?.url ? 'yes' : 'no');

      if (data?.url) {
        if (Platform.OS === 'web') {
          window.location.href = data.url;
          return;
        }

        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectTo,
          { showInRecents: true, preferEphemeralSession: false }
        );

        console.log('[GoogleAuth] Browser result type:', result.type);

        if (result.type === 'success') {
          if (onSuccess) onSuccess();
        } else if (result.type === 'cancel') {
          console.log('Google sign-in cancelled');
        } else {
          const msg = 'Google sign-in was dismissed or failed.';
          if (onError) onError(msg);
        }
      }
    } catch (err) {
      console.error('[GoogleAuth] Error:', err.message || err);
      const msg = err?.message || 'Google sign-in failed. Please try again.';
      if (onError) onError(msg);
      else Alert.alert('Sign-In Error', msg);
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      disabled={loading}
      style={[styles.btn, style, loading && styles.btnDisabled]}
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
    opacity: 0.6,
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
