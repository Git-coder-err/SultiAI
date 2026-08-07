import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { offline } from '../services/offline';

const SYNC_QUEUE_KEY = '@offline_queue';

export interface OfflineAction {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH';
  payload: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}

export function useOfflineSync() {
  const [queue, setQueue] = useState<OfflineAction[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [syncing, setSyncing] = useState(false);
  const syncInProgress = useRef(false);
  const queueRef = useRef<OfflineAction[]>([]);

  useEffect(() => {
    loadQueue();
    const interval = setInterval(checkConnectivity, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOnline && queue.length > 0 && !syncInProgress.current) {
      flushQueue();
    }
  }, [isOnline, queue.length]);

  const checkConnectivity = async () => {
    const online = await offline.isOnline();
    setIsOnline(online);
  };

  const loadQueue = async () => {
    try {
      const stored = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      if (stored) {
        const items: OfflineAction[] = JSON.parse(stored);
        setQueue(items);
        queueRef.current = items;
      }
    } catch {
      setQueue([]);
      queueRef.current = [];
    }
  };

  const saveQueue = async (items: OfflineAction[]) => {
    try {
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(items));
      setQueue(items);
      queueRef.current = items;
    } catch {}
  };

  const enqueueAction = async (
    action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>
  ) => {
    const newAction: OfflineAction = {
      ...action,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      retryCount: 0,
    };
    const updated = [...queueRef.current, newAction];
    await saveQueue(updated);

    const online = await offline.isOnline();
    if (online && !syncInProgress.current) {
      flushQueue();
    }
  };

  const flushQueue = async () => {
    if (syncInProgress.current) return;
    syncInProgress.current = true;
    setSyncing(true);

    try {
      const online = await offline.isOnline();
      if (!online) {
        setSyncing(false);
        syncInProgress.current = false;
        return;
      }

      const items = [...queueRef.current];
      const remaining: OfflineAction[] = [];

      for (const item of items) {
        try {
          await executeRequest(item);
        } catch {
          if (item.retryCount < 3) {
            remaining.push({ ...item, retryCount: item.retryCount + 1 });
          }
        }
      }

      await saveQueue(remaining);
    } finally {
      setSyncing(false);
      syncInProgress.current = false;
    }
  };

  const executeRequest = async (item: OfflineAction) => {
    const method = item.method.toLowerCase();
    if (method === 'post') {
      await api.postData(item.endpoint, item.payload);
    } else if (method === 'put') {
      await api.putData(item.endpoint, item.payload);
    } else if (method === 'patch') {
      await api.patchData(item.endpoint, item.payload);
    }
  };

  const clearQueue = async () => {
    await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
    setQueue([]);
    queueRef.current = [];
  };

  return {
    isOnline,
    queue,
    syncing,
    enqueueAction,
    flushQueue,
    clearQueue,
    pendingCount: queue.length,
  };
}
