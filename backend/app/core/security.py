"""
安全相关工具函数
"""
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
