#!/usr/bin/env python3
"""从浏览器画布提取WebGL渲染截图并保存为PNG"""

import subprocess
import json
import base64

# 获取完整base64数据
result = subprocess.run(
    ["catdesk", "browser-action", '{"action":"evaluate","script":"document.querySelector(\"canvas\").toDataURL(\"image/png\")"}'],
    capture_output=True, text=True
)

data = json.loads(result.stdout)
base64_str = data["data"]["result"]

# 去掉 data:image/png;base64, 前缀
if base64_str.startswith("data:image/png;base64,"):
    base64_str = base64_str[len("data:image/png;base64,"):]

# 解码并保存
png_bytes = base64.b64decode(base64_str)
output_path = "/Users/wanghaochen/research/my-website/blender/cottagecore-assets/render-from-browser.png"
with open(output_path, "wb") as f:
    f.write(png_bytes)

print(f"Saved: {output_path} ({len(png_bytes)} bytes)")
