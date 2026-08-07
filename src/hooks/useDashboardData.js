import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

/**
 * @typedef {Object} DashboardData
 * @property {Array} history
 * @property {Array} notifications
 * @property {number} unreadCount
 * @property {Array} savedPhrases
 * @property {Array} communityPosts
 * @property {Object|null} level
 * @property {Array} mistakes
 * @property {boolean} loading
 * @property {Function} markAsRead
 * @property {Function} refresh
 */

/**
 * Centralized data-fetch hook for the dashboard screen.
 * Fetches history, notifications, saved phrases, community posts,
 * tutor level, and mistake analytics in parallel.
 *
 * @returns {DashboardData}
 */
export function useDashboardData() {
  const [history, setHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [savedPhrases, setSavedPhrases] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [level, setLevel] = useState(null);
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        histResult,
        notifResult,
        phrasesResult,
        postsResult,
        levelResult,
        mistakesResult,
      ] = await Promise.allSettled([
        api.getHistory(),
        api.getNotifications(),
        api.getSavedPhrases(),
        api.getCommunityPosts(),
        api.getTutorLevel(),
        api.getMistakes(),
      ]);

      if (histResult.status === 'fulfilled' && Array.isArray(histResult.value)) {
        setHistory(histResult.value);
      }
      if (notifResult.status === 'fulfilled' && Array.isArray(notifResult.value)) {
        setNotifications(notifResult.value);
      }
      if (phrasesResult.status === 'fulfilled' && Array.isArray(phrasesResult.value)) {
        setSavedPhrases(phrasesResult.value);
      }
      if (postsResult.status === 'fulfilled' && Array.isArray(postsResult.value)) {
        setCommunityPosts(postsResult.value);
      }
      if (levelResult.status === 'fulfilled') {
        setLevel(levelResult.value);
      }
      if (mistakesResult.status === 'fulfilled' && Array.isArray(mistakesResult.value)) {
        setMistakes(mistakesResult.value);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notifId) => {
    try {
      await api.markNotificationRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n)),
      );
    } catch {}
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    history,
    notifications,
    unreadCount,
    savedPhrases,
    communityPosts,
    level,
    mistakes,
    loading,
    refreshing,
    markAsRead,
    refresh,
  };
}
