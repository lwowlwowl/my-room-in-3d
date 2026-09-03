# Concept v2 — cozy corner diorama. Compact (6.4m), furniture hugging the
# walls, high prop density, soft cream-pink backdrop, rounded everything.
import bpy
import math
from mathutils import Vector

# ---------------------------------------------------------------- helpers
def clean():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    for blk in (bpy.data.meshes, bpy.data.materials, bpy.data.lights, bpy.data.textures, bpy.data.cameras):
        for b in blk: blk.remove(b, do_unlink=True)

def mat(name, color, rough=0.8, metal=0.0, emit=None, emit_i=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bs = m.node_tree.nodes["Principled BSDF"]
    bs.inputs["Base Color"].default_value = (*color, 1)
    bs.inputs["Roughness"].default_value = rough
    if "Metallic" in bs.inputs: bs.inputs["Metallic"].default_value = metal
    if emit:
        bs.inputs["Emission Color"].default_value = (*emit, 1)
        bs.inputs["Emission Strength"].default_value = emit_i
    return m

def box(name, loc, size, m, bevel=0.0, segs=3):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    if bevel > 0:
        b = o.modifiers.new("Bevel", 'BEVEL')
        b.width = bevel; b.segments = segs
        b.limit_method = 'ANGLE'; b.harden_normals = True
    o.data.materials.append(m)
    return o

def cyl(name, loc, r, depth, m, rot=(0,0,0), verts=24):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=loc, rotation=rot, vertices=verts)
    o = bpy.context.active_object
    o.name = name
    o.data.materials.append(m)
    return o

def sphere(name, loc, r, m, sub=2):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=24, ring_count=16)
    o = bpy.context.active_object
    o.name = name
    o.data.materials.append(m)
    s = o.modifiers.new("Sub", 'SUBSURF'); s.levels = 1; s.render_levels = sub
    return o

def plane(name, loc, size, m, rot=(0,0,0)):
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.name = name
    o.scale = (size[0], size[1], 1)
    bpy.ops.object.transform_apply(scale=True)
    o.data.materials.append(m)
    return o

def aim(obj, target):
    d = Vector(target) - obj.location
    obj.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()

clean()

# ---------------------------------------------------------------- palette — warm oak / cream / dusty rose
WOOD_D  = mat("WoodDark", (0.30, 0.19, 0.11), rough=0.55)
WOOD_M  = mat("WoodMid",  (0.48, 0.32, 0.19), rough=0.55)
WALL    = mat("Wall",     (0.95, 0.88, 0.80), rough=0.95)
WALL_L  = mat("WallLeft", (0.93, 0.84, 0.81), rough=0.95)  # whisper of pink
TRIM    = mat("Trim",     (0.92, 0.86, 0.76), rough=0.85)
FABRIC_C= mat("FabCream", (0.95, 0.92, 0.87), rough=0.95)
DUVET   = mat("Duvet",    (0.88, 0.62, 0.55), rough=0.98)  # dusty rose duvet
DUVET2  = mat("Duvet2",   (0.93, 0.82, 0.72), rough=0.98)
THROW   = mat("Throw",    (0.76, 0.44, 0.33), rough=0.95)
RUG     = mat("Rug",      (0.72, 0.50, 0.42), rough=1.0)
RUG2    = mat("RugRing",  (0.86, 0.72, 0.62), rough=1.0)
METAL   = mat("Metal",    (0.85, 0.75, 0.55), rough=0.3, metal=1.0)
BLACK   = mat("Black",    (0.035, 0.035, 0.04), rough=0.4)
SCREEN  = mat("Screen",   (0.4, 0.6, 0.75), rough=0.3, emit=(0.45, 0.65, 0.85), emit_i=1.5)
SHADE   = mat("Shade",    (1.0, 0.92, 0.78), rough=0.8, emit=(1.0, 0.85, 0.6), emit_i=0.7)
BULB    = mat("Bulb",     (1.0, 0.9, 0.7), rough=0.5, emit=(1.0, 0.85, 0.6), emit_i=8.0)
SKY     = mat("Sky",      (1.0, 0.80, 0.55), rough=1.0, emit=(1.0, 0.78, 0.5), emit_i=3.5)
POT     = mat("Pot",      (0.60, 0.38, 0.28), rough=0.7)
LEAF    = mat("Leaf",     (0.34, 0.52, 0.28), rough=0.9)
LEAF2   = mat("Leaf2",    (0.45, 0.60, 0.30), rough=0.9)
FRAME   = mat("Frame",    (0.45, 0.33, 0.22), rough=0.5)
PILLOW  = mat("Pillow",   (0.97, 0.95, 0.91), rough=0.95)
PLUSH   = mat("Plush",    (0.85, 0.55, 0.60), rough=1.0)   # pink plush toy
BOOK_R  = mat("BookR",    (0.72, 0.35, 0.30), rough=0.85)
BOOK_B  = mat("BookB",    (0.35, 0.50, 0.55), rough=0.85)
BOOK_Y  = mat("BookY",    (0.85, 0.70, 0.40), rough=0.85)
BOOK_G  = mat("BookG",    (0.50, 0.62, 0.45), rough=0.85)
MUG     = mat("Mug",      (0.62, 0.72, 0.58), rough=0.4)
CERAMIC = mat("Ceramic",  (0.95, 0.90, 0.84), rough=0.3)
LAUNDRY = mat("Laundry",  (0.80, 0.78, 0.74), rough=0.95)

# ---------------------------------------------------------------- room shell — compact 6.4m
R = 6.4
plank_w = 0.42
for i in range(int(R / plank_w)):
    x = i * plank_w + plank_w / 2
    tone = 0.92 + ((i * 37) % 10) / 45
    box(f"Plank{i}", (x, R/2, -0.03), (plank_w - 0.006, R, 0.06),
        mat(f"P{i}", (0.58*tone, 0.42*tone, 0.27*tone), rough=0.45), bevel=0.004, segs=1)

WALL_T, WALL_H = 0.22, 4.4
WX0, WX1, WZ0, WZ1 = 2.6, 4.6, 0.9, 3.3   # window in back wall
box("BackW_b1", (WX0/2, -WALL_T/2, WZ0/2), (WX0, WALL_T, WZ0), WALL)
box("BackW_b2", ((WX1+R)/2, -WALL_T/2, WZ0/2), (R-WX1, WALL_T, WZ0), WALL)
box("BackW_t1", (WX0/2, -WALL_T/2, (WZ1+WALL_H)/2), (WX0, WALL_T, WALL_H-WZ1), WALL)
box("BackW_t2", ((WX1+R)/2, -WALL_T/2, (WZ1+WALL_H)/2), (R-WX1, WALL_T, WALL_H-WZ1), WALL)
box("LeftWall", (-WALL_T/2, R/2, WALL_H/2), (WALL_T, R, WALL_H), WALL_L)
box("BaseB", (R/2, 0.03, 0.08), (R, 0.06, 0.16), TRIM, bevel=0.012)
box("BaseL", (0.03, R/2, 0.08), (0.06, R, 0.16), TRIM, bevel=0.012)
# window frame + mullions + sill
fm = WOOD_M
box("WinF_T", ((WX0+WX1)/2, -WALL_T/2, WZ1+0.05), (WX1-WX0+0.16, WALL_T+0.05, 0.1), fm, bevel=0.02)
box("WinF_B", ((WX0+WX1)/2, -WALL_T/2, WZ0-0.05), (WX1-WX0+0.16, WALL_T+0.05, 0.1), fm, bevel=0.02)
box("WinF_L", (WX0-0.05, -WALL_T/2, (WZ0+WZ1)/2), (0.1, WALL_T+0.05, WZ1-WZ0), fm, bevel=0.02)
box("WinF_R", (WX1+0.05, -WALL_T/2, (WZ0+WZ1)/2), (0.1, WALL_T+0.05, WZ1-WZ0), fm, bevel=0.02)
box("MulV", ((WX0+WX1)/2, -WALL_T/2, (WZ0+WZ1)/2), (0.05, 0.09, WZ1-WZ0), fm)
box("MulH", ((WX0+WX1)/2, -WALL_T/2, (WZ0+WZ1)/2), (WX1-WX0, 0.09, 0.05), fm)
box("Sill", ((WX0+WX1)/2, 0.16, WZ0-0.02), (WX1-WX0+0.3, 0.22, 0.07), TRIM, bevel=0.02)
plane("SkyPanel", ((WX0+WX1)/2, -1.5, (WZ0+WZ1)/2), (WX1-WX0+2.2, WZ1-WZ0+2.2), SKY)
aim(bpy.data.objects["SkyPanel"], ((WX0+WX1)/2, 4, 2.2))
# tiny plant + fairy lights on the sill
cyl("SillPot", (WX0+0.35, 0.16, WZ0+0.12), 0.06, 0.1, POT)
sphere("SillLeaf", (WX0+0.35, 0.16, WZ0+0.22), 0.09, LEAF2, sub=1)
for i in range(9):
    t = i / 8.0
    lx = WX0 + t * (WX1 - WX0)
    lz = WZ1 - 0.02 - math.sin(t * math.pi) * 0.28
    sphere(f"Fairy{i}", (lx, 0.14, lz), 0.022, BULB, sub=1)

# ---------------------------------------------------------------- rug — center stage
cyl("Rug", (3.0, 3.6, 0.03), 1.55, 0.02, RUG, verts=48)
cyl("RugRing", (3.0, 3.6, 0.04), 1.1, 0.012, RUG2, verts=48)

# ---------------------------------------------------------------- bed — tucked into the corner (back-left)
bx, by, bw, bl = 1.05, 1.25, 1.55, 2.05
box("BedFrame", (bx, by, 0.22), (bw, bl, 0.22), WOOD_D, bevel=0.05)
box("Headboard", (bx, by - bl/2 + 0.08, 0.75), (bw, 0.13, 0.75), WOOD_M, bevel=0.06)
box("Mattress", (bx, by + 0.06, 0.42), (bw-0.14, bl-0.24, 0.2), FABRIC_C, bevel=0.09)
bpy.ops.mesh.primitive_cube_add(size=1, location=(bx, by + 0.3, 0.56))
duv = bpy.context.active_object; duv.name = "Duvet"
duv.scale = (bw-0.08, bl-0.7, 0.18)
bpy.ops.object.transform_apply(scale=True)
sub = duv.modifiers.new("Sub", 'SUBSURF'); sub.levels = 3; sub.render_levels = 4
t1 = bpy.data.textures.new("DuvN", 'CLOUDS'); t1.noise_type='SOFT_NOISE'; t1.noise_scale = 0.5
d1 = duv.modifiers.new("Dis", 'DISPLACE'); d1.texture = t1; d1.strength = 0.075; d1.mid_level = 0.55
sm = duv.modifiers.new("Smo", 'SMOOTH'); sm.iterations = 8
duv.data.materials.append(DUVET)
bpy.ops.mesh.primitive_cube_add(size=1, location=(bx, by + 0.72, 0.68))
fl = bpy.context.active_object; fl.name = "DuvetFold"
fl.scale = (bw-0.1, 0.5, 0.1)
bpy.ops.object.transform_apply(scale=True)
s2 = fl.modifiers.new("Sub", 'SUBSURF'); s2.levels = 2; s2.render_levels = 3
t2 = bpy.data.textures.new("FoldN", 'CLOUDS'); t2.noise_scale = 0.8
d2 = fl.modifiers.new("Dis", 'DISPLACE'); d2.texture = t2; d2.strength = 0.045
fl.data.materials.append(DUVET2)
for i, (px, py) in enumerate([(bx-0.33, by-bl/2+0.42), (bx+0.34, by-bl/2+0.45)]):
    p = box(f"Pillow{i}", (px, py, 0.56), (0.6, 0.42, 0.14), PILLOW, bevel=0.08, segs=6)
    s = p.modifiers.new("Sub", 'SUBSURF'); s.levels = 2; s.render_levels = 3
bpy.ops.mesh.primitive_cube_add(size=1, location=(bx, by+0.85, 0.62))
tb = bpy.context.active_object; tb.name = "ThrowBand"
tb.scale = (bw-0.06, 0.4, 0.08)
bpy.ops.object.transform_apply(scale=True)
s3 = tb.modifiers.new("Sub", 'SUBSURF'); s3.levels = 2; s3.render_levels = 3
t3 = bpy.data.textures.new("ThrN", 'CLOUDS'); t3.noise_scale = 0.7
d3 = tb.modifiers.new("Dis", 'DISPLACE'); d3.texture = t3; d3.strength = 0.04
tb.data.materials.append(THROW)
# plush bunny on the bed
sphere("PlushBody", (bx+0.42, by-bl/2+0.75, 0.72), 0.11, PLUSH, sub=2)
sphere("PlushHead", (bx+0.42, by-bl/2+0.75, 0.86), 0.08, PLUSH, sub=2)
sphere("PlushEar1", (bx+0.36, by-bl/2+0.72, 0.94), 0.03, PLUSH, sub=1)
sphere("PlushEar2", (bx+0.48, by-bl/2+0.72, 0.94), 0.03, PLUSH, sub=1)
box("BedBook", (bx-0.35, by+0.55, 0.64), (0.22, 0.16, 0.03), BOOK_Y, bevel=0.01)

# ---------------------------------------------------------------- nightstand cluster — dense!
nx, ny = 1.15, 2.65
box("Nstand", (nx, ny, 0.26), (0.55, 0.5, 0.52), WOOD_M, bevel=0.04)
cyl("Nknob", (nx, ny+0.26, 0.32), 0.02, 0.03, METAL, rot=(math.pi/2, 0, 0))
cyl("NLbase", (nx-0.13, ny, 0.55), 0.07, 0.04, METAL)
cyl("NLshade", (nx-0.13, ny, 0.74), 0.13, 0.19, SHADE)
sphere("NLbulb", (nx-0.13, ny, 0.72), 0.035, BULB, sub=1)
l1 = bpy.data.lights.new("L1", 'POINT'); l1.energy = 18; l1.color = (1.0, 0.82, 0.6)
o1 = bpy.data.objects.new("L1O", l1); o1.location = (nx-0.13, ny, 0.74)
bpy.context.collection.objects.link(o1)
box("Nb1", (nx+0.12, ny+0.06, 0.55), (0.24, 0.17, 0.05), BOOK_R, bevel=0.012)
box("Nb2", (nx+0.13, ny+0.04, 0.60), (0.22, 0.16, 0.045), BOOK_B, bevel=0.012)
box("Nb3", (nx+0.11, ny+0.07, 0.645), (0.2, 0.15, 0.04), BOOK_G, bevel=0.012)
cyl("Nplant", (nx+0.13, ny-0.14, 0.58), 0.045, 0.07, CERAMIC)
sphere("Nleaf", (nx+0.13, ny-0.14, 0.66), 0.06, LEAF2, sub=1)

# ---------------------------------------------------------------- desk — back wall, right of window
dx, dy = 5.55, 0.62
box("DeskTop", (dx, dy, 0.72), (1.7, 0.72, 0.05), WOOD_M, bevel=0.022)
for lx, ly in [(dx-0.72, dy-0.26), (dx+0.72, dy-0.26), (dx-0.72, dy+0.26), (dx+0.72, dy+0.26)]:
    cyl("Dleg", (lx, ly, 0.36), 0.035, 0.72, WOOD_D)
box("MonB", (dx, dy-0.06, 1.18), (0.78, 0.04, 0.44), BLACK, bevel=0.01)
plane("MonS", (dx, dy-0.037, 1.18), (0.72, 0.40), SCREEN, rot=(math.pi/2, 0, 0))
cyl("MonSt", (dx, dy-0.06, 0.93), 0.022, 0.12, BLACK)
box("MonBa", (dx, dy-0.06, 0.76), (0.22, 0.14, 0.016), BLACK, bevel=0.008)
box("Kb", (dx, dy+0.22, 0.75), (0.44, 0.15, 0.018), BLACK, bevel=0.008)
sphere("Mouse", (dx+0.38, dy+0.24, 0.765), 0.045, BLACK, sub=1)
cyl("Mug", (dx-0.62, dy+0.14, 0.78), 0.05, 0.1, MUG)
cyl("PenCup", (dx+0.62, dy+0.05, 0.78), 0.045, 0.09, CERAMIC)
cyl("Pen1", (dx+0.63, dy+0.05, 0.85), 0.005, 0.09, BOOK_R, rot=(0.12, 0, 0.1))
cyl("Pen2", (dx+0.61, dy+0.06, 0.85), 0.005, 0.08, BOOK_B, rot=(-0.1, 0, -0.15))
# shelf above desk with books + tiny succulents
box("Dshelf", (dx, 0.06, 2.1), (1.3, 0.2, 0.045), WOOD_D, bevel=0.01)
for i, (ox, c, w, h) in enumerate([
    (-0.45, BOOK_R, 0.05, 0.26), (-0.36, BOOK_Y, 0.045, 0.22), (-0.27, BOOK_B, 0.05, 0.24),
    (-0.18, BOOK_G, 0.04, 0.20), (0.18, None, 0.16, 0.10), (0.42, BOOK_Y, 0.05, 0.18),
]):
    if c:
        box(f"Dsh{i}", (dx+ox, 0.10, 2.1+h/2+0.02), (w, 0.13, h), c, bevel=0.008)
    else:
        cyl(f"Dpot{i}", (dx+ox, 0.10, 2.1+0.07), 0.05, 0.09, CERAMIC)
        sphere(f"Dleaf{i}", (dx+ox, 0.10, 2.1+0.15), 0.06, LEAF2, sub=1)
# round-backed chair tucked in
cx, cy = dx-0.05, dy+0.85
box("ChSeat", (cx, cy, 0.44), (0.44, 0.44, 0.06), WOOD_D, bevel=0.035)
bpy.ops.mesh.primitive_cylinder_add(radius=0.23, depth=0.5, location=(cx, cy+0.21, 0.72), vertices=24)
cb = bpy.context.active_object; cb.name = "ChBack"
bpy.ops.mesh.primitive_cube_add(size=1, location=(cx, cy+0.21+0.14, 0.72))
tmp = bpy.context.active_object; tmp.scale = (1.2, 1.2, 1.2)
bpy.ops.object.transform_apply(scale=True)
cut = cb.modifiers.new("Bisect", 'BOOLEAN')
cut.operation='DIFFERENCE'; cut.object = tmp; cut.solver = 'EXACT'
bpy.data.objects.remove(tmp, do_unlink=True)
cb.data.materials.append(WOOD_D)
for lx, ly in [(cx-0.18, cy-0.16), (cx+0.18, cy-0.16), (cx-0.18, cy+0.16), (cx+0.18, cy+0.16)]:
    cyl("ChLeg", (lx, ly, 0.2), 0.02, 0.4, WOOD_D)

# ---------------------------------------------------------------- low dresser on left wall (replaces wardrobe)
wx, wy = 0.42, 5.0
box("Dresser", (wx, wy, 0.5), (0.5, 1.5, 1.0), WOOD_M, bevel=0.04)
for i in range(2):
    for s in (-1, 1):
        cyl(f"DrKn{i}{s}", (wx+0.26, wy+s*0.38, 0.28+i*0.42), 0.018, 0.025, METAL, rot=(0, math.pi/2, 0))
box("Tissue", (wx, wy-0.45, 1.05), (0.2, 0.28, 0.14), CERAMIC, bevel=0.02)
cyl("Tray", (wx, wy+0.45, 1.01), 0.14, 0.02, WOOD_D)
cyl("DplantPot", (wx, wy+0.45, 1.1), 0.09, 0.16, POT)
sphere("Dplant1", (wx, wy+0.45, 1.32), 0.17, LEAF, sub=2)
sphere("Dplant2", (wx+0.08, wy+0.5, 1.42), 0.12, LEAF2, sub=1)
sphere("Dplant3", (wx-0.08, wy+0.4, 1.45), 0.10, LEAF, sub=1)
# laundry basket with a towel thrown over
cyl("Basket", (1.35, 4.6, 0.26), 0.28, 0.52, LAUNDRY, verts=6)
bpy.ops.mesh.primitive_cube_add(size=1, location=(1.35, 4.6, 0.55))
towel = bpy.context.active_object; towel.name = "Towel"
towel.scale = (0.34, 0.34, 0.1)
bpy.ops.object.transform_apply(scale=True)
tt = towel.modifiers.new("Sub", 'SUBSURF'); tt.levels = 2
t4 = bpy.data.textures.new("TwN", 'CLOUDS'); t4.noise_scale = 1.2
d4 = towel.modifiers.new("Dis", 'DISPLACE'); d4.texture = t4; d4.strength = 0.03
towel.data.materials.append(FABRIC_C)

# ---------------------------------------------------------------- gallery cluster on left wall
for i, (ay, az, w, h, cw, ch, art) in enumerate([
    (2.3, 2.7, 0.42, 0.55, 0.36, 0.49, (0.80, 0.60, 0.55)),
    (2.9, 2.9, 0.3, 0.38, 0.25, 0.33, (0.62, 0.72, 0.80)),
    (2.2, 3.5, 0.34, 0.42, 0.28, 0.36, (0.72, 0.75, 0.55)),
]):
    box(f"Art{i}", (0.04, ay, az), (0.05, w, h), FRAME, bevel=0.015)
    plane(f"ArtC{i}", (0.07, ay, az), (cw, ch), mat(f"ArtM{i}", art, rough=0.9), rot=(math.pi/2, 0, math.pi/2))
# picture ledge with leaning frames + tiny plant
box("Ledge", (0.09, 4.6, 1.7), (0.16, 1.1, 0.05), WOOD_D, bevel=0.01)
box("Lean1", (0.13, 4.35, 1.95), (0.04, 0.3, 0.38), FRAME, bevel=0.012)
plane("Lean1c", (0.155, 4.35, 1.95), (0.26, 0.34), mat("LeanArt1", (0.75, 0.55, 0.5), rough=0.9), rot=(math.pi/2, 0, math.pi/2))
box("Lean2", (0.14, 4.75, 1.92), (0.04, 0.22, 0.28), FRAME, bevel=0.012)
cyl("LedgePot", (0.13, 5.0, 1.79), 0.04, 0.06, CERAMIC)
sphere("LedgeLeaf", (0.13, 5.0, 1.86), 0.05, LEAF2, sub=1)
# back-wall art + peg rail with hat
box("BWart", (5.55, 0.06, 2.55), (0.5, 0.05, 0.62), FRAME, bevel=0.015)
plane("BWartC", (5.55, 0.09, 2.55), (0.44, 0.56), mat("BWartM", (0.70, 0.62, 0.55), rough=0.9), rot=(math.pi/2, 0, 0))
for i in range(3):
    cyl(f"Peg{i}", (0.9+0.3*i, 0.05, 3.9), 0.015, 0.06, METAL, rot=(math.pi/2, 0, 0))
bpy.ops.mesh.primitive_cone_add(radius1=0.16, radius2=0.14, depth=0.12, location=(0.9, 0.18, 3.62))
hat = bpy.context.active_object; hat.rotation_euler = (math.pi/2, 0, 0)
hat.data.materials.append(mat("Hat", (0.55, 0.45, 0.35), rough=0.95))

# ---------------------------------------------------------------- plant in the corner
cyl("BigPot", (0.62, 6.05, 0.36), 0.3, 0.72, POT, verts=28)
for lx, ly, lz, r, mm in [
    (0.62, 6.05, 1.35, 0.5, LEAF), (0.35, 5.9, 1.7, 0.33, LEAF2),
    (0.9, 6.25, 1.75, 0.3, LEAF2), (0.55, 6.1, 2.05, 0.24, LEAF),
]:
    s = sphere("BigLeaf", (lx, ly, lz), r, mm, sub=2)
    sm = s.modifiers.new("Smo", 'SMOOTH'); sm.iterations = 10

# ---------------------------------------------------------------- floor lamp
cyl("FLpole", (0.35, 3.6, 0.95), 0.02, 1.9, METAL)
cyl("FLbase", (0.35, 3.6, 0.03), 0.16, 0.04, METAL)
cyl("FLshade", (0.35, 3.6, 2.0), 0.2, 0.3, SHADE)
l2 = bpy.data.lights.new("L2", 'POINT'); l2.energy = 30; l2.color = (1.0, 0.8, 0.55)
o2 = bpy.data.objects.new("L2O", l2); o2.location = (0.35, 3.6, 2.0)
bpy.context.collection.objects.link(o2)

# ---------------------------------------------------------------- lights + blush backdrop
sun = bpy.data.lights.new("Sun", 'SUN')
sun.energy = 3.0; sun.color = (1.0, 0.87, 0.65); sun.angle = 0.09
so = bpy.data.objects.new("SunO", sun); so.location = (3.6, -5.5, 6.5)
aim(so, (4.6, 4.5, 0.1))
bpy.context.collection.objects.link(so)
fill = bpy.data.lights.new("Fill", 'AREA')
fill.energy = 90; fill.size = 7; fill.color = (0.82, 0.78, 0.82)  # rosy fill
fo = bpy.data.objects.new("FillO", fill); fo.location = (9, 8.5, 5.5)
aim(fo, (3, 3.4, 1))
bpy.context.collection.objects.link(fo)
bpy.data.worlds["World"].node_tree.nodes["Background"].inputs[0].default_value = (0.87, 0.78, 0.75, 1)
bpy.data.worlds["World"].node_tree.nodes["Background"].inputs[1].default_value = 1.0

# ---------------------------------------------------------------- camera — closer, diorama feel
cam_data = bpy.data.cameras.new("Cam")
cam_data.lens = 48
cam_data.dof.use_dof = True
cam_data.dof.aperture_fstop = 3.6
cam = bpy.data.objects.new("CamO", cam_data)
cam.location = (8.6, 8.2, 4.8)
bpy.context.collection.objects.link(cam)
aim(cam, (2.9, 3.1, 1.2))
cam_data.dof.focus_object = bpy.data.objects["Duvet"]
bpy.context.scene.camera = cam

# ---------------------------------------------------------------- render
sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.device = 'GPU'
sc.cycles.samples = 96
sc.render.resolution_x = 1760
sc.render.resolution_y = 1100
sc.view_settings.view_transform = 'AgX'
sc.view_settings.look = 'AgX - Medium High Contrast'
sc.view_settings.exposure = 0.85
sc.render.filepath = "/Users/wanghaochen/research/my-website/blender/previews/concept-v2.png"
bpy.ops.render.render(write_still=True)
print("RENDER DONE:", sc.render.filepath)
