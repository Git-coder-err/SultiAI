import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const savedToken = await AsyncStorage.getItem('auth_token');
        if (savedToken) {
          setToken(savedToken);
          const profile = await api.getProfile();
          setUser(profile);
        }
      } catch {
        await AsyncStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = async (email, password) => {
    const res = await api.signIn(email, password);
    await AsyncStorage.setItem('auth_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const signUp = async (email, password, name, native_language, target_language) => {
    const res = await api.signUp(email, password, name, native_language, target_language);
    await AsyncStorage.setItem('auth_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const profile = await api.getProfile();
      setUser(profile);
    } catch {}
  };

  return (
    <UserContext.Provider value={{ user, token, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
