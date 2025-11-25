# shiuYIN - 图片/文字加密解密工具

## 产品需求文档 (PRD)

**版本：** 1.0.0
**最后更新：** 2025-11-25

---

## 一、产品概述

### 1.1 产品定位
shiuYIN 是一款基于盲水印技术的图片加密解密工具，支持在图片中隐藏文字信息或水印图片，提供安全可靠的信息隐藏与提取功能。

### 1.2 核心价值
- 🔒 **安全加密**：使用盲水印技术进行不可见的信息隐藏
- 🖼️ **双模式支持**：支持文字和图片两种水印类型
- 🎯 **简单易用**：直观的拖拽式操作界面
- 🔑 **密码保护**：加密和解密需要密码验证

---

## 二、核心功能

### 2.1 文字加密
**功能描述：**
将文字信息作为隐藏水印嵌入到图片中，外观无明显变化。

**操作流程：**
1. 拖入或选择原始图片
2. 在输入框中输入要隐藏的文字内容
3. 设置加密密码
4. 点击加密按钮，生成带隐藏信息的图片
5. 下载加密后的图片

**技术要求：**
- 支持常见图片格式：PNG、JPG、JPEG
- 文字长度根据图片大小自动计算容量
- 加密过程不影响图片肉眼可见效果

### 2.2 图片加密
**功能描述：**
将一张图片作为水印嵌入到另一张图片中。

**操作流程：**
1. 拖入或选择原始图片（载体图片）
2. 拖入或选择水印图片
3. 设置加密密码
4. 点击加密按钮，生成带水印的图片
5. 下载加密后的图片

**技术要求：**
- 水印图片尺寸会自动调整以适应载体图片
- 支持多种图片格式组合
- 保持原图质量

### 2.3 解密功能
**功能描述：**
从加密图片中提取隐藏的文字或水印图片。

**操作流程：**
1. 拖入或选择加密后的图片
2. 输入加密时使用的密码
3. 点击解密按钮
4. 显示提取的文字或水印图片
5. 如果是图片水印，可以下载提取的图片

**技术要求：**
- 密码错误时给出明确提示
- 自动识别水印类型（文字或图片）
- 解密失败时提供错误信息

---

## 三、技术架构

### 3.1 技术选型

#### 前端技术栈
- **框架**：React 19.2.0
- **构建工具**：Vite 7.2.4
- **UI 组件库**：Ant Design 5.29.1
- **HTTP 客户端**：Axios 1.13.2

#### 后端技术栈
- **框架**：FastAPI 0.104.1
- **ASGI 服务器**：Uvicorn 0.24.0
- **核心库**：blind-watermark（盲水印算法）
- **图像处理**：Pillow、OpenCV、NumPy

### 3.2 系统架构
```
┌─────────────────┐
│   前端 (React)   │  Port: 6000
│   Vite Dev       │
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐
│  后端 (FastAPI)  │  Port: 6001
│   Uvicorn        │
└────────┬────────┘
         │
┌────────▼────────┐
│  blind-watermark │
│   核心加密算法    │
└─────────────────┘
```

### 3.3 端口配置
- **前端服务**：`http://localhost:6000`
- **后端 API**：`http://localhost:6001`
- **CORS 配置**：允许前端端口访问后端 API

---

## 四、API 接口设计

### 4.1 文字加密接口
```
POST /api/encrypt/text
Content-Type: multipart/form-data

Request:
- file: 原始图片文件
- text: 要隐藏的文字内容
- password: 加密密码

Response:
- 返回加密后的图片文件
- Content-Type: image/png 或 image/jpeg
```

### 4.2 图片加密接口
```
POST /api/encrypt/image
Content-Type: multipart/form-data

Request:
- image: 原始图片文件（载体）
- watermark: 水印图片文件
- password: 加密密码

Response:
- 返回加密后的图片文件
- Content-Type: image/png 或 image/jpeg
```

### 4.3 文字解密接口
```
POST /api/decrypt/text
Content-Type: multipart/form-data

Request:
- file: 加密后的图片文件
- password: 解密密码
- text_length: 文字长度（可选）

Response:
{
  "text": "解密出的文字内容",
  "success": true
}
```

### 4.4 图片解密接口
```
POST /api/decrypt/image
Content-Type: multipart/form-data

Request:
- file: 加密后的图片文件
- password: 解密密码
- watermark_width: 水印宽度
- watermark_height: 水印高度

Response:
- 返回提取的水印图片文件
- Content-Type: image/png
```

---

## 五、用户界面设计

### 5.1 主界面
- **Tab 切换**：文字加密 / 图片加密 / 解密
- **操作区域**：
  - 文件拖拽区域（支持点击选择）
  - 输入表单（文字/密码/参数）
  - 操作按钮（加密/解密）
- **结果展示区域**：
  - 成功提示
  - 下载按钮
  - 预览图（可选）

### 5.2 交互设计
- 文件拖拽上传，支持点击选择
- 实时表单验证
- 操作进度提示
- 成功/失败消息反馈
- 一键下载结果

---

## 六、非功能需求

### 6.1 性能要求
- 图片加密/解密响应时间 < 5 秒（1920x1080图片）
- 支持最大文件大小：50MB
- 前端页面加载时间 < 2 秒

### 6.2 安全要求
- 密码采用不可逆加密算法
- 文件上传大小限制
- 后端输入验证和过滤
- 跨域资源共享（CORS）正确配置

### 6.3 兼容性要求
- 浏览器兼容：Chrome、Firefox、Edge、Safari（最新版本）
- 操作系统：Windows、macOS、Linux
- 图片格式：PNG、JPG、JPEG

### 6.4 可用性要求
- 界面简洁直观，新用户无需培训即可使用
- 提供清晰的错误提示和操作指引
- 支持中文界面

---

## 七、项目部署

### 7.1 开发环境
- Node.js 16+ (前端)
- Python 3.8+ (后端)
- npm 或 yarn (包管理)

### 7.2 快速启动
```bash
# 使用启动脚本（Windows）
双击运行 启动.bat

# 或手动启动

# 1. 启动后端
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 6001 --reload

# 2. 启动前端
cd frontend
npm install
npm run dev
```

### 7.3 访问地址
- 前端：http://localhost:6000
- 后端 API：http://localhost:6001
- 后端文档：http://localhost:6001/docs

---

## 八、未来规划

### 8.1 功能增强
- [ ] 批量加密/解密
- [ ] 支持更多图片格式
- [ ] 加密强度可调节
- [ ] 历史记录管理
- [ ] 文件预览功能

### 8.2 技术优化
- [ ] 支持大文件分块上传
- [ ] WebSocket 实时进度推送
- [ ] 前端性能优化
- [ ] Docker 容器化部署
- [ ] CI/CD 自动化流程

### 8.3 产品形态
- [ ] 桌面应用（Electron）
- [ ] 移动端适配
- [ ] API 服务化
- [ ] 云端存储集成

---

## 九、参考资料

- [blind_watermark 官方文档](https://blindwatermark.github.io/blind_watermark/#/en/README)
- [blind_watermark GitHub](https://github.com/guofei9987/blind_watermark/)
- [FastAPI 官方文档](https://fastapi.tiangolo.com/)
- [React 官方文档](https://react.dev/)
- [Ant Design 组件库](https://ant.design/)

---

**文档维护：** 开发团队
**联系方式：** [待补充]
