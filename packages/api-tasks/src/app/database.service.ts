import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  readonly db: DatabaseSync;

  constructor() {
    const dataDir = join(__dirname, '..', 'data');
    mkdirSync(dataDir, { recursive: true });
    this.db = new DatabaseSync(join(dataDir, 'tasks.db'));
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        assignee_id TEXT,
        reporter_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    const columns = this.db.prepare('PRAGMA table_info(tasks)').all() as { name: string }[];
    if (!columns.some((column) => column.name === 'reporter_id')) {
      this.db.exec('ALTER TABLE tasks ADD COLUMN reporter_id TEXT');
    }
  }

  onModuleDestroy() {
    this.db.close();
  }
}
