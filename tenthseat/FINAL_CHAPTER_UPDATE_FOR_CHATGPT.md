# The Final Chapter: *The Tenth Seat*

This zip is the whole game, **beginning to end**: Chapters One to Five, the Final Chapter, the secrets, and a post-game. Saves carry over the whole way.

If you (ChatGPT) already have an older copy with your art in it, **don't start over.** Merge first (section 1), then make the new art (section 6).

---

## 1. Merge this update into your copy

Run this from inside the NEW folder (this zip, unzipped):

```bash
python3 tools/merge_update.py /path/to/YOUR-older-folder
node tools/check/validate.js          # must end with "ALL OK"
```

- It finds which release your copy came from: there are baselines for every chapter in `tools/merge/` (Chapter Five is `ch5_base`).
- It keeps your PNGs and re-applies your code edits.
- `MERGE_REPORT.md` lists anything you need to copy over by hand.

**Saves:**
- Finishing Chapter Five flows straight into the Final Chapter.
- Pressing **Continue** on a "Chapter Five Complete" save also starts it.

**Bugs fixed from Chapter Five:**
- Chapter Five declared `chapelEvent`, `nestSign` and `partyLevel`, which silently replaced older functions with the same names:
  - **Every town chapel door played the Ebonport scene.**
  - The Wyrmspire nest signs broke.
  - The Fey chest's scaling changed.
- They are now `ebonChapelEvent`, `skynestSign` and `groupLevel`.
- `validate.js` now fails if any function is declared in two scripts. Don't reuse a function name from another file. Wrap it instead, the way `events6.js` wraps `seedbed`.

### New and changed files

| File | Status | What's in it |
|---|---|---|
| `js/data6.js` | NEW | Tier 8 gear, 11 god relics, Godsfall's monsters, the reliquary guardians, the god avatars, and Sonia's two forms |
| `js/maps6.js` | NEW | Godsfall Crater (12 maps: ice, petal-current and night-current puzzle floors), and the Ring of the Ten |
| `js/events6.js` | NEW | The whole Final Chapter: the Rally, the siege, Godsfall, Sonia, six endings, the epilogue and the post-game |
| `index.html` | changed | Loads the three new files |
| `js/events5.js` | changed | Renamed clashing functions; the Chapter Five ending continues into the Final Chapter; the Sky Chart can show extra marks |
| `js/main.js` | changed | Continue on a finished Chapter Five save starts the Final Chapter |
| `js/debug.js` | changed | "Final:" jump points |
| `tools/check/validate.js` | changed | Duplicate-function check |
| `tools/check/story6.js` | NEW | Plays the Final Chapter with four different histories, each to a different ending |
| `tools/merge/ch5_base/` | NEW | The Chapter Five release, for merging |

---

## 2. How the Final Chapter is built

### Act One: the Rally
Sonia is sitting down on a throne made of every unanswered prayer in the world. Myndra explains, through the Star Chart: *"When she sits, the storm will open for one hour. If enough people are praying for something else, the door will hold open for you."*

**Fly around the world and raise banners.**
- The Sky Chart marks every waiting banner with a **red flag**.
- The Rimward cartographer keeps the list.
- Each banner plays when you walk into the place, and **each is shaped by your choices**:

| Banner | Where | What decides it |
|---|---|---|
| **The Dawnguard** (Sylara, Valerion) | Solanthia (its gates finally open) | **Spared Hallorn** (Ch. 4): he leads them, and the Accord is signed. **Moonhollow kept him:** the council waits for his word, so go to Moonhollow and ask Hesk to let him go. Odeaon gives the order himself, or, **if he fell** (Ch. 5), Raine raises his shield and the knights kneel. `raineWhy` changes Raine's speech. |
| **The Harmony Fleet** (Thalara) | Brightwater | Always. Grell anchors every ship at the storm's edge to sing. Gives Heartdew. |
| **The Moonfangs** | Moonhollow | `lunaTrust` (Hesk's words); the First Moonfang's mantle (Ch. 5 Barrows); **freeing Hallorn** if they kept him |
| **Hollowmere** | the burned village | **Verai with you:** Hollowmere apologizes to her (`bond` changes her answer). **Verai gone:** "Tell her we're sorry" (`hollowSorry`, which helps bring her home later). |
| **The Heartbloom Sapling** (Elaris) | Heartbloom Hollow | **Only if you planted the seed** (Ch. 5, or now). The sapling speaks according to your **`seedVow`**. Gives Elaris's Blossom (weakens the Heartseed Thrall). |
| **The Scholars** (Myndra) | Astrilion | Always. Gives **Starsight** (Sonia's defenses drop). |
| **Ebonport and the Unlit** (Malakar, Nyxia) | Ebonport | Always; the Unlit's words depend on `veraiNyxia`. Strips Sonia's **Unmake**, and they sing the Starless weaker. |
| **The Pale Watcher** (Kryos) | the Stilled Hourglass | **Only if you met Kryos** (Ch. 5, or now). `kryosGlimpse` changes his words. Gives **One Stopped Minute** (Sonia is slower). |
| **Hearthmoor** | the Frostreach | Always. Twenty years of honey cakes left out for the red dragon. `watcher` (Ch. 3) and the toy dragon get a mention. Heals the party between siege waves. |
| **Zariel's Chainbearers** | Emberport | **Won the trial** (Ch. 2): Vorsk joins. **Bribed your way in:** *"Zariel doesn't take coin."* Fight **Vorsk, Zariel's Chosen**. |
| **The Gunsmiths** (Kharak Yr) | Kharak Yr | **Took the powder** (Ch. 2): 6 Prayer Jars. **Blew it up:** 4, "made out of spite". Gruntle's Thunderwife (Ch. 5) gets a salute. |
| **The Grimnarites** (Grimnar) | Draumond | Will **only march if Grimnar's Anvil is safe**. Sealed under the sea (ally, Ch. 4): yes. **Raine kept it** (Ch. 5): give it to them, or keep it and **lose the banner**. Gave it to Ashkar: refused, unless he fell holding it. |
| **The Tenth Flame's Faithful** (Ashkar) | the Throne of Cinders | **Ashkar fell** (Ch. 5): Pyrewarden Sael leads his faithful. **Ashkar alive and estranged** (rival, kept the Anvil): give him the Anvil, or **let Miasma call in the coal he gave her when she was young**. |

**13 banners in all.** The banners change:
- **The siege:** 5 waves of storm soldiers with no banners, 1 wave with 12 or more.
- **Godsfall's guardians:** the Dawnguard weakens the Seraph, the Unlit weaken the Starless, Elaris's blossom weakens the Thrall.
- **Sonia's final form:** her HP is scaled by the number of banners, and specific banners strip specific powers.
- **The siege cinematic** gives every raised banner its own shot.
- **The ending.** "Raine" is only offered with 7 or more banners.

### Act Two: Godsfall Crater
The siege of the Rim, then eight floors down:
1. **The Breach.**
2. **The Hall of Unanswered Prayers.** Six echoes from the whole story ask for things nobody ever answered:
   - a frightened Hollowmere villager
   - a goblin (powder choice)
   - a Crimson Edict soldier (Kargath, by route)
   - a young Dawnguard who might be Raine
   - **young Sonia, a year ago: *"Give me the seat. I'll be kind with it."***
   - Pip

   Answer any three to open the way. Answering young Sonia kindly (`soniaHeard`) unlocks her redemption.
3. **The Heartseed Garden:** a petal-current puzzle. **Boss: the Heartseed Thrall.** Take back Elaris's Heartseed.
4. **The Drowned Sun:** a gold-glass ice puzzle. **Boss: the Dawnheart Seraph.** Take back Sylara's Dawnheart.
5. **Nyxia's Night:** a night-current puzzle, and **Verai** (see below). Boss: **the Starless**, Nyxia's stolen night, or **Verai, Night's Heir**.
6. **Where the Gods Fell.** **Boss: the Chainwarden of the Empty Seat.** Then **the rescue**:
   - **Odeaon** (if he fell) has been holding his sword up for days. Kryos's stopped minute kept him alive, if you met Kryos.
   - **Ashkar** (if he fell) is chained to the Empty Seat as fuel. If you gave him the pendant (Ch. 5) it kept him warm; otherwise you can give it now, or let him ride in your pocket. On the rival route he hands you back the Anvil to take home.
7. **The Stair of Every Prayer.** The **Last Merchant**, and the **last camp**:
   - Raine and Miasma, at last. `raineAnger`, `raineSilent` and `raineWhy` each play differently. If `motherTrust` ≥ 2 or Raine asked why, she says **"Mom."** for the first time, and Miasma cries loudly enough to knock a prayer off course.
   - `miasmaPromise`'s last confession.
   - Odeaon: *"We get married again. Properly."* / *"Same goat?"* / *"Same goat."*
   - Final words from Luna, Brakka, Verai and Ashkar.
8. **The Unseated Throne:** Sonia, twice.

### Verai: every chapter adds up
`veraiLifetime()` adds up her whole story:
- `bond` (Ch. 1)
- the Terminus night, `veraiDoubt` or `veraiCold` (Ch. 2)
- `veraiHelped`, `veraiReturned` (Ch. 3)
- goodwill, `veraiReach`, `veraiStood` (Ch. 4)
- and this chapter: Hollowmere's apology, the Unlit, the Hollowmere prayer.

| Verai's state after Chapter Five | In Nyxia's Night |
|---|---|
| Carries Nyxia (`'carry'`) | She faces the Starless: *"I'll carry you too."* Afterwards it curls around her shoulders like a scarf and the stars come out in it. She learns **The Veiled Night**. |
| Nyxia's vessel (`'vessel'`) | She walks into the night: *"It's the rest of me."* Raine says her name, holds her hand, or lets her go. With a long enough history, *"Verai. I'm Verai. I CHOSE it."* (`veraiFree`). Otherwise the night takes her to the throne (`veraiTaken`). |
| Lost in Chapter Five (`veraiLost5`) | She stands guard over the Starless for her mother. With enough history and the right words, ***"I'm going home."*** (`veraiHome`). Otherwise you fight **Verai, Night's Heir**, and she runs to her mother (`veraiAtThrone`). |

At the throne, a Verai who ran gets **one last chance** after Sonia falls. She either comes home, or **stays with her mother**, *"Somebody has to teach her how to be a person again"* (`veraiWithMother`).

### Act Three: Sonia, and the Tenth Seat
- **Sonia, the Unseated**, then **Sonia, the One**: she opens her arms and every prayer in the crater pours into her.
- If Ashkar got his fire back, or came with the Tenth Flame's banner, **he fights beside you**.
- Your banners shape her final form:
  - HP: ×(1.25 − 0.05 per banner).
  - Ebonport: no **Unmake**.
  - Kryos's minute: slower.
  - Starsight: lower defenses.
  - Zariel: weaker hits.
  - Dawnguard: a weaker *Only God*.
  - The Ring of the Ten's crown: she can't heal.
- She falls, mortal: *"I was going to be the goddess of second chances. Then a bird took the seat out of my hands."*

**Who sits in the Tenth Seat?** Every option needs its own history:

| Choice | Needs | Ending |
|---|---|---|
| **Nobody** | always | Nine gods and an empty chair. People start answering each other's prayers. |
| **Verai** | Verai with you | The Veiled Night returns, kind, with two names. As the vessel, she becomes it fully and doesn't always remember why. |
| **Ashkar** | Ashkar freed, or he came with his banner | The Tenth Flame, burning a little less brightly and a little more warmly. He plants things at Hollowmere every year. He's terrible at gardening. |
| **Elaris's seed** | seed planted + the Heartseed taken back | `seedVow`: **Elaris reborn**, younger and laughing more, or a new god, **the Open Door** or **the Last Garden** |
| **Raine** | Raine still has the pendant + 7 or more banners | The Rim is chanting her name. **The Crescent**, patron of everyone who asks why. Miasma's reaction depends on `motherTrust`. |
| **Sonia** | answered young Sonia's prayer + Verai home or with her | Her second chance, watched by her daughter. *"I'll try to deserve it. Somebody will have to show me." / "I will, Mother."* |

### The epilogue remembers everything
About 15 shots, each decided by flags from across the game:
- Sonia's fate.
- Verai.
- The family (a **second wedding on the Wyrmspire with the same goat**, if Raine and her parents made it).
- Luna and the Two Moons Accord (Captain of the Dawnguard, no helmet).
- Hallorn.
- Kharak Yr and Brakka's flying ship (in a tree).
- Where Grimnar's Anvil ended up.
- Vorsk and Kargath.
- What Ashkar becomes if he isn't a god (a bakery in Emberport; everything is slightly burnt).
- Myndra and Quill.
- Hearthmoor's plaque for whoever sat at Raine's bedside.
- Kryos.
- Heartbloom Hollow.
- Hollowmere's orange mill fence.
- Grell and the Wren.
- Raine.

Then the credits (with the banner count and who took the seat), **THE END**, and a final save.

### Post-game
- The Veilstorm is gone.
- You can land in Godsfall and walk down to the empty throne.
- The Ring of the Ten is still there.

### The Ring of the Ten (optional)
A reef-ringed sky islet **east of Zalakir**: ten pedestals, one per god. Each god tests you once (hard fights; **every god resists their own element**) and gives a relic. All ten give the **Crown of the Ten**, which prevents every ailment and stops Sonia from healing.

### Flags for anyone extending it
`ch6start`, `bn_<id>` (dawn, tide, moon, hollow, bloom, star, mask, hour, hearth, chain, powder, grave, flame), `dawnWaiting`, `ch6hallornFree`, `graveRefused`, `anvilHome`, `ashkarJoins`, `hollowSorry`, `ch6siege`, `prayer0`-`prayer5`, `prayersAnswered`, `soniaHeard`, `ch6heartseed`, `ch6dawnheart`, `ch6night`, `veraiHome`, `veraiFree`, `veraiTaken`, `veraiAtThrone`, `veraiWithMother`, `ch6warden`, `ch6rescue`, `ch6odeaonBack`, `ch6ashkarFree`, `ashkarRevived`, `ashkarPocket`, `anvilFound`, `ch6camp`, `ch6sonia`, `seat` (`'empty'`, `'verai'`, `'ashkar'`, `'bloom'`, `'raine'`, `'sonia'`), `ch6done`, `ring_<god>`, `ringComplete`.

---

## 3. Balance
- Tuned with the auto-player for a level 50 party with ultimate weapons and a healer (Nightveil, Dawnsinger or Bloomwarden).
- **Godsfall's guardians** leave that party at roughly 30 to 70% HP.
- **Sonia, the One**, by number of banners:
  - **0:** almost unbeatable (the game warns you).
  - **About 6:** a hard fight.
  - **10 or more:** fair.
  - **13:** comfortable.
- **The Ring of the Ten's** gods are the hardest fights in the game if you bring the wrong element.
- `HP6` and `BHP6` in `js/data6.js` scale every Final Chapter monster and boss.

---

## 4. Saves and ids
Never rename a flag, job, item or map id. The epilogue reads flags from every chapter.

---

## 5. Test it
```bash
node tools/check/validate.js
NODE_PATH=$(npm root -g) node tools/check/story6.js allyBloom     # all 13 banners; Elaris reborn
NODE_PATH=$(npm root -g) node tools/check/story6.js rivalEmpty    # Hallorn freed, Vorsk fought, Anvil home; Verai stays with Sonia; the seat stays empty
NODE_PATH=$(npm root -g) node tools/check/story6.js vesselRaine   # Verai pulled back by name; Ashkar in a pocket; Raine takes the seat
NODE_PATH=$(npm root -g) node tools/check/story6.js rivalSonia    # Verai comes home in the night; Sonia's second chance
```
In the game: **F2, then Jump to story point**. The "Final:" entries cover the start on both routes, the Hall of Prayers, the throne, and the Ring of the Ten.

---

## 6. New art for the Final Chapter

The rules from `CHATGPT_GUIDE.md` sections 3 and 4 apply.

| File | Priority | Notes |
|---|---|---|
| `b_sonia_one.png` (and set `art: 'sonia_one'` in `js/data6.js`) | **Highest** | Sonia, the One: not a woman any more but a sky, every god's face looking out of it, the Heartseed and Dawnheart blazing in her hands, the throne of prayers behind her. |
| `cine_throne.png` (960×640) | **Highest** | The Unseated Throne: a throne made of glowing, drifting prayers at the bottom of a crater, with the storm overhead. |
| `b_heartseedthrall`, `b_dawnheartseraph`, `b_starless`, `b_chainwarden`, `b_nightsheir` | High | The Thrall: thorns curled around a beating light. The Seraph: molten gold with a stolen sunrise in its chest. The Starless: a wall of night with no stars in it. The Chainwarden: a jailer made of chains. Verai, Night's Heir: Verai with her mother's white veil over her face and the night pouring off her. Delete each one's `ph` afterwards. |
| `b_av_sylara` ... `b_av_zariel` (9) | Medium | The god avatars for the Ring of the Ten. Use each god's symbol from the pantheon table in `CHATGPT_GUIDE.md` 2.1. |
| `face_ossa`, `face_thistlewood` | Medium | Keeper Ossa: an old Grimnarite priestess with ash on her eyelids. Dr. Thistlewood: a halfling doctor with frost on her spectacles. |
| `bg_*` for Godsfall | Medium | Godsfall reuses the `stormplain`, `chapel`, `vale`, `temple`, `grave` and `sanctum` backdrops. Paint `bg_sanctum.png` as the Unseated Throne room. |
| Tiles: `sunglass`, `nightrock`, `seatring`, `emptyseat`; themes `godsfall`, `prayers`, `heartgarden`, `drownedsun`, `nightcore`, `godsdeep`, `throne`, `seatring` | Medium | 16×16 |
| `cine_epilogue_*` (960×640) | Nice to have | One still per epilogue shot: the goat wedding, Luna's knighting without her helmet, Brakka's ship in the tree, Hollowmere's orange fence, Ashkar's bakery. |
