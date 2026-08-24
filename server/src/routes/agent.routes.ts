import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { buildSultiPrompt } from '../utils/prompts';

const router = Router();

router.get('/status', (_req, res) => {
  const { isXaiConfigured, XAI_VOICE_MODEL, XAI_VOICE } = require('../utils/xai');
  const { isElevenlabsConfigured, ELEVENLABS_AGENT_ID } = require('../utils/elevenlabs');
  res.json({
    realtime: isXaiConfigured(),
    model: XAI_VOICE_MODEL,
    voice: XAI_VOICE,
    elevenlabs: {
      available: isElevenlabsConfigured(),
      agent_id: ELEVENLABS_AGENT_ID || null,
    },
    local_available: true,
    message: isXaiConfigured()
      ? 'Realtime voice mode enabled'
      : 'Realtime voice mode requires XAI_API_KEY. Use the local TTS endpoints instead.',
  });
});

// Mints a short-lived signed WebSocket URL for the ElevenLabs speech-to-speech
// agent. The API key never leaves the server; the client connects with the URL.
router.get('/elevenlabs', authMiddleware, async (req, res) => {
  try {
    const { isElevenlabsConfigured, getSignedUrl, ELEVENLABS_ALLOW_OVERRIDES } = require('../utils/elevenlabs');

    if (!isElevenlabsConfigured()) {
      res.status(500).json({
        error: 'ElevenLabs voice mode requires ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID in server/.env.',
      });
      return;
    }

    const { url, agent_id } = await getSignedUrl();
    res.json({ signed_url: url, agent_id, overrides_allowed: ELEVENLABS_ALLOW_OVERRIDES });
  } catch (err) {
    console.error('Agent elevenlabs error:', err);
    res.status(502).json({
      error: 'Failed to mint ElevenLabs signed URL. Check server/.env ELEVENLABS_API_KEY / ELEVENLABS_AGENT_ID.',
    });
  }
});

router.post('/token', authMiddleware, async (req, res) => {
  try {
    const {
      isXaiConfigured,
      getRealtimeClientSecret,
      getRealtimeUrl,
      XAI_VOICE,
      XAI_VOICE_MODEL,
    } = require('../utils/xai');

    if (!isXaiConfigured()) {
      res.status(500).json({
        error: 'Realtime voice mode requires XAI_API_KEY. Use /api/speech/synthesize for local TTS instead.',
      });
      return;
    }

    const { getFullProfileByEmail } = require('../db/repositories/learner.repo');
    const email = req.user?.email;
    const extra: string[] = [];
    if (email) {
      try {
        const profile = await getFullProfileByEmail(email);
        if (profile && profile.level) {
          extra.push(`The learner is currently at the ${profile.level} level.`);
        }
      } catch {
        // Ignore profile lookup failures; fall back to the default persona.
      }
    }

    const { value, expires_at } = await getRealtimeClientSecret();
    res.json({
      token: value,
      expires_at,
      url: getRealtimeUrl(),
      session: {
        model: XAI_VOICE_MODEL,
        voice: XAI_VOICE,
        instructions: buildSultiPrompt('voice', extra.join('\n')),
      },
    });
  } catch (err) {
    console.error('Agent token error:', err);
    res.status(502).json({
      error: 'Failed to mint xAI realtime token. Check server/.env XAI_API_KEY and xAI credits.',
    });
  }
});

export default router;
