import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { getDb } from '../db/connection';
import * as schema from '../db/schema-sqlite';
import { eq } from 'drizzle-orm';
import { verifyCredentials } from '@supabase/server/core';

const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || '';

// Cache for Supabase UUID → local user ID mapping (shared with auth middleware)
const userIdCache = new Map<string, number>();

function extractCredentials(req: Request) {
  const authHeader = req.headers['authorization'] || '';
  const apikey = (req.headers['apikey'] as string | undefined) || SUPABASE_PUBLISHABLE_KEY;
  return {
    token: authHeader.startsWith('Bearer ') ? authHeader.slice(7) || null : null,
    apikey: apikey || null,
  };
}

async function resolveSupabaseUser(payload: any): Promise<JwtPayload | null> {
  const supabaseId = payload.sub || '';
  const email = payload.email || '';
  let userId = 0;

  if (supabaseId && userIdCache.has(supabaseId)) {
    userId = userIdCache.get(supabaseId)!;
  } else if (email) {
    try {
      const db = getDb();
      const [existing] = await (db as any).select()
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .limit(1);
      if (existing) {
        userId = existing.user_id;
        if (supabaseId) userIdCache.set(supabaseId, userId);
      }
    } catch {
      // DB lookup failed
    }
  }

  return {
    email,
    userId,
    id: userId,
    sub: supabaseId,
    iat: payload.iat,
    exp: payload.exp,
  };
}

/**
 * Requires a valid JWT AND role === 'admin'.
 * Supports both Supabase JWKS and legacy JWT tokens.
 */
export async function adminMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  let session: JwtPayload | null = null;

  // Try Supabase JWKS verification first
  const credentials = extractCredentials(req);
  if (credentials.token) {
    try {
      const { data, error } = await verifyCredentials(credentials, { auth: 'user' });
      if (!error && data) {
        session = await resolveSupabaseUser(data as any);
      }
    } catch {
      // JWKS verification failed, fall through
    }
  }

  // Fall back to legacy JWT verification
  if (!session) {
    session = verifyToken(token);
  }

  if (!session) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  // If userId is 0 (Supabase token not yet resolved), try email lookup
  if (session.userId === 0 && session.email) {
    try {
      const db = getDb();
      const [existing] = await (db as any).select()
        .from(schema.users)
        .where(eq(schema.users.email, session.email))
        .limit(1);
      if (existing) {
        session.userId = existing.user_id;
        session.id = existing.user_id;
        if (session.sub) userIdCache.set(session.sub, existing.user_id);
      }
    } catch {
      // DB lookup failed
    }
  }

  if (session.userId === 0) {
    res.status(401).json({ error: 'User not found in local database' });
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
