import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

let enabled = true;

export function setHapticsEnabled(value) {
  enabled = value;
}

function guard(fn) {
  if (!enabled) return;
  try {
    fn();
  } catch {}
}

export function hapticTap() {
  guard(() => Haptics.selectionAsync());
}

export function hapticMicStart() {
  guard(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

export function hapticMicEnd() {
  guard(() => Haptics.selectionAsync());
}

export function hapticAIBeginsSpeaking() {
  guard(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

export function hapticAIFinished() {
  guard(() => Haptics.selectionAsync());
}

export function hapticError() {
  guard(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
}

export function hapticXpGain() {
  guard(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

export function hapticsSupported() {
  return Platform.OS !== 'web' || typeof navigator !== 'undefined';
}
