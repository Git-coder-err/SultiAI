# Use Case Diagram Document

## 1. Introduction

This document presents the Use Case Diagrams for SultiAI, illustrating the interactions between actors (users) and the system's functionalities.

---

## 2. Actors

### 2.1 Primary Actors

| Actor | Description |
|-------|-------------|
| **Guest** | Unregistered user exploring the app |
| **Learner** | Registered user learning Bisaya |
| **Native Speaker** | Verified Bisaya speaker providing feedback |
| **Administrator** | System administrator managing the platform |

### 2.2 Secondary Actors

| Actor | Description |
|-------|-------------|
| **AI System** | Groq LLaMA and Whisper AI services |
| **Database** | Data storage and retrieval |

---

## 3. Use Case Diagrams

### 3.1 System-Level Use Case Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                         SultiAI System                                  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                 │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │   │
│  │  │    Register     │  │      Login      │  │   Logout        │ │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘ │   │
│  │                                                                 │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │   │
│  │  │   Chat with     │  │   Voice Chat    │  │   Pronunciation │ │   │
│  │  │   AI Tutor      │  │   with AI       │  │   Practice      │ │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘ │   │
│  │                                                                 │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │   │
│  │  │   Take Lessons  │  │   Flashcards    │  │   AR Learning   │ │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘ │   │
│  │                                                                 │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │   │
│  │  │   View Progress │  │   Earn XP       │  │   View Leader-  │ │   │
│  │  │   & Analytics   │  │   & Achievements│  │   board         │ │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘ │   │
│  │                                                                 │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │   │
│  │  │   Community     │  │   Verify        │  │   Manage        │ │   │
│  │  │   Posts         │  │   Pronunciation │  │   Users         │ │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘ │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

Actors:
┌─────────┐                                    ┌─────────┐
│  Guest  │───────────────────────────────────▶│         │
│         │                                    │         │
└─────────┘                                    │         │
                                               │         │
┌─────────┐                                    │         │
│ Learner │───────────────────────────────────▶│ SultiAI │
│         │                                    │         │
└─────────┘                                    │         │
                                               │         │
┌───────────────┐                              │         │
│ Native Speaker│─────────────────────────────▶│         │
│               │                              │         │
└───────────────┘                              │         │
                                               │         │
┌───────────────┐                              │         │
│ Administrator │─────────────────────────────▶│         │
│               │                              │         │
└───────────────┘                              └─────────┘
```

### 3.2 Learner Use Case Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                           Learner Use Cases                             │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                 │   │
│  │                    ┌───────────────────┐                        │   │
│  │                    │   Authentication  │                        │   │
│  │                    └─────────┬─────────┘                        │   │
│  │                              │                                  │   │
│  │              ┌───────────────┼───────────────┐                  │   │
│  │              │               │               │                  │   │
│  │              ▼               ▼               ▼                  │   │
│  │     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │   │
│  │     │  Register   │  │    Login    │  │   Logout    │         │   │
│  │     └─────────────┘  └─────────────┘  └─────────────┘         │   │
│  │                                                                 │   │
│  │                    ┌───────────────────┐                        │   │
│  │                    │   AI Tutoring     │                        │   │
│  │                    └─────────┬─────────┘                        │   │
│  │                              │                                  │   │
│  │              ┌───────────────┼───────────────┐                  │   │
│  │              │               │               │                  │   │
│  │              ▼               ▼               ▼                  │   │
│  │     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │   │
│  │     │ Text Chat   │  │ Voice Chat  │  │  Pronunciation│        │   │
│  │     │ with SULTI  │  │ with SULTI  │  │   Practice   │         │   │
│  │     └─────────────┘  └─────────────┘  └─────────────┘         │   │
│  │                                                                 │   │
│  │                    ┌───────────────────┐                        │   │
│  │                    │   Learning        │                        │   │
│  │                    └─────────┬─────────┘                        │   │
│  │                              │                                  │   │
│  │              ┌───────────────┼───────────────┐                  │   │
│  │              │               │               │                  │   │
│  │              ▼               ▼               ▼                  │   │
│  │     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │   │
│  │     │   Lessons   │  │  Flashcards │  │ AR Learning │         │   │
│  │     └─────────────┘  └─────────────┘  └─────────────┘         │   │
│  │                                                                 │   │
│  │                    ┌───────────────────┐                        │   │
│  │                    │   Gamification    │                        │   │
│  │                    └─────────┬─────────┘                        │   │
│  │                              │                                  │   │
│  │              ┌───────────────┼───────────────┐                  │   │
│  │              │               │               │                  │   │
│  │              ▼               ▼               ▼                  │   │
│  │     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │   │
│  │     │  Earn XP    │  │ Achievements│  │ Leaderboard │         │   │
│  │     └─────────────┘  └─────────────┘  └─────────────┘         │   │
│  │                                                                 │   │
│  │                    ┌───────────────────┐                        │   │
│  │                    │   Community       │                        │   │
│  │                    └─────────┬─────────┘                        │   │
│  │                              │                                  │   │
│  │              ┌───────────────┼───────────────┐                  │   │
│  │              │               │               │                  │   │
│  │              ▼               ▼               ▼                  │   │
│  │     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │   │
│  │     │ View Posts  │  │Create Posts │  │   Comment   │         │   │
│  │     └─────────────┘  └─────────────┘  └─────────────┘         │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

Actors:
┌─────────┐
│ Learner │──────────────────────────────────────────────────────────────▶
│         │
└─────────┘
```

### 3.3 Native Speaker Use Case Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                      Native Speaker Use Cases                           │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                 │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │   │
│  │  │  All Learner    │  │  Verify         │  │  Submit         │ │   │
│  │  │  Features       │  │  Pronunciation  │  │  Dialect        │ │   │
│  │  │                 │  │  Recordings     │  │  Variations     │ │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘ │   │
│  │                                                                 │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │   │
│  │  │  Record Example │  │  Earn           │  │  View           │ │   │
│  │  │  Phrases        │  │  Contributor    │  │  Contributions  │ │   │
│  │  │                 │  │  Badges         │  │  History        │ │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘ │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

Actors:
┌───────────────┐
│ Native Speaker│────────────────────────────────────────────────────────▶
│               │
└───────────────┘
```

### 3.4 Administrator Use Case Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                      Administrator Use Cases                            │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                 │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │   │
│  │  │  Manage Users   │  │  Manage         │  │  Manage         │ │   │
│  │  │  (CRUD)         │  │  Lessons        │  │  Vocabulary     │ │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘ │   │
│  │                                                                 │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │   │
│  │  │  Moderate       │  │  View           │  │  Manage         │ │   │
│  │  │  Community      │  │  Analytics      │  │  Settings       │ │   │
│  │  │  Posts          │  │  Dashboard      │  │                 │ │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘ │   │
│  │                                                                 │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │   │
│  │  │  View Audit     │  │  Manage         │  │  Export         │ │   │
│  │  │  Logs           │  │  Achievements   │  │  Reports        │ │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘ │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

Actors:
┌───────────────┐
│ Administrator │────────────────────────────────────────────────────────▶
│               │
└───────────────┘
```

---

## 4. Use Case Descriptions

### 4.1 UC001: Register

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC001 |
| **Name** | Register |
| **Actor** | Guest |
| **Description** | Create a new user account |
| **Precondition** | User is not logged in |
| **Main Flow** | 1. User taps "Sign Up"<br>2. User enters email, name, password<br>3. System validates input<br>4. System creates account<br>5. System sends verification email<br>6. User verifies email<br>7. Account is activated |
| **Alternative Flow** | 3a. Invalid input → Show error message |
| **Postcondition** | User account is created and verified |

### 4.2 UC002: Login

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC002 |
| **Name** | Login |
| **Actor** | Learner, Native Speaker, Administrator |
| **Description** | Authenticate and access the system |
| **Precondition** | User has an account |
| **Main Flow** | 1. User taps "Login"<br>2. User enters email and password<br>3. System validates credentials<br>4. System generates JWT token<br>5. User is redirected to dashboard |
| **Alternative Flow** | 3a. Invalid credentials → Show error message |
| **Postcondition** | User is authenticated and can access features |

### 4.3 UC003: Chat with AI Tutor

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC003 |
| **Name** | Chat with AI Tutor |
| **Actor** | Learner |
| **Description** | Have text conversation with SULTI AI |
| **Precondition** | User is logged in |
| **Main Flow** | 1. User navigates to Tutor screen<br>2. User types message<br>3. System sends to Groq LLaMA<br>4. AI generates response<br>5. System displays response<br>6. User earns XP |
| **Alternative Flow** | 3a. AI service unavailable → Show fallback message |
| **Postcondition** | Conversation is saved, XP is awarded |

### 4.4 UC004: Voice Chat with AI

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC004 |
| **Name** | Voice Chat with AI |
| **Actor** | Learner |
| **Description** | Have voice conversation with SULTI AI |
| **Precondition** | User is logged in, microphone permission granted |
| **Main Flow** | 1. User taps microphone button<br>2. User speaks<br>3. System records audio<br>4. System sends to Whisper API<br>5. Whisper transcribes audio<br>6. System sends to Groq LLaMA<br>7. AI generates response<br>8. System text-to-speech response<br>9. User earns XP |
| **Alternative Flow** | 4a. Audio quality poor → Prompt user to retry |
| **Postcondition** | Voice conversation is saved, XP is awarded |

### 4.5 UC005: Pronunciation Practice

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC005 |
| **Name** | Pronunciation Practice |
| **Actor** | Learner |
| **Description** | Practice pronunciation with AI feedback |
| **Precondition** | User is logged in |
| **Main Flow** | 1. User selects word/phrase to practice<br>2. System displays pronunciation guide<br>3. User records pronunciation<br>4. System analyzes pronunciation<br>5. System provides feedback and score<br>6. User earns XP |
| **Alternative Flow** | 4a. Pronunciation unclear → Ask user to retry |
| **Postcondition** | Pronunciation attempt is recorded |

### 4.6 UC006: Take Lessons

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC006 |
| **Name** | Take Lessons |
| **Actor** | Learner |
| **Description** | Complete structured learning lessons |
| **Precondition** | User is logged in |
| **Main Flow** | 1. User browses available lessons<br>2. User selects a lesson<br>3. System presents lesson content<br>4. User completes exercises<br>5. System evaluates answers<br>6. User earns XP and completes lesson |
| **Alternative Flow** | 4a. User skips exercise → Lesson not completed |
| **Postcondition** | Lesson progress is saved |

### 4.7 UC007: Use Flashcards

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC007 |
| **Name** | Use Flashcards |
| **Actor** | Learner |
| **Description** | Practice vocabulary with spaced repetition |
| **Precondition** | User is logged in |
| **Main Flow** | 1. User navigates to Flashcards<br>2. System presents due flashcards<br>3. User reviews card<br>4. User marks as known/unknown<br>5. System updates spaced repetition schedule<br>6. User earns XP |
| **Alternative Flow** | 3a. No due cards → Show "All caught up" message |
| **Postcondition** | Vocabulary mastery is updated |

### 4.8 UC008: View Progress

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC008 |
| **Name** | View Progress |
| **Actor** | Learner |
| **Description** | View learning analytics and statistics |
| **Precondition** | User is logged in |
| **Main Flow** | 1. User navigates to Profile/Dashboard<br>2. System displays progress overview<br>3. User views XP, streak, level<br>4. User views detailed analytics<br>5. User views achievement progress |
| **Postcondition** | User is informed of progress |

### 4.9 UC009: Community Posts

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC009 |
| **Name** | Community Posts |
| **Actor** | Learner, Native Speaker |
| **Description** | Create and interact with community posts |
| **Precondition** | User is logged in |
| **Main Flow** | 1. User navigates to Community<br>2. User browses posts<br>3. User creates new post<br>4. Other users can like/comment<br>5. Native speakers can verify |
| **Postcondition** | Post is created and visible |

### 4.10 UC010: Manage Users (Admin)

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC010 |
| **Name** | Manage Users |
| **Actor** | Administrator |
| **Description** | Administer user accounts |
| **Precondition** | Admin is logged in |
| **Main Flow** | 1. Admin navigates to Users page<br>2. Admin views user list<br>3. Admin can view/edit user details<br>4. Admin can verify native speakers<br>5. Admin can deactivate accounts |
| **Postcondition** | User management changes are saved |

---

## 5. Use Case Relationships

### 5.1 Include Relationships

| Use Case | Includes | Description |
|----------|----------|-------------|
| UC003: Chat with AI Tutor | UC002: Login | Must be logged in |
| UC004: Voice Chat | UC002: Login | Must be logged in |
| UC005: Pronunciation Practice | UC002: Login | Must be logged in |
| UC006: Take Lessons | UC002: Login | Must be logged in |
| UC007: Use Flashcards | UC002: Login | Must be logged in |
| UC008: View Progress | UC002: Login | Must be logged in |
| UC009: Community Posts | UC002: Login | Must be logged in |

### 5.2 Extend Relationships

| Use Case | Extends | Description |
|----------|---------|-------------|
| UC004: Voice Chat | UC003: Chat with AI Tutor | Voice version of chat |
| UC005: Pronunciation Practice | UC004: Voice Chat | Specialized voice feature |
| UC009: Community Posts | UC003: Chat with AI Tutor | Social extension |

### 5.3 Generalization Relationships

| Child Use Case | Parent Use Case | Description |
|----------------|-----------------|-------------|
| UC003: Chat with AI Tutor | AI Tutoring | General AI tutoring |
| UC004: Voice Chat | AI Tutoring | Voice-based tutoring |
| UC005: Pronunciation Practice | AI Tutoring | Pronunciation-focused |

---

## 6. Traceability Matrix

| Use Case | Requirement | Implementation |
|----------|-------------|----------------|
| UC001 | R001: User Registration | `LoginScreen.js`, `SignUpScreen.js` |
| UC002 | R002: User Authentication | `auth.controller.ts` |
| UC003 | R003: AI Chat | `SultiTutorScreen.js`, `chat.service.ts` |
| UC004 | R004: Voice Processing | `VoiceModeScreen.js`, `stt.service.ts` |
| UC005 | R005: Pronunciation | `PronunciationScreen.js`, `pronunciation.service.ts` |
| UC006 | R006: Lessons | `LearnScreen.js`, `lesson.service.ts` |
| UC007 | R007: Flashcards | `FlashcardsScreen.js`, `spacedRepetition.ts` |
| UC008 | R008: Progress Tracking | `ProfileScreen.js`, `game.service.ts` |
| UC009 | R009: Community | `CommunityScreen.js`, `community.service.ts` |
| UC010 | R010: Admin Management | Admin panel pages |

---

## 7. Conclusion

The Use Case Diagrams for SultiAI provide:

1. **Complete Coverage**: All system functionalities are documented
2. **Actor Clarity**: Clear distinction between user roles
3. **Relationship Mapping**: Include and extend relationships defined
4. **Traceability**: Link from use cases to requirements and code

These diagrams serve as a reference for understanding system functionality and guiding development efforts.

---

*Document Version: 1.0*
*Last Updated: August 2026*
*Author: SultiAI Development Team*
