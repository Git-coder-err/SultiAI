import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DIFFICULTY_KEY = 'sultiai_adaptive_difficulty';
const TOPIC_MASTERY_KEY = 'sultiai_topic_mastery';
const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];
const MASTERY_THRESHOLD = 0.75;
const REVIEW_THRESHOLD = 0.4;

function createInitialState() {
  return {
    difficulty: 'beginner',
    confidence: 0.5,
    sessionCount: 0,
    lastDifficultyChange: null,
  };
}

export function useAdaptiveTutor() {
  const [state, setState] = useState(createInitialState);
  const [topicMastery, setTopicMastery] = useState({});

  const loadState = useCallback(async () => {
    try {
      const [diffRaw, topicRaw] = await Promise.all([
        AsyncStorage.getItem(DIFFICULTY_KEY),
        AsyncStorage.getItem(TOPIC_MASTERY_KEY),
      ]);
      if (diffRaw) setState(JSON.parse(diffRaw));
      if (topicRaw) setTopicMastery(JSON.parse(topicRaw));
    } catch {}
  }, []);

  const persistState = useCallback(async (newState, newTopics) => {
    try {
      await AsyncStorage.setItem(DIFFICULTY_KEY, JSON.stringify(newState));
      await AsyncStorage.setItem(TOPIC_MASTERY_KEY, JSON.stringify(newTopics));
    } catch {}
  }, []);

  const recordInteraction = useCallback(async (topic, success, score) => {
    const newTopics = { ...topicMastery };
    if (!newTopics[topic]) {
      newTopics[topic] = { attempts: 0, successes: 0, totalScore: 0, lastSeen: null };
    }
    const t = newTopics[topic];
    t.attempts += 1;
    if (success) t.successes += 1;
    t.totalScore += score || 0;
    t.lastSeen = Date.now();

    const mastery = t.attempts > 0 ? t.successes / t.attempts : 0;
    const avgScore = t.attempts > 0 ? t.totalScore / t.attempts : 0;

    const newState = { ...state };
    newState.sessionCount += 1;

    const compositeScore = mastery * 0.6 + (avgScore / 100) * 0.4;
    const currentLevelIndex = DIFFICULTY_LEVELS.indexOf(newState.difficulty);

    if (compositeScore >= MASTERY_THRESHOLD && currentLevelIndex < DIFFICULTY_LEVELS.length - 1) {
      if (newState.sessionCount >= 3) {
        newState.difficulty = DIFFICULTY_LEVELS[currentLevelIndex + 1];
        newState.confidence = Math.min(1, compositeScore);
        newState.lastDifficultyChange = Date.now();
        newState.sessionCount = 0;
      }
    } else if (compositeScore <= REVIEW_THRESHOLD && currentLevelIndex > 0) {
      if (newState.sessionCount >= 5) {
        newState.difficulty = DIFFICULTY_LEVELS[currentLevelIndex - 1];
        newState.confidence = Math.max(0.1, compositeScore);
        newState.lastDifficultyChange = Date.now();
        newState.sessionCount = 0;
      }
    } else {
      newState.confidence = Math.min(1, Math.max(0.1, compositeScore));
    }

    setState(newState);
    setTopicMastery(newTopics);
    await persistState(newState, newTopics);
  }, [state, topicMastery, persistState]);

  const getDifficultyPrompt = useCallback(() => {
    const prompts = {
      beginner: {
        instruction: 'Teach word-by-word with clear pronunciation. Use very simple sentences. Repeat key vocabulary 3 times. Always provide phonetic pronunciation guides. Praise effort heavily.',
        systemTag: 'Beginner level: Focus on basic vocabulary, simple sentence structure, and lots of repetition.',
      },
      intermediate: {
        instruction: 'Expand to full sentences. Introduce common slang and casual forms. Correct grammar gently. Ask the user to repeat and practice. Introduce cultural context.',
        systemTag: 'Intermediate level: Expand sentence complexity, introduce slang, focus on conversation flow.',
      },
      advanced: {
        instruction: 'Use natural speed conversation. Correct nuance and regional variations. Discuss cultural idioms and proverbs. Challenge with complex scenarios. Provide detailed feedback on word choice.',
        systemTag: 'Advanced level: Natural conversation pace, nuanced corrections, cultural depth.',
      },
    };
    return prompts[state.difficulty] || prompts.beginner;
  }, [state.difficulty]);

  const getWeakTopics = useCallback(() => {
    return Object.entries(topicMastery)
      .filter(([, t]) => {
        const mastery = t.attempts > 0 ? t.successes / t.attempts : 0;
        return mastery < 0.5;
      })
      .sort(([, a], [, b]) => {
        const aMastery = a.attempts > 0 ? a.successes / a.attempts : 0;
        const bMastery = b.attempts > 0 ? b.successes / b.attempts : 0;
        return aMastery - bMastery;
      })
      .map(([topic]) => topic);
  }, [topicMastery]);

  const getRecommendedTopics = useCallback(() => {
    const weak = getWeakTopics();
    if (weak.length > 0) return weak.slice(0, 3);

    const dueForReview = Object.entries(topicMastery)
      .filter(([, t]) => {
        if (!t.lastSeen) return false;
        const daysSinceLastSeen = (Date.now() - t.lastSeen) / (1000 * 60 * 60 * 24);
        return daysSinceLastSeen > 3;
      })
      .sort(([, a], [, b]) => a.lastSeen - b.lastSeen)
      .map(([topic]) => topic);

    return dueForReview.slice(0, 3);
  }, [topicMastery, getWeakTopics]);

  const resetState = useCallback(async () => {
    const fresh = createInitialState();
    setState(fresh);
    setTopicMastery({});
    await persistState(fresh, {});
  }, [persistState]);

  return {
    difficulty: state.difficulty,
    confidence: state.confidence,
    sessionCount: state.sessionCount,
    topicMastery,
    loadState,
    recordInteraction,
    getDifficultyPrompt,
    getWeakTopics,
    getRecommendedTopics,
    resetState,
  };
}

export default useAdaptiveTutor;
