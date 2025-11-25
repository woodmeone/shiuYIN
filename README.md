# shiuYIN 加密工具

基于盲水印技术的图片加密解密可视化工具

## 技术栈

- **前端**: React 19.2.0 + Vite 7.2.4 + Ant Design 5.29.1
- **后端**: FastAPI 0.104.1 + Python 3.8+
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

### 3. 解密功能
- 文字解密：提取图片中隐藏的文字
- 图片解密：提取图片中的水印图片
- 密码验证：需要正确的密码才能解密

### 4. 安全特性
- 文件大小限制：50MB
- 密码使用SHA256哈希转换
- 支持PNG和JPG格式自动转换
- CORS 跨域安全配置

## 快速开始

### 环境要求

- Python 3.8+
- Node.js 16+
- npm 或 yarn

### 方式一：一键启动（推荐）

**Windows 用户：**

直接双击运行项目根目录下的批处理脚本：

```bash
启动.bat
```

脚本会自动完成以下操作：
1. ✅ 检查 Node.js 和 Python 环境
2. ✅ 安装前后端依赖（如果需要）
3. ✅ 启动后端服务（端口 6001）
4. ✅ 启动前端服务（端口 6000）
5. ✅ 自动打开浏览器访问应用

停止服务时，双击运行：
```bash
停止.bat
```

### 方式二：手动启动

#### 1. 安装后端依赖

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

#### 2. 安装前端依赖

```bash
cd frontend
npm install
```

#### 3. 启动后端服务

```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 6001 --reload
```

后端服务将运行在：http://localhost:6001

#### 4. 启动前端服务

```bash
cd frontend
npm run dev
```

前端服务将运行在：http://localhost:6000

### 访问应用

在浏览器中打开：http://localhost:6000

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
│   ├── venv/            # Python虚拟环境
│   └── requirements.txt
├── frontend/            # 前端代码
│   ├── src/
│   │   ├── components/  # React组件
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js   # Vite配置
│   └── package.json
├── 启动.bat              # Windows启动脚本
├── 停止.bat              # Windows停止脚本
├── PRD.md               # 产品需求文档
└── README.md            # 项目说明文档

## 端口配置

- **前端服务**: http://localhost:6000
- **后端 API**: http://localhost:6001

## API文档

启动后端服务后，访问以下地址查看自动生成的API文档：

- Swagger UI: http://localhost:6001/docs
- ReDoc: http://localhost:6001/redoc

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

1. **文件大小限制**：单个文件不超过50MB
2. **图片格式**：建议使用PNG格式以获得最佳效果
3. **密码保管**：请妥善保管密码，解密时需要相同的密码
4. **安全性**：密码使用SHA256哈希，不会以明文形式存储或传输
5. **端口占用**：确保6000和6001端口未被其他程序占用

## 后续计划

- [x] 实现解密功能
- [ ] 添加批量加密功能
- [ ] Docker容器化部署
- [ ] 云服务器部署
- [ ] 用户认证系统
- [ ] 文件历史记录管理

## 开发者

Built with ❤️ for IU fans

## License

MIT
