import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import Header from '../components/Header';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import LoadingState from '../components/LoadingState';
import { spacing, borderRadius, shadows } from '../theme';

export default function LeaderboardScreen({ navigation }) {
  const { colors } = useTheme();
  const { user } = useUser();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('weekly');

  useEffect(() => { loadLeaderboard(); }, [period]);

  const loadLeaderboard = async () => {
    try {
      const data = await api.getLeaderboard(period);
      setLeaders(Array.isArray(data) ? data : []);
    } catch {} finally {
      setLoading(false);}
  };

  const getRankColor = (rank) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return colors.textLight;
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return 'trophy';
    if (rank === 2) return 'medal';
    if (rank === 3) return 'medal';
    return null;
  };

  if (loading) return <LoadingState fullScreen />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Leaderboard" subtitle="Top learners this week" leftIcon="arrow-back" onLeftPress={() => navigation.goBack()} />

      <View style={styles.tabs}>
        {['weekly', 'monthly', 'all_time'].map((p) => (
          <TouchableOpacity key={p} style={[styles.tab, period === p && { backgroundColor: colors.primary }]} onPress={() => setPeriod(p)}>
            <Text style={[styles.tabText, { color: period === p ? '#fff' : colors.textSecondary }]}>
              {p === 'weekly' ? 'Weekly' : p === 'monthly' ? 'Monthly' : 'All Time'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={leaders}
        keyExtractor={(item, i) => item.id || i.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => {
          const rank = index + 1;
          const isMe = item.id === user?.id || item.email === user?.email;
          const rankColor = getRankColor(rank);
          return (
            <TouchableOpacity style={[styles.row, { backgroundColor: colors.card }, isMe && { backgroundColor: colors.primaryLight, borderWidth: 1, borderColor: colors.primary }]}>
              <View style={[styles.rankContainer, { backgroundColor: rank <= 3 ? rankColor + '30' : 'transparent' }]}>
                {getRankIcon(rank) ? (
                  <Ionicons name={getRankIcon(rank)} size={24} color={rankColor} />
                ) : (
                  <Text style={[styles.rankNumber, { color: rankColor }]}>{rank}</Text>
                )}
              </View>
              <Avatar name={item.name} uri={item.avatar} size={40} />
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.text }]}>{item.name || 'Anonymous'}</Text>
                {item.streak > 0 && (
                  <View style={styles.streakRow}>
                    <Ionicons name="flame" size={12} color={colors.accent} />
                    <Text style={[styles.streakText, { color: colors.textSecondary }]}>{item.streak} day streak</Text>
                  </View>
                )}
              </View>
              <View style={styles.xpContainer}>
                <Text style={[styles.xpValue, { color: colors.primary }]}>{item.xp || item.total_xp || 0}</Text>
                <Text style={[styles.xpLabel, { color: colors.textLight }]}>XP</Text>
              </View>
              {isMe && <Badge title="You" variant="info" size="sm" />}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="podium" size={64} color={colors.textLight} />
            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>No rankings yet</Text>
            <Text style={[styles.emptyDesc, { color: colors.textLight }]}>Start learning to appear on the leaderboard!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabs: { flexDirection: 'row', paddingHorizontal: spacing.xl, gap: spacing.sm, marginBottom: spacing.md },
  tab: { flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.full, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '600' },
  list: { padding: spacing.xl, paddingTop: 0 },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.sm, ...shadows.sm },
  rankContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  rankNumber: { fontSize: 18, fontWeight: '800' },
  userInfo: { flex: 1, marginLeft: spacing.md },
  userName: { fontSize: 15, fontWeight: '600' },
  streakRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 2 },
  streakText: { fontSize: 11 },
  xpContainer: { alignItems: 'center', marginRight: spacing.md },
  xpValue: { fontSize: 18, fontWeight: '800' },
  xpLabel: { fontSize: 10, fontWeight: '500' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: spacing.lg },
  emptyDesc: { fontSize: 14, marginTop: spacing.sm, textAlign: 'center' },
});
