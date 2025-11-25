import { useState } from 'react';
import { Upload, Input, Button, message, Card, Image, InputNumber, Form, Space, Modal } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Dragger } = Upload;

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ImageDecryption = () => {
  const [encryptedImage, setEncryptedImage] = useState(null);
  const [password, setPassword] = useState('');
  const [watermarkWidth, setWatermarkWidth] = useState(128); // 水印宽度，默认128
  const [watermarkHeight, setWatermarkHeight] = useState(128); // 水印高度，默认128
  const [loading, setLoading] = useState(false);
  const [decryptedImageUrl, setDecryptedImageUrl] = useState(null);

  // 验证错误状态
  const [errors, setErrors] = useState({
    encryptedImage: false,
    password: false,
    watermarkWidth: false,
    watermarkHeight: false,
  });

  const validateFileSize = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      message.error(`文件大小超过50MB限制（当前：${(file.size / 1024 / 1024).toFixed(2)}MB）`);
      return false;
    }
    return true;
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: 'image/png,image/jpeg,image/jpg',
    beforeUpload: (file) => {
      if (!validateFileSize(file)) {
        return Upload.LIST_IGNORE;
      }
      setEncryptedImage(file);
      setErrors({ ...errors, encryptedImage: false }); // 清除错误状态
      return false;
    },
    onRemove: () => {
      setEncryptedImage(null);
    },
    fileList: encryptedImage ? [{
      uid: '-1',
      name: encryptedImage.name,
      status: 'done',
    }] : [],
    status: errors.encryptedImage ? 'error' : undefined, // 添加错误状态
  };

  const handleDecrypt = async () => {
    // 重置错误状态
    const newErrors = {
      encryptedImage: !encryptedImage,
      password: !password.trim(),
      watermarkWidth: !watermarkWidth || watermarkWidth <= 0,
      watermarkHeight: !watermarkHeight || watermarkHeight <= 0,
    };
    setErrors(newErrors);

    // 检查是否有错误
    if (newErrors.encryptedImage || newErrors.password || newErrors.watermarkWidth || newErrors.watermarkHeight) {
      message.error('请填写所有必填项');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('encrypted_image', encryptedImage);
    formData.append('password', password);
    formData.append('width', watermarkWidth);
    formData.append('height', watermarkHeight);

    try {
      console.log('开始发送解密请求...');
      const response = await axios.post('/api/encrypt/decrypt/image', formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('解密请求成功，响应:', response);

      // 创建预览URL
      const url = URL.createObjectURL(response.data);
      setDecryptedImageUrl(url);
      message.success('解密成功！');
    } catch (error) {
      console.error('解密失败，错误详情:', error);
      console.error('错误响应:', error.response);

      let errorMessage = '未知错误';

      if (error.response?.status === 413) {
        errorMessage = '文件大小超过50MB限制';
      } else if (error.response?.status === 500) {
        // 尝试读取错误详情
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            const detail = errorData.detail || '服务器内部错误，请检查密码是否正确';
            Modal.error({
              title: '解密失败',
              content: detail,
              okText: '确定',
            });
            console.error('服务器错误详情:', errorData);
          } catch {
            Modal.error({
              title: '解密失败',
              content: '服务器内部错误，请检查密码是否正确',
              okText: '确定',
            });
          }
        };
        if (error.response?.data) {
          reader.readAsText(error.response.data);
        } else {
          Modal.error({
            title: '解密失败',
            content: '服务器内部错误',
            okText: '确定',
          });
        }
        return; // 提前返回，避免下面再次弹窗
      } else {
        errorMessage = error.message || '未知错误';
      }

      Modal.error({
        title: '解密失败',
        content: errorMessage,
        okText: '确定',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!decryptedImageUrl) return;

    const link = document.createElement('a');
    link.href = decryptedImageUrl;
    link.download = `decrypted_watermark_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('下载成功！');
  };

  const handleReset = () => {
    setEncryptedImage(null);
    setPassword('');
    setWatermarkWidth(128);
    setWatermarkHeight(128);
    setDecryptedImageUrl(null);
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card title="图片解密" style={{ marginBottom: 20 }}>
        <Dragger {...uploadProps} style={{ marginBottom: 20 }}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽加密图片到此区域</p>
          <p className="ant-upload-hint">支持 PNG、JPG 格式，文件大小不超过 50MB</p>
        </Dragger>

        <Input.Password
          placeholder="请输入解密密码"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors({ ...errors, password: false }); // 清除错误状态
          }}
          status={errors.password ? 'error' : undefined}
          style={{ marginBottom: 20 }}
        />

        <Form layout="vertical" style={{ marginBottom: 20 }}>
          <div style={{
            padding: '16px',
            background: '#f5f5f5',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            <p style={{ marginBottom: '12px', color: '#666', fontSize: '14px' }}>
              请输入加密时保存的水印图片尺寸（在加密成功时显示）
            </p>
            <Space size="large">
              <Form.Item label="水印宽度" style={{ marginBottom: 0 }}>
                <InputNumber
                  min={1}
                  max={2000}
                  value={watermarkWidth}
                  onChange={(value) => {
                    setWatermarkWidth(value);
                    setErrors({ ...errors, watermarkWidth: false }); // 清除错误状态
                  }}
                  status={errors.watermarkWidth ? 'error' : undefined}
                  placeholder="宽度"
                  style={{ width: 120 }}
                />
              </Form.Item>
              <Form.Item label="水印高度" style={{ marginBottom: 0 }}>
                <InputNumber
                  min={1}
                  max={2000}
                  value={watermarkHeight}
                  onChange={(value) => {
                    setWatermarkHeight(value);
                    setErrors({ ...errors, watermarkHeight: false }); // 清除错误状态
                  }}
                  status={errors.watermarkHeight ? 'error' : undefined}
                  placeholder="高度"
                  style={{ width: 120 }}
                />
              </Form.Item>
            </Space>
          </div>
        </Form>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button type="primary" onClick={handleDecrypt} loading={loading} style={{ flex: 1 }}>
            开始解密
          </Button>
          <Button onClick={handleReset} style={{ flex: 1 }}>
            重置
          </Button>
        </div>
      </Card>

      {decryptedImageUrl && (
        <Card title="解密结果（提取的水印图片）" style={{ marginBottom: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <Image
              src={decryptedImageUrl}
              alt="提取的水印图片"
              style={{ maxWidth: '100%', marginBottom: 20 }}
            />
            <Button type="primary" onClick={handleDownload} block>
              下载水印图片
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ImageDecryption;
