"""Inspect test1.blend: list objects, lights, cameras with world positions."""
import bpy, sys

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
if argv:
    bpy.ops.wm.open_mainfile(filepath=argv[0])

print("=== OBJECTS ===")
for o in bpy.context.scene.objects:
    loc = tuple(round(v, 2) for v in o.location)
    dim = tuple(round(v, 1) for v in o.dimensions) if o.type == 'MESH' else None
    parent = o.parent.name if o.parent else "-"
    print(f"{o.type:9s} | {o.name[:45]:45s} | loc={loc} | dim={dim} | parent={parent}")

print("=== SCENE ===")
sc = bpy.context.scene
print("engine:", sc.render.engine, "| camera:", sc.camera.name if sc.camera else None)
print("world:", sc.world.name if sc.world else None)
