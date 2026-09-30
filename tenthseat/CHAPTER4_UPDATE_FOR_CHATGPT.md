# Chapter Four update: *The Drowned Sanctuary* (the breaking point)

This zip is the whole game: Chapters One to Four plus the secrets. Chapter Five is next, and saves carry over.

If you (ChatGPT) already have an older copy with your art in it, **don't start over.** Merge first (section 1), then make the new art (section 4).

---

## 1. Merge this update into your copy

Run this from inside the NEW folder (this zip, unzipped):

```bash
python3 tools/merge_update.py /path/to/YOUR-older-folder
node tools/check/validate.js          # must end with "ALL OK"
```

- It finds which release your copy came from. There are baselines for **Chapter One**, **Chapter Two**, **Chapter Three part one** and **Chapter Three complete** in `tools/merge/`.
- It keeps your PNGs and re-applies your code edits.
- `MERGE_REPORT.md` lists anything you need to copy over by hand.

**Saves:**
- Finishing Chapter Three now flows straight into Chapter Four.
- Pressing **Continue** on a "Chapter Three Complete" save also starts Chapter Four.
- Never rename a flag, job, item or map id.

### New and changed files

| File | Status | What's in it |
|---|---|---|
| `js/data4.js` | NEW | Ashkar as a guest fighter, Luna's Silvermane skill, tier-5 Moonhollow gear, the Cleansing, Luna berserk, the sanctuary's monsters, Ysolde, and the Cinder Knights |
| `js/maps4.js` | NEW | Moonhollow, the drowned sanctuary (3 maps), **current tiles**, mirror and coral tiles, 2 music tracks, the new world place |
| `js/events4.js` | NEW | Every Chapter Four scene |
| `index.html` | changed | Loads the three new files (`events4.js` last) |
| `js/field.js` | changed | Currents push you, like ice but in a fixed direction |
| `js/events3.js` | changed | The Chapter Three ending continues into Chapter Four |
| `js/debug.js` | changed | Chapter Four jump points |
| `js/battle.js` | changed | Underwater backdrop (`drowned`) |
| `tools/check/validate.js` | changed | Checks every current floor: always solvable, no endless loops |
| `tools/check/story4.js` | NEW | Plays Chapter Four (routes: ally / rival × Verai stays / benched / pushed) |

---

## 2. Story bible: Chapter Four

### The theme: the breaking point
The party is big now. This chapter is about the people in it cracking under the weight of what they are. **Verai** can break. **Luna** does break.

### Verai's goodwill (`flags.veraiWill`)
It is built from how she has been treated:

| Source | Change |
|---|---|
| The Chapter One bond | +bond |
| The Terminus night (`veraiNight`) | +1 |
| **In the active party** | +1 |
| **Left on the bench** | **−2** |
| She came back on her own (`veraiReturned`) | +1 |
| She was trusted at Raine's bedside in Chapter Three | +1 |

**The reflection.** While Raine catches up with Odeaon and Miasma (*"Were you two married?" "On the mountain. A goat officiated."*), Verai slips off to the stern.
- Her thoughts: *"Kind is how you treat a weapon you're afraid of."* If benched: *"They leave me below deck. Like luggage."*
- She sees **Sonia's reflection smiling up from the sea**: *"They'll use you up, and call it friendship. Come home."*
- **Goodwill under 3:** she goes. All that's left is a grey scarf on the rail. **She's gone for all of Chapter Four** (`veraiGone4`, `veraiGoneWhen = 'reflection'`). Her character data is kept in `S().away.verai` for Chapter Five.
- **Otherwise:** she shatters the reflection: *"I'm not yours. I'm not THEIRS either. I'm mine."* (`veraiResisted`). Luna finds her: *"Do you ever want to stop pretending?" "Every single day."*

**Three more moments push her** (she appears in them even from the bench):

| Moment | The choice |
|---|---|
| **Moonhollow** | The moonfangs are afraid of her, and her smoke could hide the village. Raine **asks** her (+1), **orders** her (−1), or **leaves her out** (−1). |
| **Hallorn** | He calls her "the Unseated One's whelp." Raine: **"She's family"** (+1), **"Ignore him"** (0), or **silence** (−1). |
| **The mirror** | Sonia's reflection holds out her hand. Raine **trusts her to face it alone** (+1), **stands beside her** (+1), or **pulls her away** (−2). |

After each moment, **if goodwill drops below 2, she leaves on the spot**: *"I'm tired of being asked to be a weapon and never asked to be a person."* (`veraiGoneWhen` = `moonhollow`, `hallorn` or `mirror`)

- **If she stays all chapter:** she stands up to Sonia at the end. *"Still here. Still mine."* (`veraiStood`)
- **If she's gone:** she appears at Sonia's side at the end. Raine says *"Come home"* or *"We should have asked what you wanted"* (`veraiReach`, `flags.veraiReachChoice`), and Verai leaves with her mother.

### Luna: the heart of the chapter
- **The Cleansing.** After Sonia was unmasked, **Acting Luminar Hallorn** declared that every monster, dragon and "godling" must be brought to the Light. Luna begs to go home.
- **Moonhollow** is a hidden village of moonfangs (wolf-folk) deep in the Silverleaf, and her family lives there. If her secret wasn't out yet, **she takes off her helmet in front of everyone** (Miasma: *"...Well. That explains the meat."*).
- **Odeaon knew the whole time.** Twelve years ago the Temple sent him to burn a moonfang den. He found a cub hiding under her dead mother; she bit him. He couldn't do it, so he carried her to Grandmother Hesk and reported the den empty. Four years later, a girl with her helmet on backwards walked into his barracks, lying about her age. *"I've known since the day you walked in, Luna."*
- Luna: *"HOW?!"* Miasma: ***"Oh, sweetheart. Of course he knew you were a monster. He married a DRAGON. The man has a TYPE."*** Odeaon: *"MIASMA."* Raine: *"Please never say 'type' about my father again."* (He also points out that she howled in her sleep every full moon and the barracks thought they'd adopted a dog.)
- **Why she hid, and why she served so long** (the night by the spring):
  - Every monster the Temple ever let live was one in a helmet.
  - She wanted to be the best knight they'd ever seen, so one day they'd have to admit *she was one of them, and she was good.*
  - For eight years she wrote the **Two Moons Accord** to the Luminar every full moon, asking that peaceful monsters be allowed to live. Nobody answered, because the Luminar was Sonia.
  - For eight years she sent every patrol the long way round the Silverleaf.
  - Raine's reply sets `lunaTrust`: *"You ARE good"*, *"You should have told me"*, or *"I'd have worn a helmet with you."*
- **The Cleansing attacks at dawn:**
  - A fight at the birch line.
  - Hallorn arrives with **Pip, a moonfang cub, in a silver net**.
  - Boss: **Hallorn, the Cleanser**.
  - He throws a torch and raises a knife over the net.
- **Luna breaks.** The moon turns red, her armor splits, and she becomes **Luna, Moonfang Unbound**. She frees Pip, throws Hallorn through a wall, and turns on you. **You fight her without her.**
- **Afterwards** Raine holds her, tells her she did right, or admits she was scared (all set `lunaTrust` or not).
- **Hallorn's fate** changes the world:
  - **Let him go** so he can tell Solanthia the monsters spared him (`hallornSpared`).
  - **Hand him to the moonfangs**, who keep him "until he learns our names" (`hallornKept`).
- **Luna stops hiding.** `lunaUnmasked` is set, **her field sprite becomes her true form**, and she learns **Silvermane**. Her mother's fang is waiting in the ashes of her old den.

### The Anvil: two different chapters

| | **Ashkar's ALLY** (`ashkarAlly`: he held the Anvil) | **Ashkar's RIVAL** (`ashkarRival`: Raine held it) |
|---|---|---|
| **Opening** | Ashkar crash-lands on the Wren, bleeding fire. Sonia besieged his throne for three days. He gives Raine the Anvil and the **Phoenix Ember**, "technically my heart. A small piece." | **Cinder Knights** board the Wren. Boss: **Pyrewarden Sael**: *"You told a god NO."* Brakka builds the **Anvil Bell**, a diving bell heated by the cursed Anvil. |
| **The dive** | Walk down into the sea inside a bubble of phoenix warmth | Sink in a glowing, hissing bell |
| **Elaris's roots** | Close over the Anvil and hide it (`anvilSealed`) | Refuse it: *"stolen twice, and a god is angry at it"* |
| **Sonia arrives** | **Ashkar bursts down through the boiling sea and fights beside you** (guest). He spends every flame he has to drive her off (`ashkarGuttered`). | Her shadows pin everyone and **she takes the Anvil** (`anvilLost`). Three reliquaries. |
| **After** | The Tenth Flame flies home burning low | A burning raven: *"You told me no, and now SHE has it."* |

### The drowned sanctuary
You reach it through Elaris's Embrace on the world map.
1. **The Sunken Cloister:** a **current puzzle**.
2. **The Hall of Reflections:** three mirrors.
   - **Luna** faces the Temple's view of her as a beast.
   - **Raine** faces the dragon who "killed her mother."
   - **Verai** faces her mother, or, if Verai is gone, Raine sees the friend who should be there.
3. **The Heart of the Embrace:**
   - **Boss: Ysolde, the Drowned Bloom.** She has watched her goddess die alone: *"Everyone wants something from her. Nobody ever came to sit with her."*
   - **Elaris's last words:** she gives Raine **Elaris's Last Seed**, to plant "somewhere the faith is honest." Something new might grow. This is a hook for the final choice.
   - Then Sonia arrives.

### Ending
- Luna stands in the sun without her helmet. *"I forgot sun was warm on your ears."*
- If Verai left, Raine sits at the stern with the grey scarf.
- The crawl sums up the world state. **END OF CHAPTER FOUR.** *Next: Chapter Five, The City of Masks.*

### Flags for the next writer
`ch4start`, `veraiWill`, `veraiResisted`, `veraiGone4` + `veraiGoneWhen`, `veraiStood`, `veraiReach` + `veraiReachChoice`, `S().away.verai`, `ch4moon`, `ch4lunaTalk`, `ch4purge`, `lunaUnmasked`, `lunaTrust`, `hallornSpared` / `hallornKept`, `ch4dive`, `ch4mirrors`, `ch4bloom`, `anvilSealed` / `anvilLost`, `ashkarGuttered`, `ch4done`.

Key items: `elarisseed`, `accord`, `phoenixember` / `anvilbell`.

---

## 3. New mechanic: currents
- `[`, `]`, `{` and `}` push you left, right, up and down until you reach still water or hit something.
- The sprites animate in their direction.
- `tools/check/validate.js` proves every current floor is solvable from every spot you can stop on, with **no endless loops**.
- When you design a new current floor, run the validator. It names any spot where you'd get stuck, and any endless loop.

---

## 4. New art for Chapter Four

The rules from `CHATGPT_GUIDE.md` sections 3 and 4 apply.

| File | Priority | Notes |
|---|---|---|
| `luna_unmasked.png` + `field_lunawolf.png` | **Highest** | Luna without her helmet: silver ears, gold eyes, Dawnguard armor with the tabard torn, a silver fang on a cord. From this chapter on, the map uses `field_lunawolf`. Add `luna_face_true.png` too. |
| `b_lunaberserk.png` | **Highest** | Luna fully transformed: a huge silver wolf in split armor, red moonlight, tears in her eyes. Delete her `ph` in `js/data4.js` afterwards. |
| `b_drownedbloom.png` | High | Ysolde: an enormous grey-and-violet flower with a woman's weeping face in the center, roots wrapped around a faint glowing heart, underwater. Delete her `ph` afterwards. |
| `b_pyrewarden.png`, `b_cleanser_hallorn`* | Medium | Sael: a knight made of cinders with a burning lance. Hallorn: the Chapter Three inquisitor, now scorched, crazed and holding a silver net. |
| `face_hesk`, `face_ysolde`, `face_elaris`, `face_sael`, `face_hallorn` | Medium | Portraits (128×128). Hesk is an old grey moonfang grandmother with a pipe and one torn ear. |
| `ashkar.png`, `ashkar_sheet.png` | Medium | Ashkar as a guest fighter (human form; flame hair; wounded, fire leaking from his side). |
| `bg_drowned` | Medium | A sunken temple: coral-furred pillars, light shafts from far above, drifting petals |
| Tiles: `currentL/R/U/D` (4 frames each), `coral`, `mirror` (2 frames); themes `drowned`, `moonhollow` | Medium | Currents must be readable at a glance: the direction has to be obvious. |
| `cine_reflection` (960×640) | Nice to have | Verai at the Wren's stern, looking down; in the water, Sonia is smiling |
| `cine_berserk` (960×640) | Nice to have | A red moon, and Luna's armor splitting |
| `cine_elaris` (960×640) | Nice to have | A dying goddess made of roots and light, pressing a seed into Raine's hand |
| Monsters | Optional | `m_cleanser`, `m_beasthound`, `m_witchfinder`, `m_drownedsailor`, `m_lanternjelly`, `m_deeplurker`, `m_griefbloom`, `m_mirrorshade`, `m_cinderknight`. Set `art:` and delete `tint`. |

*`cleanser_hallorn` uses the art key `inquisitor` (the same man). Draw a scorched version as `b_inquisitor_2.png`, or give him his own `art:`.

---

## 5. Test it
```bash
node tools/check/validate.js
NODE_PATH=$(npm root -g) node tools/check/story4.js ally stays      # ally route, Verai stays
NODE_PATH=$(npm root -g) node tools/check/story4.js rival bench     # rival route, Verai benched: she leaves at the reflection
NODE_PATH=$(npm root -g) node tools/check/story4.js ally push       # Verai pushed too far: she leaves at the mirror
```
In the game: **F2, then Jump to story point**. There are "Ch4:" entries for both routes and for Verai in or out of the party.
