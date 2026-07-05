import { Card, Layout, Typography } from 'antd';
import { Route, Routes, useLocation } from 'react-router-dom';
import { LoginPage, LogoutButton, RequireAuth } from '@flowspace/auth-ui';

const { Header, Content } = Layout;
const { Title } = Typography;

const apps = [
  { name: 'Task Manager', url: 'http://localhost:4201' },
  { name: 'Communicator', url: 'http://localhost:4202' },
];

function Home() {
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {apps.map((app) => (
        <Card key={app.name} title={app.name} style={{ width: 240 }}>
          <a href={app.url}>Open {app.name}</a>
        </Card>
      ))}
    </div>
  );
}

export function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <Layout>
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ color: '#fff', margin: 0 }}>
          Flowspace App Store
        </Title>
        {!isLoginPage && <LogoutButton />}
      </Header>
      <Content style={{ padding: 24 }}>
        <Routes>
          <Route path="/login" element={<LoginPage title="App Store" />} />
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
