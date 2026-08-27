# Development Tools & Software Versions Document

## 1. Introduction

This document documents all development tools, software versions, and dependencies used in the SultiAI project.

---

## 2. Development Environment

### 2.1 Operating System

| Component | Version | Notes |
|-----------|---------|-------|
| **Windows** | 11 | Primary development OS |
| **macOS** | 14+ | iOS development (optional) |
| **Linux** | Ubuntu 22.04+ | Server deployment (optional) |

### 2.2 Code Editor / IDE

| Tool | Version | Usage |
|------|---------|-------|
| **Visual Studio Code** | Latest | Primary code editor |
| **Extensions** | - | See VS Code Extensions section |

### 2.3 VS Code Extensions

| Extension | Purpose |
|-----------|---------|
| ESLint | Code linting |
| Prettier | Code formatting |
| TypeScript Hero | TypeScript utilities |
| React Native Tools | React Native debugging |
| GitLens | Git integration |
| Thunder Client | API testing |

---

## 3. Frontend Development

### 3.1 Mobile Application (React Native)

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Native** | 0.85.3 | Mobile framework |
| **Expo SDK** | 56.0.18 | React Native toolchain |
| **React** | 19.2.3 | UI library |
| **TypeScript** | 6.0.3 | Type safety |

#### React Native Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `@react-navigation/native` | 7.3.3 | Navigation |
| `@react-navigation/bottom-tabs` | 7.18.2 | Tab navigation |
| `@react-navigation/native-stack` | 7.17.5 | Stack navigation |
| `react-native-gesture-handler` | 2.31.1 | Gesture handling |
| `react-native-reanimated` | 4.3.1 | Animations |
| `react-native-safe-area-context` | 5.7.0 | Safe area |
| `react-native-screens` | 4.26.0 | Screen management |
| `react-native-svg` | 15.15.4 | SVG rendering |

#### Expo Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `expo` | 56.0.18 | Core Expo |
| `expo-audio` | 56.0.13 | Audio playback |
| `expo-camera` | 56.0.8 | Camera access |
| `expo-contacts` | 56.0.12 | Contacts access |
| `expo-crypto` | 56.0.4 | Cryptography |
| `expo-file-system` | 56.0.5 | File system |
| `expo-haptics` | 56.0.3 | Haptic feedback |
| `expo-linear-gradient` | 56.0.4 | Gradients |
| `expo-secure-store` | 56.0.4 | Secure storage |
| `expo-speech` | 56.0.3 | Text-to-speech |
| `expo-status-bar` | 56.0.4 | Status bar |

### 3.2 Web Application

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2+ | UI library |
| **Next.js** | Latest | React framework |
| **TypeScript** | 5.0+ | Type safety |
| **Tailwind CSS** | 3.3+ | Styling |

### 3.3 Admin Dashboard

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | Latest | React framework |
| **TypeScript** | 5.0+ | Type safety |
| **Tailwind CSS** | 3.3+ | Styling |
| **AG Grid** | 29.0+ | Data grids |
| **Recharts** | 2.8+ | Charts |

---

## 4. Backend Development

### 4.1 Server (Node.js)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ LTS | Runtime |
| **Express** | 5.2.1 | Web framework |
| **TypeScript** | 7.0.2 | Type safety |

#### Server Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `express` | 5.2.1 | HTTP server |
| `cors` | 2.8.6 | CORS support |
| `dotenv` | 17.4.2 | Environment variables |
| `jsonwebtoken` | 9.0.3 | JWT authentication |
| `better-sqlite3` | 13.0.2 | SQLite database |
| `drizzle-orm` | 0.45.2 | ORM |
| `@supabase/supabase-js` | 2.112.4 | Supabase client |
| `mongoose` | 9.8.1 | MongoDB (optional) |
| `pg` | 8.22.0 | PostgreSQL |
| `mysql2` | 3.23.2 | MySQL |
| `sharp` | 0.35.3 | Image processing |
| `msedge-tts` | 2.0.7 | Text-to-speech |

#### Server Dev Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | 7.0.2 | TypeScript compiler |
| `tsx` | 4.23.1 | TypeScript execution |
| `jest` | 29.7.0 | Testing framework |
| `supertest` | 7.2.2 | HTTP testing |
| `@types/express` | 5.0.6 | Express types |
| `@types/cors` | 2.8.19 | CORS types |
| `@types/better-sqlite3` | 7.6.13 | SQLite types |
| `@types/jest` | 29.5.14 | Jest types |
| `@types/node` | 26.1.2 | Node types |
| `@types/pg` | 8.20.0 | PostgreSQL types |
| `drizzle-kit` | 0.31.10 | Drizzle CLI |

### 4.2 Database

| Database | Version | Purpose |
|----------|---------|---------|
| **SQLite** | 3.x | Development database |
| **Supabase** | Latest | Production cloud database |
| **PostgreSQL** | 15.0+ | Production database |

### 4.3 AI Services

| Service | Technology | Purpose |
|---------|------------|---------|
| **Chat AI** | Groq LLaMA 3.3-70B | Conversational AI |
| **Speech-to-Text** | Groq Whisper | Audio transcription |
| **Text-to-Speech** | MS Edge TTS | Voice synthesis |
| **ONNX Runtime** | 1.27.0 | Local model inference |

---

## 5. Development Tools

### 5.1 Version Control

| Tool | Version | Purpose |
|------|---------|---------|
| **Git** | Latest | Version control |
| **GitHub** | - | Remote repository |

### 5.2 Package Managers

| Tool | Version | Purpose |
|------|---------|---------|
| **npm** | Latest | Package management |
| **npx** | Latest | Package execution |

### 5.3 Build Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **Metro** | 0.76+ | React Native bundler |
| **Babel** | Latest | JavaScript compiler |
| **ESLint** | 9.39.5 | Code linting |
| **Prettier** | Latest | Code formatting |

### 5.4 Testing Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **Jest** | 29.7.0 | Unit testing |
| **Supertest** | 7.2.2 | API testing |
| **Detox** | Latest | E2E testing (mobile) |

### 5.5 API Development

| Tool | Purpose |
|------|---------|
| **Postman** | API testing and documentation |
| **Thunder Client** | VS Code API client |

---

## 6. Deployment & DevOps

### 6.1 Build & Deployment

| Tool | Purpose |
|------|---------|
| **EAS Build** | Expo Application Services |
| **GitHub Actions** | CI/CD automation |
| **Docker** | Containerization (optional) |

### 6.2 Hosting

| Service | Purpose |
|---------|---------|
| **Vercel** | Web app hosting |
| **Expo** | Mobile app builds |
| **Supabase** | Database hosting |

### 6.3 Monitoring

| Tool | Purpose |
|------|---------|
| **Sentry** | Error tracking |
| **Expo Analytics** | App analytics |

---

## 7. Environment Configuration

### 7.1 Environment Variables

```bash
# API Keys
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key
EXPO_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_key

# Server
PORT=3001
JWT_SECRET=your_jwt_secret
NODE_ENV=development

# Database
DATABASE_URL=file:./sultiai.db
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

### 7.2 Configuration Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript configuration |
| `babel.config.js` | Babel configuration |
| `metro.config.js` | Metro bundler configuration |
| `eslint.config.js` | ESLint configuration |
| `app.json` | Expo app configuration |
| `drizzle.config.ts` | Drizzle ORM configuration |

---

## 8. Version Summary Table

### 8.1 Core Technologies

| Technology | Version | Category |
|------------|---------|----------|
| React Native | 0.85.3 | Mobile |
| React | 19.2.3 | UI |
| Expo SDK | 56.0.18 | Mobile |
| Node.js | 18+ | Backend |
| Express | 5.2.1 | Backend |
| TypeScript | 6.0.3/7.0.2 | Language |
| SQLite | 3.x | Database |
| PostgreSQL | 15.0+ | Database |

### 8.2 AI & ML

| Technology | Version | Purpose |
|------------|---------|---------|
| Groq SDK | Latest | AI API |
| Whisper | Latest | Speech-to-text |
| ONNX Runtime | 1.27.0 | Local inference |
| Xenova Transformers | 2.17.2 | ML models |

### 8.3 Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| Git | Latest | Version control |
| ESLint | 9.39.5 | Linting |
| Jest | 29.7.0 | Testing |
| Metro | 0.76+ | Bundling |
| Babel | Latest | Compilation |

---

## 9. System Requirements

### 9.1 Development Machine

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **OS** | Windows 10/macOS 12 | Windows 11/macOS 14 |
| **RAM** | 8GB | 16GB+ |
| **Storage** | 20GB free | 50GB+ free |
| **CPU** | 4 cores | 8+ cores |
| **Internet** | Broadband | High-speed |

### 9.2 Mobile Testing

| Component | Requirement |
|-----------|-------------|
| **Android** | Android 10+ (API 29+) |
| **iOS** | iOS 14+ |
| **Device** | Physical device recommended |

---

## 10. Installation Instructions

### 10.1 Prerequisites

```bash
# Install Node.js (via nvm)
nvm install 18
nvm use 18

# Install Expo CLI
npm install -g expo-cli eas-cli

# Install dependencies
npm install
cd server && npm install
cd ../admin && npm install
cd ../web && npm install
```

### 10.2 Environment Setup

```bash
# Copy environment files
cp server/.env.example server/.env

# Edit .env with your API keys
# Start development
npm run dev
```

---

## 11. Conclusion

The SultiAI project uses a comprehensive modern tech stack:

1. **Frontend**: React Native (Expo) + React (Next.js)
2. **Backend**: Node.js + Express + TypeScript
3. **Database**: SQLite (dev) + Supabase (prod)
4. **AI**: Groq LLaMA + Whisper + ONNX Runtime
5. **DevOps**: GitHub Actions + EAS Build

All versions are documented and pinned for reproducibility.

---

*Document Version: 1.0*
*Last Updated: August 2026*
*Author: SultiAI Development Team*
