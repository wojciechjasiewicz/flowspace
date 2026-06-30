import { createHmac, timingSafeEqual } from 'node:crypto';

const DEFAULT_SECRET = 'dev-secret-change-in-production';
const EXPIRES_IN_MS = 8 * 60 * 60 * 1000; // 8 hours

export interface TokenPayload {
  sub: number;
  email: string;
}

function b64url(input: string): string {
  return Buffer.from(input).toString('base64url');
}

function secret(): string {
  return process.env['AUTH_SECRET'] ?? DEFAULT_SECRET;
}

export function createToken(payload: TokenPayload): string {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64url(
    JSON.stringify({ ...payload, exp: Date.now() + EXPIRES_IN_MS }),
  );
  const sig = createHmac('sha256', secret())
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${sig}`;
}

export function verifyToken(token: string): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, body, sig] = parts;

  const expected = createHmac('sha256', secret())
    .update(`${header}.${body}`)
    .digest('base64url');

  const sigBuf = Buffer.from(sig, 'base64url');
  const expBuf = Buffer.from(expected, 'base64url');

  if (
    sigBuf.length !== expBuf.length ||
    !timingSafeEqual(sigBuf, expBuf)
  ) {
    return null;
  }

  const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as
    TokenPayload & { exp: number };

  if (Date.now() > payload.exp) return null;

  return { sub: payload.sub, email: payload.email };
}
