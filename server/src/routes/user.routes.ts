import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getUserWithAvatar, findByEmail, findById, updateUser } from '../db/repositories/user.repo';
import { getSettings, getUserIdByEmail, updateSettings } from '../db/repositories/settings.repo';

const router = Router();

router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await getUserWithAvatar(req.user!.email);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({
      name: user.fullname,
      email: user.email,
      native_language: user.preferredLang || 'English',
      target_language: user.learningLang || 'Bisaya',
      username: user.username,
      country: user.country,
      role: user.role,
      avatar: { name: user.avatarName, image: user.avatarImage },
      created_at: user.createdAt,
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

router.put('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, native_language, target_language, username, country, avatar_id } = req.body || {};
    const user = await findByEmail(req.user!.email);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    await updateUser(req.user!.email, {
      fullname: name ?? user.fullname,
      preferredLang: native_language ?? user.preferredLang ?? undefined,
      learningLang: target_language ?? user.learningLang ?? undefined,
      username: username ?? user.username ?? undefined,
      country: country ?? user.country ?? undefined,
      avatarId: avatar_id ?? user.avatarId ?? undefined,
    });
    const updatedUser = await findByEmail(req.user!.email);
    res.json({
      name: updatedUser!.fullname,
      email: req.user!.email,
      native_language: updatedUser!.preferredLang || 'English',
      target_language: updatedUser!.learningLang || 'Bisaya',
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.get('/settings', authMiddleware, async (req: Request, res: Response) => {
  try {
    const settings = await getSettings(req.user!.email);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

router.put('/settings', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { dark_mode, speech_speed, voice_gender } = req.body || {};
    const userId = await getUserIdByEmail(req.user!.email);
    if (!userId) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    await updateSettings(userId, {
      darkMode: dark_mode ?? null,
      speechSpeed: speech_speed ?? null,
      voiceGender: voice_gender ?? null,
    });
    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

router.put('/settings/language', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { native_language, learning_language } = req.body || {};
    const user = await findByEmail(req.user!.email);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    await updateUser(req.user!.email, {
      preferredLang: native_language ?? user.preferredLang ?? undefined,
      learningLang: learning_language ?? user.learningLang ?? undefined,
    });
    res.json({
      message: 'Settings updated successfully',
      native_language: native_language || user.preferredLang || 'English',
      learning_language: learning_language || user.learningLang || 'Bisaya',
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update language settings' });
  }
});

export default router;
