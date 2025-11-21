"""
加密相关API路由
"""
import os
import uuid
import traceback
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse

from app.core.config import settings
from app.services.watermark import WatermarkService

router = APIRouter(prefix="/api/encrypt", tags=["encrypt"])


def validate_file_size(file: UploadFile):
    """验证文件大小"""
    # 读取文件内容以检查大小
    content = file.file.read()
    file_size = len(content)

    if file_size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"文件大小超过25MB限制（当前：{file_size / 1024 / 1024:.2f}MB）"
        )

    # 重置文件指针
    file.file.seek(0)
    return content


def validate_image_format(filename: str):
    """验证图片格式"""
    ext = filename.rsplit('.', 1)[-1].lower()
    if ext not in settings.ALLOWED_IMAGE_FORMATS:
        raise HTTPException(
            status_code=400,
            detail=f"不支持的图片格式。仅支持：{', '.join(settings.ALLOWED_IMAGE_FORMATS)}"
        )
    return ext


@router.post("/text")
async def encrypt_text(
    carrier_image: UploadFile = File(..., description="载体图片"),
    text: str = Form(..., description="要加密的文字"),
    password: str = Form(..., description="加密密码")
):
    """
    文字水印加密

    - **carrier_image**: 载体图片文件
    - **text**: 要加密的文字内容
    - **password**: 加密密码
    """
    # 验证文件大小
    content = validate_file_size(carrier_image)

    # 验证图片格式
    ext = validate_image_format(carrier_image.filename)

    # 生成唯一文件名
    unique_id = str(uuid.uuid4())
    carrier_path = os.path.join(settings.TEMP_DIR, f"{unique_id}_carrier.{ext}")
    output_path = os.path.join(settings.TEMP_DIR, f"{unique_id}_encrypted.png")

    try:
        # 保存上传的载体图片
        with open(carrier_path, 'wb') as f:
            f.write(content)

        # 如果不是PNG，转换为PNG
        carrier_path_png = WatermarkService.convert_to_png_if_needed(carrier_path)

        # 执行加密
        encrypted_image = WatermarkService.encrypt_text(
            carrier_image_path=carrier_path_png,
            text=text,
            password=password,
            output_path=output_path
        )

        # 计算精确的比特数，用于解密
        exact_bits = WatermarkService.calculate_exact_bits(text)

        # 返回加密后的图片，在响应头中包含精确比特数
        return FileResponse(
            encrypted_image,
            media_type="image/png",
            filename=f"encrypted_{unique_id}.png",
            headers={
                "Content-Disposition": f'attachment; filename="encrypted_{unique_id}.png"',
                "X-Text-Length": str(exact_bits)  # 自定义响应头，告诉前端精确的比特数
            }
        )

    except Exception as e:
        # 打印详细错误信息
        print(f"加密失败详细信息：")
        print(traceback.format_exc())

        # 清理临时文件
        for path in [carrier_path, output_path]:
            if os.path.exists(path):
                os.unlink(path)
        raise HTTPException(status_code=500, detail=f"加密失败：{str(e)}")


@router.post("/image")
async def encrypt_image(
    carrier_image: UploadFile = File(..., description="载体图片"),
    watermark_image: UploadFile = File(..., description="水印图片"),
    password: str = Form(..., description="加密密码")
):
    """
    图片水印加密

    - **carrier_image**: 载体图片文件
    - **watermark_image**: 水印图片文件
    - **password**: 加密密码
    """
    # 验证两个文件的大小
    carrier_content = validate_file_size(carrier_image)
    watermark_content = validate_file_size(watermark_image)

    # 验证图片格式
    carrier_ext = validate_image_format(carrier_image.filename)
    watermark_ext = validate_image_format(watermark_image.filename)

    # 生成唯一文件名
    unique_id = str(uuid.uuid4())
    carrier_path = os.path.join(settings.TEMP_DIR, f"{unique_id}_carrier.{carrier_ext}")
    watermark_path = os.path.join(settings.TEMP_DIR, f"{unique_id}_watermark.{watermark_ext}")
    output_path = os.path.join(settings.TEMP_DIR, f"{unique_id}_encrypted.png")

    try:
        # 保存上传的图片
        with open(carrier_path, 'wb') as f:
            f.write(carrier_content)
        with open(watermark_path, 'wb') as f:
            f.write(watermark_content)

        # 转换为PNG格式（如果需要）
        carrier_path_png = WatermarkService.convert_to_png_if_needed(carrier_path)
        watermark_path_png = WatermarkService.convert_to_png_if_needed(watermark_path)

        # 执行加密
        encrypted_image = WatermarkService.encrypt_image(
            carrier_image_path=carrier_path_png,
            watermark_image_path=watermark_path_png,
            password=password,
            output_path=output_path
        )

        # 返回加密后的图片
        return FileResponse(
            encrypted_image,
            media_type="image/png",
            filename=f"encrypted_{unique_id}.png",
            headers={
                "Content-Disposition": f'attachment; filename="encrypted_{unique_id}.png"'
            }
        )

    except Exception as e:
        # 清理临时文件
        for path in [carrier_path, watermark_path, output_path]:
            if os.path.exists(path):
                os.unlink(path)
        raise HTTPException(status_code=500, detail=f"加密失败：{str(e)}")


@router.post("/decrypt/text")
async def decrypt_text(
    encrypted_image: UploadFile = File(..., description="加密图片"),
    password: str = Form(..., description="解密密码"),
    text_bits: int = Form(400, description="文本的比特数（默认400）")
):
    """
    文字水印解密

    - **encrypted_image**: 加密图片文件
    - **password**: 解密密码
    - **text_bits**: 文本的比特数（可选，默认400。输入加密时显示的比特数）
    """
    # 验证文件大小
    content = validate_file_size(encrypted_image)

    # 验证图片格式
    ext = validate_image_format(encrypted_image.filename)

    # 生成唯一文件名
    unique_id = str(uuid.uuid4())
    encrypted_path = os.path.join(settings.TEMP_DIR, f"{unique_id}_encrypted.{ext}")

    try:
        # 保存上传的加密图片
        with open(encrypted_path, 'wb') as f:
            f.write(content)

        # 如果不是PNG，转换为PNG
        encrypted_path_png = WatermarkService.convert_to_png_if_needed(encrypted_path)

        # 执行解密，传入比特数
        result = WatermarkService.decrypt(
            encrypted_image_path=encrypted_path_png,
            password=password,
            mode='str',
            wm_bits=text_bits
        )

        # 返回提取的文字
        return {
            "success": True,
            "type": result['type'],
            "content": result['content']
        }

    except Exception as e:
        # 打印详细错误信息
        print(f"解密失败详细信息：")
        print(traceback.format_exc())

        # 清理临时文件
        if os.path.exists(encrypted_path):
            os.unlink(encrypted_path)
        raise HTTPException(status_code=500, detail=f"解密失败：{str(e)}")

    finally:
        # 清理临时文件
        if os.path.exists(encrypted_path):
            os.unlink(encrypted_path)


@router.post("/decrypt/image")
async def decrypt_image(
    encrypted_image: UploadFile = File(..., description="加密图片"),
    password: str = Form(..., description="解密密码")
):
    """
    图片水印解密

    - **encrypted_image**: 加密图片文件
    - **password**: 解密密码
    """
    # 验证文件大小
    content = validate_file_size(encrypted_image)

    # 验证图片格式
    ext = validate_image_format(encrypted_image.filename)

    # 生成唯一文件名
    unique_id = str(uuid.uuid4())
    encrypted_path = os.path.join(settings.TEMP_DIR, f"{unique_id}_encrypted.{ext}")
    output_path = os.path.join(settings.TEMP_DIR, f"{unique_id}_decrypted.png")

    try:
        # 保存上传的加密图片
        with open(encrypted_path, 'wb') as f:
            f.write(content)

        # 如果不是PNG，转换为PNG
        encrypted_path_png = WatermarkService.convert_to_png_if_needed(encrypted_path)

        # 执行解密
        result = WatermarkService.decrypt(
            encrypted_image_path=encrypted_path_png,
            password=password,
            mode='bit',
            output_path=output_path
        )

        # 返回提取的水印图片
        return FileResponse(
            result['content'],
            media_type="image/png",
            filename=f"decrypted_{unique_id}.png",
            headers={
                "Content-Disposition": f'attachment; filename="decrypted_{unique_id}.png"'
            }
        )

    except Exception as e:
        # 打印详细错误信息
        print(f"解密失败详细信息：")
        print(traceback.format_exc())

        # 清理临时文件
        for path in [encrypted_path, output_path]:
            if os.path.exists(path):
                os.unlink(path)
        raise HTTPException(status_code=500, detail=f"解密失败：{str(e)}")
