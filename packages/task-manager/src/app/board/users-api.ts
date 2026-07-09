import type { User } from '@flowspace/models';

export const DEFAULT_USERS_API_URL = 'http://localhost:3300/api';

export function listUsers(apiUrl = DEFAULT_USERS_API_URL): Promise<User[]> {
  return fetch(`${apiUrl}/users`, { credentials: 'include' }).then((res) => {
    if (!res.ok) throw new Error('Failed to load users');
    return res.json() as Promise<User[]>;
  });
}
