import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getProfile, getMistakes, getFullProfileByEmail, upsertProfileFromAnalysis } from '../db/repositories/learner.repo';
import { getSessionMessages, createSession, updateSession } from '../db/repositories/tutor.repo';
import { getUserIdByEmail } from '../db/repositories/conversation.repo';
import { getLivingLexicon } from '../db/repositories/preservation.repo';
import { isGroqConfigured, groqChat, groqTranscribeAudio, groqJson } from '../utils/groq';

const router = Router();

router.get('/level', authMiddleware, async (req: Request, res: Response) => {
  try {
    const profile = await getProfile(req.user!.email);
    if (!profile) {
      res.json({ level: 'beginner', strengths: [], weak_areas: [], common_mistakes: [], total_xp: 0, total_sessions: 0 });
      return;
    }
    res.json({
      level: profile.level,
      strengths: profile.strengths || [],
      weak_areas: profile.weakAreas || [],
      common_mistakes: profile.commonMistakes || [],
      total_xp: profile.totalXp || 0,
      total_sessions: profile.totalSessions || 0,
      last_active: profile.lastActive || null,
    });
  } catch (err) {
    console.error('Get level error:', err);
    res.status(500).json({ error: 'Failed to get level' });
  }
});

router.get('/mistakes', authMiddleware, async (req: Request, res: Response) => {
  try {
    const mistakes = await getMistakes(req.user!.email);
    res.json(mistakes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get mistakes' });
  }
});

router.post('/lesson', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { situation } = req.body || {};
    if (!situation) {
      res.status(400).json({ error: 'Situation is required' });
      return;
    }
    if (!isGroqConfigured()) {
      res.status(500).json({ error: 'Groq API key not configured' });
      return;
    }

    const systemPrompt = 'You are a Bisaya (Cebuano) language lesson creator. Create a short interactive lesson for the given situation.\nReturn ONLY a valid JSON object (no other text) with this structure:\n{\n  "situation": "string",\n  "text": "short intro paragraph explaining what the user will learn",\n  "phrases": [\n    { "bisaya": "Bisaya phrase", "english": "English translation", "pronunciation": "phonetic guide" }\n  ],\n  "dialogue": [\n    { "speaker": "person role", "bisaya": "what they say", "english": "translation" }\n  ],\n  "cultural_note": "relevant cultural context",\n  "practice_suggestions": ["tip 1", "tip 2"]\n}';

    try {
      const lesson = await groqJson<object>(systemPrompt, 'Create a lesson for: ' + situation, { temperature: 0.7, maxTokens: 1200 });
      res.json({ role: 'lesson', ...lesson });
    } catch {
      const text = await groqChat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Create a lesson for: ' + situation },
      ], { temperature: 0.7, maxTokens: 1200 });
      res.json({ role: 'lesson', situation, text, phrases: [], dialogue: [] });
    }
  } catch (err) {
    console.error('Lesson error:', err);
    res.status(500).json({ error: 'Lesson generation failed' });
  }
});

router.post('/chat', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { message, audio, session_id } = req.body || {};
    if (!message && !audio) {
      res.status(400).json({ error: 'Message or audio is required' });
      return;
    }
    if (!isGroqConfigured()) {
      res.status(500).json({ error: 'Groq API key not configured' });
      return;
    }

    let text = message || '';
    let transcription: string | null = null;
    let pronunciation: any = null;

    if (audio) {
      try {
        text = await groqTranscribeAudio(audio);
        transcription = text;
      } catch (err) {
        console.error('Transcription error:', err);
      }
    }

    if (!text) {
      res.status(400).json({ error: 'Could not transcribe audio and no text provided' });
      return;
    }

    const profile = await getFullProfileByEmail(req.user!.email);
    let learnerLevel = 'beginner';
    let learnerStrengths: string[] = [];
    let learnerWeakAreas: string[] = [];
    let learnerMistakes: any[] = [];

    if (!profile) {
      const { getProfile } = require('../db/repositories/learner.repo');
      try { await getProfile(req.user!.email); } catch {}
    } else {
      learnerLevel = profile.level || 'beginner';
      learnerStrengths = Array.isArray(profile.strengths) ? profile.strengths :
        (typeof profile.strengths === 'string' ? safeJsonParse(profile.strengths, []) : []);
      learnerWeakAreas = Array.isArray(profile.weakAreas) ? profile.weakAreas :
        (typeof profile.weakAreas === 'string' ? safeJsonParse(profile.weakAreas, []) : []);
      learnerMistakes = Array.isArray(profile.commonMistakes) ? profile.commonMistakes :
        (typeof profile.commonMistakes === 'string' ? safeJsonParse(profile.commonMistakes, []) : []);
    }

    let sessionMessages: any[] = [];
    let currentSessionId = session_id;
    if (session_id) {
      try {
        const msgs = await getSessionMessages(Number(session_id), req.user!.email);
        sessionMessages = Array.isArray(msgs) ? msgs : [];
      } catch {}
    }

    const levelInstructions: Record<string, string> = {
      beginner: '- Teach word-by-word with clear pronunciation\n- Use very simple sentences\n- Repeat key vocabulary 3 times\n- Always provide phonetic pronunciation guides\n- Praise effort heavily',
      intermediate: '- Expand to full sentences\n- Introduce common slang and casual forms\n- Correct grammar gently\n- Ask the user to repeat and practice\n- Introduce cultural context',
      advanced: '- Use natural speed conversation\n- Correct nuance and regional variations\n- Discuss cultural idioms and proverbs\n- Challenge with complex scenarios\n- Provide detailed feedback on word choice',
    };

    const mistakesContext = learnerMistakes.length > 0
      ? '\nTheir common mistakes:\n' + learnerMistakes.slice(0, 5).map((m: any) => '- "' + m.pattern + '" should be "' + m.correction + '" (' + m.count + 'x errors)').join('\n') + '\nProactively correct these when they appear.'
      : '';

    const weakAreaContext = learnerWeakAreas.length > 0
      ? '\nTheir weak areas: ' + learnerWeakAreas.slice(0, 3).join(', ') + '\nFocus extra attention on these topics.'
      : '';

    let lexiconContext = '';
    try {
      const lexicon = await getLivingLexicon(15);
      if (lexicon.length > 0) {
        lexiconContext = '\n\nPreserved Bisaya words from the community living lexicon (use and teach these):\n' +
          lexicon.map((w: any) => `- "${w.word}"${w.definition ? ': ' + w.definition : ''}${w.dialectalRegion ? ' (' + w.dialectalRegion + ' dialect)' : ''}${w.bisayaExample ? ' e.g. "' + w.bisayaExample + '"' : ''}`).join('\n') +
          '\nWhen a learner asks about these, explain their regional/cultural context. Encourage learners to use them in conversation.\n';
      }
    } catch {}

    const systemPrompt = 'You are "Hoy!", an enthusiastic and patient AI Bisaya (Cebuano) language tutor!\n\nThis learner is at: ' + learnerLevel + ' level.\n' + mistakesContext + '\n' + weakAreaContext + '\n\nTeaching approach for their level:\n' + (levelInstructions[learnerLevel] || levelInstructions.beginner) + '\n\nYour Mission:\n- Help users learn and practice SPEAKING Bisaya (Cebuano)\n- Make responses clear and easy to pronounce\n- Focus on practical, everyday phrases\n\nTeaching Style:\n- Friendly, conversational, and encouraging\n- Use emojis to make learning fun\n- Keep explanations simple\n- Keep sentences short and speakable\n\nYour Expertise:\n- Teach Bisaya/Cebuano to English speakers\n- Show formal vs everyday Bisaya (slang & casual)\n- Share cultural context and usage tips\n- Write Bisaya phrases in quotation marks like "Maayong buntag"\n- Give pronunciation guides in simple terms\n- Always include English translations\n' + lexiconContext + '\nAfter your teaching reply, append a JSON analysis block on its own line like this:\n__ANALYSIS__{"detected_mistakes":[{"pattern":"wrong","correction":"right","count":1}],"topics":["topic1"],"user_level":"' + learnerLevel + '"}__END__';

    const reply = await groqChat([
      { role: 'system', content: systemPrompt },
      ...sessionMessages.map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user', content: text },
    ], { temperature: 0.8, maxTokens: 1000 });

    let analysis: any = { detected_mistakes: [], topics: [], user_level: learnerLevel };
    const analysisMatch = reply.match(/__ANALYSIS__({.*?})__END__/);
    let cleanReply = reply;
    if (analysisMatch) {
      try {
        const parsed = JSON.parse(analysisMatch[1]);
        analysis = { ...analysis, ...parsed };
        cleanReply = reply.replace(/__ANALYSIS__\{.*?\}__END__/, '').trim();
      } catch {}
    }

    if (audio && transcription) {
      try {
        const pronResult = await groqJson<{ score: number; feedback: string; phoneme_breakdown: any[] }>(
          'You are a Bisaya pronunciation coach. Analyze the given text. Return ONLY a valid JSON object with: "score" (0-100), "feedback" (string), "phoneme_breakdown" (array of {expected, heard, correct, tip}).',
          'Analyze pronunciation for this Bisaya text: "' + transcription + '"',
          { temperature: 0.3, maxTokens: 500 }
        );
        pronunciation = pronResult;
      } catch (err) {
        try {
          const pronText = await groqChat([
            { role: 'system', content: 'You are a Bisaya pronunciation coach. Analyze the given text. Return ONLY a valid JSON object with: "score" (0-100), "feedback" (string), "phoneme_breakdown" (array of {expected, heard, correct, tip}).' },
            { role: 'user', content: 'Analyze pronunciation for this Bisaya text: "' + transcription + '"' },
          ], { temperature: 0.3, maxTokens: 500 });
          try { pronunciation = JSON.parse(pronText); } catch {
            pronunciation = { score: 85, feedback: pronText, phoneme_breakdown: [] };
          }
        } catch {}
      }
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    sessionMessages.push({ role: 'user', content: text });
    sessionMessages.push({ role: 'assistant', content: cleanReply });

    let newSessionId: string;
    if (currentSessionId) {
      await updateSession(Number(currentSessionId), sessionMessages, now);
      newSessionId = currentSessionId;
    } else {
      const id = await createSession(req.user!.email, sessionMessages, now);
      newSessionId = String(id);
    }

    try {
      await upsertProfileFromAnalysis(req.user!.email, analysis, text, cleanReply, currentSessionId);
    } catch (err) {
      console.error('Profile update error:', err);
    }

    res.json({
      reply: cleanReply,
      session_id: newSessionId,
      transcription,
      pronunciation,
      analysis,
    });
  } catch (err) {
    console.error('Tutor chat error:', err);
    res.status(500).json({ error: 'Tutor chat failed' });
  }
});

function safeJsonParse(val: string, fallback: any) {
  try { return JSON.parse(val); } catch { return fallback; }
}

export default router;
