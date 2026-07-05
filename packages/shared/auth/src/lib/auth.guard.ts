import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AUTH_COOKIE_NAME } from './cookie.js';
import { TokenPayload, verifyToken } from './token.js';

declare module 'express' {
  interface Request {
    user?: TokenPayload;
  }
}

function extractToken(request: Request): string | undefined {
  const cookieToken = request.cookies?.[AUTH_COOKIE_NAME];
  if (cookieToken) return cookieToken;

  const header = request.headers['authorization'];
  return header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;
}

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = extractToken(request);
    if (!token) throw new UnauthorizedException('Missing auth token');

    const payload = verifyToken(token, process.env.AUTH_SECRET || 'dev-secret-change-me');
    if (!payload) throw new UnauthorizedException('Invalid or expired token');

    request.user = payload;
    return true;
  }
}
