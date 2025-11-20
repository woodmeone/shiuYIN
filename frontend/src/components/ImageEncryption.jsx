import { useState } from 'react';
import { Upload, Input, Button, message, Card, Image, Row, Col } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Dragger } = Upload;

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

const ImageEncryption = () => {
  const [carrierImage, setCarrierImage] = useState(null);
  const [watermarkImage, setWatermarkImage] = useState(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [encryptedImageUrl, setEncryptedImageUrl] = useState(null);

  const validateFileSize = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      message.error(`文件大小超过25MB限制（当前：${(file.size / 1024 / 1024).toFixed(2)}MB）`);
      return false;
    }
    return true;
  };

  const carrierUploadProps = {
    name: 'file',
    multiple: false,
    accept: 'image/png,image/jpeg,image/jpg',
    beforeUpload: (file) => {
      if (!validateFileSize(file)) {
        return Upload.LIST_IGNORE;
      }
      setCarrierImage(file);
      return false;
    },
    onRemove: () => {
      setCarrierImage(null);
    },
    fileList: carrierImage ? [carrierImage] : [],
  };

  const watermarkUploadProps = {
    name: 'file',
    multiple: false,
    accept: 'image/png,image/jpeg,image/jpg',
    beforeUpload: (file) => {
      if (!validateFileSize(file)) {
        return Upload.LIST_IGNORE;
      }
      setWatermarkImage(file);
      return false;
    },
    onRemove: () => {
      setWatermarkImage(null);
    },
    fileList: watermarkImage ? [watermarkImage] : [],
  };

  const handleEncrypt = async () => {
    if (!carrierImage) {
      message.error('请上传载体图片');
      return;
    }
    if (!watermarkImage) {
      message.error('请上传水印图片');
      return;
    }
    if (!password.trim()) {
      message.error('请输入密码');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('carrier_image', carrierImage);
    formData.append('watermark_image', watermarkImage);
    formData.append('password', password);

    try {
      const response = await axios.post('http://localhost:8000/api/encrypt/image', formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // 创建预览URL
      const url = URL.createObjectURL(response.data);
      setEncryptedImageUrl(url);
      message.success('加密成功！');
    } catch (error) {
      if (error.response?.status === 413) {
        message.error('文件大小超过25MB限制');
      } else {
        message.error(`加密失败：${error.response?.data?.detail || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!encryptedImageUrl) return;

    const link = document.createElement('a');
    link.href = encryptedImageUrl;
    link.download = `encrypted_image_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('下载成功！');
  };

  const handleReset = () => {
    setCarrierImage(null);
    setWatermarkImage(null);
    setPassword('');
    setEncryptedImageUrl(null);
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Card title="图片加密" style={{ marginBottom: 20 }}>
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={12}>
            <h4>载体图片</h4>
            <Dragger {...carrierUploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽载体图片</p>
              <p className="ant-upload-hint">支持 PNG、JPG，≤25MB</p>
            </Dragger>
          </Col>
          <Col span={12}>
            <h4>水印图片</h4>
            <Dragger {...watermarkUploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽水印图片</p>
              <p className="ant-upload-hint">支持 PNG、JPG，≤25MB</p>
            </Dragger>
          </Col>
        </Row>

        <Input.Password
          placeholder="请输入加密密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: 20 }}
        />

        <div style={{ display: 'flex', gap: 10 }}>
          <Button type="primary" onClick={handleEncrypt} loading={loading} style={{ flex: 1 }}>
            开始加密
          </Button>
          <Button onClick={handleReset} style={{ flex: 1 }}>
            重置
          </Button>
        </div>
      </Card>

      {encryptedImageUrl && (
        <Card title="加密结果" style={{ marginBottom: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <Image
              src={encryptedImageUrl}
              alt="加密后的图片"
              style={{ maxWidth: '100%', marginBottom: 20 }}
            />
            <Button type="primary" onClick={handleDownload} block>
              下载加密图片
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ImageEncryption;
