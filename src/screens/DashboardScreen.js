import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Animated, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { api } from '../services/api';
import Card from '../components/Card';
import GlassCard from '../components/GlassCard';
import StreakFlame from '../components/StreakFlame';
import XpBar from '../components/XpBar';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import AuroraBackground from '../components/AuroraBackground';
import { spacing, borderRadius, shadows, typography } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.xl * 2 - spacing.md) / 2;

export default function DashboardScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { user, refreshLevel } = useUser();
  const { xp, coins, hearts, streak, dailyGoal, dailyXp } = useGame();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const [history, setHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [savedPhrases, setSavedPhrases] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [level, setLevel] = useState(null);
  const [mistakes, setMistakes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  const loadData = async () => {
    try {
      const [histData, notifData, phrasesData, postsData, levelData, mistakesData] = await Promise.allSettled([
        api.getHistory(), api.getNotifications(), api.getSavedPhrases(),
        api.getCommunityPosts(), api.getTutorLevel(), api.getMistakes(),
      ]);
      if (histData.status === 'fulfilled') setHistory(Array.isArray(histData.value) ? histData.value : []);
      if (notifData.status === 'fulfilled') setNotifications(Array.isArray(notifData.value) ? notifData.value : []);
      if (phrasesData.status === 'fulfilled') setSavedPhrases(Array.isArray(phrasesData.value) ? phrasesData.value : []);
      if (postsData.status === 'fulfilled') setCommunityPosts(Array.isArray(postsData.value) ? postsData.value : []);
      if (levelData.status === 'fulfilled') setLevel(levelData.value);
      if (mistakesData.status === 'fulfilled') setMistakes(Array.isArray(mistakesData.value) ? mistakesData.value : []);
    } catch {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    await refreshLevel();
    setRefreshing(false);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const dailyProgress = dailyGoal > 0 ? Math.min(dailyXp / dailyGoal, 1) : 0;

  const markAsRead = async (notifId) => {
    try {
      await api.markNotificationRead(notifId);
      setNotifications(prev => prev.map(n => n.notify_id === notifId ? { ...n, is_read: true } : n));
    } catch {}
  };

  const quickActions = [
    { label: 'Hoy Tutor', icon: 'sparkles', screen: 'Learn', gradient: ['#14B8A6', '#0D9488'] },
    { label: 'Practice', icon: 'chatbubbles', screen: 'Practice', gradient: ['#2563EB', '#1D4ED8'] },
    { label: 'Pronunciation', icon: 'mic', screen: 'Pronunciation', gradient: ['#8B5CF6', '#7C3AED'] },
    { label: 'AR Explore', icon: 'camera', screen: 'ARScene', gradient: ['#10B981', '#059669'] },
    { label: 'Rewards', icon: 'trophy', screen: 'Achievements', gradient: ['#F59E0B', '#D97706'] },
  ];

  const renderHeader = () => (
    <LinearGradient colors={[colors.primary, colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, { paddingTop: insets.top + 16 }]}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Avatar name={user?.name} size={48} uri={user?.avatar?.image} />
            <View style={styles.greetingBox}>
              <Text style={styles.greeting}>Kumusta, {user?.name?.split(' ')[0] || 'Learner'}!</Text>
              <Text style={styles.subGreeting}>Padayon sa pagkat-on</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={() => {}}>
            <View style={styles.notifInner}>
              <Ionicons name="notifications-outline" size={22} color="#fff" />
              {unreadCount > 0 && (
                <View style={styles.notifDot}>
                  <Text style={styles.notifDotText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.xpRingSection}>
            <View style={styles.progressRingContainer}>
              <View style={[styles.progressRingBg, { borderColor: 'rgba(255,255,255,0.15)' }]} />
              <View style={styles.progressRingFill} />
              <View style={styles.progressRingCenter}>
                <Text style={styles.xpValue}>{xp}</Text>
                <Text style={styles.xpLabel}>XP</Text>
              </View>
            </View>
            <View style={styles.dailyGoal}>
              <Text style={styles.dailyGoalText}>Daily Goal</Text>
              <XpBar current={dailyXp} max={dailyGoal} height={4} color="#FFD700" />
              <Text style={styles.dailyGoalValue}>{dailyXp}/{dailyGoal} XP</Text>
            </View>
          </View>
          <View style={styles.headerStatsGrid}>
            <View style={styles.headerStatItem}>
              <StreakFlame streak={streak} />
            </View>
            <View style={styles.headerStatItem}>
              <Ionicons name="heart" size={18} color="#FF6B6B" />
              <Text style={styles.headerStatValue}>{hearts}</Text>
            </View>
            <View style={styles.headerStatItem}>
              <Ionicons name="people" size={18} color="rgba(255,255,255,0.7)" />
              <Text style={styles.headerStatValue}>{communityPosts.length}</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </LinearGradient>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AuroraBackground>
        <ScrollView
          style={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {renderHeader()}

          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.actionsGrid}>
              {quickActions.map((a, i) => (
                <TouchableOpacity key={a.label} onPress={() => navigation.navigate(a.screen)} activeOpacity={0.85}>
                  <GlassCard variant="elevated" style={styles.actionCard} padding="lg">
                    <LinearGradient colors={a.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.actionIcon}>
                      <Ionicons name={a.icon} size={24} color="#fff" />
                    </LinearGradient>
                    <Text style={[styles.actionLabel, { color: colors.text }]}>{a.label}</Text>
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </View>

            {level && (
              <GlassCard variant="tinted" style={styles.levelCard}>
                <View style={styles.levelHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Progress</Text>
                  <Badge title={level.level || 'Beginner'} variant="info" size="sm" />
                </View>
                <View style={styles.levelStatsRow}>
                  <View style={styles.levelStat}>
                    <Text style={[styles.levelStatNum, { color: colors.primary }]}>{level.total_sessions || 0}</Text>
                    <Text style={[styles.levelStatLabel, { color: colors.textSecondary }]}>Sessions</Text>
                  </View>
                  <View style={styles.levelDivider} />
                  <View style={styles.levelStat}>
                    <Text style={[styles.levelStatNum, { color: colors.accent }]}>{level.total_xp || 0}</Text>
                    <Text style={[styles.levelStatLabel, { color: colors.textSecondary }]}>Total XP</Text>
                  </View>
                  <View style={styles.levelDivider} />
                  <View style={styles.levelStat}>
                    <Text style={[styles.levelStatNum, { color: colors.success }]}>{level.streak || streak || 0}</Text>
                    <Text style={[styles.levelStatLabel, { color: colors.textSecondary }]}>Streak</Text>
                  </View>
                </View>
              </GlassCard>
            )}

            {mistakes.length > 0 && (
              <GlassCard variant="default" style={styles.mistakesCard}>
                <View style={styles.mistakesHeader}>
                  <View style={[styles.mistakesIcon, { backgroundColor: colors.accent + '20' }]}>
                    <Ionicons name="bulb-outline" size={18} color={colors.accent} />
                  </View>
                  <Text style={[styles.mistakesTitle, { color: colors.text }]}>Keep Practicing</Text>
                </View>
                {mistakes.slice(0, 3).map((m, i) => (
                  <View key={i} style={styles.mistakeRow}>
                    <Text style={styles.mistakeBad}>{m.pattern}</Text>
                    <Ionicons name="arrow-forward" size={12} color={colors.success} />
                    <Text style={styles.mistakeGood}>{m.correction}</Text>
                    <Badge title={`${m.count}x`} variant="warning" size="sm" />
                  </View>
                ))}
                <TouchableOpacity style={[styles.practiceBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('Learn')}>
                  <Ionicons name="sparkles" size={14} color="#fff" />
                  <Text style={styles.practiceBtnText}>Practice with Hoy</Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {savedPhrases.length > 0 && (
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Library</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Flashcards')}>
                    <Text style={[styles.seeAll, { color: colors.primary }]}>View All</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.miniStatsRow}>
                  <TouchableOpacity style={[styles.miniStatCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]} onPress={() => navigation.navigate('VocabularyReview')}>
                    <View style={[styles.miniIcon, { backgroundColor: colors.primary + '20' }]}>
                      <Ionicons name="bookmark" size={20} color={colors.primary} />
                    </View>
                    <Text style={[styles.miniStatValue, { color: colors.text }]}>{savedPhrases.length}</Text>
                    <Text style={[styles.miniStatLabel, { color: colors.textSecondary }]}>Saved</Text>
                  </TouchableOpacity>
                  <View style={[styles.miniStatCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
                    <View style={[styles.miniIcon, { backgroundColor: colors.accent + '20' }]}>
                      <Ionicons name="chatbubbles" size={20} color={colors.accent} />
                    </View>
                    <Text style={[styles.miniStatValue, { color: colors.text }]}>{history.length}</Text>
                    <Text style={[styles.miniStatLabel, { color: colors.textSecondary }]}>Conversations</Text>
                  </View>
                  <View style={[styles.miniStatCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
                    <View style={[styles.miniIcon, { backgroundColor: colors.success + '20' }]}>
                      <Ionicons name="people" size={20} color={colors.success} />
                    </View>
                    <Text style={[styles.miniStatValue, { color: colors.text }]}>{communityPosts.length}</Text>
                    <Text style={[styles.miniStatLabel, { color: colors.textSecondary }]}>Community</Text>
                  </View>
                </View>
              </View>
            )}

            <TouchableOpacity style={[styles.quickLink, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]} onPress={() => navigation.navigate('Leaderboard')}>
              <View style={[styles.qlIcon, { backgroundColor: colors.accent + '20' }]}>
                <Ionicons name="podium" size={20} color={colors.accent} />
              </View>
              <Text style={[styles.qlText, { color: colors.text }]}>Leaderboard</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>

            {unreadCount > 0 && (
              <View style={styles.sectionBlock}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
                {notifications.filter(n => !n.is_read).slice(0, 3).map((notif) => (
                  <TouchableOpacity key={notif.notify_id} style={[styles.notifCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]} onPress={() => markAsRead(notif.notify_id)}>
                    <View style={[styles.notifIcon, { backgroundColor: colors.primary + '20' }]}>
                      <Ionicons name={notif.title === 'Welcome!' ? 'heart' : 'megaphone'} size={16} color={colors.primary} />
                    </View>
                    <View style={styles.notifContent}>
                      <Text style={[styles.notifTitle, { color: colors.text }]}>{notif.title}</Text>
                      <Text style={[styles.notifMessage, { color: colors.textSecondary }]}>{notif.message}</Text>
                    </View>
                    <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
              {history.length === 0 ? (
                <GlassCard style={styles.emptyCard}>
                  <Ionicons name="book-outline" size={36} color={colors.textLight} />
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No conversations yet</Text>
                  <Text style={[styles.emptySubtext, { color: colors.textLight }]}>Start learning with Hoy!</Text>
                </GlassCard>
              ) : (
                history.slice(0, 5).map((item, idx) => (
                  <View key={item.id || idx} style={[styles.historyCard, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
                    <View style={[styles.historyIcon, { backgroundColor: colors.primary + '20' }]}>
                      <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.primary} />
                    </View>
                    <View style={styles.historyInfo}>
                      <Text style={[styles.historyTitle, { color: colors.text }]}>{item.title || `Conversation ${idx + 1}`}</Text>
                      <Text style={[styles.historyDate, { color: colors.textSecondary }]}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                      </Text>
                    </View>
                    <Text style={[styles.historyCount, { color: colors.textLight }]}>{item.messages?.length || 0} msgs</Text>
                  </View>
                ))
              )}
            </View>
          </Animated.View>
        </ScrollView>
      </AuroraBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  header: { paddingBottom: spacing.xxl, paddingHorizontal: spacing.xl },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  greetingBox: { marginLeft: spacing.md, flex: 1 },
  greeting: { fontSize: 24, fontWeight: '700', color: '#fff', letterSpacing: 0.36 },
  subGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2, letterSpacing: -0.08 },
  notifBtn: { padding: spacing.xs },
  notifInner: { position: 'relative', width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  notifDot: { position: 'absolute', top: 2, right: 2, backgroundColor: '#EF4444', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  notifDotText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  xpRingSection: { flex: 1, gap: spacing.md },
  progressRingContainer: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  progressRingBg: { position: 'absolute', width: 72, height: 72, borderRadius: 36, borderWidth: 3 },
  progressRingFill: { position: 'absolute', width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: '#FFD700', borderLeftColor: 'transparent', borderBottomColor: 'transparent', transform: [{ rotate: '45deg' }] },
  progressRingCenter: { alignItems: 'center' },
  xpValue: { fontSize: 20, fontWeight: '800', color: '#FFD700' },
  xpLabel: { fontSize: 9, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginTop: -2 },
  dailyGoal: { flex: 1 },
  dailyGoalText: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  dailyGoalValue: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  headerStatsGrid: { gap: spacing.sm },
  headerStatItem: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: borderRadius.md, padding: spacing.sm, alignItems: 'center', flexDirection: 'row', gap: spacing.xs },
  headerStatValue: { fontSize: 16, fontWeight: '800', color: '#fff' },
  content: { padding: spacing.xl, paddingBottom: 0 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xl },
  actionCard: { width: CARD_WIDTH, alignItems: 'center', paddingVertical: spacing.xl },
  actionIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  actionLabel: { fontSize: 13, fontWeight: '600', letterSpacing: -0.08 },
  levelCard: { marginBottom: spacing.lg, flex: 0 },
  levelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  sectionTitle: { fontSize: 18, fontWeight: '700', letterSpacing: 0.35, marginBottom: spacing.md },
  levelStatsRow: { flexDirection: 'row', alignItems: 'center' },
  levelStat: { flex: 1, alignItems: 'center' },
  levelStatNum: { fontSize: 26, fontWeight: '800', letterSpacing: 0.36 },
  levelStatLabel: { fontSize: 11, fontWeight: '500', marginTop: 2, letterSpacing: 0.07 },
  levelDivider: { width: 1, height: 40, backgroundColor: 'rgba(0,0,0,0.06)' },
  mistakesCard: { marginBottom: spacing.lg, flex: 0 },
  mistakesHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.sm },
  mistakesIcon: { width: 34, height: 34, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  mistakesTitle: { fontSize: 15, fontWeight: '700', letterSpacing: -0.24 },
  mistakeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs, gap: spacing.sm },
  mistakeBad: { fontSize: 14, color: '#EF4444', fontWeight: '600', textDecorationLine: 'line-through' },
  mistakeGood: { fontSize: 14, color: '#10B981', fontWeight: '600', flex: 1 },
  practiceBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderRadius: borderRadius.full, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, marginTop: spacing.md, gap: spacing.sm },
  practiceBtnText: { fontSize: 12, color: '#fff', fontWeight: '600' },
  sectionBlock: { marginBottom: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  seeAll: { fontSize: 13, fontWeight: '600', letterSpacing: -0.08 },
  miniStatsRow: { flexDirection: 'row', gap: spacing.sm },
  miniStatCard: { flex: 1, borderRadius: borderRadius.lg, padding: spacing.md, alignItems: 'center', borderWidth: 1 },
  miniIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.xs },
  miniStatValue: { fontSize: 18, fontWeight: '800', letterSpacing: 0.36 },
  miniStatLabel: { fontSize: 11, fontWeight: '500', marginTop: 2, letterSpacing: 0.07 },
  quickLink: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, gap: spacing.md, marginBottom: spacing.lg },
  qlIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  qlText: { flex: 1, fontSize: 15, fontWeight: '600', letterSpacing: -0.24 },
  notifCard: { flexDirection: 'row', borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm, alignItems: 'center', borderWidth: 1 },
  notifIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  notifContent: { marginLeft: spacing.md, flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '600' },
  notifMessage: { fontSize: 13, marginTop: 2, letterSpacing: -0.08 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  emptyCard: { alignItems: 'center', padding: spacing.xxl, marginBottom: spacing.lg },
  emptyText: { fontSize: 15, fontWeight: '600', marginTop: spacing.md, letterSpacing: -0.24 },
  emptySubtext: { fontSize: 13, marginTop: spacing.xs, letterSpacing: -0.08 },
  historyCard: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1 },
  historyIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  historyInfo: { marginLeft: spacing.md, flex: 1 },
  historyTitle: { fontSize: 15, fontWeight: '600', letterSpacing: -0.24 },
  historyDate: { fontSize: 12, marginTop: 2, letterSpacing: -0.08 },
  historyCount: { fontSize: 12, fontWeight: '500', letterSpacing: 0.07 },
});
