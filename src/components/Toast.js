import React, { createContext, useState, useContext, useCallback, useRef, useEffect } from 'react';
import { View, Animated, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const showToast = useCallback((message, { type = 'info', duration = 3000, icon } = {}) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type, icon }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const success = useCallback((msg, opts) => showToast(msg, { ...opts, type: 'success', icon: 'checkmark-circle' }), [showToast]);
  const error = useCallback((msg, opts) => showToast(msg, { ...opts, type: 'error', icon: 'alert-circle' }), [showToast]);
  const info = useCallback((msg, opts) => showToast(msg, { ...opts, type: 'info', icon: 'information-circle' }), [showToast]);
  const warning = useCallback((msg, opts) => showToast(msg, { ...opts, type: 'warning', icon: 'warning' }), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      <View style={[styles.container, { top: insets.top + 10 }]} pointerEvents="box-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} colors={colors} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, colors }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  const colorMap = {
    success: colors.success,
    error: colors.error,
    info: colors.primary,
    warning: colors.accent,
  };
  const bgColor = colorMap[toast.type] || colors.primary;

  return (
    <Animated.View style={[styles.toast, { backgroundColor: colors.card, borderLeftColor: bgColor, opacity, transform: [{ translateY }] }]}>
      {toast.icon && <Ionicons name={toast.icon} size={20} color={bgColor} style={{ marginRight: spacing.sm }} />}
      <Text style={[styles.text, { color: colors.text }]}>{toast.message}</Text>
    </Animated.View>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  container: { position: 'absolute', left: 16, right: 16, zIndex: 9999 },
  toast: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.md, padding: spacing.lg, marginBottom: spacing.sm, borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6 },
  text: { fontSize: 14, fontWeight: '500', flex: 1 },
});
