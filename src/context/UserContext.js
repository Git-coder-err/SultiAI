import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState(null);

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
