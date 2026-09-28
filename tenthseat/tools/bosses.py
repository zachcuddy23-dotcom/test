"""Turn the painted boss illustrations in tools/source/ into pixel-art battle sprites.

Usage: python3 tenthseat/tools/bosses.py && python3 tenthseat/tools/build_assets.py
"""
import os, sys
from collections import deque
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from art import pixel
from PIL import Image
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'source')
OUT = os.path.join(HERE, '..', 'assets')

# name -> (source file, sprite height in screen pixels, palette size)
BOSSES = {
    'veilstag': ('boss_veilstag.webp', 300, 40),
    'bloomcolossus': ('boss_bloomcolossus.webp', 330, 48),
    'votary': ('boss_votary.webp', 320, 40),
    'chimera': ('boss_chimera.webp', 300, 48),
    'sonia': ('boss_sonia.webp', 340, 48),
    'bookdragon': ('boss_bookdragon.webp', 340, 48),
    'hollowgrin': ('boss_hollowgrin.webp', 300, 40),
}


def cut_flat_background(rgb):
    """Flood-fill pale, unsaturated pixels (white or checkerboard) inward from the border."""
    a = rgb.astype(int)
    mx, mn = a.max(2), a.min(2)
    bg_like = (mn > 222) & (mx - mn < 14)
    h, w = bg_like.shape
    seen = np.zeros_like(bg_like)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if bg_like[y, x]: seen[y, x] = True; q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if bg_like[y, x] and not seen[y, x]: seen[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and bg_like[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True; q.append((ny, nx))
    return ~seen


def load(path):
    im = Image.open(path)
    if im.mode == 'RGBA':
        a = np.asarray(im).copy()
        a[..., 3] = np.where(a[..., 3] > 128, 255, 0)
        return Image.fromarray(a, 'RGBA')
    rgb = np.asarray(im.convert('RGB'))
    keep = cut_flat_background(rgb)
    out = np.dstack([rgb, keep.astype(np.uint8) * 255])
    return Image.fromarray(out, 'RGBA')


if __name__ == '__main__':
  for name, (f, hgt, cols) in BOSSES.items():
    im = load(os.path.join(SRC, f))
    s = pixel(im, hgt, colors=cols)
    s.save(os.path.join(OUT, f'b_{name}.png'))
    print(name, s.size)
