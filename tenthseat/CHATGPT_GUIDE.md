# The Tenth Seat: Handoff Guide for ChatGPT

This guide is for **ChatGPT (or any AI with image generation)** to take over art, animation and polish on *The Tenth Seat*, a browser JRPG. The code is finished and playable from start to the end of Chapter One. Most visuals are placeholders drawn in code or reused sprites, and your job is to replace them with real art.

Upload the whole `tenthseat/` folder (or the repo zip) together with this guide. Read sections 1 to 4 before you generate anything.

---

## 0. Ground rules

1. **Don't rename files, functions or data keys.** Art is found by filename. Story, maps and saves are found by id.
2. **Add art as PNG files in `tenthseat/assets/`, then embed them** (section 3.2). The game never loads loose files; everything goes through `js/assets.js`.
3. **The code already has an override slot for almost every kind of art** (section 3.3). Drop in a correctly named PNG and it appears without any code changes. Change code only when this guide says so.
4. **This must never look like Final Fantasy.** It is inspired by Final Fantasy IV's pacing, structure and humor, but no one should be able to tell. Never use FF names, logos, fonts, character designs, crystals, chocobos, moogles, airships named after FF ones, or FF music. The world is the user's own: **Cael'Brithar** and the **Ascendant Ten**.
5. **After any code change, run the checks** in section 8. All three must pass.
6. **Keep the tone:** earnest story, quick FF4-style scenes, and a joke every few lines, usually from Miasma.

---

## 1. What the game is

| | |
|---|---|
| **Title** | The Tenth Seat, Chapter One: *The Unseated* |
| **Genre** | 16-bit style JRPG in HTML5 canvas. 960×640, no build step, runs from `index.html` |
| **Inspiration** | FF4's pacing and structure: an opening on a vehicle at night, a crisis of conscience before your commander, being demoted onto a suspicious errand, a guardian boss, a village destroyed by the errand itself, and a new ally born from the tragedy |
| **Battle** | Active Time Battle. Each fighter has a TIME gauge; a full gauge means it's their turn. The **Wait** or **Active** setting is in Config |
| **Jobs** | 8 jobs, one per patron god. Change any hero's job **at any time** from the field menu. Jobs have ranks (JP from battles) that unlock skills. Each hero also keeps an **innate command** in every job |
| **Party** | Raine Cudlar, Miasma, Verai, Luna (joins at Goldengrove) |
| **Length** | About 1.5 to 3 hours for Chapter One |

### Controls
Arrows or WASD move · Z / Space / Enter confirm · X cancel / menu · Esc menu · Shift run · touch D-pad on phones.

---

## 2. Story bible

### 2.1 The world: Cael'Brithar

*Source: the user's world doc "world of Cael'Brithar" and pantheon doc "Awesome".*

- A small planet with **four continents** and shallow seas: **Ashkar** (Dominion of Flame and Ash), **Aurelion** (Bastion of Light), **Thalemyr** (Tides of Knowledge), and **Zalakir** (the Unclaimed Wilds).
- **The Ascendant Ten.** Only the ten most-worshipped gods exist at once. Lose your faithful and you fade. New gods can rise and take an empty seat.
- **The pantheon today:**

| God | Title | Domains | Symbol |
|---|---|---|---|
| Sylara | The Radiant Dawn | Light, Life, Sun | Golden sunburst |
| Thalara | Mistress of Tides | Sea, Nature, Tempest | Cresting wave with a serpent |
| Valerion | The Iron Champion | War, Honor, Protection | Silver sword and shield with a flame |
| Myndra | The Arcane Sage | Knowledge, Magic, Fate | Open eye in a seven-pointed star |
| Grimnar | The Ash-Father / Lord of the Final Gate | Death, Forge, Destruction | Anvil cracked by a black axe |
| Elaris | The Serene Bloom / Heartkeeper | Nature, Peace, Love | Blooming lotus wrapped in vines |
| Malakar | The Betrayer Flame | Trickery, Fire, Chaos | Split mask, half smiling, half burning |
| Kryos | The Pale Watcher | Winter, Grave, Time | Hourglass frozen in ice |
| Zariel | The Bound Inferno | War, Vengeance, Order | Burning chain around a blade |
| **Ashkar** | **The Tenth Flame** | Fire, Rebirth, Ambition, Ascension | Crimson-gold phoenix rising from a black crescent moon |

- **Backstory.** Ashkar, once a small phoenix patron, stole the divine spark that **Sonia** was about to claim for the Tenth Seat. That erased **Nyxia, the Veiled Night**, and made Ashkar a god. The game's villain is **Sonia, the Unseated**, who wants a seat back.
- **Technology.** Magic coexists with early blackpowder, from Kharak Yr in Ashkar.

### 2.2 Chapter One's setting: Aurelion
- **Solanthia**, City of Dawn: white limestone, gold roofs, the Grand Temple with the Great Lens.
- **Silverleaf Wood**: pale birches.
- **Goldengrove**: halfling farmland.
- **Brightwater**: a port on the Harmony Sea, with the Tower of Dawn lighthouse.
- **Elaris's Embrace**: twin waterfalls meeting like two arms.

### 2.3 Main characters

| Hero | Look (character sheets: `tools/source/hero_<name>_sheet.webp`) | Personality | Innate command |
|---|---|---|---|
| **Raine Cudlar** | Wild spiky orange hair, green eyes, long black ragged coat, white tee, ripped blue jeans, heavy black boots, gold crescent-moon pendant | Serious, stubborn, loyal to a fault; learning to ask "why". Daughter of High Knight Odeaon. Grew up in Hollowmere | **Brew** (alchemy) |
| **Miasma** | Long fiery red hair, amber eyes, charred-bone dragon horns, big bone-and-metal dragon wings, patterned green dress, red braided rope belt, long black gloves, brown boots, black-purple "miasma" wisps | Dragon-blooded freelancer; greedy, blunt, secretly soft; the comic relief. **Secretly Raine's mother** | **Breath** |
| **Verai** | Huge wavy dark hair with perpetual smoke wisps, warm brown skin, brown eyes, green pinafore over a brown long-sleeve dress, grey scarf, brown boots | Gentle and kind, with steel underneath. A foundling Hollowmere feared for her shadows; Raine was her only friend. **Secretly Sonia's daughter** | **Smoke** (Nyxia's night, inside her) |
| **Luna** ("Dame Luna") | Silver Dawnguard armor, full helm with a crescent crest, blue cape, broadsword. True form: a **moonfang**, with silver fur, tall silver ears, gold eyes and black claws | Polite, brave, eats a lot of meat, and is terrible at lying. **Secretly a monster**, trying to prove monsters can be good | **Moon** (her hidden instincts; using it risks exposure) |

**Secrets.** The player learns these through private scenes before the party does. Keep them consistent.

- **Miasma is Raine's mother.**
  - Raine's father, **High Knight Odeaon**, told Raine "a dragon killed your mother". That's technically true: he hid the half-dragon baby from the Temple's pyres.
  - Miasma watched Raine grow up from the edge of the Silverleaf. She got herself hired as a Warden contractor to stay close.
  - Raine does NOT know yet.
  - Hints so far:
    - Miasma refuses to enter the temple while Odeaon is there.
    - Her night confrontation with Odeaon, ending "Goodnight, little ember."
    - Elder Moth recognizes her.
    - She snaps "Don't you EVER step in front of dragonfire" after the Chimera fight.
    - Her campfire line: "I had a daughter... Every day, kid."
    - Her near-slip: "I'm not the only one keeping a—".
- **Verai is Sonia's daughter.**
  - Sonia left her in the Silverleaf mist 17 years ago, and Elder Moth found her.
  - Nyxia's night passed from Sonia into Verai; that's her smoke.
  - It is revealed at the Twin Falls. The party then makes a **decision** (see 2.4).
- **Luna is a monster.**
  - The player can "catch" her four times:
    1. The Goldengrove night ears.
    2. The first time she uses a Moon skill in battle (automatic).
    3. Her cracked helmet in the Tower of Dawn.
    4. Her furry hand at the Elaris's Embrace lantern.
  - Catching her 2 or more times leads to a reveal scene at the end of Chapter One. Otherwise she stays hidden, and only the player sees her true form.

**Supporting cast:**
- **High Knight Odeaon**: Raine's father. Stern, silver-haired, bearded, silver armor, blue cape. He loves Raine but hides everything.
- **High Luminar Vesper**: grey-skinned elf, white hair, gold sun halo, white and gold robes. Secretly Sonia.
- **Sonia, the Unseated**: see `tools/source/boss_sonia.webp`. Sylara's halo plus Nyxia's stolen shadows, and a shadow-clawed arm. Verai's mother.
- **Warden Tamsin**: Raine's lieutenant.
- **Elder Moth**, who found baby Verai, and **Oracle Sef**: Hollowmere villagers.
- **Bridgewarden Pip**: halfling.
- **Harbormaster Grell**: half-orc sailor.

### 2.4 Chapter One beats
0. **Trailer** (before the title screen; also "Watch Trailer" on the title menu). **Opening crawl**, then a **river cinematic** of the barge at night.
1. **The Gilded Wake.** An acted scene with the Veil Lantern. Miasma calls Raine "kid". River Lurkers attack (battle tutorial).
2. **Solanthia.**
   - Dame Luna cameo: she sniffs Miasma.
   - At the temple door, Miasma spots Odeaon and refuses to go in.
   - The audience: Raine meets her father; Vesper demotes her and hands over the **Dawn Censer**. Odeaon: "Be careful with that one."
3. **Night.**
   - Raine tells Miasma her mother was "killed by a dragon", and talks about Verai.
   - Miasma and Odeaon's secret confrontation in the street.
   - The Sonia "???" card: "a little shadow I left behind".
4. **Silverleaf Wood.** Boss: **the Veilstag**.
5. **Hollowmere.**
   - Verai reunion. **Choice** (bond).
   - A cinematic of the censer opening.
   - The **Sunscarred Votary** burns the village; Verai joins for the fight.
   - Villagers blame Verai. **Choice** (bond).
   - Elder Moth recognizes Miasma, and tells Verai she was found in the mist.
   - Ash Reaper unlocks.
6. **Goldengrove.**
   - Dame Luna arrives "to arrest" Raine and joins instead.
   - Night: a **choice** with Verai (bond), and a Luna catch moment.
   - Pip lowers the Aurora Bridge.
7. **Brightwater.** Harbormaster Grell. Tidecaller unlocks.
8. **Tower of Dawn.**
   - Boss: **Sunforged Chimera**.
   - Miasma's protective outburst; Wyrmblood unlocks.
   - Luna catch moment.
   - Reward: the **Wren** (boat).
9. **Camp talks at Dawn Lanterns** ("Talk with the party"): Miasma's "I had a daughter", and Luna's claws on the Embrace.
10. **Elaris's Embrace.**
    - Boss: **Bloomheart Colossus**.
    - Vesper is revealed as **Sonia** (cinematic), and says Verai is her daughter (flashback cinematic).
    - A scripted 5-turn fight.
    - **The decision:** Raine chooses "stays with us" (+2), "your choice" (+1) or "go with her" (-2). The total with the bond points decides the outcome:
      - 3 or more: Verai **stays**.
      - 1 to 2: she **leaves alone**.
      - 0 or less: she **goes with Sonia**.
    - Luna's resolution.
11. **Chapter ending** (`chapterEnd()` / `endingShots()` in `js/events.js`):
    - One of three ending cinematics (stay / leave / Sonia).
    - The Ten-seats shot and the phoenix eye.
    - A short crawl.
    - An **END OF CHAPTER ONE** card.
    - A **Chapter Complete save screen** with Save or Continue without saving. It shows the party and the choices made.
    - Good art targets here: `cine_ending_stay`, `cine_ending_leave`, `cine_ending_sonia` (960×640).

### 2.5 Tone rules
- Short lines, one or two sentences per text box. FF4 moves fast.
- Every serious scene gets one lightly placed joke, then goes back to being serious. Don't undercut the big emotional beats: the burned village and Sonia's reveal.
- Use plain words. Nobody says "indeed" or "verily".

---

## 3. Art pipeline

### 3.1 How art gets into the game
```
tenthseat/assets/*.png  --(python3 tools/build_assets.py)-->  js/assets.js  --> IMG[<filename without .png>]
```
- Each PNG becomes `IMG['name']`. For example, `assets/raine_oathblade.png` becomes `IMG.raine_oathblade`.
- The code looks up the key; if the image exists it is used, otherwise the code falls back to a procedural or placeholder version. **So adding art never breaks the game.**
- Keep total assets under about 12 MB. Use PNG-8 or PNG-32 with transparency.

### 3.2 Adding a PNG
```bash
pip install pillow numpy
# 1. If your image is a painting, pixelate it into the house style:
python3 tools/pixelate.py my_painting.png assets/raine_oathblade.png --height 128 --flip
# 2. Embed all PNGs into js/assets.js:
python3 tools/build_assets.py
# 3. Open index.html in a browser.
```
`tools/pixelate.py` removes a flat white, grey or checkerboard background, crops, scales, quantizes the palette and adds the 1px outline. It's the same look as the bosses. Use `--raw` for backgrounds (resize only).

If you can't run Python, output the final PNGs at the exact sizes in section 4 and ask the user to run `build_assets.py`. It's one command.

### 3.3 Drop-in art hooks (no code changes needed)

| What | Filename pattern | Format | Where it's used |
|---|---|---|---|
| Hero battle still, per job | `<hero>_<job>.png` (e.g. `verai_arcanist.png`) | Transparent, about 128px tall, **facing LEFT** | Battle, Status screen |
| Hero battle **animation sheet**, per job | `<hero>_<job>_sheet.png` | **One row of 11 equal frames** (see 3.4) | Battle; beats the still |
| Hero battle sheet, any job | `<hero>_sheet.png` | Same | Fallback for jobs without their own sheet |
| Hero base still | `raine.png`, `miasma.png`, `verai.png` | Already exist | Last fallback, title screen |
| Hero portrait | `raine_face.png` etc. | Square, **128×128** recommended (drawn at 128) | Dialog boxes, menus |
| NPC portrait | `face_vesper`, `face_sonia`, `face_votary`, `face_tamsin`, `face_grell`, `face_moth`, `face_sef` | 128×128 | Dialog (mapping in `NPC_FACES`, `js/ui.js`) |
| Field walking sprite | `field_<look>.png` (e.g. `field_raine.png`, `field_vesper.png`) | **3 columns × 4 rows**: columns = stand, step A, step B; rows = down, up, left, right. Any cell size, drawn at 54×72 | Towns and world map |
| Regular monster | `m_<art>.png` | Transparent, facing **RIGHT**, 80 to 220px | Battle (see 4.5 for keys) |
| Boss | `b_<art>.png` | Transparent, facing **RIGHT**, 300 to 340px tall | Battle and field |
| Boss / monster idle frame 2 | `b_<art>_2.png` / `m_<art>_2.png` | Same size as frame 1 | Alternates every half second |
| Battle background | `bg_<name>.png` | **960×440** | Battle (names in 4.6) |
| Map tile | `tile_<art>.png` or `tile_<art>_<theme>.png` | 16px tall strip of 16×16 frames. Animated tiles use frame N; others use variant N | All maps (names in 4.7) |
| Title screen | `title_bg.png` | 960×640 | Title |

### 3.4 Hero battle sheet frame order
`HERO_POSES` in `js/battle.js` gives 11 frames, left to right:

| # | Pose | When it's shown |
|---|---|---|
| 0 | `idle1` | Standing (breathing A) |
| 1 | `idle2` | Standing (breathing B) |
| 2 | `ready` | TIME gauge full, waiting for a command |
| 3 | `attack1` | Wind-up / step forward |
| 4 | `attack2` | Strike (weapon extended) |
| 5 | `cast1` | Raising hands / weapon |
| 6 | `cast2` | Release (glow) |
| 7 | `hurt` | Just took damage |
| 8 | `kneel` | HP under 25%, or asleep |
| 9 | `dead` | KO (lying down) |
| 10 | `victory` | Win pose (alternates with idle1) |

All frames must be the same size (for example 11 × 128px wide by 128px tall), feet on the same baseline, **facing LEFT**.

---

## 4. Asset checklist, with prompts

### 4.0 Style bible
- **Look:** crisp 16-bit-era JRPG pixel art with painterly boss sprites. The house style comes from `tools/pixelate.py`: 32 to 48 colors per sprite and a 1px outline in `#141016`.
- **Palette anchors:**
  - Solanthia and the Light: warm white `#f0e8d8`, gold `#e0b030`
  - Nyxia and smoke: violet `#7030c0`, teal crack `#40e0d0`
  - Grimnar and ash: `#3a302a`, ember `#ff9030`
  - Thalara: sea `#3a78c8`
  - Elaris: bloom purple `#c060ff`, pink `#ff80d0`
- **UI:** blue gradient windows with a white border, like classic JRPGs. You can make it fancier, but keep it readable.
- **Prompt suffix to add to every image prompt:**
  > "16-bit JRPG pixel art sprite, clean 1px dark outline, limited palette, full body, transparent background, no text, no watermark, original character design (not from any existing game)"

### 4.1 Hero job outfits (24 stills, then 24 sheets)
Heroes face **left** in battle. Keep each hero's identity (hair, face, horns and wings, smoke) and change only the outfit and weapon per job.

| Job (key) | Patron | Outfit and weapon direction | Raine | Miasma | Verai |
|---|---|---|---|---|---|
| Freelancer (`freelancer`) | none | Their default look from the character sheet | `raine_freelancer` | `miasma_freelancer` | `verai_freelancer` |
| Oathblade (`oathblade`) | Valerion | Silver-and-blue half plate, sword and small shield, a flame sigil | `raine_oathblade` (**her starting job**; keep the black coat over the armor) | `miasma_oathblade` | `verai_oathblade` |
| Dawnsinger (`dawnsinger`) | Sylara | White and gold vestments, sunburst staff, soft glow | `raine_dawnsinger` | `miasma_dawnsinger` | `verai_dawnsinger` (**her starting job**; keep the pinafore, add a gold stole) |
| Arcanist (`arcanist`) | Myndra | Deep blue robe with star embroidery, a rod topped with a seven-pointed star and eye | `raine_arcanist` | `miasma_arcanist` | `verai_arcanist` |
| Masquer (`masquer`) | Malakar | Dark leathers, a split half-smile half-burn mask pushed up on the head, twin daggers | `raine_masquer` | `miasma_masquer` | `verai_masquer` |
| Tidecaller (`tidecaller`) | Thalara | Sea-green wraps, shell and pearl trinkets, a spear or staff with a wave-and-serpent head | `raine_tidecaller` | `miasma_tidecaller` | `verai_tidecaller` |
| Ash Reaper (`reaper`) | Grimnar | Soot-black heavy armor with ember cracks, a big axe or blade, raven motif | `raine_reaper` | `miasma_reaper` | `verai_reaper` |
| Wyrmblood (`wyrmblood`) | old dragon blood | Scale-plated armor, a long spear, draconic accents | `raine_wyrmblood` | `miasma_wyrmblood` (**her signature job**: wings spread, horns glowing) | `verai_wyrmblood` |

Example prompt:
> "Raine Cudlar, a young woman with wild spiky orange hair and green eyes, gold crescent moon pendant, wearing silver-and-blue knight half plate over a long black ragged coat, holding a longsword and small round shield with a flame sigil, standing battle-ready facing left, 16-bit JRPG pixel art sprite, clean 1px dark outline, limited palette, full body, transparent background, no text, original character design"

Then create sheets (`<hero>_<job>_sheet.png`) with the 11 poses in 3.4. **Priority order:** Raine Oathblade, Miasma Freelancer, Verai Dawnsinger (the starting jobs), then Miasma Wyrmblood, then the rest.

### 4.1b New characters (highest priority after the starting jobs)
- `luna.png` (battle still, facing LEFT, ~128px tall, Dawnguard armor with the helm on) and `luna_oathblade_sheet.png` (11-frame sheet). Until then the game scales up her field sprite.
- `luna_face.png` (helmeted) and `face_luna_true.png` (moonfang face, gold eyes, silver ears). The true-form face isn't wired yet; use it in `lunaResolution()` in `js/events.js`.
- `field_luna.png` and `field_lunawolf.png` (her true form: same armor, no helm, silver ears), `field_odeaon.png`, and `face_odeaon.png`. For `face_odeaon`, add `'High Knight Odeaon': 'face_odeaon'` to `NPC_FACES`.
- Cinematic stills (optional, 960×640; used through `cinema()` layers with `img:`):
  - `cine_barge` (the barge at night)
  - `cine_censer` (the censer cracking open)
  - `cine_mist` (Sonia leaving baby Verai in the Silverleaf mist)
  - `cine_moon` (Luna under the full moon without her helmet)
  - `cine_miasma_odeaon` (the two of them facing off in a moonlit street)

### 4.2 Portraits (128×128)
- **Heroes:** `raine_face`, `miasma_face`, `verai_face`. The existing ones are 72×72 crops; replace them with clean bust portraits in matching anime-JRPG style.
- **NPCs:** `face_vesper`, `face_sonia`, `face_votary`, `face_tamsin` (a stern dark-haired Warden lieutenant), `face_grell` (a grizzled green-skinned half-orc harbormaster with a grey beard and navy coat), `face_moth` (an old Hollowmere woman with a lavender shawl and smoke), `face_sef` (a hooded oracle in purple).
- Optional expression variants: add `raine_face_sad`, `raine_face_angry` etc. This needs a small code change: pass `{ name, face: 'raine_face_sad' }` to `say()` in `js/events.js`.

### 4.3 Field sprites (`field_<look>.png`, 3×4 grid)
Currently drawn in code by `js/sprites.js` (`LOOKS`). Replace them in this order:
1. `field_raine`, `field_miasma`, `field_verai`. The party leader is always the first living member.
2. `field_vesper`, `field_tamsin`, `field_warden`, `field_dawnguard`, `field_priest`.
3. `field_hollowman`, `field_hollowwoman`, `field_elder`, `field_oracle`, `field_halfling`, `field_grell`, `field_sailor`, `field_merchant`, `field_man`, `field_woman`, `field_oldman`, `field_child`, `field_scholar`, `field_elf`, `field_shade`.

### 4.4 Bosses (already done; optional upgrades)
`b_veilstag`, `b_votary`, `b_chimera`, `b_bloomcolossus` and `b_sonia` were made from the user's paintings (`tools/source/boss_*.webp`) using `tools/bosses.py`. Optional upgrades:
- `b_<name>_2.png`: a second idle frame, such as Veilstag smoke drifting, the Votary's halo pulsing, Chimera heads shifting, the Colossus bloom opening, or Sonia's shadows writhing.
- A proper **Sonia reveal card**: 960×640 `card_sonia.png`. Wiring it takes one line: in `soniaReveal()` in `js/events.js`, change `card({ img: 'b_sonia', ...})` to `img: 'card_sonia', scale: 1`.

### 4.5 Regular monsters: give each one unique art
Right now many enemies share art with a color tint. To give an enemy unique art, create `m_<newkey>.png`, then in `js/data.js` change that enemy's `art: '...'` to `'<newkey>'` and **delete its `tint`**.

| id | Name | Zone | Current art | Suggested new key | Design prompt |
|---|---|---|---|---|---|
| lurker | River Lurker | barge, river | m_fishman (tinted) | `lurker` | Hunched river fishfolk with a lantern-lure and a bone spear |
| eel | Lamp Eel | river | m_slime (tinted) | `eel` | Glowing teal eel coiled in the air, bioluminescent spots |
| gel | Dew Gel | plains | m_slime | `gel` | A dewdrop slime with grass stuck in it, cute and dumb |
| hob | Hobgoblin Scout | plains | m_goblin (tinted) | `hob` | Disciplined red hobgoblin in Ashkari scout leathers |
| wolf | Plains Wolf | plains, meadow | m_wolf (tinted) | `wolf` | Tawny wolf |
| mothwing | Veilmoth | Silverleaf | m_bat (tinted) | `veilmoth` | Big pale moth with eye-spots that look like crescent moons |
| silverwolf | Silverleaf Wolf | Silverleaf | m_wolf (tinted) | `silverwolf` | White wolf with birch-bark patterned fur |
| wisp | Dream Wisp | Silverleaf | m_wisp (tinted) | `dreamwisp` | Violet smoke wisp with a sleepy face |
| thornling | Thornling | Silverleaf | m_imp (tinted) | `thornling` | Tiny bramble imp |
| webber | Silkweaver | Silverleaf | m_spider (tinted) | `silkweaver` | Pale spider weaving silver thread |
| cinderimp | Gilded Imp | burned Hollowmere | m_imp (tinted) | `gildedimp` | Imp made of hot gold leaf, a halo shard on its head |
| ashhound | Ash Hound | burned Hollowmere | m_wolf (tinted) | `ashhound` | Hound of cinders with ember eyes |
| lizard | Sunback Lizard | meadow | m_lizard (tinted) | `sunback` | Big basking lizard with a golden sail back |
| toad | Meadow Toad | meadow | m_toad (tinted) | `meadowtoad` | Fat toad covered in buttercups |
| zealot | Lantern Zealot | meadow, coast | m_pirate (tinted) | `zealot` | Fanatical Dawnguard acolyte with a hooked lantern-pole |
| crab | Brine Crab | coast, sea | m_spider (tinted) | `brinecrab` | Barnacled crab with one huge claw |
| gilder | Gilded Sentinel | Tower of Dawn | m_skeleton (tinted) | `sentinel` | Gold-plated animated armor, empty helm with a light inside |
| sunwisp | Sunwisp | Tower of Dawn | m_wisp (tinted) | `sunwisp` | Tiny angry sun |
| gullharpy | Gull Harpy | coast, tower | m_bat (tinted) | `gullharpy` | Seagull-woman harpy stealing a fish |
| tidelurker | Tidelurker | sea | m_fishman | `tidelurker` | Larger deep-sea lurker, coral armor |
| bloomling | Bloomling | Embrace | m_slime (tinted) | `bloomling` | Walking purple flower bulb with a smile |
| thornwolf | Briar Wolf | Embrace | m_wolf (tinted) | `briarwolf` | Wolf wrapped in purple briars |
| mossogre | Moss Ogre | Embrace | m_ogre (tinted) | `mossogre` | Ogre overgrown with moss and mushrooms |
| pollenshade | Pollen Shade | Embrace | m_shade (tinted) | `pollenshade` | Ghost made of drifting glowing pollen |

### 4.6 Battle backgrounds (`bg_<name>.png`, 960×440)
The bottom 100px should be ground where fighters stand. Keep the middle uncluttered.

| Name | Used for | Prompt idea |
|---|---|---|
| `river` | Barge fights at night | River at night, crescent moon, gold lantern posts on a barge deck |
| `plains` | Aurelion fields | Sunny golden meadows, the Dawnpeaks far away |
| `meadow` | South plains | Golden wheat fields at late afternoon |
| `forest` | Silverleaf world map | Pale birch forest, soft mist |
| `deepwood` | Silverleaf dungeon, Veilstag | Dark birch forest, teal glowing cracks, fireflies |
| `burning` | Burned Hollowmere, Votary | Village silhouettes burning under an orange sky, embers |
| `sea` | On the Wren | Open sea from a small boat deck |
| `beach` | Coast | White sand beach, calm Harmony Sea |
| `temple` | (spare) | Golden sunlit temple colonnade |
| `tower` | Tower of Dawn, Chimera | Inside a lighthouse lantern room, a giant lens, gold stone |
| `vale` | Elaris's Embrace, Colossus | Twin waterfalls meeting in the air, purple flowers |
| `sanctum` | Sonia fight | Void with an eclipsed sun halo, white and gold pillars fading into shadow |
| `town` | (spare) | Solanthia street |

### 4.7 Tiles (optional, biggest visual upgrade for the least art)
Tiles are 16×16 and drawn at 48×48. Tile art names (see `TILE_ART` in `js/tiles.js`):

- **World:** `grass`, `forest`, `mountain`, `ocean` (4 frames), `river` (4 frames), `bridge` (4 frames), `sand`, `city`, `village`, `woodgate`, `lighthouse` (2 frames), `waterfall` (3 frames), `town`, `path`
- **Interiors:** `wallTop`, `wallFace`, `torch` (2 frames), `floor`, `planks`, `path`, `tree`, `birch`, `silverwood`, `water` (4 frames), `roof`, `bwall`, `door`, `shopdoor` (6 variants: weapon, armor, item, -, inn, chapel), `counter`, `carpet`, `pillar`, `throne`, `bed`, `fence`, `flowers`, `stairsDown`, `stairsUp`, `shelf`, `table`, `dock`, `rubble`, `mud`, `altar`, `statue`, `barrel`, `fountain` (2 frames), `sand`, `ash`, `ruin` (2 frames), `lantern` (2 frames, the Dawn Lantern save point), `veilcage` (2 frames), `deck`, `rail` (4 frames), `gilded`, `bloom`, `cliff`

Themes (for `tile_<art>_<theme>.png` variants): `world`, `town`, `solanthia`, `temple2`, `silver`, `hollow`, `ashen`, `tower`, `vale`, `barge`, `house`.

### 4.8 Title screen
`title_bg.png`, 960×640: the ten god-seats as a ring of flames. One seat is dark and violet (Nyxia's), and Sonia's silhouette looms behind it. **Leave the center band from y=120 to 240 fairly dark**, because the title text is drawn there.

---

## 5. Acting, cinematics, trailer, debug

**Acting (FF4-style).** Story scenes put the whole party on the map as **actors** that walk, turn and react. The system is in `js/cinema.js`, class `Actor`. Inside `scene(async ({ raine, miasma, verai, luna }) => { ... })` in `js/events.js`, actors can:
- walk: `walk(dirs)`, `walkTo(x, y)`, `stepBack()`, `lunge()`
- turn: `face(dirOrActor)`, `shake()` (a "no" head shake), `spin()`
- move in place: `hop()`, `nod()`, `laugh()` (bounce with ♪), `tremble()`
- change pose: `kneel()`, `fall()`, `stand()`
- pop an emote bubble with a small action: `surprise()` (!), `question()` (?), `sad()` (...), `angry()`, `sweat()`, `heart()`, `idea()`
- fade: `fadeIn()`, `fadeOut()`

Other tools:
- **Map NPCs:** `npcActor(key)` lets a map NPC act.
- **Camera:** `F().pan(x, y)` and `F().letterbox()`.
- **Speaking:** a speaking character bobs while their text types.
- **Idle NPCs** breathe. Setting `act: 'sweep' | 'hammer' | 'pray' | 'dance'` on an NPC gives it a looping chore.

When you add real field sprite sheets (4.3), all of this uses them automatically. A good upgrade is extra field poses per character (`field_<look>_emote.png`: surprised, sad, laughing, kneeling), which would need a small change in `Actor.drawActor`.

**Cinematics.** `cinema([...shots])` shows full-screen letterboxed shots. Each shot can have a background (`'river' | 'fire' | 'forest' | 'moon' | 'seats' | 'dawn' | 'void' | 'falls' | 'gold' | 'black' | 'stars'`), layers (images or scaled sprites that move, zoom and fade), captions, flashes, shakes, sound effects and music. The trailer is `trailerShots()` in `js/cinema.js`. Replace procedural backgrounds with painted `cine_*.png` layers for a big quality jump.

**Debug menu.** Press F2 or backtick, or click the DEBUG button. It can:
- fix a stuck or black screen
- jump to 11 story checkpoints
- warp to any map
- win the current battle
- heal, add levels or unlock all jobs
- toggle random battles
- show the map position
- show the error log

The game loop now catches errors instead of freezing, and a watchdog restores the screen if a fade gets stuck.

## 5b. Animation and effects to-do
1. **Hero sheets** (4.1): the biggest improvement.
2. **Boss idle frames** (`_2`).
3. **Battle effects** are code particles in `spawnFx()` in `js/battle.js`: slash, claw, fire, dark, ice, bolt, water, holy, wind, poison, smoke, heal, buff, acid, light, boom, roar, cast. To use image effects, add `fx_<name>.png` strips and extend `spawnFx` to draw them. Keep the particle fallback.
4. **Field:** party members could follow the leader (a trailing sprite). This needs code in `FieldScene.draw()`.
5. **Screen transitions:** a battle swirl exists in `battleSwirl()` and could be made fancier.

---

## 6. Code map
```
tenthseat/
  index.html          page shell + touch controls
  js/core.js          loop, input, scenes, timers, WebAudio synth + sfx
  js/gfx.js           text, windows, ListMenu, image loading and recolor helpers
  js/tiles.js         procedural 16x16 tiles + THEMES + tile tables (+ tile_* overrides)
  js/sprites.js       procedural field sprites from LOOKS (+ field_* overrides)
  js/data.js          HEROES, JOBS, INNATE, SKILLS, ITEMS, EQUIP, ENEMIES, FORMATIONS, SHOPS
  js/music.js         original chiptune tracks (MUSIC)
  js/party.js         state, stats(), job change, EXP/JP, save/load (localStorage)
  js/maps.js          WORLD + MAPS (ASCII grids), NPCs, chests, warps
  js/events.js        all story scenes for Chapter One
  js/data2.js         Chapter Two data (Brakka, 2 jobs, gear, monsters, bosses, shops)
  js/maps2.js         Chapter Two maps (the Ashkar world map + 9 maps)
  js/events2.js       Chapter Two scenes (loads after cinema.js)
  js/ui.js            dialog, field menu (Items/Skills/Job/Equip/Status/Order/Config/Save), shops, inn, chapel
  js/field.js         exploration, encounters, cutscene helpers (walk, npcWalk, card, crawl)
  js/battle.js        ATB battle system, effects, backgrounds (+ bg_*, sheet overrides)
  js/main.js          title screen, new game, boot
  js/assets.js        GENERATED: every PNG embedded as a data URI
  assets/             PNG art (b_* bosses, m_* monsters, heroes, faces)
  tools/              art pipeline (bosses.py, pixelate.py, build_assets.py) + checks/
  tools/source/       the user's original paintings
```

### Key concepts
- **Stats:** `stats(m)` = hero base + growth × level, × job multipliers, + equipment.
- **Jobs:** `JOBS[job].learn = [[rank, skillId], ...]`, and ranks come from JP (`JP_TABLE`). `changeJob()` swaps in allowed gear automatically.
- **Battle:** `BattleScene.tick()` fills gauges. Full gauges queue actions, and `runNext()` plays one action at a time. Enemy AI picks from `acts`, or `phase2` under 50% HP. Options: `noRun`, `cantLose`, `turnLimit`.
- **Maps:** each character in `rows` is a tile from `IN_TILES` / `WORLD_TILES`.
  - Digits are NPCs (`npcs`). Letters listed in `chests` are chests.
  - `X` is an exit (to `back`), `Y` a second exit (to `back2`).
  - `<` and `>` are stairs (`warps`). `L` is a Dawn Lantern save point.
  - `steps` are trigger tiles and `signs` are examinable tiles.
- **Events:** async functions using `say()`, `ask()`, `notify()`, `startBattle()`, `card()`, `crawl()`, `setFlag()` / `flag()`, `giveKey()`, `addMember()`, `openJob()`.

---

## 7. How to extend

**Add an enemy.** Add an entry to `ENEMIES` in `js/data.js`, add it to a zone in `FORMATIONS`, and add its art `m_<art>.png`.

**Add a map.**
1. Add an entry to `MAPS` with `rows`, `theme`, `music`, `start`, `back` and optionally `enc` / `encRate` / `bg`.
2. Link it from `WORLD.places` (world coordinates must be a place tile), a door (`doors`) or stairs (`warps`).
3. Run `validate.js`.

**Add a story scene.** Write an `async function` in `js/events.js` and hook it to an NPC's `talk`, a `steps` tile, a `signs` tile or `onEnter`.

**Add a job.** Add it to `JOBS` and `JOB_ORDER`, add its skills to `SKILLS`, and unlock it with `openJob('<key>')` in an event.

Planned jobs for later chapters:
- **Bloomsinger** (Elaris; songs, buffs)
- **Rimewarden** (Kryos; ice and time: Slow, Stop)
- **Chainbearer** (Zariel; counters, vengeance)
- **Phoenix Warlock** (Ashkar; rebirth, fire)
- **Nightweaver** (Nyxia's echo; Verai's true job)

**Balance.** Tune `atk`, `hp`, `def` and `mdef` in `ENEMIES`, then run `sim.js` (section 8). **Bosses should end with the party at 30 to 65% HP, lasting 60 to 150 seconds.**

---

## 8. Checks: run after every change
```bash
cd tenthseat
node tools/check/validate.js     # map shapes, reachability, data references  -> "ALL OK"
node tools/check/sim.js          # real battles, auto-played (win rates, length, HP left)
NODE_PATH=$(npm root -g) node tools/check/story.js   # plays every story event in headless Chromium (needs playwright)
NODE_PATH=$(npm root -g) node tools/check/story2.js stay   # Chapter Two from a Chapter One save (also: leave, sonia)
```

---

## 9. Roadmap: Chapter Two and beyond

**Chapter Two is built.** Its story, choices, merge steps and new art list are all in `CHAPTER2_UPDATE_FOR_CHATGPT.md`. Its code lives in `js/data2.js`, `js/maps2.js` and `js/events2.js`. Chapter Three should follow the same pattern: `data3.js`, `maps3.js`, `events3.js`, a `chapter3Opening()` started from `continueGame()` when `ch2done` is set, and new jump points in `js/debug.js`.

Threads to pick up later:
- **Chapter Three:** Odeaon's arrest; the truth about Miasma, which is still unsaid; Verai (`veraiDoubt` / `veraiCold` / `veraiWaits` / `veraiRejoined`); Ashkar as ally or rival (`ashkarAlly` / `ashkarRival`).
- **Chapter Four:** returns to the sunken sanctuary (`sanctuarySunk`).

The original outline follows.
Outline only. Keep the FF4-like rhythm: a new region, a new ally, a betrayal or sacrifice, and a new vehicle.

- **Chapter Two: The Tenth Flame.** The party sails to **Ashkar**, Dominion of Flame and Ash:
  - Vulfaria, Draumond's Gate, Kharak Yr's blackpowder, the Ashen Road, Mount Terminus's Final Gate.
  - They seek Ashkar, the phoenix god, as a dangerous ally against Sonia.
  - **Raine's crescent pendant** matches Ashkar's black crescent symbol. Why? That's the hook.
  - Possible new ally: a Grimnarite grave-keeper, or a Kharak Yr goblin gunsmith.
  - Vehicle: a blackpowder-driven paddle ship.
- **Chapter Three: Tides of Knowledge.** Thalemyr: Astrilion's Great Library, Sephara, and Ebonport, the City of Masks, where Nyxia's last faithful hide.
  - Verai learns her smoke is a fragment of Nyxia.
- **Chapter Four: The Unclaimed Wilds.** Zalakir: Godsfall Crater, the Rift of Echoes, Skyreach Jungle.
  - Sonia tries to ascend there, where faith is up for grabs.
  - Final choice: who takes the empty seat?
- **Reliquaries (the "crystal" equivalent, but it is not crystals):** each god has one. Sonia collects them to unseat gods. There are 10 in all, one per god.

---

## 10. Known limits and prioritized to-do
1. The biggest visual gains are hero job sprites and sheets (4.1), then portraits (4.2), field sprites (4.3) and battle backgrounds (4.6).
2. Monsters reuse tinted art (4.5).
3. The Google font "Press Start 2P" loads from Google Fonts. There's a monospace fallback offline.
4. No row system (front/back) yet. FF4 has one; it's optional.
5. There is no separate "Bestiary" or "Job tutorial" screen. The tips appear in dialog.
6. Music is procedural chiptune (`js/music.js`). Composing more tracks in the `mel()` format is welcome, but keep them original.
