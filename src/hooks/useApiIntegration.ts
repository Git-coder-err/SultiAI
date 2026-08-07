import { useState, useCallback } from 'react';
import { api } from '../services/api';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface ApiIntegrationReturn<T> extends ApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
}

export function useApiIntegration<T = any>(
  apiMethod: (...args: any[]) => Promise<T>
): ApiIntegrationReturn<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await apiMethod(...args);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      return null;
    }
  }, [apiMethod]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  return { ...state, execute, reset, setData };
}

export function useLazyApi<T = any>(
  apiMethod: (...args: any[]) => Promise<T>
): ApiIntegrationReturn<T> {
  return useApiIntegration(apiMethod);
}

export function useTutorChat() {
  const { execute, ...state } = useApiIntegration(api.tutorChat);
  return { sendMessage: execute, ...state };
}

export function useLessonGenerator() {
  const { execute, ...state } = useApiIntegration(api.generateLesson);
  return { generateLesson: execute, ...state };
}

export function useVocabularyReview() {
  const { execute, ...state } = useApiIntegration(api.getVocabularyDue);
  return { getDueWords: execute, ...state };
}

export function useLeaderboard() {
  const { execute, ...state } = useApiIntegration(api.getLeaderboard);
  return { loadLeaderboard: execute, ...state };
}

export function usePronunciationCheck() {
  const { execute, ...state } = useApiIntegration(api.checkPronunciation);
  return { checkPronunciation: execute, ...state };
}
