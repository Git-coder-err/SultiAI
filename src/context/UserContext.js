import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth, useUser as useClerkUser } from '@clerk/expo';
import { api } from '../services/api';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState(null);
  const { isSignedIn, getToken, signOut: clerkSignOut } = useAuth();
  const { user: clerkUser } = useClerkUser();

  // Sync Clerk auth state with backend
  useEffect(() => {
    (async () => {
      try {
        if (isSignedIn && clerkUser) {
          // Get Clerk JWT token
          const clerkToken = await getToken();

          // Send to backend to create/sync user and get backend token
          const res = await api.clerkSync(clerkUser.id, clerkToken, {
            email: clerkUser.primaryEmailAddress?.emailAddress,
            name: clerkUser.fullName || clerkUser.firstName || 'User',
            avatar: clerkUser.imageUrl,
          });

          await AsyncStorage.setItem('auth_token', res.accessToken);
          setToken(res.accessToken);
          setUser(res.user || await api.getProfile());
        } else if (!isSignedIn) {
          // Check for existing backend token (offline / legacy)
          const savedToken = await AsyncStorage.getItem('auth_token');
          if (savedToken) {
            setToken(savedToken);
            const profile = await api.getProfile();
            setUser(profile);
          }
        }
      } catch (err) {
        console.warn('[UserContext] Auth sync failed:', err.message);
        // Try fallback with existing token
        try {
          const savedToken = await AsyncStorage.getItem('auth_token');
          if (savedToken) {
            setToken(savedToken);
            const profile = await api.getProfile();
            setUser(profile);
          }
        } catch {
          await AsyncStorage.removeItem('auth_token');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [isSignedIn, clerkUser]);

  // Legacy sign-in (non-Clerk) for backward compatibility
  const signIn = async (email, password) => {
    const res = await api.signIn(email, password);
    await AsyncStorage.setItem('auth_token', res.accessToken);
    setToken(res.accessToken);
    setUser(await api.getProfile());
  };

  const signUp = async (email, password, name, native_language, target_language) => {
    const res = await api.signUp(email, password, name, native_language, target_language);
    await AsyncStorage.setItem('auth_token', res.accessToken);
    setToken(res.accessToken);
    setUser(await api.getProfile());
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch {}
    setToken(null);
    setUser(null);

    // Also sign out from Clerk if signed in
    if (isSignedIn) {
      try {
        await clerkSignOut();
      } catch {}
    }
  };

  const refreshProfile = async () => {
    try {
      const profile = await api.getProfile();
      setUser(profile);
    } catch {}
  };

  const refreshLevel = async () => {
    try {
      const lvl = await api.getTutorLevel();
      setLevel(lvl);
    } catch {}
  };

  return (
    <UserContext.Provider value={{ user, token, loading, level, refreshLevel, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
