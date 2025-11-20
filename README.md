# shiuYIN 加密工具

基于盲水印技术的图片加密解密可视化工具

## 技术栈

- **前端**: React 18 + Vite + Ant Design
- **后端**: FastAPI + Python
- **核心库**: blind-watermark (盲水印)

## 功能特性

### 1. 文字加密
- 上传载体图片（PNG/JPG）
- 输入要加密的文字内容
- 设置密码
- 生成加密后的图片并下载

### 2. 图片加密
- 上传载体图片（PNG/JPG）
- 上传水印图片（PNG/JPG）
- 设置密码
- 生成加密后的图片并下载

### 3. 安全特性
- 文件大小限制：25MB
- 密码使用SHA256哈希转换
- 支持PNG和JPG格式自动转换

## 快速开始

### 环境要求

- Python 3.8+
- Node.js 16+
- npm 或 yarn

### 安装步骤

#### 1. 安装后端依赖

```bash
cd backend
pip install -r requirements.txt
```

#### 2. 安装前端依赖

```bash
cd frontend
npm install
```

### 运行项目

#### 1. 启动后端服务

```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

后端服务将运行在：http://localhost:8000

#### 2. 启动前端服务

```bash
cd frontend
npm run dev
```

前端服务将运行在：http://localhost:5173

### 访问应用

在浏览器中打开：http://localhost:5173

## 项目结构

```
shiuYIN/
├── backend/              # 后端代码
│   ├── app/
│   │   ├── main.py      # FastAPI入口
│   │   ├── api/         # API路由
│   │   │   └── encrypt.py
│   │   ├── core/        # 核心配置
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   └── services/    # 业务逻辑
│   │       └── watermark.py
│   └── requirements.txt
├── frontend/            # 前端代码
│   ├── src/
│   │   ├── components/  # React组件
│   │   │   ├── TextEncryption.jsx
│   │   │   └── ImageEncryption.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md

## API文档

启动后端服务后，访问以下地址查看自动生成的API文档：

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 使用说明

### 文字加密流程

1. 切换到"文字加密"标签
2. 点击或拖拽上传载体图片
3. 在文本框中输入要加密的文字
4. 输入密码
5. 点击"开始加密"
6. 预览加密结果
7. 点击"下载加密图片"保存

### 图片加密流程

1. 切换到"图片加密"标签
2. 上传载体图片
3. 上传水印图片
4. 输入密码
5. 点击"开始加密"
6. 预览加密结果
7. 点击"下载加密图片"保存

## 注意事项

1. **文件大小限制**：单个文件不超过25MB
2. **图片格式**：建议使用PNG格式以获得最佳效果
3. **密码保管**：请妥善保管密码，解密时需要相同的密码
4. **安全性**：密码使用SHA256哈希，不会以明文形式存储或传输

## 后续计划

- [ ] 实现解密功能
- [ ] 添加批量加密功能
- [ ] Docker容器化部署
- [ ] 云服务器部署
- [ ] 用户认证系统
- [ ] 付费功能开发

## 开发者

Built with ❤️ for IU fans

## License

MIT
