# System Architecture Document

## 1. Introduction

This document describes the system architecture of SultiAI, an AI-powered language learning application. The architecture is designed to be scalable, maintainable, and secure while supporting real-time AI interactions.

---

## 2. Architectural Overview

### 2.1 High-Level Architecture

SultiAI follows a **multi-tier client-server architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT TIER                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│  │   Mobile App     │  │     Web App      │  │   Admin Panel    │     │
│  │  (React Native)  │  │   (React/Next)   │  │   (Next.js)      │     │
│  │                  │  │                  │  │                  │     │
│  │  - Expo SDK 56   │  │  - React 18      │  │  - TypeScript    │     │
│  │  - TypeScript    │  │  - TypeScript    │  │  - Tailwind CSS  │     │
│  │  - React Nav     │  │  - TanStack Query│  │  - AG Grid       │     │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS/REST
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY TIER                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    Express.js Server                             │  │
│  │                                                                  │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │  │
│  │  │   Auth      │  │   Rate      │  │   CORS      │            │  │
│  │  │ Middleware  │  │   Limiter   │  │   Config    │            │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘            │  │
│  │                                                                  │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │  │
│  │  │   Logger    │  │   Validator │  │   Error     │            │  │
│  │  │  (Winston)  │  │   (Zod)     │  │   Handler   │            │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘            │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│   AI Services       │ │   Core Services     │ │   External APIs     │
├─────────────────────┤ ├─────────────────────┤ ├─────────────────────┤
│                     │ │                     │ │                     │
│  ┌───────────────┐  │ │  ┌───────────────┐  │ │  ┌───────────────┐  │
│  │  Chat Service │  │ │  │  User Service │  │ │  │  Groq API     │  │
│  │  (Groq LLaMA) │  │ │  │  (Auth/JWT)   │  │ │  │  (LLaMA 3.3)  │  │
│  └───────────────┘  │ │  └───────────────┘  │ │  └───────────────┘  │
│                     │ │                     │ │                     │
│  ┌───────────────┐  │ │  ┌───────────────┐  │ │  ┌───────────────┐  │
│  │  Speech       │  │ │  │  Game Service │  │ │  │  Whisper API  │  │
│  │  Service      │  │ │  │  (XP/Streak)  │  │ │  │  (STT)        │  │
│  │  (Whisper)    │  │ │  └───────────────┘  │ │  └───────────────┘  │
│  └───────────────┘  │ │                     │ │                     │
│                     │ │  ┌───────────────┐  │ │  ┌───────────────┐  │
│  ┌───────────────┐  │ │  │  Vocab Service│  │ │  │  ElevenLabs   │  │
│  │  TTS Service  │  │ │  │  (SM-2)       │  │ │  │  (TTS)        │  │
│  │  (MS Edge)    │  │ │  └───────────────┘  │ │  └───────────────┘  │
│  └───────────────┘  │ │                     │ │                     │
│                     │ │  ┌───────────────┐  │ │                     │
│  ┌───────────────┐  │ │  │  Community    │  │ │                     │
│  │  AI Context   │  │ │  │  Service      │  │ │                     │
│  │  Manager      │  │ │  └───────────────┘  │ │                     │
│  └───────────────┘  │ │                     │ │                     │
│                     │ │  ┌───────────────┐  │ │                     │
│  ┌───────────────┐  │ │  │  Analytics    │  │ │                     │
│  │  Adaptive     │  │ │  │  Service      │  │ │                     │
│  │  Engine       │  │ │  └───────────────┘  │ │                     │
│  └───────────────┘  │ │                     │ │                     │
│                     │ └─────────────────────┘ └─────────────────────┘
└─────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATA TIER                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│  │     SQLite       │  │    Supabase      │  │   Local Cache    │     │
│  │  (Development)   │  │  (Production)    │  │  (AsyncStorage)  │     │
│  │                  │  │                  │  │                  │     │
│  │  - Users         │  │  - PostgreSQL    │  │  - User Prefs    │     │
│  │  - Sessions      │  │  - Realtime      │  │  - Offline Data  │     │
│  │  - Messages      │  │  - Auth          │  │  - Cache         │     │
│  │  - Vocabulary    │  │  - Storage       │  │  - XP Data       │     │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Architecture Principles

| Principle | Description |
|-----------|-------------|
| **Separation of Concerns** | Each layer has distinct responsibilities |
| **Loose Coupling** | Components communicate via well-defined interfaces |
| **High Cohesion** | Related functionality is grouped together |
| **Scalability** | Horizontal scaling through microservices |
| **Security** | Defense in depth with multiple security layers |
| **Maintainability** | Clean code, documentation, and testing |

---

## 3. Component Architecture

### 3.1 Mobile Application (React Native)

```
src/
├── app/                    # App entry point
├── navigation/             # React Navigation setup
│   ├── AppNavigator.tsx
│   └── TabNavigator.tsx
├── screens/                # Screen components
│   ├── auth/               # Authentication screens
│   ├── main/               # Main tab screens
│   └── features/           # Feature screens
├── components/             # Reusable UI components
│   ├── atoms/              # Basic components (Button, Input)
│   ├── molecules/          # Compound components (Card, Header)
│   └── organisms/          # Complex components (VoiceChat)
├── context/                # React Context providers
│   ├── UserContext.tsx
│   └── GameContext.tsx
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts
│   ├── useVoiceChat.ts
│   └── useGame.ts
├── services/               # API and business logic
│   ├── api.ts
│   └── storage.ts
├── store/                  # Zustand stores
│   ├── useUserStore.ts
│   └── useGameStore.ts
├── types/                  # TypeScript types
│   ├── models.ts
│   └── api.ts
├── utils/                  # Utility functions
│   ├── haptics.ts
│   └── format.ts
└── theme/                  # Design system
    ├── colors.ts
    └── typography.ts
```

### 3.2 Backend Server (Node.js/Express)

```
server/src/
├── index.ts                # Entry point
├── config/                 # Configuration
│   ├── env.ts              # Environment variables
│   ├── constants.ts        # App constants
│   └── database.ts         # Database config
├── middleware/              # Express middleware
│   ├── auth.ts             # JWT authentication
│   ├── error.ts            # Error handling
│   ├── rateLimit.ts        # Rate limiting
│   ├── validate.ts         # Request validation
│   └── logging.ts          # Request logging
├── controllers/            # Route handlers
│   ├── auth.controller.ts
│   ├── tutor.controller.ts
│   ├── speech.controller.ts
│   └── game.controller.ts
├── services/               # Business logic
│   ├── ai/                 # AI services
│   │   ├── chat.service.ts
│   │   ├── contextManager.ts
│   │   └── pipeline.ts
│   ├── speech/             # Speech services
│   │   ├── stt.service.ts
│   │   ├── tts.service.ts
│   │   └── pronunciation.service.ts
│   ├── game/               # Gamification
│   │   ├── xp.service.ts
│   │   └── streak.service.ts
│   └── vocabulary/         # Vocabulary
│       └── spacedRepetition.ts
├── routes/                 # API routes
│   ├── auth.routes.ts
│   ├── tutor.routes.ts
│   ├── speech.routes.ts
│   └── game.routes.ts
├── db/                     # Database layer
│   ├── connection.ts
│   ├── schema-sqlite.ts
│   └── repositories/
│       ├── user.repository.ts
│       ├── session.repository.ts
│       └── vocabulary.repository.ts
├── types/                  # TypeScript types
│   ├── api.ts
│   ├── models.ts
│   └── index.ts
├── utils/                  # Utilities
│   ├── apiResponse.ts
│   ├── logger.ts
│   └── jwt.ts
└── validators/             # Request validators
    ├── auth.validator.ts
    └── tutor.validator.ts
```

---

## 4. Data Flow Architecture

### 4.1 Voice Conversation Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  User   │────▶│ Mobile  │────▶│  API    │────▶│  Groq   │
│  Voice  │     │  App    │     │ Gateway │     │  APIs   │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
     │               │               │               │
     │               │               │               │
     ▼               ▼               ▼               ▼
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Record  │     │ Send    │     │ Process │     │ STT/TTS │
│ Audio   │     │ Audio   │     │ Request │     │ + LLM   │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
                     │               │               │
                     │               │               │
                     ▼               ▼               ▼
                ┌─────────┐     ┌─────────┐     ┌─────────┐
                │Receive  │     │Return   │     │Generate │
                │Response │     │Response │     │Response │
                └─────────┘     └─────────┘     └─────────┘
```

### 4.2 Authentication Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  User   │────▶│ Mobile  │────▶│  API    │────▶│Database │
│  Login  │     │  App    │     │ Gateway │     │         │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
     │               │               │               │
     │               │               │               │
     ▼               ▼               ▼               ▼
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Enter   │     │ Send    │     │Validate │     │ Query   │
│Credentials│   │ Request │     │  User   │     │  User   │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
                     │               │               │
                     │               │               │
                     ▼               ▼               ▼
                ┌─────────┐     ┌─────────┐     ┌─────────┐
                │Receive  │     │ Generate│     │ Store   │
                │  JWT    │     │  JWT    │     │Session  │
                └─────────┘     └─────────┘     └─────────┘
```

### 4.3 XP and Gamification Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  User   │────▶│ Mobile  │────▶│  API    │────▶│Database │
│ Action  │     │  App    │     │ Gateway │     │         │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
     │               │               │               │
     │               │               │               │
     ▼               ▼               ▼               ▼
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Complete│     │ Calculate│    │ Update  │     │ Store   │
│Activity │     │   XP    │     │ Stats   │     │  XP     │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
                     │               │               │
                     │               │               │
                     ▼               ▼               ▼
                ┌─────────┐     ┌─────────┐     ┌─────────┐
                │Show XP  │     │ Check   │     │Update   │
                │  Toast  │     │Achieve- │     │ Leader- │
                │         │     │ ments   │     │ board   │
                └─────────┘     └─────────┘     └─────────┘
```

---

## 5. Security Architecture

### 5.1 Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Layer 1: Network Security                          │   │
│  │  - HTTPS/TLS encryption                            │   │
│  │  - CORS configuration                              │   │
│  │  - Rate limiting                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Layer 2: Authentication                           │   │
│  │  - JWT tokens                                      │   │
│  │  - Password hashing (bcrypt)                       │   │
│  │  - Token rotation                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Layer 3: Authorization                            │   │
│  │  - Role-based access control (RBAC)                │   │
│  │  - Resource-level permissions                      │   │
│  │  - API key management                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Layer 4: Data Protection                          │   │
│  │  - Input validation (Zod)                          │   │
│  │  - SQL injection prevention                        │   │
│  │  - XSS protection                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Layer 5: Monitoring & Logging                     │   │
│  │  - Request logging (Winston)                       │   │
│  │  - Error tracking                                  │   │
│  │  - Audit logs                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 JWT Token Structure

**Access Token:**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": 123,
    "email": "user@example.com",
    "role": "user",
    "iat": 1693123456,
    "exp": 1693124356
  }
}
```

**Refresh Token:**
```json
{
  "payload": {
    "userId": 123,
    "tokenVersion": 1,
    "iat": 1693123456,
    "exp": 1693728256
  }
}
```

---

## 6. Deployment Architecture

### 6.1 Development Environment

```
┌─────────────────────────────────────────────────────────┐
│                 Development Environment                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Expo Dev   │  │  Node.js    │  │  SQLite     │    │
│  │  Server     │  │  Server     │  │  Database   │    │
│  │  (Port 8081)│  │  (Port 3001)│  │  (Local)    │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Production Environment

```
┌─────────────────────────────────────────────────────────┐
│                  Production Environment                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Expo       │  │  Node.js    │  │  Supabase   │    │
│  │  Build      │  │  Server     │  │  (Cloud)    │    │
│  │  (App Store)│  │  (Docker)   │  │             │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│         │               │               │              │
│         └───────────────┼───────────────┘              │
│                         │                              │
│                         ▼                              │
│                ┌─────────────┐                         │
│                │  Groq APIs  │                         │
│                │  (External) │                         │
│                └─────────────┘                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 7. Performance Considerations

### 7.1 Caching Strategy

| Layer | Cache Type | Duration |
|-------|------------|----------|
| **Client** | AsyncStorage | Persistent |
| **API** | In-memory | 5 minutes |
| **Database** | Query cache | 1 hour |

### 7.2 Optimization Techniques

- **Code Splitting**: Lazy loading of screens
- **Image Optimization**: Compression and caching
- **API Caching**: TanStack Query for data caching
- **Database Indexing**: Optimized queries
- **Bundle Optimization**: Tree shaking and minification

---

## 8. Scalability Considerations

### 8.1 Horizontal Scaling

- **Load Balancing**: Multiple server instances
- **Database Replication**: Read replicas for queries
- **CDN**: Static asset delivery
- **Microservices**: Service decomposition

### 8.2 Vertical Scaling

- **Database Optimization**: Indexing and query optimization
- **Connection Pooling**: Efficient database connections
- **Memory Management**: Efficient data structures
- **CPU Optimization**: Async operations

---

## 9. Monitoring and Observability

### 9.1 Monitoring Stack

| Tool | Purpose |
|------|---------|
| **Winston** | Application logging |
| **Prometheus** | Metrics collection |
| **Grafana** | Dashboard visualization |
| **Sentry** | Error tracking |

### 9.2 Key Metrics

- **Response Time**: API endpoint latency
- **Throughput**: Requests per second
- **Error Rate**: 4xx and 5xx responses
- **CPU/Memory Usage**: Resource utilization
- **Database Performance**: Query execution time

---

## 10. Conclusion

The SultiAI system architecture provides:

1. **Scalability**: Multi-tier design supports growth
2. **Security**: Defense-in-depth approach
3. **Maintainability**: Clean separation of concerns
4. **Performance**: Optimized for real-time interactions
5. **Reliability**: Fault tolerance and monitoring

The architecture balances simplicity for current needs with flexibility for future enhancements, ensuring the system can evolve with changing requirements.

---

*Document Version: 1.0*
*Last Updated: August 2026*
*Author: SultiAI Development Team*
