import { useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

const initialUsers: User[] = [
  { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
  { id: 2, name: 'Grace Hopper', email: 'grace@example.com' },
];

export function App() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const addUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setUsers((prev) => [
      ...prev,
      { id: Date.now(), name: name.trim(), email: email.trim() },
    ]);
    setName('');
    setEmail('');
  };

  const removeUser = (id: number) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
  };

  return (
    <div>
      <h1>User Management</h1>

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
    </div>
  );
}

export default App;
