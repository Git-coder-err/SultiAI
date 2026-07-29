import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { api } from '../services/api';
import Card from '../components/Card';
import GlassCard from '../components/GlassCard';
import Avatar from '../components/Avatar';
import StreakFlame from '../components/StreakFlame';
import Badge from '../components/Badge';
import Button from '../components/Button';
import AuroraBackground from '../components/AuroraBackground';
import { spacing, borderRadius, shadows } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen({ navigation }) {
  const { user, signOut, refreshProfile } = useUser();
  const { colors, isDark, toggleTheme } = useTheme();
  const { xp, coins, hearts, streak, badges } = useGame();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({ dark_mode: false, speech_speed: 1.0, voice_gender: 'neutral' });
  const [editName, setEditName] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [savedPhrases, setSavedPhrases] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => {
    if (user) { setEditName(user.name || ''); setEditCountry(user.country || ''); }
    loadSettings();
    loadSavedPhrases();
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [user]);

  const loadSettings = async () => { try { const d = await api.getUserSettings(); setSettings(d); } catch {} };
  const loadSavedPhrases = async () => { try { const d = await api.getSavedPhrases(); setSavedPhrases(Array.isArray(d) ? d : []); } catch {} };

  const handleSaveProfile = async () => {
    setSaving(true);
    try { await api.updateProfile({ name: editName, country: editCountry }); await refreshProfile(); setEditing(false); }
    catch (err) { Alert.alert('Error', err.message); }
    finally { setSaving(false); }
  };

  const handleDeletePhrase = async (id) => {
    try { await api.deleteSavedPhrase(id); setSavedPhrases(prev => prev.filter(p => p.phrase_id !== id)); }
    catch (err) { Alert.alert('Error', err.message); }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const tabs = [
    { key: 'stats', label: 'Stats', icon: 'stats-chart' },
    { key: 'profile', label: 'Profile', icon: 'person' },
    { key: 'phrases', label: 'Phrases', icon: 'bookmark' },
    { key: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AuroraBackground>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          <LinearGradient colors={[colors.primary, colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, { paddingTop: insets.top + 20 }]}>
            <Avatar name={user?.name} uri={user?.avatar?.image} size={80} />
            <Text style={styles.name}>{user?.name || 'Learner'}</Text>
            <Text style={styles.email}>{user?.email || ''}</Text>
            {user?.username && <Text style={styles.username}>@{user.username}</Text>}
            <View style={styles.headerStats}>
              <View style={styles.headerStat}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.headerStatValue}>{xp}</Text>
                <Text style={styles.headerStatLabel}>XP</Text>
              </View>
              <View style={styles.headerStat}>
                <Ionicons name="heart" size={16} color="#FF6B6B" />
                <Text style={styles.headerStatValue}>{hearts}</Text>
                <Text style={styles.headerStatLabel}>Hearts</Text>
              </View>
              <View style={styles.headerStat}>
                <StreakFlame streak={streak} />
              </View>
            </View>
            {badges.length > 0 && (
              <View style={styles.badgeRow}>
                {badges.slice(0, 5).map((b) => (
                  <Badge key={b.id} icon={b.icon} title="" variant="success" size="sm" />
                ))}
                {badges.length > 5 && <Text style={styles.moreBadges}>+{badges.length - 5}</Text>}
              </View>
            )}
          </LinearGradient>

          <View style={styles.tabRow}>
            {tabs.map((t) => (
              <TouchableOpacity key={t.key} style={[styles.tab, activeTab === t.key && { backgroundColor: colors.primary + '20' }]} onPress={() => setActiveTab(t.key)}>
                <Ionicons name={t.icon} size={18} color={activeTab === t.key ? colors.primary : colors.textLight} />
                <Text style={[styles.tabText, { color: activeTab === t.key ? colors.primary : colors.textLight }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.content}>
            {activeTab === 'stats' && (
              <>
                <GlassCard variant="elevated" style={styles.statsGrid}>
                  <View style={styles.statRow}>
                    <View style={styles.statItem}>
                      <Text style={[styles.statNum, { color: colors.primary }]}>{xp}</Text>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total XP</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statNum, { color: colors.accent }]}>{coins}</Text>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Coins</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statNum, { color: colors.success }]}>{streak}</Text>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Streak</Text>
                    </View>
                  </View>
                  <View style={styles.statRow}>
                    <View style={styles.statItem}>
                      <Text style={[styles.statNum, { color: '#FF6B6B' }]}>{hearts}</Text>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Hearts</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statNum, { color: colors.primary }]}>{savedPhrases.length}</Text>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Saved</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statNum, { color: colors.accent }]}>{badges.length}</Text>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Badges</Text>
                    </View>
                  </View>
                </GlassCard>
                <View style={styles.quickLinks}>
                  <TouchableOpacity style={[styles.linkRow, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]} onPress={() => navigation.navigate('Achievements')}>
                    <View style={[styles.linkIcon, { backgroundColor: colors.accent + '20' }]}>
                      <Ionicons name="trophy" size={20} color={colors.accent} />
                    </View>
                    <Text style={[styles.linkText, { color: colors.text }]}>Achievements</Text>
                    <Text style={[styles.linkCount, { color: colors.textLight }]}>{badges.length}</Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.linkRow, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]} onPress={() => navigation.navigate('Leaderboard')}>
                    <View style={[styles.linkIcon, { backgroundColor: colors.primary + '20' }]}>
                      <Ionicons name="podium" size={20} color={colors.primary} />
                    </View>
                    <Text style={[styles.linkText, { color: colors.text }]}>Leaderboard</Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
                  </TouchableOpacity>
                </View>
              </>
            )}

            {activeTab === 'profile' && (
              <GlassCard>
                {editing ? (
                  <>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Full Name</Text>
                    <TextInput style={[styles.fieldInput, { color: colors.text, backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]} value={editName} onChangeText={setEditName} />
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: spacing.md }]}>Country</Text>
                    <TextInput style={[styles.fieldInput, { color: colors.text, backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]} value={editCountry} onChangeText={setEditCountry} />
                    <View style={styles.editActions}>
                      <Button title="Cancel" variant="ghost" onPress={() => setEditing(false)} />
                      <Button title="Save" onPress={handleSaveProfile} loading={saving} />
                    </View>
                  </>
                ) : (
                  <>
                    {[
                      { label: 'Name', value: user?.name },
                      { label: 'Username', value: user?.username ? `@${user.username}` : null },
                      { label: 'Email', value: user?.email },
                      { label: 'Country', value: user?.country },
                      { label: 'Native Language', value: user?.native_language || 'English' },
                      { label: 'Learning', value: user?.target_language || 'Bisaya' },
                      { label: 'Role', value: user?.role },
                      { label: 'Member Since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : null },
                    ].filter(i => i.value).map((item, idx) => (
                      <View key={idx}>
                        <View style={styles.infoRow}>
                          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                          <Text style={[styles.infoValue, { color: colors.text }]}>{item.value}</Text>
                        </View>
                        {idx < 7 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                      </View>
                    ))}
                    <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
                      <Ionicons name="create-outline" size={18} color={colors.primary} />
                      <Text style={[styles.editBtnText, { color: colors.primary }]}>Edit Profile</Text>
                    </TouchableOpacity>
                  </>
                )}
              </GlassCard>
            )}

            {activeTab === 'phrases' && (
              <>
                {savedPhrases.length === 0 ? (
                  <GlassCard style={styles.emptyCard}>
                    <Ionicons name="bookmark-outline" size={48} color={colors.textLight} />
                    <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>No saved phrases</Text>
                    <Text style={[styles.emptyDesc, { color: colors.textLight }]}>Save phrases from conversations to review later.</Text>
                  </GlassCard>
                ) : (
                  <>
                    <TouchableOpacity style={[styles.reviewBtn, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]} onPress={() => navigation.navigate('Flashcards')}>
                      <View style={[styles.linkIcon, { backgroundColor: colors.primary + '20' }]}>
                        <Ionicons name="layers" size={20} color={colors.primary} />
                      </View>
                      <Text style={[styles.reviewText, { color: colors.text }]}>Review with Flashcards</Text>
                      <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
                    </TouchableOpacity>
                    {savedPhrases.map((item) => (
                      <GlassCard key={item.phrase_id} style={styles.phraseCard} padding="md">
                        <View style={styles.phraseContent}>
                          <Text style={[styles.phraseText, { color: colors.text }]}>{item.phrase}</Text>
                          {item.language && <Badge title={item.language} variant="info" size="sm" />}
                        </View>
                        <TouchableOpacity onPress={() => handleDeletePhrase(item.phrase_id)}>
                          <Ionicons name="trash-outline" size={18} color={colors.error} />
                        </TouchableOpacity>
                      </GlassCard>
                    ))}
                  </>
                )}
              </>
            )}

            {activeTab === 'settings' && (
              <GlassCard>
                <TouchableOpacity style={styles.settingRow} onPress={toggleTheme}>
                  <View style={styles.settingLeft}>
                    <View style={[styles.settingIcon, { backgroundColor: colors.accent + '20' }]}>
                      <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color={colors.accent} />
                    </View>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
                  </View>
                  <View style={[styles.toggle, isDark && { backgroundColor: colors.primary }]}>
                    <View style={[styles.toggleCircle, isDark && { marginLeft: 20 }]} />
                  </View>
                </TouchableOpacity>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    <View style={[styles.settingIcon, { backgroundColor: colors.primary + '20' }]}>
                      <Ionicons name="speedometer" size={18} color={colors.primary} />
                    </View>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>Speech Speed</Text>
                  </View>
                  <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{settings.speech_speed}x</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    <View style={[styles.settingIcon, { backgroundColor: colors.primary + '20' }]}>
                      <Ionicons name="mic" size={18} color={colors.primary} />
                    </View>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>Voice</Text>
                  </View>
                  <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{settings.voice_gender}</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    <View style={[styles.settingIcon, { backgroundColor: colors.textLight + '20' }]}>
                      <Ionicons name="information-circle" size={18} color={colors.textLight} />
                    </View>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>Version</Text>
                  </View>
                  <Text style={[styles.settingValue, { color: colors.textSecondary }]}>2.0.0</Text>
                </View>
              </GlassCard>
            )}

            <TouchableOpacity style={[styles.signOutBtn, { backgroundColor: colors.glassBg, borderColor: colors.error + '30' }]} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </AuroraBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { alignItems: 'center', paddingBottom: spacing.xxl, paddingHorizontal: spacing.xl },
  name: { fontSize: 24, fontWeight: '700', color: '#fff', marginTop: spacing.md, letterSpacing: 0.36 },
  email: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4, letterSpacing: -0.24 },
  username: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2, letterSpacing: -0.08 },
  headerStats: { flexDirection: 'row', gap: spacing.xxl, marginTop: spacing.lg },
  headerStat: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  headerStatValue: { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.07 },
  badgeRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.md, alignItems: 'center' },
  moreBadges: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  tabRow: { flexDirection: 'row', paddingHorizontal: spacing.xl, gap: spacing.sm, marginTop: -spacing.lg, marginBottom: spacing.lg },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.sm, borderRadius: borderRadius.md, backgroundColor: 'rgba(255,255,255,0.7)', gap: spacing.xs, ...shadows.sm },
  tabText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.07 },
  content: { padding: spacing.xl, paddingTop: 0 },
  statsGrid: { marginBottom: spacing.md },
  statRow: { flexDirection: 'row', marginBottom: spacing.md, gap: spacing.md },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 28, fontWeight: '800', letterSpacing: 0.36 },
  statLabel: { fontSize: 11, fontWeight: '500', marginTop: 2, letterSpacing: 0.07 },
  quickLinks: { gap: spacing.sm },
  linkRow: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.lg, padding: spacing.lg, gap: spacing.md, borderWidth: 1 },
  linkIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  linkText: { flex: 1, fontSize: 15, fontWeight: '600', letterSpacing: -0.24 },
  linkCount: { fontSize: 14, fontWeight: '600' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  infoLabel: { fontSize: 14, letterSpacing: -0.24 },
  infoValue: { fontSize: 14, fontWeight: '600', maxWidth: '60%', textAlign: 'right', letterSpacing: -0.24 },
  divider: { height: 1 },
  editBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md, marginTop: spacing.md, gap: spacing.xs },
  editBtnText: { fontSize: 14, fontWeight: '600' },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: spacing.sm, letterSpacing: -0.08 },
  fieldInput: { borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 15, borderWidth: 1, marginBottom: spacing.sm },
  editActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md, justifyContent: 'flex-end' },
  emptyCard: { alignItems: 'center', padding: spacing.xxl, marginBottom: spacing.md },
  emptyTitle: { fontSize: 17, fontWeight: '700', marginTop: spacing.md, letterSpacing: 0.35 },
  emptyDesc: { fontSize: 13, marginTop: spacing.sm, textAlign: 'center', letterSpacing: -0.08 },
  reviewBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, gap: spacing.md, borderWidth: 1 },
  reviewText: { flex: 1, fontSize: 15, fontWeight: '600', letterSpacing: -0.24 },
  phraseCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  phraseContent: { flex: 1 },
  phraseText: { fontSize: 15, fontWeight: '500', marginBottom: spacing.xs, letterSpacing: -0.24 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  settingIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  settingLabel: { fontSize: 15, fontWeight: '500', letterSpacing: -0.24 },
  settingValue: { fontSize: 14, letterSpacing: -0.24 },
  toggle: { width: 44, height: 24, borderRadius: 12, backgroundColor: '#D1D5DB', padding: 2, justifyContent: 'center' },
  toggleCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.xxl, marginBottom: 40, paddingVertical: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1.5, gap: spacing.sm },
  signOutText: { color: '#EF4444', fontSize: 16, fontWeight: '600' },
});
