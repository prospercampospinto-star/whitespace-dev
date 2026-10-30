# Source - https://stackoverflow.com/a/41939643
# Posted by sambler
# Retrieved 2026-10-29, License - CC BY-SA 3.0

#usage : 

#   blender --background blender/marble-run.blend --python blender/export.py

import sys
import bpy,os

args = sys.argv[sys.argv.index('--') + 1:]  # ['toyz']

scene_name = args[0]
scene_path = '../public/models/' + scene_name + '.glb'

bpy.ops.export_scene.gltf(
filepath=os.path.join(os.path.dirname(__file__),
scene_path),
    collection='scene',
    export_format='GLB',
    export_apply=True, # Apply modifiers
    export_materials='EXPORT', # Preserve material names
    
    export_animations=True,
    export_nla_strips=True,
    export_def_bones=True,
    export_draco_mesh_compression_enable=False # enable when ready
    )


print('Exported OK')
