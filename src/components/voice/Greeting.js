import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { voice } from './palette';

export default function Greeting({ visible, hasSpoken }) {
  if (!visible) return null;

  return (
    <Animated.View
      key={hasSpoken ? 'greeting-spoken' : 'greeting'}
      entering={FadeInDown.duration(700).delay(150)}
      exiting={FadeOutUp.duration(350)}
      style={styles.wrap}
      accessibilityRole="text"
    >
      <Animated.View entering={FadeInDown.duration(600).delay(300)} style={styles.emojiRow}>
        <Text style={styles.emoji} accessibilityElementsHidden>👋</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(450)} style={styles.titleRow}>
        <Text style={styles.title}>Hi! I'm Hoy</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(600)} style={styles.subtitleRow}>
        <LinearGradient
          colors={[voice.primary, voice.secondary]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.badge}
        >
          <Text style={styles.badgeText}>Your Bisaya AI Tutor</Text>
        </LinearGradient>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(750)} style={styles.hintRow}>
        <Text style={styles.hint}>Tap the orb or say "Hi Sulti" to begin</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: 32 },
  emojiRow: { marginBottom: 6 },
  emoji: { fontSize: 30 },
  titleRow: { marginBottom: 8 },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: voice.text,
    letterSpacing: -0.5,
  },
  subtitleRow: { marginBottom: 12 },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: { color: '#04111f', fontSize: 12, fontWeight: '800', letterSpacing: 0.3 },
  hintRow: { marginBottom: 4 },
  hint: { color: voice.textMuted, fontSize: 13, textAlign: 'center' },
});
