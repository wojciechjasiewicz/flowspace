import * as React from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { LoginPage } from './login';
import { ProtectedRoute } from './protected-route';
import { clearToken, isAuthenticated } from './auth';
import styles from './app.module.css';

const Users = React.lazy(() => import('users/Module'));

function Nav() {
  const navigate = useNavigate();
  const authed = isAuthenticated();

  const logout = () => {
    clearToken();
    navigate('/login');
  };

  return (
    <nav className={styles.nav}>
      <Link className={styles.brand} to="/">Flowspace</Link>
      <ul className={styles.links}>
        {authed && (
          <li><Link to="/users">Users</Link></li>
        )}
      </ul>
      {authed && (
        <button className={styles.logoutBtn} onClick={logout}>Sign out</button>
      )}
    </nav>
  );
}

export function App() {
  return (
    <React.Suspense fallback={null}>
      <Nav />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<ProtectedRoute><Users /></ProtectedRoute>} />
      </Routes>
    </React.Suspense>
  );
}

export default App;
