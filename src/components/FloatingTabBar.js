import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, borderRadius, shadows } from '../theme';

const TAB_ICONS = {
  Home: { focused: 'home', unfocused: 'home-outline' },
  Practice: { focused: 'chatbubbles', unfocused: 'chatbubbles-outline' },
  Learn: { focused: 'sparkles', unfocused: 'sparkles-outline' },
  Community: { focused: 'people', unfocused: 'people-outline' },
  Profile: { focused: 'person', unfocused: 'person-outline' },
};

export default function FloatingTabBar({ state, descriptors, navigation }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const tabBarStyle = [
    styles.container,
    {
      backgroundColor: Platform.OS === 'web'
        ? (isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.75)')
        : 'transparent',
      borderColor: colors.glassBorder,
      marginBottom: Platform.OS === 'ios' ? 20 : 12,
      paddingBottom: Platform.OS === 'ios' ? 6 : 0,
    },
  ];

  const renderContent = () => (
    <View style={[styles.inner, { paddingBottom: insets.bottom || 4 }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const routeName = route.name;
        const icons = TAB_ICONS[routeName] || { focused: 'ellipse', unfocused: 'ellipse' };
        const iconName = focused ? icons.focused : icons.unfocused;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <TouchableOpacity key={route.key} onPress={onPress} style={styles.tab} activeOpacity={0.7}>
            <View style={[styles.iconWrap, focused && { backgroundColor: colors.primary + '20' }]}>
              {focused ? (
                <LinearGradient colors={[colors.primary, colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradientIcon}>
                  <Ionicons name={iconName} size={22} color="#fff" />
                </LinearGradient>
              ) : (
                <Ionicons name={iconName} size={22} color={colors.textLight} />
              )}
            </View>
            <Text style={[styles.label, { color: focused ? colors.primary : colors.textLight }]}>
              {options.tabBarLabel || route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={tabBarStyle}>
        {renderContent()}
      </View>
    );
  }

  return (
    <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={tabBarStyle}>
      {renderContent()}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', bottom: 0, left: 12, right: 12,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    ...shadows.xl,
  },
  inner: {
    flexDirection: 'row', alignItems: 'flex-end', paddingTop: 6,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 6,
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  gradientIcon: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  label: {
    fontSize: 10, fontWeight: '600', marginTop: 2,
    letterSpacing: 0.07,
  },
});
