import type { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

vi.mock('@flowspace/auth-ui', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => children,
  RequireAuth: ({ children }: { children: ReactNode }) => children,
  LoginPage: ({ title }: { title: string }) => <div>Login to {title}</div>,
  LogoutButton: () => <button>Log out</button>,
}));

import App from './app';

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );
    expect(baseElement).toBeTruthy();
  });

  it('should have the app title', () => {
    const { getByText } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );
    expect(getByText('Communicator')).toBeTruthy();
  });
});
