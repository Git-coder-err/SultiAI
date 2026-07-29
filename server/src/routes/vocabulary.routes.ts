import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

interface AuthRequest extends Request {
  user?: { id: number; email: string };
}

router.get('/review', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { getDb } = await import('../db/connection');
    const db = getDb();
    const phrases = db.prepare(`
      SELECT sp.*, COALESCE(vr.ease_factor, 2.5) as ease_factor,
             COALESCE(vr.interval, 0) as review_interval,
             COALESCE(vr.review_count, 0) as review_count,
             vr.next_review_at
      FROM saved_phrases sp
      LEFT JOIN vocabulary_reviews vr ON vr.phrase_id = sp.phrase_id AND vr.user_id = ?
      WHERE sp.user_id = ?
      ORDER BY vr.next_review_at ASC, sp.created_at DESC
    `).all(req.user!.id, req.user!.id);
    res.json(phrases);
  } catch (err) {
    console.error('Vocab review error:', err);
    res.status(500).json({ error: 'Failed to load vocabulary' });
  }
});

router.get('/due', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { getDb } = await import('../db/connection');
    const db = getDb();
    const now = new Date().toISOString();
    const phrases = db.prepare(`
      SELECT sp.*, vr.ease_factor, vr.review_count
      FROM saved_phrases sp
      LEFT JOIN vocabulary_reviews vr ON vr.phrase_id = sp.phrase_id AND vr.user_id = ?
      WHERE sp.user_id = ?
        AND (vr.next_review_at IS NULL OR vr.next_review_at <= ?)
      ORDER BY vr.next_review_at ASC
      LIMIT 20
    `).all(req.user!.id, req.user!.id, now);
    res.json(phrases);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load due reviews' });
  }
});

router.post('/review', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { phrase_id, score } = req.body;
    if (!phrase_id || score == null) {
      res.status(400).json({ error: 'phrase_id and score are required' });
      return;
    }

    const { getDb } = await import('../db/connection');
    const db = getDb();

    const existing = db.prepare(
      'SELECT * FROM vocabulary_reviews WHERE user_id = ? AND phrase_id = ?'
    ).get(req.user!.id, phrase_id) as any;

    const now = new Date();
    let easeFactor = 2.5;
    let reviewInterval = 1;
    let reviewCount = 0;

    if (existing) {
      easeFactor = existing.ease_factor;
      reviewInterval = existing.interval;
      reviewCount = existing.review_count;
    }

    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - score) * (0.08 + (5 - score) * 0.02)));

    if (score >= 4) {
      if (reviewInterval === 0) reviewInterval = 1;
      else if (reviewInterval === 1) reviewInterval = 3;
      else reviewInterval = Math.round(reviewInterval * easeFactor);
    } else {
      reviewInterval = 1;
    }

    const nextReview = new Date(now.getTime() + reviewInterval * 24 * 60 * 60 * 1000);
    reviewCount += 1;

    if (existing) {
      db.prepare(`
        UPDATE vocabulary_reviews
        SET ease_factor = ?, interval = ?, review_count = ?, next_review_at = ?, updated_at = ?
        WHERE user_id = ? AND phrase_id = ?
      `).run(easeFactor, reviewInterval, reviewCount, nextReview.toISOString(), now.toISOString(), req.user!.id, phrase_id);
    } else {
      db.prepare(`
        INSERT INTO vocabulary_reviews (user_id, phrase_id, ease_factor, interval, review_count, next_review_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(req.user!.id, phrase_id, easeFactor, reviewInterval, reviewCount, nextReview.toISOString(), now.toISOString(), now.toISOString());
    }

    res.json({
      success: true,
      ease_factor: easeFactor,
      review_interval: reviewInterval,
      next_review_at: nextReview.toISOString(),
    });
  } catch (err) {
    console.error('Vocab review save error:', err);
    res.status(500).json({ error: 'Failed to save review' });
  }
});

export default router;
