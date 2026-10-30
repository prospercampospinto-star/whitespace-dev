# blender/export.ps1

$BLENDER = 'C:\Program Files (x86)\Steam\steamapps\common\Blender\blender.exe'
$SCRIPT  = 'blender/export.py'

& $BLENDER --background 'blender/ToyZ/toyz.blend' --python $SCRIPT -- toyz