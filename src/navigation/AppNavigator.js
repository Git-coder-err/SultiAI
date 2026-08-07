import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import LoadingState from '../components/LoadingState';
import BottomTabBar from '../components/BottomTabBar';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import SultiTutorScreen from '../screens/SultiTutorScreen';
import LearnScreen from '../screens/LearnScreen';
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
import WhisperAIScreen from '../screens/WhisperAIScreen';
import ConversationScreen from '../screens/ConversationScreen';
import { ScenarioPracticeScreen, GrammarScreen, ListeningScreen, WritingScreen, ReadingScreen, SultiSwitchScreen, CultureNotesScreen, ReviewCenterScreen } from '../screens/learning/ModuleScreens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={DashboardScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Learn" component={LearnScreen} options={{ tabBarLabel: 'Learn' }} />
      <Tab.Screen name="SULTI" component={SultiTutorScreen} options={{ tabBarLabel: 'SULTI' }} />
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
            <Stack.Screen name="WhisperAI" component={WhisperAIScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="Phrasebook" component={ConversationScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="ScenarioPractice" component={ScenarioPracticeScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="Grammar" component={GrammarScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="Listening" component={ListeningScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="Writing" component={WritingScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="Reading" component={ReadingScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="SultiSwitch" component={SultiSwitchScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="CultureNotes" component={CultureNotesScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="ReviewCenter" component={ReviewCenterScreen} options={{ animation: 'slide_from_right' }} />
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
