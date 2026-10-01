# Chapter Five update: *The Open Sky* (the semi-finale)

This zip is the whole game: Chapters One to Five plus the secrets. The Final Chapter, *The Tenth Seat*, is next, and saves carry over.

If you (ChatGPT) already have an older copy with your art in it, **don't start over.** Merge first (section 1), then make the new art (section 5).

---

## 1. Merge this update into your copy

Run this from inside the NEW folder (this zip, unzipped):

```bash
python3 tools/merge_update.py /path/to/YOUR-older-folder
node tools/check/validate.js          # must end with "ALL OK"
```

- It finds which release your copy came from. There are baselines for **Chapter One**, **Chapter Two**, **Chapter Three part one**, **Chapter Three complete** and **Chapter Four** in `tools/merge/`.
- It keeps your PNGs and re-applies your code edits.
- `MERGE_REPORT.md` lists anything you need to copy over by hand.

**Saves:**
- Finishing Chapter Four now flows straight into Chapter Five.
- Pressing **Continue** on a "Chapter Four Complete" save also starts Chapter Five.
- **The level cap is now 50** (it was 30). Experience earned past 30 was never lost: it pays out on the next battle.
- Never rename a flag, job, item or map id.

### New and changed files

| File | Status | What's in it |
|---|---|---|
| `js/data5.js` | NEW | Three new jobs (**Bloomwarden**, **Timewarden**, **Nightveil**), 30 skills, tier 6 and tier 7 gear, **an ultimate weapon for every hero**, 25 monsters and 13 bosses |
| `js/maps5.js` | NEW | Two new continents (**Thalemyr**, **Zalakir**), 25 new maps, the new places added to Aurelion, Ashkar and the Frostreach, the flying-dragon sprite, 7 music tracks |
| `js/events5.js` | NEW | Every Chapter Five scene, **flying**, and **the Sky Chart** |
| `index.html` | changed | Loads the three new files |
| `js/field.js` | changed | Flying (over anything except the Veilstorm), map overlays for lit braziers and star plates, flying back out of places only a dragon can reach |
| `js/data.js` | changed | Level cap 30 → 50 |
| `js/events4.js` | changed | The Chapter Four ending continues into Chapter Five ("Next: Chapter Five - The Open Sky") |
| `js/main.js` | changed | Continue on a finished Chapter Four save starts Chapter Five |
| `js/debug.js` | changed | Chapter Five jump points |
| `tools/check/validate.js` | changed | Knows places only a dragon can reach (`sky: true`), and checks that Godsfall stays sealed |
| `tools/check/story5.js` | NEW | Plays Chapter Five (4 routes) |
| `tools/merge/ch4_base/` | NEW | The Chapter Four release, for merging |

---

## 2. Story bible: Chapter Five

### The theme: the whole world opens
The sea roads close. A storm the colour of a bruise, the **Veilstorm**, stands over Zalakir and swallows every ship. A wet, angry bird brings a letter from Myndra's Great Library: *"Come BY AIR."*
- Brakka has built three flying machines (*"Two exploded. The third is in a tree."*).
- **One by one, everybody on the Wren turns to look at Miasma.**
- *"...What? Is it the fish? I said I'd share the fish."* ... *"OH. I'm a DRAGON!"*
- Raine: *"You FORGOT you could fly?!"* Miasma: *"I spent twenty years pretending to be a girl with decorative wings! Do you think about your elbows? NO."*
- Odeaon: *"You flew me to the top of the Wyrmspire once."* Miasma: *"That was a DATE, Odeaon, not a FERRY SERVICE."*
- She stops pretending: red wings as wide as the Wren's sails. **She is the airship.**
- **The Sky Chart** unrolls: the whole of Cael'Brithar, all five lands, and the Veilstorm turning over **Godsfall Crater**. *"Not yet."*

### Flying
- On any world map, **Z takes off** and **Z lands**. Land on open ground, or **fly over a town or dungeon and press Z to go in**.
- Fly over mountains, rivers, lava, reefs and the sea. **No random battles in the air.**
- Fly off the edge of a map (or press Z over open sea) to open **the Sky Chart** and cross to another land.
- The chart marks places only a dragon can reach with a blinking **blue ?** until you've visited them.
- **The Veilstorm** (`w` tiles) throws Miasma back. Nothing gets through except, at the end, the party with all three keys.
- The Wren stays wherever you left it.

### Every god has a job now
| God | Job | Where |
|---|---|---|
| Sylara | Dawnsinger | Chapter One |
| Thalara | Tidecaller | Chapter One |
| Valerion | Oathblade | Chapter One |
| Myndra | Arcanist | Chapter One |
| Malakar | Masquer | Chapter One |
| Grimnar | Ash Reaper | Chapter One |
| Zariel | Chainbearer | Chapter Two |
| Ashkar | Phoenix Warlock | Chapter Two |
| **Elaris** | **Bloomwarden** (thorns, regen, sleep, Heartsong, Embrace) | Heartbloom Hollow: plant Elaris's Last Seed |
| **Kryos** | **Timewarden** (ice, Haste, Stop, Doom, End of Hours) | The Stilled Hourglass, in the Frostreach's frozen lake |
| **Nyxia** (the erased goddess) | **Nightveil** (dark strikes, counter, blind, drain, The Veiled Night) | Ebonport's chapel |

### The main road: three keys to the Veilstorm
1. **Astrilion, Myndra's Great Library (Thalemyr).** Pages are going blank.
   - **The Orrery of Seven Stars**: step on the star plates in the order Myndra drew her star: begin at the top (the Eye), then always skip two, clockwise. Wrong steps reset.
   - **Boss: The Unwritten**, a tall white thing that eats the ink out of holy books. Sonia pays it by the shelf.
   - **Myndra** (half-erased, a tired eye in a seven-pointed star) explains: Sonia is going to **Godsfall**, where faith belongs to nobody, to pull the faithful of the Ten into herself: **not the Tenth god, the ONLY god**. The storm is made of **Nyxia's stolen night**. *"Only Nyxia's night can open Nyxia's night."*
   - If Verai is with you, Myndra sees it: **Verai's smoke is the last piece of Nyxia.**
   - Gives **Myndra's Star Chart**.
2. **Ebonport, the City of Masks (Thalemyr).** Malakar's city: everyone lies, beautifully.
   - Masks from **Quill**: pay 6000 gold, **or tell her a lie good enough to make her cry**. Miasma: *"I've never once been in love."* Luna: *"I am a completely ordinary human knight with normal ears."* (Her ears are standing up. Her tail is wagging.)
   - **The Under-streets:** sneak past the Mask Wardens (they see in a line, like the Undercity sentries).
   - **The Chapel of the Veiled Night:** the **Masked Regent** is boxing up the Unlit's black lanterns, Nyxia's last prayers, to sell to Sonia. **Boss: The Masked Regent.**
   - **Then Verai** (see below). Either way you get **Nyxia's Lantern** and the **Nightveil** job.
3. **The Ashen Crown (Ashkar).** A volcanic islet behind a reef, north-west of Ashkar, seen on the map since Chapter Two. **It is a different dungeon on each route** (see below). You get the **Living Flame** or **the Crown's Ember**.

With all three keys, fly to the **storm landing** in Zalakir (east of Rimward). The Star Chart shows the knot, Nyxia's Lantern parts the dark, and the flame keeps the lightning off.

### Verai: what Chapter Four decided
**If Verai stayed** (`veraiGone4` not set): in the chapel, the darkness gathers around her. *"Little one. You kept me. I could be again, through you."* Raine says:
- *"You're Verai. Whatever's in you is yours."* (goodwill +1)
- *"If being Nyxia stops Sonia... maybe you should."* (goodwill −2)
- *"What do YOU want, Verai?"* (goodwill +2; *"Nobody's ever asked me that before. Not like they wanted the answer."*)

If the second answer drops her goodwill under 4, she opens her arms and the whole night pours into her. Her eyes go dark all the way through (`veraiNyxia = 'vessel'`). Otherwise: ***"I'll carry her. I won't BE her. I'm Verai. I chose that name."*** (`veraiNyxia = 'carry'`). Either way she learns **Nyx's Heart**.

**If Verai left** in Chapter Four, she is in the chapel **with the Regent, pulling the night out of the lanterns for her mother.** Her chance of coming home = her goodwill + the Chapter Four reach (+2 for *"I'm sorry. We should have asked what you wanted."*, +1 for *"Come home"*) + what Raine says now:
- *"Come home, Verai."* (+0)
- *"You don't have to come back. Just don't let her use you."* (+2: *"That's the first time anybody's told me I don't HAVE to do something."*)
- *"I'm not leaving without you. Even if you won't come."* (+1)

At 4 or more, **she turns on the Regent** (*"My mother lied to them too. PUT THEM DOWN."* Miasma: *"Ohhh, she's got the MOM voice."*) and **rejoins the party** (`veraiBack`). Under 4, you fight **Verai, the Veiled Herald**. Her smoke stops an inch from Raine's face and won't go further. *"I can't. Why can't I."* She leaves with her mother, and on purpose she leaves one lantern behind (`veraiLost5`).

### Ashkar: what Chapters Two and Four decided
| | **Ashkar's ALLY** | **Ashkar's RIVAL** |
|---|---|---|
| **The Ashen Crown** | **The Phoenix Cradle.** Light four braziers with the Phoenix Ember to cool the lava stair. **Boss: The Gutter Queen**, an ash-eater feasting on a dying god. | **The Unseated Forge.** Sonia's people are hammering Grimnar's Anvil into a crown. Open three quench-valves (Brakka knows them). **Boss: The Anvil-Crowned**, wearing the half-made crown, and it burns. |
| **The choice** | Ashkar is curled up in the ash, small as a sparrow. Raine's pendant is a coal from his hearth. **Give it back** (`ashkarRisen`: a column of fire, *"You gave a god his heart back"*; Raine learns **Ember Heart**) or **keep it** (`ashkarDim`: *"It's the only thing I have that she gave me"*; he burns small; Raine learns **Crescent Flare**). Both give the **Phoenix Crescent**. | Ashkar crashes through the roof: *"Do I get it back this time, or do we fight about it?"* **Give him the Anvil** (`ashkarMended`: a god apologizes; **Kindled Edge** + Crescent Flare; *"Call me. I'll be there. Loudly."*) or **keep it** (`anvilKept`: *"Don't call me when the sky falls on you"*; Brakka forges **Grimnar's Edge**; Raine learns **Anvil Strike**). |
| **Key** | The Living Flame | The Crown's Ember |

### Places you could see but never reach (flight only)
All of these are on maps from earlier chapters: ringed by mountains, behind reefs, inside lava, or out on a frozen lake.

| Place | Map | What happens |
|---|---|---|
| **Heartbloom Hollow** | Aurelion, the mountain ring south of the Goldengrove road | Sonia's rot has grown roots. **Boss: The Blight Graft.** Plant **Elaris's Last Seed** and choose what you whisper to it: a home for anyone who hides, a garden for everyone, or *"Come back, Elaris"* (`seedVow`). **Bloomwarden** job, Heartwood Staff, Embrace Charm |
| **A Dragon's Hoard** | Aurelion, the islet behind the reef in the far north-east | Miasma's lair from before Raine. A gilded squatter, **Goldscale** (*"The red one isn't coming back!"* / *"The red one CAME BACK."*). 30,000 gold, **Old Sky Talons** (Miasma's ultimate), Dragonscale Mail, and **Raine's baby blanket**, kept for twenty years. Miasma learns **Old Sky Roar** |
| **The Stilled Hourglass** | The Frostreach, inside the frozen lake | Two **ice-slide floors** (13 moves each, checked: always solvable). **Boss: The Hourwarden.** **Kryos, the Pale Watcher** shows Odeaon the night he took baby Raine down the mountain, and asks Raine: *"Do you want to know how this ends?"* (`kryosGlimpse`: *"I see a seat. I see someone you love sitting in it. I do not see who stands up again."*). **Timewarden** job, **Winter Oath** (Odeaon's ultimate), Odeaon learns **Winter Ward** |
| **Old Gruntle's Powder Vault** | Ashkar, ringed by lava in the south-east | Brakka's master's vault. **Boss: Vault Colossus** (painted inside: "BRAKKA - DON'T TOUCH"). Gruntle's letter. **Thunderwife** (Brakka's ultimate), Brakka learns **Thunderclap** |
| **Moonfang Barrows** | Zalakir, the Skyreach jungle | Moonfangs came from these wilds. **Boss: The First Moonfang**: *"You wore a helmet for eight years, cub. Show me you can stand without it."* `lunaTrust` and the Accord change her lines. **Eclipse Fang** (Luna's ultimate), Moonmother's Mantle, Luna learns **First Moon** |
| **Starfall Isle** | Thalemyr, behind a reef | Where Myndra fell as a star. A note scratched by Sonia: *"Nights can be borrowed."* |
| **Skyreach Mesa** | Zalakir, ringed by a chasm | Miasma's cousin Vesk's old nest. Skyscale Claws |
| **The Rift of Echoes** | Zalakir, inside the southern chasm | Voices from the day Ashkar stole the spark: Nyxia letting go (*"let my night go to someone who will be kind with it"*), and a young Sonia: *"I was PROMISED."* |

**Every hero now has an ultimate weapon:** Raine (Phoenix Crescent / Grimnar's Edge / Kindled Edge, depending on the route), Miasma (Old Sky Talons), Verai (Nyxian Rod, Ebonport), Luna (Eclipse Fang), Brakka (Thunderwife), Odeaon (Winter Oath).

### Rimward, and what Chapter Four's other choices changed
- **Rimward** is a pilgrim camp at the edge of the Unclaimed Wilds, with tier 7 gear.
- If you **spared Hallorn**, he is here: he went home and told Solanthia. **The new council signed the Two Moons Accord.**
- If **Moonhollow kept him**, a moonfang scout brings news: he chops wood, and he carved Pip a terrible wooden wolf.

### The Rim of Godsfall (finale)
- **The Storm Road**, then **the Eye**: **Boss: The Storm Herald** (*"She is almost a god of everything. You are almost too late. Almost."*).
- **Sonia** (a battle you can't win; you survive 6 of her turns). *"You can't stop the sky from falling. You can only choose who it lands on."*
- She throws the Dawnheart and the Heartseed at Raine, and **someone takes the blow**:
  - **If Ashkar is on your side** (ally route, either pendant choice; or rival route and you gave back the Anvil): **Ashkar** hits the light head-on. *"I took your seat. I'm sorry. That's why I'm going to give it back."* He falls into the crater, burning, so **the Tenth Seat is empty when she gets there** (`ashkarFell`).
  - **Otherwise** (rival route, you kept the Anvil): **Odeaon** steps in front of it. *"Not her. You don't get her."* The light carries him over the Rim into the storm. His shield stops at Raine's feet (`odeaonFell`; his character data is kept in `S().away.odeaon`).
- If Verai is lost, she is beside her mother, with her hand half raised toward Raine. *"Yes, Mother."*
- *"When I come out of that crater, there won't be ten gods. There'll be one."*
- Rimward by the fire, the crawl, **END OF CHAPTER FIVE**. *Next: The Final Chapter, The Tenth Seat.*
- After the save you keep flying. Godsfall stays sealed until the Final Chapter.

### Flags for the next writer
`ch5start`, `skyWings`, `ch5star`, `ch5orrery` (+ `orreryLit`), `ch5unwritten`, `ch5veil`, `ch5regent`, `veraiNyxia` (`'carry'` / `'vessel'`), `chapelChoice`, `veraiBack` (+ `veraiBackWhen`), `veraiLost5`, `veraiScore5`, `ch5braziers`, `ch5gutter`, `ch5valves`, `ch5crowned`, `ch5flame`, `ashkarRisen` / `ashkarDim` / `pendantGiven`, `ashkarMended` / `anvilKept`, `ch5graft`, `ch5seed` + `seedVow` (`'refuge'` / `'garden'` / `'elaris'`), `ch5hour`, `kryosGlimpse`, `ch5barrows`, `ch5hoard`, `ch5vault`, `ch5hallorn` / `ch5scout`, `ch5rimOpen`, `ch5rim`, `ch5herald`, **`ashkarFell`** / **`odeaonFell`** (+ `S().away.odeaon`), `ch5done`. `S().seen[mapId]` records every place you've entered.

Key items: `skywings`, `masks`, `starchart`, `nightlantern`, `livingflame` / `crownember`, `anvilshard2` (rival route, if kept).

Hooks for the Final Chapter:
- **Who takes the empty seat?** The Tenth Seat may be truly empty.
- **Verai** may carry Nyxia's night, be its vessel, or be on the throne's steps beside Sonia.
- **Elaris's seed** is growing, with a vow.
- **Odeaon** may be somewhere inside the storm.
- **Kryos** may have shown Raine the end.

---

## 3. New mechanics
- **Flying:** `S().flying`. `flightOk()` is called when you press Z on a world map. `landHere()` either enters a place, lands on open ground, or offers the Sky Chart. World tiles with `noFly: true` (the Veilstorm) block Miasma too.
- **The Sky Chart** (`SkyChartScene`) draws every world map from its own tiles (one pixel block per tile, coloured by the tile art). Each world map has a `skyIn: [x, y]` where you arrive.
- **Places only a dragon can reach:** world places with `sky: true`. Interior maps with `skyBack: true` (or whose way out lands on a solid tile) put you back in the air when you leave.
- **Map overlays:** `map.overlay(cx, cy)` draws over the tiles (lit braziers, star plates).
- **New world tiles:** `x` reef, `w` Veilstorm, `u` jungle, `v` savanna, `z` chasm, and place tiles `I O F J R c q Y b e`. **New interior tiles:** `(` bookshelf, `)` star plate, `/` star gate, `;` black lantern, `:` storm floor, `?` gold pile, `` ` `` brazier, `'` root wall, `-` blight, `n` vine, `V` clock face, `C` powder keg.

---

## 4. Balance
- Enemies are tuned for a party of about level 40 to 45 in Sephara or Rimward gear (`tools/check/sim.js`-style runs). Regular fights leave the party at about 85% HP. The main bosses take about 2 minutes and leave the party at 30 to 60%.
- `HP5` in `js/data5.js` scales every Chapter Five monster's HP at once. Raise it to make the chapter harder.
- The Storm Herald is meant to be the hardest fight in the game so far.

---

## 5. New art for Chapter Five

The rules from `CHATGPT_GUIDE.md` sections 3 and 4 apply.

| File | Priority | Notes |
|---|---|---|
| `miasma_dragon.png` + `field_skydragon.png` | **Highest** | **Miasma's true form:** a red dragon with charred-bone horns, bone-and-metal wings, gold eyes, green-patterned belly scales, a braided red rope still around her neck. `field_skydragon.png` is the top-down flying sprite (2 frames: wings up, wings down, facing up; the game rotates it). The flying sprite is drawn in `drawSkyDragon` in `js/maps5.js`; swap in the PNG there. |
| `cine_skychart.png` (960×640) | **Highest** | An illustrated world map of Cael'Brithar in the same layout as the in-game Sky Chart (Thalemyr west, the Frostreach north, Aurelion east, Ashkar south-west, Zalakir south-east with a violet storm over the crater). |
| `b_unwritten`, `b_maskedregent`, `b_gutterqueen`, `b_anvilcrowned`, `b_stormherald` | High | The Unwritten: tall, white, faceless, made of blank pages, with ink-stained fingers. The Regent: a gilded half-mask (one half smiling, one half burning) and a velvet coat. The Gutter Queen: a huge ash-wraith with a mouth full of embers. The Anvil-Crowned: an ogre-sized smith inside a half-forged black iron crown that is burning him. The Storm Herald: violet armor full of screaming prayers and lightning. Delete each one's `ph` in `js/data5.js` afterwards. |
| `b_firstmoonfang`, `b_hourwarden`, `b_blightgraft`, `b_goldscale`, `b_vaultcolossus` | High | The First Moonfang: an enormous silver ancestor-wolf, ghostly blue at the edges. The Hourwarden: a skeleton knight of ice holding a clock hand as a sword. The Blight Graft: a purple root-spider swollen with rot. Goldscale: a gilded lizard covered in coins. The Vault Colossus: a riveted iron golem with cannons for arms and "BRAKKA - DON'T TOUCH" painted inside one plate. |
| `face_myndra`, `face_kryos`, `face_quill`, `face_regent`, `face_gruntle` | Medium | Myndra: an open eye inside a seven-pointed star, half-erased. Kryos: a pale, frost-bearded face with hourglass pupils. Quill: a cheerful masked mask-seller. Gruntle: an old soot-black goblin gunsmith. |
| `bg_tidecliff`, `bg_jungle`, `bg_savanna`, `bg_stormplain`, `bg_masks`, `bg_chapel`, `bg_barrow` | Medium | Battle backdrops (960×440): Thalemyr's sea cliffs, the Skyreach jungle, the Zalakir savanna, the storm rim, Ebonport at night, the Chapel of the Veiled Night, the Moonfang Barrows. |
| World tiles: `reef`, `veilstorm` (4 frames), `jungle`, `savanna`, `chasm`, `library`, `maskcity`, `skyruin`, `barrow`, `stormgate`, `camp`, `crater`, `hourglassshrine`, `bloomgrove`, `powdervault` | Medium | 16×16. The Veilstorm must look impassable. |
| Interior tiles: `bookshelf`, `starplate`, `stargate`, `lanternless`, `stormfloor`, `goldpile`, `brazier`, `brazierlit`, `rootwall`, `blight`, `seedbed`, `sapling`, `clockface`, `vine`, `powderkeg` | Medium | Themes: `sephara`, `library`, `orrery`, `masks`, `chapel`, `camp`, `jungle`, `barrow`, `storm`, `bloomgrove`, `hourglass`, `hoard`. |
| `cine_miasmaflies` (960×640) | Nice to have | Six people on the back of a red dragon, the Wren far below, the whole world opening under them. |
| `cine_ashkarfalls` / `cine_odeaonfalls` (960×640) | Nice to have | A phoenix falling into a storm-filled crater like a star going the wrong way / a knight's shield spinning on the edge of the crater. |
| Monsters | Optional | `m_reefcrab`, `m_stormgull`, `m_tideserpent`, `m_inkwraith`, `m_grimoireimp`, `m_orreryguard`, `m_maskdancer`, `m_maskwarden`, `m_skyraptor`, `m_thornback`, `m_junglewidow`, `m_dustlion`, `m_riftecho`, `m_stormspawn`, `m_unseatedknight`, `m_gutterwraith`, `m_cinderling`, `m_unseatedsmith`, `m_slaggolem`, `m_blightroot`, `m_rotbloom`, `m_lostminute`, `m_rimesentinel`, `m_barrowwolf`, `m_gilttoad`. Set `art:` and delete `tint`. |

---

## 6. Test it
```bash
node tools/check/validate.js
NODE_PATH=$(npm root -g) node tools/check/story5.js allyCarry    # ally, Verai carries Nyxia, pendant given back: Ashkar falls
NODE_PATH=$(npm root -g) node tools/check/story5.js allyVessel   # ally, Verai becomes Nyxia's vessel, pendant kept
NODE_PATH=$(npm root -g) node tools/check/story5.js rivalBack    # rival, Verai comes home, Anvil kept: Odeaon falls
NODE_PATH=$(npm root -g) node tools/check/story5.js rivalLost    # rival, Verai stays lost, Anvil given back: Ashkar falls
```
In the game: **F2, then Jump to story point**. There are "Ch5:" entries for the start of the chapter on both routes, flying over Aurelion and Thalemyr, the Ebonport chapel, the Ashen Crown, and the Rim.
