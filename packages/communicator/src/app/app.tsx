import { Empty, Layout, Typography } from 'antd';
import { Route, Routes, useLocation } from 'react-router-dom';
import { LoginPage, LogoutButton, RequireAuth } from '@flowspace/auth-ui';

const { Header, Content } = Layout;
const { Title } = Typography;

function Home() {
  return <Empty description="Channels coming soon" />;
}

export function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <Layout>
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ color: '#fff', margin: 0 }}>
          Communicator
        </Title>
        {!isLoginPage && <LogoutButton />}
      </Header>
      <Content style={{ padding: 24 }}>
        <Routes>
          <Route path="/login" element={<LoginPage title="Communicator" />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <Home />
              </RequireAuth>
            }
          />
        </Routes>
      </Content>
    </Layout>
  );
}

export default App;
