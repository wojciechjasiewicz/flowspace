import { useCallback, useEffect, useState } from 'react';
import type { DragEvent } from 'react';
import { Button, Card, Empty, Form, Input, Modal, Spin, Typography } from 'antd';
import type { Task, TaskStatus } from '@flowspace/models';
import { createTask, listTasks, updateTask } from './tasks-api';
import styles from './board.module.css';

const { Text } = Typography;

const COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: 'todo', title: 'To Do' },
  { status: 'in-progress', title: 'In Progress' },
  { status: 'done', title: 'Done' },
];

export function Board() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setTasks(await listTasks());
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

  const handleCreate = async () => {
    const values = await form.validateFields();
    await createTask({ title: values.title, description: values.description || undefined });
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
        </Form>
      </Modal>
    </div>
  );
}
