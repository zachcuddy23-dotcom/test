# The Tenth Seat: HD-2D Look (Pixel Diorama) Guide

This update gives the game a **"2D but 3D" look**: pixel sprites and pixel tiles stay pixel art, and the depth comes from the camera, the light and the shadows. Think of a tiny model town under a lamp, seen through a tilt-shift lens.

**The look is already in the game without any new art.** Section 3 covers the art that would push it further.

> **Ground rule 4 still applies.** "HD-2D" is a rendering technique (tilt, depth blur, lights, bloom). Take the technique, never the content: no Octopath Traveler characters, UI layouts, fonts, logos or music. Everything stays Cael'Brithar.

---

## 1. What the code does now (`js/hd2d.js`)

| Effect | What you see | Where it's tuned |
|---|---|---|
| **Tilted camera** | The top of the screen is farther away (narrower, squashed) and the bottom is closer. It tilts much harder while Miasma is flying, like looking down from the sky. | `HD_MOOD[*].k`, `HD2D.fieldK()` |
| **Depth of field** | The top and bottom of the screen go soft and the middle band stays sharp. | `HD2D.dof()` in `HD2D.fieldPost()` |
| **Real lights** | Dark places (dungeons, forges, ice caves, the crater) are dim. Torches, lanterns, lava, altars, fountains and shop doors light them, and torches flicker. The party carries a small light. | `HD_LIGHTS` (by tile art), `HD_MOOD[*].amb` |
| **Soft shadows** | Walls, trees, barrels and statues cast shadows down and right onto the floor. Wall blocks get a lit top edge and a shaded front, and every character stands on a round shadow. | `HD2D.tileShadows()`, `HD2D.blob()` |
| **Bloom** | Only the brightest things glow: lava, flames, sunlit fountains, holy light. | `HD2D.bloom()` |
| **Atmosphere** | Slow sun shafts outdoors, floating dust or embers or snow motes, and a colour grade with a vignette per place. | `HD_MOOD`, `HD2D.atmosphere()`, `HD2D.grade()` |
| **Battles** | The backdrop is blurred like distance, with haze where the ground meets the sky. Fighters stand on soft shadows, with bloom and a grade by location. | `HD2D.battleBg()`, `HD_BATTLE_MOOD` |

**Config > Visuals** switches between **HD-2D** (the default) and **Classic** (the old flat look). It's saved per save file. Use Classic on a slow phone.

### Choosing a place's mood
Every map theme maps to a mood in `HD_THEME`: day, indoor, holy, dark, fire, ice, deep, void, snow or dusk. To override one map, give it `hdMood` in its map definition, either a string or a function:

```js
hdMood: () => flag('ch6night') ? 'void' : 'dusk',
```

### Making something glow
Add its tile art name to `HD_LIGHTS`: `art: [r, g, b, radius in tiles, flicker 0/1]`. For example, `crystal: [140, 220, 255, 2, 0]`.

---

## 2. The look in one paragraph (use this for every prompt)

> **Master style prompt:** *"Pixel art in a high-detail 16-bit JRPG style, designed for an 'HD-2D' diorama game: crisp pixel clusters, a 1-pixel dark coloured outline (deep plum, not black), light coming from the top-left, a strong 3-tone shading ramp on every surface, a warm and slightly desaturated palette, no anti-aliasing, no gradients, no blur, transparent background. Original fantasy world (Cael'Brithar); no references to existing games."*

Blur, glow, lighting and shadows are added by the game. **Never paint them into the art.** Art with baked-in blur or glow looks muddy once the game adds its own.

---

## 3. Art that pushes the look further (priority order)

### 3.1 Field walking sprites: the biggest win
The heroes currently use code-drawn chibi sprites. HD-2D characters are slightly taller (about 3 heads), with clear silhouettes and strong top-left lighting.

| File | Layout |
|---|---|
| `field_<look>.png` | **3 columns × 4 rows.** Columns: stand, step A, step B. Rows: down, up, left, right. **Cell 18×24 px** (the game draws it at exactly 3×, 54×72). |

Looks to make, in order: `raine`, `miasma`, `verai`, `luna`, `vesper`, `odeaon`, `brakka`, `ashkarman`, `lunawolf`. Then the main NPCs (Sonia, Hallorn, Grandmother Hesk, the gods' avatars).

**Prompt add-on:** *"Walking sprite sheet, 3 columns by 4 rows, each cell exactly 18×24 pixels, character about 22 px tall, feet on the bottom row of the cell, rows face down/up/left/right, columns stand/left-foot/right-foot."*

AI image tools rarely hit an exact grid. Generate the sheet large, then run:
`python3 tools/pixelate.py in.png assets/field_raine.png --height 96 --colors 32`
Check every cell lines up before running `tools/build_assets.py`.

### 3.2 Tile textures: richer surfaces
Overrides are `tile_<art>.png`, or `tile_<art>_<theme>.png` for one theme only. Each is a **16 px tall strip of 16×16 frames**: variants for normal tiles, animation frames for animated ones. They are drawn at 3×.

HD-2D lives on texture. Do these first:
1. `floor`, `wall`, `path`, `grass`: stone flags with worn edges, bricks with moss, packed dirt with pebbles.
2. `roof`, `bwall`, `timber`: town buildings.
3. `water` (4 frames), `lavaflow` (4 frames), `torch` (2 frames), `lantern` (2 frames).
4. `tree`, `birch`, `pillar`, `statue`, `barrel`, `fence`.

**Wall tiles:** draw them as the **top of a block**, lighter, with a darker front face along the bottom 5 px. The game adds the shadow below them, so don't draw one.

Themed versions (`tile_wall_forge.png`, `tile_floor_temple2.png` and so on) make each region feel distinct. The theme names are in `js/tiles.js` `THEMES`.

### 3.3 Battle backdrops: the second biggest win
Each is `bg_<name>.png` at **960×440**. The game blurs the top 60% as distance, so **paint the far background with full detail** and leave a clear, flat-ish ground band (the bottom ~40%) where the fighters stand.

Names: `plains meadow beach forest deepwood burning sea river temple tower vale sanctum town ashplains lava forge grave volcano caldera port2 snowfield icecave summit undercity drowned library fey`

**Prompt add-on:** *"Side-view battle background, 960×440, pixel art layered like a stage diorama: far layer (sky, mountains or walls), mid layer (trees, pillars, buildings), near ground plane in the bottom 40% that is open and fairly flat for characters to stand on. No characters."*

### 3.4 Hero battle sheets
These are unchanged: `<hero>_<job>_sheet.png`, 11 frames in one row (see `CHATGPT_GUIDE.md` 3.4). For the HD-2D look, keep them as pixel art (not painted), lit from the top-left, with the same outline colour as the field sprites.

---

## 4. Checking your work
1. Rebuild the assets: `python3 tools/build_assets.py`
2. Open `index.html` and walk through a town (day), the Kharak Yr gunworks (dark, with lava and lanterns) and the world map. Fly the dragon to see the strong tilt.
3. Toggle **Config > Visuals** to compare against Classic.
4. Run the checks in `CHATGPT_GUIDE.md` section 8.

If something looks too bright, lower that mood's `grade` alpha or raise the bloom cut in `HD2D.fieldPost()`. If a dungeon is too dark, raise its `amb` numbers (255 means no darkening).

---

## 5. Painted maps: one picture instead of tiles

A map can use one big painting instead of tiles. **The Docks of Solanthia** is the first one, reached through the east gate of Solanthia (`js/painted.js`).

The walls, doors, NPCs, chests and shops still come from the map's `rows`. The grid is simply invisible, and **48 picture pixels = 1 tile**.

### Adding a painting
1. Paint it at the map's size: width = tiles across × 48, height = tiles down × 48. A ChatGPT image at 1536×1024 is 32×21 tiles.
2. Save it as `assets/paintings/<key>.jpg` (JPG keeps the file small), then run `python3 tools/build_paintings.py`.
3. In the map, add `painted: '<key>'`. Then write `rows` to match the picture:
   - `.` walkable
   - `z` blocked
   - `+` a door (listed in `doors`)
   - shop letters (`I`, `W`, `A`, ...) on stalls
   - digits for NPCs and letters for chests, as usual
4. Optional extras:
   - `lights: [[x, y], ...]`: lamp positions in picture pixels. They glow and flicker in HD-2D.
   - `water: true`: sun glints on the blue parts of the picture.
   - `gulls: 5`: seabirds.

### Painting prompt (what the docks painting looks like)
> *"High-detail fantasy harbor town, warm golden-hour light, cream limestone buildings with terracotta roofs, blue-and-gold sun banners, cobbled plaza, wooden piers, painted in a crisp 'HD-2D' diorama style with tiny pixel-like detail. Camera looking down from high above at about 45°, slightly from the front, so the ground is flat and readable. Wide open walkable areas (plazas, piers, stairs) at least 100 px across. No people. 1536×1024."*

Leave **open floor** where people should walk. NPCs and heroes are drawn on top, so a painting with busy clutter everywhere gives them nowhere to stand.
