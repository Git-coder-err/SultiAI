# Chapter 4: System Design and Architecture

## 4.1 Introduction

This chapter presents the system design and architecture of SultiAI, an AI-powered language learning application. The design encompasses the overall system architecture, database design, user interface design, and the technical components that enable the application's functionality.

---

## 4.2 System Architecture Overview

### 4.2.1 Architecture Pattern

SultiAI follows a **multi-tier client-server architecture** with the following layers:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │   Web App    │  │ Mobile App   │  │ Admin Panel  │               │
│  │   (React)    │  │(React Native)│  │  (Next.js)   │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                                    │
│              (Node.js + Express + TypeScript)                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      SERVICES LAYER                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │   AI Chat    │  │   Speech     │  │   Learning   │               │
│  │   Service    │  │   Service    │  │   Service    │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │   Gamifi-    │  │  Community   │  │   Admin      │               │
│  │   cation     │  │   Service    │  │   Service    │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                      │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │   SQLite     │  │   Supabase   │  │   Local      │               │
│  │  (Primary)   │  │  (Cloud DB)  │  │   Cache      │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2.2 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Mobile Client** | React Native (Expo SDK 56) | Cross-platform mobile application |
| **Web Client** | React (Next.js) | Web application interface |
| **Admin Panel** | Next.js + TypeScript | Administrative dashboard |
| **API Gateway** | Node.js + Express + TypeScript | REST API server |
| **Database** | SQLite (local) + Supabase (cloud) | Data persistence |
| **AI Services** | Groq LLaMA + Whisper | Language processing |

---

## 4.3 Database Design

### 4.3.1 Entity Relationship Diagram (ERD)

The database design follows a relational model with the following key entities:

```
┌─────────────────────┐       ┌─────────────────────┐
│       users         │       │   learner_profiles   │
├─────────────────────┤       ├─────────────────────┤
│ user_id (PK)       │──┐    │ profile_id (PK)     │
│ email              │  │    │ user_id (FK)        │
│ name               │  ├───│ level               │
│ password_hash      │  │    │ total_xp            │
│ avatar_url         │  │    │ streak              │
│ is_verified        │  │    │ hearts              │
│ is_native_speaker  │  │    │ daily_goal          │
│ created_at         │  │    │ daily_xp            │
└─────────────────────┘  │    └─────────────────────┘
                         │
                         │    ┌─────────────────────┐
                         │    │   tutor_sessions     │
                         │    ├─────────────────────┤
                         │    │ session_id (PK)     │
                         └───│ user_id (FK)        │
                              │ topic               │
                              │ xp_earned           │
                              │ started_at          │
                              │ ended_at            │
                              └─────────────────────┘
```

### 4.3.2 Core Tables

#### Users Table
```sql
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    is_verified INTEGER DEFAULT 0,
    is_native_speaker INTEGER DEFAULT 0,
    bio TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
```

#### Learner Profiles Table
```sql
CREATE TABLE learner_profiles (
    profile_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    level TEXT DEFAULT 'Sugod',
    total_xp INTEGER DEFAULT 0,
    daily_xp INTEGER DEFAULT 0,
    daily_goal INTEGER DEFAULT 50,
    streak INTEGER DEFAULT 0,
    hearts INTEGER DEFAULT 5,
    last_active TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

#### Tutor Sessions Table
```sql
CREATE TABLE tutor_sessions (
    session_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_type TEXT DEFAULT 'chat',
    topic TEXT,
    xp_earned INTEGER DEFAULT 0,
    started_at TEXT DEFAULT (datetime('now')),
    ended_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

#### Messages Table
```sql
CREATE TABLE messages (
    message_id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    audio_url TEXT,
    pronunciation_score REAL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (session_id) REFERENCES tutor_sessions(session_id) ON DELETE CASCADE
);
```

#### Vocabulary Table
```sql
CREATE TABLE vocabulary_reviews (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    word TEXT NOT NULL,
    translation TEXT DEFAULT '',
    pronunciation TEXT DEFAULT '',
    category TEXT DEFAULT 'custom',
    difficulty INTEGER DEFAULT 1,
    mastery REAL DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    ease_factor REAL DEFAULT 2.5,
    interval INTEGER DEFAULT 1,
    next_review TEXT NOT NULL,
    is_favorite INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

#### Community Posts Table
```sql
CREATE TABLE community_posts (
    post_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    likes_count INTEGER DEFAULT 0,
    bookmarks_count INTEGER DEFAULT 0,
    is_featured INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

### 4.3.3 New Tables (Architecture V2)

| Table | Purpose |
|-------|---------|
| `pronunciation_attempts` | Store pronunciation analytics data |
| `vocabulary_reviews` | Vocabulary with spaced repetition (SM-2) |
| `conversation_summaries` | Long-term conversation memory |
| `xp_logs` | Detailed XP earning history |
| `ai_recommendations` | Cached AI recommendations |
| `user_sessions` | Refresh token storage |
| `notification_preferences` | Per-user notification settings |
| `learning_analytics` | Aggregated learning metrics |
| `audit_logs` | System audit trail |

---

## 4.4 User Interface Design

### 4.4.1 Mobile Application Screens

The mobile application consists of the following main screens:

#### Authentication Screens
- **LoginScreen** - User login with email/password
- **SignUpScreen** - New user registration
- **ForgotPasswordScreen** - Password recovery
- **OnboardingScreen** - First-time user guide

#### Main Navigation Tabs
- **DashboardScreen** - Home with progress overview
- **LearnScreen** - Learning modules and lessons
- **SultiTutorScreen** - AI chat tutor interface
- **CommunityScreen** - Social features and posts
- **ProfileScreen** - User profile and settings

#### Feature Screens
- **VoiceModeScreen** - Voice conversation with AI
- **PronunciationScreen** - Pronunciation practice
- **FlashcardsScreen** - Vocabulary flashcards
- **ARSceneScreen** - AR learning scenarios
- **AchievementsScreen** - Badges and achievements
- **LeaderboardScreen** - Rankings and competition

### 4.4.2 Design System

#### Color Palette
| Usage | Light | Dark |
|-------|-------|------|
| Primary | `#14B8A6` | `#2DD4BF` |
| Accent | `#F59E0B` | `#FBBF24` |
| Background | `#FFFFFF` | `#0F172A` |
| Text | `#1E293B` | `#F8FAFC` |

#### Typography
- **Headers**: System font bold (24px, 20px, 16px)
- **Body**: System font regular (16px, 14px)
- **Labels**: System font medium (12px)

### 4.4.3 Admin Dashboard

The admin panel provides the following modules:
- **Users Management** - View and manage users
- **Lessons Management** - Create/edit learning content
- **Community Moderation** - Manage posts and reports
- **Analytics Dashboard** - System metrics and insights
- **Settings** - Application configuration

---

## 4.5 System Features

### 4.5.1 Core Features

1. **AI Language Tutor (SULTI!)**
   - Real-time chat conversations
   - Context-aware responses using Groq LLaMA
   - Situation-based lessons
   - Roleplay scenarios

2. **Voice Processing**
   - Speech-to-text using Whisper
   - Text-to-speech with character voices
   - Pronunciation scoring and feedback
   - Audio recording and playback

3. **Gamification System**
   - Experience points (XP) for activities
   - Level progression system
   - Streak tracking
   - Achievements and badges
   - Daily challenges

4. **Learning Features**
   - Flashcard system with spaced repetition
   - Vocabulary tracking
   - Progress analytics
   - Personalized recommendations

5. **Community Features**
   - User posts and comments
   - Native speaker verification
   - Leaderboards
   - Achievement sharing

### 4.5.2 AI Pipeline

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Voice Input │───▶│  Whisper    │───▶│   Groq AI   │
│ (Audio)     │    │  (STT)      │    │  (LLaMA)    │
└─────────────┘    └─────────────┘    └─────────────┘
                          │                    │
                          ▼                    ▼
                   ┌─────────────┐    ┌─────────────┐
                   │ Transcribed │    │   AI        │
                   │   Text      │    │  Response   │
                   └─────────────┘    └─────────────┘
                                              │
                                              ▼
                                     ┌─────────────┐
                                     │   TTS       │
                                     │ (Optional)  │
                                     └─────────────┘
```

---

## 4.6 API Design

### 4.6.1 RESTful API Endpoints

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/signin` | User login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | User logout |

#### Tutor
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tutor/chat` | Send chat message |
| POST | `/api/tutor/voice` | Process voice input |
| GET | `/api/tutor/sessions` | Get user sessions |
| POST | `/api/tutor/lesson` | Generate lesson |

#### Speech
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/speech/transcribe` | Transcribe audio |
| POST | `/api/speech/synthesize` | Text-to-speech |
| POST | `/api/speech/pronunciation` | Score pronunciation |

#### Gamification
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/game/stats` | Get game statistics |
| PUT | `/api/game/stats` | Update game stats |
| GET | `/api/game/leaderboard` | Get leaderboard |
| GET | `/api/achievements` | Get achievements |

#### Vocabulary
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vocabulary` | Get vocabulary list |
| POST | `/api/vocabulary` | Add vocabulary |
| PUT | `/api/vocabulary/:id/review` | Update review |

### 4.6.2 API Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Operation completed",
  "data": { ... },
  "meta": {
    "timestamp": "2026-08-27T10:30:00Z",
    "requestId": "uuid"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2026-08-27T10:30:00Z",
    "requestId": "uuid"
  }
}
```

---

## 4.7 Security Design

### 4.7.1 Authentication
- JWT access tokens (15-minute expiration)
- JWT refresh tokens (7-day expiration)
- Password hashing with bcrypt
- Token rotation on refresh

### 4.7.2 Authorization
- Role-based access control (RBAC)
- User roles: User, Native Speaker, Admin
- Resource-level permissions

### 4.7.3 Data Protection
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS protection (output encoding)
- CORS configuration
- Rate limiting on API endpoints

---

## 4.8 Deployment Architecture

### 4.8.1 Development Environment
- Local SQLite database
- Expo development server
- Node.js backend server

### 4.8.2 Production Environment
- Cloud database (Supabase)
- Containerized deployment (Docker)
- CI/CD with GitHub Actions
- SSL/HTTPS encryption

---

## 4.9 Conclusion

The system design of SultiAI provides a comprehensive, scalable architecture that supports:
- Cross-platform mobile and web access
- Real-time AI-powered language tutoring
- Comprehensive gamification and progress tracking
- Secure data storage and user authentication
- Extensible architecture for future enhancements

The design prioritizes user experience, performance, and maintainability while supporting the core mission of preserving and teaching the Bisaya language.
