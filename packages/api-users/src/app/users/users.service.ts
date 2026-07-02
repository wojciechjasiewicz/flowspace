import { ConflictException, Injectable, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { CreateUserInput, Role, User } from '@flowspace/models';
import { DatabaseService } from '../database.service.js';
import { hashPassword, verifyPassword } from './password.js';

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: Role;
  password_hash: string;
  created_at: string;
}

function toUser(row: UserRow): User {
  return { id: row.id, email: row.email, name: row.name, role: row.role, createdAt: row.created_at };
}

const SEED_USERS: CreateUserInput[] = [
  { email: 'ada@example.com', name: 'Ada Lovelace', password: 'password123', role: 'admin' },
  { email: 'grace@example.com', name: 'Grace Hopper', password: 'password123', role: 'member' },
];

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(private readonly database: DatabaseService) {}

  onModuleInit() {
    const { count } = this.database.db
      .prepare('SELECT COUNT(*) as count FROM users')
      .get() as { count: number };
    if (count === 0) {
      for (const seed of SEED_USERS) this.create(seed);
    }
  }

  list(): User[] {
    const rows = this.database.db.prepare('SELECT * FROM users ORDER BY created_at').all() as unknown as UserRow[];
    return rows.map(toUser);
  }

  findById(id: string): User | undefined {
    const row = this.database.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
    return row ? toUser(row) : undefined;
  }

  findByEmailWithPassword(email: string): (User & { passwordHash: string }) | undefined {
    const row = this.database.db.prepare('SELECT * FROM users WHERE email = ?').get(email) as
      | UserRow
      | undefined;
    if (!row) return undefined;
    return { ...toUser(row), passwordHash: row.password_hash };
  }

  create(input: CreateUserInput): User {
    if (this.database.db.prepare('SELECT 1 FROM users WHERE email = ?').get(input.email)) {
      throw new ConflictException('Email already registered');
    }

    const user: UserRow = {
      id: randomUUID(),
      email: input.email,
      name: input.name,
      role: input.role ?? 'member',
      password_hash: hashPassword(input.password),
      created_at: new Date().toISOString(),
    };

    this.database.db
      .prepare(
        'INSERT INTO users (id, email, name, role, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      )
      .run(user.id, user.email, user.name, user.role, user.password_hash, user.created_at);

    return toUser(user);
  }

  verifyPassword(password: string, passwordHash: string): boolean {
    return verifyPassword(password, passwordHash);
  }
}
