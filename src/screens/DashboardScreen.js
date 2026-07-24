import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import { colors } from '../theme/colors';

export default function DashboardScreen({ navigation }) {
  const { user } = useUser();
  const [history, setHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [savedPhrases, setSavedPhrases] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [histData, notifData, phrasesData, postsData] = await Promise.allSettled([
        api.getHistory(),
        api.getNotifications(),
        api.getSavedPhrases(),
        api.getCommunityPosts(),
      ]);
      if (histData.status === 'fulfilled') setHistory(Array.isArray(histData.value) ? histData.value : []);
      if (notifData.status === 'fulfilled') setNotifications(Array.isArray(notifData.value) ? notifData.value : []);
      if (phrasesData.status === 'fulfilled') setSavedPhrases(Array.isArray(phrasesData.value) ? phrasesData.value : []);
      if (postsData.status === 'fulfilled') setCommunityPosts(Array.isArray(postsData.value) ? postsData.value : []);
    } catch {}
  };

  useEffect(() => { loadData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const quickActions = [
    { label: 'AI Chat', icon: 'sparkles', color: colors.primary, screen: 'AIChat' },
    { label: 'Conversation', icon: 'chatbubbles', color: colors.accent, screen: 'Conversation' },
    { label: 'Pronunciation', icon: 'mic', color: colors.success, screen: 'Pronunciation' },
  ];

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Kumusta, {user?.name || 'Learner'}!</Text>
            <Text style={styles.subGreeting}>Continue learning Bisaya</Text>
          </View>
          {unreadCount > 0 && (
            <View style={styles.notifBadge}>
              <Ionicons name="notifications" size={22} color={colors.white} />
              <View style={styles.badgeDot}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            </View>
          )}
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Quick Start</Text>
        <View style={styles.actionsRow}>
          {quickActions.map((a) => (
            <TouchableOpacity key={a.label} style={styles.actionCard} onPress={() => navigation.navigate(a.screen)}>
              <View style={[styles.actionIcon, { backgroundColor: a.color + '20' }]}>
                <Ionicons name={a.icon} size={28} color={a.color} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {savedPhrases.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Saved Phrases</Text>
              <Text style={styles.sectionCount}>{savedPhrases.length}</Text>
            </View>
            <View style={styles.statCards}>
              <View style={styles.statCard}>
                <Ionicons name="bookmark" size={24} color={colors.primary} />
                <Text style={styles.statValue}>{savedPhrases.length}</Text>
                <Text style={styles.statLabel}>Phrases Saved</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="chatbubbles" size={24} color={colors.accent} />
                <Text style={styles.statValue}>{history.length}</Text>
                <Text style={styles.statLabel}>Conversations</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="people" size={24} color={colors.success} />
                <Text style={styles.statValue}>{communityPosts.length}</Text>
                <Text style={styles.statLabel}>Community</Text>
              </View>
            </View>
          </>
        )}

        {unreadCount > 0 && (
          <>
            <Text style={styles.sectionTitle}>Notifications</Text>
            {notifications.filter(n => !n.is_read).slice(0, 3).map((notif) => (
              <TouchableOpacity key={notif.notify_id} style={styles.notifCard} onPress={async () => {
                try { await api.markNotificationRead(notif.notify_id); setNotifications(prev => prev.map(n => n.notify_id === notif.notify_id ? { ...n, is_read: true } : n)); } catch {}
              }}>
                <Ionicons name={notif.title === 'Welcome!' ? 'heart' : 'megaphone'} size={18} color={colors.primary} />
                <View style={styles.notifContent}>
                  <Text style={styles.notifTitle}>{notif.title}</Text>
                  <Text style={styles.notifMessage}>{notif.message}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {history.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="book-outline" size={40} color={colors.textLight} />
            <Text style={styles.emptyText}>No conversations yet. Start learning!</Text>
          </View>
        ) : (
          history.slice(0, 5).map((item, idx) => (
            <View key={item.id || idx} style={styles.historyCard}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.primary} />
              <View style={styles.historyInfo}>
                <Text style={styles.historyTitle}>{item.title || `Conversation ${idx + 1}`}</Text>
                <Text style={styles.historyDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.historyCount}>{item.messages?.length || 0} msgs</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 60, paddingBottom: 28, paddingHorizontal: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  greeting: { fontSize: 26, fontWeight: 'bold', color: colors.white },
  subGreeting: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  notifBadge: { position: 'relative', padding: 4 },
  badgeDot: { position: 'absolute', top: -2, right: -4, backgroundColor: colors.error, borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: 'bold' },
  content: { padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 12, marginTop: 8 },
  sectionCount: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  actionCard: { alignItems: 'center', backgroundColor: colors.white, borderRadius: 16, padding: 16, width: '30%', elevation: 2 },
  actionIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: colors.text, textAlign: 'center' },
  statCards: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: colors.white, borderRadius: 12, padding: 14, alignItems: 'center', elevation: 1 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginTop: 6 },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2, textAlign: 'center' },
  notifCard: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: 12, padding: 14, marginBottom: 8, elevation: 1, alignItems: 'flex-start' },
  notifContent: { marginLeft: 10, flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  notifMessage: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  emptyCard: { backgroundColor: colors.white, borderRadius: 16, padding: 32, alignItems: 'center', elevation: 2 },
  emptyText: { color: colors.textSecondary, marginTop: 12, fontSize: 14 },
  historyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 10, elevation: 1 },
  historyInfo: { marginLeft: 12, flex: 1 },
  historyTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  historyDate: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  historyCount: { fontSize: 12, color: colors.textLight, fontWeight: '500' },
});
