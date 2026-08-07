import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSequence, withDelay, withRepeat,
} from 'react-native-reanimated';

export default function WordReveal({ text, style, speed = 40, onComplete, showCursor = false }) {
  const words = useRef((text || '').trim().split(/\s+/).filter(Boolean)).current;
  const [visibleCount, setVisibleCount] = useState(0);
  const [isRevealing, setIsRevealing] = useState(true);
  const intervalRef = useRef(null);
  const revealedRef = useRef(false);

  useEffect(() => {
    setVisibleCount(0);
    setIsRevealing(true);
    revealedRef.current = false;
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (words.length === 0) {
      setIsRevealing(false);
      revealedRef.current = true;
      if (onComplete) onComplete();
      return;
    }

    let i = 0;

    intervalRef.current = setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= words.length) {
        clearInterval(intervalRef.current);
        setIsRevealing(false);
        revealedRef.current = true;
        if (onComplete) onComplete();
      }
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text]);

  const skipToEnd = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setVisibleCount(words.length);
    setIsRevealing(false);
    revealedRef.current = true;
    if (onComplete) onComplete();
  }, [words.length]);

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.text, style]}>
        {words.map((word, i) => (
          <WordItem
            key={i}
            word={i < visibleCount ? word : ''}
            ghost={i >= visibleCount ? word : ''}
            isNew={i === visibleCount - 1}
          />
        ))}
        {showCursor && isRevealing && <Cursor />}
      </Text>
    </View>
  );
}

function WordItem({ word, ghost, isNew }) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const translateY = useSharedValue(4);

  useEffect(() => {
    if (word && isNew) {
      opacity.value = withSequence(
        withDelay(0, withTiming(1, { duration: 120 })),
      );
      scale.value = withSequence(
        withTiming(1.05, { duration: 60 }),
        withTiming(1, { duration: 100 }),
      );
      translateY.value = withTiming(0, { duration: 120 });
    }
  }, [word]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: word ? opacity.value : 1,
    transform: word ? [{ scale: scale.value }, { translateY: translateY.value }] : [],
  }));

  return (
    <Animated.Text style={animStyle}>
      {word || ''}{' '}
      {!word && ghost && (
        <Text style={styles.ghost}>{ghost}{' '}</Text>
      )}
    </Animated.Text>
  );
}

function Cursor() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 500 }),
        withTiming(1, { duration: 500 }),
      ),
      -1, false
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.Text style={[styles.cursor, style]}>|</Animated.Text>;
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', flexWrap: 'wrap' },
  text: { fontSize: 15, lineHeight: 22 },
  ghost: { opacity: 0.15 },
  cursor: { opacity: 1, fontSize: 16, color: '#14B8A6' },
});
