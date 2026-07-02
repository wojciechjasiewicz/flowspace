import { Card, Layout, Typography } from 'antd';
import { Route, Routes } from 'react-router-dom';

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
  return (
    <Layout>
      <Header>
        <Title level={3} style={{ color: '#fff', margin: 0, lineHeight: '64px' }}>
          Flowspace App Store
        </Title>
      </Header>
      <Content style={{ padding: 24 }}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Content>
    </Layout>
  );
}

export default App;
