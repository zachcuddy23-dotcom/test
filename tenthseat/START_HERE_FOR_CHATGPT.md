# Start here

This zip contains the full game **The Tenth Seat, Chapters One to Four**, and everything needed to finish its art.

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

## If ChatGPT already worked on an older version (any earlier chapter)
Upload this zip **and** ChatGPT's latest zip, then paste:

> Here is the newest update of "The Tenth Seat" (Chapter Four). Unzip it and read `CHAPTER4_UPDATE_FOR_CHATGPT.md` first, then `CHAPTER3_UPDATE_FOR_CHATGPT.md` if you haven't done Chapter Three's art yet. Merge it with your work exactly as section 1 says: run `python3 tools/merge_update.py <your older folder>` from inside the new folder, fix anything listed in `MERGE_REPORT.md`, then run `node tools/check/validate.js`. Give me the merged zip before making any new art.
>
> Then make the new art from section 4 of the Chapter Four file, starting with Luna unmasked and Luna berserk. After that, do anything still missing from the Chapter Three file (Miasma's Dragon form, Rimeclaw, Odeaon). If you haven't done Chapter Two's art yet, `CHAPTER2_UPDATE_FOR_CHATGPT.md` section 3 lists it. Keep every filename exactly as written. Show me each image before moving on, and give me an updated zip after each batch.

## (Older) If ChatGPT only worked on Chapter One
Upload this zip **and** ChatGPT's latest Chapter One zip, then paste:

> Here is Chapter Two of "The Tenth Seat". Unzip it and read `CHAPTER2_UPDATE_FOR_CHATGPT.md` first. Merge it with your Chapter One work exactly as section 1 says: run `python3 tools/merge_chapter2.py <your chapter one folder>` from inside the new folder, fix anything listed in `MERGE_REPORT.md`, then run `node tools/check/validate.js`. Give me the merged zip before making any new art.
>
> Then make the new Chapter Two art from section 3, starting with Brakka (3.1), the six bosses (3.3), then the secret-dungeon art in 3.3b (the Ink Warden and the portraits). Keep every filename exactly as written. Show me each image before moving on, and give me an updated zip after each batch.

## What's inside
| Path | What it is |
|---|---|
| `index.html`, `js/` | The game |
| `assets/` | Current art as PNGs (bosses, monsters, heroes, portraits) |
| `CHAPTER4_UPDATE_FOR_CHATGPT.md` | Chapter Four: merging, the story and choices, and every new art slot |
| `CHAPTER3_UPDATE_FOR_CHATGPT.md` | Chapter Three part one: how to merge it, the story and flags so far, and every new art slot |
| `CHAPTER2_UPDATE_FOR_CHATGPT.md` | How to merge Chapter Two into earlier work, the Chapter Two story and choices, and **every new art slot** |
| `CHATGPT_GUIDE.md` | The full brief: story, characters and secrets, every art slot with sizes and prompts, the animation frame layout, and how to add content |
| `README.md` | Game features and controls |
| `tools/source/` | Original character sheets and boss paintings (the style references) |
| `tools/pixelate.py`, `tools/bosses.py`, `tools/build_assets.py` | Art pipeline: turn paintings into game sprites, then embed them |
| `tools/merge_update.py`, `tools/merge/` | Merges this update into an older folder (Chapter One or Two) that already has new art |
| `tools/check/` | Automated checks: map and data validation, battle balance, full story playthrough |
