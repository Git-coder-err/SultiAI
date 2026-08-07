export interface AiContext {
  userLevel: string;
  strengths: string[];
  weakAreas: string[];
  commonMistakes: MistakeContext[];
  sessionHistory: ConversationTurn[];
  longTermMemory: MemoryEntry[];
  lexiconWords: LexiconWord[];
  difficultyParams: DifficultyParams;
}

export interface MistakeContext {
  pattern: string;
  correction: string;
  count: number;
}

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface MemoryEntry {
  type: 'topic' | 'preference' | 'vocabulary' | 'milestone';
  content: string;
  importance: number;
  lastAccessed: string;
}

export interface LexiconWord {
  word: string;
  definition?: string;
  dialectalRegion?: string;
  bisayaExample?: string;
}

export interface DifficultyParams {
  level: 'beginner' | 'intermediate' | 'advanced';
  instructionDetail: 'high' | 'medium' | 'low';
  correctionStyle: 'gentle' | 'moderate' | 'strict';
  vocabularyComplexity: 'simple' | 'moderate' | 'complex';
  sentenceLength: 'short' | 'medium' | 'long';
}

export interface PipelineInput {
  message?: string;
  audio?: string;
  session_id?: string;
  nativeLanguage: string;
  character?: string;
}

export interface PipelineOutput {
  reply: string;
  sessionId: string;
  transcription?: string;
  pronunciation?: PronunciationResult;
  analysis: AiAnalysis;
  recommendations?: string[];
}

export interface PronunciationResult {
  score: number;
  feedback: string;
  phonemeBreakdown: PhonemeResult[];
}

export interface PhonemeResult {
  expected: string;
  heard: string;
  correct: boolean;
  tip?: string;
}

export interface AiAnalysis {
  detectedMistakes: DetectedMistake[];
  topics: string[];
  userLevel: string;
  intent?: string;
  emotion?: string;
}

export interface DetectedMistake {
  pattern: string;
  correction: string;
  count: number;
}

export interface RecommendationInput {
  userId: number;
  userLevel: string;
  weakAreas: string[];
  recentTopics: string[];
  vocabularyMastery: number;
  streakStatus: number;
  unfinishedLessons: string[];
  pronunciationAccuracy: number;
}

export interface RecommendationOutput {
  lessonDifficulty: 'beginner' | 'intermediate' | 'advanced';
  suggestedTopics: string[];
  reviewWords: string[];
  dailyGoal: number;
  focusAreas: string[];
  reasoning: string;
}
