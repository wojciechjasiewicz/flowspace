import type { CreateTaskInput, Task, UpdateTaskInput } from '@flowspace/models';

export const DEFAULT_TASKS_API_URL = 'http://localhost:3301/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => undefined)) as { message?: string } | undefined;
    throw new Error(body?.message ?? 'Request failed');
  }
  return response.json() as Promise<T>;
}

export function listTasks(apiUrl = DEFAULT_TASKS_API_URL): Promise<Task[]> {
  return fetch(`${apiUrl}/tasks`, { credentials: 'include' }).then((res) => handleResponse<Task[]>(res));
}

export function createTask(input: CreateTaskInput, apiUrl = DEFAULT_TASKS_API_URL): Promise<Task> {
  return fetch(`${apiUrl}/tasks`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }).then((res) => handleResponse<Task>(res));
}

export function updateTask(id: string, input: UpdateTaskInput, apiUrl = DEFAULT_TASKS_API_URL): Promise<Task> {
  return fetch(`${apiUrl}/tasks/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }).then((res) => handleResponse<Task>(res));
}
