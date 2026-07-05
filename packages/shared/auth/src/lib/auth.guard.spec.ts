import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard.js';
import { AUTH_COOKIE_NAME } from './cookie.js';
import { createToken } from './token.js';

function contextWithRequest(request: {
  headers?: { authorization?: string };
  cookies?: Record<string, string>;
}): ExecutionContext {
  const fullRequest = { headers: {}, cookies: {}, ...request };
  return {
    switchToHttp: () => ({ getRequest: () => fullRequest }),
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
    expect(guard.canActivate(contextWithRequest({ headers: { authorization: `Bearer ${token}` } }))).toBe(true);
  });

  it('allows a request with a valid session cookie', () => {
    const guard = new AuthGuard();
    const token = createToken({ sub: '1', email: 'a@b.com', role: 'admin' }, secret);
    expect(guard.canActivate(contextWithRequest({ cookies: { [AUTH_COOKIE_NAME]: token } }))).toBe(true);
  });

  it('prefers the cookie over the header when both are present', () => {
    const guard = new AuthGuard();
    const validToken = createToken({ sub: '1', email: 'a@b.com', role: 'admin' }, secret);
    expect(
      guard.canActivate(
        contextWithRequest({
          headers: { authorization: 'Bearer not-a-real-token' },
          cookies: { [AUTH_COOKIE_NAME]: validToken },
        }),
      ),
    ).toBe(true);
  });

  it('rejects a request with no token at all', () => {
    const guard = new AuthGuard();
    expect(() => guard.canActivate(contextWithRequest({}))).toThrow(UnauthorizedException);
  });

  it('rejects a request with an invalid token', () => {
    const guard = new AuthGuard();
    expect(() =>
      guard.canActivate(contextWithRequest({ headers: { authorization: 'Bearer not-a-real-token' } })),
    ).toThrow(UnauthorizedException);
  });
});
