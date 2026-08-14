import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../context/ThemeContext';
import { BISAYA_DICTIONARY } from '../../../utils/bisayaWords';
import { speakTTS } from '../../../utils/tts';
import { api } from '../../../services/api';
import { spacing, borderRadius } from '../../../theme';

const SAVED_KEY = 'sultiai_saved_wotd';

export function PhraseOfTheDay() {
  const { colors, getAnimationDuration } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const today = BISAYA_DICTIONARY[new Date().getDate() % BISAYA_DICTIONARY.length];

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: getAnimationDuration(600), useNativeDriver: true }).start();
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SAVED_KEY);
        const map: Record<string, boolean> = raw ? JSON.parse(raw) : {};
        if (mounted) setSaved(!!map[today.bisaya]);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [getAnimationDuration]);

  const handleListen = () => {
    speakTTS(today.bisaya);
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await api.savePhrase(today.bisaya, 'Cebuano', today.category);
      let map: Record<string, boolean> = {};
      try {
        const raw = await AsyncStorage.getItem(SAVED_KEY);
        map = raw ? JSON.parse(raw) : {};
      } catch {}
      map[today.bisaya] = true;
      await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(map));
      setSaved(true);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim }]}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.header}>
          <View style={[styles.iconWrapper, { backgroundColor: colors.softOrange }]}>
            <Ionicons name="chatbubble-ellipses" size={18} color={colors.secondary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Word of the Day</Text>
          <View style={[styles.categoryBadge, { backgroundColor: colors.softPurple }]}>
            <Text style={[styles.categoryText, { color: colors.primary }]}>{today.category}</Text>
          </View>
        </View>

        <View style={styles.wordSection}>
          <Text style={[styles.word, { color: colors.text }]}>{today.bisaya}</Text>
          <Text style={[styles.english, { color: colors.textSecondary }]}>{today.english}</Text>
          <View style={styles.pronunciationRow}>
            <Ionicons name="volume-high" size={14} color={colors.accent} />
            <Text style={[styles.pronunciation, { color: colors.accent }]}>{today.pronunciation}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.accent }]} onPress={handleListen} activeOpacity={0.85}>
            <Ionicons name="volume-high" size={16} color="#fff" />
            <Text style={styles.actionText}>Listen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: saved ? colors.success + '20' : colors.surfaceSecondary, borderWidth: 1, borderColor: saved ? colors.success : colors.border }]}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Ionicons name={saved ? 'checkmark' : 'star-outline'} size={16} color={saved ? colors.success : colors.textSecondary} />
            <Text style={[styles.actionText, { color: saved ? colors.success : colors.text }]}>{saved ? 'Saved' : 'Save'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  card: { borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconWrapper: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '700', flex: 1, letterSpacing: -0.2 },
  categoryBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: borderRadius.full },
  categoryText: { fontSize: 10, fontWeight: '600' },
  wordSection: { gap: spacing.xs },
  word: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  english: { fontSize: 14, fontWeight: '500' },
  pronunciationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 2 },
  pronunciation: { fontSize: 13, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
  },
  actionText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});