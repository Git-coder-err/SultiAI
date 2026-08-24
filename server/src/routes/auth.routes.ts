import { Router } from 'express';
import { authRateLimit } from '../middleware/rateLimit';
import { validate, validators } from '../middleware/validate';
import { signUp, signIn, refreshToken, signOut, clerkSync, googleSignIn } from '../controllers/auth.controller';

const router = Router();

router.post('/signup', authRateLimit, validate([
  { field: 'fullname', validators: [validators.required(), validators.string(), validators.minLength(2), validators.maxLength(100)] },
  { field: 'email', validators: [validators.required(), validators.string(), validators.email()] },
  { field: 'password', validators: [validators.required(), validators.string(), validators.minLength(6)] },
]), signUp);

router.post('/signin', authRateLimit, validate([
  { field: 'email', validators: [validators.required(), validators.string(), validators.email()] },
  { field: 'password', validators: [validators.required(), validators.string()] },
]), signIn);

router.post('/clerk-sync', authRateLimit, clerkSync);
router.post('/google', authRateLimit, googleSignIn);
router.post('/refresh', authRateLimit, refreshToken);
router.post('/signout', signOut);

// Admin setup: promote user by email (unauthenticated, for initial bootstrap only)
router.post('/promote', async (req, res) => {
  const { email, secret } = req.body || {};
  if (!email) {
    res.status(400).json({ error: 'Email required' });
    return;
  }
  // Simple bootstrap protection: require a secret or allow if no admins exist yet
  try {
    const { getDb } = await import('../db/connection');
    const schema = await import('../db/schema-sqlite');
    const { eq, count } = await import('drizzle-orm');
    const db = getDb();

    // Check if any admins exist yet
    const [adminCount] = await (db as any).select({ c: count() })
      .from(schema.users)
      .where(eq(schema.users.role, 'admin'));

    const isFirstAdmin = !adminCount || adminCount.c === 0;
    const validSecret = secret === (process.env.JWT_SECRET || 'dev-secret-key-12345');

    if (!isFirstAdmin && !validSecret) {
      res.status(403).json({ error: 'Admin secret required' });
      return;
    }

    await (db as any).update(schema.users)
      .set({ role: 'admin' })
      .where(eq(schema.users.email, email));
    res.json({ message: `User ${email} promoted to admin` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to promote user' });
  }
});

export default router;
