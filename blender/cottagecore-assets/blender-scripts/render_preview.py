#!/usr/bin/env python3
"""
加载已有的 .blend 文件并渲染预览图
用法: blender --background cottagecore-scene.blend -P render_preview.py
"""

import bpy
import math

# 设置渲染引擎
bpy.context.scene.render.engine = 'BLENDER_WORKBENCH'
bpy.context.scene.render.resolution_x = 1600
bpy.context.scene.render.resolution_y = 1200
bpy.context.scene.render.image_settings.file_format = 'PNG'
bpy.context.scene.render.filepath = "/Users/wanghaochen/research/my-website/blender/cottagecore-assets/render-final.png"

# 确保相机正确
if "MainCamera" in bpy.data.objects:
    bpy.context.scene.camera = bpy.data.objects["MainCamera"]

# 增强所有灯光
for obj in bpy.data.objects:
    if obj.type == 'LIGHT':
        obj.data.energy = 10.0

# 加额外填充光
if "FillLight" not in bpy.data.objects:
    fill_data = bpy.data.lights.new(name="FillLight", type='SUN')
    fill_data.energy = 5.0
    fill_obj = bpy.data.objects.new(name="FillLight", object_data=fill_data)
    fill_obj.location = (10, 10, 15)
    fill_obj.rotation_euler = (math.radians(45), 0, math.radians(45))
    bpy.context.collection.objects.link(fill_obj)

# Workbench 特定设置
bpy.context.scene.display.shading.light = 'STUDIO'
bpy.context.scene.display.shading.color_type = 'MATERIAL'

# 渲染
bpy.ops.render.render(write_still=True)
print(">>> 渲染完成: /Users/wanghaochen/research/my-website/blender/cottagecore-assets/render-final.png")
