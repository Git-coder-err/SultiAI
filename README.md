
# 📄 Updated README.md with Revised Full Tech Stack

Here's your complete README.md file with the **Revised Full Tech Stack** section added prominently:

---

# SultiAI

## AI Language Companion for Context-Aware Communication

SultiAI is a Capstone Project developed by BSIT students of Jose Maria College Foundation, Inc.

Unlike traditional translation applications that simply convert words from one language to another, SultiAI serves as an AI Language Companion that assists users in real-life conversations by understanding context and suggesting appropriate responses.

The project is designed to help non-native speakers communicate more naturally and confidently in everyday situations such as schools, workplaces, public transportation, restaurants, hospitals, and government offices.

---

## 📌 Table of Contents

- [Vision](#vision)
- [Core Principle](#core-principle)
- [Main Features](#main-features)
- [Revised Full Tech Stack](#revised-full-tech-stack)
- [📑 Manuscript Revision Checklist](#-manuscript-revision-checklist)
- [Development Status](#development-status)
- [Contributors](#contributors)
- [Adviser](#adviser)
- [License](#license)
- [Setup Guide](#setup-guide-for-other-devices--collaborators)

---

## 🎯 Vision

To bridge language barriers by providing context-aware AI communication assistance that empowers users to communicate naturally and confidently in real-world situations.

---

## 🧭 Core Principle

SultiAI does not aim to replace human conversation.

Instead, it empowers users by providing contextual guidance during conversations while helping them gradually learn and become more confident speakers.

---

## ⚡ Main Features

- Real-time Speech Recognition
- AI Response Suggestions
- Context-aware Conversation Assistance
- AI Avatar Companion
- Translation Support
- Phrase Recommendation
- Community Learning
- Personalized Language Assistance

---

## 🛠️ Revised Full Tech Stack

*Last Updated: August 2026*

### System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │   Web App    │  │ Mobile App   │  │ Admin Panel  │               │
│  │   (React)    │  │ (React Native)│  │  (React)    │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                                    │
│                   (Node.js + Express + TypeScript)                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      SERVICES LAYER                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │   Whisper    │  │    BERT      │  │ Translation │               │
│  │   Service    │  │   Service    │  │  Service    │               │
│  │   (Python)   │  │   (Python)   │  │  (Python)   │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                      │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │  PostgreSQL  │  │   Redis      │  │   S3/MinIO  │               │
│  │  (Primary)   │  │  (Cache)     │  │  (Storage)  │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1. 🖥️ Frontend (User-Facing Applications)

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Web App Framework | React | 18.2+ | Main user interface for desktop/browser |
| Mobile Framework | React Native | 0.72+ | Mobile app for iOS/Android |
| Shared Core | TypeScript | 5.0+ | Shared business logic & types (monorepo) |
| State Management | Zustand | 4.4+ | Simple state management across web/mobile |
| Data Fetching | TanStack Query | 4.0+ | Caching, loading states, pagination |
| Routing (Web) | React Router DOM | 6.18+ | Web navigation |
| Routing (Mobile) | React Navigation | 6.0+ | Native navigation |
| Styling (Web) | Tailwind CSS | 3.3+ | Utility-first CSS |
| Styling (Mobile) | NativeWind | 4.0+ | Tailwind for React Native |
| UI Components (Web) | Shadcn/UI | Latest | Accessible, customizable components |
| UI Components (Mobile) | React Native Paper | 5.0+ | Material Design components |
| Audio Recording (Web) | Web Audio API | Native | Browser audio capture |
| Audio Recording (Mobile) | react-native-audio-recorder-player | 3.5+ | Native audio recording |
| Build Tool | Vite | 4.5+ | Fast builds and HMR |
| Build Tool (Mobile) | Metro | 0.76+ | React Native bundler |
| Package Manager | pnpm | 8.0+ | Fast, disk-efficient monorepo support |

### 2. 🖥️ Admin Dashboard (Management Panel)

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | React | 18.2+ | Admin panel UI |
| Admin Builder | KratosJs | Latest | Generate CRUD admin panel from data models |
| UI Components | Shadcn/UI | Latest | Consistent with main app |
| Data Grid | AG Grid | 29.0+ | Advanced data tables |
| Forms | React Hook Form | 7.47+ | Form handling and validation |
| Charts | Recharts | 2.8+ | Analytics and visualizations |
| Authentication | Custom JWT + RBAC | - | Role-based access control |
| API Client | TanStack Query | 4.0+ | Consistent with main app |

### 3. 🖥️ Backend API (Node.js)

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Runtime | Node.js | 18+ (LTS) | Server-side JavaScript |
| Framework | Express.js | 4.18+ | REST API framework |
| Language | TypeScript | 5.0+ | Type safety |
| API Documentation | Swagger/OpenAPI | 3.0 | API documentation |
| Authentication | JWT | 9.0+ | User authentication |
| Authorization | Custom RBAC | - | Role-based access control |
| Validation | Zod | 3.22+ | Schema validation |
| Rate Limiting | express-rate-limit | 6.0+ | Prevent abuse |
| Security | Helmet | 7.0+ | Security headers |
| Logging | Winston | 3.11+ | Structured logging |
| Monitoring | Prometheus + Grafana | - | Metrics and monitoring |
| Queue System | BullMQ | 4.0+ | Background job processing |
| Process Manager | PM2 | 5.3+ | Production process management |

### 4. 🧠 AI Services (Python Microservice)

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | FastAPI | 0.104+ | Modern Python API with automatic OpenAPI docs |
| Speech Recognition | OpenAI Whisper | Latest | Convert speech to text |
| NLP/Intent Classification | BERT (Hugging Face) | Latest | Context understanding |
| Translation | Google Cloud Translation API | Latest | Multi-language translation |
| Model Serving | PyTorch | 2.0+ | Deep learning framework |
| Container | Docker | Latest | Isolated deployment |
| Audio Processing | librosa | 0.10+ | Audio feature extraction |
| Environment | Conda | Latest | Python dependency management |

### 5. 🗄️ Database & Storage

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Primary Database | PostgreSQL | 15.0+ | Main relational database |
| ORM/Query Builder | Prisma | 5.0+ | Type-safe database access |
| Migration Tool | Prisma Migrate | 5.0+ | Schema migrations |
| Cache | Redis | 7.0+ | Caching and message queue |
| File Storage | MinIO | Latest | Self-hosted S3-compatible storage |
| Alternative | AWS S3 | - | Cloud storage |
| Database Backup | pg_dump + Cron | - | Automated backups |

### 6. 🧪 Development & Deployment

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Version Control | Git | Latest | Source control |
| Repository | GitHub | - | Code hosting |
| Monorepo | pnpm Workspaces | 8.0+ | Multi-package management |
| CI/CD | GitHub Actions | - | Automated builds and deployments |
| Containerization | Docker | Latest | Containerized services |
| Orchestration | Docker Compose | Latest | Multi-container orchestration |
| Cloud Hosting | AWS / DigitalOcean / Render | - | Hosting platform |
| SSL/HTTPS | Let's Encrypt + Certbot | - | Free SSL certificates |
| Error Tracking | Sentry | Latest | Error monitoring |
| Log Management | ELK Stack (Elasticsearch, Logstash, Kibana) | 8.0+ | Log aggregation |

---

### 📁 Monorepo Structure

```
sultiai/
├── packages/
│   ├── shared/               # Shared TypeScript code
│   │   ├── src/
│   │   │   ├── types/        # Shared types and interfaces
│   │   │   ├── validators/   # Zod schemas (shared with frontend)
│   │   │   ├── constants/    # Shared constants
│   │   │   └── utils/        # Shared utilities
│   │   └── package.json
│   │
│   ├── web/                  # React Web App
│   │   ├── src/
│   │   │   ├── components/   # UI components
│   │   │   ├── pages/        # Page components
│   │   │   ├── hooks/        # Custom React hooks
│   │   │   ├── contexts/     # React contexts
│   │   │   └── App.tsx
│   │   ├── index.html
│   │   ├── tailwind.config.js
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   ├── mobile/               # React Native App
│   │   ├── src/
│   │   │   ├── screens/      # Screen components
│   │   │   ├── components/   # Mobile UI components
│   │   │   ├── navigation/   # React Navigation config
│   │   │   └── App.tsx
│   │   ├── ios/
│   │   ├── android/
│   │   ├── metro.config.js
│   │   └── package.json
│   │
│   └── admin/                # Admin Dashboard
│       ├── src/
│       │   ├── components/   # Admin components
│       │   ├── pages/        # Admin pages (using KratosJs)
│       │   ├── layouts/      # Layout components
│       │   └── App.tsx
│       ├── tailwind.config.js
│       ├── vite.config.ts
│       └── package.json
│
├── backend/                  # Node.js API Server
│   ├── src/
│   │   ├── config/          # Configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── services/        # Business logic
│   │   ├── routes/          # Express routes
│   │   ├── middlewares/     # Express middlewares
│   │   ├── models/          # Prisma models
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utilities
│   │   └── server.ts        # Entry point
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── dockerfile
│   └── package.json
│
├── ai-service/              # Python AI Service
│   ├── src/
│   │   ├── whisper/        # Whisper speech recognition
│   │   ├── bert/           # BERT intent classification
│   │   ├── translate/      # Google Translate wrapper
│   │   └── main.py         # FastAPI entry point
│   ├── models/             # Pre-trained models
│   ├── data/               # Phrase repository
│   ├── requirements.txt
│   └── dockerfile
│
├── docker-compose.yml       # Multi-container setup
├── .env.example             # Environment variables
├── package.json             # Root package.json (pnpm workspaces)
└── README.md
```

---

### 🔑 Key Benefits of This Tech Stack

1. **Full Ownership** - You control everything; no vendor lock-in
2. **Custom Admin Dashboard** - Built with KratosJs/Admiral, fully tailored to SultiAI
3. **Type Safety** - TypeScript + Prisma + Zod from database to frontend
4. **Shared Code** - Business logic shared between web, mobile, and admin
5. **Scalability** - PostgreSQL, Redis, and microservices architecture
6. **Observability** - Full logging, metrics, and error tracking
7. **Cost Control** - Self-hosted MinIO and PostgreSQL; only pay for compute
8. **Academic Alignment** - Meets the manuscript's requirement for a "fully developed system"

---

## 📊 Comparison: Original vs Revised Tech Stack

| Category | Original (Manuscript) | Revised (Final) |
|----------|----------------------|-----------------|
| **Web Frontend** | React 18 | React 18 (keep) |
| **Mobile** | Not specified | React Native + Shared Core |
| **State Management** | Redux Toolkit | Zustand (simpler) |
| **Data Fetching** | Axios | TanStack Query (caching + state) |
| **Admin Dashboard** | None / Firebase Console | Custom React + KratosJs |
| **Backend** | Node.js + Express | Node.js + Express + TypeScript |
| **Database** | Firebase Firestore | PostgreSQL + Prisma |
| **Cache/Queue** | Firebase | Redis + BullMQ |
| **File Storage** | Firebase Storage | MinIO / AWS S3 |
| **Auth** | Firebase Auth | Custom JWT + RBAC |
| **API Validation** | Manual | Zod (shared schemas) |
| **AI Services** | Python scripts (spawn) | FastAPI microservice + Docker |
| **Logging/Monitoring** | None | Winston + Prometheus + Grafana |
| **Deployment** | Render/Manual | Docker Compose + GitHub Actions |
| **Package Manager** | npm | pnpm (monorepo) |

---

## 📑 Manuscript Revision Checklist

*Clicking this tab takes you to the specific list of chapters that must be updated in your Capstone Manuscript to match the new Tech Stack.*

Here is the breakdown of exactly where you need to update your manuscript and what to write in those sections to align with your revised stack.

---

### 📖 Chapter 2: Review of Related Literature and Studies (RRLS)
**What to revise:** You need to update your literature to support *why* you chose these specific technologies over the older ones (like Firebase).
*   **Add literature on:** 
    *   **Monorepo architectures (pnpm workspaces)** and shared TypeScript code benefits.
    *   **Zustand vs. Redux** (state management efficiency).
    *   **PostgreSQL + Prisma vs. NoSQL/Firebase** (why relational databases are better for your conversational data).
    *   **TanStack Query** for efficient data fetching and caching.
    *   **Whisper and BERT** (Hugging Face) for real-time speech-to-text and intent classification.

### 📖 Chapter 3: Technical Background / System Architecture
**What to revise:** This is the most critical chapter. You must replace your old architectural diagrams with the new ones.
*   **The Diagram:** Remove the old Firebase/Firestore flowchart. Replace it with the **Architecture Diagram** I provided in the README (The `Client Layer` -> `API Gateway` -> `Services Layer` -> `Data Layer` flowchart).
*   **The Text:** Describe how the data flows:
    1.  *Web/Mobile* sends audio -> *API Gateway (Node.js)*.
    2.  Gateway routes to *AI Service (Python)*.
    3.  Python uses *Whisper* for speech and *BERT* for context.
    4.  Data is stored in *PostgreSQL*; fast sessions are cached in *Redis*.
    5.  Media files are stored in *MinIO*.

### 📖 Chapter 3: Methodology / System Development
**What to revise:** You need to update your "Development Tools" and "Software Requirements" tables. 
*   **Create a new table** that includes:
    *   **Frontend:** React 18, React Native, Zustand, TanStack Query.
    *   **Backend:** Node.js (LTS), Express, TypeScript, Prisma.
    *   **AI/ML:** Python, FastAPI, Whisper, PyTorch.
    *   **Database:** PostgreSQL, Redis.
    *   **DevOps:** Docker, GitHub Actions, MinIO.
    *   *Note: State that you are using **pnpm** for monorepo management.*

### 📖 Chapter 4: System Design and Architecture
**What to revise:** You need to update your **Database Design** and **API Design** sections.
*   **Database Design:** Remove the Firebase JSON structure. Create a **Relational Database Schema (ERD)** for PostgreSQL. Include tables for:
    *   `Users`, `ConversationSessions`, `Messages`, `UserPreferences`, `PhraseRecommendations`.
*   **API Design:** Update your API endpoints to match the Node.js + Express structure (e.g., `POST /api/v1/speech/transcribe`, `GET /api/v1/conversations/:id`).

### 📖 Chapter 5: Implementation, Testing, and Deployment
**What to revise:** The deployment strategy. You wrote "Render/Manual" in your original stack. That needs to change.
*   **Update to:** "The system will be containerized using **Docker** and orchestrated using **Docker Compose**. Continuous Integration and Continuous Deployment (CI/CD) will be automated via **GitHub Actions**."
*   **Testing:** Add that you will use Postman to test the API and Jest for unit testing.

### 📖 Chapter 8: Conclusion and Recommendations (or similar final chapter)
**What to revise:** Your **"Future Recommendations"** section.
*   **Add a recommendation:** *"Future researchers could explore deploying the AI services to cloud GPU instances to reduce latency."*
*   **Add recommendation:** *"Expand the system by adding a user-admin role using the custom RBAC (Role-Based Access Control)."*

---

### 💡 Important Academic Tip for the Manuscript:

When you write your manuscript, **do not** put the extensive tables (like "Frontend Framework: React 18.2+") directly in the main body of your thesis. 

**How to format it instead:**
1. Place the **complete, detailed tables** in your **Appendices** (Appendix A: Full Technical Stack Specification).
2. In the **Main Body (Chapter 3)**, write a summary paragraph like this: 
   > *"The SultiAI system utilizes a modern, multi-tier architecture. The frontend is built using **React (Web)** and **React Native (Mobile)** with **Zustand** for state management. The backend is powered by **Node.js** and **Express**, while the AI services are handled by a **Python FastAPI** microservice utilizing **OpenAI Whisper** and **BERT**. Data persistence is managed by **PostgreSQL** with **Redis** caching. For a complete breakdown of versions and tools, refer to Appendix A."*

This shows your professor that you thoroughly planned the stack without cluttering the actual paper with massive technical lists.

---

## 📈 Development Status

**Current Phase:** Capstone 1

Currently under research, planning, UI design, and system architecture.

**Next Phases:**
- Capstone 2: Development and Implementation
- Capstone 3: Testing and Deployment

---

## 👥 Contributors

**Team 5**

- Kevin Albert Nisperos
- Genesis Diaz
- Jevan Adam Mulato

---

## 👨‍🏫 Adviser

Ryan N. Billera, LPT

---

## 📄 License

MIT License

Copyright (c) 2026 Team 5 - SultiAI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 🔧 Setup Guide for Other Devices / Collaborators

This section provides instructions for collaborators and other devices to set up and configure the SultiAI application to work with a shared backend server.

### 1. Set Up the `server/.env` File with Your GROQ_API_KEY

Create a `.env` file in the server directory (if it doesn't already exist) and add your GROQ API key:

```bash
echo "GROQ_API_KEY=your_groq_api_key_here" > server/.env
```

### 2. Point the App to the Backend IP Address

When running on physical devices or other local setups, you'll need to configure the app to connect to your backend server.

#### For Expo Development Build

Set the `EXPO_PUBLIC_API_URL` environment variable in your Expo development build configuration:

**Android:**
```bash
EXPO_PUBLIC_API_URL=http://YOUR_DEVICE_IP:3001 npx expo run:android
```

**iOS:**
```bash
EXPO_PUBLIC_API_URL=http://YOUR_DEVICE_IP:3001 npx expo run:ios
```

Replace `YOUR_DEVICE_IP` with the actual IP address of the machine running the backend server.

#### For Physical Devices Testing

For physical devices testing, you'll need to use the actual IP address of the machine running the backend:

1. Build and install the app on your physical device
2. Set `EXPO_PUBLIC_API_URL` to `http://YOUR_BACKEND_IP:3001`
3. Ensure your backend server is running on port 3001 and accessible from the physical device

#### For Emulator/Simulator

For emulator/simulator, you can typically use the default localhost (`http://localhost:3001` or `http://10.0.2.2:3001` for Android Emulator), but you may need to override this if your backend is running on a different machine.

### Common Setup Scenarios

#### Scenario 1: Backend on Same Machine
- Backend: `http://localhost:3001` (or `http://10.0.2.2:3001` for Android Emulator)
- App should use: `EXPO_PUBLIC_API_URL=http://localhost:3001` (or `http://10.0.2.2:3001`)

#### Scenario 2: Backend on Different Machine
- Backend: `http://192.168.1.100:3001` (replace with your machine's IP)
- App should use: `EXPO_PUBLIC_API_URL=http://192.168.1.100:3001`

### Troubleshooting

- **Connection Failed**: Ensure your backend server is running and accessible from the device
- **Wrong IP**: Use `ipconfig` (Windows) or `ifconfig` (macOS/Linux) to find your machine's IP address
- **Port Issues**: Verify the backend is listening on port 3001
- **Firewall**: Ensure firewall rules allow traffic on port 3001
- **Database Connection**: Ensure PostgreSQL is running and accessible
- **Redis Connection**: Ensure Redis is running for caching and queue jobs

---

## 📞 Contact

For questions or contributions, please reach out to the development team.

---

*Last Updated: August 2026*

---

## ✅ Summary of Changes Made to README.md

1. **Added Table of Contents** - For easy navigation
2. **Added "Revised Full Tech Stack" Section** - Complete with:
   - System Architecture Diagram
   - 6 Comprehensive Technology Tables
   - Monorepo Structure
   - Key Benefits
   - Original vs Revised Comparison Table
3. **Reorganized Sections** - Better flow and readability
4. **Enhanced License Section** - Full MIT license text
5. **Improved Setup Guide** - More detailed and organized
6. **Added Development Status** - Clear phase indication
7. **Added Contact Section** - For collaboration inquiries
8. **Added "Manuscript Revision Checklist" Section** - This provides a detailed, chapter-by-chapter breakdown of what needs to be changed in the academic paper to align with the new stack.
```
