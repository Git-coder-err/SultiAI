import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import LoadingState from '../components/LoadingState';
import FloatingTabBar from '../components/FloatingTabBar';
import { spacing } from '../theme';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import HoyTutorScreen from '../screens/HoyTutorScreen';
import ConversationScreen from '../screens/ConversationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PronunciationScreen from '../screens/PronunciationScreen';
import FlashcardsScreen from '../screens/FlashcardsScreen';
import VocabularyReviewScreen from '../screens/VocabularyReviewScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import CommunityScreen from '../screens/CommunityScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ARSceneScreen from '../screens/ARSceneScreen';
import VoiceModeScreen from '../screens/VoiceModeScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={DashboardScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Practice" component={ConversationScreen} options={{ tabBarLabel: 'Practice' }} />
      <Tab.Screen name="Learn" component={HoyTutorScreen} options={{ tabBarLabel: 'Tutor' }} />
      <Tab.Screen name="Community" component={CommunityScreen} options={{ tabBarLabel: 'Community' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useUser();
  const { colors } = useTheme();

  if (loading) return <LoadingState fullScreen message="Loading SultiAI..." />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Pronunciation" component={PronunciationScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="Flashcards" component={FlashcardsScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="VocabularyReview" component={VocabularyReviewScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="Achievements" component={AchievementsScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="ARScene" component={ARSceneScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="VoiceMode" component={VoiceModeScreen} options={{ presentation: 'modal', animation: 'fade' }} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ animation: 'slide_from_right' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ animation: 'slide_from_right' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
