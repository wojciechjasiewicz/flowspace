import type { CreateUserInput, User } from '@flowspace/models';

export const DEFAULT_USERS_API_URL = 'http://localhost:3300/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => undefined)) as { message?: string } | undefined;
    throw new Error(body?.message ?? 'Request failed');
  }
  return response.json() as Promise<T>;
}

export function listUsers(apiUrl = DEFAULT_USERS_API_URL): Promise<User[]> {
  return fetch(`${apiUrl}/users`, { credentials: 'include' }).then((res) => handleResponse<User[]>(res));
}

export function createUser(input: CreateUserInput, apiUrl = DEFAULT_USERS_API_URL): Promise<User> {
  return fetch(`${apiUrl}/users`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }).then((res) => handleResponse<User>(res));
}
