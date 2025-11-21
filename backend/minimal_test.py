"""最小化测试 - 检查watermark.py是否正确"""
import sys
import os

# 确保可以导入模块
sys.path.insert(0, os.path.dirname(__file__))

# 导入并检查
from app.services.watermark import WatermarkService
import inspect

# 获取encrypt_image方法的源码
source = inspect.getsource(WatermarkService.encrypt_image)

# 搜索mode参数
print("=" * 60)
print("检查 encrypt_image 方法中的 mode 参数：")
print("=" * 60)

for i, line in enumerate(source.split('\n'), 1):
    if 'read_wm' in line and 'mode' in line:
        print(f"第 {i} 行: {line.strip()}")

print("\n" + "=" * 60)
print("结论:")
if "mode='img'" in source:
    print("✓ 代码正确：使用了 mode='img'")
elif "mode='bit'" in source:
    print("✗ 代码错误：仍然使用 mode='bit'")
else:
    print("? 未找到 mode 参数")
print("=" * 60)
