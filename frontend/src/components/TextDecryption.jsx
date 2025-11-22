import { useState } from 'react';
import { Upload, Input, Button, message, Card, InputNumber, Tooltip, Alert } from 'antd';
import { InboxOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Dragger } = Upload;
const { TextArea } = Input;

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

const TextDecryption = () => {
  const [encryptedImage, setEncryptedImage] = useState(null);
  const [password, setPassword] = useState('');
  const [textBits, setTextBits] = useState(400); // 预期文本的比特数，默认400
  const [loading, setLoading] = useState(false);
  const [decryptedText, setDecryptedText] = useState('');

  const validateFileSize = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      message.error(`文件大小超过25MB限制（当前：${(file.size / 1024 / 1024).toFixed(2)}MB）`);
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
      return false;
    },
    onRemove: () => {
      setEncryptedImage(null);
    },
    fileList: encryptedImage ? [encryptedImage] : [],
  };

  const handleDecrypt = async () => {
    if (!encryptedImage) {
      message.error('请上传加密图片');
      return;
    }
    if (!password.trim()) {
      message.error('请输入密码');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('encrypted_image', encryptedImage);
    formData.append('password', password);
    formData.append('text_bits', textBits); // 添加预期文本的比特数参数

    try {
      console.log('开始发送解密请求...', { textBits });
      const response = await axios.post('http://localhost:8901/api/encrypt/decrypt/text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('解密请求成功，响应:', response);

      if (response.data.success) {
        setDecryptedText(response.data.content);
        message.success('解密成功！');
      } else {
        message.error('解密失败，请检查密码是否正确');
      }
    } catch (error) {
      console.error('解密失败，错误详情:', error);
      console.error('错误响应:', error.response);

      if (error.response?.status === 413) {
        message.error('文件大小超过25MB限制');
      } else if (error.response?.status === 500) {
        message.error(`解密失败：${error.response?.data?.detail || '服务器内部错误，请检查密码是否正确'}`);
      } else {
        message.error(`解密失败：${error.message || '未知错误'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!decryptedText) return;

    navigator.clipboard.writeText(decryptedText);
    message.success('已复制到剪贴板！');
  };

  const handleReset = () => {
    setEncryptedImage(null);
    setPassword('');
    setTextBits(400);
    setDecryptedText('');
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card title="文字解密" style={{ marginBottom: 20 }}>
        <Dragger {...uploadProps} style={{ marginBottom: 20 }}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽加密图片到此区域</p>
          <p className="ant-upload-hint">支持 PNG、JPG 格式，文件大小不超过 25MB</p>
        </Dragger>

        <Input.Password
          placeholder="请输入解密密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: 20 }}
        />

        <div style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>文本比特数：</span>
            <Tooltip title="输入加密时显示的比特数。这是解密所必需的精确值。">
              <QuestionCircleOutlined style={{ color: '#1890ff', cursor: 'help' }} />
            </Tooltip>
          </div>
          <InputNumber
            min={1}
            max={5000}
            value={textBits}
            onChange={(value) => setTextBits(value)}
            style={{ width: '100%' }}
            placeholder="例如：71（默认400）"
          />
          <Alert
            message="重要提示"
            description="请输入加密后提示的精确比特数。使用精确值可以获得最佳解密效果。如图片较小或文本较长，可能会出现少量解密错误。"
            type="warning"
            showIcon
            style={{ marginTop: 10 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button type="primary" onClick={handleDecrypt} loading={loading} style={{ flex: 1 }}>
            开始解密
          </Button>
          <Button onClick={handleReset} style={{ flex: 1 }}>
            重置
          </Button>
        </div>
      </Card>

      {decryptedText && (
        <Card title="解密结果" style={{ marginBottom: 20 }}>
          <TextArea
            value={decryptedText}
            rows={6}
            readOnly
            style={{ marginBottom: 20, backgroundColor: '#f5f5f5' }}
          />
          <Button type="primary" onClick={handleCopy} block>
            复制文字
          </Button>
        </Card>
      )}
    </div>
  );
};

export default TextDecryption;
