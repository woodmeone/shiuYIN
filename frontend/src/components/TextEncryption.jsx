import { useState } from 'react';
import { Upload, Input, Button, message, Card, Image, Alert, Modal } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Dragger } = Upload;
const { TextArea } = Input;

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const TextEncryption = () => {
  const [carrierImage, setCarrierImage] = useState(null);
  const [text, setText] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [encryptedImageUrl, setEncryptedImageUrl] = useState(null);
  const [textLength, setTextLength] = useState(null); // 保存加密文本的字符数

  // 验证错误状态
  const [errors, setErrors] = useState({
    carrierImage: false,
    text: false,
    password: false,
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
      setCarrierImage(file);
      setErrors({ ...errors, carrierImage: false }); // 清除错误状态
      return false;
    },
    onRemove: () => {
      setCarrierImage(null);
    },
    fileList: carrierImage ? [carrierImage] : [],
    status: errors.carrierImage ? 'error' : undefined, // 添加错误状态
  };

  const handleEncrypt = async () => {
    // 重置错误状态
    const newErrors = {
      carrierImage: !carrierImage,
      text: !text.trim(),
      password: !password.trim(),
    };
    setErrors(newErrors);

    // 检查是否有错误
    if (newErrors.carrierImage || newErrors.text || newErrors.password) {
      message.error('请填写所有必填项');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('carrier_image', carrierImage);
    formData.append('text', text);
    formData.append('password', password);

    try {
      console.log('开始发送加密请求...');
      const response = await axios.post('/api/encrypt/text', formData, {
        responseType: 'blob',
        // axios 会自动为 FormData 设置正确的 Content-Type 和 boundary
      });

      console.log('加密请求成功，响应:', response);

      // 从响应头中获取文本的精确比特数
      const bitCount = response.headers['x-text-length'];
      if (bitCount) {
        setTextLength(parseInt(bitCount, 10));
      }

      // 创建预览URL
      const url = URL.createObjectURL(response.data);
      setEncryptedImageUrl(url);
      message.success('加密成功！');
    } catch (error) {
      console.error('加密失败，错误详情:', error);
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
            const detail = errorData.detail || '服务器内部错误';
            Modal.error({
              title: '加密失败',
              content: detail,
              okText: '确定',
            });
            console.error('服务器错误详情:', errorData);
          } catch {
            Modal.error({
              title: '加密失败',
              content: '服务器内部错误，请检查后端日志',
              okText: '确定',
            });
          }
        };
        if (error.response?.data) {
          reader.readAsText(error.response.data);
        } else {
          Modal.error({
            title: '加密失败',
            content: '服务器内部错误',
            okText: '确定',
          });
        }
        return; // 提前返回，避免下面再次弹窗
      } else {
        errorMessage = error.message || '未知错误';
      }

      Modal.error({
        title: '加密失败',
        content: errorMessage,
        okText: '确定',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!encryptedImageUrl) return;

    const link = document.createElement('a');
    link.href = encryptedImageUrl;
    link.download = `encrypted_text_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('下载成功！');
  };

  const handleReset = () => {
    setCarrierImage(null);
    setText('');
    setPassword('');
    setEncryptedImageUrl(null);
    setTextLength(null);
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card title="文字加密" style={{ marginBottom: 20 }}>
        <Dragger {...uploadProps} style={{ marginBottom: 20 }}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽载体图片到此区域</p>
          <p className="ant-upload-hint">支持 PNG、JPG 格式，文件大小不超过 50MB</p>
        </Dragger>

        <TextArea
          placeholder="请输入要加密的文字内容"
          rows={4}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setErrors({ ...errors, text: false }); // 清除错误状态
          }}
          status={errors.text ? 'error' : undefined}
          style={{ marginBottom: 20 }}
        />

        <Input.Password
          placeholder="请输入加密密码"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors({ ...errors, password: false }); // 清除错误状态
          }}
          status={errors.password ? 'error' : undefined}
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
          {textLength && (
            <Alert
              message="请记住比特数！"
              description={`您的文本需要 ${textLength} 比特存储，解密时请输入此数字。提示：英文约8比特/字符，中文约24比特/字符。建议使用1024x1024或更大的图片以提高准确率。`}
              type="info"
              showIcon
              style={{ marginBottom: 20 }}
            />
          )}
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

export default TextEncryption;
