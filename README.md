# Shards of the Dawn: Chapter I

A browser RPG in the style of the first Final Fantasy, starring three original characters:

| Hero | Class | Magic | Role |
|---|---|---|---|
| **Miasma** | Dragon | Rites (breath attacks, Scaleguard) | Front-line fighter with the most HP |
| **Verai** | Shadow Mage | Shadow (Umbra Bolt, Smoke Veil, Soul Drain) | Heavy magic damage, sleep and blind |
| **Raine** | Rogue Alchemist | Formulas (Mend Tonic, Acid Flask, Revival Salts) | Fast crits, healing, and Steal |

## Play

Open `game/index.html` in a browser. It needs no build step or server.

- **Keyboard:** arrows or WASD move · Z / Space / Enter confirm · X cancel / menu · Esc menu · hold Shift to run
- **Touch:** on-screen D-pad plus A, B and MENU buttons

## What's in Chapter I

Chapter I follows the opening of FF1, from the first city through the first three boss fights:

1. **Cindral**: the king asks you to rescue Princess Liora from **Sir Vhalen** at the Ashen Temple. Beating him rebuilds the bridge east.
2. **Brinemoor**: **Captain Rusk** and his pirates hold the port. Beat them to win a ship.
3. **The Verdant Isle**: Prince Aeris of Lumenwood is under a sleeping curse. Get the Obsidian Crown from the Mirefen Hollow, take it to "King Morrow" at Duskhold Keep, and face **Morvane**.

The FF1 systems are here too:
- Spells are bought at magic shops, and each class has its own spell list.
- Spells use charges per tier, which refill at the inn.
- Weapon, armor and item shops, plus an inn (which also saves) and a clinic for reviving fallen allies.
- Random encounters, turn-based battles where you pick every command before the round plays out, and multi-hit attacks.
- Poison, sleep and blind status effects.
- Treasure chests in the dungeons, and a ship for sailing.

You can also save from the menu anywhere outside a dungeon. Saves are kept in the browser's local storage.

## Project layout

```
game/
  index.html        page, touch controls
  js/core.js        loop, input, scenes, WebAudio synth
  js/gfx.js         text, windows, menus, image helpers
  js/tiles.js       procedural 16x16 tile art
  js/sprites.js     procedural chibi walking sprites
  js/data.js        classes, spells, items, equipment, monsters, shops
  js/maps.js        world and town/dungeon maps, NPCs, story events
  js/field.js       exploration, encounters, cutscenes
  js/battle.js      battle system and backdrops
  js/ui.js          dialog, menus, shops, inn, clinic
  js/music.js       original chiptune tracks
  js/assets.js      generated: battle sprites embedded as data URIs
  assets/           generated PNG sprites
  tools/            Python art pipeline (Pillow + NumPy)
```

### Regenerating art

The party sprites come from the character sheets in `game/tools/source/`. The pipeline removes the background, warps the figure into chibi proportions, then pixelates and outlines it. The monsters are drawn with shaded shapes and pixelated the same way.

```
pip install pillow numpy
python3 game/tools/build_party.py   # party battle sprites and portraits
python3 game/tools/monsters.py      # monsters and bosses
python3 game/tools/build_assets.py  # re-embed everything into js/assets.js
```
