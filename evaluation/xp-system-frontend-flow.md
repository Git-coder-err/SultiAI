# XP System — Complete Frontend Flow Report

## 1. System Overview

XP (Experience Points) is the core gamification engine of SultiAI, a Bisaya language learning app. It rewards user engagement, tracks progress through levels, and drives competitive/social features. The system uses a dual-storage architecture (AsyncStorage for local persistence + server sync for leaderboard/backup) and is managed through React Context.

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        App.js                                │
│  GestureHandler → SafeArea → Theme → User → AppContent      │
│                                                ↓             │
│            GameProvider → ToastProvider → AppNavigator        │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ↓                     ↓                     ↓
   Tab Navigator        Stack Screens         Context API
   (Home/Learn/        (Achievements/        (useGame hook)
    Tutor/Community/    Leaderboard/              │
    Profile)            VoiceMode)                ↓
                                          ┌───────────────┐
                                          │  GameContext   │
                                          │  ─ xp          │
                                          │  ─ dailyXp     │
                                          │  ─ streak      │
                                          │  ─ addXp()     │
                                          │  ─ achievements│
                                          └───────┬───────┘
                                                  │
                              ┌───────────────────┼───────────────────┐
                              ↓                   ↓                   ↓
                        AsyncStorage         API Sync            UI Update
                        (local persist)      (server PUT)        (re-render)
```

---

## 3. State Management

### 3.1 GameContext State Variables

| Variable | Type | Default | Storage Key | Purpose |
|----------|------|---------|-------------|---------|
| `xp` | number | 0 | `sultiai_xp` | Total lifetime XP |
| `dailyXp` | number | 0 | — | Today's accumulated XP |
| `dailyGoal` | number | 50 | `sultiai_daily_goal` | Daily XP target |
| `streak` | number | 0 | `sultiai_streak` | Consecutive day count |
| `coins` | number | 0 | `sultiai_coins` | Premium currency |
| `hearts` | number | 5 | `sultiai_hearts` | Lives/attempts |
| `badges` | array | [] | `sultiai_badges` | Earned badges |
| `achievements` | array | [] | `sultiai_achievements` | Earned achievements |
| `lastActive` | string | null | `sultiai_last_active` | ISO date of last activity |
| `loading` | boolean | true | — | Initialization flag |

### 3.2 Core Function: `addXp(amount, source)`

**Location:** `src/context/GameContext.js` lines 79-89

```javascript
const addXp = async (amount, source) => {
  const newXp = xp + amount;
  setXp(newXp);
  setDailyXp((d) => d + amount);
  await AsyncStorage.setItem(XP_KEY, String(newXp));
  const today = new Date().toISOString();
  setLastActive(today);
  await AsyncStorage.setItem(LAST_ACTIVE_KEY, today);
  checkAchievements({ xp: newXp, source });
  syncToServer({ xp: newXp });
};
```

**Execution flow:**

```
addXp(25, 'voice_practice')
    │
    ├─→ setXp(xp + amount)           // Update total XP
    ├─→ setDailyXp(d => d + amount)  // Update daily XP
    ├─→ AsyncStorage.setItem(XP_KEY) // Persist locally
    ├─→ AsyncStorage.setItem(LAST_ACTIVE_KEY)
    ├─→ checkAchievements({ xp, source })
    │       │
    │       └─→ If condition met → addAchievement()
    │               │
    │               ├─→ addCoins(achievement.coinReward)
    │               └─→ addXp(achievement.xpReward, 'achievement')
    │                       │
    │                       └─→ checkAchievements() [recursive]
    │
    └─→ syncToServer({ xp: newXp })
            │
            └─→ PUT /api/game/stats
```

### 3.3 Streak Logic

**Location:** `src/context/GameContext.js` lines 62-77

Triggered on app load via `useEffect` watching `lastActive`:

| Condition | Action |
|-----------|--------|
| `diffDays === 0` | No change (same day) |
| `diffDays === 1` | Streak +1 (consecutive day) |
| `diffDays > 1` | Streak resets to 0 (broken) |

---

## 4. XP Earning Sources

| Activity | XP | Source String | Screen | Trigger |
|----------|----|---------------|--------|---------|
| Voice Practice (Learn) | +25 | `voice_practice` | LearnScreen | Tap "Talk with SULTI" |
| Voice Turn (VoiceMode) | +15 | `voice_practice` | VoiceModeScreen | Complete voice turn |
| Voice Message (Tutor) | +15 | `voice_practice` | SultiTutorScreen | Stop recording |
| Chat Message | +10 | `chat` | SultiTutorScreen | Send text |
| Lesson Generation | +20 | `lesson` | SultiTutorScreen | Pick situation |
| Roleplay Start | +15 | `roleplay` | SultiTutorScreen | Start roleplay |
| Flashcard Known | +10 | `flashcard` | FlashcardsScreen | Mark as known |
| Whisper AI | +5 | `whisper` | WhisperAIScreen | Whisper interaction |
| AR Scan | +5 | `ar_scan` | ARSceneScreen | Scan object |
| Save Phrase | +2 | `save_phrase` | ARSceneScreen | Save phrase |
| Achievement Bonus | +50-500 | `achievement` | GameContext | Achievement unlock |

---

## 5. Level System

Levels are **derived from XP thresholds** (not stored as state):

| Level | XP Range | Label | Color | Icon |
|-------|----------|-------|-------|------|
| 1 | 0-99 | Starter | `#3B82F6` | leaf |
| 2 | 100-499 | Beginner | `#10B981` | sparkles |
| 3 | 500-1,999 | Intermediate | `#F59E0B` | medal |
| 4 | 2,000-4,999 | Advanced | `#EF4444` | star |
| 5 | 5,000+ | Native-like | `#8B5CF6` | trophy |

**Numeric level display:** `Math.floor(xp / 100) + 1`

**Implementation locations:**
- `src/screens/LearnScreen.js` lines 205-211
- `src/components/learning/LearningProgressCard.js` lines 65-71

---

## 6. Achievement System

### 6.1 Achievement Definitions

| ID | Title | Condition | XP Reward | Coins | Icon |
|----|-------|-----------|-----------|-------|------|
| `first_100_xp` | First Steps | XP ≥ 100 | +50 | +20 | star |
| `thousand_xp` | Century | XP ≥ 1,000 | +200 | +100 | trophy |
| `five_thousand_xp` | Dedicated | XP ≥ 5,000 | +500 | +250 | diamond |
| `streak_3` | Getting Started | Streak ≥ 3 | +50 | +30 | sparkles |
| `streak_7` | Consistent | Streak ≥ 7 | +100 | +50 | calendar |
| `streak_30` | Unstoppable | Streak ≥ 30 | +500 | +200 | crown |
| `daily_goal` | Goal Crusher | Source = lesson AND dailyXp ≥ dailyGoal | +50 | +25 | target |

### 6.2 Achievement Unlock Flow

```
addXp called with new total
        │
        ↓
checkAchievements({ xp: newXp, source })
        │
        ↓
Evaluates all achievement conditions
        │
        ↓ (if met)
addAchievement(achievement)
        │
        ├─→ setAchievements([...prev, achievement])
        ├─→ AsyncStorage.setItem(ACHIEVEMENTS_KEY)
        ├─→ addCoins(achievement.coinReward || 50)
        └─→ addXp(achievement.xpReward || 100, 'achievement')
                │
                └─→ Cascading check → possible further unlocks
        │
        ↓
api.checkAchievements()  ← server notification
```

---

## 7. UI Components

### 7.1 Component Inventory

#### XpBar
**Location:** `src/components/XpBar.js`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `current` | number | — | Current XP value |
| `max` | number | — | Maximum XP for level |
| `label` | string | — | Text label |
| `showLabel` | bool | true | Toggle label visibility |
| `color` | string | — | Fill color override |
| `height` | number | 8 | Bar thickness |

**Animation:** `Animated.timing` 800ms, width interpolation 0% → 100%, `useNativeDriver: false`

---

#### XpToast
**Location:** `src/components/voice/XpToast.js`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visible` | bool | — | Controls visibility |
| `amount` | number | 15 | XP amount to display |
| `streak` | number | 0 | Current streak |
| `offset` | number | 60 | Top position offset |

**Animation:** `FadeInUp.duration(320).springify().damping(16)` entrance, `FadeOutUp.duration(320)` exit
**Visual:** `LinearGradient` with `['#20D6C7', '#5EEAD4']`, streak badge shows 🔥 when `streak > 1`
**Auto-dismiss:** 2400ms timeout set by parent

---

#### ProgressScrollSection
**Location:** `src/components/ProgressScrollSection.js`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `level` | Object | null | User level data |
| `xp` | number | — | Total XP |
| `streak` | number | — | Current streak |
| `savedCount` | number | 0 | Saved phrases count |
| `communityCount` | number | 0 | Community posts count |

**Stat cards generated:** Sessions, Total XP, Streak, Saved, Community

---

#### ProgressRing
**Location:** `src/components/ProgressRing.js`

SVG-based circular progress using `react-native-svg` Circle with `strokeDasharray`/`strokeDashoffset`.

| Prop | Type | Default |
|------|------|---------|
| `progress` | number | — |
| `size` | number | 100 |
| `strokeWidth` | number | 8 |
| `color` | string | — |
| `trackColor` | string | — |
| `label` | string | — |

---

#### StreakFlame
**Location:** `src/components/StreakFlame.js`

| Prop | Type | Default |
|------|------|---------|
| `streak` | number | — |
| `size` | 'md'\|'lg' | 'md' |

**Animation:** Pulsing scale loop (1.0 → 1.15 → 1.0), 800ms per phase

**Color tiers:**
| Streak | Color |
|--------|-------|
| ≥30 | `#FF6B00` |
| ≥7 | `#FF9500` |
| ≥3 | `#FFB347` |
| <3 | `#FFD700` |

---

#### AnimatedNumber
**Location:** `src/components/AnimatedNumber.js`

| Prop | Type | Default |
|------|------|---------|
| `value` | number | — |
| `style` | object | — |
| `duration` | number | 500ms |
| `format` | function | — |

Uses `Animated.timing` with listener to update text via `setNativeProps`.

---

#### DashboardHeader
**Location:** `src/components/DashboardHeader.js`

**State consumed:** `xp, hearts, streak, dailyGoal, dailyXp`

**XP widget:** 72×72 circle with gradient `['#14B8A6', '#0D9488']`, displays `{xp}k` or `{xp}`

**Daily goal bar:** `Animated.View` with dynamic width percentage, fill color `#FFD700`

**Animations:** Fade in (opacity 0→1, 600ms) + slide up (translateY -10→0, spring)

---

#### LearningProgressCard
**Location:** `src/components/learning/LearningProgressCard.js`

**State consumed:** `xp, streak, dailyGoal, dailyXp`

**Level pill:** `"Level {Math.floor(xp / 100) + 1}"`

**Weekly chart:** Renders `analytics.dailyXp` as bar chart from `api.getWeeklyProgress()`

---

### 7.2 Screen-by-Screen XP Display

| Screen | XP Display | Location |
|--------|-----------|----------|
| LearnScreen | `{xp.toLocaleString()} XP` | Header right |
| DashboardScreen | `{xp}k` or `{xp}` | Gradient circle widget |
| ProfileScreen | `⭐ {xp} XP` | Header pill |
| LeaderboardScreen | `entry.xp` | Rank list |
| AchievementsScreen | Progress toward XP milestones | Achievement cards |
| ProgressScrollSection | `xp` | Stat card (flash icon) |

---

## 8. Navigation & Entry Points

### 8.1 Provider Hierarchy

```
GestureHandlerRootView
  → SafeAreaProvider
    → ThemeProvider
      → UserProvider
        → AppContent
          → GameProvider
            → ToastProvider
              → AppNavigator
```

### 8.2 XP-Related Routes

| Route | Screen | Animation | Entry Points |
|-------|--------|-----------|--------------|
| `Achievements` | AchievementsScreen | slide_from_right | ProfileScreen, FeatureGrid "Rewards" |
| `Leaderboard` | LeaderboardScreen | slide_from_right | ProfileScreen, DashboardScreen |
| `VoiceMode` | VoiceModeScreen | modal + fade | LearnScreen, SultiTutorScreen |
| `Learn` | LearnScreen | tab | "Talk with SULTI" card |
| `Tutor` | SultiTutorScreen | tab | Multiple XP sources |
| `Flashcards` | FlashcardsScreen | slide_from_right | LearnScreen modules grid |

---

## 9. User Flows

### 9.1 Voice Practice Flow

```
User taps "Talk with SULTI" (LearnScreen)
        │
        ↓
addXp(25, 'voice_practice')
        │
        ↓
navigation.navigate('VoiceMode')
        │
        ↓
User speaks → AI responds
        │
        ↓
addXp(15, 'voice_practice')    ← per turn
        │
        ↓
┌──────────────────────┐
│ setXp / setDailyXp   │
│ AsyncStorage persist │
│ checkAchievements()  │
│ syncToServer()       │
└──────────────────────┘
        │
        ↓
setXpToastVisible(true)
hapticXpGain()
        │
        ↓
XpToast renders "+15 XP" with FadeInUp
        │
        ↓
2400ms timeout → setXpToastVisible(false)
        │
        ↓
XpToast fades out (FadeOutUp)
```

### 9.2 Leaderboard Flow

```
User taps "Leaderboard" (ProfileScreen or DashboardScreen)
        │
        ↓
navigation.navigate('Leaderboard')
        │
        ↓
loadLeaderboard(period)
        │
        ↓
api.getLeaderboard('weekly'|'monthly'|'all_time')
        │
        ↓
Response: [{ id, name, xp, avatar, ... }]
        │
        ↓
┌─────────────────────────────┐
│ Top 3: Podium display       │
│   Gold / Silver / Bronze    │
│ Remaining: Ranked list 4+   │
│ Current user card if absent │
└─────────────────────────────┘
```

### 9.3 Daily Goal Flow

```
App loads → loadGameState() reads dailyXp from storage
        │
        ↓
User earns XP → addXp updates dailyXp
        │
        ↓
DashboardHeader renders dailyProgressPercent
  = Math.min((dailyXp / dailyGoal) * 100, 100)
        │
        ↓
Animated.View width fills proportionally
        │
        ↓
When dailyXp >= dailyGoal AND source === 'lesson':
  → "Goal Crusher" achievement unlocks
```

---

## 10. Backend Integration

### 10.1 API Endpoints

| Method | Endpoint | Function | Payload |
|--------|----------|----------|---------|
| GET | `/api/game/stats` | `getGameStats()` | — |
| PUT | `/api/game/stats` | `updateGameStats(data)` | `{ xp }` |
| GET | `/api/game/leaderboard?period={p}` | `getLeaderboard(period)` | — |
| POST | `/api/game/daily-reward` | `claimDailyReward()` | — |
| GET | `/api/achievements` | `getAchievements()` | — |
| POST | `/api/achievements/check` | `checkAchievements(stats)` | `{ xp, streak, dailyXp, dailyGoal }` |

### 10.2 Sync Strategy

**Location:** `src/context/GameContext.js` lines 147-151

```javascript
const syncToServer = async (data) => {
  try {
    await api.updateGameStats(data);
  } catch {}
};
```

| Characteristic | Behavior |
|----------------|----------|
| Storage-first | XP written to AsyncStorage immediately |
| Server sync | Fire-and-forget |
| Retry logic | None |
| Offline queue | None |
| Conflict resolution | None |
| Failure handling | Empty catch (silently ignored) |

### 10.3 Database Schema (Server-Side)

**Location:** `server/src/db/schema-sqlite.ts` lines 135-149

```typescript
learner_profiles {
  total_xp: integer default 0
  daily_xp: integer default 0
  daily_goal: integer default 50
}
```

---

## 11. Visual Design Summary

### 11.1 Animation Libraries

| Library | Usage |
|---------|-------|
| `react-native` Animated | XP bar fill, screen transitions, progress bars |
| `react-native-reanimated` | XP toast entrance/exit |
| `expo-linear-gradient` | XP widget, badges, toast |
| `react-native-svg` | Progress ring |
| `expo-haptics` | `hapticXpGain()` on XP earned |

### 11.2 Theme Colors

| Usage | Light | Dark |
|-------|-------|------|
| Primary | `#14B8A6` | `#2DD4BF` |
| Accent | `#F59E0B` | `#FBBF24` |
| XP Widget Gradient | `#14B8A6 → #0D9488` | Same |
| Toast Gradient | `#20D6C7 → #5EEAD4` | Same |
| Daily Goal Fill | `#FFD700` | `#FFD700` |

### 11.3 Level Colors

| Level | Color | Icon |
|-------|-------|------|
| Starter | `#3B82F6` (blue) | leaf |
| Beginner | `#10B981` (green) | sparkles |
| Intermediate | `#F59E0B` (amber) | medal |
| Advanced | `#EF4444` (red) | star |
| Native-like | `#8B5CF6` (purple) | trophy |

---

## 12. Context Value API

**Location:** `src/context/GameContext.js` lines 158-167

```javascript
value={{
  // State
  xp, coins, hearts, streak, dailyGoal, dailyXp,
  badges, achievements, loading,

  // Actions
  addXp, addCoins, spendCoins, useHeart, refillHearts,
  addBadge, addAchievement, setDailyGoal, resetDaily, checkStreak,
}}
```

**Consumed via:** `const { xp, addXp, ... } = useGame()` in any child component

---

## 13. Known Issues & Observations

| Issue | Description | Severity |
|-------|-------------|----------|
| No level-up UI | Levels are derived; no animation/screen on level up | Medium |
| Daily reset incomplete | `resetDaily()` exists but never triggered | High |
| Daily reward unused | `claimDailyReward` API has no frontend call | Medium |
| No retry on sync | Server sync failures are silently swallowed | Medium |
| XP values hardcoded | Scattered across screens, not centralized in config | Low |
| Achievement cascade risk | `addAchievement` → `addXp` → `checkAchievements` could loop | Low |
| Streak logic client-only | `checkStreak` depends on device clock | Medium |
| No offline queue | XP sync lost if server unreachable | Medium |

---

## 14. File Reference

| File | Purpose | Key Lines |
|------|---------|-----------|
| `src/context/GameContext.js` | Core state & logic | 1-174 |
| `src/components/XpBar.js` | XP progress bar | 1-47 |
| `src/components/voice/XpToast.js` | XP gain toast | 1-42 |
| `src/components/ProgressScrollSection.js` | Dashboard stats | 1-115 |
| `src/components/ProgressRing.js` | Circular progress (SVG) | 1-56 |
| `src/components/StreakFlame.js` | Animated flame icon | 1-43 |
| `src/components/AnimatedNumber.js` | Animated number counter | 1-28 |
| `src/components/DashboardHeader.js` | Dashboard XP widget | 1-310 |
| `src/components/learning/LearningProgressCard.js` | Learning stats | 1-445 |
| `src/components/learning/DailyChallengeCard.js` | Daily challenge | 1-324 |
| `src/components/learning/AIRecommendationCard.js` | AI recommendations | 1-100 |
| `src/screens/LearnScreen.js` | Voice practice entry (+25 XP) | 151-159 |
| `src/screens/VoiceModeScreen.js` | Voice session (+15 XP/turn) | 290-300 |
| `src/screens/SultiTutorScreen.js` | Chat/lesson XP sources | 231-315 |
| `src/screens/FlashcardsScreen.js` | Flashcard XP | 54 |
| `src/screens/LeaderboardScreen.js` | XP rankings | 1-200 |
| `src/screens/AchievementsScreen.js` | Achievement list | 1-200 |
| `src/screens/ProfileScreen.js` | XP stats display | 80-169 |
| `src/services/api.js` | API endpoints | 107-117 |
| `src/utils/haptics.js` | Haptic feedback | 41-43 |

---

## 15. Summary

The XP system is a fully functional gamification layer that:

1. **Rewards learning** — 11 distinct XP sources across voice, chat, flashcards, AR, and lessons
2. **Tracks progress** — 5 levels from Starter to Native-like with visual feedback
3. **Drives engagement** — 7 achievements with cascading XP/coin rewards
4. **Enables competition** — Leaderboard with weekly/monthly/all-time rankings
5. **Sets goals** — Daily XP target (default 50) with progress visualization
6. **Persists data** — Dual storage (AsyncStorage + server sync)

The system is well-architected with centralized state management (GameContext), reusable UI components, and clear separation of concerns. Key improvements needed are: daily reset automation, level-up animations, offline sync queue, and centralized XP configuration.
