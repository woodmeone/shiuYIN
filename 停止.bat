@echo off
chcp 65001 >nul
title shiuYIN - 停止服务
color 0E

echo.
echo ═══════════════════════════════════════════════════════════════
echo                   shiuYIN - 停止所有服务
echo ═══════════════════════════════════════════════════════════════
echo.

echo [停止] 正在查找并停止前端服务 (端口 5173)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    taskkill /F /PID %%a >nul 2>&1
    if !errorlevel! equ 0 (
        echo [√] 前端服务已停止 ^(PID: %%a^)
    )
)

echo [停止] 正在查找并停止前端服务 (端口 6000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :6000') do (
    taskkill /F /PID %%a >nul 2>&1
    if !errorlevel! equ 0 (
        echo [√] 前端服务已停止 ^(PID: %%a^)
    )
)

echo [停止] 正在查找并停止后端服务 (端口 6001)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :6001') do (
    taskkill /F /PID %%a >nul 2>&1
    if !errorlevel! equ 0 (
        echo [√] 后端服务已停止 ^(PID: %%a^)
    )
)

echo.
echo ═══════════════════════════════════════════════════════════════
echo                     所有服务已停止！
echo ═══════════════════════════════════════════════════════════════
echo.
pause
