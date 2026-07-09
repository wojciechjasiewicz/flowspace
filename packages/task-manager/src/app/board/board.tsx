import { useCallback, useEffect, useState } from 'react';
import type { DragEvent } from 'react';
import { Button, Card, Empty, Form, Input, Modal, Select, Spin, Typography } from 'antd';
import type { Task, TaskStatus, User } from '@flowspace/models';
import { createTask, listTasks, updateTask } from './tasks-api';
import { listUsers } from './users-api';
import styles from './board.module.css';

const { Text } = Typography;

const COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: 'todo', title: 'To Do' },
  { status: 'in-progress', title: 'In Progress' },
  { status: 'done', title: 'Done' },
];

export function Board() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const userName = (userId?: string) => users.find((user) => user.id === userId)?.name;

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [nextTasks, nextUsers] = await Promise.all([listTasks(), listUsers()]);
      setTasks(nextTasks);
      setUsers(nextUsers);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleDrop = async (status: TaskStatus, taskId: string) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status } : task)));
    await updateTask(taskId, { status });
  };

  const handleAssigneeChange = async (taskId: string, assigneeId: string) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, assigneeId } : task)));
    await updateTask(taskId, { assigneeId });
  };

  const handleCreate = async () => {
    const values = await form.validateFields();
    await createTask({
      title: values.title,
      description: values.description || undefined,
      assigneeId: values.assigneeId || undefined,
    });
    form.resetFields();
    setIsModalOpen(false);
    refresh();
  };

  if (loading) return <Spin />;

  return (
    <div>
      <div className={styles.toolbar}>
        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          + Add task
        </Button>
      </div>
      <div className={styles.board}>
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.status);
          return (
            <div
              key={column.status}
              className={styles.column}
              onDragOver={(e: DragEvent<HTMLDivElement>) => e.preventDefault()}
              onDrop={(e: DragEvent<HTMLDivElement>) => {
                const taskId = e.dataTransfer.getData('text/plain');
                if (taskId) handleDrop(column.status, taskId);
              }}
            >
              <Text strong className={styles.columnTitle}>
                {column.title} ({columnTasks.length})
              </Text>
              {columnTasks.map((task) => (
                <Card
                  key={task.id}
                  size="small"
                  className={styles.card}
                  draggable
                  onDragStart={(e: DragEvent<HTMLDivElement>) => e.dataTransfer.setData('text/plain', task.id)}
                >
                  <Text>{task.title}</Text>
                  {task.description && (
                    <div>
                      <Text type="secondary">{task.description}</Text>
                    </div>
                  )}
                  <div className={styles.cardMeta}>
                    <Text type="secondary">Reporter: {userName(task.reporterId) ?? 'Unknown'}</Text>
                  </div>
                  <div className={styles.cardMeta}>
                    <Text type="secondary">Assignee:</Text>
                    <Select
                      size="small"
                      className={styles.assigneeSelect}
                      placeholder="Unassigned"
                      value={task.assigneeId}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(assigneeId) => handleAssigneeChange(task.id, assigneeId)}
                      options={users.map((user) => ({ value: user.id, label: user.name }))}
                    />
                  </div>
                </Card>
              ))}
              {columnTasks.length === 0 && <Empty description={false} image={Empty.PRESENTED_IMAGE_SIMPLE} />}
            </div>
          );
        })}
      </div>
      <Modal title="New task" open={isModalOpen} onOk={handleCreate} onCancel={() => setIsModalOpen(false)} okText="Create">
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Title is required' }]}>
            <Input autoFocus />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="assigneeId" label="Assignee">
            <Select
              allowClear
              placeholder="Unassigned"
              options={users.map((user) => ({ value: user.id, label: user.name }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
