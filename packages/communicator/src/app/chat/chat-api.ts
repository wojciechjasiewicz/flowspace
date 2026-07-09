import type { Channel, CreateMessageInput, Message } from '@flowspace/models';

export const DEFAULT_CHAT_API_URL = 'http://localhost:3302/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => undefined)) as { message?: string } | undefined;
    throw new Error(body?.message ?? 'Request failed');
  }
  return response.json() as Promise<T>;
}

export function findOrCreateDirectChannel(otherUserId: string, apiUrl = DEFAULT_CHAT_API_URL): Promise<Channel> {
  return fetch(`${apiUrl}/channels/dm/${otherUserId}`, {
    method: 'POST',
    credentials: 'include',
  }).then((res) => handleResponse<Channel>(res));
}

export function listMessages(channelId: string, apiUrl = DEFAULT_CHAT_API_URL): Promise<Message[]> {
  return fetch(`${apiUrl}/channels/${channelId}/messages`, { credentials: 'include' }).then((res) =>
    handleResponse<Message[]>(res),
  );
}

export function sendMessage(
  channelId: string,
  input: CreateMessageInput,
  apiUrl = DEFAULT_CHAT_API_URL,
): Promise<Message> {
  return fetch(`${apiUrl}/channels/${channelId}/messages`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }).then((res) => handleResponse<Message>(res));
}
