import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { CreateTaskInput, Task, TaskStatus, UpdateTaskInput } from '@flowspace/models';
import { DatabaseService } from '../database.service.js';

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assignee_id: string | null;
  reporter_id: string | null;
  created_at: string;
  updated_at: string;
}

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    status: row.status,
    assigneeId: row.assignee_id ?? undefined,
    reporterId: row.reporter_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

@Injectable()
export class TasksService {
  constructor(private readonly database: DatabaseService) {}

  list(): Task[] {
    const rows = this.database.db.prepare('SELECT * FROM tasks ORDER BY created_at').all() as unknown as TaskRow[];
    return rows.map(toTask);
  }

  findById(id: string): Task {
    const row = this.database.db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow | undefined;
    if (!row) throw new NotFoundException('Task not found');
    return toTask(row);
  }

  create(input: CreateTaskInput & { reporterId: string }): Task {
    const now = new Date().toISOString();
    const task: TaskRow = {
      id: randomUUID(),
      title: input.title,
      description: input.description ?? null,
      status: 'todo',
      assignee_id: input.assigneeId ?? null,
      reporter_id: input.reporterId,
      created_at: now,
      updated_at: now,
    };

    this.database.db
      .prepare(
        'INSERT INTO tasks (id, title, description, status, assignee_id, reporter_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      )
      .run(
        task.id,
        task.title,
        task.description,
        task.status,
        task.assignee_id,
        task.reporter_id,
        task.created_at,
        task.updated_at,
      );

    return toTask(task);
  }

  update(id: string, input: UpdateTaskInput): Task {
    const existing = this.findById(id);
    const updated: Task = { ...existing, ...input, updatedAt: new Date().toISOString() };

    this.database.db
      .prepare(
        'UPDATE tasks SET title = ?, description = ?, status = ?, assignee_id = ?, updated_at = ? WHERE id = ?',
      )
      .run(
        updated.title,
        updated.description ?? null,
        updated.status,
        updated.assigneeId ?? null,
        updated.updatedAt,
        id,
      );

    return updated;
  }

  remove(id: string): void {
    this.findById(id);
    this.database.db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  }
}
