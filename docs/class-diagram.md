# Class Diagram Document

## 1. Introduction

This document presents the Class Diagrams for SultiAI, illustrating the object-oriented structure of the system's key components.

---

## 2. Domain Model Classes

### 2.1 Core Domain Classes

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Core Domain Classes                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────┐                                       │
│  │          User               │                                       │
│  ├─────────────────────────────┤                                       │
│  │ - userId: number            │                                       │
│  │ - email: string             │                                       │
│  │ - name: string              │                                       │
│  │ - passwordHash: string      │                                       │
│  │ - avatarUrl: string         │                                       │
│  │ - isVerified: boolean       │                                       │
│  │ - isNativeSpeaker: boolean  │                                       │
│  │ - bio: string               │                                       │
│  │ - createdAt: Date           │                                       │
│  │ - updatedAt: Date           │                                       │
│  ├─────────────────────────────┤                                       │
│  │ + register(): Promise<void> │                                       │
│  │ + login(): Promise<Token>   │                                       │
│  │ + updateProfile(): Promise  │                                       │
│  │ + getProfile(): UserProfile │                                       │
│  └─────────────────────────────┘                                       │
│              │                                                         │
│              │ has                                                      │
│              ▼                                                         │
│  ┌─────────────────────────────┐                                       │
│  │     LearnerProfile          │                                       │
│  ├─────────────────────────────┤                                       │
│  │ - profileId: number         │                                       │
│  │ - userId: number            │                                       │
│  │ - level: string             │                                       │
│  │ - totalXp: number           │                                       │
│  │ - streak: number            │                                       │
│  │ - hearts: number            │                                       │
│  │ - dailyGoal: number         │                                       │
│  │ - dailyXp: number           │                                       │
│  │ - lastActive: Date          │                                       │
│  ├─────────────────────────────┤                                       │
│  │ + addXp(): void             │                                       │
│  │ + updateStreak(): void      │                                       │
│  │ + checkLevelUp(): boolean   │                                       │
│  │ + getStats(): GameStats     │                                       │
│  └─────────────────────────────┘                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 AI and Speech Classes

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       AI and Speech Classes                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────┐                                       │
│  │       AIService             │                                       │
│  ├─────────────────────────────┤                                       │
│  │ - apiKey: string            │                                       │
│  │ - model: string             │                                       │
│  │ - temperature: number       │                                       │
│  ├─────────────────────────────┤                                       │
│  │ + chat(): Promise<string>   │                                       │
│  │ + generateResponse(): string│                                       │
│  │ + analyzeContext(): Context │                                       │
│  └─────────────────────────────┘                                       │
│              ▲                                                         │
│              │ extends                                                  │
│              │                                                         │
│  ┌─────────────────────────────┐      ┌─────────────────────────────┐  │
│  │      GroqService            │      │      WhisperService         │  │
│  ├─────────────────────────────┤      ├─────────────────────────────┤  │
│  │ - model: 'llama-3.3-70b'   │      │ - model: 'whisper-1'        │  │
│  ├─────────────────────────────┤      ├─────────────────────────────┤  │
│  │ + chat(): Promise<string>   │      │ + transcribe(): Promise     │  │
│  │ + streamChat(): AsyncIter   │      │ + analyzeAudio(): AudioData │  │
│  └─────────────────────────────┘      └─────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────┐                                       │
│  │     SpeechService           │                                       │
│  ├─────────────────────────────┤                                       │
│  │ - sttService: WhisperService│                                       │
│  │ - ttsService: TTSService    │                                       │
│  │ - aiService: GroqService    │                                       │
│  ├─────────────────────────────┤                                       │
│  │ + processVoice(): VoiceResult                                       │
│  │ + transcribe(): string      │                                       │
│  │ + synthesize(): AudioBuffer │                                       │
│  │ + scorePronunciation(): Score                                       │
│  └─────────────────────────────┘                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Gamification Classes

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Gamification Classes                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────┐                                       │
│  │       GameService           │                                       │
│  ├─────────────────────────────┤                                       │
│  │ - profileService: ProfileSvc                                       │
│  │ - achievementService: AchSvc                                       │
│  ├─────────────────────────────┤                                       │
│  │ + addXp(): Promise<void>    │                                       │
│  │ + checkAchievements(): void │                                       │
│  │ + updateStreak(): void      │                                       │
│  │ + getLeaderboard(): User[]  │                                       │
│  └─────────────────────────────┘                                       │
│              │                                                         │
│              │ uses                                                     │
│              ▼                                                         │
│  ┌─────────────────────────────┐      ┌─────────────────────────────┐  │
│  │     Achievement             │      │       XPLog                 │  │
│  ├─────────────────────────────┤      ├─────────────────────────────┤  │
│  │ - id: string                │      │ - id: string                │  │
│  │ - title: string             │      │ - userId: number            │  │
│  │ - description: string       │      │ - amount: number            │  │
│  │ - condition: string         │      │ - source: string            │  │
│  │ - xpReward: number          │      │ - description: string       │  │
│  │ - coinReward: number        │      │ - timestamp: Date           │  │
│  │ - icon: string              │      ├─────────────────────────────┤  │
│  ├─────────────────────────────┤      │ + create(): Promise<void>   │  │
│  │ + check(): boolean          │      │ + getHistory(): XPLog[]     │  │
│  │ + unlock(): Promise<void>   │      └─────────────────────────────┘  │
│  └─────────────────────────────┘                                       │
│                                                                         │
│  ┌─────────────────────────────┐                                       │
│  │     StreakService           │                                       │
│  ├─────────────────────────────┤                                       │
│  │ - lastActive: Date          │                                       │
│  │ - currentStreak: number     │                                       │
│  ├─────────────────────────────┤                                       │
│  │ + checkStreak(): number     │                                       │
│  │ + updateStreak(): void      │                                       │
│  │ + resetStreak(): void       │                                       │
│  └─────────────────────────────┘                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.4 Learning and Vocabulary Classes

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Learning and Vocabulary Classes                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────┐                                       │
│  │     VocabularyService       │                                       │
│  ├─────────────────────────────┤                                       │
│  │ - db: Database              │                                       │
│  ├─────────────────────────────┤                                       │
│  │ + add(): Promise<void>      │                                       │
│  │ + review(): Promise<void>   │                                       │
│  │ + getDue(): VocabularyItem[]│                                       │
│  │ + calculateSM2(): SM2Result │                                       │
│  └─────────────────────────────┘                                       │
│              │                                                         │
│              │ manages                                                  │
│              ▼                                                         │
│  ┌─────────────────────────────┐                                       │
│  │     VocabularyItem          │                                       │
│  ├─────────────────────────────┤                                       │
│  │ - id: string                │                                       │
│  │ - userId: number            │                                       │
│  │ - word: string              │                                       │
│  │ - translation: string       │                                       │
│  │ - pronunciation: string     │                                       │
│  │ - category: string          │                                       │
│  │ - difficulty: number        │                                       │
│  │ - mastery: number           │                                       │
│  │ - reviewCount: number       │                                       │
│  │ - easeFactor: number        │                                       │
│  │ - interval: number          │                                       │
│  │ - nextReview: Date          │                                       │
│  ├─────────────────────────────┤                                       │
│  │ + updateMastery(): void     │                                       │
│  │ + calculateNextReview(): Date                                       │
│  │ + isDue(): boolean          │                                       │
│  └─────────────────────────────┘                                       │
│                                                                         │
│  ┌─────────────────────────────┐                                       │
│  │    PronunciationService     │                                       │
│  ├─────────────────────────────┤                                       │
│  │ - speechService: SpeechSvc  │                                       │
│  ├─────────────────────────────┤                                       │
│  │ + score(): PronunciationScore                                       │
│  │ + getAnalytics(): Analytics │                                       │
│  │ + getDifficultWords(): Word[]                                       │
│  │ + getMasteredWords(): Word[]│                                       │
│  └─────────────────────────────┘                                       │
│              │                                                         │
│              │ tracks                                                   │
│              ▼                                                         │
│  ┌─────────────────────────────┐                                       │
│  │   PronunciationAttempt      │                                       │
│  ├─────────────────────────────┤                                       │
│  │ - id: string                │                                       │
│  │ - userId: number            │                                       │
│  │ - word: string              │                                       │
│  │ - phoneticExpected: string  │                                       │
│  │ - phoneticHeard: string     │                                       │
│  │ - accuracy: number          │                                       │
│  │ - confidence: number        │                                       │
│  │ - mistakes: Mistake[]       │                                       │
│  │ - lessonContext: string     │                                       │
│  │ - timestamp: Date           │                                       │
│  └─────────────────────────────┘                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.5 Community Classes

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       Community Classes                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────┐                                       │
│  │     CommunityService        │                                       │
│  ├─────────────────────────────┤                                       │
│  │ - db: Database              │                                       │
│  ├─────────────────────────────┤                                       │
│  │ + createPost(): Promise     │                                       │
│  │ + getPosts(): Post[]        │                                       │
│  │ + likePost(): Promise       │                                       │
│  │ + bookmarkPost(): Promise   │                                       │
│  │ + addComment(): Promise     │                                       │
│  └─────────────────────────────┘                                       │
│              │                                                         │
│              │ manages                                                  │
│              ▼                                                         │
│  ┌─────────────────────────────┐                                       │
│  │       Post                  │                                       │
│  ├─────────────────────────────┤                                       │
│  │ - postId: number            │                                       │
│  │ - userId: number            │                                       │
│  │ - content: string           │                                       │
│  │ - category: string          │                                       │
│  │ - likesCount: number        │                                       │
│  │ - bookmarksCount: number    │                                       │
│  │ - isFeatured: boolean       │                                       │
│  │ - createdAt: Date           │                                       │
│  ├─────────────────────────────┤                                       │
│  │ + like(): void              │                                       │
│  │ + bookmark(): void          │                                       │
│  │ + addComment(): Comment     │                                       │
│  │ + isLiked(): boolean        │                                       │
│  │ + isBookmarked(): boolean   │                                       │
│  └─────────────────────────────┘                                       │
│              │                                                         │
│              │ has                                                      │
│              ▼                                                         │
│  ┌─────────────────────────────┐                                       │
│  │       Comment               │                                       │
│  ├─────────────────────────────┤                                       │
│  │ - commentId: number         │                                       │
│  │ - postId: number            │                                       │
│  │ - userId: number            │                                       │
│  │ - content: string           │                                       │
│  │ - createdAt: Date           │                                       │
│  ├─────────────────────────────┤                                       │
│  │ + edit(): void              │                                       │
│  │ + delete(): void            │                                       │
│  └─────────────────────────────┘                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.6 Service Layer Classes

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Service Layer Classes                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────┐                                       │
│  │     AuthService             │                                       │
│  ├─────────────────────────────┤                                       │
│  │ - jwtSecret: string         │                                       │
│  │ - db: Database              │                                       │
│  ├─────────────────────────────┤                                       │
│  │ + signup(): Promise<Token>  │                                       │
│  │ + signin(): Promise<Token>  │                                       │
│  │ + refresh(): Promise<Token> │                                       │
│  │ + logout(): Promise<void>   │                                       │
│  │ + verifyToken(): User       │                                       │
│  └─────────────────────────────┘                                       │
│                                                                         │
│  ┌─────────────────────────────┐                                       │
│  │     TutorService            │                                       │
│  ├─────────────────────────────┤                                       │
│  │ - aiService: AIService      │                                       │
│  │ - speechService: SpeechSvc  │                                       │
│  │ - contextManager: ContextMgr                                       │
│  ├─────────────────────────────┤                                       │
│  │ + chat(): Promise<Message>  │                                       │
│  │ + processVoice(): VoiceResult                                       │
│  │ + generateLesson(): Lesson  │                                       │
│  │ + startRoleplay(): Roleplay │                                       │
│  └─────────────────────────────┘                                       │
│                                                                         │
│  ┌─────────────────────────────┐                                       │
│  │     AdminService            │                                       │
│  ├─────────────────────────────┤                                       │
│  │ - db: Database              │                                       │
│  ├─────────────────────────────┤                                       │
│  │ + getUsers(): User[]        │                                       │
│  │ + updateUser(): Promise     │                                       │
│  │ + deleteUser(): Promise     │                                       │
│  │ + getAnalytics(): Analytics │                                       │
│  │ + getAuditLogs(): AuditLog[]│                                       │
│  └─────────────────────────────┘                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.7 Repository Classes

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       Repository Classes                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────┐                                       │
│  │     BaseRepository<T>       │                                       │
│  ├─────────────────────────────┤                                       │
│  │ # db: Database              │                                       │
│  │ # tableName: string         │                                       │
│  ├─────────────────────────────┤                                       │
│  │ + findById(id): T           │                                       │
│  │ + findAll(): T[]            │                                       │
│  │ + create(data): T           │                                       │
│  │ + update(id, data): T       │                                       │
│  │ + delete(id): void          │                                       │
│  └─────────────────────────────┘                                       │
│              ▲                                                         │
│              │ extends                                                  │
│  ┌─────────────────────────────┬─────────────────────────────┐         │
│  │      UserRepository         │     SessionRepository        │         │
│  ├─────────────────────────────┼─────────────────────────────┤         │
│  │ + findByEmail(): User       │ + findByUser(): Session[]   │         │
│  │ + create(): User            │ + create(): Session         │         │
│  │ + update(): User            │ + update(): Session         │         │
│  └─────────────────────────────┴─────────────────────────────┘         │
│                                                                         │
│  ┌─────────────────────────────┬─────────────────────────────┐         │
│  │   VocabularyRepository      │  PronunciationRepository     │         │
│  ├─────────────────────────────┼─────────────────────────────┤         │
│  │ + findByUser(): VocabItem[] │ + findByUser(): Attempt[]   │         │
│  │ + findDue(): VocabItem[]    │ + create(): Attempt         │         │
│  │ + updateMastery(): void     │ + getAnalytics(): Analytics │         │
│  └─────────────────────────────┴─────────────────────────────┘         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Class Relationships

### 3.1 Association Relationships

| Relationship | Type | Description |
|--------------|------|-------------|
| User → LearnerProfile | 1:1 | Each user has one profile |
| User → TutorSession | 1:N | Users can have many sessions |
| TutorSession → Message | 1:N | Sessions contain many messages |
| User → VocabularyItem | 1:N | Users have many vocabulary items |
| User → PronunciationAttempt | 1:N | Users have many pronunciation records |
| User → Post | 1:N | Users can create many posts |
| Post → Comment | 1:N | Posts can have many comments |

### 3.2 Aggregation Relationships

| Relationship | Type | Description |
|--------------|------|-------------|
| SpeechService → WhisperService | has-a | Speech service contains STT |
| SpeechService → TTSService | has-a | Speech service contains TTS |
| SpeechService → GroqService | has-a | Speech service contains AI |
| TutorService → AIService | uses-a | Tutor uses AI service |
| GameService → AchievementService | uses-a | Game uses achievement service |

### 3.3 Inheritance Relationships

| Parent | Child | Description |
|--------|-------|-------------|
| AIService | GroqService | Groq is a type of AI service |
| BaseRepository | UserRepository | User repo extends base |
| BaseRepository | SessionRepository | Session repo extends base |

---

## 4. Interface Definitions

### 4.1 Service Interfaces

```typescript
// AIService Interface
interface IAIService {
  chat(messages: Message[]): Promise<string>;
  streamChat(messages: Message[]): AsyncIterable<string>;
  analyzeContext(context: Context): AIResponse;
}

// SpeechService Interface
interface ISpeechService {
  transcribe(audio: Buffer): Promise<string>;
  synthesize(text: string): Promise<Buffer>;
  scorePronunciation(expected: string, heard: string): PronunciationScore;
}

// GameService Interface
interface IGameService {
  addXp(userId: number, amount: number, source: string): Promise<void>;
  checkAchievements(userId: number): Promise<Achievement[]>;
  updateStreak(userId: number): Promise<void>;
  getLeaderboard(period: string): Promise<User[]>;
}
```

### 4.2 Repository Interfaces

```typescript
// Base Repository Interface
interface IRepository<T> {
  findById(id: number): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: number, data: Partial<T>): Promise<T>;
  delete(id: number): Promise<void>;
}

// User Repository Interface
interface IUserRepository extends IRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserDTO): Promise<User>;
}
```

---

## 5. Design Patterns Used

### 5.1 Repository Pattern

- **Purpose**: Abstract data access layer
- **Classes**: `BaseRepository`, `UserRepository`, `SessionRepository`
- **Benefit**: Easy to switch databases (SQLite → PostgreSQL)

### 5.2 Service Layer Pattern

- **Purpose**: Encapsulate business logic
- **Classes**: `AuthService`, `TutorService`, `GameService`
- **Benefit**: Separation of concerns, testability

### 5.3 Strategy Pattern

- **Purpose**: Interchangeable algorithms
- **Classes**: `AIService` (interface), `GroqService` (implementation)
- **Benefit**: Can swap AI providers easily

### 5.4 Factory Pattern

- **Purpose**: Create objects without specifying exact class
- **Classes**: `RepositoryFactory`, `ServiceFactory`
- **Benefit**: Centralized object creation

### 5.5 Observer Pattern

- **Purpose**: Event-driven notifications
- **Classes**: `GameContext`, `UserContext`
- **Benefit**: React to state changes

---

## 6. Class Diagram Legend

| Symbol | Meaning |
|--------|---------|
| **+** | Public attribute/method |
| **-** | Private attribute/method |
| **#** | Protected attribute/method |
| **→** | Association |
| **◆→** | Aggregation |
| **▲→** | Inheritance |
| **---→** | Implementation |

---

## 7. Conclusion

The Class Diagrams for SultiAI provide:

1. **Object Structure**: Clear visualization of class attributes and methods
2. **Relationships**: Association, aggregation, and inheritance mapped
3. **Design Patterns**: Common patterns identified and applied
4. **Interfaces**: Service contracts defined
5. **Extensibility**: Easy to add new classes following patterns

These diagrams serve as a blueprint for developers implementing the system's object-oriented components.

---

*Document Version: 1.0*
*Last Updated: August 2026*
*Author: SultiAI Development Team*
