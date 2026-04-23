import shutil
import os

src = r"d:\Election\ChatGPT Image Apr 22, 2026, 10_20_56 PM.png"
dst = r"d:\Election\Election-Site\static\img\indian_flag_icon.png"

try:
    shutil.copy(src, dst)
    print("Success: Logo copied to static/img/indian_flag_icon.png")
except Exception as e:
    print(f"Error: {e}")
