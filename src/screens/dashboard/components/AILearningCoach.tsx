import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../context/ThemeContext';
import { api } from '../../../services/api';
import { spacing, borderRadius } from '../../../theme';

interface AILearningCoachProps {
  onStartCoaching?: () => void;
}

const FALLBACK_RECO = {
  area: 'Food vocabulary',
  skill: 'Ordering Food in Bisaya',
  rationale: 'based on your recent activity',
  icon: 'restaurant',
};

function toText(mistake: any): string {
  if (typeof mistake === 'string') return mistake;
  if (mistake && typeof mistake === 'object') {
    return mistake.text || mistake.mistake || mistake.topic || mistake.category || '';
  }
  return '';
}

export function AILearningCoach({ onStartCoaching }: AILearningCoachProps) {
  const { colors, getAnimationDuration } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [reco, setReco] = useState(FALLBACK_RECO);

  useEffect(() => {
    let mounted = true;
    Animated.timing(fadeAnim, { toValue: 1, duration: getAnimationDuration(600), useNativeDriver: true }).start();
    (async () => {
      try {
        const mistakes = await api.getMistakes();
        const list = Array.isArray(mistakes) ? mistakes.map(toText).filter(Boolean) : [];
        if (mounted && list.length > 0) {
          setReco({
            area: list[0],
            skill: 'Practice this topic with SULTI',
            rationale: 'you struggled with this recently',
            icon: 'bulb',
          });
        }
      } catch {
      }
    })();
    return () => {
      mounted = false;
    };
  }, [getAnimationDuration]);

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#8B5CF6', '#6D28D9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.label}>RECOMMENDED FOR YOU</Text>
            <Text style={styles.title}>Practice {reco.area}</Text>
            <Text style={styles.desc}>{reco.skill}</Text>
          </View>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Ionicons name={reco.icon as any} size={22} color="#fff" />
          </View>
        </View>

        <View style={styles.rationaleRow}>
          <Ionicons name="sparkles" size={14} color="#fff" />
          <Text style={styles.rationale}>Based on {reco.rationale}</Text>
        </View>

        <TouchableOpacity style={styles.ctaButton} onPress={onStartCoaching} activeOpacity={0.85}>
          <Text style={styles.ctaText}>Start Practice</Text>
          <Ionicons name="arrow-forward" size={16} color="#6D28D9" />
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  card: { borderRadius: borderRadius.xl, padding: spacing.lg, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  headerText: { flex: 1 },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  title: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  desc: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  rationaleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  rationale: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.9)' },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#fff',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
  },
  ctaText: { fontSize: 14, fontWeight: '700', color: '#6D28D9' },
});