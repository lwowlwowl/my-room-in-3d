#!/usr/bin/env python3
"""
运行场景生成脚本后，保存 .blend 文件并导出 GLB
用法: blender --background --factory-startup -P run_and_save.py
"""

import bpy
import os

ASSET_DIR = "/Users/wanghaochen/research/my-website/blender/cottagecore-assets"
SCRIPT = os.path.join(ASSET_DIR, "blender-scripts", "cottagecore_scene.py")

# 1. 执行场景生成脚本
print(">>> 执行场景生成脚本...")
exec(compile(open(SCRIPT).read(), SCRIPT, 'exec'))

# 2. 添加相机和灯光（便于直接渲染）
import math

# 相机: 左前上方45度俯视
bpy.ops.object.camera_add(
    location=(18, 18, 16),
    rotation=(math.radians(60), 0, math.radians(45))
)
camera = bpy.context.active_object
camera.name = "MainCamera"
bpy.context.scene.camera = camera

# 太阳光
sun_data = bpy.data.lights.new(name="SunLight", type='SUN')
sun_data.energy = 3.0
sun_data.color = (1.0, 0.95, 0.88)
sun = bpy.data.objects.new(name="SunLight", object_data=sun_data)
sun.rotation_euler = (math.radians(45), 0, math.radians(45))
bpy.context.collection.objects.link(sun)

# 环境光
world = bpy.data.worlds.get("World") or bpy.data.worlds.new("World")
bpy.context.scene.world = world
world.use_nodes = True
bg_node = world.node_tree.nodes.get("Background")
if bg_node:
    bg_node.inputs[0].default_value = (0.94, 0.92, 0.88, 1.0)  # 暖白
    bg_node.inputs[1].default_value = 0.5

# 3. 保存 .blend
blend_path = os.path.join(ASSET_DIR, "cottagecore-scene.blend")
bpy.ops.wm.save_as_mainfile(filepath=blend_path)
print(f">>> 已保存: {blend_path}")

# 4. 导出 GLB
glb_path = os.path.join(ASSET_DIR, "cottagecore-scene.glb")
bpy.ops.export_scene.gltf(filepath=glb_path, export_format='GLB')
print(f">>> 已导出: {glb_path}")

# 5. 渲染预览图
render_path = os.path.join(ASSET_DIR, "render-preview.png")
bpy.context.scene.render.resolution_x = 1600
bpy.context.scene.render.resolution_y = 1200
bpy.context.scene.render.image_settings.file_format = 'PNG'
bpy.context.scene.render.filepath = render_path
# 用 Workbench 引擎渲染（后台模式最稳定，无 shader 编译依赖）
bpy.context.scene.render.engine = 'BLENDER_WORKBENCH'
# 增强灯光让场景可见
for light_obj in [o for o in bpy.data.objects if o.type == 'LIGHT']:
    light_obj.data.energy = 5.0
# 加一盏填充光
fill_data = bpy.data.lights.new(name="FillLight", type='AREA')
fill_data.energy = 3.0
fill_data.size = 10.0
fill_obj = bpy.data.objects.new(name="FillLight", object_data=fill_data)
fill_obj.location = (5, 5, 8)
fill_obj.rotation_euler = (math.radians(60), 0, math.radians(45))
bpy.context.collection.objects.link(fill_obj)
try:
    bpy.ops.render.render(write_still=True)
    print(f">>> 已渲染: {render_path}")
except Exception as e:
    print(f">>> 渲染失败（不影响.blend/GLB）: {e}")

print(">>> 全部完成!")
