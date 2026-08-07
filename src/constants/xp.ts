export const XP_VALUES = {
  VOICE_PRACTICE_LEARN: 15,
  VOICE_PRACTICE_TURN: 10,
  TUTOR_CHAT: 5,
  TUTOR_LESSON: 20,
  ROLEPLAY_START: 15,
  FLASHCARD_KNOWN: 5,
  AR_SCAN: 10,
  SAVE_PHRASE: 5,
  WHISPER_INTERACTION: 8,
} as const;

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5000];

export const LEVEL_LABELS = [
  'Starter',
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert',
  'Master',
  'Grandmaster',
  'Native-like',
];

export const LEVEL_COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#14B8A6',
];

export const LEVEL_ICONS = [
  'leaf',
  'sparkles',
  'medal',
  'star',
  'trophy',
  'flame',
  'diamond',
  'crown',
];

export function getLevel(xp: number): {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  label: string;
  color: string;
  icon: string;
  progress: number;
} {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }

  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || currentThreshold + 1000;
  const range = nextThreshold - currentThreshold;
  const progress = range > 0 ? ((xp - currentThreshold) / range) * 100 : 100;

  const idx = Math.min(level - 1, LEVEL_LABELS.length - 1);

  return {
    level,
    currentXp: xp - currentThreshold,
    nextLevelXp: range,
    label: LEVEL_LABELS[idx],
    color: LEVEL_COLORS[idx],
    icon: LEVEL_ICONS[idx],
    progress: Math.min(100, Math.max(0, progress)),
  };
}

export function getNumericLevel(xp: number): number {
  return getLevel(Math.max(0, Number(xp) || 0)).level;
}
