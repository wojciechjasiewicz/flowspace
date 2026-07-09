import { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, Button, Empty, Input, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { Message, User } from '@flowspace/models';
import { useAuth } from '@flowspace/auth-ui';
import { findOrCreateDirectChannel, listMessages, sendMessage } from './chat-api';
import { listUsers } from './users-api';
import styles from './chat-panel.module.css';

const { Text, Title } = Typography;
const POLL_INTERVAL_MS = 3000;

export function ChatPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [channelId, setChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    listUsers().then((allUsers) => setUsers(allUsers.filter((u) => u.id !== user.id)));
  }, [user]);

  const refreshMessages = useCallback(async (id: string) => {
    setMessages(await listMessages(id));
  }, []);

  useEffect(() => {
    if (!channelId) return;
    refreshMessages(channelId);
    const interval = setInterval(() => refreshMessages(channelId), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [channelId, refreshMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectUser = async (target: User) => {
    setSelectedUser(target);
    setMessages([]);
    const channel = await findOrCreateDirectChannel(target.id);
    setChannelId(channel.id);
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!channelId || !text) return;
    setDraft('');
    await sendMessage(channelId, { text });
    refreshMessages(channelId);
  };

  const authorName = (authorId: string) =>
    authorId === user?.id ? 'You' : (users.find((u) => u.id === authorId)?.name ?? 'Unknown');

  return (
    <div className={styles.layout}>
      <div className={styles.sidebar}>
        {users.map((item) => (
          <div
            key={item.id}
            className={selectedUser?.id === item.id ? styles.activeUser : styles.userItem}
            onClick={() => handleSelectUser(item)}
          >
            <Avatar icon={<UserOutlined />} />
            <div className={styles.userInfo}>
              <Text strong>{item.name}</Text>
              <Text type="secondary" className={styles.userEmail}>
                {item.email}
              </Text>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.chat}>
        {!selectedUser && (
          <div className={styles.emptyState}>
            <Empty description="Select a user to start chatting" />
          </div>
        )}
        {selectedUser && (
          <>
            <div className={styles.chatHeader}>
              <Title level={5} style={{ margin: 0 }}>
                {selectedUser.name}
              </Title>
            </div>
            <div className={styles.messages}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.messageBubble} ${
                    message.authorId === user?.id ? styles.ownMessage : styles.otherMessage
                  }`}
                >
                  <Text className={styles.messageAuthor}>{authorName(message.authorId)}</Text>
                  <div>{message.text}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className={styles.composer}>
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onPressEnter={handleSend}
                placeholder={`Message ${selectedUser.name}`}
              />
              <Button type="primary" onClick={handleSend}>
                Send
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
