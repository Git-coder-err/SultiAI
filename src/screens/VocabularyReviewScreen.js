import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import Header from '../components/Header';
import Card from '../components/Card';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { spacing, borderRadius } from '../theme';

export default function VocabularyReviewScreen({ navigation }) {
  const { colors } = useTheme();
  const [phrases, setPhrases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadPhrases(); }, []);

  const loadPhrases = async () => {
    try {
      const data = await api.getSavedPhrases();
      setPhrases(Array.isArray(data) ? data : []);
    } catch {} finally {
      setLoading(false);}
  };

  const filtered = phrases.filter(p => {
    const text = (p.phrase || p.phrase_text || '').toLowerCase();
    const match = text.includes(search.toLowerCase());
    const catMatch = filter === 'all' || p.category === filter;
    return match && catMatch;
  });

  const categories = [...new Set(phrases.map(p => p.category).filter(Boolean))];

  if (loading) return <LoadingState fullScreen />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Vocabulary" subtitle={`${phrases.length} saved phrases`} leftIcon="arrow-back" onLeftPress={() => navigation.goBack()} />

      <View style={styles.searchContainer}>
        <View style={[styles.searchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textLight} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search vocabulary..."
            placeholderTextColor={colors.textLight}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color={colors.textLight} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.phraseCard} variant="outlined">
            <View style={styles.phraseHeader}>
              <Text style={[styles.phrase, { color: colors.text }]}>{item.phrase || item.phrase_text}</Text>
              {item.category && <Badge title={item.category} variant="info" size="sm" />}
            </View>
            {item.translation && <Text style={[styles.translation, { color: colors.textSecondary }]}>{item.translation}</Text>}
            {item.pronunciation && <Text style={[styles.pronunciation, { color: colors.textLight }]}>{item.pronunciation}</Text>}
          </Card>
        )}
        ListEmptyComponent={
          <EmptyState icon="search" title="No vocabulary found" message={search ? "Try a different search term" : "Save phrases from your lessons to build vocabulary."} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  searchRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: 2 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 15, marginLeft: spacing.sm },
  list: { padding: spacing.xl, paddingTop: 0 },
  phraseCard: { marginBottom: spacing.md },
  phraseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  phrase: { fontSize: 18, fontWeight: '700' },
  translation: { fontSize: 15, marginTop: spacing.xs },
  pronunciation: { fontSize: 13, fontStyle: 'italic', marginTop: spacing.xs },
});
