import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  readonly db: DatabaseSync;

  constructor() {
    const dataDir = join(__dirname, '..', 'data');
    mkdirSync(dataDir, { recursive: true });
    this.db = new DatabaseSync(join(dataDir, 'chat.db'));
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS channels (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL,
        author_id TEXT NOT NULL,
        text TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
  }

  onModuleInit() {
    const { count } = this.db.prepare('SELECT COUNT(*) as count FROM channels').get() as { count: number };
    if (count === 0) {
      this.db
        .prepare('INSERT INTO channels (id, name, created_at) VALUES (?, ?, ?)')
        .run(randomUUID(), 'general', new Date().toISOString());
    }
  }

  onModuleDestroy() {
    this.db.close();
  }
}
