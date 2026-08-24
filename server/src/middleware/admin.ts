import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { getDb } from '../db/connection';
import * as schema from '../db/schema-sqlite';
import { eq } from 'drizzle-orm';

/**
 * Requires a valid JWT AND role === 'admin'.
 * Attach this before any admin route.
 */
export async function adminMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  const session = verifyToken(token);
  if (!session) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  try {
    const db = getDb();
    const rows = await (db as any).select({ role: schema.users.role })
      .from(schema.users)
      .where(eq(schema.users.userId, session.userId))
      .limit(1);

    if (!rows.length || rows[0].role !== 'admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    req.user = session;
    next();
  } catch {
    res.status(500).json({ error: 'Failed to verify admin role' });
  }
}
