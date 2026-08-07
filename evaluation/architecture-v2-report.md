# SultiAI Architecture V2 — Production Upgrade Report

## 1. Executive Summary

This report documents the comprehensive architecture overhaul of SultiAI from a functional prototype to a production-ready AI-powered language learning platform. The upgrade focuses on modularity, scalability, security, AI intelligence, and maintainability while preserving all existing features and the manuscript's core research objectives.

---

## 2. Current State Assessment

### 2.1 Strengths (Preserved)
- Clean route → repository → database separation
- Dual-write pattern (SQLite + MongoDB) with graceful fallback
- Local-first AI (no API keys required)
- Retry logic for external API calls
- Audio file caching
- Comprehensive gamification system
- Working voice pipeline with Whisper + Groq

### 2.2 Critical Gaps Addressed

| Gap | Impact | Solution |
|-----|--------|----------|
| No controllers (fat routes) | Business logic mixed with HTTP | Controller layer extraction |
| `(db as any)` everywhere | No type safety | Typed repositories |
| No standardized API responses | Inconsistent client handling | ApiResponse wrapper |
| Minimal error handling | Poor debugging experience | Centralized error handler with codes |
| No logging | No observability | Winston-based logger |
| CORS wildcard | Security risk | Configurable origin whitelist |
| No rate limiting | Vulnerable to abuse | Express-rate-limit middleware |
| No input validation | Injection risks | Request validators |
| No conversation memory | Each request is stateless | Context manager + memory service |
| No adaptive learning | Static difficulty | Adaptive engine with SM-2 |
| No pronunciation analytics | No progress tracking | Pronunciation analytics engine |
| No vocabulary intelligence | Static flashcards | Spaced repetition system |
| Hardcoded XP values | Difficult to balance | Centralized constants |
| Minimal test coverage | Regression risk | Jest + Supertest suite |

---

## 3. Target Architecture

### 3.1 Backend Structure

```
server/src/
├── config/              # Environment, constants, configuration
│   ├── env.ts           # Environment variable validation
│   ├── constants.ts     # Centralized constants (XP, levels, etc.)
│   └── index.ts         # Config aggregation
├── types/               # TypeScript interfaces
│   ├── api.ts           # API request/response types
│   ├── models.ts        # Domain model types
│   ├── ai.ts            # AI pipeline types
│   └── index.ts         # Type exports
├── middleware/          # Express middleware
│   ├── auth.ts          # JWT authentication
│   ├── error.ts         # Centralized error handler
│   ├── rateLimit.ts     # Rate limiting
│   ├── validate.ts      # Request validation
│   ├── logging.ts       # Request logging
│   └── security.ts      # Helmet, CORS config
├── utils/               # Utility functions
│   ├── apiResponse.ts   # Standardized response format
│   ├── logger.ts        # Winston logger
│   ├── groq.ts          # Groq AI client
│   ├── jwt.ts           # JWT utilities
│   ├── crypto.ts        # Password hashing
│   └── ...
├── controllers/         # Request handlers (thin)
│   ├── auth.controller.ts
│   ├── tutor.controller.ts
│   ├── game.controller.ts
│   ├── speech.controller.ts
│   ├── vocabulary.controller.ts
│   └── ...
├── services/            # Business logic
│   ├── ai/              # AI pipeline
│   │   ├── contextManager.ts
│   │   ├── conversationMemory.ts
│   │   ├── pipeline.ts
│   │   └── index.ts
│   ├── adaptive/
│   │   ├── learningEngine.ts
│   │   └── recommendationEngine.ts
│   ├── speech/
│   │   ├── pronunciationAnalytics.ts
│   │   └── vocabularyIntelligence.ts
│   ├── localLLM.ts
│   ├── sttService.ts
│   ├── ttsService.ts
│   └── ...
├── routes/              # Route definitions (thin)
│   ├── auth.routes.ts
│   ├── tutor.routes.ts
│   └── ...
├── db/                  # Database layer
│   ├── connection.ts
│   ├── schema-sqlite.ts
│   ├── repositories/
│   └── mongodb/
├── validators/          # Request validation schemas
│   ├── auth.validator.ts
│   ├── tutor.validator.ts
│   └── ...
├── __tests__/           # Test suite
│   ├── unit/
│   ├── integration/
│   └── ...
└── index.ts             # Entry point
```

### 3.2 Frontend Structure (Enhancements)

```
src/
├── constants/           # NEW: Centralized constants
│   ├── xp.ts            # XP values, level thresholds
│   ├── achievements.ts  # Achievement definitions
│   └── index.ts
├── hooks/               # NEW: Additional hooks
│   ├── useNotifications.ts
│   ├── useAccessibility.ts
│   ├── useOfflineSync.ts
│   └── ...
├── services/
│   ├── features/        # NEW: Feature flags
│   │   └── index.ts
│   └── ...
└── ...
```

---

## 4. API Response Standardization

### 4.1 Success Response

```json
{
  "success": true,
  "message": "Voice processed successfully",
  "data": { ... },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z",
    "requestId": "uuid"
  }
}
```

### 4.2 Error Response

```json
{
  "success": false,
  "error": {
    "code": "VOICE_PROCESSING_FAILED",
    "message": "Unable to process audio.",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z",
    "requestId": "uuid"
  }
}
```

### 4.3 Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Missing/invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `AI_SERVICE_ERROR` | 502 | AI provider unavailable |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## 5. AI Pipeline Architecture

### 5.1 Pipeline Stages

```
Voice Input
    ↓
[Transcription] → Whisper (Groq or Local)
    ↓
[Intent Detection] → BERT / Groq
    ↓
[Context Manager] → User profile, history, preferences
    ↓
[Conversation Memory] → Session context, long-term memory
    ↓
[Response Generation] → Groq LLaMA / Local LLM
    ↓
[Phrase Recommendation] → Contextual phrase suggestions
    ↓
[Translation] → If needed
    ↓
[Text-to-Speech] → Character voice or default
    ↓
Frontend
```

### 5.2 Context Manager

Aggregates all contextual information for AI requests:
- User profile (level, strengths, weaknesses, mistakes)
- Session history (current conversation)
- Long-term memory (frequent topics, preferences)
- Living lexicon words
- Adaptive difficulty parameters

### 5.3 Conversation Memory

Stores and retrieves conversation context:
- Short-term: Current session messages
- Long-term: Summarized past conversations
- Learned vocabulary tracking
- Topic frequency analysis
- User preference extraction

---

## 6. Adaptive Learning Engine

### 6.1 Inputs

| Input | Source | Weight |
|-------|--------|--------|
| XP | GameContext | 0.10 |
| Streak | GameContext | 0.05 |
| Accuracy | Session analysis | 0.25 |
| Vocabulary mastery | Vocabulary service | 0.20 |
| Grammar mastery | Mistake patterns | 0.15 |
| Speaking confidence | Pronunciation scores | 0.15 |
| Session history | tutor_sessions | 0.10 |

### 6.2 Outputs

- Recommended lesson difficulty (beginner/intermediate/advanced)
- Suggested review topics
- Daily goal adjustment (adaptive to user pace)
- Personalized phrase recommendations
- Weak area focus suggestions

### 6.3 Spaced Repetition (SM-2 Algorithm)

Each vocabulary item tracks:
- `repetition_count` (n)
- `ease_factor` (EF, starts at 2.5)
- `interval` (days until next review)
- `next_review` (timestamp)

SM-2 Algorithm:
```
After each review with quality q (0-5):
  if q >= 3:
    if n == 0: interval = 1
    elif n == 1: interval = 6
    else: interval = round(interval * EF)
    n += 1
  else:
    n = 0
    interval = 1

  EF = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
  if EF < 1.3: EF = 1.3
```

---

## 7. Pronunciation Analytics Engine

### 7.1 Data Model

```typescript
PronunciationAttempt {
  id: string (UUID)
  userId: string
  word: string
  phoneticExpected: string
  phoneticHeard: string
  accuracy: number (0-100)
  confidence: number (0-1)
  mistakes: Array<{ expected, heard, position }>
  lessonContext: string
  timestamp: ISO string
}
```

### 7.2 Analytics Outputs

- Weekly improvement score
- Monthly improvement trend
- Difficult words list (low accuracy, repeated)
- Mastered words list (high accuracy, consistent)
- Phoneme-level error patterns
- Speaking confidence trend

---

## 8. Vocabulary Intelligence

### 8.1 Data Model

```typescript
VocabularyItem {
  id: string (UUID)
  userId: string
  word: string
  translation: string
  pronunciation: string
  ipa: string (future-ready)
  category: string
  difficulty: number (1-5)
  mastery: number (0-100)
  reviewCount: number
  easeFactor: number
  interval: number
  nextReview: ISO string
  lastReview: ISO string
  isFavorite: boolean
  usageFrequency: number
  createdAt: ISO string
}
```

### 8.2 Features

- Spaced repetition scheduling
- Mastery tracking per word
- Category-based organization
- Difficulty auto-adjustment
- Favorite marking
- Usage frequency tracking

---

## 9. Security Improvements

### 9.1 Authentication
- JWT access tokens (short-lived: 15 min)
- JWT refresh tokens (long-lived: 7 days)
- Token rotation on refresh
- Secure httpOnly cookie option

### 9.2 Rate Limiting
- Global: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes
- AI endpoints: 30 requests per minute
- Configurable per-route

### 9.3 Input Validation
- Request body validation middleware
- SQL injection prevention (parameterized queries)
- XSS prevention (output encoding)
- File upload validation

### 9.4 Headers & CORS
- Helmet for security headers
- Configurable CORS origin whitelist
- Content Security Policy
- HSTS enforcement

---

## 10. Database Improvements

### 10.1 New Tables

| Table | Purpose |
|-------|---------|
| `pronunciation_attempts` | Store pronunciation analytics |
| `vocabulary_items` | Vocabulary with spaced repetition |
| `conversation_summaries` | Long-term conversation memory |
| `ai_recommendations` | Cached AI recommendations |
| `xp_logs` | Detailed XP earning history |
| `user_sessions` | Refresh token storage |
| `notification_preferences` | Per-user notification settings |
| `learning_analytics` | Aggregated learning metrics |

### 10.2 Improvements

- UUID primary keys for new tables
- `created_at`, `updated_at`, `deleted_at` timestamps
- Soft deletes where appropriate
- Proper foreign key indexes
- Normalized data structures

---

## 11. Frontend Improvements

### 11.1 Constants Centralization

```typescript
// src/constants/xp.ts
export const XP_VALUES = {
  VOICE_PRACTICE_LEARN: 25,
  VOICE_TURN: 15,
  CHAT_MESSAGE: 10,
  LESSON_COMPLETE: 20,
  FLASHCARD_KNOWN: 10,
  // ...
};

export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, label: 'Starter', color: '#3B82F6' },
  { level: 2, xp: 100, label: 'Beginner', color: '#10B981' },
  // ...
];
```

### 11.2 Offline Sync Manager

- Queue offline operations
- Automatic sync when online
- Conflict resolution (server-wins for XP)
- Progress indicator

### 11.3 Accessibility

- Screen reader support (accessibilityLabel)
- Dynamic text sizing
- Reduced motion support
- High contrast mode
- Keyboard navigation

### 11.4 Performance

- Lazy loading for screens
- Memoized components (React.memo)
- Optimized re-renders (useMemo, useCallback)
- Image caching
- Virtualized lists

---

## 12. Testing Strategy

### 12.1 Backend Unit Tests

| Module | Coverage Target |
|--------|----------------|
| Services | 80% |
| Controllers | 70% |
| Repositories | 60% |
| Utils | 90% |

### 12.2 Backend Integration Tests

| Endpoint Group | Tests |
|----------------|-------|
| Auth | signup, signin, refresh, logout |
| Tutor | chat, lesson, pronunciation |
| Game | stats, leaderboard, daily reward |
| Speech | transcribe, translate, synthesize |
| Vocabulary | review, due, spaced repetition |

### 12.3 Frontend Tests

| Type | Tools |
|------|-------|
| Component tests | Jest + React Native Testing Library |
| Hook tests | @testing-library/react-hooks |
| Navigation tests | Jest mocks |

---

## 13. Implementation Phases

### Phase 1: Foundation (This Implementation)
- Architecture report
- Types & interfaces
- API response standardization
- Centralized error handling
- Logging system
- Security middleware
- Constants centralization

### Phase 2: AI Intelligence
- Context manager
- Conversation memory
- Adaptive learning engine
- Pronunciation analytics
- Vocabulary intelligence
- Smart recommendations

### Phase 3: Database & API
- New table migrations
- Repository improvements
- API endpoint expansion
- Offline sync

### Phase 4: Frontend & Polish
- Accessibility
- Performance optimization
- Testing suite
- Documentation

---

## 14. File Inventory (New Files)

### Backend New Files

| File | Purpose |
|------|---------|
| `server/src/config/env.ts` | Environment validation |
| `server/src/config/constants.ts` | Centralized constants |
| `server/src/types/api.ts` | API types |
| `server/src/types/models.ts` | Domain model types |
| `server/src/types/ai.ts` | AI pipeline types |
| `server/src/utils/apiResponse.ts` | Standardized responses |
| `server/src/utils/logger.ts` | Winston logger |
| `server/src/middleware/rateLimit.ts` | Rate limiting |
| `server/src/middleware/validate.ts` | Request validation |
| `server/src/middleware/logging.ts` | Request logging |
| `server/src/middleware/security.ts` | Helmet + CORS |
| `server/src/services/ai/contextManager.ts` | AI context aggregation |
| `server/src/services/ai/conversationMemory.ts` | Conversation memory |
| `server/src/services/ai/pipeline.ts` | AI pipeline orchestrator |
| `server/src/services/adaptive/learningEngine.ts` | Adaptive difficulty |
| `server/src/services/adaptive/recommendationEngine.ts` | Smart recommendations |
| `server/src/services/speech/pronunciationAnalytics.ts` | Pronunciation tracking |
| `server/src/services/speech/vocabularyIntelligence.ts` | Vocabulary + SM-2 |
| `server/src/validators/auth.validator.ts` | Auth validation |
| `server/src/validators/tutor.validator.ts` | Tutor validation |
| `server/src/__tests__/unit/services.test.ts` | Service unit tests |
| `server/src/__tests__/integration/api.test.ts` | API integration tests |

### Frontend New Files

| File | Purpose |
|------|---------|
| `src/constants/xp.ts` | XP values & level thresholds |
| `src/constants/achievements.ts` | Achievement definitions |
| `src/hooks/useNotifications.ts` | Notification management |
| `src/hooks/useAccessibility.ts` | Accessibility preferences |
| `src/hooks/useOfflineSync.ts` | Offline sync management |
| `src/services/features/index.ts` | Feature flags |

---

## 15. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing features | Preserve all route signatures; additive changes |
| Performance regression | Benchmark before/after; lazy loading |
| Database migration failure | Backward-compatible migrations; rollback scripts |
| AI service downtime | Local LLM fallback; graceful degradation |
| Token migration | Support both old and new JWT format during transition |

---

## 16. Success Criteria

- All existing endpoints return standardized responses
- Zero breaking changes to frontend API calls
- Rate limiting active on all public endpoints
- Logging captures all requests and errors
- AI pipeline produces contextually aware responses
- Adaptive difficulty adjusts within 3 sessions
- Pronunciation analytics show improvement trends
- 80%+ test coverage on new services
- App passes accessibility audit
- Cold start under 3 seconds
