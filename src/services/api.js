import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const LOCALHOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const BASE_URL = `http://${LOCALHOST}:3001`;

async function getToken() {
  return AsyncStorage.getItem('auth_token');
}

async function request(method, path, body = null) {
  const token = await getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  signUp: (email, password, name, native_language, target_language) =>
    request('POST', '/api/auth/signup', { email, password, name, native_language, target_language }),

  signIn: (email, password) =>
    request('POST', '/api/auth/signin', { email, password }),

  getProfile: () =>
    request('GET', '/api/users/me'),

  updateProfile: (data) =>
    request('PUT', '/api/users/me', data),

  getConversations: () =>
    request('GET', '/api/conversations'),

  saveConversation: (messages, title) =>
    request('POST', '/api/conversations', { messages, title }),

  deleteHistory: (id) =>
    request('DELETE', `/api/history/${id}`),

  getHistory: () =>
    request('GET', '/api/history'),

  translate: (text, from, to) =>
    request('POST', '/api/translation/translate', { text, from, to }),

  recommendPhrases: (situation, language) =>
    request('POST', '/api/phrases/recommend', { situation, language }),

  transcribe: (audio, language) =>
    request('POST', '/api/speech/transcribe', { audio, language }),

  analyzeNLP: (text) =>
    request('POST', '/api/nlp/analyze', { text }),

  detectLanguage: (text) =>
    request('POST', '/api/language/detect', { text }),

  checkPronunciation: (text) =>
    request('POST', '/api/pronunciation/check', { text }),

  chat: (message, language) =>
    request('POST', '/api/assistant/chat', { message, language }),

  groqChat: (messages, nativeLanguage) =>
    request('POST', '/api/groq', { messages, nativeLanguage }),

  updateLanguageSettings: (native_language, learning_language) =>
    request('PUT', '/api/settings/language', { native_language, learning_language }),

  getNotifications: () =>
    request('GET', '/api/notifications'),

  markNotificationRead: (id) =>
    request('PUT', `/api/notifications/${id}`),

  getCommunityResources: () =>
    request('GET', '/api/community/resources'),

  postCommunityResource: (phrase, translation, category) =>
    request('POST', '/api/community/resources', { phrase, translation, category }),

  getUserSettings: () =>
    request('GET', '/api/user/settings'),

  updateUserSettings: (settings) =>
    request('PUT', '/api/user/settings', settings),

  getSavedPhrases: () =>
    request('GET', '/api/saved-phrases'),

  savePhrase: (phrase, language, category) =>
    request('POST', '/api/saved-phrases', { phrase, language, category }),

  deleteSavedPhrase: (id) =>
    request('DELETE', `/api/saved-phrases/${id}`),

  submitFeedback: (functionality, usability, reliability) =>
    request('POST', '/api/feedback', { functionality, usability, reliability }),

  getLearningModules: () =>
    request('GET', '/api/learning/modules'),

  getLearningProgress: () =>
    request('GET', '/api/learning/progress'),

  updateLearningProgress: (module_id, completion_percent) =>
    request('POST', '/api/learning/progress', { module_id, completion_percent }),

  getCommunityPosts: () =>
    request('GET', '/api/community/posts'),

  createCommunityPost: (title, content) =>
    request('POST', '/api/community/posts', { title, content }),

  getPostComments: (postId) =>
    request('GET', `/api/community/posts/${postId}/comments`),

  createPostComment: (postId, comment) =>
    request('POST', `/api/community/posts/${postId}/comments`, { comment }),
};
