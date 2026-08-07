import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, borderRadius, shadows, typography } from '../theme';
import { TAB_ROUTES } from '../theme/dashboardGradients';

/**
 * BottomTabBar
 *
 * Glassmorphism bottom navigation bar — drop-in replacement for
 * the Tab.Navigator `tabBar` prop.
 *
 * Features:
 *   - Fixed `bottom-0`, full-width
 *   - Glassmorphism with BlurView (and web fallback via backdropFilter)
 *   - `pb-safe` — dynamic safe-area-inset-bottom padding (iPhone notch / Dynamic Island)
 *   - Active tab has glowing accent color
 *   - Configurable `routes` array
 *
 * @param {{ state: any, descriptors: any, navigation: any, routes?: typeof TAB_ROUTES }} props
 */
export default function BottomTabBar({ state, descriptors, navigation, routes = TAB_ROUTES }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const safePaddingBottom = insets.bottom || 0;

  const renderTab = (route, index) => {
    const { options } = descriptors[route.key];
    const focused = state.index === index;
    const routeName = route.name;
    const routeConfig = routes.find((r) => r.id === routeName) || {
      label: routeName,
      focusedIcon: 'ellipse',
      unfocusedIcon: 'ellipse',
    };

    const label = options.tabBarLabel ?? routeConfig.label ?? routeName;
    const iconName = focused ? routeConfig.focusedIcon : routeConfig.unfocusedIcon;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (!event.defaultPrevented) navigation.navigate(route.name, route.params);
    };

    return (
      <TouchableOpacity
        key={route.key}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityState={focused ? { selected: true } : {}}
        onPress={onPress}
        style={styles.tab}
      >
        {focused ? (
          <View style={[styles.activeIconWrap, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name={iconName} size={24} color={colors.primary} />
          </View>
        ) : (
          <View style={styles.iconWrap}>
            <Ionicons name={iconName} size={22} color={colors.textLight} />
          </View>
        )}
        <Text
          style={[
            styles.label,
            { color: focused ? colors.primary : colors.textLight },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const isWeb = Platform.OS === 'web';
  const tabBarStyle = [
    styles.container,
    {
      backgroundColor: isWeb
        ? (isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.85)')
        : 'transparent',
      borderColor: colors.glassBorder,
      paddingBottom: safePaddingBottom || 12,
      ...(isWeb ? {
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      } : {}),
    },
  ];

  if (Platform.OS === 'web') {
    return (
      <View style={tabBarStyle}>
        <View style={[styles.inner, { paddingBottom: safePaddingBottom }]}>
          {state.routes.map(renderTab)}
        </View>
      </View>
    );
  }

  return (
    <BlurView
      intensity={80}
      tint={isDark ? 'dark' : 'light'}
      style={tabBarStyle}
    >
      <View style={[styles.inner, { paddingBottom: safePaddingBottom }]}>
        {state.routes.map(renderTab)}
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    ...shadows.xl,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    gap: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        boxShadow: '0 0 12px rgba(20,184,166,0.4)',
      },
      android: { elevation: 6 },
      web: { boxShadow: '0 0 16px rgba(20, 184, 166, 0.35)' },
    }),
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.07,
    ...typography.small,
  },
});
