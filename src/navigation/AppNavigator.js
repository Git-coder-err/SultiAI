import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import LoadingState from '../components/LoadingState';
import BottomTabBar from '../components/BottomTabBar';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from '../screens/LoginScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
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
import NotificationsScreen from '../screens/NotificationsScreen';
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

const authScreenOptions = { animation: 'slide_from_right' };

function AuthErrorBanner({ error, onDismiss }) {
  const { colors } = useTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (error) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    } else {
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [error]);

  if (!error) return null;

  return (
    <Animated.View style={[styles.errorBanner, { backgroundColor: colors.error + '15', borderColor: colors.error + '30', opacity: fadeAnim }]}>
      <Ionicons name="alert-circle" size={18} color={colors.error} />
      <Text style={[styles.errorBannerText, { color: colors.error }]} numberOfLines={2}>{error}</Text>
      <TouchableOpacity onPress={onDismiss} style={styles.errorDismiss}>
        <Ionicons name="close" size={16} color={colors.error} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function AppNavigator() {
  const { user, loading, authError } = useUser();
  const { colors } = useTheme();
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (authError) setShowError(true);
  }, [authError]);

  if (loading) return <LoadingState fullScreen message="Loading SultiAI..." />;

  return (
    <NavigationContainer>
      <View style={{ flex: 1 }}>
        {!user && showError && authError && (
          <AuthErrorBanner error={authError} onDismiss={() => setShowError(false)} />
        )}
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          {user ? (
            <>
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen name="Pronunciation" component={PronunciationScreen} options={authScreenOptions} />
              <Stack.Screen name="Flashcards" component={FlashcardsScreen} options={authScreenOptions} />
              <Stack.Screen name="VocabularyReview" component={VocabularyReviewScreen} options={authScreenOptions} />
              <Stack.Screen name="Achievements" component={AchievementsScreen} options={authScreenOptions} />
              <Stack.Screen name="Notifications" component={NotificationsScreen} options={authScreenOptions} />
              <Stack.Screen name="Leaderboard" component={LeaderboardScreen} options={authScreenOptions} />
              <Stack.Screen name="ARScene" component={ARSceneScreen} options={authScreenOptions} />
              <Stack.Screen name="VoiceMode" component={VoiceModeScreen} options={{ presentation: 'modal', animation: 'fade' }} />
              <Stack.Screen name="WhisperAI" component={WhisperAIScreen} options={authScreenOptions} />
              <Stack.Screen name="Phrasebook" component={ConversationScreen} options={authScreenOptions} />
              <Stack.Screen name="ScenarioPractice" component={ScenarioPracticeScreen} options={authScreenOptions} />
              <Stack.Screen name="Grammar" component={GrammarScreen} options={authScreenOptions} />
              <Stack.Screen name="Listening" component={ListeningScreen} options={authScreenOptions} />
              <Stack.Screen name="Writing" component={WritingScreen} options={authScreenOptions} />
              <Stack.Screen name="Reading" component={ReadingScreen} options={authScreenOptions} />
              <Stack.Screen name="SultiSwitch" component={SultiSwitchScreen} options={authScreenOptions} />
              <Stack.Screen name="CultureNotes" component={CultureNotesScreen} options={authScreenOptions} />
              <Stack.Screen name="ReviewCenter" component={ReviewCenterScreen} options={authScreenOptions} />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} options={authScreenOptions} />
            </>
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} options={{ animation: 'fade' }} />
              <Stack.Screen name="SignIn" component={SignInScreen} options={authScreenOptions} />
              <Stack.Screen name="SignUp" component={SignUpScreen} options={authScreenOptions} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={authScreenOptions} />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} options={authScreenOptions} />
            </>
          )}
        </Stack.Navigator>
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    zIndex: 999,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  errorDismiss: {
    padding: 4,
  },
});
