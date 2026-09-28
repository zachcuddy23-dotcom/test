# Chapter Two update: how to merge it, and every new art slot

This zip is the whole game, with **Chapter One and Chapter Two** together. If you (ChatGPT) have already been working on Chapter One art, **don't start over**: merge this update into your copy with the steps below. Your art and your code edits are kept.

---

## 1. Merge Chapter Two into your Chapter One work (5 minutes)

You have two folders:
- **YOUR folder:** the Chapter One game you've been editing, with your new PNGs in `assets/` and maybe some code edits.
- **NEW folder:** this zip, unzipped (Chapter One plus Chapter Two, Claude's code, no new art of yours).

Run these from inside the NEW folder:

```bash
pip install pillow numpy                            # once, if you don't have them
python3 tools/merge_chapter2.py /path/to/YOUR-folder
node tools/check/validate.js                        # must end with "ALL OK"
```

What the script does:

| Thing | What happens |
|---|---|
| Your PNGs (`YOUR-folder/assets/*.png`) | Copied into `NEW/assets/`. **Your art wins.** Chapter Two didn't change any existing PNG. |
| Code files you **didn't** edit | Chapter Two's version is kept. |
| Code files you **did** edit (for example, a `NPC_FACES` line in `ui.js`, or an enemy's `art:` in `data.js`) | Your edits are re-applied on top of Chapter Two automatically. It compares against `tools/merge/ch1_base/`, the untouched Chapter One code. |
| An edit that no longer fits (Chapter Two changed the same lines) | Listed in `MERGE_REPORT.md`, showing the Chapter One code and your version. Re-apply those by hand. There are usually none or very few. |
| `js/assets.js` | Rebuilt from the merged `assets/` folder. |

**From now on, work in the NEW folder.** Your old folder is never modified, so it's a safe backup.

**Without Python?** Do it by hand:
1. Copy every PNG from your old `assets/` into the new `assets/`.
2. For each code file you changed, compare it with `tools/merge/ch1_base/<same file>` and make the same change in the new file.
3. Run `python3 tools/build_assets.py`, or ask the user to run it.

### Chapter One saves carry over
Players can **Continue** a Chapter One save (the one made on the "Chapter One Complete" screen). The game:
1. Upgrades the save (`migrateSave()` in `js/party.js`).
2. Plays the sanctuary-collapse scene.
3. Starts Chapter Two with every Chapter One choice intact.

A player who has just finished Chapter One goes straight from the save screen into Chapter Two. **Never rename a flag, item, job or map id**, or old saves will break.

### Files that are new or changed in Chapter Two

| File | Status | What's in it |
|---|---|---|
| `js/data2.js` | NEW | Brakka, the Chainbearer and Phoenix Warlock jobs, skills, items, tier-3 gear, Chapter Two monsters and bosses, shops |
| `js/maps2.js` | NEW | The Ashkar world map (`MAPS.ashkar`) and 9 new maps |
| `js/secrets.js` | NEW | Secrets and mini-games: the Ashen Athenaeum, the Index shelf puzzle, the Book Dragon, the Ink Warden, Hollowgrin's chest, and the Bell-Ringer's memory game |
| `js/events2.js` | NEW | Every Chapter Two scene, plus the Chapter Two portraits list (`NPC_FACES`) |
| `index.html` | changed | Loads the three new files. `events2.js` must stay **after** `cinema.js`. |
| `js/events.js` | changed | The Chapter One ending now flows into Chapter Two; `saveScreen()` takes a title |
| `js/party.js`, `js/main.js` | changed | Save upgrade; Continue starts Chapter Two when a Chapter One save is loaded |
| `js/field.js` | changed | Several world maps, lava gates, and bosses standing on maps |
| `js/battle.js` | changed | Placeholder boss art (`ph`), Counter / Might / Reraise buffs, 7 new backgrounds |
| `js/tiles.js`, `js/sprites.js`, `js/music.js` | changed | Ashkar tiles and themes, 9 new NPC looks, 5 new tracks |
| `js/debug.js` | changed | 8 Chapter Two jump points (Verai stayed / left / went with Sonia) |
| `tools/merge_chapter2.py`, `tools/merge/ch1_base/` | NEW | The merge script and the Chapter One baseline |
| `tools/check/story2.js` | NEW | Plays all of Chapter Two headlessly |

---

## 2. Story bible: Chapter Two, *The Tenth Flame*

**Opening.** Right after Verai's choice, the sanctuary of Elaris at the Twin Falls tears free of the cliff and **slides into the sea**. This is flag `sanctuarySunk`. **Chapter Four returns here**, so keep the shot mysterious. On the Wren, Raine decides she needs answers: her crescent pendant glows the same red as Ashkar's symbol. The party sails to **Ashkar, the Dominion of Flame and Ash**.

**Places (world map `ashkar`):**
- **Emberport:** a harbor with twin burning statues of Grimnar and Malakar, and a shrine to Zariel.
- **Charnoch:** a burning village; Mother Coal lives here.
- **Kharak Yr:** the cinder forge and the Gunworks; Brakka is here.
- **Draumond's Gate:** a Grimnarite necropolis that keeps the Book of the Dead.
- **Mount Terminus:** the Final Gate, guarded by the Ash Ferryman.
- **The Throne of Cinders:** Ashkar's seat inside a ring of fire.

**New ally: Brakka Sootfinger.** A goblin gunsmith, loud and cheerful, whose innate command is **Powder** (Blast Shot, Smoke Charge, Flashbang, Big Boom). She joins if there's room in the party. Otherwise she waits in Kharak Yr, and you can talk to her there once a seat opens.

**New jobs:**
- **Chainbearer** (Zariel; the **Chain** command: counters, vengeance, blood oaths). Unlocked at Zariel's shrine.
- **Phoenix Warlock** (Ashkar; the **Rebirth** command: fire, auto-life, full revive). Unlocked at the end of the chapter.

**Villains:**
- **Warlord Kargath** of the Crimson Edict ("K." in the letter) is secretly working for Sonia, collecting the Anvil Shard, Grimnar's reliquary.
- **Ashkar** himself is a smug, dangerous, laughing phoenix god. He recognizes Raine's crescent: *"Hello, Miasma."* Miasma once carried one of his three tokens. This is the big hint that Miasma is Raine's mother; **the full truth is still not told**.

**Ending.** A letter arrives: **Odeaon has been arrested** by the Temple of Light. Chapter Three starts from there.

### Choices, and what carries over

| Where | Choice | Flags | Effect |
|---|---|---|---|
| (Chapter One) | Verai stayed / left / went with Sonia | `veraiStayed` / `veraiLeft` / `veraiSonia`, `bond` | Changes the opening, who is in the party, **the whole Mount Terminus scene**, and the ending |
| (Chapter One) | Caught Luna's secret | `lunaRevealed`, `lunaCaught` | Luna's lines, and the Emberport legionnaire scene where you can catch her again |
| Emberport gate | Pay 3,000 G, or Trial by Combat vs. Vorsk | `bribed` / `trialWon` | Zariel's shrine costs HP if you paid. NPC reactions change. |
| Charnoch | Press Miasma about the token, or let it go | `pressedMiasma` (count) | At the Throne, Miasma tells **half the truth** (`miasmaHalfTruth`) if you pushed |
| Gunworks | Take the blackpowder or blow it up | `tookPowder` / `blewPowder` | Items and dialog |
| Draumond | Confront Miasma at the Book | `pressedMiasma` +1; `miasmaPromise` if pressed twice | Pressed twice: Miasma swears to tell Raine everything once the Anvil is safe |
| Mount Terminus (Verai with Sonia) | Reach out or draw a weapon on the Veiled Daughter | `veraiDoubt` / `veraiCold` | Sets up Verai in Chapter Three |
| Mount Terminus (Verai left) | "Come back" or "I'll wait" | `veraiRejoined` / `veraiWaits` | "Come back" works only if `bond` ≥ 1. "I'll wait" raises `bond`. |
| Throne of Cinders | Give Ashkar the Anvil Shard, or refuse | `ashkarAlly` / `ashkarRival` | Ally: fight Kargath. Rival: fight Ashkar, then Kargath's fate plays as a cinematic. |

### Secrets and mini-games (`js/secrets.js`)

**The Ashen Athenaeum** is a hard optional library dungeon on the north-east coast of Ashkar, reachable after the Gunworks. Its monsters are about 1.5 times tougher than the rest of Chapter Two.
- **Reading Room: the Index of Myndra.** A shelf puzzle: put five tomes in order using logic clues. The clues are generated fresh each time, and there is always exactly one answer.
  - **Solved first try:** you get the Starbound Rod, and the stairs open.
  - **Misfiled:** the **Book Dragon** tears itself out of the shelves. You choose between **re-shelving against a 1-minute clock**, or **fighting it**. Running out of time also means a fight.
  - **After solving:** you can misfile on purpose to wake the dragon for its reward (Dragonscript).
  - The dragon is weak to fire. Paper, after all.
- **Deep Stacks: the Ink Warden** guards the Ledger of Seats, a lore page and hook for Chapter Three: "Nyxia's seat was STOLEN, and what is stolen can be stolen back."

**Hollowgrin's chest.** The chest in the corner of Charnoch (bottom right) seems normal: open it and it gives Mega-Tonics.
- **Open it a second time** and you get "Hey... it looks like there's something in there."
- **Reach in:** a warning follows, then an offer to save first.
- The party is shrunk into the chest. **There are no exits and no saving inside.** The game doesn't say so in advance, which is why it offers a save first.
- The boss is **Hollowgrin, the Chest-Fey**, a crowd-control specialist. He uses Sleep, Silence, Stop, Blind and Fear.
- His stats and his minions' **scale to the party's level**, so he's a fair fight whenever it's found.
- **Rewards:**
  - The Fey Ribbon (blocks all five of those statuses), the Grinning Knife, the Thimble Helm (in a chest inside), and 5000 gold.
  - **A special skill:** **Hollow Night** for Verai if she's in the active party; otherwise **Twin Moon Oath** for Luna.

**New statuses:**
- **Stop** freezes the time gauge for a few seconds.
- **Silence** blocks job and innate commands.
- Both are cured by **Echo Mint** (new, sold in Charnoch, Kharak Yr and Draumond) and by every item or spell that already cured Sleep.

**The Bell-Ringer (Draumond's Gate)** runs a memory mini-game: repeat the bell pattern with the arrow keys, over three rounds of 4, 6 and 8 bells. Each round's prize is given once: Ash Salves, Mega-Tonics, and a Grave Charm.

---

## 3. New art for Chapter Two (everything, with filenames)

Same rules as `CHATGPT_GUIDE.md` sections 3 and 4:
- Exact filenames, transparent PNGs.
- Heroes face **LEFT**; monsters and bosses face **RIGHT**.
- Run `python3 tools/build_assets.py` after adding images.

Anything missing falls back to a placeholder, so **add art in any order**.

Palette for Ashkar: ash `#3a302a`, ember `#ff9030`, lava `#ff6010`, obsidian `#1a1418`, blood-red banners `#8a1a14`, phoenix gold `#ffd040`.

### 3.1 Brakka (highest priority)
| File | Size | Description |
|---|---|---|
| `brakka.png` | ~110px tall, facing LEFT | Short green goblin woman, big ears, soot-streaked face, goggles pushed up, leather apron full of tools, an oversized hand cannon. Grinning. |
| `brakka_face.png` | 128×128 | Bust portrait with the same grin and goggles |
| `field_brakka.png` | 3×4 grid (see guide 4.3) | Walking sprite |
| `brakka_sheet.png` | 11-frame sheet (guide 3.4) | Her `attack2` frame should be the cannon firing |

### 3.2 New job outfits (`<hero>_<job>.png`, then `<hero>_<job>_sheet.png`)
| Job | Look | Files |
|---|---|---|
| Chainbearer (`chainbearer`), patron Zariel | Scorched black leathers, red-hot chains wrapped around the arms, a chain-wrapped blade | `raine_chainbearer`, `miasma_chainbearer`, `verai_chainbearer`, `luna_chainbearer`, `brakka_chainbearer` |
| Phoenix Warlock (`phoenix`), patron Ashkar | Crimson and gold robes with feather mantles, a black crescent emblem, fire in the hands | `raine_phoenix` (**key image: the pendant glows**), `miasma_phoenix`, `verai_phoenix`, `luna_phoenix`, `brakka_phoenix` |
| Brakka in the older jobs | Same idea as the table in guide 4.1 | `brakka_freelancer`, `brakka_oathblade`, `brakka_dawnsinger`, `brakka_arcanist`, `brakka_masquer`, `brakka_tidecaller`, `brakka_reaper`, `brakka_wyrmblood` |

### 3.3 Bosses (`b_<art>.png`, ~300 to 340px tall, facing RIGHT)
These use scaled placeholders until the file exists. **Once the PNG is added, delete that enemy's `ph: {...},` in `js/data2.js`.** The game already prefers the real PNG, so deleting it is only tidying up.

| File | Boss | Prompt idea |
|---|---|---|
| `b_vorsk` | Gate Champion Vorsk | Huge scarred hobgoblin gladiator, red Crimson Edict tabard, tower shield and cleaver, laughing |
| `b_cannongolem` | Grimnar's Voice | A giant bronze cannon on four clanking iron legs, a furnace belly, steam vents, dwarven runes |
| `b_ferryman` | The Ash Ferryman | A tall hooded skeleton of ash poling a boat of bones; its oar trails grey smoke, with violet cracks where Sonia's power leaks in |
| `b_veiledverai` | Veiled Daughter | **Verai** in a violet-black veil and Sonia-style shadow robes, smoke gone violet and cold. She must look like Verai, just lost. |
| `b_ashkargod` | Ashkar, the Tenth Flame | A towering phoenix-man of fire with gold eyes, a black crescent on his chest, wings of flame, a smug grin |
| `b_kargath` | Warlord Kargath | A hulking warlord in black-and-crimson plate, a split mask (half smiling, half burned), a black greatsword |

### 3.3b Secret bosses and places (`js/secrets.js`)
| File | Status | Notes |
|---|---|---|
| `b_bookdragon` | **Done** (from the user's painting, `tools/source/boss_bookdragon.webp`) | Optional: `b_bookdragon_2` idle frame with pages swirling |
| `b_hollowgrin` | **Done** (from the user's painting, `tools/source/boss_hollowgrin.webp`) | Optional: `b_hollowgrin_2` with a wider grin |
| `b_inkwarden` | Needed; placeholder until then | A tall librarian-wraith made of dripping black ink, a quill as long as a spear, a ledger chained to its chest, and crossed-out names floating around it. Delete its `ph` in `js/secrets.js` once added. |
| `face_hollowgrin`, `face_bookdragon`, `face_inkwarden`, `face_bellringer` | Needed (128×128) | Already wired in `NPC_FACES` |
| `bg_library` (960×440) | Optional | Towering shelves in a half-buried library, teal star-light, drifting pages |
| `bg_fey` (960×440) | Optional | The inside of a chest from a tiny person's view: giant buttons, a thimble, spools, a keyhole of light far above |
| `cine_shrink` (960×640) | Optional | The party being pulled into a chest, shrinking |
| Monsters `m_inkwraith`, `m_paperwing`, `m_tomemimic`, `m_gargoyle`, `m_lostscholar`, `m_thimblepixie`, `m_buttonimp`, `m_needlesprite` | Optional | They use tinted art now. Same rule as 3.4: set `art:` and delete `tint`. |
| Tiles, theme `archive` / `fey` | Optional | `tile_<art>_archive.png`, `tile_<art>_fey.png` (shelf, floor, carpet, pillar and so on) |

### 3.4 Chapter Two monsters (optional unique art)
These currently use tinted Chapter One art. To give one its own art: make `m_<key>.png`, then in `js/data2.js` set `art: '<key>'` and **delete its `tint`**.

| id | Name | Suggested key | Prompt idea |
|---|---|---|---|
| cinderhound | Cinder Hound | `cinderhound` | A dog made of coals, glowing ribs |
| ashimp | Ash Imp | `ashimp` | A grey imp shedding flakes of ash |
| obsidianlizard | Obsidian Lizard | `obsidianlizard` | A glassy black lizard with lava veins |
| kobold | Kobold Sapper | `kobold` | A small red kobold carrying a lit powder keg |
| legionnaire | Hobgoblin Legionnaire | `legionnaire` | A disciplined hobgoblin in red plate |
| bugbear | Bugbear Enforcer | `bugbear` | A shaggy bugbear with a spiked club |
| lavaslime | Lava Gel | `lavaslime` | A molten slime with a crust |
| magmagolem | Magma Golem | `magmagolem` | A rock golem with magma cracks |
| ravenwraith | Raven Wraith | `ravenwraith` | A ghost made of black ravens |
| gravewight | Grave Wight | `gravewight` | A burial-wrapped corpse with ember eyes |
| ashskeleton | Ashbone Soldier | `ashskeleton` | A soot-black skeleton with a shield |
| nightshade | Stolen Night | `nightshade` | A violet shadow with a smiling mask (Sonia's power) |
| cultist | Phoenix Zealot | `phoenixzealot` | A fanatic in red robes with a feather mask |
| crimsonguard | Crimson Edict Guard | `crimsonguard` | An armored red knight with a halberd |

### 3.5 Portraits (128×128)
They're already wired in `js/events2.js` (`NPC_FACES`):
- `face_hrask`: a stern hobgoblin gate captain, scarred ear
- `face_vorsk`: see Vorsk above
- `face_coal`: Mother Coal, a tiny ancient ash-dwarf woman with soot-black skin, bright eyes and a shawl of embers
- `face_keeper`: Keeper of the Book, a Grimnarite priest in grey with raven feathers and a stitched mouth mask pulled down
- `face_ashkar`: see Ashkar above (smug)
- `face_kargath`: see Kargath above
- `face_ferryman`: a skull in a grey hood
- `face_legionnaire`: a friendly hobgoblin soldier

### 3.6 Field sprites (`field_<look>.png`, 3×4 grid)
`field_brakka`, `field_hobgob` (hobgoblin soldier), `field_orc` (orc dockworker), `field_grimpriest` (Grimnarite priest), `field_dwarf` (smith), `field_kobold`, `field_ashkarman` (**Ashkar's human form**: red coat, flame hair, gold eyes), `field_kargath`, `field_zealot2` (phoenix zealot).

### 3.7 Battle backgrounds (`bg_<name>.png`, 960×440)
| Name | Where | Prompt idea |
|---|---|---|
| `ashplains` | The Ashkar world map | Grey ash plains under a red sky, distant volcano |
| `lava` | Lava fields | Cracked black rock and rivers of lava |
| `forge` | The Gunworks | A huge foundry interior, chains, molten channels |
| `grave` | Draumond | A necropolis with grave rows and a tolling bell tower |
| `volcano` | Mount Terminus | A volcano slope, a gigantic stone gate |
| `caldera` | Throne of Cinders | Inside a caldera ringed with fire, a throne of cinders |
| `port2` | Emberport arena | An arena by the harbor, twin burning statues |

### 3.8 Tiles (optional; guide 4.7 explains the format)
- **New tile arts:** `ashplain`, `obsidian`, `lavaflow` (4 frames), `deadwood`, `port2`, `ashvillage`, `fortress`, `necropolis`, `volcano` (2 frames), `cinderthrone` (2 frames), `grave`, `bell` (2 frames).
- **New themes** for `tile_<art>_<theme>.png`: `ashworld`, `emberport`, `forge`, `necro`, `caldera`.

### 3.9 Cinematic stills (optional, 960×640)
To use one, add a layer to that shot in `js/events2.js`:

```js
layers: [{ img: 'cine_sanctuary_fall', x: W / 2, y: H, s: 1 }]
```

Suggested stills:
- `cine_sanctuary_fall`: the white sanctuary sliding off the cliff into the sea between the twin falls. Keep it eerie; Chapter Four returns here.
- `cine_wren_night`: the party on the Wren's deck at night.
- `cine_emberport`: arriving at Emberport under a red sky, twin burning statues.
- `cine_throne`: Ashkar on his Throne of Cinders.
- `cine_odeaon_cell`: Odeaon in chains in a white-gold cell.

### 3.10 Music (optional)
New tracks in `js/music.js`: `ashkar`, `emberport`, `forge`, `grave`, `phoenix`. Keep them original.

---

## 4. Test it
```bash
node tools/check/validate.js                         # maps + data, "ALL OK"
node tools/check/sim.js ember && node tools/check/sim.js throne   # Chapter Two battle balance
NODE_PATH=$(npm root -g) node tools/check/story2.js stay     # plays Chapter Two from a Chapter One save (also: leave, sonia)
```

In the game, press **F2 → Jump to story point** to reach any Chapter Two scene. There are "Ch2:" entries for each Verai outcome.
