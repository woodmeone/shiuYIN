"""
水印加密核心服务
"""
import os
from typing import Optional
from blind_watermark import WaterMark
from PIL import Image

from app.core.security import password_to_int


class WatermarkService:
    """水印加密服务"""

    @staticmethod
    def encrypt_text(
        carrier_image_path: str,
        text: str,
        password: str,
        output_path: str
    ) -> str:
        """
        文字水印加密

        Args:
            carrier_image_path: 载体图片路径
            text: 要加密的文字内容
            password: 用户密码
            output_path: 输出路径

        Returns:
            str: 加密后的图片路径
        """
        # 转换密码
        password_img, password_wm = password_to_int(password)

        # 初始化WaterMark
        bwm = WaterMark(password_img=password_img, password_wm=password_wm)

        # 读取载体图片
        bwm.read_img(carrier_image_path)

        # 读取文本水印（直接传入文字内容）
        bwm.read_wm(text, mode='str')

        # 嵌入水印并保存
        bwm.embed(output_path)

        return output_path

    @staticmethod
    def encrypt_image(
        carrier_image_path: str,
        watermark_image_path: str,
        password: str,
        output_path: str
    ) -> str:
        """
        图片水印加密

        Args:
            carrier_image_path: 载体图片路径
            watermark_image_path: 水印图片路径
            password: 用户密码
            output_path: 输出路径

        Returns:
            str: 加密后的图片路径
        """
        # 转换密码
        password_img, password_wm = password_to_int(password)

        # 初始化WaterMark
        bwm = WaterMark(password_img=password_img, password_wm=password_wm)

        # 读取载体图片
        bwm.read_img(carrier_image_path)

        # 读取水印图片
        bwm.read_wm(watermark_image_path, mode='bit')

        # 嵌入水印并保存
        bwm.embed(output_path)

        return output_path

    @staticmethod
    def decrypt(
        encrypted_image_path: str,
        password: str,
        mode: str = 'text',
        output_path: Optional[str] = None
    ) -> dict:
        """
        解密水印

        Args:
            encrypted_image_path: 加密图片路径
            password: 用户密码
            mode: 'text' 或 'bit'
            output_path: 输出路径（mode='bit'时必需）

        Returns:
            dict: {'type': 'text'|'image', 'content': str|path}
        """
        # 转换密码
        password_img, password_wm = password_to_int(password)

        # 初始化WaterMark
        bwm = WaterMark(password_img=password_img, password_wm=password_wm)

        # 读取加密图片
        bwm.read_img(encrypted_image_path)

        if mode == 'str':
            # 提取文本水印
            extracted_text = bwm.extract(mode='str')
            return {
                'type': 'text',
                'content': extracted_text
            }
        else:
            # 提取图片水印
            if not output_path:
                raise ValueError("解密图片水印时必须提供output_path")

            bwm.extract(path=output_path, mode='bit')
            return {
                'type': 'image',
                'content': output_path
            }

    @staticmethod
    def convert_to_png_if_needed(image_path: str) -> str:
        """
        如果图片不是PNG格式，转换为PNG

        Args:
            image_path: 图片路径

        Returns:
            str: PNG格式图片路径
        """
        img = Image.open(image_path)

        if img.format != 'PNG':
            # 创建PNG临时文件
            png_path = image_path.rsplit('.', 1)[0] + '_converted.png'
            img.save(png_path, 'PNG')
            return png_path

        return image_path
