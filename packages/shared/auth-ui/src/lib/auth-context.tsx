import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import type { LoginInput, User } from '@flowspace/models';

export const DEFAULT_USERS_API_URL = 'http://localhost:3300/api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
  usersApiUrl?: string;
}

export function AuthProvider({ children, usersApiUrl = DEFAULT_USERS_API_URL }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${usersApiUrl}/auth/me`, { credentials: 'include' });
      if (!response.ok) {
        setUser(null);
        return;
      }
      const currentUser = (await response.json()) as User;
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [usersApiUrl]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (input: LoginInput) => {
      const response = await fetch(`${usersApiUrl}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => undefined)) as { message?: string } | undefined;
        throw new Error(body?.message ?? 'Login failed');
      }
      const { user: loggedInUser } = (await response.json()) as { user: User };
      setUser(loggedInUser);
    },
    [usersApiUrl],
  );

  const logout = useCallback(async () => {
    await fetch(`${usersApiUrl}/auth/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
  }, [usersApiUrl]);

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
