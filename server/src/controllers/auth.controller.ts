import crypto from 'crypto';
import { Request, Response } from 'express';
import { eq, and } from 'drizzle-orm';
import { getDb } from '../db/connection';
import * as schema from '../db/schema-sqlite';
import { hashPassword, verifyPassword } from '../utils/crypto';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt';
import { success, errors, created } from '../utils/apiResponse';
import logger from '../utils/logger';

export async function signUp(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body || {};
    const fullname = body.fullname || body.name;
    const { email, password } = body;
    if (!fullname || !email || !password) {
      errors.validation(res, 'Fullname, email, and password are required');
      return;
    }

    const db = getDb();
    const existing = await (db as any).select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (existing.length > 0) {
      errors.conflict(res, 'Email already registered');
      return;
    }

    const passwordHash = hashPassword(password);
    const result = await (db as any).insert(schema.users).values({
      fullname,
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    });

    const userId = result.lastInsertRowid;
    const tokens = generateTokenPair({ email, userId });

    await storeRefreshToken(userId, tokens.refreshToken);

    created(res, {
      user: { id: userId, fullname, email },
      ...tokens,
    }, 'Account created successfully');
  } catch (err) {
    logger.error('Signup error', { error: (err as Error).message });
    errors.internal(res, 'Failed to create account');
  }
}

export async function signIn(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      errors.validation(res, 'Email and password are required');
      return;
    }

    const db = getDb();
    const rows = await (db as any).select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (rows.length === 0) {
      errors.unauthorized(res, 'Invalid email or password');
      return;
    }

    const user = rows[0];
    if (!verifyPassword(password, user.passwordHash)) {
      errors.unauthorized(res, 'Invalid email or password');
      return;
    }

    const tokens = generateTokenPair({ email: user.email, userId: user.userId });
    await storeRefreshToken(user.userId, tokens.refreshToken);

    success(res, {
      user: {
        id: user.userId,
        fullname: user.fullname,
        email: user.email,
        avatarId: user.avatarId,
        role: user.role,
      },
      ...tokens,
    }, 'Signed in successfully');
  } catch (err) {
    logger.error('Signin error', { error: (err as Error).message });
    errors.internal(res, 'Failed to sign in');
  }
}

export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const { refresh_token } = req.body || {};
    if (!refresh_token) {
      errors.validation(res, 'Refresh token is required');
      return;
    }

    const payload = verifyRefreshToken(refresh_token);
    if (!payload) {
      errors.unauthorized(res, 'Invalid or expired refresh token');
      return;
    }

    const isValid = await validateStoredToken(payload.userId, refresh_token);
    if (!isValid) {
      errors.unauthorized(res, 'Refresh token revoked');
      return;
    }

    await revokeToken(payload.userId, refresh_token);

    const tokens = generateTokenPair({ email: payload.email, userId: payload.userId });
    await storeRefreshToken(payload.userId, tokens.refreshToken);

    success(res, tokens, 'Token refreshed');
  } catch (err) {
    logger.error('Refresh token error', { error: (err as Error).message });
    errors.internal(res, 'Failed to refresh token');
  }
}

export async function signOut(req: Request, res: Response): Promise<void> {
  try {
    const { refresh_token } = req.body || {};
    if (refresh_token) {
      const payload = verifyRefreshToken(refresh_token);
      if (payload) {
        await revokeToken(payload.userId, refresh_token);
      }
    }

    success(res, null, 'Signed out successfully');
  } catch (err) {
    logger.error('Signout error', { error: (err as Error).message });
    errors.internal(res, 'Failed to sign out');
  }
}

async function storeRefreshToken(userId: number, token: string): Promise<void> {
  try {
    const db = getDb();
    const id = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await (db as any).insert(schema.userSessions).values({
      id,
      userId,
      refreshToken: token,
      expiresAt,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    logger.warn('Failed to store refresh token', { error: (err as Error).message });
  }
}

async function validateStoredToken(userId: number, token: string): Promise<boolean> {
  try {
    const db = getDb();
    const rows = await (db as any).select()
      .from(schema.userSessions)
      .where(and(
        eq(schema.userSessions.userId, userId),
        eq(schema.userSessions.refreshToken, token)
      ))
      .limit(1);

    if (rows.length === 0) return false;
    return new Date(rows[0].expiresAt) > new Date();
  } catch {
    return false;
  }
}

async function revokeToken(userId: number, token: string): Promise<void> {
  try {
    const db = getDb();
    await (db as any).delete(schema.userSessions)
      .where(and(
        eq(schema.userSessions.userId, userId),
        eq(schema.userSessions.refreshToken, token)
      ));
  } catch (err) {
    logger.warn('Failed to revoke token', { error: (err as Error).message });
  }
}
