import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/Button';
import { spacing, typography, borderRadius } from '../theme';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1', icon: 'language', title: 'Welcome to SultiAI',
    description: 'Learn Bisaya (Cebuano) the smart way with AI-powered tutoring.',
    color: '#1E6F9F',
  },
  {
    id: '2', icon: 'chatbubbles', title: 'AI Tutor "Hoy!"',
    description: 'Practice conversations with our AI tutor. Speak, listen, and get instant feedback.',
    color: '#FFB347',
  },
  {
    id: '3', icon: 'mic', title: 'Pronunciation Coach',
    description: 'Record your voice and get detailed pronunciation analysis with phoneme feedback.',
    color: '#10B981',
  },
  {
    id: '4', icon: 'trophy', title: 'Earn Rewards',
    description: 'Build streaks, earn XP, collect badges, and compete on the leaderboard.',
    color: '#8B5CF6',
  },
  {
    id: '5', icon: 'people', title: 'Join the Community',
    description: 'Connect with native speakers, share phrases, and help preserve Bisaya.',
    color: '#1E6F9F',
  },
];

export default function OnboardingScreen({ navigation }) {
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatRef = useRef(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else if (navigation) {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => {
    if (navigation) navigation.replace('Login');
  };

  const renderSlide = ({ item }) => (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.iconWrapper, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon} size={80} color={item.color} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>{item.description}</Text>
    </View>
  );

  return (
    <LinearGradient colors={['#1E6F9F', '#155A7E']} style={styles.container}>
      <View style={styles.skipRow}>
        {currentIndex < slides.length - 1 && (
          <Button title="Skip" variant="ghost" textStyle={{ color: 'rgba(255,255,255,0.8)' }} onPress={handleSkip} />
        )}
      </View>

      <FlatList
        ref={flatRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: currentIndex === i ? '#fff' : 'rgba(255,255,255,0.3)' }]} />
          ))}
        </View>
        <View style={styles.btnRow}>
          <Button title={currentIndex === slides.length - 1 ? "Get Started" : "Next"} onPress={handleNext} gradient style={{ minWidth: 160 }} />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipRow: { alignItems: 'flex-end', paddingHorizontal: spacing.xl, paddingTop: Platform.OS === 'ios' ? 60 : spacing.xxxl },
  slide: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xxxl },
  iconWrapper: { width: 160, height: 160, borderRadius: 80, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.xxxl },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: spacing.md },
  description: { fontSize: 16, lineHeight: 24, color: 'rgba(255,255,255,0.8)', textAlign: 'center', paddingHorizontal: spacing.xl },
  footer: { paddingHorizontal: spacing.xxl, paddingBottom: Platform.OS === 'ios' ? 40 : spacing.xxl, alignItems: 'center' },
  dots: { flexDirection: 'row', marginBottom: spacing.xl, gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
  btnRow: { width: '100%', alignItems: 'center' },
});
