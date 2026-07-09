import { Button, Layout, Space, Typography } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Route, Routes, useLocation } from 'react-router-dom';
import { LoginPage, LogoutButton, RequireAuth } from '@flowspace/auth-ui';
import { Board } from './board/board';

const { Header, Content } = Layout;
const { Title } = Typography;

const APP_STORE_URL = 'http://localhost:4200';

export function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <Layout>
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ color: '#fff', margin: 0 }}>
          Task Manager
        </Title>
        {!isLoginPage && (
          <Space>
            <Button icon={<HomeOutlined />} onClick={() => (window.location.href = APP_STORE_URL)}>
              Home
            </Button>
            <LogoutButton />
          </Space>
        )}
      </Header>
      <Content style={{ padding: 24 }}>
        <Routes>
          <Route path="/login" element={<LoginPage title="Task Manager" />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <Board />
              </RequireAuth>
            }
          />
        </Routes>
      </Content>
    </Layout>
  );
}

export default App;
