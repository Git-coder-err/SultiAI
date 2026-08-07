import { getLevel } from '../constants/xp';

export interface UserStats {
  xp?: number;
  dailyTargetXp?: number;
  dailyXp?: number;
  wordsLearned?: number;
  streakDays?: number;
  weeklyProgress?: number;
  pronunciationScore?: number;
}

export interface SafeStats {
  xpDisplay: string;
  levelDisplay: number;
  targetDisplay: string;
  wordsCount: string;
  streakCount: number;
  levelLabel: string;
  levelColor: string;
  levelIcon: string;
  dailyProgress: number;
  weeklyProgress: number;
  pronunciationScore: number;
}

export function SafeUserStats(stats?: UserStats): SafeStats {
  const safeXp = Math.max(0, Number(stats?.xp) || 0);
  const safeTarget = Math.max(1, Number(stats?.dailyTargetXp) || 50);
  const safeWords = Math.max(0, Number(stats?.wordsLearned) || 0);
  const safeStreak = Math.max(0, Number(stats?.streakDays) || 0);
  const hasDailyXp = stats?.dailyXp !== undefined && stats?.dailyXp !== null;
  const safeDailyXp = Math.max(0, Number(hasDailyXp ? stats.dailyXp : stats?.xp) || 0);
  const safeWeekly = clamp(Number(stats?.weeklyProgress) || 65, 0, 100);
  const safePronunciation = clamp(Number(stats?.pronunciationScore) || 88, 0, 100);
  const levelInfo = getLevel(safeXp);
  const dailyProgress = safeTarget > 0 ? Math.min(Math.round((safeDailyXp / safeTarget) * 100), 100) : 0;

  return {
    xpDisplay: safeXp.toLocaleString(),
    levelDisplay: levelInfo.level || 1,
    targetDisplay: `${safeDailyXp.toLocaleString()} / ${safeTarget} XP`,
    wordsCount: safeWords.toLocaleString(),
    streakCount: safeStreak,
    levelLabel: levelInfo.label,
    levelColor: levelInfo.color,
    levelIcon: levelInfo.icon,
    dailyProgress,
    weeklyProgress: safeWeekly,
    pronunciationScore: safePronunciation,
  };
}

export function formatNumber(value: number | undefined | null, fallback = 0): string {
  const safe = Math.max(0, Number(value) || fallback);
  return safe.toLocaleString();
}

export function formatLevel(xp: number | undefined | null): number {
  const safeXp = Math.max(0, Number(xp) || 0);
  return getLevel(safeXp).level || 1;
}

export function formatDailyProgress(current: number | undefined | null, target: number | undefined | null): number {
  const safeCurrent = Math.max(0, Number(current) || 0);
  const safeTarget = Math.max(1, Number(target) || 50);
  return Math.min(Math.round((safeCurrent / safeTarget) * 100), 100);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
