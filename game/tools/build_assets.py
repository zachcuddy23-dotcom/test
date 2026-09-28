"""Embed every PNG in game/assets into js/assets.js as data URIs.

Embedding keeps pixel reads (palette swaps) working even when the game is
opened straight from disk via file://.
"""
import base64, json, os
HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, '..', 'assets')
out = {}
for f in sorted(os.listdir(ASSETS)):
    if f.endswith('.png'):
        with open(os.path.join(ASSETS, f), 'rb') as fh:
            out[f[:-4]] = 'data:image/png;base64,' + base64.b64encode(fh.read()).decode()
with open(os.path.join(HERE, '..', 'js', 'assets.js'), 'w') as fh:
    fh.write('// Generated from game/assets/*.png by tools/build_assets.py\nconst ASSETS = ' + json.dumps(out, indent=0) + ';\n')
print(len(out), 'assets embedded')
