export const dashboardGradients = {
  header: ['#5B5FEF', '#2EC4B6', '#0B1121'],
  headerFade: ['rgba(255, 255, 255, 0.12)', 'transparent'],
  xpWidget: ['#5B5FEF', '#2EC4B6'],
  progressFill: ['#38BDF8', '#2DD4BF'],
};

export const FEATURES = [
  { id: 'tutor', title: 'Sulti Tutor', iconName: 'sparkles', gradient: ['#10B981', '#059669'], path: 'SULTI' },
  { id: 'whisper', title: 'Whisper AI', iconName: 'language', gradient: ['#8B5CF6', '#7C3AED'], path: 'WhisperAI' },
  { id: 'practice', title: 'Practice', iconName: 'chatbubbles', gradient: ['#3B82F6', '#2563EB'], path: 'Learn' },
  { id: 'voice', title: 'AI Voice', iconName: 'mic-circle', gradient: ['#14B8A6', '#06B6D4'], path: 'VoiceMode' },
  { id: 'pronunciation', title: 'Pronunciation', iconName: 'mic', gradient: ['#EC4899', '#DB2777'], path: 'Pronunciation' },
  { id: 'ar', title: 'AR Explore', iconName: 'camera', gradient: ['#10B981', '#059669'], path: 'ARScene' },
  { id: 'rewards', title: 'Rewards', iconName: 'trophy', gradient: ['#F97316', '#EA580C'], path: 'Achievements' },
];

export const TAB_ROUTES = [
  { id: 'Home', label: 'Home', focusedIcon: 'home', unfocusedIcon: 'home-outline' },
  { id: 'Learn', label: 'Learn', focusedIcon: 'school', unfocusedIcon: 'school-outline' },
  { id: 'SULTI', label: 'SULTI', focusedIcon: 'sparkles', unfocusedIcon: 'sparkles-outline' },
  { id: 'Community', label: 'Community', focusedIcon: 'people', unfocusedIcon: 'people-outline' },
  { id: 'Profile', label: 'Profile', focusedIcon: 'person', unfocusedIcon: 'person-outline' },
];

export default dashboardGradients;
