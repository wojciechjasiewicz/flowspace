import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ApiResponse } from '@org/models';
import styles from './app.module.css';
import { authHeaders, clearAuth } from './api';

const API_URL = 'http://localhost:3333/api';

export function App() {
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnauthorized = () => {
    clearAuth();
    navigateRef.current('/login');
  };

  const loadUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: authHeaders(),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const data = (await response.json()) as ApiResponse<User[]>;

      if (!data.success) {
        throw new Error(data.error || 'Failed to load users');
      }

      setUsers(data.data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'An error occurred while loading users';
      setError(message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadUsers(); }, []);

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
        }),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const data = (await response.json()) as ApiResponse<User>;

      if (!data.success) {
        throw new Error(data.error || 'Failed to create user');
      }

      setUsers((prev) => [...prev, data.data]);
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'An error occurred while creating the user';
      setError(message);
    }
  };

  const removeUser = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'An error occurred while deleting the user';
      setError(message);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>User Management</h1>
      </header>

      {error && <div className={styles.error}>{error}</div>}

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Add User</h2>
        <form className={styles.form} onSubmit={addUser}>
          <input
            className={styles.input}
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className={styles.button} type="submit">
            Add User
          </button>
        </form>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Users</h2>
        {loading ? (
          <p className={styles.empty}>Loading...</p>
        ) : users.length === 0 ? (
          <p className={styles.empty}>No users yet.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <button
                      className={styles.removeButton}
                      onClick={() => removeUser(user.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default App;
