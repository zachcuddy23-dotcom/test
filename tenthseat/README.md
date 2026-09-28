# The Tenth Seat: Chapter One, *The Unseated*, and Chapter Two, *The Tenth Flame*

A browser JRPG in the spirit of the FF4 era: timed ATB battles, a fast and funny story, and a **job system you can change at any time**. It's set in the user's world of **Cael'Brithar** under the Ascendant Ten, and stars **Raine Cudlar**, **Miasma**, **Verai** and **Luna**, each hiding something.

> *Only ten gods may exist at once. One year ago, a phoenix stole the Tenth Seat. Now someone wants it back.*

## Play
Open `tenthseat/index.html` in a browser. There's no build step or server.

- **Keyboard:** arrows or WASD move · Z / Space / Enter confirm · X cancel or menu · Esc menu · hold Shift to run
- **In battle:** when a hero's TIME gauge fills, pick a command. Press X on the command menu to switch between heroes who are ready. Battle mode (Wait or Active) and speed are in **Menu → Config**.
- **Saving:** save on the world map or beside a glowing **Dawn Lantern**. Inns also save.

## What's new in Chapter Two
- **Chapter One saves carry over.** Continue a save made on the "Chapter One Complete" screen and Chapter Two begins, with all your choices intact.
- **The sanctuary falls into the sea** right after Verai's choice (Chapter Four will return there). Then Raine sails to **Ashkar** for answers about her crescent pendant.
- **A new continent:** Emberport, Charnoch, Kharak Yr and its Gunworks, Draumond's Gate, Mount Terminus, and the Throne of Cinders.
- **New ally:** Brakka Sootfinger, a goblin gunsmith with the **Powder** command.
- **New jobs:** Chainbearer (Zariel: counters, vengeance) and Phoenix Warlock (Ashkar: fire, auto-life).
- **Choices that branch:**
  - Where Verai ended up in Chapter One changes the whole Mount Terminus scene.
  - Bribe or fight your way out of Emberport.
  - Push Miasma for the truth, or let her keep it.
  - Take or destroy the blackpowder.
  - Give Ashkar the Anvil, or refuse him.
- Chapter Two ends with its own cinematic, an end card and a save screen.

## What was new in Chapter One
- **Trailer** before the title (skip with Z, or rewatch it from the title menu), plus cinematic scenes at key story moments.
- **FF4-style acting:** in story scenes the party appears on the map and characters walk, turn, hop, shake their heads, laugh, tremble, kneel and pop emote bubbles.
- **Secrets and choices:**
  - Miasma is secretly Raine's mother.
  - Verai (Raine's childhood friend) is Sonia's daughter, and **your choices decide whether she stays**.
  - Dame Luna is a monster disguised as a knight, and you can catch her.
- **Debug menu:** press **F2** or the **DEBUG** button. It can fix a stuck or black screen, jump to any story point, warp, and more.

## Systems
- **Active Time Battle** with Wait and Active modes, 6 speeds, Defend, Flee, boss phases, status effects (Poison, Sleep, Blind, Fear, Doom), buffs (Protect, Haste, Regen), Guard (cover), Jump, Steal, Mug and HP-cost skills.
- **8 jobs, one per patron god**, changeable any time from **Menu → Job**. Each job has its own command, stat profile and equipment types, and ranks 1 to 8 earned with JP from battles.

  | Job | Patron | Command |
  |---|---|---|
  | Freelancer | none | none (fast JP) |
  | Oathblade | Valerion | **Oath**: Guard, Valor Strike, Rally, Honorbound |
  | Dawnsinger | Sylara | **Dawn**: Mend, Purge, Dawnward, Kindle, Radiance, New Dawn |
  | Arcanist | Myndra | **Arcana**: Spark, Frost, Bolt, Lull, Blaze, Glacier, Tempest, Starfall |
  | Masquer | Malakar | **Trick**: Steal, Flee, Mug, Smoke Bomb, Double Cut |
  | Tidecaller | Thalara | **Tide**: Undertow, Regen, Squall, Riptide, Tidal Renewal, Maelstrom |
  | Ash Reaper | Grimnar | **Ash**: Ashblade, Funeral Pyre, Final Gate, Soulforge |
  | Wyrmblood | old dragon blood | **Wyrm**: Jump, Lancet, Wyrm Cry, Skyfall |

- **Innate commands** stay with each hero in every job: Raine's **Brew** (alchemy), Miasma's **Breath** (dragon breath), Verai's **Smoke** (the dream-smoke of the lost goddess Nyxia).
- **Other features:**
  - Shops, inns, chapels and treasure chests.
  - Five hand-painted bosses: the Veilstag, the Sunscarred Votary, the Sunforged Chimera, the Bloomheart Colossus, and Sonia.
  - A boat for the late game.
  - 15 maps plus a world map of Aurelion.

## Handing off to ChatGPT for art
See **[CHATGPT_GUIDE.md](CHATGPT_GUIDE.md)**. It's a complete brief for generating every sprite, portrait, background and animation sheet, plus the exact filenames the game picks up automatically.

## Developer checks
```bash
node tools/check/validate.js                          # maps + data
node tools/check/sim.js                               # auto-played balance runs
NODE_PATH=$(npm root -g) node tools/check/story.js    # full story smoke test (playwright)
python3 tools/bosses.py && python3 tools/build_assets.py   # rebuild boss sprites + embed art
```
