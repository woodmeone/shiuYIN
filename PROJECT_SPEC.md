# 图片隐水印加密解密可视化工具 - 项目需求文档

## 📋 项目概述

### 项目名称
**shiuYIN** - 图片隐水印加密解密可视化工具

### 项目目标
开发一款基于盲水印技术的图片加密工具，支持文字和图片的隐藏式加密，并通过Web界面提供用户友好的可视化操作体验。

### 核心价值主张
- **隐蔽性**：使用盲水印技术，加密后图片肉眼无法察觉差异
- **安全性**：密码保护的加密方式，确保信息安全
- **易用性**：拖拽式操作，直观的可视化界面
- **灵活性**：支持文字和图片两种水印类型

---

## 🏗️ 技术架构

### 技术栈选型

#### 后端
- **框架**：FastAPI
  - 现代化Python Web框架
  - 高性能异步支持
  - 自动生成API文档（Swagger UI）
  - 类型提示和数据验证
- **核心库**：blind_watermark
  - 盲水印加密解密核心引擎
  - 支持文字和图片水印
- **Python版本**：Python 3.13.6

#### 前端
- **框架**：React 18+
- **UI组件库**：Ant Design / Material-UI（推荐Ant Design）
- **文件上传**：react-dropzone（拖拽上传）
- **HTTP客户端**：axios
- **Node.js版本**：v22.18.0

#### 部署架构
```
阶段1：本地MVP开发
  ├── 后端：localhost:8000 (FastAPI)
  └── 前端：localhost:3000 (React Dev Server)

阶段2：Docker容器化
  ├── backend容器 (Python + FastAPI)
  ├── frontend容器 (Nginx + React构建产物)
  └── docker-compose编排

阶段3：云服务器商业化
  ├── Docker部署到云服务器
  ├── 域名绑定
  ├── HTTPS证书
  └── 后续扩展付费功能
```

---

## 🎯 功能模块详细说明

### 1. 文字加密模块

#### 功能描述
将用户输入的文字通过盲水印技术隐藏到图片中。

#### 操作流程
1. 用户拖拽/选择载体图片（PNG/JPG，≤25MB）
2. 在文本框输入需要加密的文字
3. 输入密码（字符串）
4. 点击"加密"按钮
5. 显示加密后的图片预览
6. 提供下载按钮

#### 技术实现
- **前端**：
  - 拖拽区域组件（react-dropzone）
  - 文本输入框（支持多行）
  - 密码输入框（type="password"）
  - 图片预览组件
- **后端API**：`POST /api/encrypt/text`
  - 接收：图片文件 + 文字内容 + 密码
  - 处理：使用blind_watermark嵌入文字水印
  - 返回：加密后的图片（Base64或文件流）

#### 约束条件
- 文件大小限制：25MB
- 图片格式：PNG、JPG
- 文字长度限制：取决于载体图片大小（自动计算）

---

### 2. 图片加密模块

#### 功能描述
将水印图片隐藏到载体图片中。

#### 操作流程
1. 用户拖拽/选择载体图片（≤25MB）
2. 拖拽/选择水印图片（≤25MB）
3. 输入密码（字符串）
4. 点击"加密"按钮
5. 显示加密后的图片预览
6. 提供下载按钮

#### 技术实现
- **前端**：
  - 两个拖拽区域（载体图片 + 水印图片）
  - 双图预览显示
  - 密码输入框
- **后端API**：`POST /api/encrypt/image`
  - 接收：载体图片 + 水印图片 + 密码
  - 处理：使用blind_watermark嵌入图片水印
  - 返回：加密后的图片

#### 约束条件
- 载体图片应大于水印图片
- 推荐载体图片至少为水印图片的4倍大小
- 水印图片建议使用PNG格式（保留透明度）

---

### 3. 解密模块

#### 功能描述
从加密图片中提取隐藏的文字或水印图片。

#### 操作流程
1. 用户拖拽/选择加密后的图片
2. 输入密码（字符串）
3. 选择解密类型（文字/图片）
4. 点击"解密"按钮
5. 显示解密结果：
   - 文字类型：显示文本内容
   - 图片类型：显示提取的水印图片 + 下载按钮

#### 技术实现
- **前端**：
  - 拖拽区域
  - 密码输入框
  - 解密类型选择器（Radio/Select）
  - 结果展示区域
- **后端API**：`POST /api/decrypt`
  - 接收：加密图片 + 密码 + 解密类型
  - 处理：使用blind_watermark提取水印
  - 返回：文字内容或水印图片

#### 错误处理
- 密码错误：返回"密码错误，解密失败"提示
- 图片损坏：返回"图片文件损坏或非加密图片"
- 类型错误：返回"解密类型不匹配"

---

## 🔐 密码处理方案

### 问题背景
`blind_watermark` 库的密码参数类型为**整数**，而用户习惯输入**字符串密码**。

### 解决方案
**字符串 → SHA256 哈希 → 整数转换**

#### 实现逻辑
```python
import hashlib

def password_to_int(password_str: str) -> tuple[int, int]:
    """
    将字符串密码转换为两个整数（password_img, password_wm）

    Args:
        password_str: 用户输入的字符串密码

    Returns:
        tuple: (password_img, password_wm)
    """
    # 计算SHA256哈希
    hash_obj = hashlib.sha256(password_str.encode('utf-8'))
    hash_hex = hash_obj.hexdigest()

    # 前16位作为password_img
    password_img = int(hash_hex[:16], 16) % (10**8)

    # 后16位作为password_wm
    password_wm = int(hash_hex[16:32], 16) % (10**8)

    return password_img, password_wm
```

#### 优势
- 用户体验友好（可输入任意字符串）
- 安全性高（SHA256单向加密）
- 确定性（相同密码生成相同整数）
- 兼容性好（适配blind_watermark要求）

---

## 🎨 UI/UX 设计规范

### 布局设计

#### 整体布局：单页面三Tab
```
┌─────────────────────────────────────────┐
│         shiuYIN - 图片隐水印工具         │
├─────────────────────────────────────────┤
│  [文字加密] [图片加密] [解密]            │
├─────────────────────────────────────────┤
│                                         │
│           Tab内容区域                    │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

#### Tab 1: 文字加密
```
┌─────────────────────────────────────────┐
│  拖拽或点击上传图片                      │
│  [  📷  将图片拖到这里或点击选择  ]      │
│                                         │
│  输入要加密的文字：                      │
│  [  _________________________ ]         │
│  |                            |         │
│  |____________________________|         │
│                                         │
│  密码：                                 │
│  [  ************************  ]         │
│                                         │
│          [ 🔒 开始加密 ]                │
│                                         │
│  ─────────────────────────────────      │
│  加密结果：                              │
│  [  图片预览区域  ]                     │
│         [ 💾 下载图片 ]                 │
└─────────────────────────────────────────┘
```

#### Tab 2: 图片加密
```
┌─────────────────────────────────────────┐
│  载体图片：                              │
│  [  📷  拖拽载体图片  ]                  │
│                                         │
│  水印图片：                              │
│  [  🖼️  拖拽水印图片  ]                  │
│                                         │
│  密码：                                 │
│  [  ************************  ]         │
│                                         │
│          [ 🔒 开始加密 ]                │
│                                         │
│  ─────────────────────────────────      │
│  加密结果：                              │
│  [  图片预览区域  ]                     │
│         [ 💾 下载图片 ]                 │
└─────────────────────────────────────────┘
```

#### Tab 3: 解密
```
┌─────────────────────────────────────────┐
│  拖拽加密后的图片：                      │
│  [  📷  将图片拖到这里  ]                │
│                                         │
│  密码：                                 │
│  [  ************************  ]         │
│                                         │
│  解密类型：                              │
│  ( ● ) 文字   ( ○ ) 图片                │
│                                         │
│          [ 🔓 开始解密 ]                │
│                                         │
│  ─────────────────────────────────      │
│  解密结果：                              │
│  [  文字内容 或 图片预览  ]              │
│         [ 💾 下载 (图片类型) ]           │
└─────────────────────────────────────────┘
```

### 交互规范

#### 拖拽上传
- 拖拽区域高亮响应（hover状态）
- 支持点击打开文件选择器
- 上传后显示缩略图预览
- 显示文件名和大小

#### 文件大小验证
- **前端验证**：上传时立即检查
- **后端验证**：双重保障
- **超出25MB提示**：
  ```
  ⚠️ 文件大小超过限制
  当前文件：32.5 MB
  最大限制：25 MB
  请选择更小的图片文件
  ```

#### 加载状态
- 加密/解密处理中显示加载动画
- 禁用操作按钮防止重复提交
- 显示进度提示文字

#### 错误提示
- 密码错误：红色提示框
- 文件格式错误：橙色提示框
- 网络错误：带重试按钮的提示

---

## 🔌 API 接口设计

### 1. 文字加密接口

#### 请求
```http
POST /api/encrypt/text
Content-Type: multipart/form-data

Parameters:
  - image: File (图片文件)
  - text: string (要加密的文字)
  - password: string (密码)
```

#### 响应（成功）
```json
{
  "success": true,
  "data": {
    "image": "base64_encoded_image_string",
    "filename": "encrypted_image.png",
    "size": 1048576
  },
  "message": "加密成功"
}
```

#### 响应（失败）
```json
{
  "success": false,
  "error": "FILE_TOO_LARGE",
  "message": "文件大小超过25MB限制"
}
```

---

### 2. 图片加密接口

#### 请求
```http
POST /api/encrypt/image
Content-Type: multipart/form-data

Parameters:
  - carrier_image: File (载体图片)
  - watermark_image: File (水印图片)
  - password: string (密码)
```

#### 响应
```json
{
  "success": true,
  "data": {
    "image": "base64_encoded_image_string",
    "filename": "encrypted_image.png",
    "size": 1048576
  },
  "message": "加密成功"
}
```

---

### 3. 解密接口

#### 请求
```http
POST /api/decrypt
Content-Type: multipart/form-data

Parameters:
  - image: File (加密图片)
  - password: string (密码)
  - type: string (解密类型: "text" 或 "image")
```

#### 响应（文字类型）
```json
{
  "success": true,
  "data": {
    "type": "text",
    "content": "解密出的文字内容"
  },
  "message": "解密成功"
}
```

#### 响应（图片类型）
```json
{
  "success": true,
  "data": {
    "type": "image",
    "image": "base64_encoded_image_string",
    "filename": "extracted_watermark.png"
  },
  "message": "解密成功"
}
```

#### 响应（密码错误）
```json
{
  "success": false,
  "error": "WRONG_PASSWORD",
  "message": "密码错误，解密失败"
}
```

---

## 📦 项目文件夹结构

```
shiuYIN/
├── backend/                      # FastAPI后端
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI应用入口
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── encrypt.py       # 加密相关路由
│   │   │   └── decrypt.py       # 解密相关路由
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py        # 配置文件
│   │   │   └── security.py      # 密码处理逻辑
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── watermark.py     # blind_watermark封装
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── file_utils.py    # 文件处理工具
│   ├── tests/                   # 测试文件
│   ├── requirements.txt         # Python依赖
│   ├── .env.example             # 环境变量示例
│   └── Dockerfile               # 后端Docker配置
│
├── frontend/                     # React前端
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TextEncryption.jsx    # 文字加密组件
│   │   │   ├── ImageEncryption.jsx   # 图片加密组件
│   │   │   ├── Decryption.jsx        # 解密组件
│   │   │   ├── FileUpload.jsx        # 拖拽上传组件
│   │   │   └── ImagePreview.jsx      # 图片预览组件
│   │   ├── services/
│   │   │   └── api.js                # API请求封装
│   │   ├── utils/
│   │   │   └── validation.js         # 前端验证逻辑
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile               # 前端Docker配置
│
├── docker-compose.yml           # Docker编排配置
├── .gitignore
├── README.md                    # 项目说明文档
├── PROJECT_SPEC.md              # 本文档（需求规格说明）
└── 需求.txt                     # 原始需求文件
```

---

## 🚀 开发路线图（MVP优先）

### 阶段1：MVP开发（本地部署）✅ 当前阶段

#### 后端开发
- [ ] 搭建FastAPI项目结构
- [ ] 实现密码转换逻辑（SHA256 → int）
- [ ] 封装blind_watermark服务
- [ ] 开发三个核心API接口
- [ ] 文件大小验证中间件
- [ ] 错误处理和日志记录
- [ ] API文档测试（Swagger UI）

#### 前端开发
- [ ] 创建React项目（使用Vite或Create React App）
- [ ] 安装Ant Design组件库
- [ ] 实现三个Tab页面
- [ ] 开发拖拽上传组件
- [ ] 实现图片预览和下载功能
- [ ] 前端表单验证（文件大小、格式）
- [ ] API接口对接
- [ ] 错误提示和加载状态

#### 测试
- [ ] 后端单元测试
- [ ] API接口测试
- [ ] 前端功能测试
- [ ] 端到端测试

#### 文档
- [ ] 安装说明（README.md）
- [ ] API文档
- [ ] 用户使用指南

---

### 阶段2：容器化部署（Docker）

#### Docker配置
- [ ] 编写后端Dockerfile
- [ ] 编写前端Dockerfile（多阶段构建）
- [ ] 配置docker-compose.yml
- [ ] 配置环境变量管理
- [ ] 持久化存储配置（如需要）

#### 测试
- [ ] Docker本地构建测试
- [ ] 容器间通信测试
- [ ] 性能测试

#### 文档
- [ ] Docker部署文档
- [ ] 容器配置说明

---

### 阶段3：云服务器商业化部署

#### 云服务器部署
- [ ] 选择云服务提供商（阿里云/腾讯云/AWS）
- [ ] 服务器环境配置
- [ ] Docker部署到云服务器
- [ ] 域名购买和绑定
- [ ] SSL证书配置（HTTPS）
- [ ] Nginx反向代理配置

#### 商业化功能扩展
- [ ] 用户注册登录系统
- [ ] 付费功能设计：
  - 免费用户：25MB限制
  - 付费用户：更大文件支持
- [ ] 支付接口集成
- [ ] 使用统计和分析

#### 运维
- [ ] 监控和日志系统
- [ ] 自动备份
- [ ] 性能优化

---

## 📊 技术细节和注意事项

### blind_watermark 使用要点

#### 文字水印
```python
from blind_watermark import WaterMark

bwm = WaterMark(password_img=12345, password_wm=67890)
bwm.read_img('carrier.png')
bwm.read_wm('text_content.txt', mode='text')
bwm.embed('output.png')
```

#### 图片水印
```python
bwm = WaterMark(password_img=12345, password_wm=67890)
bwm.read_img('carrier.png')
bwm.read_wm('watermark.png', mode='bit')
bwm.embed('output.png')
```

#### 解密
```python
# 提取文字
bwm = WaterMark(password_img=12345, password_wm=67890)
bwm.read_img('encrypted.png')
text = bwm.extract(mode='text')

# 提取图片
bwm.extract(path='extracted.png', mode='bit')
```

### 图片格式处理

#### 支持格式
- **PNG**：推荐格式，无损压缩，最佳效果
- **JPG**：支持但可能有轻微质量损失

#### 格式转换策略
```python
from PIL import Image

def ensure_png(image_path):
    """确保图片为PNG格式"""
    img = Image.open(image_path)
    if img.format != 'PNG':
        png_path = image_path.replace('.jpg', '.png').replace('.jpeg', '.png')
        img.save(png_path, 'PNG')
        return png_path
    return image_path
```

### 文件大小限制实现

#### 后端中间件
```python
from fastapi import HTTPException

MAX_FILE_SIZE = 25 * 1024 * 1024  # 25MB

async def validate_file_size(file: UploadFile):
    contents = await file.read()
    file_size = len(contents)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="文件大小超过25MB限制"
        )

    await file.seek(0)  # 重置文件指针
    return file
```

#### 前端验证
```javascript
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

const validateFileSize = (file) => {
  if (file.size > MAX_FILE_SIZE) {
    message.error(`文件大小超过25MB限制（当前：${(file.size / 1024 / 1024).toFixed(2)}MB）`);
    return false;
  }
  return true;
};
```

---

## 🔒 安全性考虑

### 密码安全
- 使用SHA256单向哈希
- 不在服务器存储用户密码
- 密码传输使用HTTPS（生产环境）

### 文件安全
- 临时文件处理后立即删除
- 不在服务器永久存储用户上传的图片
- 文件类型验证（防止恶意文件上传）

### API安全
- CORS配置（生产环境）
- 请求速率限制（防止滥用）
- 文件大小限制

---

## 📝 环境变量配置

### 后端 `.env`
```env
# FastAPI配置
HOST=0.0.0.0
PORT=8000
DEBUG=True

# 文件配置
MAX_FILE_SIZE=26214400  # 25MB in bytes
ALLOWED_EXTENSIONS=png,jpg,jpeg

# CORS配置
CORS_ORIGINS=http://localhost:3000

# 临时文件目录
TEMP_DIR=./temp_files
```

### 前端 `.env`
```env
# API地址
REACT_APP_API_URL=http://localhost:8000

# 最大文件大小（bytes）
REACT_APP_MAX_FILE_SIZE=26214400
```

---

## 🎯 MVP验收标准

### 功能验收
- ✅ 文字加密功能正常运行
- ✅ 图片加密功能正常运行
- ✅ 解密功能正确提取文字和图片
- ✅ 密码错误时正确提示
- ✅ 文件大小验证生效（25MB限制）
- ✅ 支持PNG和JPG格式
- ✅ 图片预览功能正常
- ✅ 下载功能正常

### UI/UX验收
- ✅ 三个Tab切换流畅
- ✅ 拖拽上传响应正常
- ✅ 加载状态显示清晰
- ✅ 错误提示友好明确
- ✅ 整体界面美观简洁

### 技术验收
- ✅ 后端API响应正常
- ✅ 前后端通信正常
- ✅ 无明显性能问题
- ✅ 基础错误处理完善

---

## 📚 参考资源

### blind_watermark 文档
- GitHub: https://github.com/guofei9987/blind_watermark/
- 文档: https://blindwatermark.github.io/blind_watermark/#/en/README

### 技术文档
- FastAPI: https://fastapi.tiangolo.com/
- React: https://react.dev/
- Ant Design: https://ant.design/
- Docker: https://docs.docker.com/

---

## 📞 联系方式

### 项目负责人
- 项目名称：shiuYIN
- 开发团队：[待补充]
- 联系方式：[待补充]

---

**文档版本**：v1.0
**最后更新**：2025-11-20
**下次审核**：MVP完成后更新