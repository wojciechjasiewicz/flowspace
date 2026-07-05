import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { RequireAuth } from './require-auth.js';
import * as authContext from './auth-context.js';

vi.mock('./auth-context.js', async () => {
  const actual = await vi.importActual<typeof authContext>('./auth-context.js');
  return { ...actual, useAuth: vi.fn() };
});

const useAuthMock = vi.mocked(authContext.useAuth);

function renderWithRouter() {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route
          path="/protected"
          element={
            <RequireAuth>
              <div>Secret content</div>
            </RequireAuth>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RequireAuth', () => {
  it('shows a spinner while the session is loading', () => {
    useAuthMock.mockReturnValue({ user: null, loading: true, login: vi.fn(), logout: vi.fn() });
    renderWithRouter();
    expect(screen.queryByText('Secret content')).toBeNull();
    expect(screen.queryByText('Login page')).toBeNull();
  });

  it('redirects to /login when there is no authenticated user', () => {
    useAuthMock.mockReturnValue({ user: null, loading: false, login: vi.fn(), logout: vi.fn() });
    renderWithRouter();
    expect(screen.getByText('Login page')).toBeTruthy();
  });

  it('renders children when a user is authenticated', () => {
    useAuthMock.mockReturnValue({
      user: { id: '1', email: 'a@b.com', name: 'A', role: 'member', createdAt: '' },
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
    renderWithRouter();
    expect(screen.getByText('Secret content')).toBeTruthy();
  });
});
