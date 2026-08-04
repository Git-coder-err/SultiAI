# SultiAI

## AI Language Companion for Context-Aware Communication

SultiAI is a Capstone Project developed by BSIT students of Jose Maria College Foundation, Inc.

Unlike traditional translation applications that simply convert words from one language to another, SultiAI serves as an AI Language Companion that assists users in real-life conversations by understanding context and suggesting appropriate responses.

The project is designed to help non-native speakers communicate more naturally and confidently in everyday situations such as schools, workplaces, public transportation, restaurants, hospitals, and government offices.

---

# Vision

To bridge language barriers by providing context-aware AI communication assistance that empowers users to communicate naturally and confidently in real-world situations.

---

# Core Principle

SultiAI does not aim to replace human conversation.

Instead, it empowers users by providing contextual guidance during conversations while helping them gradually learn and become more confident speakers.

---

# Main Features

- Real-time Speech Recognition
- AI Response Suggestions
- Context-aware Conversation Assistance
- AI Avatar Companion
- Translation Support
- Phrase Recommendation
- Community Learning
- Personalized Language Assistance

---

# Technologies

- Whisper Speech Recognition
- BERT-based NLP
- React Native
- Node.js
- Express.js
- MongoDB / Firebase (To be finalized)

---

# Development Status

Current Phase:

Capstone 1

Currently under research, planning, UI design, and system architecture.

---

# Contributors

Team 5

- Kevin Albert Nisperos
- Genesis Diaz
- Jevan Adam Mulato

---

# Adviser

Ryan N. Billera, LPT

---

# License

MIT License

---

# Setup Guide for Other Devices / Collaborators

This section provides instructions for collaborators and other devices to set up and configure the SultiAI application to work with a shared backend server.

## 1. Set Up the `server/.env` File with Your GROQ_API_KEY

Create a `.env` file in the server directory (if it doesn't already exist) and add your GROQ API key:

```bash
echo "GROQ_API_KEY=your_groq_api_key_here" > server/.env
```

## 2. Point the App to the Backend IP Address

When running on physical devices or other local setups, you'll need to configure the app to connect to your backend server.

### For Expo Development Build

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

### For Physical Devices Testing

For physical devices testing, you'll need to use the actual IP address of the machine running the backend:

1. Build and install the app on your physical device
2. Set `EXPO_PUBLIC_API_URL` to `http://YOUR_BACKEND_IP:3001`
3. Ensure your backend server is running on port 3001 and accessible from the physical device

### For Emulator/Simulator

For emulator/simulator, you can typically use the default localhost (10.0.2.2 for Android Emulator, localhost for iOS Simulator), but you may need to override this if your backend is running on a different machine.

## Common Setup Scenarios

### Scenario 1: Backend on Same Machine
- Backend: `http://localhost:3001` (or `http://10.0.2.2:3001` for Android Emulator)
- App should use: `EXPO_PUBLIC_API_URL=http://localhost:3001` (or `http://10.0.2.2:3001`)

### Scenario 2: Backend on Different Machine
- Backend: `http://192.168.1.100:3001` (replace with your machine's IP)
- App should use: `EXPO_PUBLIC_API_URL=http://192.168.1.100:3001`

## Troubleshooting

- **Connection Failed**: Ensure your backend server is running and accessible from the device
- **Wrong IP**: Use `ipconfig` (Windows) or `ifconfig` (macOS/Linux) to find your machine's IP address
- **Port Issues**: Verify the backend is listening on port 3001
- **Firewall**: Ensure firewall rules allow traffic on port 3001
