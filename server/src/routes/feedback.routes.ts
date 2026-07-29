import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getUserIdByEmail } from '../db/repositories/feedback.repo';
import { submitFeedback } from '../db/repositories/feedback.repo';

const router = Router();

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { functionality, usability, reliability } = req.body || {};
    const userId = await getUserIdByEmail(req.user!.email);
    if (!userId) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    await submitFeedback(userId, functionality || 0, usability || 0, reliability || 0);
    res.json({ message: 'Feedback submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

export default router;
