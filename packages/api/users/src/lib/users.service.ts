import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
// eslint-disable-next-line
import { User, CreateUserInput } from '@org/models';
import { hashPassword, verifyPassword } from './password.util.js';

export class UsersService {
  private db: DatabaseSync;

  constructor(dbPath = ':memory:') {
    if (dbPath !== ':memory:') {
      mkdirSync(dirname(dbPath), { recursive: true });
    }
    this.db = new DatabaseSync(dbPath);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL
      )
    `);
    this.seed();
  }

  private seed(): void {
    const { count } = this.db
      .prepare('SELECT COUNT(*) as count FROM users')
      .get() as unknown as { count: number };

    if (count === 0) {
      const insert = this.db.prepare(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      );
      insert.run('Ada Lovelace', 'ada@example.com', hashPassword('password123'));
      insert.run('Grace Hopper', 'grace@example.com', hashPassword('password123'));
    }
  }

  getUsers(): User[] {
    return this.db
      .prepare('SELECT id, name, email FROM users')
      .all() as unknown as User[];
  }

  getUserById(id: number): User | undefined {
    return this.db
      .prepare('SELECT id, name, email FROM users WHERE id = ?')
      .get(id) as unknown as User | undefined;
  }

  createUser(input: CreateUserInput): User {
    const passwordHash = hashPassword(input.password);
    const result = this.db
      .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
      .run(input.name, input.email, passwordHash);

    return this.getUserById(Number(result.lastInsertRowid)) as User;
  }

  verifyCredentials(email: string, password: string): User | null {
    const row = this.db
      .prepare('SELECT id, name, email, password_hash FROM users WHERE email = ?')
      .get(email) as unknown as (User & { password_hash: string }) | undefined;

    if (!row || !verifyPassword(password, row.password_hash)) return null;

    return { id: row.id, name: row.name, email: row.email };
  }

  deleteUser(id: number): boolean {
    const result = this.db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return result.changes > 0;
  }
}
