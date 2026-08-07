import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withRepeat, withSequence, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { voice, orbCoreGradient } from './palette';

function GlassButton({ onPress, icon, label, active, color, disabled, size = 46, children }) {
  const activeStyle = active ? { backgroundColor: 'rgba(32,214,199,0.16)', borderColor: 'rgba(32,214,199,0.4)' } : null;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[styles.glassBtn, { width: size, height: size, borderRadius: size / 2 }, activeStyle, disabled && styles.disabled]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled, selected: !!active }}
    >
      {children || <Ionicons name={icon} size={20} color={active ? color || voice.primary : voice.text} />}
    </TouchableOpacity>
  );
}

function MicButton({ onPress, active, disabled }) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (active) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.12, { duration: 400, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 400, easing: Easing.inOut(Easing.sin) }),
        ),
        -1, false
      );
    } else {
      scale.value = withTiming(1, { duration: 200 });
    }
  }, [active]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.85}
        style={[styles.micBtn, active && styles.micBtnActive]}
        accessibilityRole="button"
        accessibilityLabel={active ? 'Stop recording' : 'Start recording'}
      >
        <LinearGradient
          colors={active ? ['#FF6B6B', '#E45757'] : orbCoreGradient}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.micGradient}
        >
          <Ionicons name={active ? 'stop' : 'mic'} size={26} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function VoiceControls({
  onMic, onReplay, onToggleMute, onToggleSlow, onOpenSettings, onEnd,
  recording, muted, slowMode, canReplay, disabled,
}) {
  const glassBlur = Platform.OS === 'web' ? { backdropFilter: 'blur(20px)' } : {};

  return (
    <View style={styles.wrap}>
      <View style={[styles.bar, glassBlur]}>
        <GlassButton onPress={onToggleMute} icon={muted ? 'volume-mute' : 'volume-medium'} label={muted ? 'Unmute AI voice' : 'Mute AI voice'} active={muted} disabled={disabled} />
        <GlassButton onPress={onReplay} icon="refresh" label="Replay last reply" disabled={disabled || !canReplay} />
        <MicButton onPress={onMic} active={recording} disabled={disabled && !recording} />
        <GlassButton onPress={onToggleSlow} icon="speedometer-outline" label={slowMode ? 'Normal speed' : 'Slow & clear (Repeat after me)'} active={slowMode} color={voice.accent} disabled={disabled} />
        <GlassButton onPress={onOpenSettings} icon="settings-outline" label="Voice settings" disabled={disabled} />
        <GlassButton onPress={onEnd} icon="log-out-outline" label="End voice session" color={voice.danger} disabled={disabled} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', width: '100%', paddingHorizontal: 12 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(10, 24, 40, 0.6)',
    borderWidth: 1,
    borderColor: voice.glassBorder,
  },
  glassBtn: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: voice.glass,
    borderWidth: 1,
    borderColor: voice.glassBorder,
  },
  disabled: { opacity: 0.35 },
  micBtn: {
    width: 62, height: 62, borderRadius: 31,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    boxShadow: '0 4px 14px rgba(32,214,199,0.5)',
    elevation: 10,
  },
  micBtnActive: {
    borderColor: 'rgba(255,107,107,0.6)',
    boxShadow: '0 4px 14px rgba(255,107,107,0.5)',
  },
  micGradient: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
});
