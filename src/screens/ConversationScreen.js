import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { spacing, borderRadius, shadows, getTabBarClearance } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SUGGESTIONS = [
  { label: 'At the Market', icon: 'cart', prompt: 'Buying food at a public market in Cebu' },
  { label: 'Ordering Food', icon: 'restaurant', prompt: 'Ordering at a restaurant' },
  { label: 'Greetings', icon: 'hand-left', prompt: 'Greeting someone for the first time' },
  { label: 'Directions', icon: 'compass', prompt: 'Asking for directions around Cebu City' },
  { label: 'Jeepney', icon: 'bus', prompt: 'Riding a jeepney and paying the fare' },
  { label: 'Emergency', icon: 'warning', prompt: 'Emergency situation phrases' },
];

export default function ConversationScreen({ navigation }) {
  const { user } = useUser();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [situation, setSituation] = useState('');
  const [phrases, setPhrases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPhrases = async (prompt) => {
    const query = prompt || situation.trim();
    if (!query) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.recommendPhrases(query, user?.target_language || 'Bisaya');
      setPhrases(data.phrases || []);
    } catch (err) {
      setError(err.message);
      setPhrases([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (prompt) => {
    setSituation(prompt);
    getPhrases(prompt);
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>Practice</Text>
        <Text style={styles.subtitle}>Get useful Bisaya phrases for any situation</Text>
      </View>

      <View style={[styles.inputRow, { paddingBottom: getTabBarClearance(insets) }]}>
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Describe a situation..."
            placeholderTextColor={colors.textLight}
            value={situation}
            onChangeText={setSituation}
            onSubmitEditing={() => getPhrases()}
          />
          <TouchableOpacity style={[styles.sendBtn, { backgroundColor: colors.primary }]} onPress={() => getPhrases()} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="send" size={18} color="#fff" />}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.suggestionsRow}>
        {SUGGESTIONS.map((s) => (
          <TouchableOpacity key={s.label} style={[styles.chip, { backgroundColor: colors.primaryLight, borderColor: colors.primary + '30' }]} onPress={() => handleSuggestion(s.prompt)}>
            <Ionicons name={s.icon} size={14} color={colors.primary} />
            <Text style={[styles.chipText, { color: colors.primary }]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={phrases}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <Card style={styles.phraseCard} variant="outlined">
            <View style={[styles.phraseNumber, { backgroundColor: colors.primary }]}>
              <Text style={styles.phraseNumberText}>{index + 1}</Text>
            </View>
            <Text style={[styles.phraseText, { color: colors.text }]}>{item}</Text>
          </Card>
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={phrases.length > 0 && (
          <Text style={[styles.resultTitle, { color: colors.text }]}>
            Phrases for "{situation}"
          </Text>
        )}
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="chatbubbles-outline" size={40} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Practice Conversations</Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                Describe a real-life situation or tap a suggestion above to get relevant Bisaya phrases.
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          error && (
            <Card variant="outlined" style={{ borderLeftColor: '#EF4444', borderLeftWidth: 3 }}>
              <Text style={{ color: '#EF4444', fontWeight: '600' }}>{error}</Text>
            </Card>
          )
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingBottom: spacing.lg, paddingHorizontal: spacing.xl },
  title: { fontSize: 26, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  inputRow: { padding: spacing.xl, paddingBottom: spacing.sm },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.lg, borderWidth: 1.5, paddingLeft: spacing.lg, ...shadows.sm },
  input: { flex: 1, paddingVertical: 14, fontSize: 15 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', margin: 4 },
  suggestionsRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.xl, gap: spacing.sm, marginBottom: spacing.lg },
  chip: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, gap: spacing.xs, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: '600' },
  list: { padding: spacing.xl, paddingTop: 0 },
  resultTitle: { fontSize: 16, fontWeight: '700', marginBottom: spacing.md },
  phraseCard: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  phraseNumber: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md, marginTop: 2 },
  phraseNumberText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  phraseText: { flex: 1, fontSize: 15, lineHeight: 22 },
  empty: { alignItems: 'center', paddingTop: 40, paddingHorizontal: spacing.xl },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.xl },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: spacing.sm },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
