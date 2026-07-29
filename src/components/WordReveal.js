import React, { useEffect, useState, useRef } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSequence, withDelay,
} from 'react-native-reanimated';

export default function WordReveal({ text, style, speed = 40, onComplete }) {
  const words = text.split(' ');
  const [visibleCount, setVisibleCount] = useState(0);
  const intervalRef = useRef(null);
  const revealedRef = useRef(false);
  const fadeIn = useSharedValue(1);

  useEffect(() => {
    setVisibleCount(0);
    revealedRef.current = false;
    if (intervalRef.current) clearInterval(intervalRef.current);

    const total = words.length;
    let i = 0;

    intervalRef.current = setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= total) {
        clearInterval(intervalRef.current);
        revealedRef.current = true;
        if (onComplete) onComplete();
      }
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text]);

  const visible = words.slice(0, visibleCount).join(' ');
  const remaining = words.slice(visibleCount).join(' ');

  return (
    <Text style={[styles.text, style]}>
      {visible}
      {remaining.length > 0 && (
        <Text style={[styles.remaining, style]}>{remaining}</Text>
      )}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
  remaining: {
    opacity: 0.15,
  },
});
