import { useCallback, useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Select, Table } from 'antd';
import { Navigate } from 'react-router-dom';
import { isAdmin, type User } from '@flowspace/models';
import { useAuth } from '@flowspace/auth-ui';
import { createUser, listUsers } from './users-api';

const columns = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'Role', dataIndex: 'role', key: 'role' },
  { title: 'Created', dataIndex: 'createdAt', key: 'createdAt' },
];

export function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setUsers(await listUsers());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin({ role: user?.role ?? 'member' })) refresh();
  }, [refresh, user]);

  if (!isAdmin({ role: user?.role ?? 'member' })) {
    return <Navigate to="/" replace />;
  }

  const handleCreate = async () => {
    const values = await form.validateFields();
    await createUser(values);
    form.resetFields();
    setIsModalOpen(false);
    refresh();
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          + Add user
        </Button>
      </div>
      <Table rowKey="id" columns={columns} dataSource={users} loading={loading} pagination={false} />
      <Modal title="New user" open={isModalOpen} onOk={handleCreate} onCancel={() => setIsModalOpen(false)} okText="Create">
        <Form form={form} layout="vertical" initialValues={{ role: 'member' }}>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
            <Input autoFocus />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'A valid email is required' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, min: 8, message: 'Password must be at least 8 characters' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'member', label: 'Member' },
                { value: 'admin', label: 'Admin' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
