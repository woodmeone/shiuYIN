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
        print(f"WatermarkService.encrypt_image 调用:")
        print(f"  - carrier_image_path 类型: {type(carrier_image_path)}, 值: {carrier_image_path}")
        print(f"  - watermark_image_path 类型: {type(watermark_image_path)}, 值: {watermark_image_path}")
        print(f"  - password 长度: {len(password)}")
        print(f"  - output_path: {output_path}")

        # 转换密码
        password_img, password_wm = password_to_int(password)
        print(f"密码转换完成: password_img={password_img}, password_wm={password_wm}")

        # 初始化WaterMark
        bwm = WaterMark(password_img=password_img, password_wm=password_wm)
        print("WaterMark 对象初始化完成")

        # 读取载体图片
        print(f"正在读取载体图片: {carrier_image_path}")
        bwm.read_img(carrier_image_path)
        print("载体图片读取完成")

        # 读取水印图片
        print(f"正在读取水印图片: {watermark_image_path}, mode='img'")
        bwm.read_wm(watermark_image_path, mode='img')
        print("水印图片读取完成")

        # 嵌入水印并保存
        print(f"正在嵌入水印并保存到: {output_path}")
        bwm.embed(output_path)
        print("水印嵌入完成")

        return output_path

    @staticmethod
    def calculate_text_bits_from_bytes(byte_length: int) -> int:
        """
        根据UTF-8字节数计算需要的比特数

        Args:
            byte_length: UTF-8字节数

        Returns:
            int: 需要的比特数
        """
        # 每字节8比特，加1字节(8比特)的余量以应对边界情况
        # 实际测试：9字节=71比特，31字节=247比特
        # 基本上是 byte_length * 8 - 1 (因为前导零被移除)
        # 为了安全，我们使用 byte_length * 8 + 8
        return byte_length * 8 + 8

    @staticmethod
    def calculate_exact_bits(text: str) -> int:
        """
        计算文本编码后的精确比特数

        Args:
            text: 文本内容

        Returns:
            int: 精确的比特数
        """
        # 模拟blind_watermark的编码方式
        byte_str = bin(int(text.encode('utf-8').hex(), base=16))[2:]
        return len(byte_str)

    @staticmethod
    def decrypt(
        encrypted_image_path: str,
        password: str,
        mode: str = 'text',
        output_path: Optional[str] = None,
        wm_bits: int = 400,
        wm_shape: tuple = (128, 128)
    ) -> dict:
        """
        解密水印

        Args:
            encrypted_image_path: 加密图片路径
            password: 用户密码
            mode: 'str'(文本) 或 'bit'/'img'(图片)
            output_path: 输出路径（mode='bit'/'img'时必需）
            wm_bits: 水印比特数（mode='str'时使用，默认400比特）
            wm_shape: 水印图片尺寸（mode='bit'/'img'时使用，默认128x128）

        Returns:
            dict: {'type': 'text'|'image', 'content': str|path}
        """
        # 转换密码
        password_img, password_wm = password_to_int(password)

        # 初始化WaterMark
        bwm = WaterMark(password_img=password_img, password_wm=password_wm)

        if mode == 'str':
            # 提取文本水印
            # 直接使用用户提供的比特数
            extracted_text = bwm.extract(filename=encrypted_image_path, wm_shape=wm_bits, mode='str')

            # 智能截断：移除末尾的填充字符
            # 1. 移除末尾的空字符和替换字符
            extracted_text = extracted_text.rstrip('\x00\ufffd ')

            # 2. 检测并移除开头的乱码（如果存在）
            # 找到第一个正常字符的位置
            start_pos = 0
            for i, char in enumerate(extracted_text):
                # 如果是可打印ASCII或常见Unicode字符，认为是正常字符
                if ord(char) >= 32 or char in '\n\r\t':
                    start_pos = i
                    break

            # 3. 检测并移除末尾的乱码
            # 从后向前找到第一个正常字符
            end_pos = len(extracted_text)
            consecutive_junk = 0
            for i in range(len(extracted_text) - 1, -1, -1):
                char = extracted_text[i]
                # 不可打印字符（排除常见的换行符等）
                if ord(char) < 32 and char not in '\n\r\t':
                    consecutive_junk += 1
                    if consecutive_junk >= 5:  # 连续5个不可打印字符
                        end_pos = i + 5
                        break
                else:
                    consecutive_junk = 0

            extracted_text = extracted_text[start_pos:end_pos].strip()

            return {
                'type': 'text',
                'content': extracted_text
            }
        elif mode in ('bit', 'img'):
            # 提取图片水印（'bit'和'img'都表示图片模式）
            if not output_path:
                raise ValueError("解密图片水印时必须提供output_path")

            bwm.extract(filename=encrypted_image_path, wm_shape=wm_shape, mode='img', out_wm_name=output_path)
            return {
                'type': 'image',
                'content': output_path
            }
        else:
            raise ValueError(f"不支持的模式: {mode}，请使用 'str', 'bit' 或 'img'")

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
