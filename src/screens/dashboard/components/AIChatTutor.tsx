import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../context/ThemeContext';
import { spacing, borderRadius } from '../../../theme';

interface AIChatTutorProps {
  onOpenTutor?: () => void;
  navigation?: any;
}

const QUICK_ACTIONS = [
  { icon: 'language', label: 'Translate', situation: 'Translate common phrases', color: '#A78BFA' },
  { icon: 'book', label: 'Grammar', situation: 'Grammar lesson', color: '#5EEAD4' },
  { icon: 'chatbubbles', label: 'Practice', situation: 'Practice conversational Bisaya', color: '#FCA5A5' },
  { icon: 'airplane', label: 'Travel', situation: 'Travel and directions', color: '#FCD34D' },
];

export function AIChatTutor({ onOpenTutor, navigation }: AIChatTutorProps) {
  const { colors, getAnimationDuration } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: getAnimationDuration(600), useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 9, tension: 160, useNativeDriver: true }),
    ]).start();
  }, [getAnimationDuration]);

  const handleAction = (situation: string) => {
    if (navigation) {
      navigation.navigate('SULTI', { situation, label: situation });
    } else if (onOpenTutor) {
      onOpenTutor();
    }
  };

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <LinearGradient
        colors={[colors.primary, '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Ionicons name="sparkles" size={20} color="#fff" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>AI TUTOR</Text>
            <Text style={styles.title}>Ask SULTI</Text>
            <Text style={styles.subtitle}>Practice Bisaya with me — anytime.</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActions}>
          {QUICK_ACTIONS.map((action, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.quickAction, { backgroundColor: 'rgba(255,255,255,0.14)', borderColor: 'rgba(255,255,255,0.25)' }]}
              onPress={() => handleAction(action.situation)}
              activeOpacity={0.8}
            >
              <Ionicons name={action.icon as any} size={16} color={action.color} />
              <Text style={styles.quickActionText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.ctaButton} onPress={onOpenTutor} activeOpacity={0.85}>
          <Text style={styles.ctaText}>Open SULTI Tutor</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  card: { borderRadius: borderRadius.xl, padding: spacing.xl, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, color: 'rgba(255,255,255,0.7)', marginBottom: 2 },
  title: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  subtitle: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  quickActions: { gap: spacing.sm, paddingVertical: spacing.xs },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  quickActionText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#fff',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
  },
  ctaText: { fontSize: 14, fontWeight: '700' },
});