import { Router, Request, Response } from 'express';
import { findByEmail, createUser } from '../db/repositories/user.repo';
import { hashPassword, verifyPassword } from '../utils/crypto';
import { signToken } from '../utils/jwt';

const router = Router();

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name, native_language = 'English', target_language = 'Bisaya' } = req.body || {};
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }
    const existing = await findByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'Account already exists' });
      return;
    }
    const fullname = name || email.split('@')[0];
    const username = fullname.toLowerCase().replace(/[^a-z0-9]/g, '') + Date.now().toString(36);
    const userId = await createUser({
      fullname,
      username,
      email,
      passwordHash: hashPassword(password),
      preferredLang: native_language,
      learningLang: target_language,
    });
    const token = signToken({ email, userId });
    res.json({ message: 'User registered successfully', token, user: { name: fullname, email, native_language, target_language } });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/signin', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }
    const user = await findByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const token = signToken({ email, userId: user.userId });
    res.json({ token, user: { name: user.fullname, email, native_language: user.preferredLang || 'English', target_language: user.learningLang || 'Bisaya' } });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
