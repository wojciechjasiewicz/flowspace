import { isAdmin } from './models.js';

describe('isAdmin', () => {
  it('returns true for admin role', () => {
    expect(isAdmin({ role: 'admin' })).toBe(true);
  });

  it('returns false for member role', () => {
    expect(isAdmin({ role: 'member' })).toBe(false);
  });
});
