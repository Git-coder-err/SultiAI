import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ClerkProvider } from '@clerk/expo';
import { ConversationProvider } from '@elevenlabs/react-native';
import { UserProvider } from './src/context/UserContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { GameProvider } from './src/context/GameContext';
import { ToastProvider } from './src/components/Toast';
import ErrorBoundary from './src/components/ErrorBoundary';
import { LevelUpCelebration } from './src/components';
import AppNavigator from './src/navigation/AppNavigator';
import { tokenCache } from './src/lib/clerkTokenCache';

function AppContent() {
  const { isDark } = useTheme();
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
        <ClerkProvider tokenCache={tokenCache} publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}>
          <ConversationProvider>
          <ThemeProvider>
            <UserProvider>
              <ErrorBoundary>
                <AppContent />
              </ErrorBoundary>
            </UserProvider>
          </ThemeProvider>
          </ConversationProvider>
        </ClerkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
