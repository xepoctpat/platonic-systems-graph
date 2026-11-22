# Session handoff (2026-11-22, day wrap)

Stop point: **242 nodes · 628 edges.** Graph files are unchanged since `172d6d5`. Validate was **OK** (42 systems, 200 principles, 33 clusters). This commit is notes only. `data/nodes.yaml`, `data/edges.yaml`, `data/readings.yaml`, and `data/latest.yaml` are unchanged. `data/latest.yaml` stays `companion`. `mystery-religions` stays `stub`. Working tree is **clean** after it. `main` is pushed to `origin/main`, including `53c686d` and this commit.

Read [ROADMAP.md](ROADMAP.md) and [RESEARCH_PLAN.md](RESEARCH_PLAN.md) before encoding. This file is the resume note. The older handoff (213 nodes, 3D as a view, Buddhist 2 as latest) is superseded.

## What landed today

Mitra · Miθra. One new node, `avestan-mithra` (Miθra, principle, zoroastrian). Five undirected laterals, all between `mitra` and `avestan-mithra`. No edge to `varuna` or `ahura-mazda` from this pair. `zoroastrianism` stays partial. `data/latest.yaml` is `companion`.

| Row | Sort | Edge | Passages |
|---|---|---|---|
| Covenant | shared attribute | cyan | Ṛgveda 3.59.1 and Yt. 10.2 |
| Unsleeping eye | partial swap | orange | Ṛgveda 3.59.1; Yt. 10.7 and Yt. 10.13. The work of the eyes did not transfer |
| Kingship | partial swap | orange | Ṛgveda 3.59.4; Yt. 10.16 and the lord-of-countries sentence of Yt. 10.145. Birth as king versus bringing sovereignty |
| Chariot | shared attribute | cyan | Ṛgveda 5.63.1 and Yt. 10.124–125. Ṛgveda 1.122.15 names that same chariot |
| Companion | partial swap | orange | Ṛgveda 5.72.1 and 5.72.3 (Varuṇa); the Ahura pair in Yt. 10.145. The second member did not transfer. The sun is a separate sacrifice |

The five solar rows for this pair are filled. Mills’s Gathas do not name Mithra.

Validate warns `duplicate cyan edge mitra->avestan-mithra (2 times)` and `duplicate orange edge mitra->avestan-mithra (3 times)`. The notes are separate. Do not merge them to clear the warning.

| Commit | What |
|---|---|
| `43d92ee` | Avestan covenant. New node `avestan-mithra`. One cyan lateral |
| `e6c14de` | Unsleeping eye. Partial swap. One orange lateral |
| `06b6447` | Kingship. Partial swap. One orange lateral |
| `ad0c8e7` | Chariot. Shared attribute. One cyan lateral |
| `75255cb` | Companion. Partial swap. One orange lateral |
| `172d6d5` | Day wrap. No graph edit |
| `b9dea44` | Ma'at · ṛta · Asha skip. Notes only. No graph edit |
| `3c8e9ff` | Roman Mithras skip. Unclassified. Notes only. No graph edit |
| `36951d4` | Eleusis skip. Unclassified. Notes only. No graph edit |
| `0b6c13a` | Isis mystery skip. Unclassified. Notes only. No graph edit |
| `1a10dad` | Night sun skip. Unclassified. Notes only. No graph edit |
| `d38e6d5` | Osiris boat skip. Unclassified. Notes only. No graph edit |
| `ebc54cc` | Horizon name skip. Unclassified. Notes only. No graph edit |
| `53c686d` | Horizon sailing skip. Unclassified. Notes only. No graph edit |
| HEAD | Isis finding skip. Unclassified. Notes only. No graph edit |

Edge counts at the stop: cyan 225 · gold 154 · magenta 102 · orange 68 · red 41 · green 38.

## Ma'at · ṛta · Asha — skip, do not reopen as unexamined

Shared attribute. No fourth lateral. No YAML change. The three cyan edges stay (`rta`–`maat`, `asha`–`rta`, `asha`–`maat`). The sharing stays open. It is not a loop.

Ptahhotep, Ṛgveda 5.15.2, and Yasna 28.11 each name only their own word. None of them puts the attribute on two of the three names.

Restoration stays a side finding inside each tradition, not an edge among the three: the Tutankhamun restoration stela (`mAat mn.tj` — justice established in its place) and Yasna 30.5 (the holiest Spirit chose Right). Ṛta guarded by Varuṇa stays the existing gold edge `rta` → `varuna`. Do not merge the `mitra` duplicate-edge warnings.

## Roman Mithras — skip, do not reopen as unexamined

Unclassified. No node. No edge. No link. Not folded into `avestan-mithra` or `mitra`. `mystery-religions` stays `stub`. `data/latest.yaml` stays `companion`. Do not merge the `mitra` duplicate-edge warnings.

Passage: Statius, *Thebaid* 1.716–720. The Mithras clause is 1.719–720: `Persei sub rupibus antri / indignata sequi torquentem cornua Mithram`. Under the rocks of the Persian cave he twists the horns that refuse to follow. No named passage already on a graph node puts that attribute on that node.

Side findings, not encodes:

- *Thebaid* 1.718–719: fruit-bearing Osiris is the other `seu`. It does not put the murdered king of the West on Mithras, and it does not put “fruit-bearing” on the `osiris` refs. Isis was not opened.
- *Thebaid* 1.696 and 1.716–720: the hymn addresses Phoebus and offers Mithras as one name in the closing list. The horns and the cave modify `Mithram` only. `apollo` and `roman-apollo` stay the Livy temple, not this line.
- `helios` stays the chariot and the god who oversees and hears. These lines do not put that on Mithras.
- `el-canaanite` stays the Baal Cycle bull. That text was not opened. A bull epithet is not these horns under this cave.

## Eleusis — skip, do not reopen as unexamined

Unclassified. No node. No edge. No link. The cyan interior edge `mystery-religions` → `mystery-ascent` is not rewritten. `mystery-religions` stays `stub`. `data/latest.yaml` stays `companion`. Do not merge the `mitra` duplicate-edge warnings. The Isis mystery skip is recorded below.

Line: Homeric Hymn to Demeter 480 (Evelyn-White 1914). `ὄλβιος, ὃς τάδʼ ὄπωπεν ἐπιχθονίων ἀνθρώπων`. Blessedness of the one who has seen these things. No named passage already on another node puts that attribute on that node.

Side findings, not encodes:

- 481–482: the uninitiate’s lot, under murky darkness.
- 476–479: the rites and the solemn orgia, which may not be transgressed, inquired into, or uttered. The referent of `τάδε`.
- 463–465: the daughter’s third of the year under murky darkness, and two portions with the mother. A descent. Not line 480.
- 486–489: wealth from Plutus, for the one the goddesses readily love. A second blessedness. Not “has seen.”
- 490: the name Eleusis. The hymn addresses the queen who holds the people of fragrant Eleusis.

## Isis mystery — skip, do not reopen as unexamined

Unclassified. No node. No edge. No link. Not folded into the Egyptian `isis` node. The cyan interior edge `mystery-religions` → `mystery-ascent` is not rewritten. `mystery-religions` stays `stub`. `data/latest.yaml` stays `companion`. Do not merge the `mitra` duplicate-edge warnings. Do not reopen Roman Mithras.

Passage: Apuleius, *Metamorphoses* 11.23 (Gaselee 1915). `Accessi confinium mortis et calcato Proserpinae limine per omnia vectus elementa remeavi; nocte media vidi solem candido coruscantem lumine; deos inferos et deos superos accessi coram et adoravi de proxumo.` The name Isis is absent from that section. The chapter says `deae`, the goddess. No named passage already on a graph node puts that attribute on that node.

Side findings, not encodes:

- 11.21: the handing-over is celebrated in the likeness of a voluntary death and a salvation obtained by prayer. The goddess draws those who stand on the threshold of finished light and sets them, reborn in a certain way, on a new salvation. Not the scored period.
- 11.22: the goddess appoints her chief priest, Mithras, as minister of the rites. This does not reopen the Roman Mithras skip. Statius, *Thebaid* 1.719–720, stays the cave and the horns. This sentence does not put that cave or those horns on the priest.
- 11.24: the next morning he is adorned in the likeness of the sun and set up in the place of a statue. `ad instar solis` is this dressing. It is not the midnight sun of 11.23.
- 11.25: the prayer says the goddess turns the world, lights the sun, rules the world, and treads Tartarus, and that the elements serve her. The subject is the goddess. The scored period’s subject is the speaker.

## Night sun — skip, do not reopen as unexamined

Unclassified. No node. No edge. No link to `re`, `surya`, `helios`, or `mitra`. `data/latest.yaml` stays `companion`. Do not merge the `mitra` duplicate-edge warnings. Do not reopen Roman Mithras, Eleusis, or the Isis mystery skip.

Passages: Apuleius, *Metamorphoses* 11.23, `nocte media vidi solem candido coruscantem lumine`. At midnight the speaker saw the sun flashing with bright light. The seeing is on the speaker. Budge, *The Book of Am-Tuat* (1905), Sixth Division, text above the boat, p. 117: this great god travels through this city, provided with his boat, on the water, and works the paddle toward the place of the body of Osiris. That line does not put the midnight seeing on Re.

Side findings, not encodes:

- Budge’s picture note, pp. 116–117: the Sixth Division is passed through by the sun-god during the sixth hour of the night, and the dead sun-god Afu-Ra stands in his boat. That is his account of the scene, not the line.
- Same chapter, not the line: the Field Metchet-nebt-tuatiu is the road of the Boat of Ra, and the hour Mesherit-ar-Maat guides this great god. The chapter title prints Metchet-mu-nebt-tuat.
- *Metamorphoses* 11.24: the next morning he is dressed in the likeness of the sun. That dressing is not the midnight seeing.
- *Metamorphoses* 11.25: the goddess lights the sun. The subject is the goddess.
- *Metamorphoses* 11.22 names the priest Mithras. It does not reopen the Roman Mithras skip. Statius, *Thebaid* 1.719–720, stays the cave and the horns.

## Osiris boat — skip, do not reopen as unexamined

Unclassified. No edge between `re` and `osiris`. The green `isis` → `osiris` edge is not rewritten. `data/latest.yaml` stays `companion`. Do not merge the `mitra` duplicate-edge warnings. Do not reopen the night-sun skip.

Passages: Budge, *The Book of Am-Tuat* (1905), Sixth Division, text above the boat, p. 117: this great god works the paddle toward the place of the body of Osiris. Samuel A. B. Mercer, *The Pyramid Texts* (1952), Utterance 357, §§583a–592c: Isis and Nephthys find Osiris. The utterance does not put his body in the place the night boat rows toward. Plutarch, *De Iside*, stayed unopened.

Side findings, not encodes:

- §585a: “He of the horizon, whence Rē goes forth.” The name has Re going forth from the horizon. It does not put the body in the boat’s place.
- §592b: “He who is First of the Westerners.” That is the lord of the West already stored on `osiris`. The name is not the place in Budge, p. 117.
- §588a: Set swims under Osiris and carries one greater than he. The swimmer is Set. The boat in Budge stays the boat of “this great god.”
- §§585c–d: he closes his arms, and the bones that stretch are the bones of the one he holds.

## Horizon name — skip, do not reopen as unexamined

Unclassified. No edge between `re` and `osiris`. Budge, p. 117, is not reused. The green `isis` → `osiris` edge is not rewritten. `data/latest.yaml` stays `companion`. Do not merge the `mitra` duplicate-edge warnings. Do not reopen the boat skip.

Passages: Mercer, *The Pyramid Texts* (1952), Utterance 357, §585a: it is pleasing to Horus to be with Osiris in his name of “He of the horizon, whence Rē goes forth.” Budge, *The Book of Am-Tuat* (1905), Twelfth Division, text of the picture, p. 259: this great god comes forth from the mouth of the hidden image Ankh-neteru, comes to birth as Khepera, and takes his position in the Eastern Horizon of heaven. Coming forth from a mouth and a position in the Eastern Horizon is not going forth from the horizon.

Side findings, not encodes:

- Budge, p. 257: this great god comes forth from the Tuat, takes his position in the Matet Boat, and rises from the thighs of Nut. The coming-forth is from the Tuat.
- Budge, p. 270: “Thou sailest over the Horizon, thou takest up thy place in thy shrine.” A sailing over the horizon, not the scored line.
- Budge, p. 275: their work is to hold up the Great Disk in the Eastern Horizon of the sky every day.
- Mercer, Utterance 364, §621b, and Utterance 368, §636c: the horizon name sits on Osiris again. They do not put the going-forth on Re.

## Horizon sailing — skip, do not reopen as unexamined

Unclassified. No edge from `re` to `surya` or `helios` for this sentence. The cyan day-car edge `surya` → `helios` is not edited. `data/latest.yaml` stays `companion`. Do not merge the `mitra` duplicate-edge warnings. Do not reopen the horizon-name skip or the boat skip.

Passages: Budge, *The Book of Am-Tuat* (1905), p. 270: “Thou sailest over the Horizon, thou takest up thy place in thy shrine.” Ṛgveda 1.50.8–9: seven bay steeds harnessed to the car, and with that team he goes forth. Homeric Hymn 31.8–15: mounted on horses, he stays the golden-yoked chariot. A sailing and a shrine are not that yoked car.

Side findings, not encodes:

- Same praise, p. 270: he produces his own birth; heaven belongs to his soul and the earth to his body; “descend thou into the sky and take thou thy two souls.”
- Same page, the frame: they sing praises from dawn, when he takes his position in the Hall of the east of the sky, and they say the speech unto Ra.
- Ṛgveda 1.50.7, outside 1.50.8–9: he traverses sky and wide mid-air and metes the days with his beams.
- Homeric Hymn 31.15a, outside the stored lines 8–15: he rests at the peak of heaven. Line 16 sends the horses through heaven to Ocean.

## Isis finding — skip, do not reopen as unexamined

Unclassified. No citation of Utterance 357 on the `isis` → `osiris` edge. No second `isis` → `osiris` edge. No edge between `re` and `osiris`. `data/latest.yaml` stays `companion`. Do not merge the `mitra` duplicate-edge warnings. Nephthys’s green edge stays “Helps the reconstitution.” The cyan edge with `isis` stays “Mourning sisters who gather Osiris.”

Sentence: Mercer 1952, Utterance 357, §584a: “Isis and Nephthys have seen thee; they have found thee.” A seeing and a finding. It is not “Gathering of pieces; return without leaving the cosmos.”

Side findings, not encodes:

- Care and protection. Utterance 357, §584b: Horus has taken care of Osiris N. and has caused Isis and Nephthys to protect him. §592a: Isis has taken care of him.
- Giving to Horus. Utterance 357, §584c: they have given him to Horus, that Horus may be satisfied with him.
- Limb-assembly in Utterances 364, 366, and 367. Utterance 364, §616a–c: Nephthys has assembled all his limbs. §617a–b: Horus has united his limbs and put him together. Utterance 366, §628a: his two sisters Isis and Nephthys come to him and heal him. Utterance 367, §635a–b: Horus has collected his limbs and put him together. Utterance 364, §610c, they have healed him, stays with those utterances.

## Holds — not a next cell

- Do not encode Jesus without a sourced shared attribute. Mitra ~ Jesus stayed unclassified. No Jesus node. No edge. The drawing has no link.
- Do not reopen Roman Mithras as an unexamined stub. The skip is recorded. `mystery-religions` stays `stub`.
- Side findings stay unscored. They are later correlations. They are not an encode.
- Yt. 10.13’s before-the-sun crossing stays Avestan only. It does not fill the Vedic chariot cell. The beneficent-eye clause of that verse stays on the eye edge.

Side findings, with the passages already recorded:

- Ṛgveda 5.65.1: “or Mitra” (`vā`). No companion beside him.
- Ṛgveda 5.68.2: Mitra and Varuṇa, both, called sovran kings. Off the companion row.
- Ṛgveda 5.68.5: a lofty seat (`garta`). Not the companion.
- Ṛgveda 7.61.1: Sūrya is the eye of the two gods. The sun is not the companion.
- Ṛgveda 5.63.5: the Maruts’ car. Mitra-Varuṇa are the address.
- Ṛgveda 5.63.7: the sun set in heaven as a chariot. That car is the sun’s.
- Ṛgveda 5.62.1: Sūrya’s horses. The horses are Sūrya’s.
- Ṛgveda 5.62.2: a wheel-rim, not a car they mount.
- Ṛgveda 5.62.8: a high seat (`garta`), not `ratha`.
- Ṛgveda 7.66.12: an epithet of ṛta, not a car they ride.
- Ṛgveda 8.25.2: a simile of two chariot-horses.
- Yt. 10.0: a thousand ears, ten thousand eyes, and Rama Hvastra.
- Yt. 10.15: a health-bringing eye across the karshvares named there.
- Yt. 10.65: “sovereignty-giving” among other gifts.
- Yt. 10.67: a high-wheeled chariot from Arezahi to Xwaniratha, with the wheel of sovereignty. Not the scored chariot.
- Yt. 10.68: four white heavenly steeds. Agrees with Yt. 10.125. Not scored.
- Yt. 10.82: ten thousand eyes on the man who injures Mithra and the man who lies unto him.
- Yt. 10.109 and Yt. 10.111: the awful sovereignty given, and the same sovereignty taken away.

## What Now already says

Ma'at · ṛta · Asha was re-read and skipped. Shared attribute. The three cyan edges stay. Roman Mithras was read in Statius, Thebaid 1.719–720, and skipped as unclassified. Eleusis was read at Homeric Hymn to Demeter 480 and skipped as unclassified. The Isis mystery was read at Apuleius, Metamorphoses 11.23, and skipped as unclassified. The name Isis is absent from that section. The night sun was read against Re and skipped as unclassified. Apuleius 11.23 puts the midnight seeing on the speaker. Budge, Am-Tuat, p. 117, has Re work the paddle toward the body of Osiris. That line does not put the seeing on Re. The Osiris boat was read against Pyramid Texts, Utterance 357, and skipped as unclassified. Isis and Nephthys find Osiris. That utterance does not put his body in the place the night boat rows toward. The horizon name was read against Budge, Am-Tuat, p. 259, and skipped as unclassified. Coming forth from the mouth of Ankh-neteru and a position in the Eastern Horizon is not going forth from the horizon. The horizon sailing was read against the day car and skipped as unclassified. Budge, p. 270, is a sailing over the Horizon and a place in the shrine. Ṛgveda 1.50.8–9 and Homeric Hymn 31.8–15 are the yoked car. Those are not the same motion. No edge from `re` to `surya` or `helios` for that sentence. The day-car edge stays. The finding sentence was read against the stored gathering and skipped as unclassified. Mercer, Utterance 357, §584a, is a seeing and a finding. It is not “Gathering of pieces; return without leaving the cosmos.” No citation on the `isis` → `osiris` edge. No second edge. No edge between `re` and `osiris`. The cyan interior edge stays. `mystery-religions` stays `stub`. The solar table is drawn for Sūrya, Helios, Re, and Mitra. `nabta-playa` stays unlinked on purpose. Palamite and Hermetica wait until a lateral actually opens. The comparison sheet stays the spine check. Do not switch the store to SQLite or Neo4j yet.

Those are waits and finished readings. They are not a new cell.

## How to resume

```powershell
cd C:\Users\xepoc\OneDrive\Grok\platonic-systems-graph
.\.venv\Scripts\python.exe tools\serve.py check
.\.venv\Scripts\python.exe tools\validate.py
```

If check prints `down`: `python tools/serve.py start` in the background. Port **8765** only. Viewer: http://127.0.0.1:8765/viewer/

`data/research-queue.yaml` is the tradition inventory. `RESEARCH_PLAN.md` is the lateral order. Do not invent a third list. Do not invent a cell.

## Do next, only if the operator asks

1. Do not reopen Ma'at · ṛta · Asha as unexamined. The skip is recorded. The three cyan edges stay.
2. Leave Mitra · Miθra as it is. The five rows are filled.
3. Do not encode Jesus without a sourced shared attribute.
4. Do not reopen Roman Mithras as unexamined. The unclassified skip is recorded. No node. No edge.
5. Do not reopen Eleusis as unexamined. The unclassified skip is recorded. No node. No edge. The cyan interior edge stays.
6. Do not reopen the Isis mystery interior as unexamined. The unclassified skip is recorded. No node. No edge. Not folded into the Egyptian `isis` node. 11.22 does not reopen Roman Mithras.
7. Do not reopen the night sun as unexamined. The unclassified skip is recorded. No edge to `re`, `surya`, `helios`, or `mitra`.
8. Do not reopen the Osiris boat as unexamined. The unclassified skip is recorded. No edge between `re` and `osiris`. The `isis`–`osiris` edge stays.
9. Do not reopen the horizon name as unexamined. The unclassified skip is recorded. No edge between `re` and `osiris`. Budge p. 117 is not the Re side.
10. Do not reopen the horizon sailing as unexamined. The unclassified skip is recorded. No edge from `re` to `surya` or `helios` for p. 270. The day-car edge stays.
11. Do not reopen the Isis finding as unexamined. The unclassified skip is recorded. No citation of Utterance 357 on the `isis` → `osiris` edge. No second edge. No edge between `re` and `osiris`.
12. Leave the side findings unscored unless a later pass names one passage.
13. Leave Yt. 10.13’s before-the-sun crossing Avestan only.
14. Leave `nabta-playa` unlinked. Leave Palamite and Hermetica until a lateral actually opens.

## Do not

- Treat the Greco-Roman twelve as an origin.
- Encode Jesus without a sourced shared attribute.
- Add a lateral from a side finding unless a later pass is asked for that passage.
- Add an edge to `varuna` or `ahura-mazda` for the companion.
- Change the covenant, eye, kingship, chariot, or companion edge, or add a gold edge.
- Cite the lord-of-countries sentence of Yt. 10.145 as the companion.
- Cite Yt. 10.13 as the Vedic side of the chariot.
- Fold Roman Mithras into `avestan-mithra`, or mark `zoroastrianism` surveyed.
- Turn Malachi 4:2 or Luke 22:20 into an edge.
- Encode every god, or write a school’s chronicle and call it emergence.
- Edge `nabta-playa` to force one component.
- Turn a lateral into a descent arrow.
- Switch the store to SQLite or Neo4j yet.
- Bring 3D or a force-directed view back.
- Merge the duplicate-color warnings into one note.
- Commit or push unless asked.
