import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { getDb } from '../db/connection';
import { verifyCredentials } from '@supabase/server/core';

// Cache for Supabase UUID → local user ID mapping
const userIdCache = new Map<string, number>();

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Build a credentials object from Express request headers
 * that @supabase/server/core can verify.
 */
function extractCredentials(req: Request) {
  const authHeader = req.headers['authorization'] || '';
  const apikey = req.headers['apikey'] as string | undefined;
  return {
    token: authHeader.startsWith('Bearer ') ? authHeader.slice(7) || null : null,
    apikey: apikey || null,
  };
}

/**
 * Auth middleware that verifies Supabase-issued JWTs using @supabase/server/core,
 * then falls back to legacy JWT verification.
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const credentials = extractCredentials(req);

  if (!credentials.token && !credentials.apikey) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  // Try Supabase JWKS verification via @supabase/server/core
  if (credentials.token) {
    try {
      const { data, error } = await verifyCredentials(credentials, {
        auth: 'user',
      });

      if (!error && data) {
        // data contains the verified payload
        const payload = data as any;
        const session: JwtPayload = {
          email: payload.email || '',
          userId: 0, // Will be resolved via email lookup
          id: 0,
          sub: payload.sub || payload.user_sub || '',
          iat: payload.iat,
          exp: payload.exp,
        };

        // Resolve Supabase UUID → local user ID
        const supabaseId = session.sub || '';
        const email = session.email || '';

        if (supabaseId && userIdCache.has(supabaseId)) {
          session.userId = userIdCache.get(supabaseId)!;
        } else if (email) {
          try {
            const db = getDb();
            const schema = require('../db/schema-sqlite');
            const { eq } = require('drizzle-orm');
            const [existing] = (db as any).select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
            if (existing) {
              session.userId = existing.user_id;
              if (supabaseId) userIdCache.set(supabaseId, existing.user_id);
            }
          } catch {}
        }

        req.user = { ...session, id: session.userId };
        return next();
      }
    } catch (err) {
      // JWKS verification failed, fall through to legacy
    }
  }

  // Fall back to legacy JWT verification
  const legacySession = verifyToken(credentials.token || '');
  if (legacySession) {
    req.user = { ...legacySession, id: legacySession.userId };
    return next();
  }

  res.status(401).json({ error: 'Invalid or expired token' });
}
