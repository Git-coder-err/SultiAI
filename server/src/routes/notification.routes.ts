import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getNotifications,
  getUserIdByEmail,
  createNotification,
  markAsRead,
} from '../db/repositories/notification.repo';

const router = Router();

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const rows = await getNotifications(req.user!.email);
    if (rows.length === 0) {
      const userId = await getUserIdByEmail(req.user!.email);
      if (userId) {
        await createNotification(userId, 'Welcome!', 'Practice your daily Bisaya phrases!');
        await createNotification(userId, 'Update', 'New community resources available!');
        const fresh = await getNotifications(req.user!.email);
        res.json(fresh);
        return;
      }
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    await markAsRead(Number(req.params.id), req.user!.email);
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

export default router;
