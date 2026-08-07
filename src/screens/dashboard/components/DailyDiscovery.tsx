import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../context/ThemeContext';
import { spacing, borderRadius } from '../../../theme';

interface DailyDiscoveryProps {}

const DISCOVERIES = [
  { type: 'Cultural Fact', title: 'The Sinulog Festival', description: 'Cebu\'s biggest celebration honors the Santo Niño with vibrant dances every January.', icon: 'color-palette' },
  { type: 'Useful Expression', title: 'Palihog', description: 'Means "please" in Bisaya. Use it to politely ask for anything.', icon: 'hand-left' },
  { type: 'Common Mistake', title: 'Ko vs. Ko', description: '"Ako" means "I/Me" while "ko" is a contraction. Mind the spelling!', icon: 'alert-circle' },
  { type: 'Idiom', title: 'Walay Sapayan', description: "Literally 'no matter' — used to express that something is okay or forgivable.", icon: 'chatbubble' },
  { type: 'Travel Tip', title: 'Jeepney Routes', description: 'Look for the route number on the side. Ask the driver "Maka-abot sa [place]?"', icon: 'bus' },
];

export function DailyDiscovery({}: DailyDiscoveryProps) {
  const { colors, getAnimationDuration } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const today = DISCOVERIES[new Date().getDate() % DISCOVERIES.length];

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: getAnimationDuration(600), useNativeDriver: true }).start();
  }, [getAnimationDuration]);

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={[colors.secondary + '20', colors.accent + '10']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.header}>
          <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Ionicons name="compass" size={18} color="#fff" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Daily Discovery</Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{today.type}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.discoveryTitle}>{today.title}</Text>
        <Text style={styles.discoveryDesc}>{today.description}</Text>

        <View style={styles.footer}>
          <Ionicons name="calendar-outline" size={12} color="rgba(255,255,255,0.6)" />
          <Text style={styles.footerText}>Come back tomorrow for a new discovery!</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: spacing.xl, marginBottom: spacing.xl },
  card: { borderRadius: borderRadius.xl, padding: spacing.lg, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrapper: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: -0.2 },
  typeBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full, alignSelf: 'flex-start', marginTop: 4 },
  typeText: { fontSize: 10, fontWeight: '600', color: '#fff' },
  discoveryTitle: { fontSize: 18, fontWeight: '700', color: '#fff', letterSpacing: -0.3 },
  discoveryDesc: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.8)', lineHeight: 18 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
  footerText: { fontSize: 11, fontWeight: '500', color: 'rgba(255,255,255,0.6)' },
});
