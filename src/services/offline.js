import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const CACHE_PREFIX = 'sultiai_cache_';
const QUEUE_KEY = 'sultiai_sync_queue';
const TUTOR_CACHE_KEY = CACHE_PREFIX + 'tutor_responses';
const LESSON_CACHE_KEY = CACHE_PREFIX + 'lessons';
const VOCAB_CACHE_KEY = CACHE_PREFIX + 'vocabulary';
const LEXICON_CACHE_KEY = CACHE_PREFIX + 'lexicon';

const LOCALHOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const HEALTH_URL = `http://${LOCALHOST}:3001/api/health`;

export const offline = {
  async isOnline() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(HEALTH_URL, { method: 'HEAD', signal: controller.signal });
      clearTimeout(timeout);
      return res.ok;
    } catch {
      return false;
    }
  },

  async cacheTutorResponse(situation, response) {
    try {
      const existing = await AsyncStorage.getItem(TUTOR_CACHE_KEY);
      const cache = existing ? JSON.parse(existing) : {};
      cache[situation.toLowerCase()] = {
        response,
        cachedAt: Date.now(),
      };
      await AsyncStorage.setItem(TUTOR_CACHE_KEY, JSON.stringify(cache));
    } catch {}
  },

  async getCachedTutorResponse(situation) {
    try {
      const raw = await AsyncStorage.getItem(TUTOR_CACHE_KEY);
      if (!raw) return null;
      const cache = JSON.parse(raw);
      const entry = cache[situation.toLowerCase()];
      if (!entry) return null;
      const age = Date.now() - entry.cachedAt;
      const MAX_AGE = 7 * 24 * 60 * 60 * 1000;
      if (age > MAX_AGE) return null;
      return entry.response;
    } catch {
      return null;
    }
  },

  async cacheLesson(situation, lessonData) {
    try {
      const existing = await AsyncStorage.getItem(LESSON_CACHE_KEY);
      const cache = existing ? JSON.parse(existing) : {};
      cache[situation.toLowerCase()] = {
        ...lessonData,
        cachedAt: Date.now(),
      };
      await AsyncStorage.setItem(LESSON_CACHE_KEY, JSON.stringify(cache));
    } catch {}
  },

  async getCachedLesson(situation) {
    try {
      const raw = await AsyncStorage.getItem(LESSON_CACHE_KEY);
      if (!raw) return null;
      const cache = JSON.parse(raw);
      const entry = cache[situation.toLowerCase()];
      if (!entry) return null;
      const age = Date.now() - entry.cachedAt;
      const MAX_AGE = 14 * 24 * 60 * 60 * 1000;
      if (age > MAX_AGE) return null;
      return entry;
    } catch {
      return null;
    }
  },

  async cacheVocabulary(phrases) {
    try {
      await AsyncStorage.setItem(VOCAB_CACHE_KEY, JSON.stringify({
        phrases,
        cachedAt: Date.now(),
      }));
    } catch {}
  },

  async getCachedVocabulary() {
    try {
      const raw = await AsyncStorage.getItem(VOCAB_CACHE_KEY);
      if (!raw) return null;
      const cache = JSON.parse(raw);
      const age = Date.now() - cache.cachedAt;
      const MAX_AGE = 24 * 60 * 60 * 1000;
      if (age > MAX_AGE) return null;
      return cache.phrases;
    } catch {
      return null;
    }
  },

  async cacheLexicon(lexicon) {
    try {
      await AsyncStorage.setItem(LEXICON_CACHE_KEY, JSON.stringify({
        lexicon,
        cachedAt: Date.now(),
      }));
    } catch {}
  },

  async getCachedLexicon() {
    try {
      const raw = await AsyncStorage.getItem(LEXICON_CACHE_KEY);
      if (!raw) return null;
      const cache = JSON.parse(raw);
      const age = Date.now() - cache.cachedAt;
      const MAX_AGE = 7 * 24 * 60 * 60 * 1000;
      if (age > MAX_AGE) return null;
      return cache.lexicon;
    } catch {
      return null;
    }
  },

  async enqueueSync(operation) {
    try {
      const raw = await AsyncStorage.getItem(QUEUE_KEY);
      const queue = raw ? JSON.parse(raw) : [];
      queue.push({ ...operation, queuedAt: Date.now() });
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch {}
  },

  async processSyncQueue(syncFn) {
    try {
      const raw = await AsyncStorage.getItem(QUEUE_KEY);
      if (!raw) return;
      const queue = JSON.parse(raw);
      if (queue.length === 0) return;

      const online = await this.isOnline();
      if (!online) return;

      const remaining = [];
      for (const op of queue) {
        try {
          await syncFn(op);
        } catch {
          remaining.push(op);
        }
      }

      if (remaining.length === 0) {
        await AsyncStorage.removeItem(QUEUE_KEY);
      } else {
        await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
      }
    } catch {}
  },

  async clearAllCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
    } catch {}
  },
};

export default offline;
