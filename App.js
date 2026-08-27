import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UserProvider } from './src/context/UserContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { GameProvider } from './src/context/GameContext';
import { ToastProvider } from './src/components/Toast';
import ErrorBoundary from './src/components/ErrorBoundary';
import { LevelUpCelebration } from './src/components';
import AppNavigator from './src/navigation/AppNavigator';
import { supabase } from './src/lib/supabase';

function AppContent() {
  const { isDark } = useTheme();

  // Handle deep links for OAuth callbacks
  useEffect(() => {
    const handleUrl = async ({ url }) => {
      if (url) {
        // Handle Supabase OAuth callback
        if (url.includes('#access_token') || url.includes('code=')) {
          // Supabase handles the token exchange automatically
          // The onAuthStateChange listener in UserContext will pick up the session
          console.log('[App] OAuth callback received:', url.substring(0, 50) + '...');
        }
      }
    };

    // Listen for incoming URLs
    const subscription = Linking.addEventListener('url', handleUrl);

    // Check if app was opened with a URL
    Linking.getInitialURL().then(handleUrl);

    return () => subscription?.remove();
  }, []);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <GameProvider>
        <ToastProvider>
          <AppNavigator />
          <LevelUpCelebration />
        </ToastProvider>
      </GameProvider>
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <UserProvider>
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </UserProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
