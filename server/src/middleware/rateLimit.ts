import { Request, Response, NextFunction } from 'express';
import { RATE_LIMITS } from '../config';
import { errors } from '../utils/apiResponse';

interface RateEntry {
  count: number;
  resetTime: number;
}

const stores: Map<string, RateEntry> = new Map();

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function checkLimit(
  req: Request,
  res: Response,
  next: NextFunction,
  key: string,
  windowMs: number,
  max: number
): void {
  const ip = getClientIp(req);
  const storeKey = `${key}:${ip}`;
  const now = Date.now();

  let entry = stores.get(storeKey);
  if (!entry || now >= entry.resetTime) {
    entry = { count: 0, resetTime: now + windowMs };
    stores.set(storeKey, entry);
  }

  entry.count++;

  res.setHeader('X-RateLimit-Limit', String(max));
  res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - entry.count)));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(entry.resetTime / 1000)));

  if (entry.count > max) {
    errors.rateLimited(res);
    return;
  }

  next();
}

export function globalRateLimit(req: Request, res: Response, next: NextFunction): void {
  checkLimit(req, res, next, 'global', RATE_LIMITS.GLOBAL.windowMs, RATE_LIMITS.GLOBAL.max);
}

export function authRateLimit(req: Request, res: Response, next: NextFunction): void {
  checkLimit(req, res, next, 'auth', RATE_LIMITS.AUTH.windowMs, RATE_LIMITS.AUTH.max);
}

export function aiRateLimit(req: Request, res: Response, next: NextFunction): void {
  checkLimit(req, res, next, 'ai', RATE_LIMITS.AI.windowMs, RATE_LIMITS.AI.max);
}

export function speechRateLimit(req: Request, res: Response, next: NextFunction): void {
  checkLimit(req, res, next, 'speech', RATE_LIMITS.SPEECH.windowMs, RATE_LIMITS.SPEECH.max);
}

export function communityRateLimit(req: Request, res: Response, next: NextFunction): void {
  checkLimit(req, res, next, 'community', RATE_LIMITS.COMMUNITY.windowMs, RATE_LIMITS.COMMUNITY.max);
}

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of stores.entries()) {
      if (now >= entry.resetTime) {
        stores.delete(key);
      }
    }
  }, 60 * 1000);
}
