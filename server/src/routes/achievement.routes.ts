import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

interface AuthRequest extends Request {
  user?: { id: number; email: string };
}

const ACHIEVEMENTS = [
  { id: 'first_100_xp', title: 'First Steps', description: 'Earn 100 XP', icon: 'star', xpReward: 50, coinReward: 20 },
  { id: 'thousand_xp', title: 'Century', description: 'Earn 1,000 XP', icon: 'trophy', xpReward: 200, coinReward: 100 },
  { id: 'five_thousand_xp', title: 'Dedicated', description: 'Earn 5,000 XP', icon: 'diamond', xpReward: 500, coinReward: 250 },
  { id: 'streak_3', title: 'Getting Started', description: '3-day streak', icon: 'flame', xpReward: 50, coinReward: 30 },
  { id: 'streak_7', title: 'Consistent', description: '7-day streak', icon: 'flame', xpReward: 100, coinReward: 50 },
  { id: 'streak_30', title: 'Unstoppable', description: '30-day streak', icon: 'flame', xpReward: 500, coinReward: 200 },
  { id: 'daily_goal', title: 'Goal Crusher', description: 'Reach daily goal', icon: 'target', xpReward: 50, coinReward: 25 },
  { id: 'first_lesson', title: 'First Lesson', description: 'Complete your first lesson', icon: 'school', xpReward: 30, coinReward: 15 },
  { id: 'voice_pioneer', title: 'Voice Pioneer', description: 'Try voice practice', icon: 'mic', xpReward: 20, coinReward: 10 },
  { id: 'community_member', title: 'Community Member', description: 'Join the community', icon: 'people', xpReward: 25, coinReward: 10 },
];

const BADGES = [
  { id: 'native_speaker', title: 'Native Speaker', description: 'Verified native Bisaya speaker', icon: 'shield-checkmark', color: '#10B981' },
  { id: 'top_contributor', title: 'Top Contributor', description: 'Helped the most in the community', icon: 'trophy', color: '#FFD700' },
  { id: 'teacher', title: 'Teacher', description: 'Helped 10+ learners improve', icon: 'school', color: '#1E6F9F' },
  { id: 'early_adopter', title: 'Early Adopter', description: 'Joined in the first month', icon: 'rocket', color: '#8B5CF6' },
];

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userAchievements = await getUserAchievements(req.user!.id);
    res.json({
      all: ACHIEVEMENTS,
      earned: userAchievements,
    });
  } catch (err) {
    console.error('Achievements error:', err);
    res.status(500).json({ error: 'Failed to load achievements' });
  }
});

router.get('/badges', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userBadges = await getUserBadges(req.user!.id);
    res.json({
      all: BADGES,
      earned: userBadges,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load badges' });
  }
});

async function getUserAchievements(userId: number): Promise<any[]> {
  const { getDb } = await import('../db/connection');
  const db = getDb();
  const rows = db.prepare('SELECT * FROM user_achievements WHERE user_id = ?').all(userId);
  return rows;
}

async function getUserBadges(userId: number): Promise<any[]> {
  const { getDb } = await import('../db/connection');
  const db = getDb();
  const rows = db.prepare('SELECT * FROM user_badges WHERE user_id = ?').all(userId);
  return rows;
}

export default router;
