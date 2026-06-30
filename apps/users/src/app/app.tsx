import { useState, useEffect } from 'react';
import { User, ApiResponse } from '@org/models';

const API_URL = 'http://localhost:3333/api';

export function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/users`);
      const data = (await response.json()) as ApiResponse<User[]>;

      if (!data.success) {
        throw new Error(data.error || 'Failed to load users');
      }

      setUsers(data.data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'An error occurred while loading users';
      setError(message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const data = (await response.json()) as ApiResponse<User>;

      if (!data.success) {
        throw new Error(data.error || 'Failed to create user');
      }

      setUsers((prev) => [...prev, data.data]);
      setName('');
      setEmail('');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'An error occurred while creating the user';
      setError(message);
    }
  };

  const removeUser = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'An error occurred while deleting the user';
      setError(message);
    }
  };

  return (
    <div>
      <h1>User Management</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={addUser}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Add User</button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
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
                  <button onClick={() => removeUser(user.id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
