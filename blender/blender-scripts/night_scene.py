"""
Night lighting for test1.blend (user's own furniture layout).
Removes old Light/Camera/Cube, adds 4 night light sources + moon fill,
renders preview, saves test1-night.blend, exports night GLB.
Furniture objects are NOT touched.
"""
import bpy, sys, math
from mathutils import Euler, Vector

argv = sys.argv[sys.argv.index("--") + 1:]
out_blend, out_glb, out_png = argv[0], argv[1], argv[2]

sc = bpy.context.scene

# ---------- 1. remove old light / camera / stray cube ----------
for name in ("Light", "Camera", "Cube"):
    o = bpy.data.objects.get(name)
    if o:
        bpy.data.objects.remove(o, do_unlink=True)

# ---------- 2. compute world bboxes of furniture ----------
def world_bbox(obj):
    deps = bpy.context.evaluated_depsgraph_get()
    corners = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
    mn = Vector((min(c.x for c in corners), min(c.y for c in corners), min(c.z for c in corners)))
    mx = Vector((max(c.x for c in corners), max(c.y for c in corners), max(c.z for c in corners)))
    return mn, mx

def find_root_mesh(prefix):
    for o in sc.objects:
        if o.type == 'MESH' and o.parent and o.parent.name.startswith(prefix):
            return o
    return None

def center_top(prefix, drop=0.0):
    m = find_root_mesh(prefix)
    mn, mx = world_bbox(m)
    c = (mn + mx) / 2
    return Vector((c.x, c.y, mx.z - drop)), (mn, mx)

lamp_pos, lamp_bb = center_top("C04-", drop=0.55)     # 台灯灯罩处
orb_pos,  orb_bb  = center_top("C05-", drop=0.15)     # 树桩柜顶白球
sign_pos, sign_bb = center_top("C08-", drop=0.6)      # 路牌上方
print("LAMP:", lamp_pos, "| ORB:", orb_pos, "| SIGN:", sign_pos)

# ---------- 3. night world ----------
w = bpy.data.worlds.new("Night") if sc.world is None else sc.world
w.use_nodes = True
bg = w.node_tree.nodes.get("Background")
bg.inputs[0].default_value = (0.010, 0.016, 0.035, 1.0)  # 深蓝夜色
bg.inputs[1].default_value = 1.0
sc.world = w

def add_light(name, ltype, loc, color, energy, radius=0.25, spot_size=None, rot=None):
    ld = bpy.data.lights.new(name, ltype)
    ld.color = color
    ld.energy = energy
    if ltype == 'POINT' or ltype == 'SPOT':
        ld.shadow_soft_size = radius
    if ltype == 'SPOT' and spot_size:
        ld.spot_size = spot_size
        ld.spot_blend = 0.6
    o = bpy.data.objects.new(name, ld)
    o.location = loc
    if rot:
        o.rotation_euler = Euler(rot, 'XYZ')
    sc.collection.objects.link(o)
    return o

# ① 台灯暖光 — 桌面阅读区
add_light("Lamp-Warm", 'POINT', lamp_pos, (1.0, 0.70, 0.40), 150, radius=0.3)
# ② 树桩柜白球夜灯 — 柔和暖白
add_light("Orb-Night", 'POINT', orb_pos, (1.0, 0.82, 0.60), 70, radius=0.2)
# ③ 路牌冷光照牌 — 淡蓝月光色
add_light("Sign-Moon", 'SPOT', sign_pos + Vector((0.6, 1.2, 1.6)), (0.72, 0.80, 1.0), 300,
          radius=0.3, spot_size=math.radians(55),
          rot=(Vector(sign_pos) - Vector((sign_pos.x + 0.6, sign_pos.y + 1.2, sign_pos.z + 1.6))).to_track_quat('-Z', 'Y').to_euler())
# ④ 窗方向月光 — 冷蓝主光，从右前上方向后墙照
add_light("Moon", 'SUN', (8, -10, 14), (0.55, 0.66, 1.0), 1.6,
          rot=Euler((math.radians(55), 0, math.radians(-30)), 'XYZ'))
# 极弱室内补光防死黑
add_light("Fill-Faint", 'POINT', (0.5, 1.0, 9.5), (0.9, 0.85, 0.8), 60, radius=2.0)

# ---------- 4. camera: keep movie-like angle ----------
cam = bpy.data.objects.new("Camera", bpy.data.cameras.new("Camera"))
sc.collection.objects.link(cam)
cam.location = (12.5, -14.5, 11.5)
look = Vector((0.0, 0.9, 4.8))
cam.rotation_euler = (look - Vector(cam.location)).to_track_quat('-Z', 'Y').to_euler()
cam.data.lens = 42
sc.camera = cam

# ---------- 5. render settings: night = longer exposure ----------
sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = 128
sc.view_settings.view_transform = 'Filmic'
sc.view_settings.look = 'Medium High Contrast'
sc.view_settings.exposure = 0.8
sc.render.resolution_x = 1024
sc.render.resolution_y = 1024
sc.render.filepath = out_png

bpy.ops.render.render(write_still=True)
print("RENDER SAVED:", out_png)

# ---------- 6. save blend + export glb ----------
bpy.ops.wm.save_as_mainfile(filepath=out_blend)
print("BLEND SAVED:", out_blend)

bpy.ops.export_scene.gltf(filepath=out_glb, export_format='GLB', export_lights=True, export_cameras=True)
print("GLB SAVED:", out_glb)
