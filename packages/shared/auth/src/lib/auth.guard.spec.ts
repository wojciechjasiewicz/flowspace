import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard.js';
import { createToken } from './token.js';

function contextWithHeader(header?: string): ExecutionContext {
  const request = { headers: { authorization: header } };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  const secret = 'guard-secret';
  const originalSecret = process.env.AUTH_SECRET;

  beforeAll(() => {
    process.env.AUTH_SECRET = secret;
  });

  afterAll(() => {
    process.env.AUTH_SECRET = originalSecret;
  });

  it('allows a request with a valid bearer token', () => {
    const guard = new AuthGuard();
    const token = createToken({ sub: '1', email: 'a@b.com', role: 'admin' }, secret);
    expect(guard.canActivate(contextWithHeader(`Bearer ${token}`))).toBe(true);
  });

  it('rejects a request with no authorization header', () => {
    const guard = new AuthGuard();
    expect(() => guard.canActivate(contextWithHeader(undefined))).toThrow(UnauthorizedException);
  });

  it('rejects a request with an invalid token', () => {
    const guard = new AuthGuard();
    expect(() => guard.canActivate(contextWithHeader('Bearer not-a-real-token'))).toThrow(UnauthorizedException);
  });
});
