import React, { createContext, useState, useEffect, useCallback, useContext, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [level, setLevel] = useState(null);
  const mountedRef = useRef(true);

  // On mount, check for saved token and load profile
  useEffect(() => {
    let cancelled = false;
    mountedRef.current = true;

    (async () => {
      try {
        const savedToken = await AsyncStorage.getItem('auth_token');
        if (!savedToken || cancelled) {
          setLoading(false);
          return;
        }

        // Set token so API calls work
        if (!cancelled) setToken(savedToken);

        try {
          const profile = await api.getProfile();
          if (!cancelled) {
            setUser(profile);
            setAuthError(null);
          }
        } catch {
          // Token expired or invalid — clear it
          await AsyncStorage.removeItem('auth_token');
          if (!cancelled) {
            setToken(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.warn('[UserContext] Init error:', err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    setAuthError(null);
    try {
      const res = await api.signIn(email, password);
      const accessToken = res.accessToken;
      await AsyncStorage.setItem('auth_token', accessToken);
      if (res.refreshToken) await AsyncStorage.setItem('auth_refresh_token', res.refreshToken);
      setToken(accessToken);

      // Fetch full profile
      const profile = await api.getProfile();
      setUser(profile);
      return { success: true };
    } catch (err) {
      const message = err?.message || 'Sign in failed. Please try again.';
      setAuthError(message);
      return { success: false, error: message };
    }
  }, []);

  const signUp = useCallback(async (email, password, name, native_language, target_language) => {
    setAuthError(null);
    try {
      const res = await api.signUp(email, password, name, native_language, target_language);
      const accessToken = res.accessToken;
      await AsyncStorage.setItem('auth_token', accessToken);
      if (res.refreshToken) await AsyncStorage.setItem('auth_refresh_token', res.refreshToken);
      setToken(accessToken);

      // Fetch full profile
      const profile = await api.getProfile();
      setUser(profile);
      return { success: true };
    } catch (err) {
      const message = err?.message || 'Sign up failed. Please try again.';
      setAuthError(message);
      return { success: false, error: message };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      // Tell server to revoke refresh token (best effort)
      const refreshToken = await AsyncStorage.getItem('auth_refresh_token');
      if (refreshToken) {
        api.postData?.('/api/auth/signout', { refresh_token: refreshToken }).catch(() => {});
      }
    } catch {}

    try {
      await AsyncStorage.multiRemove(['auth_token', 'auth_refresh_token']);
    } catch {}
    setToken(null);
    setUser(null);
    setAuthError(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await api.getProfile();
      setUser(profile);
    } catch {}
  }, []);

  const refreshLevel = useCallback(async () => {
    try {
      const lvl = await api.getTutorLevel();
      setLevel(lvl);
    } catch {}
  }, []);

  return (
    <UserContext.Provider value={{
      user, token, loading, authError, level,
      refreshLevel, signIn, signUp, signOut, refreshProfile,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
