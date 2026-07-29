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
  // Auth
  signUp: (email, password, name, native_language, target_language) =>
    request('POST', '/api/auth/signup', { email, password, name, native_language, target_language }),
  signIn: (email, password) =>
    request('POST', '/api/auth/signin', { email, password }),

  // Profile
  getProfile: () => request('GET', '/api/user/me'),
  updateProfile: (data) => request('PUT', '/api/user/me', data),

  // Tutor
  tutorChat: (message, audio, sessionId) =>
    request('POST', '/api/tutor/chat', { message, audio, session_id: sessionId }),
  getTutorLevel: () => request('GET', '/api/tutor/level'),
  getMistakes: () => request('GET', '/api/tutor/mistakes'),
  generateLesson: (situation) =>
    request('POST', '/api/tutor/lesson', { situation }),

  // Conversation / History
  getConversations: () => request('GET', '/api/conversations'),
  saveConversation: (messages, title) =>
    request('POST', '/api/conversations', { messages, title }),
  getHistory: () => request('GET', '/api/history'),
  deleteHistory: (id) => request('DELETE', `/api/history/${id}`),

  // AI / Translation
  chat: (message, language) =>
    request('POST', '/api/assistant/chat', { message, language }),
  groqChat: (messages, nativeLanguage) =>
    request('POST', '/api/groq', { messages, nativeLanguage }),
  translate: (text, from, to) =>
    request('POST', '/api/speech/translate', { text, from, to }),
  transcribe: (audio, language) =>
    request('POST', '/api/speech/transcribe', { audio, language }),
  analyzeNLP: (text) => request('POST', '/api/speech/nlp/analyze', { text }),
  detectLanguage: (text) => request('POST', '/api/speech/detect', { text }),
  checkPronunciation: (text) => request('POST', '/api/speech/pronunciation/check', { text }),

  // Phrases
  recommendPhrases: (situation, language) =>
    request('POST', '/api/speech/recommend', { situation, language }),
  getSavedPhrases: () => request('GET', '/api/saved-phrases'),
  savePhrase: (phrase, language, category) =>
    request('POST', '/api/saved-phrases', { phrase, language, category }),
  deleteSavedPhrase: (id) => request('DELETE', `/api/saved-phrases/${id}`),

  // Notifications
  getNotifications: () => request('GET', '/api/notifications'),
  markNotificationRead: (id) => request('PUT', `/api/notifications/${id}`),

  // Community
  getCommunityPosts: () => request('GET', '/api/community/posts'),
  createCommunityPost: (title, content) =>
    request('POST', '/api/community/posts', { title, content }),
  getPostComments: (postId) =>
    request('GET', `/api/community/posts/${postId}/comments`),
  createPostComment: (postId, comment) =>
    request('POST', `/api/community/posts/${postId}/comments`, { comment }),
  getCommunityResources: () => request('GET', '/api/community/resources'),
  postCommunityResource: (phrase, translation, category) =>
    request('POST', '/api/community/resources', { phrase, translation, category }),

  // Learning
  getLearningModules: () => request('GET', '/api/learning/modules'),
  getLearningProgress: () => request('GET', '/api/learning/progress'),
  updateLearningProgress: (module_id, completion_percent) =>
    request('POST', '/api/learning/progress', { module_id, completion_percent }),

  // Settings
  getUserSettings: () => request('GET', '/api/user/settings'),
  updateUserSettings: (settings) => request('PUT', '/api/user/settings', settings),
  updateLanguageSettings: (native_language, learning_language) =>
    request('PUT', '/api/user/settings/language', { native_language, learning_language }),

  // Feedback
  submitFeedback: (functionality, usability, reliability) =>
    request('POST', '/api/feedback', { functionality, usability, reliability }),

  // === NEW ENDPOINTS ===

  // Game / Gamification
  getGameStats: () => request('GET', '/api/game/stats'),
  updateGameStats: (data) => request('PUT', '/api/game/stats', data),
  getLeaderboard: (period = 'weekly') =>
    request('GET', `/api/game/leaderboard?period=${period}`),
  claimDailyReward: () => request('POST', '/api/game/daily-reward'),

  // Achievements / Badges
  getAchievements: () => request('GET', '/api/achievements'),
  getBadges: () => request('GET', '/api/achievements/badges'),

  // Vocabulary / Spaced Repetition
  getVocabularyReview: () => request('GET', '/api/vocabulary/review'),
  submitVocabReview: (phraseId, score) =>
    request('POST', '/api/vocabulary/review', { phrase_id: phraseId, score }),
  getDueForReview: () => request('GET', '/api/vocabulary/due'),

  // Challenges
  getDailyChallenge: () => request('GET', '/api/challenges/daily'),
  getWeeklyChallenge: () => request('GET', '/api/challenges/weekly'),
  completeChallenge: (challengeId) =>
    request('POST', `/api/challenges/${challengeId}/complete`),

  // Community - Follows
  followUser: (userId) => request('POST', `/api/community/follow/${userId}`),
  unfollowUser: (userId) => request('DELETE', `/api/community/follow/${userId}`),
  getFollowers: (userId) => request('GET', `/api/community/followers/${userId}`),
  getFollowing: (userId) => request('GET', `/api/community/following/${userId}`),

  // Native Speaker Verification
  submitVerification: (audioBase64, phraseId) =>
    request('POST', '/api/community/verify', { audio: audioBase64, phrase_id: phraseId }),
  getVerificationRequests: () => request('GET', '/api/community/verify/requests'),
  approveVerification: (verificationId) =>
    request('POST', `/api/community/verify/${verificationId}/approve`),

  // Analytics
  getLearningAnalytics: () => request('GET', '/api/analytics/learning'),
  getWeeklyProgress: () => request('GET', '/api/analytics/weekly'),
  getStreakData: () => request('GET', '/api/analytics/streak'),

  // AR Scenarios
  getARScenarios: () => request('GET', '/api/ar/scenarios'),
  getARScenario: (id) => request('GET', `/api/ar/scenarios/${id}`),
  getARScenarioObjects: (id, category) => {
    let path = `/api/ar/scenarios/${id}/objects`;
    if (category) path += `?category=${encodeURIComponent(category)}`;
    return request('GET', path);
  },
  analyzeARImage: (image, scenarioId, mimeType) =>
    request('POST', '/api/ar/analyze', { image, scenario_id: scenarioId, mime_type: mimeType }),

  // Language Preservation Engine
  submitPreservedWord: (data) => request('POST', '/api/preservation/submit', data),
  getLivingLexicon: () => request('GET', '/api/preservation/living'),
  getPreservationCount: () => request('GET', '/api/preservation/count'),
  getPreservedWords: (status, limit, offset) =>
    request('GET', `/api/preservation/lexicon?status=${status || ''}&limit=${limit || 50}&offset=${offset || 0}`),
  getDialectalVariations: (word) =>
    request('GET', `/api/preservation/variations?word=${encodeURIComponent(word)}`),
  verifyPreservedWord: (wordId, status) =>
    request('PUT', `/api/preservation/${wordId}/verify`, { status }),
};
