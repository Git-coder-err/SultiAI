import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../theme';
import { useAccessibility } from '../hooks/useAccessibility';

const THEME_MODE_KEY = 'theme_mode';
const VALID_MODES = ['system', 'light', 'dark'];

const ThemeContext = createContext(/** @type {any} */ (null));

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState('light');
  const [loading, setLoading] = useState(true);
  const {
    reduceMotion, highContrast, largeText, loaded: a11yLoaded,
    toggleReduceMotion, toggleHighContrast, toggleLargeText,
    getAnimationDuration, getSpringConfig, getTextStyle, getContrastColor,
  } = useAccessibility();

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_MODE_KEY);
        if (stored && VALID_MODES.includes(stored)) {
          setThemeModeState(stored);
        }
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, []);

  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');

  const setThemeMode = async (mode) => {
    if (!VALID_MODES.includes(mode)) return;
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_MODE_KEY, mode);
    } catch {}
  };

  const toggleTheme = () => setThemeMode(isDark ? 'light' : 'dark');
  const setDarkMode = (value) => setThemeMode(value ? 'dark' : 'light');

  const colors = isDark ? darkColors : lightColors;

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }} />
    );
  }

  return (
    <ThemeContext.Provider
      value={{
        isDark, colors, themeMode, loading, toggleTheme, setDarkMode, setThemeMode,
        reduceMotion, highContrast, largeText, a11yLoaded,
        toggleReduceMotion, toggleHighContrast, toggleLargeText,
        getAnimationDuration, getSpringConfig, getTextStyle, getContrastColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
