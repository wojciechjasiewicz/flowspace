import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Channel, Message } from '@flowspace/models';
import { DatabaseService } from '../database.service.js';

interface ChannelRow {
  id: string;
  name: string;
  participant_a: string | null;
  participant_b: string | null;
  created_at: string;
}

interface MessageRow {
  id: string;
  channel_id: string;
  author_id: string;
  text: string;
  created_at: string;
}

function toChannel(row: ChannelRow): Channel {
  return { id: row.id, name: row.name, createdAt: row.created_at };
}

function toMessage(row: MessageRow): Message {
  return {
    id: row.id,
    channelId: row.channel_id,
    authorId: row.author_id,
    text: row.text,
    createdAt: row.created_at,
  };
}

@Injectable()
export class ChatService {
  constructor(private readonly database: DatabaseService) {}

  listChannels(): Channel[] {
    const rows = this.database.db.prepare('SELECT * FROM channels ORDER BY created_at').all() as unknown as ChannelRow[];
    return rows.map(toChannel);
  }

  findOrCreateDirectChannel(userId: string, otherUserId: string): Channel {
    const [participantA, participantB] = [userId, otherUserId].sort();

    const existing = this.database.db
      .prepare('SELECT * FROM channels WHERE participant_a = ? AND participant_b = ?')
      .get(participantA, participantB) as ChannelRow | undefined;
    if (existing) return toChannel(existing);

    const channel: ChannelRow = {
      id: randomUUID(),
      name: `dm:${participantA}:${participantB}`,
      participant_a: participantA,
      participant_b: participantB,
      created_at: new Date().toISOString(),
    };

    this.database.db
      .prepare(
        'INSERT INTO channels (id, name, participant_a, participant_b, created_at) VALUES (?, ?, ?, ?, ?)',
      )
      .run(channel.id, channel.name, channel.participant_a, channel.participant_b, channel.created_at);

    return toChannel(channel);
  }

  private assertChannelExists(channelId: string): void {
    const channel = this.database.db.prepare('SELECT 1 FROM channels WHERE id = ?').get(channelId);
    if (!channel) throw new NotFoundException('Channel not found');
  }

  listMessages(channelId: string): Message[] {
    this.assertChannelExists(channelId);
    const rows = this.database.db
      .prepare('SELECT * FROM messages WHERE channel_id = ? ORDER BY created_at')
      .all(channelId) as unknown as MessageRow[];
    return rows.map(toMessage);
  }

  createMessage(channelId: string, authorId: string, text: string): Message {
    this.assertChannelExists(channelId);
    const message: MessageRow = {
      id: randomUUID(),
      channel_id: channelId,
      author_id: authorId,
      text,
      created_at: new Date().toISOString(),
    };

    this.database.db
      .prepare('INSERT INTO messages (id, channel_id, author_id, text, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(message.id, message.channel_id, message.author_id, message.text, message.created_at);

    return toMessage(message);
  }
}
