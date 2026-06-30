const TOKEN_KEY = 'authToken';

export function authHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
}
