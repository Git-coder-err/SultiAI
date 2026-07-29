import express from 'express';
import cors from 'cors';
import { connect, closeAll } from './db/connection';
import { connectMongo, closeMongo } from './db/mongodb/connection';
import { errorHandler } from './middleware/error';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import conversationRoutes, { historyRouter } from './routes/conversation.routes';
import tutorRoutes from './routes/tutor.routes';
import learningRoutes from './routes/learning.routes';
import communityRoutes from './routes/community.routes';
import notificationRoutes from './routes/notification.routes';
import speechRoutes from './routes/speech.routes';
import phraseRoutes from './routes/phrase.routes';
import feedbackRoutes from './routes/feedback.routes';
import gameRoutes from './routes/game.routes';
import achievementRoutes from './routes/achievement.routes';
import vocabularyRoutes from './routes/vocabulary.routes';
import challengeRoutes from './routes/challenge.routes';
import analyticsRoutes from './routes/analytics.routes';
import preservationRoutes from './routes/preservation.routes';
import arRoutes from './routes/ar.routes';
import { authMiddleware } from './middleware/auth';
import { isGroqConfigured, groqChat } from './utils/groq';
import { getUserIdByEmail } from './db/repositories/conversation.repo';

const PORT = parseInt(process.env.PORT || '3001', 10);

const app = express();

app.use(cors({ origin: '*', allowedHeaders: 'Content-Type,Authorization', methods: 'GET,POST,PUT,DELETE,OPTIONS' }));
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/history', historyRouter);
app.use('/api/tutor', tutorRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/speech', speechRoutes);
app.use('/api/saved-phrases', phraseRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/vocabulary', vocabularyRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/preservation', preservationRoutes);
app.use('/api/ar', arRoutes);

app.post('/api/assistant/chat', authMiddleware, async (req, res) => {
  try {
    const { message, language } = req.body || {};
    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }
    if (!isGroqConfigured()) {
      res.status(500).json({ error: 'Groq API key not configured' });
      return;
    }
    const reply = await groqChat([
      { role: 'system', content: `You are "Hoy!", an enthusiastic and patient AI Bisaya (Cebuano) language tutor!\n\nYour Mission:\n- Help users learn and practice SPEAKING Bisaya (Cebuano)\n- Make responses clear and easy to pronounce\n- Focus on practical, everyday phrases\n\nTeaching Style:\n- Friendly, conversational, and encouraging\n- Use emojis to make learning fun\n- Keep explanations simple\n\nYour Expertise:\n- Teach Bisaya/Cebuano to English speakers\n- Show formal vs everyday Bisaya (slang & casual)\n- Share cultural context and usage tips\n- Write Bisaya phrases in quotation marks like "Maayong buntag"\n- Give pronunciation guides in simple terms\n- Keep sentences short and speakable\n- Always include English translations\n\nMake sure all Bisaya phrases are easy to say out loud! Keep the tone warm and supportive.` },
      { role: 'user', content: message },
    ], { temperature: 0.9, maxTokens: 800 });
    res.json({ reply });
  } catch (err) {
    console.error('Assistant chat error:', err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

app.post('/api/groq', authMiddleware, async (req, res) => {
  try {
    const { messages, nativeLanguage } = req.body || {};
    if (!isGroqConfigured()) {
      res.status(500).json({ error: 'Groq API key not configured' });
      return;
    }
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages must be a non-empty array' });
      return;
    }
    const systemPrompt = `You are "Hoy!", an enthusiastic AI Bisaya language tutor. Your role:\n- Teach Bisaya (Cebuano) language to ${nativeLanguage || 'English'} speakers\n- Compare formal Bisaya vs everyday Bisaya slang\n- Provide cultural context and usage tips\n- Keep responses friendly, encouraging, and practical\n- Include example sentences with translations\n- When explaining pronunciation, use simple phonetics\n- Keep responses under 200 words unless asked for more detail\n- If asked about topics outside language learning, gently redirect to Bisaya learning\n\nStart each response with a brief, warm acknowledgment of the user's question.`;
    const reply = await groqChat([
      { role: 'system', content: systemPrompt },
      ...messages.map((m: any) => ({ role: m.type === 'user' ? 'user' as const : 'assistant' as const, content: m.text })),
    ], { temperature: 0.8, maxTokens: 600 });
    res.json({ content: reply });
  } catch (err) {
    console.error('Groq error:', err);
    res.status(500).json({ error: 'Groq API request failed' });
  }
});

app.use(errorHandler);

async function start() {
  try {
    connect();
    await connectMongo();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});

process.on('SIGTERM', async () => {
  await closeAll();
  await closeMongo();
  process.exit(0);
});

start();
