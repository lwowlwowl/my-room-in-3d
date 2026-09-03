# Concept v3 — island diorama. Cozy room on a round sand island, ocean all
# around. Renders BOTH day and night passes to concept-v3-day/night.png.
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

def sphere(name, loc, r, m, sub=2, segs=24):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=segs, ring_count=16)
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

# ---------------------------------------------------------------- room palette
WOOD_D  = mat("WoodDark", (0.30, 0.19, 0.11), rough=0.55)
WOOD_M  = mat("WoodMid",  (0.52, 0.36, 0.22), rough=0.55)
WALL    = mat("Wall",     (0.96, 0.90, 0.82), rough=0.95)
WALL_L  = mat("WallLeft", (0.94, 0.86, 0.83), rough=0.95)
TRIM    = mat("Trim",     (0.93, 0.87, 0.77), rough=0.85)
FABRIC_C= mat("FabCream", (0.95, 0.92, 0.87), rough=0.95)
DUVET   = mat("Duvet",    (0.55, 0.62, 0.72), rough=0.98)   # sea-blue duvet
DUVET2  = mat("Duvet2",   (0.90, 0.82, 0.72), rough=0.98)
THROW   = mat("Throw",    (0.90, 0.60, 0.40), rough=0.95)   # sunset coral
RUG     = mat("Rug",      (0.80, 0.68, 0.55), rough=1.0)    # sandy weave
RUG2    = mat("RugRing",  (0.62, 0.70, 0.72), rough=1.0)
METAL   = mat("Metal",    (0.85, 0.75, 0.55), rough=0.3, metal=1.0)
BLACK   = mat("Black",    (0.035, 0.035, 0.04), rough=0.4)
SCREEN  = mat("Screen",   (0.4, 0.6, 0.75), rough=0.3, emit=(0.45, 0.65, 0.85), emit_i=1.5)
SHADE   = mat("Shade",    (1.0, 0.92, 0.78), rough=0.8, emit=(1.0, 0.85, 0.6), emit_i=0.7)
BULB    = mat("Bulb",     (1.0, 0.9, 0.7), rough=0.5, emit=(1.0, 0.85, 0.6), emit_i=8.0)
POT     = mat("Pot",      (0.60, 0.38, 0.28), rough=0.7)
LEAF    = mat("Leaf",     (0.34, 0.56, 0.30), rough=0.9)
LEAF2   = mat("Leaf2",    (0.48, 0.64, 0.34), rough=0.9)
FRAME   = mat("Frame",    (0.45, 0.33, 0.22), rough=0.5)
PILLOW  = mat("Pillow",   (0.97, 0.95, 0.91), rough=0.95)
PLUSH   = mat("Plush",    (0.85, 0.55, 0.60), rough=1.0)
BOOK_R  = mat("BookR",    (0.72, 0.35, 0.30), rough=0.85)
BOOK_B  = mat("BookB",    (0.35, 0.50, 0.55), rough=0.85)
BOOK_Y  = mat("BookY",    (0.85, 0.70, 0.40), rough=0.85)
BOOK_G  = mat("BookG",    (0.50, 0.62, 0.45), rough=0.85)
MUG     = mat("Mug",      (0.62, 0.72, 0.58), rough=0.4)
CERAMIC = mat("Ceramic",  (0.95, 0.90, 0.84), rough=0.3)

# ---------------------------------------------------------------- island palette
SAND    = mat("Sand",     (0.92, 0.82, 0.64), rough=0.95)
SAND_D  = mat("SandDark", (0.82, 0.70, 0.52), rough=0.98)
SEA     = mat("Sea",      (0.16, 0.48, 0.55), rough=0.25)
SEA_D   = mat("SeaFoam",  (0.75, 0.90, 0.88), rough=0.4)
WOOD_P  = mat("PalmWood", (0.42, 0.30, 0.20), rough=0.8)
PALM    = mat("PalmLeaf", (0.22, 0.50, 0.26), rough=0.85)
STARFISH= mat("Starfish", (0.92, 0.55, 0.42), rough=0.9)
SHELL   = mat("Shell",    (0.95, 0.88, 0.80), rough=0.4)
ROCK    = mat("Rock",     (0.45, 0.44, 0.42), rough=0.95)
GLASS   = mat("Glass",    (0.9, 0.95, 0.95), rough=0.05, metal=0.1)

# ================================================================ ISLAND
# sand platform — cylinder with beveled rim + noise bumps for dunes
bpy.ops.mesh.primitive_cylinder_add(radius=7.2, depth=0.8, location=(3.2, 3.2, -0.44), vertices=64)
isl = bpy.context.active_object; isl.name = "Island"
b = isl.modifiers.new("Bevel", 'BEVEL'); b.width = 0.35; b.segments = 5
t = bpy.data.textures.new("Dune", 'CLOUDS'); t.noise_type='SOFT_NOISE'; t.noise_scale = 1.4
d = isl.modifiers.new("Dis", 'DISPLACE'); d.texture = t; d.strength = 0.18
isl.data.materials.append(SAND)
# darker wet-sand ring near the waterline
cyl("WetSand", (3.2, 3.2, -0.02), 6.4, 0.02, SAND_D, verts=64)
# ocean — huge disk, slightly below island top so the island reads as floating
cyl("Ocean", (3.2, 3.2, -0.55), 40, 0.1, SEA, verts=96)
# foam ring hugging the island
cyl("Foam", (3.2, 3.2, -0.50), 7.5, 0.02, SEA_D, verts=64)

# ================================================================ ROOM SHELL on the island (compact 5.6m, raised floor)
R = 5.6
FX, FY = 3.2, 3.2   # room center on the island
def rx(x): return FX + x - R/2
def ry(y): return FY + y - R/2
FZ = 0.35           # raised wooden floor height above sand

# deck planks (slightly larger than room — a porch lip)
plank_w = 0.42
for i in range(int(R / plank_w) + 1):
    x = i * plank_w + plank_w / 2
    tone = 0.92 + ((i * 37) % 10) / 45
    box(f"Plank{i}", (rx(x), FY, FZ - 0.03), (plank_w - 0.006, R + 0.6, 0.06),
        mat(f"P{i}", (0.55*tone, 0.40*tone, 0.26*tone), rough=0.5), bevel=0.004, segs=1)
# deck support posts down into the sand (stilt-house feel)
for px, py in [(0.2, 0.2), (R-0.2, 0.2), (0.2, R-0.2), (R-0.2, R-0.2), (R/2, 0.2), (R/2, R-0.2)]:
    cyl("Post", (rx(px), ry(py), 0.0), 0.09, 0.7, WOOD_D)

WALL_T, WALL_H = 0.2, 3.6
WX0, WX1, WZ0, WZ1 = 2.2, 4.2, 0.8, 2.7   # window (seaside, back wall)
def wz(z): return FZ + z
box("BackW_b1", (rx(WX0/2), ry(-WALL_T/2), wz(WZ0/2)), (WX0, WALL_T, WZ0), WALL)
box("BackW_b2", (rx((WX1+R)/2), ry(-WALL_T/2), wz(WZ0/2)), (R-WX1, WALL_T, WZ0), WALL)
box("BackW_t1", (rx(WX0/2), ry(-WALL_T/2), wz((WZ1+WALL_H)/2)), (WX0, WALL_T, WALL_H-WZ1), WALL)
box("BackW_t2", (rx((WX1+R)/2), ry(-WALL_T/2), wz((WZ1+WALL_H)/2)), (R-WX1, WALL_T, WALL_H-WZ1), WALL)
box("LeftWall", (rx(-WALL_T/2), ry(R/2), wz(WALL_H/2)), (WALL_T, R, WALL_H), WALL_L)
box("BaseB", (rx(R/2), ry(0.03), wz(0.08)), (R, 0.06, 0.16), TRIM, bevel=0.012)
box("BaseL", (rx(0.03), ry(R/2), wz(0.08)), (0.06, R, 0.16), TRIM, bevel=0.012)
# window frame + sill + glass (real transparency this time)
fm = WOOD_M
box("WinF_T", (rx((WX0+WX1)/2), ry(-WALL_T/2), wz(WZ1+0.05)), (WX1-WX0+0.16, WALL_T+0.05, 0.1), fm, bevel=0.02)
box("WinF_B", (rx((WX0+WX1)/2), ry(-WALL_T/2), wz(WZ0-0.05)), (WX1-WX0+0.16, WALL_T+0.05, 0.1), fm, bevel=0.02)
box("WinF_L", (rx(WX0-0.05), ry(-WALL_T/2), wz((WZ0+WZ1)/2)), (0.1, WALL_T+0.05, WZ1-WZ0), fm, bevel=0.02)
box("WinF_R", (rx(WX1+0.05), ry(-WALL_T/2), wz((WZ0+WZ1)/2)), (0.1, WALL_T+0.05, WZ1-WZ0), fm, bevel=0.02)
box("MulV", (rx((WX0+WX1)/2), ry(-WALL_T/2), wz((WZ0+WZ1)/2)), (0.05, 0.09, WZ1-WZ0), fm)
box("MulH", (rx((WX0+WX1)/2), ry(-WALL_T/2), wz((WZ0+WZ1)/2)), (WX1-WX0, 0.09, 0.05), fm)
gm = mat("WinGlass", (0.75, 0.9, 0.92), rough=0.02)
gm.blend_method = 'BLEND' if hasattr(gm, 'blend_method') else None
gm.use_backface_culling = False
box("WinGlass", (rx((WX0+WX1)/2), ry(-WALL_T/2), wz((WZ0+WZ1)/2)), (WX1-WX0-0.06, 0.04, WZ1-WZ0-0.06), gm)
box("Sill", (rx((WX0+WX1)/2), ry(0.16), wz(WZ0-0.02)), (WX1-WX0+0.3, 0.22, 0.07), TRIM, bevel=0.02)
# fairy lights over the window
for i in range(9):
    tt = i / 8.0
    lx = WX0 + tt * (WX1 - WX0)
    lz = WZ1 - 0.02 - math.sin(tt * math.pi) * 0.22
    sphere(f"Fairy{i}", (rx(lx), ry(0.14), wz(lz)), 0.02, BULB, sub=1, segs=12)
# sill props
cyl("SillPot", (rx(WX0+0.3), ry(0.16), wz(WZ0+0.1)), 0.055, 0.09, POT)
sphere("SillLeaf", (rx(WX0+0.3), ry(0.16), wz(WZ0+0.19)), 0.08, LEAF2, sub=1)
bpy.ops.mesh.primitive_cone_add(radius1=0.09, radius2=0.002, depth=0.16, location=(rx(WX1-0.3), ry(0.16), wz(WZ0+0.08)))
sh = bpy.context.active_object; sh.rotation_euler = (0.35, 0, 0.8)
sh.data.materials.append(SHELL)

# ================================================================ FURNITURE (compact, wall-hugging)
# rug
cyl("Rug", (rx(2.7), ry(3.0), wz(0.03)), 1.35, 0.02, RUG, verts=48)
cyl("RugRing", (rx(2.7), ry(3.0), wz(0.04)), 0.95, 0.012, RUG2, verts=48)

# --- bed, tucked in the corner
bx, by, bw, bl = 0.95, 1.15, 1.5, 2.0
box("BedFrame", (rx(bx), ry(by), wz(0.22)), (bw, bl, 0.22), WOOD_D, bevel=0.05)
box("Headboard", (rx(bx), ry(by - bl/2 + 0.08), wz(0.7)), (bw, 0.13, 0.7), WOOD_M, bevel=0.06)
box("Mattress", (rx(bx), ry(by + 0.06), wz(0.42)), (bw-0.14, bl-0.24, 0.2), FABRIC_C, bevel=0.09)
bpy.ops.mesh.primitive_cube_add(size=1, location=(rx(bx), ry(by + 0.3), wz(0.56)))
duv = bpy.context.active_object; duv.name = "Duvet"
duv.scale = (bw-0.08, bl-0.7, 0.18)
bpy.ops.object.transform_apply(scale=True)
sub = duv.modifiers.new("Sub", 'SUBSURF'); sub.levels = 3; sub.render_levels = 4
t1 = bpy.data.textures.new("DuvN", 'CLOUDS'); t1.noise_type='SOFT_NOISE'; t1.noise_scale = 0.5
d1 = duv.modifiers.new("Dis", 'DISPLACE'); d1.texture = t1; d1.strength = 0.075; d1.mid_level = 0.55
sm = duv.modifiers.new("Smo", 'SMOOTH'); sm.iterations = 8
duv.data.materials.append(DUVET)
bpy.ops.mesh.primitive_cube_add(size=1, location=(rx(bx), ry(by + 0.7), wz(0.68)))
flr = bpy.context.active_object; flr.name = "DuvetFold"
flr.scale = (bw-0.1, 0.5, 0.1)
bpy.ops.object.transform_apply(scale=True)
s2 = flr.modifiers.new("Sub", 'SUBSURF'); s2.levels = 2; s2.render_levels = 3
t2 = bpy.data.textures.new("FoldN", 'CLOUDS'); t2.noise_scale = 0.8
d2 = flr.modifiers.new("Dis", 'DISPLACE'); d2.texture = t2; d2.strength = 0.045
flr.data.materials.append(DUVET2)
for i, (px, py) in enumerate([(bx-0.32, by-bl/2+0.4), (bx+0.33, by-bl/2+0.44)]):
    p = box(f"Pillow{i}", (rx(px), ry(py), wz(0.56)), (0.58, 0.4, 0.14), PILLOW, bevel=0.08, segs=6)
    s = p.modifiers.new("Sub", 'SUBSURF'); s.levels = 2; s.render_levels = 3
bpy.ops.mesh.primitive_cube_add(size=1, location=(rx(bx), ry(by+0.82), wz(0.62)))
tb = bpy.context.active_object; tb.name = "ThrowBand"
tb.scale = (bw-0.06, 0.4, 0.08)
bpy.ops.object.transform_apply(scale=True)
s3 = tb.modifiers.new("Sub", 'SUBSURF'); s3.levels = 2; s3.render_levels = 3
t3 = bpy.data.textures.new("ThrN", 'CLOUDS'); t3.noise_scale = 0.7
d3 = tb.modifiers.new("Dis", 'DISPLACE'); d3.texture = t3; d3.strength = 0.04
tb.data.materials.append(THROW)
sphere("PlushBody", (rx(bx+0.4), ry(by-bl/2+0.72), wz(0.72)), 0.11, PLUSH, sub=2)
sphere("PlushHead", (rx(bx+0.4), ry(by-bl/2+0.72), wz(0.86)), 0.08, PLUSH, sub=2)
sphere("PlushEar1", (rx(bx+0.34), ry(by-bl/2+0.69), wz(0.94)), 0.03, PLUSH, sub=1, segs=12)
sphere("PlushEar2", (rx(bx+0.46), ry(by-bl/2+0.69), wz(0.94)), 0.03, PLUSH, sub=1, segs=12)
box("BedBook", (rx(bx-0.33), ry(by+0.52), wz(0.64)), (0.22, 0.16, 0.03), BOOK_Y, bevel=0.01)

# --- nightstand cluster
nx, ny = 1.05, 2.5
box("Nstand", (rx(nx), ry(ny), wz(0.26)), (0.55, 0.5, 0.52), WOOD_M, bevel=0.04)
cyl("Nknob", (rx(nx), ry(ny+0.26), wz(0.32)), 0.02, 0.03, METAL, rot=(math.pi/2, 0, 0))
cyl("NLbase", (rx(nx-0.13), ry(ny), wz(0.55)), 0.07, 0.04, METAL)
cyl("NLshade", (rx(nx-0.13), ry(ny), wz(0.74)), 0.13, 0.19, SHADE)
sphere("NLbulb", (rx(nx-0.13), ry(ny), wz(0.72)), 0.035, BULB, sub=1, segs=12)
l1 = bpy.data.lights.new("L1", 'POINT'); l1.energy = 18; l1.color = (1.0, 0.82, 0.6)
o1 = bpy.data.objects.new("L1O", l1); o1.location = (rx(nx-0.13), ry(ny), wz(0.74))
bpy.context.collection.objects.link(o1)
box("Nb1", (rx(nx+0.12), ry(ny+0.06), wz(0.55)), (0.24, 0.17, 0.05), BOOK_R, bevel=0.012)
box("Nb2", (rx(nx+0.13), ry(ny+0.04), wz(0.60)), (0.22, 0.16, 0.045), BOOK_B, bevel=0.012)
cyl("Nplant", (rx(nx+0.13), ry(ny-0.14), wz(0.58)), 0.045, 0.07, CERAMIC)
sphere("Nleaf", (rx(nx+0.13), ry(ny-0.14), wz(0.66)), 0.06, LEAF2, sub=1, segs=12)

# --- desk by the window (seaview while working!)
dx, dy = 3.2, 0.6
box("DeskTop", (rx(dx), ry(dy), wz(0.72)), (1.7, 0.72, 0.05), WOOD_M, bevel=0.022)
for lx, ly in [(dx-0.72, dy-0.26), (dx+0.72, dy-0.26), (dx-0.72, dy+0.26), (dx+0.72, dy+0.26)]:
    cyl("Dleg", (rx(lx), ry(ly), wz(0.36)), 0.035, 0.72, WOOD_D)
box("MonB", (rx(dx), ry(dy-0.06), wz(1.18)), (0.78, 0.04, 0.44), BLACK, bevel=0.01)
plane("MonS", (rx(dx), ry(dy-0.037), wz(1.18)), (0.72, 0.40), SCREEN, rot=(math.pi/2, 0, 0))
cyl("MonSt", (rx(dx), ry(dy-0.06), wz(0.93)), 0.022, 0.12, BLACK)
box("MonBa", (rx(dx), ry(dy-0.06), wz(0.76)), (0.22, 0.14, 0.016), BLACK, bevel=0.008)
box("Kb", (rx(dx), ry(dy+0.22), wz(0.75)), (0.44, 0.15, 0.018), BLACK, bevel=0.008)
sphere("Mouse", (rx(dx+0.38), ry(dy+0.24), wz(0.765)), 0.045, BLACK, sub=1)
cyl("Mug", (rx(dx-0.62), ry(dy+0.14), wz(0.78)), 0.05, 0.1, MUG)
cyl("PenCup", (rx(dx+0.62), ry(dy+0.05), wz(0.78)), 0.045, 0.09, CERAMIC)
# shelf above desk
box("Dshelf", (rx(dx), ry(0.06), wz(2.0)), (1.3, 0.2, 0.045), WOOD_D, bevel=0.01)
for i, (ox, c, w, h) in enumerate([
    (-0.45, BOOK_R, 0.05, 0.26), (-0.36, BOOK_Y, 0.045, 0.22), (-0.27, BOOK_B, 0.05, 0.24),
    (-0.18, BOOK_G, 0.04, 0.20), (0.18, None, 0.16, 0.10), (0.42, BOOK_Y, 0.05, 0.18),
]):
    if c:
        box(f"Dsh{i}", (rx(dx+ox), ry(0.10), wz(2.0+h/2+0.02)), (w, 0.13, h), c, bevel=0.008)
    else:
        cyl(f"Dpot{i}", (rx(dx+ox), ry(0.10), wz(2.07)), 0.05, 0.09, CERAMIC)
        sphere(f"Dleaf{i}", (rx(dx+ox), ry(0.10), wz(2.15)), 0.06, LEAF2, sub=1, segs=12)
# round chair
cx, cy = dx-0.05, dy+0.85
box("ChSeat", (rx(cx), ry(cy), wz(0.44)), (0.44, 0.44, 0.06), WOOD_D, bevel=0.035)
bpy.ops.mesh.primitive_cylinder_add(radius=0.23, depth=0.5, location=(rx(cx), ry(cy+0.21), wz(0.72)), vertices=24)
cb = bpy.context.active_object; cb.name = "ChBack"
bpy.ops.mesh.primitive_cube_add(size=1, location=(rx(cx), ry(cy+0.35), wz(0.72)))
tmp = bpy.context.active_object; tmp.scale = (1.2, 1.2, 1.2)
bpy.ops.object.transform_apply(scale=True)
cut = cb.modifiers.new("Bisect", 'BOOLEAN')
cut.operation='DIFFERENCE'; cut.object = tmp; cut.solver = 'EXACT'
bpy.data.objects.remove(tmp, do_unlink=True)
cb.data.materials.append(WOOD_D)
for lx, ly in [(cx-0.18, cy-0.16), (cx+0.18, cy-0.16), (cx-0.18, cy+0.16), (cx+0.18, cy+0.16)]:
    cyl("ChLeg", (rx(lx), ry(ly), wz(0.2)), 0.02, 0.4, WOOD_D)

# --- low dresser on left wall (skills)
wx, wy = 0.42, 4.7
box("Dresser", (rx(wx), ry(wy), wz(0.5)), (0.5, 1.5, 1.0), WOOD_M, bevel=0.04)
for i in range(2):
    for s in (-1, 1):
        cyl(f"DrKn{i}{s}", (rx(wx+0.26), ry(wy+s*0.38), wz(0.28+i*0.42)), 0.018, 0.025, METAL, rot=(0, math.pi/2, 0))
box("Tissue", (rx(wx), ry(wy-0.45), wz(1.05)), (0.2, 0.28, 0.14), CERAMIC, bevel=0.02)
cyl("Tray", (rx(wx), ry(wy+0.45), wz(1.01)), 0.14, 0.02, WOOD_D)
cyl("DplantPot", (rx(wx), ry(wy+0.45), wz(1.1)), 0.09, 0.16, POT)
sphere("Dplant1", (rx(wx), ry(wy+0.45), wz(1.32)), 0.17, LEAF, sub=2)
sphere("Dplant2", (rx(wx+0.08), ry(wy+0.5), wz(1.42)), 0.12, LEAF2, sub=1)
sphere("Dplant3", (rx(wx-0.08), ry(wy+0.4), wz(1.45)), 0.10, LEAF, sub=1)
# laundry basket
cyl("Basket", (rx(1.3), ry(4.3), wz(0.26)), 0.28, 0.52, mat("Wicker", (0.72, 0.58, 0.40), rough=0.95), verts=6)
bpy.ops.mesh.primitive_cube_add(size=1, location=(rx(1.3), ry(4.3), wz(0.55)))
towel = bpy.context.active_object; towel.name = "Towel"
towel.scale = (0.34, 0.34, 0.1)
bpy.ops.object.transform_apply(scale=True)
tt = towel.modifiers.new("Sub", 'SUBSURF'); tt.levels = 2
t4 = bpy.data.textures.new("TwN", 'CLOUDS'); t4.noise_scale = 1.2
d4 = towel.modifiers.new("Dis", 'DISPLACE'); d4.texture = t4; d4.strength = 0.03
towel.data.materials.append(FABRIC_C)

# --- wall art gallery (left wall)
for i, (ay, az, w, h, cw, ch, art) in enumerate([
    (2.3, 2.2, 0.42, 0.55, 0.36, 0.49, (0.55, 0.65, 0.75)),
    (2.95, 2.4, 0.3, 0.38, 0.25, 0.33, (0.90, 0.65, 0.50)),
    (2.25, 2.9, 0.34, 0.42, 0.28, 0.36, (0.70, 0.78, 0.70)),
]):
    box(f"Art{i}", (rx(0.04), ry(ay), wz(az)), (0.05, w, h), FRAME, bevel=0.015)
    plane(f"ArtC{i}", (rx(0.07), ry(ay), wz(az)), (cw, ch), mat(f"ArtM{i}", art, rough=0.9), rot=(math.pi/2, 0, math.pi/2))
# picture ledge
box("Ledge", (rx(0.09), ry(3.9), wz(1.5)), (0.16, 1.1, 0.05), WOOD_D, bevel=0.01)
box("Lean1", (rx(0.13), ry(3.65), wz(1.73)), (0.04, 0.3, 0.38), FRAME, bevel=0.012)
plane("Lean1c", (rx(0.155), ry(3.65), wz(1.73)), (0.26, 0.34), mat("LeanArt1", (0.75, 0.60, 0.55), rough=0.9), rot=(math.pi/2, 0, math.pi/2))
cyl("LedgePot", (rx(0.13), ry(4.3), wz(1.59)), 0.04, 0.06, CERAMIC)
sphere("LedgeLeaf", (rx(0.13), ry(4.3), wz(1.66)), 0.05, LEAF2, sub=1, segs=12)
# back wall art + peg rail + hat
box("BWart", (rx(5.15), ry(0.06), wz(2.3)), (0.5, 0.05, 0.62), FRAME, bevel=0.015)
plane("BWartC", (rx(5.15), ry(0.09), wz(2.3)), (0.44, 0.56), mat("BWartM", (0.72, 0.62, 0.55), rough=0.9), rot=(math.pi/2, 0, 0))
for i in range(3):
    cyl(f"Peg{i}", (rx(0.9+0.3*i), ry(0.05), wz(3.1)), 0.015, 0.06, METAL, rot=(math.pi/2, 0, 0))
bpy.ops.mesh.primitive_cone_add(radius1=0.16, radius2=0.14, depth=0.12, location=(rx(0.9), ry(0.18), wz(2.85)))
hat = bpy.context.active_object; hat.rotation_euler = (math.pi/2, 0, 0)
hat.data.materials.append(mat("Hat", (0.60, 0.50, 0.38), rough=0.95))

# --- floor lamp
cyl("FLpole", (rx(0.35), ry(3.3), wz(0.95)), 0.02, 1.9, METAL)
cyl("FLbase", (rx(0.35), ry(3.3), wz(0.03)), 0.16, 0.04, METAL)
cyl("FLshade", (rx(0.35), ry(3.3), wz(2.0)), 0.2, 0.3, SHADE)
l2 = bpy.data.lights.new("L2", 'POINT'); l2.energy = 30; l2.color = (1.0, 0.8, 0.55)
o2 = bpy.data.objects.new("L2O", l2); o2.location = (rx(0.35), ry(3.3), wz(2.0))
bpy.context.collection.objects.link(o2)

# ================================================================ ISLAND DECOR
# palm tree — curved trunk + fronds
import math as _m
palm_x, palm_y = 8.3, 8.6
segs = 8
prev = None
for i in range(segs):
    t_ = i / (segs - 1)
    px = palm_x - t_ * 0.5
    pz = 0.2 + t_ * 2.6
    seg_r = 0.16 * (1 - t_ * 0.55)
    c = cyl(f"PalmSeg{i}", (px, palm_y, pz), seg_r, 2.6/segs + 0.12, WOOD_P, verts=10)
    c.rotation_euler = (0, 0, 0.12)
    prev = c
# fronds — flattened stretched spheres radiating out
for i in range(7):
    ang = i / 7 * math.pi * 2
    fr = sphere(f"Frond{i}", (palm_x - 0.5 + math.cos(ang)*0.75, palm_y + math.sin(ang)*0.75, 2.85), 0.5, PALM, sub=1, segs=12)
    fr.scale = (1.0, 0.45, 0.14)
    fr.rotation_euler = (0, 0, ang)
    bpy.ops.object.transform_apply(rotation=True, scale=True)
# coconuts
sphere("Coco1", (palm_x - 0.45, palm_y + 0.2, 2.6), 0.09, mat("Coco", (0.35, 0.25, 0.15), rough=0.9), sub=1, segs=12)
sphere("Coco2", (palm_x - 0.55, palm_y - 0.15, 2.55), 0.08, mat("Coco2", (0.35, 0.25, 0.15), rough=0.9), sub=1, segs=12)

# second smaller palm, back-left
for i in range(6):
    t_ = i / 5
    cyl(f"Palm2Seg{i}", (-1.3 - t_*0.3, 1.0 - t_*0.4, 0.2 + t_*1.7), 0.11*(1-t_*0.5), 1.7/6 + 0.1, WOOD_P, verts=10)
for i in range(6):
    ang = i / 6 * math.pi * 2 + 0.4
    fr = sphere(f"Frond2_{i}", (-1.6 + math.cos(ang)*0.6, 0.65 + math.sin(ang)*0.6, 1.95), 0.4, PALM, sub=1, segs=12)
    fr.scale = (1.0, 0.45, 0.14); fr.rotation_euler = (0, 0, ang)
    bpy.ops.object.transform_apply(rotation=True, scale=True)

# rocks near the waterline
for i, (rx_, ry_, s) in enumerate([(-2.6, 5.2, 0.4), (-2.2, 6.0, 0.25), (8.8, 1.5, 0.35), (0.5, -2.3, 0.3)]):
    r_ = sphere(f"Rock{i}", (rx_, ry_, 0.1), s, ROCK, sub=1, segs=10)
    r_.scale = (1.0, 0.85, 0.6)

# starfish + shells on the sand
bpy.ops.mesh.primitive_cone_add(radius1=0.14, radius2=0.03, depth=0.05, vertices=5, location=(0.8, 8.9, 0.06))
sf = bpy.context.active_object; sf.rotation_euler = (0, 0, 0.7)
sf.data.materials.append(STARFISH)
for i, (sx, sy, rz) in enumerate([(-0.6, 7.4, 0.3), (7.5, 8.8, 1.1), (-1.8, 3.2, -0.4)]):
    bpy.ops.mesh.primitive_cone_add(radius1=0.07, radius2=0.002, depth=0.12, location=(sx, sy, 0.05))
    sh_ = bpy.context.active_object; sh_.rotation_euler = (0.15, 0, rz)
    sh_.data.materials.append(SHELL)

# little wooden dock/pier going out to sea
dock_x, dock_y = 8.6, 4.5
box("DockDeck", (dock_x, dock_y, 0.12), (2.8, 0.9, 0.08), mat("DockWood", (0.50, 0.37, 0.25), rough=0.7), bevel=0.01)
for i in range(4):
    cyl(f"DockPost{i}", (dock_x - 1.2 + i*0.8, dock_y - 0.4, -0.25), 0.05, 0.8, WOOD_P)
    cyl(f"DockPostB{i}", (dock_x - 1.2 + i*0.8, dock_y + 0.4, -0.25), 0.05, 0.8, WOOD_P)
# rowboat moored at the dock
bpy.ops.mesh.primitive_cube_add(size=1, location=(dock_x + 1.8, dock_y, -0.28))
boat = bpy.context.active_object; boat.name = "Rowboat"
boat.scale = (1.0, 0.45, 0.3)
bpy.ops.object.transform_apply(scale=True)
bs = boat.modifiers.new("Sub", 'SUBSURF'); bs.levels = 2
bpy.ops.mesh.primitive_cube_add(size=1, location=(dock_x + 1.8, dock_y, -0.1))
inner = bpy.context.active_object; inner.scale = (0.8, 0.34, 0.28)
bpy.ops.object.transform_apply(scale=True)
bcut = boat.modifiers.new("Bcut", 'BOOLEAN'); bcut.operation='DIFFERENCE'; bcut.object = inner; bcut.solver='EXACT'
bpy.data.objects.remove(inner, do_unlink=True)
boat.data.materials.append(mat("BoatPaint", (0.75, 0.35, 0.30), rough=0.5))
# lantern on a dock post
cyl("DockLanternPost", (dock_x - 1.1, dock_y + 0.5, 0.45), 0.035, 0.9, WOOD_P)
sphere("DockLantern", (dock_x - 1.1, dock_y + 0.5, 0.98), 0.09, BULB, sub=1, segs=12)
l3 = bpy.data.lights.new("L3", 'POINT'); l3.energy = 15; l3.color = (1.0, 0.8, 0.5)
o3 = bpy.data.objects.new("L3O", l3); o3.location = (dock_x - 1.1, dock_y + 0.5, 0.98)
bpy.context.collection.objects.link(o3)

# beach chair + umbrella on the sand, open side
bpy.ops.mesh.primitive_plane_add(size=1, location=(1.0, 8.2, 0.3))
bc = bpy.context.active_object; bc.name = "BeachChair"
bc.rotation_euler = (-0.5, 0, 0.5)
bc.scale = (0.9, 0.4, 1)
bpy.ops.object.transform_apply(rotation=True, scale=True)
bc.data.materials.append(mat("ChairStripe", (0.90, 0.75, 0.55), rough=0.9))
# umbrella
cyl("UmbPole", (-0.9, 7.6, 1.0), 0.03, 2.0, WOOD_P)
bpy.ops.mesh.primitive_cone_add(radius1=1.1, radius2=0.06, depth=0.45, vertices=12, location=(-0.9, 7.6, 2.05))
umb = bpy.context.active_object; umb.scale = (1, 1, 0.7)
umb.data.materials.append(mat("Umbrella", (0.85, 0.45, 0.40), rough=0.8))

# ================================================================ CAMERA
cam_data = bpy.data.cameras.new("Cam")
cam_data.lens = 52
cam_data.dof.use_dof = True
cam_data.dof.aperture_fstop = 4.5
cam = bpy.data.objects.new("CamO", cam_data)
bpy.context.collection.objects.link(cam)
bpy.context.scene.camera = cam

sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.device = 'GPU'
sc.cycles.samples = 96
sc.render.resolution_x = 1760
sc.render.resolution_y = 1100
sc.view_settings.view_transform = 'AgX'
sc.view_settings.look = 'AgX - Medium High Contrast'

# stars for night pass — created once, hidden for day
star_m = mat("Star", (1, 1, 0.95), rough=1.0, emit=(1, 1, 0.95), emit_i=10.0)
import random
random.seed(7)
stars = []
for i in range(90):
    ang = random.uniform(0, math.pi*2)
    rad = random.uniform(18, 34)
    ht = random.uniform(6, 20)
    s = sphere(f"Star{i}", (3.2 + math.cos(ang)*rad, 3.2 + math.sin(ang)*rad, ht), random.uniform(0.03, 0.08), star_m, sub=0, segs=8)
    stars.append(s)

# moon (night) + sun disc (day)
moon = sphere("Moon", (14, -10, 12), 1.1, mat("Moon", (0.95, 0.95, 0.9), rough=1.0, emit=(0.9, 0.92, 1.0), emit_i=5.0), sub=1, segs=24)

def render_pass(mode):
    for o in stars: o.hide_render = (mode == 'day'); o.hide_viewport = (mode == 'day')
    moon.hide_render = (mode == 'day'); moon.hide_viewport = (mode == 'day')
    if mode == 'day':
        # bright tropical noon
        sun = bpy.data.lights.new("SunD", 'SUN')
        sun.energy = 4.5; sun.color = (1.0, 0.96, 0.88); sun.angle = 0.03
        so = bpy.data.objects.new("SunDO", sun); so.location = (12, -14, 18)
        aim(so, (3.2, 3.2, 0)); bpy.context.collection.objects.link(so)
        sky = bpy.data.lights.new("SkyD", 'AREA')
        sky.energy = 400; sky.size = 30; sky.color = (0.7, 0.85, 1.0)
        sko = bpy.data.objects.new("SkyDO", sky); sko.location = (3.2, 3.2, 25)
        aim(sko, (3.2, 3.2, 0)); bpy.context.collection.objects.link(sko)
        bpy.data.worlds["World"].node_tree.nodes["Background"].inputs[0].default_value = (0.55, 0.75, 0.92, 1)
        bpy.data.worlds["World"].node_tree.nodes["Background"].inputs[1].default_value = 1.0
        sc.view_settings.exposure = 0.9
        cam.location = (14.5, 14.0, 8.5)
        aim(cam, (3.0, 3.0, 1.4))
        fp = "/Users/wanghaochen/research/my-website/blender/previews/concept-v3-day.png"
    else:
        # deep blue night, warm interior lights already in scene
        sun = bpy.data.lights.new("SunN", 'SUN')
        sun.energy = 0.5; sun.color = (0.45, 0.55, 0.9); sun.angle = 0.02
        so = bpy.data.objects.new("SunNO", sun); so.location = (14, -10, 12)
        aim(so, (3.2, 3.2, 0)); bpy.context.collection.objects.link(so)
        sky = bpy.data.lights.new("SkyN", 'AREA')
        sky.energy = 25; sky.size = 30; sky.color = (0.3, 0.4, 0.75)
        sko = bpy.data.objects.new("SkyNO", sky); sko.location = (3.2, 3.2, 25)
        aim(sko, (3.2, 3.2, 0)); bpy.context.collection.objects.link(sko)
        bpy.data.worlds["World"].node_tree.nodes["Background"].inputs[0].default_value = (0.02, 0.03, 0.08, 1)
        bpy.data.worlds["World"].node_tree.nodes["Background"].inputs[1].default_value = 1.0
        # boost interior lights for the night glow
        l1.energy = 60; l2.energy = 90; l3.energy = 40
        sc.view_settings.exposure = 0.6
        cam.location = (14.5, 14.0, 8.5)
        aim(cam, (3.0, 3.0, 1.4))
        fp = "/Users/wanghaochen/research/my-website/blender/previews/concept-v3-night.png"
    cam_data.dof.focus_object = bpy.data.objects["Island"]
    sc.render.filepath = fp
    bpy.ops.render.render(write_still=True)
    print(f"RENDER {mode} DONE:", fp)
    # remove pass lights
    for nm in ("SunDO", "SkyDO", "SunNO", "SkyNO"):
        if nm in bpy.data.objects:
            bpy.data.objects.remove(bpy.data.objects[nm], do_unlink=True)

render_pass('day')
render_pass('night')
