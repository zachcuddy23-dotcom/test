"""Embed every painted map in assets/paintings/ (JPG or PNG) into js/paintings.js.

    python3 tools/build_paintings.py

A painted map is one big picture used instead of tiles (see js/painted.js).
The file name is the key: assets/paintings/soldocks.jpg -> map option painted: 'soldocks'.
Paintings are embedded as data URIs (like js/assets.js) so the game still works from file://.
"""
import base64, json, os
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'assets', 'paintings')
out = {}
for f in sorted(os.listdir(SRC)) if os.path.isdir(SRC) else []:
    name, ext = os.path.splitext(f)
    mime = {'.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp'}.get(ext.lower())
    if not mime: continue
    with open(os.path.join(SRC, f), 'rb') as fh:
        out[name] = f'data:{mime};base64,' + base64.b64encode(fh.read()).decode()
with open(os.path.join(HERE, '..', 'js', 'paintings.js'), 'w') as fh:
    fh.write('// Generated from assets/paintings/ by tools/build_paintings.py\nconst PAINTINGS = ' + json.dumps(out, indent=0) + ';\n')
print(len(out), 'paintings embedded')
