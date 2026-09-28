"""Turn any painted image into a game-ready pixel sprite in the house style.

    python3 tools/pixelate.py <input> <output.png> --height 128 [--colors 40] [--flip]

- Removes a flat white/grey/checkerboard background (or keeps real transparency).
- Crops to the figure, scales to --height pixels, quantizes the palette and adds a 1px dark outline.
- --flip mirrors it (heroes face LEFT in battle, enemies face RIGHT).
Then run  python3 tools/build_assets.py  to embed the new PNG into js/assets.js.
"""
import argparse, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bosses import load
from art import pixel
from PIL import Image, ImageOps

ap = argparse.ArgumentParser()
ap.add_argument('input'); ap.add_argument('output')
ap.add_argument('--height', type=int, default=128)
ap.add_argument('--colors', type=int, default=40)
ap.add_argument('--flip', action='store_true')
ap.add_argument('--raw', action='store_true', help='just resize/crop, no palette or outline (for backgrounds)')
a = ap.parse_args()
if a.raw:
    im = Image.open(a.input).convert('RGBA')
    w = round(im.width * a.height / im.height)
    im = im.resize((w, a.height), Image.LANCZOS)
else:
    im = pixel(load(a.input), a.height, colors=a.colors)
if a.flip: im = ImageOps.mirror(im)
im.save(a.output); print(a.output, im.size)
