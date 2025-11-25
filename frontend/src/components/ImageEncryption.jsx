import { useState } from 'react';
import { Upload, Input, Button, message, Card, Image, Row, Col, Alert, Modal } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Dragger } = Upload;

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ImageEncryption = () => {
  const [carrierImage, setCarrierImage] = useState(null);
  const [watermarkImage, setWatermarkImage] = useState(null);
  const [carrierPreview, setCarrierPreview] = useState(null);
  const [watermarkPreview, setWatermarkPreview] = useState(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [encryptedImageUrl, setEncryptedImageUrl] = useState(null);
  const [watermarkSize, setWatermarkSize] = useState(null); // 存储水印尺寸

  // 验证错误状态
  const [errors, setErrors] = useState({
    carrierImage: false,
    watermarkImage: false,
    password: false,
  });

  const validateFileSize = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      message.error(`文件大小超过50MB限制（当前：${(file.size / 1024 / 1024).toFixed(2)}MB）`);
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

      // 创建预览URL
      const previewUrl = URL.createObjectURL(file);
      setCarrierPreview(previewUrl);

      setErrors({ ...errors, carrierImage: false }); // 清除错误状态

      return false;
    },
    onRemove: () => {
      setCarrierImage(null);
      if (carrierPreview) {
        URL.revokeObjectURL(carrierPreview);
        setCarrierPreview(null);
      }
    },
    fileList: carrierImage ? [{
      uid: '-1',
      name: carrierImage.name,
      status: 'done',
      url: carrierPreview,
    }] : [],
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
    },
    listType: "picture",
    status: errors.carrierImage ? 'error' : undefined, // 添加错误状态
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

      // 创建预览URL
      const previewUrl = URL.createObjectURL(file);
      setWatermarkPreview(previewUrl);

      setErrors({ ...errors, watermarkImage: false }); // 清除错误状态

      return false;
    },
    onRemove: () => {
      setWatermarkImage(null);
      if (watermarkPreview) {
        URL.revokeObjectURL(watermarkPreview);
        setWatermarkPreview(null);
      }
    },
    fileList: watermarkImage ? [{
      uid: '-2',
      name: watermarkImage.name,
      status: 'done',
      url: watermarkPreview,
    }] : [],
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
    },
    listType: "picture",
    status: errors.watermarkImage ? 'error' : undefined, // 添加错误状态
  };

  const handleEncrypt = async () => {
    // 重置错误状态
    const newErrors = {
      carrierImage: !carrierImage,
      watermarkImage: !watermarkImage,
      password: !password.trim(),
    };
    setErrors(newErrors);

    // 检查是否有错误
    if (newErrors.carrierImage || newErrors.watermarkImage || newErrors.password) {
      message.error('请填写所有必填项');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('carrier_image', carrierImage);
    formData.append('watermark_image', watermarkImage);
    formData.append('password', password);

    try {
      console.log('开始发送图片加密请求...');
      const response = await axios.post('/api/encrypt/image', formData, {
        responseType: 'blob',
        // axios 会自动为 FormData 设置正确的 Content-Type 和 boundary
      });

      console.log('加密请求成功，响应:', response);

      // 从响应头中获取水印尺寸
      const width = response.headers['x-watermark-width'];
      const height = response.headers['x-watermark-height'];

      if (width && height) {
        setWatermarkSize({ width, height });
        console.log(`水印尺寸: ${width} x ${height}`);
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
            const errorMsg = errorData.detail || '服务器内部错误';

            // 检查是否是容量不足的错误
            if (errorMsg.includes('最多嵌入') || errorMsg.includes('信息量')) {
              Modal.error({
                title: '加密失败',
                content: '水印图片太大！请使用更小的水印图片（建议小于100KB）或更大的载体图片',
                okText: '确定',
              });
            } else {
              Modal.error({
                title: '加密失败',
                content: errorMsg,
                okText: '确定',
              });
            }
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
    link.download = `encrypted_image_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('下载成功！');
  };

  const handleReset = () => {
    // 清理预览URL以释放内存
    if (carrierPreview) {
      URL.revokeObjectURL(carrierPreview);
      setCarrierPreview(null);
    }
    if (watermarkPreview) {
      URL.revokeObjectURL(watermarkPreview);
      setWatermarkPreview(null);
    }
    if (encryptedImageUrl) {
      URL.revokeObjectURL(encryptedImageUrl);
    }

    setCarrierImage(null);
    setWatermarkImage(null);
    setPassword('');
    setEncryptedImageUrl(null);
    setWatermarkSize(null);
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
              <p className="ant-upload-hint">支持 PNG、JPG，≤50MB</p>
            </Dragger>
          </Col>
          <Col span={12}>
            <h4>水印图片</h4>
            <Dragger {...watermarkUploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽水印图片</p>
              <p className="ant-upload-hint">支持 PNG、JPG，≤50MB</p>
            </Dragger>
          </Col>
        </Row>

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
          {watermarkSize && (
            <Alert
              message="重要提示"
              description={
                <div>
                  <p style={{ marginBottom: 8 }}>
                    <strong>水印图片尺寸：{watermarkSize.width} × {watermarkSize.height}</strong>
                  </p>
                  <p style={{ marginBottom: 0 }}>
                    请妥善保存此尺寸信息，解密时需要使用！
                  </p>
                </div>
              }
              type="warning"
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

export default ImageEncryption;
