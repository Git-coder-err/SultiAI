import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform, TextInput, ActivityIndicator, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import { colors } from '../theme/colors';

export default function ProfileScreen() {
  const { user, signOut, refreshProfile } = useUser();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({ dark_mode: false, speech_speed: 1.0, voice_gender: 'neutral' });
  const [editName, setEditName] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [savedPhrases, setSavedPhrases] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditCountry(user.country || '');
    }
    loadSettings();
    loadSavedPhrases();
  }, [user]);

  const loadSettings = async () => {
    try {
      const data = await api.getUserSettings();
      setSettings(data);
    } catch {}
  };

  const loadSavedPhrases = async () => {
    try {
      const data = await api.getSavedPhrases();
      setSavedPhrases(Array.isArray(data) ? data : []);
    } catch {}
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.updateProfile({ name: editName, country: editCountry });
      await refreshProfile();
      setEditing(false);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePhrase = async (phraseId) => {
    try {
      await api.deleteSavedPhrase(phraseId);
      setSavedPhrases(prev => prev.filter(p => p.phrase_id !== phraseId));
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out?')) signOut();
    } else {
      Alert.alert('Sign Out', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try { return new Date(dateStr).toLocaleDateString(); } catch { return ''; }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {user?.avatar?.image ? (
          <Image source={{ uri: user.avatar.image }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={colors.white} />
          </View>
        )}
        <Text style={styles.name}>{user?.name || 'Learner'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
        {user?.username && <Text style={styles.username}>@{user.username}</Text>}
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, activeTab === 'profile' && styles.tabActive]} onPress={() => setActiveTab('profile')}>
          <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'phrases' && styles.tabActive]} onPress={() => setActiveTab('phrases')}>
          <Text style={[styles.tabText, activeTab === 'phrases' && styles.tabTextActive]}>Saved ({savedPhrases.length})</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'profile' && (
        <>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Personal Info</Text>
              <TouchableOpacity onPress={() => editing ? setEditing(false) : setEditing(true)}>
                <Ionicons name={editing ? 'close' : 'create-outline'} size={22} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.card}>
              {editing ? (
                <>
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Full Name</Text>
                    <TextInput style={styles.fieldInput} value={editName} onChangeText={setEditName} placeholder="Your name" placeholderTextColor={colors.textLight} />
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Country</Text>
                    <TextInput style={styles.fieldInput} value={editCountry} onChangeText={setEditCountry} placeholder="Your country" placeholderTextColor={colors.textLight} />
                  </View>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={saving}>
                    {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Name</Text>
                    <Text style={styles.infoValue}>{user?.name || '-'}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Username</Text>
                    <Text style={styles.infoValue}>{user?.username ? `@${user.username}` : '-'}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Country</Text>
                    <Text style={styles.infoValue}>{user?.country || '-'}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Role</Text>
                    <Text style={styles.infoValue}>{user?.role || 'user'}</Text>
                  </View>
                </>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Language Settings</Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Native Language</Text>
                <Text style={styles.infoValue}>{user?.native_language || 'English'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Learning</Text>
                <Text style={styles.infoValue}>{user?.target_language || 'Bisaya'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Settings</Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Dark Mode</Text>
                <Text style={styles.infoValue}>{settings.dark_mode ? 'On' : 'Off'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Speech Speed</Text>
                <Text style={styles.infoValue}>{settings.speech_speed}x</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Voice</Text>
                <Text style={styles.infoValue}>{settings.voice_gender}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>App Version</Text>
                <Text style={styles.infoValue}>2.0.0</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Powered by</Text>
                <Text style={styles.infoValue}>Groq AI</Text>
              </View>
              {user?.created_at && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Member Since</Text>
                    <Text style={styles.infoValue}>{formatDate(user.created_at)}</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </>
      )}

      {activeTab === 'phrases' && (
        <View style={styles.section}>
          {savedPhrases.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="bookmark-outline" size={40} color={colors.textLight} />
              <Text style={styles.emptyText}>No saved phrases yet</Text>
              <Text style={styles.emptySubtext}>Save phrases from conversations to review later</Text>
            </View>
          ) : (
            savedPhrases.map((item) => (
              <View key={item.phrase_id} style={styles.phraseCard}>
                <View style={styles.phraseContent}>
                  <Text style={styles.phraseText}>{item.phrase}</Text>
                  {item.language && <Text style={styles.phraseLang}>{item.language}</Text>}
                  {item.category && <Text style={styles.phraseCategory}>{item.category}</Text>}
                </View>
                <TouchableOpacity onPress={() => handleDeletePhrase(item.phrase_id)} style={styles.phraseDelete}>
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      )}

      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 24, backgroundColor: colors.primary },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' },
  name: { fontSize: 22, fontWeight: 'bold', color: colors.white, marginTop: 12 },
  email: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  username: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  tabRow: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 12, gap: 8 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.white, alignItems: 'center' },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.white },
  section: { padding: 20, paddingBottom: 0 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  card: { backgroundColor: colors.white, borderRadius: 12, padding: 16, elevation: 1 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  infoLabel: { fontSize: 15, color: colors.textSecondary },
  infoValue: { fontSize: 15, color: colors.text, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  divider: { height: 1, backgroundColor: colors.border },
  fieldGroup: { paddingVertical: 8 },
  fieldLabel: { fontSize: 13, color: colors.textSecondary, marginBottom: 6 },
  fieldInput: { backgroundColor: colors.background, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, borderWidth: 1, borderColor: colors.border, color: colors.text },
  saveBtn: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: colors.white, fontSize: 15, fontWeight: '600' },
  phraseCard: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: 12, padding: 14, marginBottom: 10, elevation: 1, alignItems: 'center' },
  phraseContent: { flex: 1 },
  phraseText: { fontSize: 15, color: colors.text, fontWeight: '500', lineHeight: 22 },
  phraseLang: { fontSize: 12, color: colors.primary, marginTop: 4 },
  phraseCategory: { fontSize: 11, color: colors.textLight, marginTop: 2, fontStyle: 'italic' },
  phraseDelete: { padding: 8 },
  emptyCard: { backgroundColor: colors.white, borderRadius: 16, padding: 32, alignItems: 'center', elevation: 2 },
  emptyText: { color: colors.textSecondary, marginTop: 12, fontSize: 15, fontWeight: '600' },
  emptySubtext: { color: colors.textLight, marginTop: 4, fontSize: 13, textAlign: 'center' },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24, marginBottom: 40, paddingVertical: 14, marginHorizontal: 20, backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.error + '40' },
  signOutText: { color: colors.error, fontSize: 16, fontWeight: '600', marginLeft: 8 },
});
