import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Form, Input } from 'antd';
import type { LoginInput } from '@flowspace/models';
import { useAuth } from './auth-context.js';

export interface LoginPageProps {
  title: string;
  redirectTo?: string;
}

export function LoginPage({ title, redirectTo = '/' }: LoginPageProps) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values: LoginInput) {
    setError(null);
    setSubmitting(true);
    try {
      await login(values);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 96 }}>
      <Card title={title} style={{ width: 360 }}>
        {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}
        <Form<LoginInput> layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input autoComplete="email" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} block>
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
