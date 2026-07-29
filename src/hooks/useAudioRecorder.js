import { useState, useCallback } from 'react';
import { Audio } from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import { Alert, Platform } from 'react-native';

export function useAudioRecorder() {
  const [recording, setRecording] = useState(null);
  const [recordingStatus, setRecordingStatus] = useState('idle');
  const [loading, setLoading] = useState(false);

  const startRecording = useCallback(async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Denied', 'Microphone access is required for pronunciation practice.');
        return false;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
      const rec = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(rec);
      setRecordingStatus('recording');
      return true;
    } catch (err) {
      Alert.alert('Error', 'Could not start recording. Please try again.');
      return false;
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recording) return null;
    setLoading(true);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setRecordingStatus('idle');
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (err) {
      setRecording(null);
      setRecordingStatus('idle');
      return null;
    } finally {
      setLoading(false);
    }
  }, [recording]);

  const toggleRecording = useCallback(async () => {
    if (recording) return stopRecording();
    return startRecording();
  }, [recording, startRecording, stopRecording]);

  return {
    recording, recordingStatus, loading,
    startRecording, stopRecording, toggleRecording,
    isRecording: recordingStatus === 'recording',
  };
}
