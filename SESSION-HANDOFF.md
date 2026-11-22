# Night wrap, 2026-11-23

Stop point on `platonic-systems-graph` `main`: **242 nodes · 628 edges.** Validate at `3bcf33e` was **OK** (42 systems, 200 principles, 33 clusters). Types: gold 154 · cyan 225 · magenta 102 · green 38 · red 41 · orange 68. This wrap commit changes notes only. `data/nodes.yaml`, `data/edges.yaml`, `data/readings.yaml`, and `data/latest.yaml` are unchanged by it. `data/latest.yaml` is `limb-assembly` (nodes `nephthys` and `osiris`). `mystery-religions` stays `stub`. The duplicate `mitra` warnings remain: two cyan edges and three orange edges from `mitra` to `avestan-mithra`. The notes are separate. Do not merge them.

The only graph change since `172d6d5` is the note on the existing `nephthys` → `osiris` edge at `3bcf33e`. The edge stays green, directed true, strength 0.7. Mercer 1952, Utterance 364, §616a–c: Nephthys assembled for Osiris all his limbs and made them well. The note is: Helps the reconstitution. Nephthys assembled for Osiris all his limbs and made them well (Mercer 1952, Utterance 364, §616a–c). No second edge. The `isis` → `osiris` edge is not cited. There is no `horus` node.

Read [ROADMAP.md](ROADMAP.md) and [RESEARCH_PLAN.md](RESEARCH_PLAN.md) before encoding. ROADMAP Now and the research log already record this citation. This wrap does not edit them. This file is the resume note.

## Skips, in order

These are recorded. They are not a next cell.

| Commit | Cell | What was recorded |
|---|---|---|
| `b9dea44` | Ma'at · ṛta · Asha | Shared attribute. The three cyan edges stay. No fourth lateral. Ptahhotep, Ṛgveda 5.15.2, and Yasna 28.11 each name only their own word. |
| `3c8e9ff` | Roman Mithras | Unclassified. Statius, *Thebaid* 1.719–720: under the rocks of the Persian cave he twists the horns that refuse to follow. No node. No edge. |
| `36951d4` | Eleusis | Unclassified. Homeric Hymn to Demeter 480: blessedness of the one who has seen these things. No node. No edge. The cyan interior edge stays. |
| `0b6c13a` | Isis mystery | Unclassified. Apuleius, *Metamorphoses* 11.23. The name Isis is absent from that section. No node. No edge. Not folded into the Egyptian `isis` node. |
| `1a10dad` | Night sun | Unclassified. Apuleius 11.23 puts the midnight seeing on the speaker. Budge, Am-Tuat, p. 117, does not put that seeing on Re. |
| `d38e6d5` | Osiris boat | Unclassified. Utterance 357 does not put his body in the place the night boat rows toward. No edge between `re` and `osiris`. |
| `ebc54cc` | Re horizon | Unclassified. Mercer, Utterance 357, §585a, and Budge, Am-Tuat, p. 259. Coming forth from a mouth and a position in the Eastern Horizon is not going forth from the horizon. |
| `53c686d` | Horizon sailing | Unclassified. Budge, p. 270, is a sailing over the Horizon and a place in the shrine. Ṛgveda 1.50.8–9 and Homeric Hymn 31.8–15 are the day car. |
| `4cc4e01` | Isis finding | Unclassified. Mercer, Utterance 357, §584a: Isis and Nephthys have seen thee; they have found thee. A seeing and a finding. It is not “Gathering of pieces; return without leaving the cosmos.” |

## Mitra · Miθra, already filled

Five undirected laterals, all between `mitra` and `avestan-mithra`. No edge to `varuna` or `ahura-mazda`. `zoroastrianism` stays partial. Mills’s Gathas do not name Mithra. Day wrap: `172d6d5`.

| Row | Sort | Commit | Passages |
|---|---|---|---|
| Covenant | shared attribute | `43d92ee` | Ṛgveda 3.59.1 and Yt. 10.2 |
| Unsleeping eye | partial swap | `e6c14de` | Ṛgveda 3.59.1; Yt. 10.7 and Yt. 10.13. The work of the eyes did not transfer |
| Kingship | partial swap | `06b6447` | Ṛgveda 3.59.4; Yt. 10.16 and the lord-of-countries sentence of Yt. 10.145 |
| Chariot | shared attribute | `ad0c8e7` | Ṛgveda 5.63.1 and Yt. 10.124–125. Ṛgveda 1.122.15 names that same chariot |
| Companion | partial swap | `75255cb` | Ṛgveda 5.72.1 and 5.72.3 (Varuṇa); the Ahura pair in Yt. 10.145 |

## Closed holds and findings

These stay closed. They are not a cell.

- Horus in Utterance 367 §635 stays unscored because there is no Horus node. He collected the limbs and put Osiris together. That sentence is a side finding.
- Jesus stays closed. Mitra ~ Jesus stayed unclassified. No Jesus node. No edge. The drawing has no link.
- The Mitra side findings stay closed. They are later correlations, not an encode.
- Yt. 10.13 stays closed. The before-the-sun crossing stays Avestan only. It does not fill the Vedic chariot cell. The beneficent-eye clause of that verse stays on the eye edge.
- `nabta-playa` stays closed and unlinked.
- Palamite stays closed.
- Hermetica stays closed.

Mitra side findings already recorded:

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

The comparison sheet stays the spine check. Do not switch the store to SQLite or Neo4j yet.

## How to resume

```powershell
cd C:\Users\xepoc\OneDrive\Grok\platonic-systems-graph
.\.venv\Scripts\python.exe tools\serve.py check
.\.venv\Scripts\python.exe tools\validate.py
```

If check prints `down`: `python tools/serve.py start` in the background. Port **8765** only. Viewer: http://127.0.0.1:8765/viewer/

`data/research-queue.yaml` is the tradition inventory. `RESEARCH_PLAN.md` is the lateral order. Do not invent a third list. Do not invent a cell.

## Next, only from the recorded holds

1. Leave the nine skips closed. Their commits are in the table above.
2. Leave the limb-assembly citation on `nephthys` → `osiris`. Utterance 367 §635 stays unscored because there is no Horus node.
3. Leave Jesus closed.
4. Leave the Mitra side findings closed.
5. Leave Yt. 10.13 closed.
6. Leave `nabta-playa`, Palamite, and Hermetica closed.

There is no open cell in this wrap.
