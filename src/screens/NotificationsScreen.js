import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { communityMock } from '../services/communityMock';
import Header from '../components/Header';
import { spacing, borderRadius } from '../theme';

export default function NotificationsScreen({ navigation }) {
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    communityMock.getNotifications().then((data) => {
      if (Array.isArray(data)) setNotifications(data);
    }).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    load();
    setRefreshing(false);
  }, [load]);

  const unreadCount = notifications.filter((n) => n && !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'}
        leftIcon="arrow-back"
        onLeftPress={() => navigation.goBack()}
        rightIcon={unreadCount > 0 ? 'checkmark-done' : undefined}
        onRightPress={unreadCount > 0 ? markAllRead : undefined}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accent} />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={44} color={colors.textLight} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No notifications yet</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Activity from the community, challenges, and your learning progress will appear here.
            </Text>
          </View>
        ) : (
          <>
            {notifications.map((n) => (
              <TouchableOpacity
                key={n.id}
                style={[
                  styles.row,
                  { backgroundColor: !n.read ? colors.primary + '08' : colors.surface, borderColor: colors.border },
                ]}
                onPress={() => toggleRead(n.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.icon, { backgroundColor: (n.read ? colors.surfaceSecondary : colors.primary) + '18' }]}>
                  <Ionicons name={n.icon || 'notifications'} size={20} color={n.read ? colors.textSecondary : colors.primary} />
                </View>
                <View style={styles.body}>
                  <Text style={[styles.title, { color: colors.text }]}>{n.title}</Text>
                  <Text style={[styles.desc, { color: colors.textSecondary }]}>{n.body}</Text>
                  <Text style={[styles.time, { color: colors.textLight }]}>{n.time}</Text>
                </View>
                {!n.read && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: 40, gap: spacing.sm },
  empty: { alignItems: 'center', paddingTop: 120, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyText: { fontSize: 13, textAlign: 'center', maxWidth: 260, lineHeight: 19 },

  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1 },
  icon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  desc: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
  time: { fontSize: 11, fontWeight: '600' },
  dot: { width: 8, height: 8, borderRadius: 4 },
});