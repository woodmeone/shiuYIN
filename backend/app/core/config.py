"""
配置文件
"""
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """应用配置"""
    APP_NAME: str = "shiuYIN 加密工具"
    VERSION: str = "1.0.0"

    # CORS配置
    CORS_ORIGINS: list = ["http://localhost:5173"]

    # 文件上传限制
    MAX_FILE_SIZE: int = 25 * 1024 * 1024  # 25MB

    # 支持的图片格式
    ALLOWED_IMAGE_FORMATS: set = {"png", "jpg", "jpeg"}

    # 临时文件目录
    TEMP_DIR: str = os.path.join(os.path.dirname(__file__), "..", "..", "temp")

settings = Settings()

# 确保临时目录存在
os.makedirs(settings.TEMP_DIR, exist_ok=True)
