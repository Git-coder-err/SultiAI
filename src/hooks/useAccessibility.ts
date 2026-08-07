import { useState, useEffect } from 'react';
import { AccessibilityInfo, Appearance, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESSIBILITY_PREFS_KEY = 'sultiai_accessibility_prefs';

interface AccessibilityPrefs {
  reduceMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReaderEnabled: boolean;
}

const DEFAULT_PREFS: AccessibilityPrefs = {
  reduceMotion: false,
  highContrast: false,
  largeText: false,
  screenReaderEnabled: false,
};

export function useAccessibility() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(Appearance.getColorScheme() === 'dark');
  const [prefs, setPrefs] = useState<AccessibilityPrefs>(DEFAULT_PREFS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadPrefs();

    const motionSub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (value) => {
        setReduceMotion(value);
        updatePref('reduceMotion', value);
      }
    );

    const screenReaderSub = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (value) => {
        setScreenReaderEnabled(value);
        updatePref('screenReaderEnabled', value);
      }
    );

    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      setReduceMotion(value);
      updatePref('reduceMotion', value);
    });

    AccessibilityInfo.isScreenReaderEnabled().then((value) => {
      setScreenReaderEnabled(value);
      updatePref('screenReaderEnabled', value);
    });

    return () => {
      motionSub.remove();
      screenReaderSub.remove();
    };
  }, []);

  const loadPrefs = async () => {
    try {
      const stored = await AsyncStorage.getItem(ACCESSIBILITY_PREFS_KEY);
      if (stored) {
        setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(stored) });
      }
    } catch {
      setPrefs(DEFAULT_PREFS);
    } finally {
      setLoaded(true);
    }
  };

  const updatePref = (key: keyof AccessibilityPrefs, value: boolean) => {
    setPrefs((prev) => {
      const updated = { ...prev, [key]: value };
      AsyncStorage.setItem(ACCESSIBILITY_PREFS_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const toggleReduceMotion = () => updatePref('reduceMotion', !prefs.reduceMotion);
  const toggleHighContrast = () => updatePref('highContrast', !prefs.highContrast);
  const toggleLargeText = () => updatePref('largeText', !prefs.largeText);

  const getAnimationDuration = (baseDuration: number): number => {
    return reduceMotion ? 0 : baseDuration;
  };

  const getSpringConfig = (baseConfig: Record<string, unknown>) => {
    return reduceMotion
      ? { ...baseConfig, tension: 300, friction: 30 }
      : baseConfig;
  };

  const getTextStyle = (baseStyle: Record<string, unknown>) => {
    return prefs.largeText
      ? { ...baseStyle, fontSize: ((baseStyle.fontSize as number) || 16) * 1.2 }
      : baseStyle;
  };

  const getContrastColor = (lightColor: string, darkColor: string): string => {
    if (prefs.highContrast) {
      return isDarkMode ? '#FFFFFF' : '#000000';
    }
    return isDarkMode ? darkColor : lightColor;
  };

  return {
    reduceMotion,
    screenReaderEnabled,
    isDarkMode,
    ...prefs,
    loaded,
    toggleReduceMotion,
    toggleHighContrast,
    toggleLargeText,
    updatePref,
    getAnimationDuration,
    getSpringConfig,
    getTextStyle,
    getContrastColor,
  };
}
