import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { TokenPayload, verifyToken } from './token.js';

declare module 'express' {
  interface Request {
    user?: TokenPayload;
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const header = request.headers['authorization'];
    const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;
    if (!token) throw new UnauthorizedException('Missing bearer token');

    const payload = verifyToken(token, process.env.AUTH_SECRET || 'dev-secret-change-me');
    if (!payload) throw new UnauthorizedException('Invalid or expired token');

    request.user = payload;
    return true;
  }
}
