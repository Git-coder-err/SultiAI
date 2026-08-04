import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Platform } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { voice } from './palette';

function Row({ icon, title, subtitle, value, onValueChange, accessibilityLabel }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={voice.primary} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: 'rgba(255,255,255,0.15)', true: 'rgba(32,214,199,0.5)' }}
        thumbColor={value ? voice.primary : '#9AA6B2'}
        accessibilityLabel={accessibilityLabel || title}
      />
    </View>
  );
}

export default function SettingsSheet({ visible, onClose, haptics, continuous, slowMode, onHaptics, onContinuous, onSlow }) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <Animated.View style={StyleSheet.absoluteFill} entering={FadeIn.duration(220)} exiting={FadeOut.duration(180)}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} accessibilityLabel="Close settings" />
      <Animated.View entering={SlideInDown.springify().damping(18)} exiting={SlideOutDown.duration(180)} style={[styles.panel, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.grabber} />
        <View style={styles.header}>
          <Text style={styles.title}>Voice Settings</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close settings">
            <Ionicons name="close" size={20} color={voice.text} />
          </TouchableOpacity>
        </View>

        <Row
          icon="vibrate-outline"
          title="Haptic feedback"
          subtitle="Subtle vibration on mic & speech events"
          value={haptics}
          onValueChange={onHaptics}
        />
        <Row
          icon="infinite-outline"
          title="Continuous conversation"
          subtitle="Automatically listen again after Hoy speaks"
          value={continuous}
          onValueChange={onContinuous}
        />
        <Row
          icon="speedometer-outline"
          title="Slow & clear"
          subtitle="Repeat after me at a slower pace"
          value={slowMode}
          onValueChange={onSlow}
        />

        <Text style={styles.footnote}>Made for learners — every reply is also read aloud word by word.</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(2, 6, 12, 0.7)' },
  panel: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: '#0B1B2C',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderWidth: 1, borderColor: voice.glassBorder,
    paddingHorizontal: 20, paddingTop: 10,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(30px)' } : {}),
  },
  grabber: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { color: voice.text, fontSize: 18, fontWeight: '800' },
  closeBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: voice.glass },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  rowIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(32,214,199,0.12)', marginRight: 12 },
  rowText: { flex: 1, paddingRight: 8 },
  rowTitle: { color: voice.text, fontSize: 15, fontWeight: '600' },
  rowSubtitle: { color: voice.textMuted, fontSize: 12, marginTop: 2 },
  footnote: { color: voice.textMuted, fontSize: 11, textAlign: 'center', marginTop: 12 },
});
