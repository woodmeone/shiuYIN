@echo off
chcp 65001 >nul
title shiuYIN - 项目启动器
color 0A

echo.
echo ═══════════════════════════════════════════════════════════════
echo                   shiuYIN 盲水印加密工具
echo ═══════════════════════════════════════════════════════════════
echo.

:: 检查Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [错误] 未检测到 Node.js
    echo 请访问 https://nodejs.org/ 下载并安装
    pause
    exit /b 1
)
echo [√] Node.js 已安装

:: 检查Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [错误] 未检测到 Python
    echo 请访问 https://www.python.org/ 下载并安装
    pause
    exit /b 1
)
echo [√] Python 已安装

:: 检查并安装前端依赖
if not exist "frontend\node_modules" (
    echo.
    echo [提示] 首次运行，正在安装前端依赖...
    cd frontend
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo [错误] 前端依赖安装失败
        cd ..
        pause
        exit /b 1
    )
    cd ..
)
echo [√] 前端依赖已就绪

:: 检查并创建后端虚拟环境
if not exist "backend\venv" (
    echo.
    echo [提示] 首次运行，正在创建Python虚拟环境...
    cd backend
    python -m venv venv
    if %errorlevel% neq 0 (
        color 0C
        echo [错误] 虚拟环境创建失败
        cd ..
        pause
        exit /b 1
    )
    cd ..
)
echo [√] Python 虚拟环境已就绪

:: 检查并安装后端依赖
if not exist "backend\venv\Lib\site-packages\fastapi" (
    echo.
    echo [提示] 首次运行，正在安装后端依赖...
    cd backend
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
    if %errorlevel% neq 0 (
        color 0C
        echo [错误] 后端依赖安装失败
        call venv\Scripts\deactivate.bat
        cd ..
        pause
        exit /b 1
    )
    call venv\Scripts\deactivate.bat
    cd ..
)
echo [√] 后端依赖已就绪

echo.
echo ───────────────────────────────────────────────────────────────
echo.

:: 启动后端服务
echo [启动] 正在启动后端服务 (端口 6001)...
start "shiuYIN - 后端服务" /D "%~dp0backend" cmd /k "venv\Scripts\activate.bat && python -m uvicorn app.main:app --host 0.0.0.0 --port 6001 --reload"

:: 等待后端启动
timeout /t 3 /nobreak >nul

:: 启动前端服务
echo [启动] 正在启动前端服务 (端口 5173)...
start "shiuYIN - 前端服务" /D "%~dp0frontend" cmd /k "npm run dev"

echo.
echo ═══════════════════════════════════════════════════════════════
echo                        启动完成！
echo ═══════════════════════════════════════════════════════════════
echo.
echo   后端服务: http://localhost:6001
echo   前端页面: http://localhost:5173
echo   API文档:  http://localhost:6001/docs
echo.
echo ───────────────────────────────────────────────────────────────
echo.
echo   关闭此窗口不会影响服务运行
echo   要停止服务，请在对应窗口按 Ctrl+C
echo.
echo ═══════════════════════════════════════════════════════════════
echo.

:: 等待5秒后自动打开浏览器
echo 5秒后自动打开浏览器...
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo.
echo 按任意键关闭此窗口...
pause >nul
