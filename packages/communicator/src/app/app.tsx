import { Empty, Layout, Typography } from 'antd';
import { Route, Routes } from 'react-router-dom';

const { Header, Content } = Layout;
const { Title } = Typography;

function Home() {
  return <Empty description="Channels coming soon" />;
}

export function App() {
  return (
    <Layout>
      <Header>
        <Title level={3} style={{ color: '#fff', margin: 0, lineHeight: '64px' }}>
          Communicator
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
