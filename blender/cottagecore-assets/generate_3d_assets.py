#!/usr/bin/env python3
"""
森系自然风工作室 3D 资产生成器
用法: python3 generate_3d_assets.py
输出:
  - glb-preview/*.glb   (trimesh 生成的简化预览模型)
  - blender-scripts/*.py (Blender bpy 脚本，在 Blender 中运行)
"""

import os
import sys
import json
import math

import numpy as np
import trimesh
from trimesh.creation import box, cylinder, icosphere
from trimesh.primitives import Sphere

# 基础单位：1 unit = 10cm
UNIT = 1.0
OUT_GLB = os.path.join(os.path.dirname(__file__), "glb-preview")
OUT_PY = os.path.join(os.path.dirname(__file__), "blender-scripts")
os.makedirs(OUT_GLB, exist_ok=True)
os.makedirs(OUT_PY, exist_ok=True)

# ============================================================
# 辅助函数
# ============================================================

def hex_to_rgb(hex_color):
    h = hex_color.lstrip('#')
    return tuple(int(h[i:i+2], 16) / 255.0 for i in (0, 2, 4)) + (1.0,)

def make_box(extents, center=(0,0,0), color="#FFFFFF"):
    """创建带颜色的box"""
    mesh = box(extents=extents)
    mesh.apply_translation(center)
    mesh.visual.vertex_colors = np.array([hex_to_rgb(color)[:3]] * len(mesh.vertices))
    return mesh

def make_cylinder(radius, height, center=(0,0,0), color="#FFFFFF", segments=16):
    mesh = cylinder(radius=radius, height=height, segments=segments)
    mesh.apply_translation(center)
    mesh.visual.vertex_colors = np.array([hex_to_rgb(color)[:3]] * len(mesh.vertices))
    return mesh

def make_sphere(radius, center=(0,0,0), color="#FFFFFF", subdivisions=2):
    mesh = icosphere(radius=radius, subdivisions=subdivisions)
    mesh.apply_translation(center)
    mesh.visual.vertex_colors = np.array([hex_to_rgb(color)[:3]] * len(mesh.vertices))
    return mesh

def save_glb(meshes, name):
    """保存一个或多个mesh为GLB"""
    if isinstance(meshes, list):
        if len(meshes) == 1:
            scene = meshes[0]
        else:
            scene = trimesh.util.concatenate(meshes)
    else:
        scene = meshes
    path = os.path.join(OUT_GLB, f"{name}.glb")
    scene.export(path)
    print(f"  Saved: {path}")
    return path

# ============================================================
# C01: 房间结构
# ============================================================

def build_c01_room():
    """房间主体结构: 地板 + 后墙 + 左墙 + 屋顶 + 苔藓岩石地台"""
    meshes = []
    
    # 地板: 6块不等宽木板拼接
    floor_colors = ["#D8C8B4", "#D4C4B0", "#DACAB6", "#D6C6B2", "#D2C2AE", "#D0C0AC"]
    board_widths = [1.4, 1.8, 1.6, 1.5, 1.9, 1.8]
    x_offset = -5.0
    for i, (w, c) in enumerate(zip(board_widths, floor_colors)):
        meshes.append(make_box([w, 10.0, 0.8], center=(x_offset + w/2, 0, 0.4), color=c))
        x_offset += w + 0.03
    
    # 后墙
    meshes.append(make_box([10.0, 0.3, 8.0], center=(0, -5.15, 4.8), color="#EDE8DE"))
    
    # 左墙
    meshes.append(make_box([0.3, 10.0, 8.0], center=(-5.15, 0, 4.8), color="#EDE8DE"))
    
    # 墙角线
    meshes.append(make_box([10.0, 0.12, 0.12], center=(0, -5.0, 0.86), color="#B89070"))
    meshes.append(make_box([0.12, 10.0, 0.12], center=(-5.0, 0, 0.86), color="#B89070"))
    meshes.append(make_box([0.12, 0.12, 8.0], center=(-5.0, -5.0, 4.8), color="#B89070"))
    
    # 屋顶斜顶 (简化为一个倾斜的大box)
    roof = make_box([10.8, 10.8, 0.45], center=(0, 0, 8.8), color="#B07850")
    # 旋转屋顶使其倾斜
    from trimesh.transformations import rotation_matrix
    rot = rotation_matrix(math.radians(-12), [1, 0, 0], roof.centroid)
    roof.apply_transform(rot)
    meshes.append(roof)
    
    # 屋顶横梁 (纵向3根)
    for i in range(3):
        y = -3.5 + i * 3.5
        beam = make_box([10.6, 0.3, 0.3], center=(0, y, 8.4), color="#8B6545")
        meshes.append(beam)
    
    # 屋顶横梁 (横向2根)
    for i in range(2):
        x = -2.5 + i * 5.0
        beam = make_box([0.2, 10.6, 0.2], center=(x, 0, 8.5), color="#8B6545")
        meshes.append(beam)
    
    # 地台: 大圆盘 (用圆柱近似)
    base = make_cylinder(radius=7.0, height=0.5, center=(0, 0, -0.25), color="#6B8E50", segments=32)
    meshes.append(base)
    
    # 地台岩石
    rock_positions = [(-5, -3), (-4, 4), (5, -2), (3, 5), (-2, -5), (6, 3)]
    for i, (rx, ry) in enumerate(rock_positions):
        size = 0.5 + i * 0.15
        rock = make_box([size, size*0.8, size*0.6], center=(rx, ry, 0.1), color="#A8A090")
        meshes.append(rock)
    
    # 地台上的草簇 (用小圆柱模拟)
    grass_positions = [(-3, -2), (-5, 2), (4, -4), (2, 3), (-1, 5), (5, 0), (-4, -4), (3, -1)]
    for gx, gy in grass_positions:
        for j in range(3):
            h = 0.3 + (j % 3) * 0.2
            grass = make_cylinder(radius=0.03, height=h, center=(gx + j*0.08, gy + j*0.05, h/2), color="#5E8A50", segments=6)
            meshes.append(grass)
    
    # 枯树枝
    for bx, by in [(-3, 3), (4, 2)]:
        branch = make_cylinder(radius=0.04, height=1.5, center=(bx, by, 0.8), color="#A08060", segments=6)
        meshes.append(branch)
    
    save_glb(meshes, "C01-room-structure")
    return meshes

# ============================================================
# C02: 后墙窗户及装饰
# ============================================================

def build_c02_window():
    meshes = []
    
    # 拱形窗框 (简化为矩形+半圆顶)
    # 矩形部分
    meshes.append(make_box([3.2, 0.25, 4.2], center=(0, 0, 2.1), color="#A07850"))
    # 半圆顶 (用压扁的圆柱)
    arch = make_cylinder(radius=1.6, height=0.25, center=(0, 0, 4.2), color="#A07850", segments=16)
    arch.apply_transform(trimesh.transformations.rotation_matrix(math.radians(90), [1, 0, 0]))
    meshes.append(arch)
    
    # 窗玻璃
    meshes.append(make_box([2.8, 0.05, 3.8], center=(0, 0.12, 2.1), color="#C8D8E0"))
    
    # 窗台
    meshes.append(make_box([4.4, 0.5, 0.2], center=(0, 0.35, 0.1), color="#A07850"))
    
    # 窗台摆件: 小鸟巢
    nest = make_cylinder(radius=0.12, height=0.08, center=(-1.5, 0.35, 0.2), color="#C8A880", segments=12)
    meshes.append(nest)
    # 鸟蛋
    for ex in [-1.55, -1.5, -1.45]:
        meshes.append(make_sphere(radius=0.03, center=(ex, 0.35, 0.28), color="#B8D0E0"))
    
    # 薰衣草束
    for i in range(5):
        meshes.append(make_cylinder(radius=0.015, height=0.25, center=(-0.5 + i*0.05, 0.35, 0.2), color="#9B7CB0", segments=4))
    
    # 松果
    meshes.append(make_cylinder(radius=0.04, height=0.08, center=(0.5, 0.35, 0.15), color="#A08860", segments=8))
    meshes.append(make_cylinder(radius=0.03, height=0.06, center=(0.7, 0.35, 0.12), color="#A08860", segments=8))
    
    # 干花串 (简化为一条线+几个小物体)
    for i in range(8):
        t = i / 7.0
        x = -2.5 + t * 5.0
        z = 5.5 - math.sin(t * math.pi) * 0.3
        # 小装饰物
        colors = ["#9B7CB0", "#7A9E80", "#A08860", "#D4C4A4"]
        c = colors[i % 4]
        meshes.append(make_sphere(radius=0.04, center=(x, -0.1, z), color=c))
    
    save_glb(meshes, "C02-window-decor")
    return meshes

# ============================================================
# C03: L形工作台及摆件
# ============================================================

def build_c03_workdesk():
    meshes = []
    
    # L形桌面 - 长边
    meshes.append(make_box([5.2, 2.2, 0.18], center=(0, 0, 2.5), color="#C8A880"))
    # L形桌面 - 短边
    meshes.append(make_box([2.2, 2.2, 0.18], center=(2.5, 2.5, 2.5), color="#C8A880"))
    
    # 桌腿
    leg_positions = [(-2.2, -0.8), (2.2, -0.8), (-2.2, 0.8), (2.2, 2.5)]
    for lx, ly in leg_positions:
        meshes.append(make_cylinder(radius=0.09, height=2.5, center=(lx, ly, 1.25), color="#A07850", segments=8))
    
    # 桌下搁板
    meshes.append(make_box([4.8, 0.5, 0.1], center=(0, -0.8, 1.0), color="#A07850"))
    
    # 显示器
    meshes.append(make_box([1.6, 0.1, 1.0], center=(0, 0.15, 3.3), color="#E8E0D8"))
    meshes.append(make_box([1.5, 0.02, 0.9], center=(0, 0.18, 3.3), color="#1A2A1A"))  # 屏幕
    # 支架
    meshes.append(make_box([0.3, 0.25, 0.4], center=(0, 0.15, 2.8), color="#C8A880"))
    meshes.append(make_box([0.5, 0.3, 0.05], center=(0, 0.15, 2.55), color="#C8A880"))
    
    # 键盘
    meshes.append(make_box([1.0, 0.45, 0.07], center=(0, 0.6, 2.42), color="#F5F0E8"))
    
    # 松果台灯
    meshes.append(make_cylinder(radius=0.1, height=0.15, center=(-1.8, 0.3, 2.65), color="#A08860", segments=8))
    meshes.append(make_cylinder(radius=0.12, height=0.15, center=(-1.8, 0.3, 2.85), color="#F0E8D8", segments=12))
    
    # 树皮陶杯
    cup = make_cylinder(radius=0.07, height=0.16, center=(-0.8, 0.5, 2.6), color="#8B7355", segments=8)
    meshes.append(cup)
    # 木柄
    meshes.append(make_box([0.04, 0.06, 0.02], center=(-0.72, 0.5, 2.6), color="#C8A880"))
    
    # 蘑菇精灵玩偶
    meshes.append(make_sphere(radius=0.08, center=(1.5, 1.5, 2.65), color="#F0E0D0"))  # 身体
    meshes.append(make_cylinder(radius=0.09, height=0.1, center=(1.5, 1.5, 2.82), color="#C44040", segments=8))  # 蘑菇帽
    
    # 羽毛笔筒
    meshes.append(make_cylinder(radius=0.06, height=0.18, center=(1.8, 0.3, 2.65), color="#B89070", segments=8))
    # 羽毛
    meshes.append(make_box([0.02, 0.02, 0.15], center=(1.82, 0.3, 2.85), color="#F0F0F0"))
    
    # 放大镜
    meshes.append(make_cylinder(radius=0.075, height=0.02, center=(0.8, 1.0, 2.55), color="#A0A090", segments=12))
    meshes.append(make_box([0.03, 0.03, 0.15], center=(0.85, 1.0, 2.45), color="#C8A880"))
    
    # 小木盒
    meshes.append(make_box([0.2, 0.15, 0.1], center=(2.0, -0.5, 2.6), color="#C8A880"))
    
    # 书本
    meshes.append(make_box([0.16, 0.1, 0.22], center=(-1.2, 0.3, 2.7), color="#5A7A5A"))  # 立放
    meshes.append(make_box([0.2, 0.14, 0.04], center=(-0.3, 1.0, 2.55), color="#C4A080"))  # 平放
    
    # 盆栽
    meshes.append(make_cylinder(radius=0.11, height=0.18, center=(0.5, -0.5, 2.65), color="#B89070", segments=8))
    meshes.append(make_sphere(radius=0.08, center=(0.5, -0.5, 2.85), color="#4A7040"))
    
    save_glb(meshes, "C03-workdesk")
    return meshes

# ============================================================
# C04: 洞洞板及挂件
# ============================================================

def build_c04_pegboard():
    meshes = []
    
    # 洞洞板主体
    meshes.append(make_box([3.5, 0.06, 4.5], center=(0, 0, 0), color="#D4C4A4"))
    # 边框
    meshes.append(make_box([3.66, 0.08, 0.1], center=(0, 0, 2.25), color="#A07850"))  # 上
    meshes.append(make_box([3.66, 0.08, 0.1], center=(0, 0, -2.25), color="#A07850"))  # 下
    meshes.append(make_box([0.1, 0.08, 4.5], center=(-1.75, 0, 0), color="#A07850"))  # 左
    meshes.append(make_box([0.1, 0.08, 4.5], center=(1.75, 0, 0), color="#A07850"))  # 右
    
    # 圆孔 (用小圆柱表示)
    for row in range(5):
        for col in range(8):
            x = -1.4 + col * 0.4
            z = -1.8 + row * 0.4
            hole = make_cylinder(radius=0.04, height=0.08, center=(x, 0.04, z), color="#D4C4A4", segments=8)
            meshes.append(hole)
    
    # 挂件1: 植物标本框
    meshes.append(make_box([0.55, 0.05, 0.7], center=(-1.0, 0.15, 1.5), color="#A07850"))
    meshes.append(make_box([0.45, 0.02, 0.6], center=(-1.0, 0.18, 1.5), color="#5A7A5A"))
    
    # 挂件2: 垂吊蕨篮
    meshes.append(make_cylinder(radius=0.14, height=0.22, center=(0, 0.2, 1.5), color="#B89070", segments=8))
    for i in range(3):
        meshes.append(make_cylinder(radius=0.02, height=0.2, center=(0 + i*0.05, 0.25, 1.3 - i*0.1), color="#4A7040", segments=4))
    
    # 挂件3: 小剪刀
    meshes.append(make_box([0.25, 0.02, 0.08], center=(-1.2, 0.12, 0.5), color="#A0A090"))
    
    # 挂件4: 小泥铲
    meshes.append(make_box([0.3, 0.02, 0.06], center=(0, 0.12, 0.5), color="#8B6545"))
    
    # 挂件5: 麻绳球
    meshes.append(make_sphere(radius=0.09, center=(1.0, 0.15, 0.5), color="#D4C4A4"))
    
    # 挂件6: 皮革工具卷
    meshes.append(make_cylinder(radius=0.06, height=0.35, center=(0, 0.15, -1.0), color="#8B6545", segments=8))
    
    # 挂件7: 小喷壶
    meshes.append(make_cylinder(radius=0.08, height=0.25, center=(1.2, 0.2, -1.0), color="#A0B8A0", segments=8))
    
    save_glb(meshes, "C04-pegboard")
    return meshes

# ============================================================
# C05: 树桩抽屉柜
# ============================================================

def build_c05_stump():
    meshes = []
    
    # 柜体 (圆柱)
    meshes.append(make_cylinder(radius=1.0, height=2.2, center=(0, 0, 1.1), color="#A07850", segments=16))
    
    # 三层抽屉正面 (扁圆柱片)
    for i in range(3):
        z = 0.4 + i * 0.7
        drawer = make_cylinder(radius=0.95, height=0.05, center=(0, 0.55, z), color="#D4C4A4", segments=16)
        meshes.append(drawer)
        # 树枝拉手
        meshes.append(make_cylinder(radius=0.03, height=0.2, center=(0, 0.6, z), color="#B89070", segments=6))
    
    # 柜脚 (小树桩)
    for angle in [0, 2.1, 4.2]:
        x = math.cos(angle) * 0.6
        z = math.sin(angle) * 0.6 + 0.1
        meshes.append(make_cylinder(radius=0.12, height=0.2, center=(x, 0.2, z), color="#A07850", segments=6))
    
    # 顶部书本
    meshes.append(make_box([0.45, 0.35, 0.15], center=(-0.3, 0.2, 2.35), color="#5A7A5A"))
    meshes.append(make_box([0.4, 0.3, 0.12], center=(-0.25, 0.2, 2.5), color="#C4A080"))
    meshes.append(make_box([0.35, 0.25, 0.1], center=(-0.2, 0.2, 2.62), color="#8B6545"))
    
    # 水晶雪花球
    meshes.append(make_sphere(radius=0.15, center=(0.4, 0.2, 2.4), color="#E8F4F8"))
    meshes.append(make_cylinder(radius=0.1, height=0.08, center=(0.4, 0.2, 2.18), color="#C8A880", segments=8))
    
    # 小圆凳
    meshes.append(make_cylinder(radius=0.22, height=0.05, center=(0, 0.5, 0), color="#C8A880", segments=12))
    for angle in [0, 2.1, 4.2]:
        x = math.cos(angle) * 0.3
        z = math.sin(angle) * 0.3
        leg = make_cylinder(radius=0.03, height=0.5, center=(x, 0.3, z), color="#C8A880", segments=4)
        meshes.append(leg)
    # 坐垫
    meshes.append(make_cylinder(radius=0.21, height=0.06, center=(0, 0.53, 0), color="#F4E4D4", segments=12))
    
    save_glb(meshes, "C05-stump-cabinet")
    return meshes

# ============================================================
# C06: 地毯与小鹿
# ============================================================

def build_c06_rug_deer():
    meshes = []
    
    # 地毯 (圆角矩形 → 用带圆角的box，这里用稍大的box近似)
    meshes.append(make_box([3.5, 2.5, 0.06], center=(0, 0, 0.03), color="#B8A890"))
    
    # 小鹿身体 (压扁的球)
    body = make_sphere(radius=0.45, center=(0, 0, 0.3), color="#E8D8C0")
    body.apply_scale([1.0, 0.7, 0.6])
    meshes.append(body)
    
    # 小鹿头
    meshes.append(make_sphere(radius=0.18, center=(0.25, 0.15, 0.45), color="#E8D8C0"))
    
    # 耳朵
    meshes.append(make_box([0.08, 0.04, 0.12], center=(0.3, 0.25, 0.55), color="#E8D8C0"))
    meshes.append(make_box([0.08, 0.04, 0.12], center=(0.2, 0.25, 0.55), color="#E8D8C0"))
    
    # 鹿角
    meshes.append(make_cylinder(radius=0.02, height=0.08, center=(0.28, 0.2, 0.62), color="#D4C4A4", segments=4))
    meshes.append(make_cylinder(radius=0.02, height=0.08, center=(0.22, 0.2, 0.62), color="#D4C4A4", segments=4))
    
    # 背部斑点
    for sx, sz in [(-0.1, 0.45), (0, 0.5), (0.1, 0.42)]:
        meshes.append(make_sphere(radius=0.03, center=(sx, -0.05, sz), color="#F0E8D8"))
    
    save_glb(meshes, "C06-rug-deer")
    return meshes

# ============================================================
# C07: 原木吉他
# ============================================================

def build_c07_guitar():
    meshes = []
    
    # 琴身 (用box+sphere组合近似葫芦形)
    meshes.append(make_box([1.2, 0.5, 0.15], center=(0, 0, 0), color="#C8A880"))
    meshes.append(make_box([0.8, 0.7, 0.15], center=(0, -0.3, 0), color="#C8A880"))
    # 圆润边缘
    meshes.append(make_sphere(radius=0.25, center=(0, -0.3, 0), color="#C8A880"))
    
    # 音孔
    meshes.append(make_cylinder(radius=0.075, height=0.02, center=(0, 0.1, 0.08), color="#5A4A3A", segments=12))
    
    # 指板
    meshes.append(make_box([0.12, 1.2, 0.03], center=(0, 0.8, 0.08), color="#8B6545"))
    
    # 琴头
    meshes.append(make_box([0.2, 0.25, 0.08], center=(0, 1.6, 0.08), color="#C8A880"))
    
    # 调音旋钮
    for i in range(3):
        meshes.append(make_sphere(radius=0.025, center=(0.12, 1.55 + i*0.05, 0.08), color="#C0C0C0"))
        meshes.append(make_sphere(radius=0.025, center=(-0.12, 1.55 + i*0.05, 0.08), color="#C0C0C0"))
    
    # 琴弦 (用细线表示)
    for i in range(6):
        x = -0.05 + i * 0.02
        meshes.append(make_box([0.005, 1.4, 0.005], center=(x, 0.8, 0.1), color="#C0C0C0"))
    
    save_glb(meshes, "C07-guitar")
    return meshes

# ============================================================
# C08: 木质路标
# ============================================================

def build_c08_signpost():
    meshes = []
    
    # 立杆
    meshes.append(make_box([0.18, 0.18, 5.5], center=(0, 0, 2.75), color="#A07850"))
    
    # 3块路牌
    signs = ["MY WORK", "ABOUT", "CONTACT"]
    for i, text in enumerate(signs):
        z = 4.5 - i * 1.3
        meshes.append(make_box([1.3, 0.12, 0.1], center=(0.3, 0.15, z), color="#A07850"))
        # 箭头尖端 (三角锥近似)
        meshes.append(make_box([0.2, 0.12, 0.1], center=(-0.5, 0.15, z), color="#A07850"))
    
    # 底座岩石
    meshes.append(make_box([0.6, 0.5, 0.4], center=(0.1, 0.2, 0.2), color="#A8A090"))
    meshes.append(make_box([0.5, 0.4, 0.35], center=(-0.2, 0.15, 0.18), color="#B8B0A0"))
    
    # 小草
    for gx, gz in [(0.2, 0.1), (-0.3, 0.15), (0, 0.05)]:
        meshes.append(make_cylinder(radius=0.02, height=0.15, center=(gx, 0.3, gz), color="#7FB285", segments=4))
    
    save_glb(meshes, "C08-signpost")
    return meshes

# ============================================================
# C09: 藤蔓与氛围
# ============================================================

def build_c09_vines():
    meshes = []
    
    # 3条藤蔓主茎
    vine_configs = [
        ((-2, 0, 5), (-1.5, 0.5, 2)),
        ((0, 0, 5.5), (0.3, -0.3, 3.5)),
        ((2, 0, 5), (1.8, 0.2, 3)),
    ]
    for start, end in vine_configs:
        # 用多个小圆柱连接成曲线
        steps = 8
        for i in range(steps):
            t1 = i / steps
            t2 = (i + 1) / steps
            x1 = start[0] + (end[0] - start[0]) * t1 + math.sin(t1 * math.pi * 2) * 0.2
            z1 = start[2] + (end[2] - start[2]) * t1
            x2 = start[0] + (end[0] - start[0]) * t2 + math.sin(t2 * math.pi * 2) * 0.2
            z2 = start[2] + (end[2] - start[2]) * t2
            dx, dz = x2 - x1, z2 - z1
            length = math.sqrt(dx*dx + dz*dz)
            if length > 0:
                cx, cz = (x1 + x2) / 2, (z1 + z2) / 2
                stem = make_cylinder(radius=0.02, height=length, center=(cx, 0, cz), color="#5A7040", segments=4)
                # 旋转使圆柱沿藤蔓方向
                angle = math.atan2(dx, dz)
                stem.apply_transform(trimesh.transformations.rotation_matrix(angle, [0, 1, 0], stem.centroid))
                meshes.append(stem)
        
        # 叶片
        for i in range(5):
            t = (i + 1) / 6.0
            lx = start[0] + (end[0] - start[0]) * t + math.sin(t * math.pi * 2) * 0.2
            lz = start[2] + (end[2] - start[2]) * t
            meshes.append(make_box([0.15, 0.02, 0.1], center=(lx, 0.05, lz), color="#6B8E5B"))
    
    # LED小灯
    for i in range(6):
        meshes.append(make_sphere(radius=0.03, center=(-1.5 + i*0.5, 0.1, 4.0 - i*0.3), color="#FFE8C4"))
    
    # 蝴蝶
    meshes.append(make_box([0.18, 0.02, 0.12], center=(-1, 0.1, 3.5), color="#F0E0A0"))
    meshes.append(make_box([0.15, 0.02, 0.1], center=(1, 0.15, 4), color="#E8D8F0"))
    
    # 光尘粒子
    for i in range(20):
        x = -2 + (i % 5) * 1.0 + (i * 0.1)
        z = 3 + (i // 5) * 0.5
        meshes.append(make_sphere(radius=0.015, center=(x, 0.05, z), color="#FFF8E0"))
    
    save_glb(meshes, "C09-vines-atmosphere")
    return meshes

# ============================================================
# 生成 Blender Python 脚本
# ============================================================

def write_blender_script():
    """生成完整的Blender Python脚本"""
    script = '''#!/usr/bin/env python3
"""
森系自然风工作室 - Blender 自动生成脚本
用法: 在 Blender 中打开 Scripting 标签页，粘贴此代码并运行
"""

import bpy
import bmesh
import math
from mathutils import Vector

# 清理场景
def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    # 清除所有材质
    for mat in bpy.data.materials:
        bpy.data.materials.remove(mat)

clear_scene()

# ============================================================
# 材质库
# ============================================================

def create_material(name, color, roughness=0.7, metallic=0.0, subsurface=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    principled = mat.node_tree.nodes["Principled BSDF"]
    principled.inputs["Base Color"].default_value = (*color, 1.0)
    principled.inputs["Roughness"].default_value = roughness
    principled.inputs["Metallic"].default_value = metallic
    if subsurface > 0:
        principled.inputs["Subsurface Weight"].default_value = subsurface
    return mat

# 注册材质
MATS = {
    "wall": create_material("Wall", (0.929, 0.910, 0.871), roughness=0.9),
    "floor": create_material("Floor", (0.847, 0.784, 0.706), roughness=0.7),
    "roof": create_material("Roof", (0.690, 0.471, 0.314), roughness=0.6),
    "beam": create_material("Beam", (0.545, 0.396, 0.271), roughness=0.8),
    "wood_light": create_material("WoodLight", (0.784, 0.659, 0.502), roughness=0.6),
    "wood_dark": create_material("WoodDark", (0.627, 0.471, 0.314), roughness=0.7),
    "moss": create_material("Moss", (0.369, 0.557, 0.314), roughness=0.95),
    "rock": create_material("Rock", (0.659, 0.627, 0.565), roughness=0.9),
    "deer": create_material("Deer", (0.910, 0.847, 0.753), roughness=0.8, subsurface=0.1),
    "guitar": create_material("Guitar", (0.784, 0.659, 0.502), roughness=0.5),
    "pink": create_material("Pink", (0.957, 0.769, 0.831), roughness=0.8),
    "screen": create_material("Screen", (0.102, 0.165, 0.102), roughness=0.3),
    "leaf": create_material("Leaf", (0.290, 0.439, 0.251), roughness=0.9),
    "stone": create_material("Stone", (0.659, 0.627, 0.565), roughness=0.85),
}

def set_mat(obj, mat_name):
    if obj.data.materials:
        obj.data.materials[0] = MATS[mat_name]
    else:
        obj.data.materials.append(MATS[mat_name])

# ============================================================
# 创建函数
# ============================================================

def create_box(name, size, location, mat_name):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    set_mat(obj, mat_name)
    return obj

def create_cylinder(name, radius, height, location, mat_name, segments=16):
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=height, location=location, vertices=segments)
    obj = bpy.context.active_object
    obj.name = name
    set_mat(obj, mat_name)
    return obj

def create_sphere(name, radius, location, mat_name, segments=16):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=radius, location=location, segments=segments, ring_count=segments//2)
    obj = bpy.context.active_object
    obj.name = name
    set_mat(obj, mat_name)
    return obj

# ============================================================
# C01: 房间结构
# ============================================================
def build_room():
    # 地板
    board_widths = [1.4, 1.8, 1.6, 1.5, 1.9, 1.8]
    x_offset = -5.0
    floor_colors = [(0.847,0.784,0.706), (0.831,0.769,0.690), (0.855,0.792,0.714), 
                    (0.839,0.776,0.698), (0.824,0.761,0.682), (0.816,0.753,0.675)]
    for i, (w, c) in enumerate(zip(board_widths, floor_colors)):
        mat = create_material(f"Floor{i}", c, roughness=0.7)
        bpy.ops.mesh.primitive_cube_add(size=1, location=(x_offset + w/2, 0, 0.4))
        obj = bpy.context.active_object
        obj.name = f"FloorBoard_{i}"
        obj.scale = (w, 10.0, 0.8)
        if obj.data.materials:
            obj.data.materials[0] = mat
        else:
            obj.data.materials.append(mat)
        x_offset += w + 0.03
    
    # 后墙
    create_box("BackWall", (10.0, 0.3, 8.0), (0, -5.15, 4.8), "wall")
    # 左墙
    create_box("LeftWall", (0.3, 10.0, 8.0), (-5.15, 0, 4.8), "wall")
    # 墙角线
    create_box("TrimBack", (10.0, 0.12, 0.12), (0, -5.0, 0.86), "wood_dark")
    create_box("TrimLeft", (0.12, 10.0, 0.12), (-5.0, 0, 0.86), "wood_dark")
    create_box("TrimCorner", (0.12, 0.12, 8.0), (-5.0, -5.0, 4.8), "wood_dark")
    
    # 屋顶
    roof = create_box("Roof", (10.8, 10.8, 0.45), (0, 0, 8.8), "roof")
    roof.rotation_euler = (math.radians(-12), 0, 0)
    
    # 横梁
    for i in range(3):
        y = -3.5 + i * 3.5
        create_box(f"BeamV_{i}", (10.6, 0.3, 0.3), (0, y, 8.4), "beam")
    for i in range(2):
        x = -2.5 + i * 5.0
        create_box(f"BeamH_{i}", (0.2, 10.6, 0.2), (x, 0, 8.5), "beam")
    
    # 地台
    create_cylinder("BasePlatform", 7.0, 0.5, (0, 0, -0.25), "moss", segments=32)
    
    # 岩石
    rock_positions = [(-5, -3), (-4, 4), (5, -2), (3, 5), (-2, -5), (6, 3)]
    for i, (rx, ry) in enumerate(rock_positions):
        s = 0.5 + i * 0.15
        create_box(f"Rock_{i}", (s, s*0.8, s*0.6), (rx, ry, 0.1), "rock")
    
    # 草簇
    grass_positions = [(-3, -2), (-5, 2), (4, -4), (2, 3), (-1, 5), (5, 0), (-4, -4), (3, -1)]
    for i, (gx, gy) in enumerate(grass_positions):
        for j in range(3):
            h = 0.3 + j * 0.2
            cyl = create_cylinder(f"Grass_{i}_{j}", 0.03, h, (gx + j*0.08, gy + j*0.05, h/2), "moss", segments=6)
    
    # 枯树枝
    for i, (bx, by) in enumerate([(-3, 3), (4, 2)]):
        cyl = create_cylinder(f"Branch_{i}", 0.04, 1.5, (bx, by, 0.8), "wood_dark", segments=6)
        cyl.rotation_euler = (math.radians(15), 0, math.radians(10))

# ============================================================
# C02: 窗户
# ============================================================
def build_window():
    # 窗框矩形
    create_box("WindowFrame", (3.2, 0.25, 4.2), (0, 0, 2.1), "wood_dark")
    # 拱形顶 (用圆柱模拟)
    arch = create_cylinder("WindowArch", 1.6, 0.25, (0, 0, 4.2), "wood_dark", segments=16)
    arch.rotation_euler = (math.radians(90), 0, 0)
    # 玻璃
    glass = create_box("WindowGlass", (2.8, 0.05, 3.8), (0, 0.12, 2.1), "wall")
    glass_mat = create_material("Glass", (0.784, 0.847, 0.878), roughness=0.1)
    glass.data.materials[0] = glass_mat
    # 窗台
    create_box("WindowSill", (4.4, 0.5, 0.2), (0, 0.35, 0.1), "wood_dark")

# ============================================================
# C03: 工作台
# ============================================================
def build_workdesk():
    # 桌面长边
    create_box("DeskTop_Long", (5.2, 2.2, 0.18), (0, 0, 2.5), "wood_light")
    # 桌面短边
    create_box("DeskTop_Short", (2.2, 2.2, 0.18), (2.5, 2.5, 2.5), "wood_light")
    # 桌腿
    legs = [(-2.2, -0.8), (2.2, -0.8), (-2.2, 0.8), (2.2, 2.5)]
    for i, (lx, ly) in enumerate(legs):
        create_cylinder(f"DeskLeg_{i}", 0.09, 2.5, (lx, ly, 1.25), "wood_dark", segments=8)
    # 搁板
    create_box("DeskShelf", (4.8, 0.5, 0.1), (0, -0.8, 1.0), "wood_dark")
    
    # 显示器
    create_box("MonitorBody", (1.6, 0.1, 1.0), (0, 0.15, 3.3), "wall")
    screen = create_box("MonitorScreen", (1.5, 0.02, 0.9), (0, 0.18, 3.3), "screen")
    # 屏幕发光
    screen_mat = create_material("ScreenEmit", (0.4, 0.6, 0.4), roughness=0.3)
    screen.data.materials[0] = screen_mat
    create_box("MonitorStand", (0.3, 0.25, 0.4), (0, 0.15, 2.8), "wood_light")
    create_box("MonitorBase", (0.5, 0.3, 0.05), (0, 0.15, 2.55), "wood_light")
    
    # 键盘
    create_box("Keyboard", (1.0, 0.45, 0.07), (0, 0.6, 2.42), "wall")
    
    # 松果台灯
    create_cylinder("LampBase", 0.1, 0.15, (-1.8, 0.3, 2.65), "wood_dark", segments=8)
    create_cylinder("LampShade", 0.12, 0.15, (-1.8, 0.3, 2.85), "wall", segments=12)
    
    # 蘑菇精灵
    create_sphere("MushroomBody", 0.08, (1.5, 1.5, 2.65), "deer")
    create_cylinder("MushroomCap", 0.09, 0.1, (1.5, 1.5, 2.82), "pink", segments=8)
    
    # 盆栽
    create_cylinder("Pot1", 0.11, 0.18, (0.5, -0.5, 2.65), "wood_dark", segments=8)
    create_sphere("Plant1", 0.08, (0.5, -0.5, 2.85), "leaf")

# ============================================================
# C04: 洞洞板
# ============================================================
def build_pegboard():
    # 板
    create_box("Pegboard", (3.5, 0.06, 4.5), (0, 0, 0), "wood_light")
    # 边框
    create_box("PegFrame_T", (3.66, 0.08, 0.1), (0, 0, 2.25), "wood_dark")
    create_box("PegFrame_B", (3.66, 0.08, 0.1), (0, 0, -2.25), "wood_dark")
    create_box("PegFrame_L", (0.1, 0.08, 4.5), (-1.75, 0, 0), "wood_dark")
    create_box("PegFrame_R", (0.1, 0.08, 4.5), (1.75, 0, 0), "wood_dark")
    
    # 挂件
    create_box("PegFrame1", (0.55, 0.05, 0.7), (-1.0, 0.15, 1.5), "wood_dark")
    create_cylinder("PegBasket", 0.14, 0.22, (0, 0.2, 1.5), "wood_dark", segments=8)
    create_box("PegScissors", (0.25, 0.02, 0.08), (-1.2, 0.12, 0.5), "rock")
    create_box("PegTrowel", (0.3, 0.02, 0.06), (0, 0.12, 0.5), "wood_dark")
    create_sphere("PegRope", 0.09, (1.0, 0.15, 0.5), "wood_light")
    create_cylinder("PegRoll", 0.06, 0.35, (0, 0.15, -1.0), "wood_dark", segments=8)
    create_cylinder("PegSprayer", 0.08, 0.25, (1.2, 0.2, -1.0), "rock", segments=8)

# ============================================================
# C05: 树桩柜
# ============================================================
def build_stump():
    create_cylinder("StumpBody", 1.0, 2.2, (0, 0, 1.1), "wood_dark", segments=16)
    for i in range(3):
        z = 0.4 + i * 0.7
        create_cylinder(f"Drawer_{i}", 0.95, 0.05, (0, 0.55, z), "wood_light", segments=16)
        create_cylinder(f"Handle_{i}", 0.03, 0.2, (0, 0.6, z), "wood_dark", segments=6)
    # 脚
    for i, angle in enumerate([0, 2.1, 4.2]):
        x = math.cos(angle) * 0.6
        z = math.sin(angle) * 0.6 + 0.1
        create_cylinder(f"StumpFoot_{i}", 0.12, 0.2, (x, 0.2, z), "wood_dark", segments=6)
    # 顶部书本
    create_box("Book1", (0.45, 0.35, 0.15), (-0.3, 0.2, 2.35), "leaf")
    create_box("Book2", (0.4, 0.3, 0.12), (-0.25, 0.2, 2.5), "wood_light")
    create_box("Book3", (0.35, 0.25, 0.1), (-0.2, 0.2, 2.62), "wood_dark")
    # 雪花球
    create_sphere("SnowGlobe", 0.15, (0.4, 0.2, 2.4), "wall")
    create_cylinder("GlobeBase", 0.1, 0.08, (0.4, 0.2, 2.18), "wood_light", segments=8)
    # 小圆凳
    create_cylinder("StoolSeat", 0.22, 0.05, (0, 0.5, 0), "wood_light", segments=12)
    for i, angle in enumerate([0, 2.1, 4.2]):
        x = math.cos(angle) * 0.3
        z = math.sin(angle) * 0.3
        leg = create_cylinder(f"StoolLeg_{i}", 0.03, 0.5, (x, 0.3, z), "wood_light", segments=4)
    create_cylinder("StoolCushion", 0.21, 0.06, (0, 0.53, 0), "deer", segments=12)

# ============================================================
# C06: 地毯与小鹿
# ============================================================
def build_rug_deer():
    # 地毯
    create_box("Rug", (3.5, 2.5, 0.06), (0, 0, 0.03), "wood_light")
    # 小鹿身体
    body = create_sphere("DeerBody", 0.45, (0, 0, 0.3), "deer", segments=16)
    body.scale = (1.0, 0.7, 0.6)
    # 头
    create_sphere("DeerHead", 0.18, (0.25, 0.15, 0.45), "deer", segments=12)
    # 耳朵
    create_box("DeerEar_L", (0.08, 0.04, 0.12), (0.3, 0.25, 0.55), "deer")
    create_box("DeerEar_R", (0.08, 0.04, 0.12), (0.2, 0.25, 0.55), "deer")
    # 鹿角
    create_cylinder("Antler_L", 0.02, 0.08, (0.28, 0.2, 0.62), "wood_light", segments=4)
    create_cylinder("Antler_R", 0.02, 0.08, (0.22, 0.2, 0.62), "wood_light", segments=4)
    # 斑点
    for i, (sx, sz) in enumerate([(-0.1, 0.45), (0, 0.5), (0.1, 0.42)]):
        create_sphere(f"DeerSpot_{i}", 0.03, (sx, -0.05, sz), "wall", segments=8)

# ============================================================
# C07: 吉他
# ============================================================
def build_guitar():
    # 琴身上部
    create_box("GuitarUpper", (1.2, 0.5, 0.15), (0, 0, 0), "wood_light")
    # 琴身下部
    create_box("GuitarLower", (0.8, 0.7, 0.15), (0, -0.3, 0), "wood_light")
    # 圆润
    create_sphere("GuitarRound", 0.25, (0, -0.3, 0), "wood_light", segments=12)
    # 音孔
    create_cylinder("SoundHole", 0.075, 0.02, (0, 0.1, 0.08), "wood_dark", segments=12)
    # 指板
    create_box("Fretboard", (0.12, 1.2, 0.03), (0, 0.8, 0.08), "wood_dark")
    # 琴头
    create_box("Headstock", (0.2, 0.25, 0.08), (0, 1.6, 0.08), "wood_light")
    # 旋钮
    for i in range(3):
        create_sphere(f"Tuner_L_{i}", 0.025, (0.12, 1.55 + i*0.05, 0.08), "rock", segments=8)
        create_sphere(f"Tuner_R_{i}", 0.025, (-0.12, 1.55 + i*0.05, 0.08), "rock", segments=8)
    # 琴弦
    for i in range(6):
        x = -0.05 + i * 0.02
        create_box(f"String_{i}", (0.005, 1.4, 0.005), (x, 0.8, 0.1), "rock")

# ============================================================
# C08: 路标
# ============================================================
def build_signpost():
    create_box("SignPost", (0.18, 0.18, 5.5), (0, 0, 2.75), "wood_dark")
    for i in range(3):
        z = 4.5 - i * 1.3
        create_box(f"Sign_{i}", (1.3, 0.12, 0.1), (0.3, 0.15, z), "wood_dark")
    # 岩石
    create_box("RockBase1", (0.6, 0.5, 0.4), (0.1, 0.2, 0.2), "rock")
    create_box("RockBase2", (0.5, 0.4, 0.35), (-0.2, 0.15, 0.18), "stone")
    # 草
    for i, (gx, gz) in enumerate([(0.2, 0.1), (-0.3, 0.15), (0, 0.05)]):
        create_cylinder(f"SignGrass_{i}", 0.02, 0.15, (gx, 0.3, gz), "leaf", segments=4)

# ============================================================
# C09: 藤蔓
# ============================================================
def build_vines():
    configs = [((-2, 5), (-1.5, 2)), ((0, 5.5), (0.3, 3.5)), ((2, 5), (1.8, 3))]
    for vi, (start, end) in enumerate(configs):
        steps = 8
        for i in range(steps):
            t1 = i / steps
            x1 = start[0] + (end[0] - start[0]) * t1 + math.sin(t1 * math.pi * 2) * 0.2
            z1 = start[1] + (end[1] - start[1]) * t1
            t2 = (i + 1) / steps
            x2 = start[0] + (end[0] - start[0]) * t2 + math.sin(t2 * math.pi * 2) * 0.2
            z2 = start[1] + (end[1] - start[1]) * t2
            cx, cz = (x1 + x2) / 2, (z1 + z2) / 2
            length = math.sqrt((x2-x1)**2 + (z2-z1)**2)
            if length > 0.01:
                stem = create_cylinder(f"Vine_{vi}_{i}", 0.02, length, (cx, 0, cz), "leaf", segments=4)
                angle = math.atan2(x2-x1, z2-z1)
                stem.rotation_euler = (0, angle, 0)
        # 叶片
        for i in range(5):
            t = (i + 1) / 6.0
            lx = start[0] + (end[0] - start[0]) * t + math.sin(t * math.pi * 2) * 0.2
            lz = start[1] + (end[1] - start[1]) * t
            create_box(f"VineLeaf_{vi}_{i}", (0.15, 0.02, 0.1), (lx, 0.05, lz), "leaf")
    
    # LED灯
    for i in range(6):
        create_sphere(f"LED_{i}", 0.03, (-1.5 + i*0.5, 0.1, 4.0 - i*0.3), "deer", segments=8)
    # 蝴蝶
    create_box("Butterfly1", (0.18, 0.02, 0.12), (-1, 0.1, 3.5), "deer")
    create_box("Butterfly2", (0.15, 0.02, 0.1), (1, 0.15, 4), "wall")
    # 光尘
    for i in range(20):
        x = -2 + (i % 5) * 1.0 + (i * 0.1)
        z = 3 + (i // 5) * 0.5
        create_sphere(f"Dust_{i}", 0.015, (x, 0.05, z), "deer", segments=4)

# ============================================================
# 主执行
# ============================================================
print("开始生成森系自然风工作室...")
build_room()
build_window()
build_workdesk()
build_pegboard()
build_stump()
build_rug_deer()
build_guitar()
build_signpost()
build_vines()
print("完成！所有组件已生成到场景中。")
'''
    
    path = os.path.join(OUT_PY, "cottagecore_scene.py")
    with open(path, 'w') as f:
        f.write(script)
    print(f"Saved Blender script: {path}")
    return path

# ============================================================
# 主入口
# ============================================================

if __name__ == "__main__":
    print("=" * 60)
    print("森系自然风工作室 3D 资产生成器")
    print("=" * 60)
    
    components = [
        ("C01-room-structure", build_c01_room),
        ("C02-window-decor", build_c02_window),
        ("C03-workdesk", build_c03_workdesk),
        ("C04-pegboard", build_c04_pegboard),
        ("C05-stump-cabinet", build_c05_stump),
        ("C06-rug-deer", build_c06_rug_deer),
        ("C07-guitar", build_c07_guitar),
        ("C08-signpost", build_c08_signpost),
        ("C09-vines-atmosphere", build_c09_vines),
    ]
    
    for name, builder in components:
        print(f"\n生成 {name}...")
        try:
            builder()
        except Exception as e:
            print(f"  错误: {e}")
    
    # 生成Blender脚本
    print("\n生成 Blender Python 脚本...")
    write_blender_script()
    
    print("\n" + "=" * 60)
    print("全部完成！")
    print(f"GLB 预览: {OUT_GLB}/")
    print(f"Blender 脚本: {OUT_PY}/cottagecore_scene.py")
    print("=" * 60)
