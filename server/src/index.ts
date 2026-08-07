import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { connect, closeAll } from './db/connection';
import { connectMongo, closeMongo } from './db/mongodb/connection';
import { errorHandler, notFoundHandler } from './middleware/error';
import { isGroqConfigured } from './utils/groq';
import { isLocalLLMReady, ensureLocalLLM, getLocalLLMError } from './services/localLLM';
import { isLocalSTTReady, ensureLocalSTT, getLocalSTTError } from './services/sttService';
import { env, validateEnv } from './config';
import { setSecurityHeaders, configureCors } from './middleware/security';
import { globalRateLimit } from './middleware/rateLimit';
import { requestLogger } from './middleware/logging';
import logger from './utils/logger';

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
import whisperRoutes from './routes/whisper.routes';
import agentRoutes from './routes/agent.routes';
import vocabularyIntelligenceRoutes from './routes/vocabulary.routes';
import pronunciationIntelligenceRoutes from './routes/pronunciation.routes';
import recommendationRoutes from './routes/recommendation.routes';
import notificationPreferencesRoutes from './routes/notificationPreferences.routes';
import { authMiddleware } from './middleware/auth';
import { buildSultiPrompt, buildCharacterPrompt } from './utils/prompts';
import { success, errors } from './utils/apiResponse';

const app = express();

app.use(cors({ origin: configureCors, allowedHeaders: ['Content-Type', 'Authorization'], methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));
app.use(express.json({ limit: env.MAX_REQUEST_SIZE }));
app.use(setSecurityHeaders);
app.use(requestLogger);
app.use(globalRateLimit);

app.use('/audio/tts', express.static(path.join(process.cwd(), env.AUDIO_CACHE_DIR)));

app.get('/api/health', (_req, res) => {
  success(res, {
    status: 'ok',
    groq: isGroqConfigured() ? 'configured' : 'not_set',
    localLLM: isLocalLLMReady() ? 'ready' : 'initializing',
    localLLMError: getLocalLLMError(),
    localSTT: isLocalSTTReady() ? 'ready' : 'initializing',
    localSTTError: getLocalSTTError(),
    mode: isGroqConfigured() ? 'api' : (isLocalLLMReady() ? 'local' : 'none'),
  });
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
app.use('/api/whisper', whisperRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/v2/vocabulary', vocabularyIntelligenceRoutes);
app.use('/api/v2/pronunciation', pronunciationIntelligenceRoutes);
app.use('/api/v2/recommendations', recommendationRoutes);
app.use('/api/v2/notifications/preferences', notificationPreferencesRoutes);

app.post('/api/assistant/chat', authMiddleware, async (req, res) => {
  try {
    const { message, character } = req.body || {};
    if (!message) {
      errors.validation(res, 'Message is required');
      return;
    }
    const { isConfigured, groqChat } = await import('./utils/groq');
    if (!isConfigured()) {
      errors.aiError(res, 'AI service not configured: set GROQ_API_KEY or enable local LLM model');
      return;
    }
    const systemPrompt = character
      ? buildCharacterPrompt(character, `The learner's native language is English.`)
      : buildSultiPrompt('chat', `The learner's native language is English.`);
    const reply = await groqChat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ], { temperature: 0.9, maxTokens: 800 });
    success(res, { reply }, 'Chat response generated');
  } catch (err) {
    logger.error('Assistant chat error', { error: (err as Error).message });
    errors.internal(res, 'AI request failed');
  }
});

app.post('/api/groq', authMiddleware, async (req, res) => {
  try {
    const { messages, nativeLanguage } = req.body || {};
    const { isConfigured, groqChat } = await import('./utils/groq');
    if (!isConfigured()) {
      errors.aiError(res, 'AI service not configured: set GROQ_API_KEY or enable local LLM model');
      return;
    }
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      errors.validation(res, 'Messages must be a non-empty array');
      return;
    }
    const systemPrompt = buildSultiPrompt('chat', `The learner's native language is ${nativeLanguage || 'English'}.`);
    const reply = await groqChat([
      { role: 'system', content: systemPrompt },
      ...messages.map((m: any) => ({ role: m.type === 'user' ? 'user' as const : 'assistant' as const, content: m.text })),
    ], { temperature: 0.8, maxTokens: 600 });
    success(res, { content: reply }, 'Response generated');
  } catch (err) {
    logger.error('Groq error', { error: (err as Error).message });
    errors.internal(res, 'AI request failed');
  }
});

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  try {
    validateEnv();
    connect();
    await connectMongo();

    if (!isGroqConfigured()) {
      logger.info('Initializing local LLM model...');
      try {
        await ensureLocalLLM();
        logger.info('Local LLM ready', { status: isLocalLLMReady() });
        if (getLocalLLMError()) {
          logger.error('Local LLM error', { error: getLocalLLMError() });
        }
      } catch (err) {
        logger.error('Local LLM init failed', { error: (err as Error).message });
      }

      logger.info('Initializing local STT model...');
      try {
        await ensureLocalSTT();
        logger.info('Local STT ready', { status: isLocalSTTReady() });
        if (getLocalSTTError()) {
          logger.error('Local STT error', { error: getLocalSTTError() });
        }
      } catch (err) {
        logger.error('Local STT init failed', { error: (err as Error).message });
      }
    }

    app.listen(env.PORT, '0.0.0.0', () => {
      logger.info(`Server running on http://localhost:${env.PORT}`);
      logger.info(`Mode: ${isGroqConfigured() ? 'API (Groq)' : (isLocalLLMReady() ? 'Local LLM' : 'No LLM available')}`);
      logger.info(`Environment: ${env.NODE_ENV}`);
    });
  } catch (err) {
    logger.error('Failed to start server', { error: (err as Error).message });
    process.exit(1);
  }
}

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection', { error: (err as Error).message });
});

process.on('SIGTERM', async () => {
  await closeAll();
  await closeMongo();
  process.exit(0);
});

start();
