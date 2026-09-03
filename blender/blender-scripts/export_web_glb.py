"""Export test1.blend furniture (geometry only, no lights/camera/cube) to GLB."""
import bpy, sys

argv = sys.argv[sys.argv.index("--") + 1:]
out = argv[0]

sc = bpy.context.scene
for name in ("Light", "Camera", "Cube"):
    o = bpy.data.objects.get(name)
    if o:
        bpy.data.objects.remove(o, do_unlink=True)
        print("REMOVED", name)

bpy.ops.export_scene.gltf(filepath=out, export_format='GLB',
                          export_lights=False, export_cameras=False)
print("EXPORTED:", out)
