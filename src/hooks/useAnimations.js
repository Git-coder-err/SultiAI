import { useSharedValue, useAnimatedStyle, withTiming, withSpring, withSequence, withDelay, withRepeat, Easing } from 'react-native-reanimated';
import { animation } from '../theme';

const useFadeIn = (opts = {}) => {
  const { delay = 0, duration = animation.timing.duration || 300, from = 0 } = opts;
  const opacity = useSharedValue(from);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const fadeIn = () => {
    // eslint-disable-next-line react-hooks/immutability
    opacity.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.quad) }));
  };
  const fadeOut = () => {
    // eslint-disable-next-line react-hooks/immutability
    opacity.value = withDelay(delay, withTiming(0, { duration, easing: Easing.out(Easing.quad) }));
  };

  return { opacity, style, fadeIn, fadeOut };
};

const useSlideIn = (opts = {}) => {
  const { delay = 0, distance = 24, from: fromOverride, axis = 'y' } = opts;
  const start = fromOverride !== undefined ? fromOverride : distance;
  const translate = useSharedValue(start);
  const axisProp = axis === 'x' ? 'translateX' : 'translateY';

  const style = useAnimatedStyle(() => ({
    transform: [{ [axisProp]: translate.value }],
  }));

  const slideIn = () => {
    // eslint-disable-next-line react-hooks/immutability
    translate.value = withDelay(delay, withSpring(0, animation.spring));
  };
  const slideOut = () => {
    // eslint-disable-next-line react-hooks/immutability
    translate.value = withDelay(delay, withSpring(start, animation.spring));
  };

  return { translate, style, slideIn, slideOut };
};

const useScaleIn = (opts = {}) => {
  const { delay = 0, from = 0.92 } = opts;
  const scale = useSharedValue(from);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const scaleIn = () => {
    // eslint-disable-next-line react-hooks/immutability
    scale.value = withDelay(delay, withSpring(1, animation.springBouncy));
  };
  const scaleOut = () => {
    // eslint-disable-next-line react-hooks/immutability
    scale.value = withDelay(delay, withSpring(0, animation.springBouncy));
  };

  return { scale, style, scaleIn, scaleOut };
};

const usePulse = (opts = {}) => {
  const { min = 0.95, max = 1.05, duration = 1200, enabled = true } = opts;
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const start = () => {
    if (!enabled) return;
    // eslint-disable-next-line react-hooks/immutability
    scale.value = withRepeat(
      withSequence(
        withTiming(max, { duration: duration / 2, easing: Easing.inOut(Easing.sin) }),
        withTiming(min, { duration: duration / 2, easing: Easing.inOut(Easing.sin) }),
      ),
      -1, true
    );
  };

  const stop = () => {
    // eslint-disable-next-line react-hooks/immutability
    scale.value = withTiming(1, { duration: 200 });
  };

  return { scale, style, start, stop };
};

const useStagger = (count, opts = {}) => {
  const { delay = 60, duration = 300 } = opts;

  const opacities = [];
  const translates = [];
  const styles = [];
  for (let i = 0; i < count; i++) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const opacity = useSharedValue(0);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const translateY = useSharedValue(20);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const style = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    }));
    opacities.push(opacity);
    translates.push(translateY);
    styles.push(style);
  }

  const animateAll = () => {
    for (let i = 0; i < count; i++) {
      const d = i * delay;
      opacities[i].value = withDelay(d, withTiming(1, { duration, easing: Easing.out(Easing.quad) }));
      translates[i].value = withDelay(d, withSpring(0, animation.spring));
    }
  };

  return { styles, animateAll };
};

export {
  useFadeIn,
  useSlideIn,
  useScaleIn,
  usePulse,
  useStagger,
};
