# Start here

This zip contains the full game **The Tenth Seat, Chapter One** plus everything needed to finish its art.

## To play
Unzip it and open `index.html` in any web browser. No install or internet is needed, except for the pixel font, which falls back to a plain font offline.
- **Controls:** arrows move, Z confirm, X menu or cancel, Shift run.
- **Debug menu:** press F2 or the DEBUG button.

## To hand it to ChatGPT
1. Upload this whole zip to ChatGPT (a plan that can read files and generate images).
2. Paste this message:

> You're taking over art and animation for my browser RPG "The Tenth Seat". Unzip the file and read `CHATGPT_GUIDE.md` completely before doing anything. Follow its ground rules exactly: keep all filenames and ids, and never make it look like Final Fantasy.
>
> Start with section 4.1 (the starting-job hero sprites: Raine Oathblade, Miasma Freelancer, Verai Dawnsinger), then section 4.1b (Luna), then the portraits in 4.2.
>
> For every image, match the character sheets in `tools/source/`. Save each image under the exact filename the guide gives. Then run `python3 tools/build_assets.py` so the game embeds it.
>
> After each batch, give me the updated zip so I can test it. Show me each image before moving on.

## What's inside
| Path | What it is |
|---|---|
| `index.html`, `js/` | The game |
| `assets/` | Current art as PNGs (bosses, monsters, heroes, portraits) |
| `CHATGPT_GUIDE.md` | The full brief: story, characters and secrets, every art slot with sizes and prompts, the animation frame layout, and how to add content |
| `README.md` | Game features and controls |
| `tools/source/` | Original character sheets and boss paintings (the style references) |
| `tools/pixelate.py`, `tools/bosses.py`, `tools/build_assets.py` | Art pipeline: turn paintings into game sprites, then embed them |
| `tools/check/` | Automated checks: map and data validation, battle balance, full story playthrough |
