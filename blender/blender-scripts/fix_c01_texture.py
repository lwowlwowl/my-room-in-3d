"""
Fix C01 moss: Tripo baked moss as neutral dark brown (no green dominance).
Approach: identify moss texels geometrically — vertices below floor level and
outside the room footprint are the moss ring; scatter their UVs into a mask,
dilate, then recolor those texels to fresh moss green (luma-preserving).
Bright texels (rocks) are excluded so stones keep their color.
Output: 3d/textures/C01-basecolor-moss.jpg + preview png.
"""
import bpy
import numpy as np
import sys, os

argv = sys.argv[sys.argv.index("--") + 1:]
glb_path, out_dir = argv[0], argv[1]
os.makedirs(out_dir, exist_ok=True)

SCALE = 14.0
FLOOR_TOP = 3.16          # scaled
BASE_TOP = 3.25           # 底座整体(顶面苔藓也在 ~3.16)
ROOM_X, ROOM_Y = 5.15, 4.3  # 地板矩形半宽, 外圈才是苔藓

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb_path)

# ---- 1. find mesh + collect moss UVs ----
mesh_obj = next(o for o in bpy.context.scene.objects if o.type == 'MESH')
me = mesh_obj.data
uv_layer = me.uv_layers.active.data
mw = mesh_obj.matrix_world

moss_uvs = []
for poly in me.polygons:
    uvs = [uv_layer[loop].uv for loop in poly.loop_indices]
    verts = [mw @ me.vertices[v].co for v in poly.vertices]
    # a face is moss if ANY of its verts is in the moss region (base ring)
    is_moss = False
    for v in verts:
        zs, xs, ys = v.z * SCALE, v.x * SCALE, v.y * SCALE
        if zs < BASE_TOP and (abs(xs) > ROOM_X or abs(ys) > ROOM_Y):
            is_moss = True
            break
    if is_moss:
        moss_uvs.extend(uvs)

print(f"MOSS-FACES-UVS: {len(moss_uvs)} uv points collected")

# ---- 2. load texture, build UV mask ----
img = next(i for i in bpy.data.images if i.source == 'FILE' and 'basecolor' in i.name.lower())
w, h = img.size
px = np.array(img.pixels[:], dtype=np.float32).reshape(h, w, 4)
srgb = np.power(np.clip(px[..., :3], 0, 1), 1 / 2.2)

mask = np.zeros((h, w), dtype=np.uint8)
us = np.array([uv.x for uv in moss_uvs])
vs = np.array([uv.y for uv in moss_uvs])
iu = np.clip((us * w).astype(np.int32), 0, w - 1)
iv = np.clip((vs * h).astype(np.int32), 0, h - 1)
mask[iv, iu] = 1.0

# dilate to cover triangle interiors between scattered verts
def dilate(m, it):
    for _ in range(it):
        m = m | np.roll(m, 1, 0) | np.roll(m, -1, 0) | np.roll(m, 1, 1) | np.roll(m, -1, 1)
    return m
mask = dilate(mask, 25)

# feather edges (simple box blur x2)
mask = mask.astype(np.float32)
k = np.ones((3, 3), dtype=np.float32) / 9.0
def blur(m):
    p = np.pad(m, 1, mode='edge')
    out = np.zeros_like(m)
    for dy in range(3):
        for dx in range(3):
            out += p[dy:dy+h, dx:dx+w] * k[dy, dx]
    return out
mask = blur(blur(mask))

# ---- 3. recolor: only dark texels inside moss mask (keep bright rocks) ----
lum = srgb.max(axis=-1)
dark = np.clip((0.5 - lum) / 0.2, 0, 1)          # rocks (bright) excluded
sel = (mask * dark)[..., None]

l = lum[..., None]
# 染色而非平涂: 保留并增强原纹理颗粒(苔藓团块感), 只把色相推向绿
base = np.power(np.clip(srgb, 0, 1), 0.70)           # 温和提亮
tint = np.concatenate([
    np.full_like(l, 0.50),                            # R 压低
    np.full_like(l, 1.32),                            # G 增强
    np.full_like(l, 0.48),                            # B 压低
], axis=-1)
target = np.clip(base * tint, 0, 1)

# 高通细节增强: 用低频背景归一化原图, 把苔藓颗粒对比拉回来
small = lum[::16, ::16]
low = np.repeat(np.repeat(small, 16, axis=0), 16, axis=1)[:h, :w]
detail = np.clip(srgb / np.maximum(low, 0.03)[..., None], 0.45, 2.1)
target = np.clip(target * np.power(detail, 0.85), 0, 1)
out_srgb = srgb * (1 - sel) + target * sel
out_rgb = np.power(out_srgb, 2.2)
out = np.concatenate([out_rgb, px[..., 3:4]], axis=-1)

fixed = bpy.data.images.new("C01-moss", width=w, height=h, alpha=False)
fixed.pixels = out.ravel().tolist()
fixed.filepath_raw = os.path.join(out_dir, "C01-basecolor-moss.jpg")
fixed.file_format = 'JPEG'
fixed.save()

prev = out[::16, ::16]
prev_img = bpy.data.images.new("prev", width=prev.shape[1], height=prev.shape[0], alpha=False)
prev_img.pixels = prev.ravel().tolist()
prev_img.filepath_raw = os.path.join(out_dir, "C01-moss-preview.png")
prev_img.file_format = 'PNG'
prev_img.save()

print(f"MASK-COVERAGE: {float(sel.mean()) * 100:.1f}% of texels recolored")
print("SAVED:", fixed.filepath_raw)
