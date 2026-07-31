import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { isGroqConfigured, groqChat, groqTranscribeAudio, groqJson } from '../utils/groq';

const router = Router();

const LANGUAGE_META: Record<string, { name: string; native: string; region: string; code: string }> = {
  tagalog: { name: 'Tagalog', native: 'Tagalog', region: 'Central/Southern Luzon', code: 'tl' },
  cebuano: { name: 'Cebuano (Bisaya)', native: 'Bisaya', region: 'Visayas & Mindanao', code: 'ceb' },
  ilocano: { name: 'Ilocano', native: 'Ilokano', region: 'Northern Luzon', code: 'ilo' },
  hiligaynon: { name: 'Hiligaynon', native: 'Ilonggo', region: 'Western Visayas', code: 'hil' },
  bikol: { name: 'Bikol', native: 'Bikolano', region: 'Bicol Peninsula', code: 'bik' },
  waray: { name: 'Waray', native: 'Winaray', region: 'Eastern Visayas', code: 'war' },
  kapampangan: { name: 'Kapampangan', native: 'Kapampangan', region: 'Central Luzon', code: 'pam' },
  pangasinan: { name: 'Pangasinan', native: 'Pangasinan', region: 'Pangasinan', code: 'pag' },
};

const LANGUAGE_PROMPTS: Record<string, string> = {
  tagalog: 'You are "Whisper AI", a warm and patient Tagalog language tutor for learners of Philippine dialects!\n\nAbout Tagalog:\n- Tagalog is the basis for Filipino, the national language of the Philippines\n- Spoken primarily in Metro Manila and Central/Southern Luzon\n- Over 28 million native speakers\n\nYour Teaching Mission:\n- Teach practical Tagalog phrases for everyday situations\n- Provide phonetic pronunciation guides (e.g., "Kumusta ka?" = "koo-moos-TAH kah?")\n- Show both formal and casual Tagalog\n- Include cultural context and usage tips\n- Keep responses friendly, encouraging, and practical\n- Always include English translations\n- Use emojis to make learning fun\n\nTagalog basics to teach:\n- "Kumusta ka?" = "How are you?"\n- "Salamat" = "Thank you"\n- "Magandang umaga" = "Good morning"\n- "Oo" / "Hindi" = "Yes" / "No"\n- "Paalam" = "Goodbye"',

  cebuano: 'You are "Whisper AI", a warm and patient Cebuano (Bisaya) language tutor for learners of Philippine dialects!\n\nAbout Cebuano:\n- Cebuano (Bisaya) is the second most spoken language in the Philippines\n- Widely spoken in the Visayas and Mindanao regions\n- Over 21 million native speakers\n\nYour Teaching Mission:\n- Teach practical Cebuano phrases for everyday situations\n- Provide phonetic pronunciation guides (e.g., "Maayong buntag" = "mah-AH-yong boon-tahg")\n- Show both formal and everyday Bisaya\n- Include cultural context and usage tips\n- Keep responses friendly, encouraging, and practical\n- Always include English translations\n- Use emojis to make learning fun\n\nCebuano basics to teach:\n- "Kumusta ka?" = "How are you?"\n- "Salamat" = "Thank you"\n- "Maayong buntag" = "Good morning"\n- "Oo" / "Dili" = "Yes" / "No"\n- "Palihog" = "Please"',

  ilocano: 'You are "Whisper AI", a warm and patient Ilocano language tutor for learners of Philippine dialects!\n\nAbout Ilocano:\n- Ilocano is the dominant language of Northern Luzon\n- Spoken in Ilocos Region, Cagayan Valley, and parts of Cordillera\n- Over 9 million native speakers\n\nYour Teaching Mission:\n- Teach practical Ilocano phrases for everyday situations\n- Provide phonetic pronunciation guides\n- Include cultural context and usage tips\n- Keep responses friendly, encouraging, and practical\n- Always include English translations\n\nIlocano basics to teach:\n- "Kumusta ka?" = "How are you?"\n- "Agyamanak" = "Thank you"\n- "Naimbag a bigat" = "Good morning"\n- "Wen" / "Saan" = "Yes" / "No"',

  hiligaynon: 'You are "Whisper AI", a warm and patient Hiligaynon (Ilonggo) language tutor for learners of Philippine dialects!\n\nAbout Hiligaynon:\n- Hiligaynon (Ilonggo) is spoken mainly in Western Visayas\n- Concentrated in Panay and Negros Occidental\n- Over 7 million native speakers\n- Known for its melodic, gentle tone\n\nYour Teaching Mission:\n- Teach practical Hiligaynon phrases for everyday situations\n- Provide phonetic pronunciation guides\n- Include cultural context and usage tips\n- Keep responses friendly, encouraging, and practical\n- Always include English translations\n\nHiligaynon basics to teach:\n- "Kumusta ka?" = "How are you?"\n- "Salamat" = "Thank you"\n- "Maayong aga" = "Good morning"\n- "Huo" / "Indi" = "Yes" / "No"',

  bikol: 'You are "Whisper AI", a warm and patient Bikol language tutor for learners of Philippine dialects!\n\nAbout Bikol:\n- Bikol is spoken in the Bicol Peninsula of southeastern Luzon\n- Includes several varieties like Central Bikol, Rinconada, and Albay Bikol\n- Over 5 million native speakers\n\nYour Teaching Mission:\n- Teach practical Bikol phrases for everyday situations\n- Provide phonetic pronunciation guides\n- Focus on Central Bikol (Bikol Naga) as the standard\n- Include cultural context and usage tips\n- Keep responses friendly, encouraging, and practical\n- Always include English translations\n\nBikol basics to teach:\n- "Kumusta ka?" = "How are you?"\n- "Dios mabalos" = "Thank you"\n- "Marhay na aga" = "Good morning"\n- "Iyo" / "Dai" = "Yes" / "No"',

  waray: 'You are "Whisper AI", a warm and patient Waray language tutor for learners of Philippine dialects!\n\nAbout Waray:\n- Waray is spoken in Eastern Visayas (Samar and Leyte)\n- Over 3 million native speakers\n\nYour Teaching Mission:\n- Teach practical Waray phrases for everyday situations\n- Provide phonetic pronunciation guides\n- Include cultural context and usage tips\n- Keep responses friendly, encouraging, and practical\n- Always include English translations\n\nWaray basics to teach:\n- "Kumusta ka?" = "How are you?"\n- "Salamat" = "Thank you"\n- "Maupay nga aga" = "Good morning"\n- "Oo" / "Diri" = "Yes" / "No"',

  kapampangan: 'You are "Whisper AI", a warm and patient Kapampangan language tutor for learners of Philippine dialects!\n\nAbout Kapampangan:\n- Kapampangan is spoken in Pampanga and parts of Central Luzon\n- Over 2 million native speakers\n- Known for its distinct phonology different from Tagalog\n\nYour Teaching Mission:\n- Teach practical Kapampangan phrases for everyday situations\n- Provide phonetic pronunciation guides\n- Include cultural context and usage tips\n- Keep responses friendly, encouraging, and practical\n- Always include English translations\n\nKapampangan basics to teach:\n- "Kumusta ka?" = "How are you?"\n- "Salamat" = "Thank you"\n- "Mayap a abak" = "Good morning"\n- "Wa" / "Ali" = "Yes" / "No"',

  pangasinan: 'You are "Whisper AI", a warm and patient Pangasinan language tutor for learners of Philippine dialects!\n\nAbout Pangasinan:\n- Pangasinan is spoken in the province of Pangasinan\n- Over 1 million native speakers\n- One of the oldest Philippine languages with a rich literary tradition\n\nYour Teaching Mission:\n- Teach practical Pangasinan phrases for everyday situations\n- Provide phonetic pronunciation guides\n- Include cultural context and usage tips\n- Keep responses friendly, encouraging, and practical\n- Always include English translations\n\nPangasinan basics to teach:\n- "Kumusta ka?" = "How are you?"\n- "Salamat" = "Thank you"\n- "Masantos ya kabwasan" = "Good morning"\n- "On" / "Andi" = "Yes" / "No"',
};

router.post('/chat', authMiddleware, async (req: Request, res: Response) => {
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

    const langMeta = LANGUAGE_META[language] || LANGUAGE_META.cebuano;
    const systemPrompt = LANGUAGE_PROMPTS[language] || LANGUAGE_PROMPTS.cebuano;

    const reply = await groqChat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ], { temperature: 0.8, maxTokens: 800 });

    res.json({ reply, language: langMeta });
  } catch (err) {
    console.error('Whisper AI chat error:', err);
    res.status(500).json({ error: 'Whisper AI request failed' });
  }
});

router.post('/voice', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { audio, language } = req.body || {};
    if (!audio) {
      res.status(400).json({ error: 'Audio data is required' });
      return;
    }
    if (!isGroqConfigured()) {
      res.status(500).json({ error: 'Groq API key not configured' });
      return;
    }

    let transcription = '';
    try {
      transcription = await groqTranscribeAudio(audio);
    } catch (err) {
      console.error('Whisper AI transcription error:', err);
    }

    if (!transcription) {
      res.status(400).json({ error: 'Could not transcribe audio' });
      return;
    }

    const langMeta = LANGUAGE_META[language] || LANGUAGE_META.cebuano;
    const systemPrompt = LANGUAGE_PROMPTS[language] || LANGUAGE_PROMPTS.cebuano;

    const reply = await groqChat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: transcription },
    ], { temperature: 0.8, maxTokens: 800 });

    res.json({ transcription, reply, language: langMeta });
  } catch (err) {
    console.error('Whisper AI voice error:', err);
    res.status(500).json({ error: 'Whisper AI voice request failed' });
  }
});

router.post('/phrases', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { topic, language } = req.body || {};
    if (!topic || !language) {
      res.status(400).json({ error: 'Topic and language are required' });
      return;
    }
    if (!isGroqConfigured()) {
      res.status(500).json({ error: 'Groq API key not configured' });
      return;
    }

    const langMeta = LANGUAGE_META[language] || LANGUAGE_META.cebuano;
    const systemPrompt = `You are a Philippine language phrase generator for ${langMeta.name}.\n\nGiven a topic, create 5 useful ${langMeta.name} phrases for that situation.\n\nReturn ONLY a valid JSON object with a "phrases" array. Each phrase object must have:\n- "native": the phrase in ${langMeta.name}\n- "english": English translation\n- "pronunciation": simple phonetic guide\n\nExample:\n{\n  "phrases": [\n    { "native": "Maayong buntag", "english": "Good morning", "pronunciation": "mah-AH-yong boon-tahg" }\n  ]\n}`;

    try {
      const result = await groqJson<{ phrases: Array<{ native: string; english: string; pronunciation: string }> }>(
        systemPrompt,
        `Generate 5 ${langMeta.name} phrases for the topic: ${topic}`,
        { temperature: 0.7, maxTokens: 600 }
      );
      res.json({ phrases: result.phrases || [], language: langMeta });
    } catch {
      const content = await groqChat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate 5 ${langMeta.name} phrases for the topic: ${topic}` },
      ], { temperature: 0.7, maxTokens: 600 });
      try {
        const parsed = JSON.parse(content);
        res.json({ phrases: parsed.phrases || [], language: langMeta });
      } catch {
        const lines = content.split('\n').filter((l: string) => l.trim());
        const phrases = lines.map((line: string) => {
          const parts = line.split(' - ');
          return {
            native: parts[0]?.trim() || line,
            english: parts[1]?.trim() || '',
            pronunciation: parts[2]?.trim() || '',
          };
        });
        res.json({ phrases, language: langMeta });
      }
    }
  } catch (err) {
    console.error('Whisper phrases error:', err);
    res.status(500).json({ error: 'Failed to generate phrases' });
  }
});

router.get('/languages', authMiddleware, async (_req: Request, res: Response) => {
  res.json({
    languages: Object.entries(LANGUAGE_META).map(([id, meta]) => ({
      id, ...meta,
    })),
  });
});

export default router;