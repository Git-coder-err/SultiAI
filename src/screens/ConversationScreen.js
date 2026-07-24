import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import { colors } from '../theme/colors';

export default function ConversationScreen() {
  const { user } = useUser();
  const [situation, setSituation] = useState('');
  const [phrases, setPhrases] = useState([]);
  const [loading, setLoading] = useState(false);

  const getPhrases = async () => {
    if (!situation.trim()) return;
    setLoading(true);
    try {
      const data = await api.recommendPhrases(situation, user?.target_language || 'Bisaya');
      setPhrases(data.phrases || []);
    } catch (err) {
      setPhrases([`Error: ${err.message}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.title}>Conversation Practice</Text>
        <Text style={styles.subtitle}>Describe a situation to get useful phrases</Text>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="e.g. At the market, ordering food..."
          placeholderTextColor={colors.textLight}
          value={situation}
          onChangeText={setSituation}
          onSubmitEditing={getPhrases}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={getPhrases} disabled={loading}>
          <Ionicons name={loading ? 'hourglass' : 'send'} size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={phrases}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.phraseCard}>
            <Text style={styles.phraseNumber}>{index + 1}</Text>
            <Text style={styles.phraseText}>{item}</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>Enter a situation to practice</Text>
            </View>
          )
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12, backgroundColor: colors.primary },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.white },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  inputRow: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  input: { flex: 1, backgroundColor: colors.white, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: colors.border, color: colors.text },
  sendBtn: { backgroundColor: colors.primary, width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  list: { padding: 16 },
  phraseCard: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 10, elevation: 1, alignItems: 'flex-start' },
  phraseNumber: { backgroundColor: colors.primary, color: colors.white, fontWeight: 'bold', width: 28, height: 28, borderRadius: 14, textAlign: 'center', lineHeight: 28, overflow: 'hidden', marginRight: 12 },
  phraseText: { flex: 1, fontSize: 15, color: colors.text, lineHeight: 22 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: colors.textSecondary, marginTop: 12, fontSize: 14 },
});
