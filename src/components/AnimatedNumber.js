import React, { useEffect, useRef } from 'react';
import { Text, Animated } from 'react-native';

export default function AnimatedNumber({ value, style, duration = 500, format }) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const ref = useRef(null);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();
  }, [value]);

  useEffect(() => {
    const listener = animatedValue.addListener(({ value: v }) => {
      if (ref.current) {
        const display = format ? format(v) : Math.round(v).toString();
        ref.current.setNativeProps({ text: display });
      }
    });
    return () => animatedValue.removeListener(listener);
  }, []);

  const initialDisplay = format ? format(0) : '0';
  return <Text ref={ref} style={style}>{initialDisplay}</Text>;
}
