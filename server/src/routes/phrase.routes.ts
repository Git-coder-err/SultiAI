import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getSavedPhrases,
  getUserIdByEmail,
  savePhrase,
  deletePhrase,
} from '../db/repositories/phrase.repo';

const router = Router();

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const phrases = await getSavedPhrases(req.user!.email);
    res.json(phrases);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get saved phrases' });
  }
});

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { phrase, language, category } = req.body || {};
    if (!phrase) {
      res.status(400).json({ error: 'Phrase is required' });
      return;
    }
    const userId = await getUserIdByEmail(req.user!.email);
    if (!userId) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const phraseId = await savePhrase(userId, phrase, language || null, category || null);
    res.json({ phrase_id: phraseId, phrase, language, category });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save phrase' });
  }
});

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    await deletePhrase(Number(req.params.id), req.user!.email);
    res.json({ message: 'Phrase deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete phrase' });
  }
});

export default router;
