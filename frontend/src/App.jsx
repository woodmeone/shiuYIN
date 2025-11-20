import { Tabs } from 'antd';
import TextEncryption from './components/TextEncryption';
import ImageEncryption from './components/ImageEncryption';
import './App.css';

const { TabPane } = Tabs;

function App() {
  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: '#f0f2f5',
      padding: '40px 20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1890ff', margin: 0 }}>
            shiuYIN 加密工具
          </h1>
          <p style={{ fontSize: '1rem', color: '#666', marginTop: 10 }}>
            基于盲水印技术的图片加密解密工具
          </p>
        </div>

        <Tabs defaultActiveKey="1" centered size="large">
          <TabPane tab="文字加密" key="1">
            <TextEncryption />
          </TabPane>
          <TabPane tab="图片加密" key="2">
            <ImageEncryption />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
