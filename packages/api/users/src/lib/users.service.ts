import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
// eslint-disable-next-line
import { User, CreateUserInput } from '@org/models';

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
        email TEXT NOT NULL UNIQUE
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
        'INSERT INTO users (name, email) VALUES (?, ?)',
      );
      insert.run('Ada Lovelace', 'ada@example.com');
      insert.run('Grace Hopper', 'grace@example.com');
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
    const result = this.db
      .prepare('INSERT INTO users (name, email) VALUES (?, ?)')
      .run(input.name, input.email);

    return this.getUserById(Number(result.lastInsertRowid)) as User;
  }

  deleteUser(id: number): boolean {
    const result = this.db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return result.changes > 0;
  }
}
