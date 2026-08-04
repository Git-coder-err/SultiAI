import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-12345';

function base64url(text: string): string {
  return Buffer.from(text).toString('base64url');
}

export interface JwtPayload {
  email: string;
  userId: number;
  id?: number;
  iat?: number;
  exp?: number;
}

export function signToken(payload: { email: string; userId: number }): string {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify({
    ...payload,
    iat: Date.now(),
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000,
  }));
  const signature = crypto.createHmac('sha256', JWT_SECRET)
    .update(header + '.' + body)
    .digest('base64url');
  return header + '.' + body + '.' + signature;
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const sig = crypto.createHmac('sha256', JWT_SECRET)
      .update(parts[0] + '.' + parts[1])
      .digest('base64url');
    if (sig !== parts[2]) return null;
    const data = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    if (data.exp < Date.now()) return null;
    return data as JwtPayload;
  } catch {
    return null;
  }
}
