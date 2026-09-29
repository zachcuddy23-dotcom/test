# Chapter Three update (complete: *The Knight in the Dark*)

This zip is the whole game: Chapters One and Two, the secrets, and **all of Chapter Three, *The Knight in the Dark***. Chapter Four comes next, and saves carry over.

If you (ChatGPT) already have an older copy with your art in it, **don't start over.** Merge this update in first (section 1). Then make the new art (section 3).

---

## 1. Merge this update into your copy

Run this from inside the NEW folder (this zip, unzipped):

```bash
pip install pillow numpy                              # once
python3 tools/merge_update.py /path/to/YOUR-older-folder
node tools/check/validate.js                          # must end with "ALL OK"
```

- It works whether your copy was made from the **Chapter One**, **Chapter Two** or **Chapter Three part one** zip. It finds out which by comparing your files with `tools/merge/ch1_base/`, `ch2_base/` and `ch3a_base/`, and tells you in `MERGE_REPORT.md`.
- **Your PNGs** are copied into `assets/`. Your art always wins.
- **Your code edits** (for example a new `NPC_FACES` line, or an enemy's `art:`) are re-applied on top of this update.
  - Edits that can't be re-applied automatically are listed in `MERGE_REPORT.md` for you to copy over by hand.
  - `.js` files you added yourself are copied over. Remember their `<script>` tags.
- `js/assets.js` is rebuilt at the end.
- `tools/merge_chapter2.py` still works and does the same thing.

**Saves:** a finished Chapter Two save (made on the "Chapter Two Complete" screen) goes straight into Chapter Three when you press **Continue**. A player who finishes Chapter Two now also flows directly into Chapter Three. Never rename a flag, job, item or map id.

### New and changed files

| File | Status | What's in it |
|---|---|---|
| `js/data3.js` | NEW | The **Dragon** job and its skills, tier-4 gear, the Wyrmspire's monsters, Old Mother Yeti, Rimeclaw, and the Hearthmoor shop |
| `js/maps3.js` | NEW | The **Frostreach** world map, Hearthmoor, the clinic, the Wren's deck, the Wyrmspire (5 maps), snow/ice tiles and themes, and 3 new music tracks |
| `js/events3.js` | NEW | Every Chapter Three scene |
| `index.html` | changed | Loads the three new files (`events3.js` last) |
| `js/party.js` | changed | `leadMember()` (party leader); the save upgrade now covers benched members too |
| `js/field.js` | changed | **Ice floors** make you slide; the leader walks in front |
| `js/cinema.js`, `js/ui.js` | changed | Cutscenes put the leader in front; **Menu → Leader** appears once it's unlocked |
| `js/battle.js`, `js/core.js` | changed | Snow, ice-cave and summit backgrounds. Fixed music after battles on maps whose track changes with the story. |
| `js/events2.js`, `js/main.js`, `js/debug.js` | changed | Chapter Two flows into Chapter Three; new Chapter Three jump points (F2) |
| `tools/merge_update.py`, `tools/merge/ch2_base/` | NEW | The general merge script, plus a Chapter Two baseline |
| `tools/check/story3.js`, `tools/check/validate.js` | NEW / changed | Plays Chapter Three; checks every ice floor can always be solved (no softlocks) |

---

## 2. Story bible: Chapter Three, part one

**Where it starts.** The Wren sails north from Ashkar to rescue Odeaon. On deck at night, Miasma finally starts to tell Raine the truth: *"Your mother isn't dead, Raine. Your mother is—"*

Raine collapses. **Ashkar's token, her crescent pendant, has woken up** after standing before his throne. It is burning her from the inside with **Cinderblight**, god-fire in the blood.

**Hearthmoor** is a snowbound harbor at the foot of the **Wyrmspire**.
- **Dr. Wenna Thistlewood**, a halfling doctor, explains that only the **Frostheart Lily** from the summit can quench god-fire. No one has climbed the mountain in twenty years, "not since the red dragon left and the Frost Wyrm moved in."
- Miasma: *"I know the way. I lived up there."*
- **Raine leaves the party and Miasma leads.** Three climb: Miasma and two friends. If there are three friends, the player picks **who stays at Raine's bedside**, and that friend has a short line about Raine.
- **The bedside confession:** alone with the unconscious Raine, Miasma says it out loud: *"Your mother is me."* Raine doesn't hear it. The player does.

**The Wyrmspire** has five maps, each with a backstory moment:
1. **Snowy Trail.** Miasma used to fly it "in three wingbeats." Then the first friend's backstory:
   - **Luna:** born in a den, taught to be kind anyway. If her secret isn't out yet, she cracks and says "knight hugs" instead, and gets caught again.
   - **Verai:** the bells on her door, and Raine cutting them down every night for a year.
   - **Brakka:** "Goblins are for sweeping," and her first cannon built out of a broom closet.
2. **Frozen Falls.** An **ice-slide puzzle**, and the second friend's backstory.
3. **The Old Nest**, Miasma's hoard, with a Dawn Lantern to save at. Two things to find:
   - **The Dented Helm:** a 20-year-old knight came to slay her, forgot his sword, and offered her half his sandwich. It was **Odeaon**.
   - **The Carved Toy Dragon:** "I made it for someone small. She had it for one winter. Then the Temple came with fire and chains, and I had to choose between keeping her and keeping her alive."
4. **The Windstair.** A harder ice puzzle, and **Old Mother Yeti** (a mini-boss who is protecting her cubs).
5. **The Summit.** A friend asks straight out: *"Raine is your daughter. Isn't she?"* Miasma says **"...Yes,"** and makes them promise not to tell Raine.

**The boss: Rimeclaw, the Frost Wyrm.** He is old and bitter, and took the peak when Miasma left.
- **Round one can't be won.** Then comes a memory cinematic: the sky, the knight, a baby with a tuft of orange hair.
- *"I am not dragon-BLOODED. I am a DRAGON."* **The Dragon job unlocks** for everyone. Miasma switches to it with the Sky-Sunder Claws.
- **Round two** is a real fight, balanced for **three** party members.
- Miasma then **flies everyone down** as a red dragon.

**The cure.** Raine wakes up: *"I dreamed you were talking to me... I can't remember what."* Miasma: *"It'll keep, kid. One more day."*
- **Reward:** Raine makes a new rule, and **the party leader can now be chosen** (Menu → Leader).
- **Hook:** a notice arrives. Odeaon's trial is in seven days, for treason *and for harboring a DRAGON*. Raine slowly looks at Miasma.

**Then:** the save screen appears ("THE WYRMSPIRE: Chapter Three continues..."), and the story heads for the pass south.

## 2b. Story bible: Chapter Three, part two (the trial)

**The Frostfang Pass** (the Frostreach's south pass, 2 maps).
- **The avalanche:** Miasma finally starts: *"About your mother—"* An avalanche cuts her off. *"...Later."* Raine: *"You keep SAYING later."*
- **Inquisitor Hallorn** and his chain hounds ambush the party, sent by the High Luminar to take "the dragon, alive." Raine: *"What dragon?"* Hallorn: *"You don't know. Oh, that's wonderful."*
- **That night:** Miasma rehearses the truth by the fire twice. When she turns around, Raine is asleep.
- The pass comes out on the **Aurelion** world map, north of Solanthia (a new cave, `M`).

**The Solanthia Undercity** (2 maps). The gates are sealed and covered in wanted posters, so the party sneaks in through the old aqueduct.
- **Stealth:** Dawnguard **sentries patrol**. The **yellow tiles show what each can see.**
- **If spotted**, you fight two sentries. Win, and that sentry is out cold. Run, and you're sent back to the map's start.
- There's a Dawn Lantern to save at.

**The Temple Cells.** Raine finds Odeaon behind bars.
- He sees Miasma: *"...You came." "Idiot." "Always."* Raine: *"...You two KNOW each other?"*
- He refuses to escape: *"Some things only work in the light."*
- Luna gets Dawnguard tabards so the party can watch the trial from the crowd.

**The Grand Tribunal.** "High Luminar Vesper" tries Odeaon for treason and for *harboring a dragon*.
- Raine unmasks herself to defend him.
- **Miasma transforms in front of a thousand people:** *"HERE I AM... That girl is my daughter."*
- Raine: *"A dragon killed my mother. That's what you told me. Every year, on my birthday."* Miasma: *"...In a way, kid. She did."*
- If the friends knew (`ch3told`), Raine realizes they all knew.
- **The fight:** the Luminar plus two Temple Paladins (party of four).
- **The Luminar's face cracks in front of the whole Temple.** "Vesper" has been **Sonia** all along. (In Chapter One only the party saw her unmask.)
- **Sonia steals the Dawnheart, Sylara's reliquary**, from her own altar.
- **Verai's scene depends on her state:**

| Verai's state | What happens |
|---|---|
| With the party | She stands up to Sonia: *"Still not yours."* |
| Went with Sonia, doubting (`veraiDoubt`) | She secretly frees Odeaon's chains (`veraiHelped`) |
| Went with Sonia, cold (`veraiCold`) | She warns Raine off |
| Left and waiting (`veraiWaits`) | She arrives in a smoke screen and **rejoins** (`veraiReturned`) |

- **The escape:** Miasma flies everyone out through the golden window to the Wren.

**The Wren, that night.** Raine's big choice:
- **"You let me think you were DEAD."** (`raineAnger`)
- **Walk away in silence.** (`raineSilent`)
- **"...Why?"** (`raineWhy`, `motherTrust` +1). Miasma explains:
  - The Temple came up the mountain when Raine was eight months old, so she gave her to "the only person who ever brought me a sandwich."
  - The pendant was Ashkar's token, which she'd put on Raine to keep her warm.

After the choice:
- **Odeaon talks to Raine.** Why a dragon, of all things? *"...She thought it was funny."* Raine laughs, then cries.
- **The toy dragon:** if you found it on the Wyrmspire, Miasma leaves it on the rail (*"The tail's been glued." "Twice."*). Raine: *"Goodnight, M— ...Goodnight, Miasma."*
- **Odeaon joins as a playable hero.** His innate command is **Vow**: Shield Wall, Lionheart, Father's Watch, Last Light.
- **The Party menu:** on the world map, *Menu, then Party* swaps members with whoever is waiting aboard the Wren.

**End of Chapter Three:**
- Sonia now holds the Heartseed and the Dawnheart. *"Beneath the Twin Falls, in the sunken sanctuary, something opens its eyes."*
- An end card and a save screen.
- The player is left aboard the Wren on the Aurelion world map. **Chapter Four starts from `ch3done`**: `continueGame()` already calls `chapter4Opening()` when it exists.

### Flags this arc sets (for the next writer)

| Flag | Meaning |
|---|---|
| `ch3start` | Chapter Three began |
| `ch3sick` / `ch3cured` | Raine's Cinderblight |
| `flags.watcher` | Which friend stayed at Raine's bedside |
| `ch3confessed` | Miasma told the sleeping Raine |
| `ch3told` | The climbing friends know Miasma is Raine's mother |
| `ch3helm` / `ch3toy` | Found Odeaon's dented helm / the toy dragon (key items `dentedhelm`, `toydragon`) |
| `ch3yeti`, `ch3rime`, `ch3herb` | Mini-boss, boss, and the Lily |
| `leaderUnlocked` | The Leader menu exists; `S().leader` is the chosen id |
| `ch3part1` | The Wyrmspire arc is done |
| `ch3pass`, `ch3aval`, `ch3inq` | Took the pass, the avalanche, beat the Inquisitor |
| `ch3undercity`, `ch3cells`, `ch3trial` | Entered the Undercity, met Odeaon in his cell, the trial happened |
| `raineAnger` / `raineSilent` / `raineWhy`, `motherTrust` (number) | How Raine took the truth. Use these in Chapter Four. |
| `veraiHelped`, `veraiReturned` | Verai freed Odeaon in secret / Verai rejoined at the trial |
| `ch3toyGiven` | Miasma gave Raine the toy dragon |
| `ch3done` | Chapter Three is complete. Chapter Four starts here. |

**Tone:** keep the rhythm going: joke, gut-punch, joke. Raine still does **not** know the truth, her friends do, and Odeaon's charge ("harboring a dragon") forces it out soon.

---

## 3. New art for this arc

The rules from `CHATGPT_GUIDE.md` sections 3 and 4 still apply: exact filenames; heroes face LEFT; monsters and bosses face RIGHT; run `python3 tools/build_assets.py` after adding images. Anything missing uses a placeholder.

Palette for the Frostreach:
- snow `#eef2f8`
- ice `#b4dcf4`
- shadow blue `#4a5a70`
- pine `#1e4a34`
- Miasma's fire red `#ff5a40`
- warm Hearthmoor wood `#8a5a30`

### 3.1 Highest priority
| File | Size | Notes |
|---|---|---|
| `miasma_dragon.png` + `miasma_dragon_sheet.png` | ~128px tall / 11 frames, facing LEFT | **Key image.** Miasma in her Dragon job: horns glowing, wings fully spread, scaled forearms with long red claws (the Sky-Sunder Claws), fire at the edges. Proud and a little wild. |
| `b_miasmadragon.png` | ~600px wide, facing RIGHT or front | Miasma's **true dragon form**: a big red dragon with a mischievous face, carrying the party on her back. Used in the flight cinematic. It's already wired: the scene uses the image as soon as it exists. |
| `b_rimeclaw.png` | ~340px tall, facing RIGHT | Rimeclaw, the Frost Wyrm: ancient, white-blue, glacier wings, icicle beard, sad blue eyes. Also used on his intro card. Then **delete his two `ph: {...}` entries** (`rimeclaw` and `rimeclawfull`) in `js/data3.js`. |
| `b_yetimother.png` | ~300px tall | Old Mother Yeti: huge, shaggy, grey-white, a patched shawl, three cubs peeking behind her. Delete her `ph` afterwards. |

### 3.2 Dragon job outfits for everyone
`raine_dragon`, `verai_dragon`, `luna_dragon`, `brakka_dragon` (and `_sheet` versions). They show draconic armor: scale plates, a horned helm, clawed gauntlets, and a red-and-black cape. For the others it's armor, **not** real transformation. Only Miasma is a real dragon.

### 3.3 Portraits (128×128), already wired in `NPC_FACES`
- `face_thistlewood`: Dr. Wenna Thistlewood, a brisk halfling woman with spectacles, a fur-trimmed apron, a pencil behind her ear, and kind but tired eyes.
- `face_rimeclaw`: see Rimeclaw above.
- `face_yeti`: Old Mother Yeti.

### 3.4 Field sprites (`field_<look>.png`, 3×4 grid)
- `field_halfling`: the doctor uses this look.
- Also winter versions of the party if you like. This needs a small code change: add looks such as `raine_winter` to `LOOKS` in `js/sprites.js`.

### 3.5 Battle backgrounds (960×440)
- `bg_snowfield`: the open Frostreach, pines, and the Wyrmspire far off
- `bg_icecave`: blue ice caverns with frozen waterfalls
- `bg_summit`: the top of the world, stars above, clouds below, and the lily glowing

### 3.6 Tiles (16×16, drawn at 48×48)
- **Arts:** `snowfield`, `pine`, `icepeak`, `frozenlake`, `spire` (the Wyrmspire on the world map), `icefloor`, `icerock`, `snowpine`, `lily` (2 frames), `frozenfall` (4 frames)
- **Themes:** `frostworld`, `snowtown`, `clinic`, `snowpeak`, `icecave`, `nest`, `wrendeck`
- **Important:** the ice floor must **look slippery and different from snow**, because players need to read the puzzle.

### 3.7 Monsters (optional unique art: set `art:` and delete `tint` in `js/data3.js`)
| id | Name | Prompt idea |
|---|---|---|
| snowwolf | Snow Wolf | White wolf with frost on its muzzle |
| icebat | Icicle Bat | A bat with icicle wings |
| rimewisp | Rime Wisp | A ball of swirling snow with two blue eyes |
| frostgolem | Frost Golem | Packed ice and boulders |
| wyrmling | Ice Wyrmling | A small white dragon, very proud of itself |
| dragonslayer | Frozen Dragonslayer | An armored knight frozen solid, still climbing |
| yeti | Mountain Yeti | Shaggy white yeti holding a snowball the size of a cart |

### 3.8 Cinematic stills (optional, 960×640; add them as `layers: [{ img: 'cine_...' }]` in `js/events3.js`)
- `cine_wren_collapse`: Miasma catching Raine on the Wren's deck at night, the pendant glowing black-red
- `cine_hearthmoor`: the snowy harbor at dawn, the Wyrmspire towering behind
- `cine_nest`: the old nest, the toy dragon in the snow
- `cine_awaken`: Miasma rising in flame on the summit
- `cine_flight`: the red dragon over the Frostreach with the party on her back

---

### 3.9 Chapter Three, part two art
| File | Notes |
|---|---|
| `odeaon.png`, `odeaon_sheet.png`, `odeaon_face.png` | **Odeaon is now playable.** A tall, silver-bearded High Knight in white-and-silver plate and a blue cape, with a kind, tired face, holding Dawnbreaker (a holy longsword). Battle sprite ~128px facing LEFT. Face 128×128. Also `face_odeaon` for when he speaks as an NPC. |
| `odeaon_<job>.png` | Optional job outfits for Odeaon, same list as the other heroes |
| `b_inquisitor.png` | Inquisitor Hallorn: a lean, smug Temple inquisitor in white and gold, carrying a huge dragon-chain. Delete his `ph` in `js/data3.js` afterwards. |
| `b_luminar.png` | "High Luminar Vesper" in battle: golden robes, a halo, a serene and cruel face with a hairline crack of shadow. Delete her `ph` afterwards. |
| `face_hallorn`, `face_dawnguard` | Portraits (128×128) |
| `bg_undercity` | Old aqueduct tunnels under Solanthia: stone arches, dark water, shafts of gold light from grates above |
| `bg_temple` | Already listed in the main guide. The Grand Tribunal uses it for the Luminar fight. |
| `cine_tribunal_dragon` | (960×640) A red dragon filling a golden courtroom, the crowd fleeing, Raine small in the aisle looking up |
| `cine_wren_rail` | (960×640) Raine at the Wren's rail at night; a little red toy dragon sits beside her hand |
| Monsters `m_snowharpy`, `m_chainhound`, `m_sewerrat`, `m_drowned`, `m_lampooze`, `m_sentry`, `m_paladin` | Optional. Set `art:` and delete `tint`. |

## 4. Test it
```bash
node tools/check/validate.js                                        # maps, data, ice-floor solvability
NODE_PATH=$(npm root -g) node tools/check/story3.js 0               # Chapter Three from a Chapter Two save (0/1/2 = who stays with Raine)
NODE_PATH=$(npm root -g) node tools/check/story3b.js stay 2         # the rest of Chapter Three (Verai: stay/doubt/cold/waits; Raine's choice 0/1/2)
```

**In the game:** press **F2 → Jump to story point**, then pick an entry starting with "Ch3:". There's one for each step of the climb.
