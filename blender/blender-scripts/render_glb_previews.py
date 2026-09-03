#!/usr/bin/env python3
"""批量渲染 GLB 预览图: blender --background --factory-startup --python render_glb_previews.py -- <glb_dir> <out_dir>"""
import bpy, sys, os, math
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
glb_dir, out_dir = argv[0], argv[1]
os.makedirs(out_dir, exist_ok=True)

files = sorted(f for f in os.listdir(glb_dir) if f.lower().endswith(".glb"))

for fname in files:
    path = os.path.join(glb_dir, fname)
    # 清空场景
    bpy.ops.wm.read_factory_settings(use_empty=True)
    # 导入
    bpy.ops.import_scene.gltf(filepath=path)
    objs = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    if not objs:
        print(f"SKIP {fname}: no mesh")
        continue
    # 计算整体包围盒
    min_c = Vector((1e9,) * 3); max_c = Vector((-1e9,) * 3)
    for o in objs:
        for corner in o.bound_box:
            wc = o.matrix_world @ Vector(corner)
            min_c = Vector(map(min, min_c, wc)); max_c = Vector(map(max, max_c, wc))
    center = (min_c + max_c) / 2
    size = max_c - min_c
    max_dim = max(size)
    # 等距相机
    cam_data = bpy.data.cameras.new("Cam")
    cam = bpy.data.objects.new("Cam", cam_data)
    bpy.context.scene.collection.objects.link(cam)
    dist = max_dim * 1.9
    cam.location = center + Vector((dist * 0.7, -dist * 0.7, dist * 0.6))
    direction = center - cam.location
    cam.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
    bpy.context.scene.camera = cam
    # 灯光
    sun = bpy.data.objects.new("Sun", bpy.data.lights.new("Sun", 'SUN'))
    sun.data.energy = 3.0
    sun.rotation_euler = (math.radians(50), 0, math.radians(30))
    bpy.context.scene.collection.objects.link(sun)
    # 渲染设置（Cycles CPU，后台模式不依赖 GPU/Metal）
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 32
    scene.render.resolution_x = 512
    scene.render.resolution_y = 512
    scene.render.filepath = os.path.join(out_dir, fname.replace(".glb", ".png"))
    bpy.ops.render.render(write_still=True)
    # 打印尺寸信息供组装参考
    print(f"DIMS {fname}: size=({size.x:.2f}, {size.y:.2f}, {size.z:.2f}) center=({center.x:.2f}, {center.y:.2f}, {center.z:.2f})")
    print(f"OK {fname}")
