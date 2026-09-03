#!/usr/bin/env python3
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
