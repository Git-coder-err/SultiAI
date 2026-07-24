import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import { api } from '../services/api';
import { colors } from '../theme/colors';

export default function PronunciationScreen() {
  const [recording, setRecording] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('Tap to start recording');

  const startRecording = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) return Alert.alert('Permission denied', 'Microphone permission is needed');
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const rec = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(rec);
      setStatus('Recording... Tap to stop');
    } catch (err) {
      Alert.alert('Error', 'Could not start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setLoading(true);
    setStatus('Analyzing pronunciation...');
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      const audioBase64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const data = await api.transcribe(audioBase64);
      const pronunciation = await api.checkPronunciation(data.text || '');

      setResult({ transcription: data.text, ...pronunciation });
      setStatus('Done! Try again or check your score');
    } catch (err) {
      Alert.alert('Error', 'Failed to analyze pronunciation');
      setStatus('Tap to start recording');
    } finally {
      setLoading(false);
    }
  };

  const toggleRecording = () => {
    if (recording) stopRecording();
    else startRecording();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pronunciation Practice</Text>
        <Text style={styles.subtitle}>Record yourself speaking Bisaya</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.statusText}>{status}</Text>

        <TouchableOpacity style={[styles.recordBtn, recording && styles.recordBtnActive]} onPress={toggleRecording} disabled={loading}>
          <Ionicons name={recording ? 'stop' : 'mic'} size={48} color={colors.white} />
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 24 }} />}

        {result && (
          <View style={styles.resultCard}>
            {result.transcription && (
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>You said:</Text>
                <Text style={styles.resultValue}>{result.transcription}</Text>
              </View>
            )}
            {result.score != null && (
              <View style={styles.scoreRow}>
                <Text style={styles.scoreText}>{result.score}</Text>
                <Text style={styles.scoreLabel}>/ 100</Text>
              </View>
            )}
            {result.feedback && (
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Feedback:</Text>
                <Text style={styles.resultValue}>{result.feedback}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: colors.primary },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.white },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  body: { flex: 1, alignItems: 'center', paddingTop: 40, paddingHorizontal: 20 },
  statusText: { fontSize: 16, color: colors.textSecondary, marginBottom: 32 },
  recordBtn: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', elevation: 6 },
  recordBtnActive: { backgroundColor: colors.error },
  resultCard: { width: '100%', backgroundColor: colors.white, borderRadius: 16, padding: 20, marginTop: 32, elevation: 2 },
  resultRow: { marginBottom: 12 },
  resultLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 4 },
  resultValue: { fontSize: 16, color: colors.text, lineHeight: 22 },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
  scoreText: { fontSize: 48, fontWeight: 'bold', color: colors.primary },
  scoreLabel: { fontSize: 18, color: colors.textSecondary, marginLeft: 4 },
});
