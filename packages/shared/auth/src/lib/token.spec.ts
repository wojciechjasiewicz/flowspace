import { createToken, verifyToken } from './token.js';

describe('token', () => {
  const secret = 'test-secret';
  const payload = { sub: '1', email: 'ada@example.com', role: 'admin' };

  it('round-trips a valid token', () => {
    const token = createToken(payload, secret);
    const result = verifyToken(token, secret);
    expect(result).toMatchObject(payload);
  });

  it('rejects a token signed with a different secret', () => {
    const token = createToken(payload, secret);
    expect(verifyToken(token, 'wrong-secret')).toBeNull();
  });

  it('rejects an expired token', () => {
    const token = createToken(payload, secret, -1);
    expect(verifyToken(token, secret)).toBeNull();
  });

  it('rejects a malformed token', () => {
    expect(verifyToken('not-a-token', secret)).toBeNull();
  });
});
