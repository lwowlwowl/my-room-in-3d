#!/usr/bin/env python3
"""森系工作室场景组装脚本
用法: blender --background --factory-startup --python assemble_scene.py -- <tripo_dir> <code_dir> <out_glb> <out_png>
"""
import bpy, sys, os, math
from mathutils import Vector, Euler

argv = sys.argv[sys.argv.index("--") + 1:]
tripo_dir, code_dir, out_glb, out_png = argv[0], argv[1], argv[2], argv[3]

TRIPO = {
    "C01": "C01-木质小型场景3d模型.glb",
    "C02": "C02-窗台花卉装饰3d模型.glb",
    "C03": "C03-木制桌面3d模型.glb",
    "C04": "C04-3d台灯摆件.glb",
    "C05": "C05-树桩夜柜3d模型.glb",
    "C07": "C07-木质迷你工具板3d模型.glb",
    "C08": "C08-木质路牌3d模型.glb",
}
CODE = {
    "C06": "C06-rug-deer.glb",
    "C09": "C09-books.glb",
    "VINES": "vines.glb",
}

# ------------------------------------------------------------------
# 每个组件: rot(z 轴, 度), scale, pos(x,y,z 为模型底部中心落点)
# 初版摆位, 渲染后迭代
# ------------------------------------------------------------------
LAYOUT = {
    "C01":   dict(rot=0,   scale=14.0, pos=(0, 0, 0)),          # 骨架+苔藓底座
    "C03":   dict(rot=90,  scale=5.0,  pos=(0.5, 1.6, 3.16)),   # 工作台贴后墙
    "C02":   dict(rot=-90, scale=5.2,  pos=(0.5, 3.15, 4.3)),   # 窗户贴后墙(底离地~1.1)
    "C07":   dict(rot=90,  scale=4.5,  pos=(-3.35, 0, 4.1)),    # 洞洞板贴左墙
    "C05":   dict(rot=0,   scale=3.1,  pos=(-3.1, -1.4, 3.16)), # 树桩柜左墙角
    "C04":   dict(rot=30,  scale=1.6,  pos=(-2.6, -2.2, 5.96)), # 台灯放树桩柜顶
    "C08":   dict(rot=90,  scale=3.6,  pos=(-5.2, -3.6, 3.16)), # 路牌底座左前
    "C06":   dict(rot=15,  scale=2.2,  pos=(2.0, -1.6, 3.23)),  # 小鹿地毯右前
    "C09":   dict(rot=-15, scale=2.6,  pos=(4.0, 0.8, 3.16)),   # 书堆右侧地板
    "VINES": dict(rot=0,   scale=3.2,  pos=(0, -3.0, 8.6)),     # 藤蔓挂前梁
}
 
BASE_Z = 3.16  # C01 真实地板顶面(raycast 验证)


def clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def import_glb(path):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    new = [o for o in bpy.data.objects if o not in before]
    meshes = [o for o in new if o.type == 'MESH']
    # 挂到一个 empty 上统一控制
    root = bpy.data.objects.new(os.path.basename(path) + ".root", None)
    bpy.context.scene.collection.objects.link(root)
    for o in new:
        if o.parent is None or o.parent not in new:
            o.parent = root
    return root, meshes


def bbox(objs):
    mn = Vector((1e9,) * 3); mx = Vector((-1e9,) * 3)
    for o in objs:
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c)
            mn = Vector(map(min, mn, w)); mx = Vector(map(max, mx, w))
    return mn, mx


def darken_materials(meshes, factor=(0.62, 0.55, 0.48)):
    """给 C03 材质乘暗色系数，避免桌子和地板颜色融合"""
    for o in meshes:
        for slot in o.material_slots:
            mat = slot.material
            if not mat or not mat.use_nodes:
                continue
            bsdf = next((n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'), None)
            if not bsdf:
                continue
            inp = bsdf.inputs['Base Color']
            if inp.is_linked:
                src = inp.links[0].from_socket
                mix = mat.node_tree.nodes.new('ShaderNodeMix')
                mix.data_type = 'RGBA'
                mix.blend_type = 'MULTIPLY'
                mix.inputs['Factor'].default_value = 1.0
                mix.inputs[7].default_value = (*factor, 1.0)  # B 输入
                mat.node_tree.links.new(src, mix.inputs[6])   # A 接原颜色
                mat.node_tree.links.new(mix.outputs[2], inp)
            else:
                c = inp.default_value
                inp.default_value = (c[0]*factor[0], c[1]*factor[1], c[2]*factor[2], c[3])


def place(key, path, cfg):
    root, meshes = import_glb(path)
    bpy.context.view_layer.update()
    mn, mx = bbox(meshes)
    size = mx - mn
    center = (mn + mx) / 2
    # 1. 归一: 底部中心到原点
    root.location = -Vector((center.x, center.y, mn.z))
    # 2. 旋转
    root.rotation_euler = Euler((0, 0, math.radians(cfg["rot"])), 'XYZ')
    # 3. 缩放
    root.scale = (cfg["scale"],) * 3
    bpy.context.view_layer.update()
    # 4. 平移到目标位置(旋转缩放后重新计算底部中心)
    mn2, mx2 = bbox(meshes)
    c2 = (mn2 + mx2) / 2
    target = Vector((cfg["pos"][0], cfg["pos"][1], cfg["pos"][2]))
    root.location += target - Vector((c2.x, c2.y, mn2.z))
    bpy.context.view_layer.update()
    mn3, mx3 = bbox(meshes)
    print(f"PLACED {key}: size=({(mx3-mn3).x:.1f},{(mx3-mn3).y:.1f},{(mx3-mn3).z:.1f}) "
          f"z=[{mn3.z:.1f},{mx3.z:.1f}]")
    if key == "C03":
        darken_materials(meshes)
    if key == "C01":
        # 苔藓颜色修复: 用几何蒙版校正后的纹理替换 Tripo 烘暗的原图
        fixed_tex = "3d/textures/C01-basecolor-moss.jpg"
        if os.path.exists(fixed_tex):
            for o in meshes:
                for slot in o.material_slots:
                    mat = slot.material
                    if mat and mat.use_nodes:
                        for n in mat.node_tree.nodes:
                            if n.type == 'TEX_IMAGE' and n.image and 'basecolor' in n.image.name.lower():
                                n.image = bpy.data.images.load(fixed_tex, check_existing=True)


clear()

import os as _os
_ONLY = _os.environ.get("ONLY")  # 调试: ONLY=C01,C03 只摆这些
for key, fname in {**TRIPO, **CODE}.items():
    if _ONLY and key not in _ONLY.split(","):
        continue
    d = tripo_dir if key in TRIPO else code_dir
    place(key, os.path.join(d, fname), LAYOUT[key])

# ------------------------------------------------------------------
# 灯光
# ------------------------------------------------------------------
sun = bpy.data.objects.new("Sun", bpy.data.lights.new("Sun", 'SUN'))
sun.data.energy = 4.0
sun.data.color = (1.0, 0.96, 0.88)
sun.rotation_euler = Euler((math.radians(50), 0, math.radians(-35)), 'XYZ')
bpy.context.scene.collection.objects.link(sun)

fill = bpy.data.objects.new("Fill", bpy.data.lights.new("Fill", 'AREA'))
fill.data.energy = 1800
fill.data.size = 14
fill.data.color = (0.85, 0.92, 1.0)
fill.location = (-10, -14, 12)
fill.rotation_euler = Euler((math.radians(50), 0, math.radians(40)), 'XYZ')
bpy.context.scene.collection.objects.link(fill)

# 室内暖色主光(模拟台灯/窗光氛围)
warm = bpy.data.objects.new("Warm", bpy.data.lights.new("Warm", 'POINT'))
warm.data.energy = 1500
warm.data.color = (1.0, 0.85, 0.65)
warm.data.shadow_soft_size = 1.5
warm.location = (1.5, 1.5, 7.5)
bpy.context.scene.collection.objects.link(warm)

# ------------------------------------------------------------------
# 相机(等距感透视)
# ------------------------------------------------------------------
cam = bpy.data.objects.new("Cam", bpy.data.cameras.new("Cam"))
cam.data.lens = 40
bpy.context.scene.collection.objects.link(cam)
cam.location = (13, -15, 13)
look = Vector((1.0, 1.2, 6.0))
cam.rotation_euler = (look - Vector(cam.location)).to_track_quat('-Z', 'Y').to_euler()
bpy.context.scene.camera = cam

# ------------------------------------------------------------------
# 渲染 + 导出
# ------------------------------------------------------------------
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 64
scene.render.resolution_x = 1024
scene.render.resolution_y = 1024
scene.render.filepath = out_png
bpy.ops.render.render(write_still=True)

# 俯视图(校验摆位用)
cam_top = bpy.data.objects.new("CamTop", bpy.data.cameras.new("CamTop"))
cam_top.data.type = 'ORTHO'
cam_top.data.ortho_scale = 18
bpy.context.scene.collection.objects.link(cam_top)
cam_top.location = (1.0, 1.0, 30)
cam_top.rotation_euler = (0, 0, 0)
bpy.context.scene.camera = cam_top
scene.render.resolution_x = 768
scene.render.resolution_y = 768
scene.render.filepath = out_png.replace(".png", "-top.png")
bpy.ops.render.render(write_still=True)

bpy.ops.export_scene.gltf(filepath=out_glb, export_format='GLB')
print(f"SCENE OK -> {out_glb}")
