"""
FastAPI主应用
"""
import traceback
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings
from app.api.encrypt import router as encrypt_router

# 配置 multipart 文件上传大小限制
try:
    import multipart
    multipart.MAX_MEMORY_FILE_SIZE = settings.MAX_FILE_SIZE  # 25MB
    print(f"[启动] 已配置文件上传限制: {settings.MAX_FILE_SIZE / 1024 / 1024}MB")
except ImportError:
    print("[警告] 无法导入 multipart 模块，文件大小限制可能不生效")


# 全局错误处理中间件
class GlobalErrorHandlerMiddleware(BaseHTTPMiddleware):
    """捕获所有未处理的异常并输出详细日志"""

    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except Exception as e:
            error_detail = str(e)
            print(f"\n{'='*60}")
            print(f"[全局错误] 请求: {request.method} {request.url.path}")
            print(f"[全局错误] 错误类型: {type(e).__name__}")
            print(f"[全局错误] 错误信息: {error_detail}")
            print(f"[全局错误] 完整堆栈:")
            print(traceback.format_exc())
            print(f"{'='*60}\n")

            return JSONResponse(
                status_code=500,
                content={"detail": f"服务器错误: {error_detail}"}
            )


# 创建FastAPI应用
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="图片水印加密解密工具"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Text-Length", "X-Watermark-Width", "X-Watermark-Height"],  # 暴露自定义响应头
)

# 添加全局错误处理中间件
app.add_middleware(GlobalErrorHandlerMiddleware)

# 注册路由
app.include_router(encrypt_router)


@app.get("/")
async def root():
    """健康检查"""
    return {
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {"status": "healthy"}
