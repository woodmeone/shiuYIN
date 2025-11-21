@echo off
chcp 65001 >nul
title 图片水印加密工具 - 启动服务

echo.
echo ========================================
echo    图片水印加密工具 - 服务启动
echo ========================================
echo.

:: 设置颜色(绿色)
color 0A

:: 检查 Python 是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Python，请先安装 Python 3.8+
    pause
    exit /b 1
)

:: 检查 Node.js 是否安装
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

:: 检查后端依赖
echo [1/4] 检查后端 Python 依赖...
cd /d "%~dp0backend"
if not exist "venv\" (
    echo [提示] 未检测到虚拟环境，正在创建...
    python -m venv venv
    echo [提示] 虚拟环境创建完成
)

call venv\Scripts\activate.bat
pip install -r requirements.txt >nul 2>&1
if errorlevel 1 (
    echo [警告] 依赖安装可能有问题，但继续启动...
)
echo [完成] 后端依赖检查完成

:: 检查前端依赖
echo.
echo [2/4] 检查前端 Node.js 依赖...
cd /d "%~dp0frontend"
if not exist "node_modules\" (
    echo [提示] 正在安装前端依赖，请稍候...
    call npm install
) else (
    echo [完成] 前端依赖已存在
)

:: 启动后端服务
echo.
echo [3/4] 启动后端服务...
cd /d "%~dp0backend"
start "后端服务 (FastAPI)" cmd /k "call venv\Scripts\activate.bat && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

:: 等待后端启动
echo [提示] 等待后端服务启动...
timeout /t 3 /nobreak >nul

:: 启动前端服务
echo.
echo [4/4] 启动前端服务...
cd /d "%~dp0frontend"
start "前端服务 (Vite)" cmd /k "npm run dev"

:: 等待前端启动
echo [提示] 等待前端服务启动...
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   服务启动完成！
echo ========================================
echo.
echo   后端地址: http://localhost:8000
echo   前端地址: http://localhost:5173
echo.
echo   两个服务窗口已打开，关闭窗口即可停止服务
echo.
echo ========================================

:: 自动打开浏览器
echo [提示] 正在打开浏览器...
timeout /t 2 /nobreak >nul
start http://localhost:5173

echo.
echo 按任意键关闭此窗口...
pause >nul
