import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { useSharedValue, withTiming, Easing, runOnJS } from 'react-native-reanimated';

export default function AnimatedNumber({ value, style, duration = 500, format }) {
  const animatedValue = useSharedValue(0);
  const [display, setDisplay] = useState(format ? format(0) : '0');

  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.quad),
    });
  }, [value, duration, animatedValue]);

  useEffect(() => {
    const id = animatedValue.addListener((v) => {
      const displayValue = format ? format(v.value) : Math.round(v.value).toString();
      runOnJS(setDisplay)(displayValue);
    });
    return () => animatedValue.removeListener(id);
  }, [format, animatedValue]);

  return <Text style={style}>{display}</Text>;
}
